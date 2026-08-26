import express from "express";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { dbService } from "./server/database";

const require = createRequire(import.meta.url);
const archiver = require("archiver");

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
      minPrice,
      maxPrice,
      condition,
      verifiedOnly,
      sortBy
    } = req.query;

    const listings = dbService.getListings({
      q: q ? String(q) : undefined,
      category: category ? String(category) : undefined,
      type: type ? String(type) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      condition: condition ? String(condition) : undefined,
      verifiedOnly: verifiedOnly === "true",
      sortBy: sortBy as any
    });

    res.json({
      total: listings.length,
      listings,
      query: { q, category, type, minPrice, maxPrice, condition, sortBy }
    });
  } catch (error: any) {
    console.error("Error querying listings database:", error);
    res.status(500).json({ error: error.message || "Failed to query database" });
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

// AI Generate & Direct Insert new authentic equipment records into database
app.post("/api/database/ai-seed", async (req, res) => {
  try {
    const { category, customPrompt, count = 2 } = req.body;
    const ai = getGenAI();

    const prompt = `You are the Lead Equipment Master Data Curator for NormsExchange.
Generate ${count} high-fidelity, authentic industrial/lab/semiconductor/optics/aerospace equipment records for the database.
Category: ${category || "Precision Optics & Lasers"}
Specific Focus or Requirements: ${customPrompt || "High demand surplus asset with complete specs and inferred contact lead"}

Ensure high realism: real industrial brands (e.g. Coherent, Trumpf, ASML, Nikon, Keysight, Haas, DMG Mori, FANUC, Thermo Fisher, Magna-Power, Agilent, Zeiss), real models, realistic pricing ($5,000 - $350,000), real spec parameters, and detailed inferred contact intelligence.

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
        responseMimeType: "application/json",
        temperature: 0.7,
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

Search, identify, and extract 2-3 realistic, high-fidelity equipment listings that match or near-match this demand.
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
    "category": string (e.g. "Precision Optics & Lasers", "Semiconductor & Cleanroom", "Industrial CNC & Machining", "Lab & Metrology Testing", "High-Voltage & Power Systems", "Automation & Robotics", "Aerospace & Avionics Surplus"),
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
        responseMimeType: "application/json",
        temperature: 0.7,
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
    const envelope = {
      protocol: "nx-sourcing-contract",
      version: "0.1.0",
      messageId: `msg-src-${Date.now()}`,
      sender: "normsexchange-gemini",
      recipient: "normsexchange-codex",
      timestamp: new Date().toISOString(),
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
