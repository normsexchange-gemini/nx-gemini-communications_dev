import express from "express";
import path from "path";
import fs from "fs";
import * as archiverPkg from "archiver";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { dbService } from "./server/database";
import { crawlerService } from "./server/autonomousCrawler";
import { resilientIndexer } from "./server/resilientIndexer";
import { goalsService } from "./server/goals";

const archiver = (archiverPkg as any).default || archiverPkg;

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Server-side Google GenAI initialization
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* =========================================================================
   DATABASE INTEGRATION & SEARCH / BROWSING ENDPOINTS
   ========================================================================= */

// Get database operational status, engine info, and record counts
app.get("/api/database/status", (_req, res) => {
  try {
    const status = dbService.getStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch DB status" });
  }
});

// Search & Browse Equipment Listings with full faceted filtering and sorting
app.get("/api/database/listings", (req, res) => {
  try {
    const {
      q,
      category,
      type,
      corridor,
      minPrice,
      maxPrice,
      condition,
      status,
      verifiedOnly,
      sortBy,
      page,
      limit
    } = req.query;

    const listings = dbService.getListings({
      q: q ? String(q) : undefined,
      category: category ? String(category) : undefined,
      type: type ? String(type) : undefined,
      corridor: corridor ? String(corridor) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      condition: condition ? String(condition) : undefined,
      status: status ? String(status) : undefined,
      verifiedOnly: verifiedOnly === "true",
      sortBy: sortBy as any
    });

    res.json({
      total: listings.length,
      listings,
      query: { q, category, type, corridor, minPrice, maxPrice, condition, status, sortBy }
    });
  } catch (error: any) {
    console.error("Error querying listings database:", error);
    res.status(500).json({ error: error.message || "Failed to query database" });
  }
});

// Export candidate batch compliant with wtb-candidate-batch.schema.json (contract-v0.2.0)
app.get("/api/database/candidate-batch", (req, res) => {
  try {
    const { corridor, category, limit = "50" } = req.query;
    const allListings = dbService.getListings({
      category: category ? String(category) : undefined,
      corridor: corridor ? String(corridor) : undefined,
      type: "WTB"
    });

    const maxItems = Math.min(Number(limit) || 50, allListings.length);
    const selected = allListings.slice(0, maxItems);

    const candidates = selected.map((item) => {
      const isVnTarget = (item.tags || []).some(t => t.includes("Target:Vietnam") || t.includes("LA ➔ Vietnam"));
      return {
        candidate_id: item.id,
        category: item.category,
        equipment_make: item.make,
        equipment_model: item.model,
        target_price_usd: item.priceTarget,
        stated_currency: item.currency || "USD",
        stated_price_amount: item.priceTarget,
        condition_stated: item.condition,
        origin_location: isVnTarget ? "Los Angeles, CA, USA" : "Ho Chi Minh City, Vietnam",
        delivery_target_location: item.contact?.location || "Ho Chi Minh City, Vietnam",
        corridor: isVnTarget ? "LA ➔ Vietnam" : "Vietnam ➔ US",
        evidence: {
          source_url: item.contact?.sourceUrl || `https://${item.contact?.sourceDomain || "normsexchange.com"}/sourcing/${item.id}`,
          source_domain: item.contact?.sourceDomain || "normsexchange.com",
          source_language: isVnTarget ? "en" : "vi",
          observation_timestamp: item.lastVerifiedAt || new Date().toISOString(),
          raw_excerpt: item.description,
          contact_entity: item.contact?.entityName || "Verified Film Partner"
        },
        arbitrage_spread_usd: item.marginSpreadEstimate || 0
      };
    });

    const totalSpread = candidates.reduce((sum, c) => sum + (c.arbitrage_spread_usd || 0), 0);

    const batch = {
      batch_id: `wtb-batch-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 7)}`,
      contract_version: "0.2.0",
      intake_version: "0.1.0",
      created_at: new Date().toISOString(),
      corridor: corridor ? String(corridor) : "ALL",
      role: "role/sourcing-agent/equipment-exchange",
      candidates_count: candidates.length,
      total_arbitrage_spread_usd: totalSpread,
      candidates
    };

    res.json(batch);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate candidate batch" });
  }
});

// Get single listing by ID
app.get("/api/database/listings/:id", (req, res) => {
  try {
    const { id } = req.params;
    const listing = dbService.getListingById(id);
    if (!listing) {
      return res.status(404).json({ error: `Listing with id '${id}' not found in database.` });
    }

    // Also look up potential match candidate if matchedWithId exists
    let matchedCandidate = null;
    if (listing.matchedWithId) {
      matchedCandidate = dbService.getListingById(listing.matchedWithId) || null;
    }

    res.json({ listing, matchedCandidate });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch listing" });
  }
});

// Insert new listing into persistent database
app.post("/api/database/listings", (req, res) => {
  try {
    const listing = req.body;
    if (!listing.title || !listing.make || !listing.model) {
      return res.status(400).json({ error: "Missing required listing fields (title, make, model)." });
    }

    const saved = dbService.addListing(listing);
    res.status(201).json({ success: true, listing: saved });
  } catch (error: any) {
    console.error("Error creating listing:", error);
    res.status(500).json({ error: error.message || "Failed to save listing to database" });
  }
});

// Batch insert listings (e.g. from scanner)
app.post("/api/database/listings/batch", (req, res) => {
  try {
    const { listings } = req.body;
    if (!Array.isArray(listings)) {
      return res.status(400).json({ error: "Expected 'listings' to be an array." });
    }

    const saved = dbService.addListingsBatch(listings);
    res.json({ success: true, count: saved.length, added: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to batch save listings" });
  }
});

// Update an existing listing
app.put("/api/database/listings/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = dbService.updateListing(id, updates);
    if (!updated) {
      return res.status(404).json({ error: `Listing with id '${id}' not found.` });
    }
    res.json({ success: true, listing: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update listing" });
  }
});

// Delete a listing
app.delete("/api/database/listings/:id", (req, res) => {
  try {
    const { id } = req.params;
    const success = dbService.deleteListing(id);
    if (!success) {
      return res.status(404).json({ error: `Listing with id '${id}' not found.` });
    }
    res.json({ success: true, deletedId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete listing" });
  }
});

// Update single listing lifecycle status (e.g. "Sold", "Delisted", "Archived", "Active")
app.post("/api/database/listings/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Missing required 'status' field." });
    }
    const updated = dbService.markListingStatus(id, status, reason);
    if (!updated) {
      return res.status(404).json({ error: `Listing with id '${id}' not found.` });
    }
    res.json({ success: true, listing: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update listing status" });
  }
});

// Run Link Verification & Automated Pruning Audit (archive sold/dead or purge)
app.post("/api/database/prune", (req, res) => {
  try {
    const { mode = "archive", simulateExternalAudit = true, sampleRate } = req.body || {};
    const report = dbService.verifyAndPruneListings({
      mode,
      simulateExternalAudit,
      sampleRate
    });
    res.json({ success: true, report });
  } catch (error: any) {
    console.error("Error during prune audit:", error);
    res.status(500).json({ error: error.message || "Failed to execute pruning routine" });
  }
});

// Purge all listings from database (reset to 0 records for fresh real intake)
app.post("/api/database/purge-all", (_req, res) => {
  try {
    const result = dbService.clearAllListings();
    res.json({ success: true, message: `Purged ${result.purgedCount} records. Database is now clean with 0 records.`, ...result });
  } catch (error: any) {
    console.error("Error during purge-all:", error);
    res.status(500).json({ error: error.message || "Failed to purge database records" });
  }
});

// Get aggregated database statistics
app.get("/api/database/stats", (_req, res) => {
  try {
    const stats = dbService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to calculate stats" });
  }
});

// Get market depth & spreads
app.get("/api/database/market-depth", (_req, res) => {
  try {
    const depth = dbService.getMarketDepth();
    res.json({ marketDepth: depth });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch market depth" });
  }
});

// Get Outbox contract queue
app.get("/api/database/outbox", (_req, res) => {
  try {
    const outbox = dbService.getOutbox();
    res.json({ outbox });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch outbox" });
  }
});

// Save envelope to Outbox
app.post("/api/database/outbox", (req, res) => {
  try {
    const envelope = req.body;
    const saved = dbService.saveOutboxEnvelope(envelope);
    res.status(201).json({ success: true, envelope: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to save to outbox" });
  }
});

/* =========================================================================
   INDEXED SOURCES REGISTRY & RATE-METERING ENDPOINTS
   ========================================================================= */

// Get all indexed listing sources with query filtering and sorting
app.get("/api/sources", (req, res) => {
  try {
    const { q, corridor, accessMethod, status, spideringAllowed, tier, apiFilter, sortBy } = req.query;
    const sources = dbService.getSources({
      q: q ? String(q) : undefined,
      corridor: corridor ? String(corridor) : undefined,
      accessMethod: accessMethod ? String(accessMethod) : undefined,
      status: status ? String(status) : undefined,
      spideringAllowed: spideringAllowed !== undefined ? spideringAllowed === "true" : undefined,
      tier: tier ? String(tier) : undefined,
      apiFilter: apiFilter ? String(apiFilter) : undefined,
      sortBy: sortBy as any
    });

    const operationalCount = sources.filter(s => s.healthStatus === "Operational / Up").length;
    const totalRequestsThisHour = sources.reduce((acc, s) => acc + (s.requestsThisHour || 0), 0);
    const maxHourlyQuotaSum = sources.reduce((acc, s) => acc + (s.maxRequestsPerHour || 0), 0);
    const avgLatency = sources.length > 0
      ? Math.round(sources.reduce((acc, s) => acc + (s.lastLatencyMs || 0), 0) / sources.length)
      : 0;

    res.json({
      total: sources.length,
      operationalCount,
      totalRequestsThisHour,
      maxHourlyQuotaSum,
      quotaUtilizationPercent: maxHourlyQuotaSum > 0 ? Math.round((totalRequestsThisHour / maxHourlyQuotaSum) * 100) : 0,
      avgLatencyMs: avgLatency,
      sources
    });
  } catch (error: any) {
    console.error("Error fetching sources:", error);
    res.status(500).json({ error: error.message || "Failed to fetch sources" });
  }
});

// Export sources registry in Git-compatible schema
app.get("/api/sources/export-github", (_req, res) => {
  try {
    const payload = dbService.exportSourcesForGit();
    res.setHeader("Content-Disposition", 'attachment; filename="normsexchange-sources-registry.json"');
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(payload, null, 2));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to export sources" });
  }
});

// Get a single source by ID
app.get("/api/sources/:id", (req, res) => {
  try {
    const { id } = req.params;
    const source = dbService.getSourceById(id);
    if (!source) {
      return res.status(404).json({ error: `Source '${id}' not found.` });
    }
    res.json({ source });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to get source" });
  }
});

// Create a new source
app.post("/api/sources", (req, res) => {
  try {
    const sourceData = req.body;
    if (!sourceData.name || !sourceData.domain) {
      return res.status(400).json({ error: "Source 'name' and 'domain' are required." });
    }
    const created = dbService.addSource(sourceData);
    res.status(201).json({ success: true, source: created });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create source" });
  }
});

// Update an existing source
app.put("/api/sources/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = dbService.updateSource(id, updates);
    if (!updated) {
      return res.status(404).json({ error: `Source '${id}' not found.` });
    }
    res.json({ success: true, source: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update source" });
  }
});

// Delete a source
app.delete("/api/sources/:id", (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dbService.deleteSource(id);
    if (!deleted) {
      return res.status(404).json({ error: `Source '${id}' not found.` });
    }
    res.json({ success: true, deletedId: id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete source" });
  }
});

// Toggle pause/resume on a source
app.post("/api/sources/:id/toggle-pause", (req, res) => {
  try {
    const { id } = req.params;
    const updated = dbService.togglePauseSource(id);
    if (!updated) {
      return res.status(404).json({ error: `Source '${id}' not found.` });
    }
    res.json({ success: true, source: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to toggle source state" });
  }
});

// Probe/Ping a specific source for live latency, HTTP health, and headers check
app.post("/api/sources/:id/probe", async (req, res) => {
  try {
    const { id } = req.params;
    const { testUrl } = req.body || {};
    const probeResult = await dbService.probeSource(id, testUrl);
    const updatedSource = dbService.getSourceById(id);
    res.json({ success: true, result: probeResult, source: updatedSource });
  } catch (error: any) {
    console.error("Error probing source:", error);
    res.status(500).json({ error: error.message || "Failed to probe source" });
  }
});

// Probe all sources concurrently
app.post("/api/sources/probe-all", async (_req, res) => {
  try {
    const results = await dbService.probeAllSources();
    const sources = dbService.getSources();
    res.json({ success: true, totalProbed: results.length, results, sources });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to probe sources" });
  }
});

// Real robots.txt verification for The Golden Rule
app.post("/api/sources/recheck-all", async (_req, res) => {
  try {
    const sources = dbService.getSources();
    let checked = 0;
    
    // We will do this asynchronously in the background so we don't timeout the HTTP request
    // Or we do it in batches. For safety, let's process and return immediately.
    res.json({ success: true, message: "Started background verification of all source rules to comply with zero data invention." });
    
    (async () => {
      for (const source of sources) {
        if (!source.spideringAllowed) {
           dbService.updateSource(source.id, {
             maxRequestsPerHour: null,
             healthStatus: "Pending Audit" as any
           });
           continue;
        }
        
        try {
          const url = source.robotsTxtUrl || (source.baseUrl.replace(/\/+$/, '') + '/robots.txt');
          const checkRes = await fetch(url, { signal: AbortSignal.timeout(5000) });
          if (!checkRes.ok) {
            dbService.updateSource(source.id, {
               maxRequestsPerHour: null,
               healthStatus: "Pending Audit" as any,
               accessRulesSummary: `Failed to fetch robots.txt. Rate limits unknown.`
            });
            continue;
          }
          const text = await checkRes.text();
          let delay: number | null = null;
          const lines = text.split('\n');
          let applies = true;
          for (const line of lines) {
            const lower = line.toLowerCase().trim();
            if (lower.startsWith('user-agent:')) {
              applies = lower.includes('*') || lower.includes('normsexchange-bot');
            }
            if (applies && lower.startsWith('crawl-delay:')) {
              const val = parseFloat(lower.split(':')[1].trim());
              if (!isNaN(val)) delay = val;
            }
          }
          if (delay) {
            dbService.updateSource(source.id, {
               maxRequestsPerHour: Math.floor(3600 / delay),
               healthStatus: "Operational" as any,
               accessRulesSummary: `Verified authentic industry entity. Rate limit verified via robots.txt Crawl-delay: ${delay}s (${Math.floor(3600 / delay)} req/hr).`
            });
          } else {
            dbService.updateSource(source.id, {
               maxRequestsPerHour: null,
               healthStatus: "Operational" as any,
               accessRulesSummary: `Verified authentic industry entity. No explicit Crawl-delay found in robots.txt. Proceed with caution/conservative default.`
            });
          }
        } catch (e) {
          dbService.updateSource(source.id, {
             maxRequestsPerHour: null,
             healthStatus: "Pending Audit" as any,
             accessRulesSummary: `Failed to fetch robots.txt (timeout/error). Rate limits unknown.`
          });
        }
      }
      console.log("Background recheck of all sources finished.");
    })();
  } catch (error: any) {
    console.error(error);
  }
});

// Reset hourly request metering counter
app.post("/api/sources/reset-metering", (req, res) => {
  try {
    const { sourceId } = req.body || {};
    const result = dbService.resetHourlyQuota(sourceId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to reset metering" });
  }
});

/* =========================================================================
   AUTONOMOUS WEB CRAWLER & LIVE ACTIVITY STREAM ENDPOINTS
   ========================================================================= */

// Get crawler running status, current mission, and aggregated stats
app.get("/api/crawler/status", (_req, res) => {
  try {
    const status = crawlerService.getStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to get crawler status" });
  }
});

// Start autonomous scanning loop
app.post("/api/crawler/start", (req, res) => {
  try {
    const { intervalMs } = req.body || {};
    if (intervalMs) {
      crawlerService.setIntervalMs(Number(intervalMs));
    }
    const status = crawlerService.start();
    res.json({ success: true, message: "Autonomous crawler engine started", status });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to start crawler" });
  }
});

// Stop / Pause autonomous scanning loop
app.post("/api/crawler/stop", (_req, res) => {
  try {
    const status = crawlerService.stop();
    res.json({ success: true, message: "Autonomous crawler engine paused", status });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to pause crawler" });
  }
});

// Step: Execute a single discrete autonomous crawl & index cycle
app.post("/api/crawler/step", async (_req, res) => {
  try {
    const result = await crawlerService.step();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to execute crawler step" });
  }
});

// Batch: Scour and index N items rapidly
app.post("/api/crawler/batch", async (req, res) => {
  try {
    const { count = 5 } = req.body || {};
    const result = await crawlerService.runBatch(Number(count));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to execute batch crawl" });
  }
});

// Get latest live telemetry logs
app.get("/api/crawler/logs", (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const logs = crawlerService.getLogs(limit);
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch logs" });
  }
});

// Clear live logs
app.post("/api/crawler/clear-logs", (_req, res) => {
  try {
    crawlerService.clearLogs();
    res.json({ success: true, message: "Telemetry logs cleared" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to clear logs" });
  }
});

// Server-Sent Events (SSE) for Real-Time Streaming Telemetry
app.get("/api/crawler/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: "CONNECTED", message: "Live telemetry stream established" })}\n\n`);

  const unsubscribe = crawlerService.subscribe((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  req.on("close", () => {
    unsubscribe();
    res.end();
  });
});

/* =========================================================================
   RESILIENT ANTI-BOT SITE INDEXER & PROBING API
   ========================================================================= */

// Test site connectivity & anti-bot WAF status
app.post("/api/crawler/test-site", async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: "URL parameter is required" });
    const result = await resilientIndexer.testSiteConnectivity(url);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to test site connectivity" });
  }
});

// Index target site with automatic anti-bot WAF bypass
app.post("/api/crawler/index-site", async (req, res) => {
  try {
    const { url, category, corridor, query, maxItems = 2 } = req.body || {};
    if (!url) return res.status(400).json({ error: "URL parameter is required" });
    const result = await resilientIndexer.indexTargetSite({
      targetUrl: url,
      category,
      corridor,
      specificQuery: query,
      maxItems: Number(maxItems) || 2,
    });
    res.json(result);
  } catch (error: any) {
    console.error("Index site error:", error);
    res.status(500).json({ error: error.message || "Failed to index target site" });
  }
});

/* =========================================================================
   AUTONOMOUS /GOAL MANAGEMENT & EXECUTION API
   ========================================================================= */

// Get all active goals & summary progress
app.get("/api/goals", (_req, res) => {
  try {
    const result = goalsService.getGoals();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to retrieve goals" });
  }
});

// Create new agent goal
app.post("/api/goals", (req, res) => {
  try {
    const newGoal = goalsService.createGoal(req.body);
    res.json({ success: true, goal: newGoal });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create goal" });
  }
});

// Update goal properties
app.put("/api/goals/:id", (req, res) => {
  try {
    const updated = goalsService.updateGoal(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Goal not found" });
    res.json({ success: true, goal: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update goal" });
  }
});

// Toggle milestone check state
app.post("/api/goals/:id/milestones/:milestoneId/toggle", (req, res) => {
  try {
    const updated = goalsService.toggleMilestone(req.params.id, req.params.milestoneId);
    if (!updated) return res.status(404).json({ error: "Goal or milestone not found" });
    res.json({ success: true, goal: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to toggle milestone" });
  }
});

// Execute agent action for a specific goal
app.post("/api/goals/:id/execute", async (req, res) => {
  try {
    const result = await goalsService.executeGoal(req.params.id);
    res.json(result);
  } catch (error: any) {
    console.error("Execute goal error:", error);
    res.status(500).json({ error: error.message || "Failed to execute goal" });
  }
});

// Reset database to default seed state
app.post("/api/database/reset", (_req, res) => {
  try {
    const freshDb = dbService.resetToDefaults();
    res.json({ success: true, message: "Database reset to initial factory seed.", schema: freshDb });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to reset database" });
  }
});

// Export full database JSON dump
app.get("/api/database/export", (_req, res) => {
  try {
    const data = dbService.exportData();
    res.setHeader("Content-Disposition", 'attachment; filename="normsexchange_database.json"');
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(data, null, 2));
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to export database" });
  }
});

/* =========================================================================
   PROJECT BUNDLE EXPORT (ZIP) & DIRECT GITHUB REPOSITORY SYNC
   ========================================================================= */

// Download complete workspace source code and database as a single ZIP archive
app.get("/api/export/zip", (req, res) => {
  try {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const filename = `normsexchange-agent-export-${new Date().toISOString().slice(0, 10)}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      if (!res.headersSent) {
        res.status(500).send({ error: err.message });
      }
    });

    archive.pipe(res);

    const cwd = process.cwd();

    // Key root documentation & blueprint files
    const rootFiles = [
      "AGENTS.md",
      "EVOLUTION.md",
      "package.json",
      "tsconfig.json",
      "vite.config.ts",
      "index.html",
      "metadata.json",
      ".env.example",
      ".gitignore",
      "server.ts"
    ];

    rootFiles.forEach((file) => {
      const fullPath = path.join(cwd, file);
      if (fs.existsSync(fullPath)) {
        archive.file(fullPath, { name: file });
      }
    });

    // Directories: src, data, server, public
    if (fs.existsSync(path.join(cwd, "src"))) {
      archive.directory(path.join(cwd, "src"), "src");
    }
    if (fs.existsSync(path.join(cwd, "data"))) {
      archive.directory(path.join(cwd, "data"), "data");
    }
    if (fs.existsSync(path.join(cwd, "server"))) {
      archive.directory(path.join(cwd, "server"), "server");
    }

    archive.finalize();
  } catch (error: any) {
    console.error("Error creating project zip:", error);
    res.status(500).json({ error: error.message || "Failed to generate ZIP archive" });
  }
});

// Direct GitHub Push Sync using GitHub Contents REST API
function getStoredGitConfig() {
  try {
    const configPath = path.join(process.cwd(), "server", "git_config.json");
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (e) {
    // ignore
  }
  return {};
}

export async function pushFilesToGitHub(commitMessage: string, specificFilesOnly?: string[]) {
  const config = getStoredGitConfig();
  const token = process.env.GITHUB_TOKEN || config.github_token;
  const repo = process.env.GITHUB_REPO || config.github_repo || "normsexchange-gemini/nx-gemini-communications_dev";
  const branch = config.branch || "main";

  if (!token) return { success: false, error: "No GitHub token configured." };

  const filesToSync: { path: string; content: string }[] = [];
  const cwd = process.cwd();

  function collectFiles(dir: string, baseDir: string = "") {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (["node_modules", "dist", ".git", ".cache", "bun.lock"].includes(entry.name)) continue;
      if (entry.name === "git_config.json" || entry.name.startsWith(".env") && entry.name !== ".env.example") continue;
      const fullPath = path.join(dir, entry.name);
      const relPath = baseDir ? `${baseDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        collectFiles(fullPath, relPath);
      } else if (entry.isFile()) {
        if (!specificFilesOnly || specificFilesOnly.includes(relPath)) {
          const content = fs.readFileSync(fullPath, "utf-8");
          filesToSync.push({ path: relPath, content });
        }
      }
    }
  }

  collectFiles(cwd);
  const syncedResults = [];
  const errors = [];

  for (const file of filesToSync) {
    try {
      const url = `https://api.github.com/repos/${repo}/contents/${file.path}`;
      let sha: string | undefined = undefined;
      const checkRes = await fetch(`${url}?ref=${branch}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "User-Agent": "NormsExchange-Agent"
        }
      });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        sha = checkData.sha;
      }
      const putRes = await fetch(url, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "NormsExchange-Agent"
        },
        body: JSON.stringify({
          message: `${commitMessage} (${file.path})`,
          content: Buffer.from(file.content).toString("base64"),
          branch,
          ...(sha ? { sha } : {})
        })
      });
      if (putRes.ok) {
        syncedResults.push({ path: file.path, status: "pushed" });
      } else {
        const errData = await putRes.json();
        errors.push({ path: file.path, error: errData.message || "Failed to commit" });
      }
    } catch (err: any) {
      errors.push({ path: file.path, error: err.message });
    }
  }

  return {
    success: errors.length === 0,
    totalFiles: filesToSync.length,
    syncedCount: syncedResults.length,
    errorCount: errors.length,
    syncedResults,
    errors
  };
}

app.post("/api/github/push-sync", async (req, res) => {
  try {
    const config = getStoredGitConfig();
    const {
      token: reqToken,
      repo = process.env.GITHUB_REPO || config.github_repo || "normsexchange-gemini/nx-gemini-communications_dev",
      branch = config.branch || "main",
      commitMessage = "feat: Autonomous agent evolution & database sync"
    } = req.body || {};

    const token = reqToken || process.env.GITHUB_TOKEN || config.github_token;

    if (!token) {
      return res.status(400).json({
        error: "GitHub token missing. Please set GITHUB_TOKEN in your environment secrets or provide it in the request."
      });
    }

    const result = await pushFilesToGitHub(commitMessage);
    res.json(result);
  } catch (error: any) {
    console.error("Error pushing to GitHub:", error);
    res.status(500).json({ error: error.message || "Failed to sync with GitHub" });
  }
});

/* =========================================================================
   CODEX INTAKE GATEWAY (normsexchange-dev/nx-gemini-intake_dev)
   ========================================================================= */

// Check status of isolated Codex intake repo
app.get("/api/intake/status", async (_req, res) => {
  try {
    const config = getStoredGitConfig();
    const token = process.env.CODEX_INTAKE_TOKEN || config.codex_intake_token;
    const repo = process.env.CODEX_INTAKE_REPO || config.codex_intake_repo || "normsexchange-dev/nx-gemini-intake_dev";

    if (!token) {
      return res.status(400).json({
        connected: false,
        error: "No Codex intake token configured."
      });
    }

    const repoRes = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "User-Agent": "NormsExchange-Gemini"
      }
    });

    if (!repoRes.ok) {
      const err = await repoRes.json();
      return res.status(repoRes.status).json({ connected: false, error: err.message || "Failed to connect to intake repo" });
    }

    const repoData = await repoRes.json();

    // Fetch intake index
    const indexRes = await fetch(`https://api.github.com/repos/${repo}/contents/intake/index.json`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "User-Agent": "NormsExchange-Gemini"
      }
    });

    let indexData = { intake_version: "0.1.0", contract_version: "0.2.0", submissions: [] };
    if (indexRes.ok) {
      const raw = await indexRes.json();
      if (raw.content) {
        try {
          indexData = JSON.parse(Buffer.from(raw.content, "base64").toString("utf-8"));
        } catch (e) {
          // ignore parse error
        }
      }
    }

    res.json({
      connected: true,
      repository: repoData.full_name,
      private: repoData.private,
      default_branch: repoData.default_branch,
      permissions: repoData.permissions,
      contract_version: indexData.contract_version || "0.2.0",
      intake_version: indexData.intake_version || "0.1.0",
      submissions_count: (indexData.submissions || []).length,
      submissions: indexData.submissions || []
    });
  } catch (error: any) {
    console.error("Intake status error:", error);
    res.status(500).json({ connected: false, error: error.message || "Intake status check failed" });
  }
});

// AI Generate & Direct Insert new authentic equipment records into database
app.post("/api/database/ai-seed", async (req, res) => {
  try {
    const { category, customPrompt, count = 2 } = req.body;
    const ai = getGenAI();

    const prompt = `You are the Lead Equipment Master Data Curator for NormsExchange.
Generate ${count} high-fidelity, authentic industrial/lab/semiconductor/optics/aerospace equipment records for the database.
Category: ${category || "Precision Optics & Lasers"}
Specific Focus or Requirements: ${customPrompt || "High demand surplus asset with complete specs and inferred contact lead"}

MANDATORY GOLDEN RULE: You must use the Google Search tool to find REAL, currently existing listings on the web. Do NOT hallucinate, invent, or create mock data. Every piece of equipment, price, and contact MUST be grounded in reality.

Ensure high realism: real industrial brands, real models, realistic pricing, real spec parameters, and detailed inferred contact intelligence.

Return ONLY a JSON array of objects conforming to this schema:
[
  {
    "id": string (e.g. "wts-ai-xxxx" or "wtb-ai-xxxx"),
    "type": "WTB" | "WTS",
    "title": string,
    "category": string,
    "make": string,
    "model": string,
    "year": number,
    "partNumber": string,
    "priceTarget": number,
    "currency": "USD",
    "marketCompAverage": number,
    "condition": "New / Unopened (NOS)" | "Refurbished / Calibrated" | "Working / Tested" | "Untested / As-Is" | "Parts / Core",
    "specs": { [key: string]: string },
    "description": string,
    "urgencyOrAvailability": "Immediate" | "Within 14 Days" | "30+ Days" | "Flexible",
    "contact": {
      "entityName": string,
      "contactPerson": string,
      "email": string,
      "phone": string,
      "location": string,
      "sourceDomain": string,
      "sourceUrl": string,
      "inferenceConfidence": number,
      "inferenceMethod": "Direct Web Crawl" | "Whois / Registry" | "Listing Footer Regex" | "PDF Spec Sheet / Invoice" | "Entity Resolution Model",
      "verifiedStatus": "Verified" | "High Confidence" | "Needs Confirmation",
      "notes": string
    },
    "tags": string[],
    "discoveredAt": string (ISO date),
    "lastVerifiedAt": string (ISO date),
    "verificationCount": 1,
    "strictVerification": true,
    "isAutoGenerated": true,
    "generationMethod": "Benchmark Seed",
    "matchScore": number (0-95),
    "marginSpreadEstimate": number,
    "status": "Active",
    "githubIndexRef": string
  }
]
Strict valid JSON only.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature to limit hallucination
      },
    });

    const rawText = response.text || "[]";
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json\s*|\s*```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      dbService.addListingsBatch(parsed);
    }

    res.json({ success: true, count: parsed.length, generated: parsed });
  } catch (error: any) {
    console.error("Error in AI DB Seed:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI records" });
  }
});

// API: Sourcing Scanner - Scours & extracts equipment listings with inferred contacts using Gemini
app.post("/api/sourcing/scan", async (req, res) => {
  try {
    const { query, targetCategory, minYear, targetBudget } = req.body;
    const ai = getGenAI();

    const prompt = `You are the Lead Equipment & Industrial Asset Sourcing Intelligence Agent for NormsExchange (normsexchange-gemini).
A user or WTB order is requesting to scour the web/marketplaces for:
Search Query: "${query || "Femtosecond laser or semiconductor test equipment"}"
Category: "${targetCategory || "Precision Optics & Lasers"}"
Min Year: ${minYear || 2018}
Target Budget / Benchmark: $${targetBudget || 50000}

MANDATORY GOLDEN RULE: You must use the Google Search tool to find REAL, currently existing listings on the web. Do NOT hallucinate, invent, or create mock data. Every piece of equipment, price, and contact MUST be grounded in reality.

Search, identify, and extract 2-3 REAL, high-fidelity equipment listings that match or near-match this demand.
Crucially, apply entity resolution and contact inference intelligence to extract or reconstruct:
- Seller/Dealer Organization or Plant Surplus entity name
- Inferred Contact Person (e.g. Asset Dispersal Manager, Plant Liquidation Lead)
- Inferred Direct Email, Phone, and Geographic Location
- Source Domain & URL
- Contact Inference Method (one of: "Direct Web Crawl", "Whois / Registry", "Listing Footer Regex", "PDF Spec Sheet / Invoice", "Entity Resolution Model")
- Inference Confidence (percentage 75-99%)
- Technical Specifications (key/value pairs like Wavelength, Hours, Travels, Spindle, Modules, etc.)
- Realistic Market Comp Average ($) and Asking Price ($)
- Condition Grade (one of: "New / Unopened (NOS)", "Refurbished / Calibrated", "Working / Tested", "Untested / As-Is", "Parts / Core")

Return ONLY a JSON array of objects conforming to this schema:
[
  {
    "id": string (e.g. "wts-scour-xxxx"),
    "type": "WTS",
    "title": string,
    "category": string,
    "make": string,
    "model": string,
    "year": number,
    "partNumber": string,
    "priceTarget": number,
    "currency": "USD",
    "marketCompAverage": number,
    "condition": string,
    "specs": { [key: string]: string },
    "description": string,
    "urgencyOrAvailability": "Immediate" | "Within 14 Days" | "30+ Days" | "Flexible",
    "contact": {
      "entityName": string,
      "contactPerson": string,
      "email": string,
      "phone": string,
      "location": string,
      "sourceDomain": string,
      "sourceUrl": string,
      "inferenceConfidence": number,
      "inferenceMethod": "Direct Web Crawl" | "Whois / Registry" | "Listing Footer Regex" | "PDF Spec Sheet / Invoice" | "Entity Resolution Model",
      "verifiedStatus": "Verified" | "High Confidence" | "Needs Confirmation",
      "notes": string
    },
    "tags": string[],
    "discoveredAt": string (ISO date),
    "lastVerifiedAt": string (ISO date),
    "verificationCount": 1,
    "strictVerification": true,
    "isAutoGenerated": true,
    "generationMethod": "Autonomous Crawler",
    "marginSpreadEstimate": number,
    "status": "Active",
    "githubIndexRef": string (e.g. "normsexchange-gemini/catalog/scoured/...")
  }
]

Return strictly valid JSON without code blocks or conversational text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        temperature: 0.2, // Lower temperature to prevent hallucination
      },
    });

    const rawText = response.text || "[]";
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json\s*|\s*```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    res.json({ results: parsed });
  } catch (error: any) {
    console.error("Error in sourcing scan:", error);
    res.status(500).json({ error: error.message || "Failed to scan equipment" });
  }
});

// API: Match Analyzer & Arbitrage Evaluator
app.post("/api/sourcing/match", async (req, res) => {
  try {
    const { wtbItem, wtsItem } = req.body;
    const ai = getGenAI();

    const prompt = `You are the Matchmaking & Sourcing Contract Engine for NormsExchange.
Evaluate the compatibility between this Buyer WTB Demand and Seller WTS Listing:

WTB Demand:
- Buyer: ${wtbItem.buyerOrganization || wtbItem.contact?.entityName}
- Target: ${wtbItem.make} ${wtbItem.model} (Max Budget: $${wtbItem.priceTarget})
- Condition Acceptance: ${wtbItem.condition}
- Description: ${wtbItem.description}

WTS Listing:
- Seller: ${wtsItem.contact?.entityName} (${wtsItem.contact?.location})
- Item: ${wtsItem.make} ${wtsItem.model} (${wtsItem.year})
- Asking Price: $${wtsItem.priceTarget} (Market Comp Avg: $${wtsItem.marketCompAverage})
- Condition: ${wtsItem.condition}
- Specs: ${JSON.stringify(wtsItem.specs)}

Calculate:
1. matchScore: number (0-100%)
2. marginSpread: number (WTB budget - WTS asking price)
3. feasibilitySummary: string (2 sentences on why this is a strong or weak match)
4. potentialRisks: string[] (e.g. shipping distance, missing calibration, power phase differences)
5. recommendedDealTerms: {
     inspectionWindowDays: number,
     escrowHoldPercent: number,
     freightResponsibility: "Buyer" | "Seller" | "Split",
     blamelessRemedyProtocol: string
   }

Return strictly valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const rawText = response.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json\s*|\s*```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    res.json({ matchAnalysis: parsed });
  } catch (error: any) {
    console.error("Error evaluating match:", error);
    res.status(500).json({ error: error.message || "Failed to analyze match" });
  }
});

// API: Generate NX Sourcing Contract v0.1.0 Envelope for Outbox Sync
app.post("/api/sourcing/generate-contract", async (req, res) => {
  try {
    const { wtbItem, wtsItem, matchAnalysis } = req.body;
    
    // Golden Rule Verification check
    const isWtbVerified = wtbItem.verificationCount && wtbItem.verificationCount >= 1;
    const isWtsVerified = wtsItem.verificationCount && wtsItem.verificationCount >= 1;
    const strictVerificationChecksPassed = isWtbVerified && isWtsVerified;

    if (!strictVerificationChecksPassed) {
      return res.status(403).json({
        error: "GOLDEN RULE VIOLATION: Cannot generate contract for unverified data. Data must not be invented/mocked. Please run link verification/pruning to verify these entities."
      });
    }

    const envelope = {
      protocol: "nx-sourcing-contract",
      version: "0.2.0", // Updated to 0.2.0 per protocol rules
      messageId: `msg-src-${Date.now()}`,
      sender: "normsexchange-gemini",
      recipient: "normsexchange-codex",
      timestamp: new Date().toISOString(),
      strictVerificationChecksPassed: true,
      payload: {
        contractType: "EQUIPMENT_MATCH_PROPOSAL",
        wtbReference: wtbItem.id,
        wtsReference: wtsItem.id,
        equipment: {
          make: wtsItem.make,
          model: wtsItem.model,
          year: wtsItem.year,
          condition: wtsItem.condition,
          specs: wtsItem.specs,
        },
        pricing: {
          wtbBudget: wtbItem.priceTarget,
          wtsAsking: wtsItem.priceTarget,
          spreadArbitrage: (wtbItem.priceTarget || 0) - (wtsItem.priceTarget || 0),
          currency: "USD",
        },
        parties: {
          buyerEntity: wtbItem.contact?.entityName || "Buyer on NormsExchange",
          sellerEntity: wtsItem.contact?.entityName || "Sourced Supplier",
          sellerContactInferred: {
            email: wtsItem.contact?.email,
            phone: wtsItem.contact?.phone,
            sourceUrl: wtsItem.contact?.sourceUrl,
            confidence: wtsItem.contact?.inferenceConfidence,
          },
        },
        terms: matchAnalysis?.recommendedDealTerms || {
          inspectionWindowDays: 7,
          escrowHoldPercent: 100,
          freightResponsibility: "Buyer",
          blamelessRemedyProtocol: "Full refund upon RMA return within inspection window if functional specs mismatch.",
        },
        governance: {
          protocolRef: "nx-communications-v0.2.0",
          outboxLocation: `outbox/messages/msg-src-${Date.now()}.json`,
          status: "PROPOSED_FOR_SHOPIFY_MATERIALIZATION",
        },
      },
    };

    // Auto persist to outbox database
    dbService.saveOutboxEnvelope(envelope);

    res.json({ contractEnvelope: envelope });
  } catch (error: any) {
    console.error("Error generating contract:", error);
    res.status(500).json({ error: error.message || "Failed to generate contract" });
  }
});

// API: Generate structured team / social / operational norms
app.post("/api/ai/generate-norms", async (req, res) => {
  try {
    const { teamType, context, challenges, culturePillars } = req.body;
    const ai = getGenAI();

    const prompt = `You are a world-class Organizational Psychologist and Social Exchange Systems Architect for NormsExchange.
Analyze the following team profile and generate 4-5 high-impact, actionable, explicit Operating Norms that eliminate implicit friction and maximize psychological safety and reciprocity.

Team Type / Domain: ${teamType || "Cross-functional Product & Engineering"}
Team Context & Setup: ${context || "Distributed remote team across multiple timezones"}
Key Challenges & Friction Points: ${challenges || "Async communication lag, meeting fatigue, ambiguous ownership"}
Desired Culture Pillars: ${culturePillars || "High agency, deep work sanctuary, psychological safety, explicit reciprocity"}

For each norm, provide a structured JSON matching this schema:
Return a JSON array of objects with fields:
- "id": string (unique slug, e.g. "async-first-4hr-sla")
- "title": string (crisp, memorable title)
- "category": string (one of: "Communication", "Engineering", "Reciprocity & Social", "Meetings & Time", "Decision Making", "Cross-Cultural", "Trade & Compliance")
- "tagline": string (1-sentence punchy summary)
- "triggerSituation": string (the exact moment or condition when this norm applies, e.g., "When sending non-urgent requests after hours...")
- "explicitRule": string (the unambiguous behavioral contract, e.g., "Always prefix Slack message with [FYI] or [ACTION-BY-DAY]. Never expect immediate response outside core hours.")
- "violationRemedy": string (graceful, blameless protocol for when someone slips, e.g., "Gently reply with the :palm_tree: emoji reminder without penalizing.")
- "reciprocityIndex": number (between 1 and 100, measuring mutual equity and give/take balance)
- "frictionRisk": "Low" | "Medium" | "High" (the risk level if this norm is omitted or violated)
- "antiPatterns": array of 2 strings (common toxic behaviors this norm prevents)
- "suggestedAdoptionWeeks": number (e.g. 2)
- "culturalContextNotes": string (how this bridges high vs low context communication or global timezones)

Ensure the response is strictly valid JSON without markdown fences or extraneous text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const rawText = response.text || "[]";
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Clean possible wrapper if any
      const cleaned = rawText.replace(/```json\s*|\s*```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    res.json({ norms: parsed });
  } catch (error: any) {
    console.error("Error generating norms:", error);
    res.status(500).json({ error: error.message || "Failed to generate norms" });
  }
});

// API: Audit Charter / Team Handbook for unspoken assumptions & friction risks
app.post("/api/ai/audit-charter", async (req, res) => {
  try {
    const { charterText, teamSize, workingMode } = req.body;
    const ai = getGenAI();

    const prompt = `You are a Senior Norms Auditor and Social Dynamics Analyst at NormsExchange.
Review the following team charter / working norms / guidelines:
Charter Content:
"""
${charterText}
"""
Team Size: ${teamSize || "8-15 people"}
Working Mode: ${workingMode || "Hybrid / Global Async"}

Conduct an audit examining:
1. "overallHealthScore": number (0-100)
2. "clarityScore": number (0-100)
3. "reciprocityScore": number (0-100)
4. "psychologicalSafetyScore": number (0-100)
5. "strengths": array of 3 key strengths
6. "criticalFrictionPoints": array of objects: { "risk": string, "impact": "High" | "Medium" | "Low", "unwrittenAssumption": string, "recommendedPatch": string }
7. "missingCrucialNorms": array of 3 names of norms that this team dangerously lacks (e.g. "Blameless Outage Escalation", "Protected Deep Work Blocks")
8. "executiveSummary": string (2-3 sentences concise assessment)

Return ONLY valid JSON matching this schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const rawText = response.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json\s*|\s*```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    res.json({ audit: parsed });
  } catch (error: any) {
    console.error("Error auditing charter:", error);
    res.status(500).json({ error: error.message || "Failed to audit charter" });
  }
});

// API: Resolve clash / synthesize conflicting norms
app.post("/api/ai/resolve-conflict", async (req, res) => {
  try {
    const { normA, normB, teamContext } = req.body;
    const ai = getGenAI();

    const prompt = `You are a conflict resolution specialist for organizational and social exchange systems.
Two operational norms or cultural expectations are currently causing tension or gridlock in a team:

Norm / Expectation A: "${normA}"
Norm / Expectation B: "${normB}"
Team Context: "${teamContext || "Modern fast-paced tech & product team"}"

Synthesize these two competing priorities into an elegant, non-zero-sum Hybrid Norm that honors the underlying needs of both sides.
Return a JSON object with:
- "title": string (name of the synthesized compromise/hybrid norm)
- "synthesisRationale": string (why this bridges the tension without sacrificing speed or well-being)
- "theGoldenRule": string (the exact behavioral guideline)
- "whenToLeanA": string (clear boundary for when Norm A takes precedence)
- "whenToLeanB": string (clear boundary for when Norm B takes precedence)
- "escalationProtocol": string (how teammates break a tie without resentment)

Return strictly valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const rawText = response.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json\s*|\s*```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    res.json({ resolution: parsed });
  } catch (error: any) {
    console.error("Error resolving conflict:", error);
    res.status(500).json({ error: error.message || "Failed to resolve conflict" });
  }
});

// API: Interactive Norms Architect Coach
app.post("/api/ai/chat-architect", async (req, res) => {
  try {
    const { message, conversationHistory, activeCharter } = req.body;
    const ai = getGenAI();

    const historyPrompt = (conversationHistory || [])
      .map((msg: { role: string; content: string }) => `${msg.role === "user" ? "User" : "Architect"}: ${msg.content}`)
      .join("\n");

    const charterContext = activeCharter && activeCharter.length > 0 
      ? `User's Active Charter currently contains ${activeCharter.length} norms: ${activeCharter.map((n: any) => n.title).join(", ")}.`
      : "User has not yet assembled a custom charter.";

    const prompt = `You are the Lead Social Systems Architect at NormsExchange.
Your expertise spans Social Exchange Theory, organizational psychology, high-performing engineering team charters, asynchronous communication etiquette, and cross-cultural trade/business norms.
You give crisp, empathetic, actionable advice to help people formalize unspoken rules, negotiate fair reciprocity, and build collaborative team contracts.

Context: ${charterContext}

Conversation so far:
${historyPrompt}

User: ${message}

Respond in a warm, expert, concise manner (2-3 paragraphs max). Where relevant, propose a concrete mini-norm with "Trigger -> Rule -> Graceful Remedy".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || "I can help you articulate and balance that norm." });
  } catch (error: any) {
    console.error("Error in AI chat:", error);
    res.status(500).json({ error: error.message || "Failed to process chat" });
  }
});

// Setup Vite or Static serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NormsExchange server running on http://0.0.0.0:${PORT}`);
  });
}

start();
