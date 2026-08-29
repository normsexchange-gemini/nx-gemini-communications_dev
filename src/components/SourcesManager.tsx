import React, { useState, useEffect, useMemo } from "react";
import { 
  ListingSource, 
  SourceHealthStatus, 
  SourceAccessMethod, 
  SourceCorridor,
  SourceProbeResult,
  EquipmentCategory
} from "../types";
import { sourcesApi, SourcesQueryParams } from "../services/sourcesApi";
import { 
  Globe, 
  Server, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Clock, 
  Zap, 
  RefreshCw, 
  Search, 
  Filter, 
  PlusCircle, 
  ExternalLink, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  SlidersHorizontal, 
  Check, 
  Layers, 
  Key, 
  Code, 
  FileCode, 
  Trash2, 
  Edit3, 
  Eye, 
  ArrowUpRight, 
  Cpu, 
  Gauge, 
  Sparkles,
  GitBranch,
  Radio,
  Lock,
  Unlock,
  Terminal,
  HelpCircle,
  Hash,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

interface SourcesManagerProps {
  onSelectSourceForScan?: (source: ListingSource) => void;
}

export const SourcesManager: React.FC<SourcesManagerProps> = ({ onSelectSourceForScan }) => {
  // Data State
  const [sources, setSources] = useState<ListingSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProbingAll, setIsProbingAll] = useState<boolean>(false);
  const [probingSourceId, setProbingSourceId] = useState<string | null>(null);
  const [probeResultModal, setProbeResultModal] = useState<SourceProbeResult | null>(null);
  const [selectedSourceForDetail, setSelectedSourceForDetail] = useState<ListingSource | null>(null);
  const [editingSource, setEditingSource] = useState<Partial<ListingSource> | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Summary Metrics
  const [totalRequestsThisHour, setTotalRequestsThisHour] = useState<number>(0);
  const [maxHourlyQuotaSum, setMaxHourlyQuotaSum] = useState<number>(0);
  const [quotaUtilizationPercent, setQuotaUtilizationPercent] = useState<number>(0);
  const [avgLatencyMs, setAvgLatencyMs] = useState<number>(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCorridor, setSelectedCorridor] = useState<string>("ALL");
  const [selectedAccessMethod, setSelectedAccessMethod] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [spideringFilter, setSpideringFilter] = useState<string>("ALL");
  const [apiFilter, setApiFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"status" | "name" | "requests" | "uptime" | "latency" | "api">("status");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(24);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCorridor, selectedAccessMethod, selectedStatus, spideringFilter, apiFilter, sortBy]);

  const effectivePageSize = pageSize === 0 ? sources.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(sources.length / effectivePageSize));
  
  const paginatedSources = useMemo(() => {
    if (pageSize === 0) return sources;
    const start = (currentPage - 1) * pageSize;
    return sources.slice(start, start + pageSize);
  }, [sources, currentPage, pageSize]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Sources from Server
  const fetchSources = async () => {
    try {
      setIsLoading(true);
      const res = await sourcesApi.getSources({
        q: searchQuery,
        corridor: selectedCorridor !== "ALL" ? selectedCorridor : undefined,
        accessMethod: selectedAccessMethod !== "ALL" ? selectedAccessMethod : undefined,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        spideringAllowed: spideringFilter === "ALLOWED" ? true : spideringFilter === "DISALLOWED" ? false : undefined,
        apiFilter: apiFilter !== "ALL" ? apiFilter : undefined,
        sortBy: sortBy,
      });

      setSources(res.sources || []);
      setTotalRequestsThisHour(res.totalRequestsThisHour || 0);
      setMaxHourlyQuotaSum(res.maxHourlyQuotaSum || 0);
      setQuotaUtilizationPercent(res.quotaUtilizationPercent || 0);
      setAvgLatencyMs(res.avgLatencyMs || 0);
    } catch (err: any) {
      console.error("Error fetching sources:", err);
      showToast(`Failed to load sources: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [searchQuery, selectedCorridor, selectedAccessMethod, selectedStatus, spideringFilter, apiFilter, sortBy]);

  // Single Probe Trigger
  const handleProbeSource = async (sourceId: string, customUrl?: string) => {
    try {
      setProbingSourceId(sourceId);
      const res = await sourcesApi.probeSource(sourceId, customUrl);
      setProbeResultModal(res.result);
      // Update local source record
      setSources((prev) => prev.map((s) => (s.id === sourceId ? res.source : s)));
      showToast(`Probe complete for ${res.result.domain} (HTTP ${res.result.httpStatus}, ${res.result.latencyMs}ms)`);
    } catch (err: any) {
      console.error("Probe error:", err);
      showToast(`Probe failed: ${err.message}`);
    } finally {
      setProbingSourceId(null);
    }
  };

  // Probe All Sources
  const handleProbeAll = async () => {
    try {
      setIsProbingAll(true);
      const res = await sourcesApi.probeAll();
      setSources(res.sources || []);
      showToast(`Probed ${res.totalProbed} sources. Live latency and health updated.`);
      fetchSources();
    } catch (err: any) {
      console.error("Probe all error:", err);
      showToast(`Probe all failed: ${err.message}`);
    } finally {
      setIsProbingAll(false);
    }
  };

  // Toggle Pause/Resume
  const handleTogglePause = async (sourceId: string) => {
    try {
      const res = await sourcesApi.togglePause(sourceId);
      setSources((prev) => prev.map((s) => (s.id === sourceId ? res.source : s)));
      showToast(`Source status updated to: ${res.source.healthStatus}`);
    } catch (err: any) {
      showToast(`Toggle failed: ${err.message}`);
    }
  };

  // Reset Metering Counter
  const handleResetMetering = async (sourceId?: string) => {
    try {
      const res = await sourcesApi.resetMetering(sourceId);
      showToast(`Hourly quota reset for ${res.resetCount} source(s).`);
      fetchSources();
    } catch (err: any) {
      showToast(`Reset failed: ${err.message}`);
    }
  };

  // Save (Create or Update)
  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource || !editingSource.name || !editingSource.domain) {
      showToast("Name and domain are required.");
      return;
    }

    try {
      if (editingSource.id) {
        const res = await sourcesApi.updateSource(editingSource.id, editingSource);
        setSources((prev) => prev.map((s) => (s.id === editingSource.id ? res.source : s)));
        showToast(`Updated source: ${res.source.name}`);
      } else {
        const res = await sourcesApi.createSource(editingSource);
        setSources((prev) => [res.source, ...prev]);
        showToast(`Created source: ${res.source.name}`);
      }
      setEditingSource(null);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      showToast(`Failed to save source: ${err.message}`);
    }
  };

  // Delete Source
  const handleDeleteSource = async (sourceId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove source '${name}' from the indexed registry?`)) {
      return;
    }
    try {
      await sourcesApi.deleteSource(sourceId);
      setSources((prev) => prev.filter((s) => s.id !== sourceId));
      showToast(`Source deleted: ${name}`);
    } catch (err: any) {
      showToast(`Failed to delete: ${err.message}`);
    }
  };

  // Status Badge Helper
  const getHealthBadge = (status: SourceHealthStatus) => {
    switch (status) {
      case "Operational / Up":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Operational / Up
          </span>
        );
      case "Degraded / Slow":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/60 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-400">
            <AlertTriangle className="h-3 w-3" />
            Degraded / Slow
          </span>
        );
      case "Rate Limited / Cooling Down":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-950/60 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-orange-400">
            <Clock className="h-3 w-3" />
            Rate Limited (Cooling)
          </span>
        );
      case "Down / Error":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-950/60 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-rose-400">
            <XCircle className="h-3 w-3" />
            Down / Error
          </span>
        );
      case "Paused by Admin":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-slate-400">
            <Pause className="h-3 w-3" />
            Paused by Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-[11px] text-slate-400">
            {status}
          </span>
        );
    }
  };

  const operationalCount = sources.filter((s) => s.healthStatus === "Operational / Up").length;
  const spiderableCount = sources.filter((s) => s.spideringAllowed).length;
  const apiCount = sources.filter((s) => s.hasPublicApi).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-slate-900/95 px-4 py-3 text-sm text-cyan-200 shadow-xl backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-6 backdrop-blur-md shadow-lg shadow-cyan-950/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/40">
                LISTING SOURCES REGISTRY
              </span>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-indigo-300 border border-indigo-500/30">
                GITHUB BACKED STORE
              </span>
              {/* Mandatory Auto-Generated Badge per AGENTS.md */}
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-300 border border-amber-500/40">
                <Sparkles className="h-3 w-3" />
                ⚡ AUTO GENERATED & SEEDED REGISTRY
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Server className="h-6 w-6 text-cyan-400" />
              Indexed Listing Sources & Rate-Metering Engine
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-3xl leading-relaxed">
              Curated database of indexed cinema equipment brokers, rental houses, and Japanese/Vietnamese optical corridors. 
              Controls crawler permissions, verifies <code className="font-mono text-cyan-300 text-xs">robots.txt</code> spidering rules, checks API endpoints, and meters hourly request quotas to prevent uncoordinated traffic.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-probe-all"
              onClick={handleProbeAll}
              disabled={isProbingAll}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-cyan-600/30 transition-all hover:bg-cyan-500 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isProbingAll ? "animate-spin" : ""}`} />
              <span>{isProbingAll ? "Probing Endpoints..." : "Probe All Sources (Live Ping)"}</span>
            </button>

            <button
              id="btn-reset-metering"
              onClick={() => handleResetMetering()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
              title="Reset hourly usage counter back to 0 for all sources"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
              <span>Reset Hourly Quota</span>
            </button>

            <a
              id="btn-export-sources"
              href={sourcesApi.getExportUrl()}
              download="normsexchange-sources-registry.json"
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/60 px-3 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-900/60 transition-all"
              title="Download GitHub compatible schema json"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export for Git</span>
            </a>

            <button
              id="btn-add-source"
              onClick={() => {
                setEditingSource({
                  name: "",
                  domain: "",
                  baseUrl: "https://",
                  corridor: "GLOBAL",
                  categoryFocus: ["Cameras & Systems", "Lenses & Optics"],
                  tier: "Tier 2 - Verified Broker",
                  spideringAllowed: true,
                  robotsTxtStatus: "Allowed with Respect",
                  crawlDelaySeconds: 2,
                  userAgentPolicy: "NormsExchange-Bot/1.0",
                  accessMethod: "Structured Web Scraper",
                  accessRulesSummary: "Respect rate limits and cache results for 15 minutes.",
                  maxRequestsPerHour: 60,
                  burstLimit: 2,
                  throttleDelayMs: 2000,
                  healthStatus: "Operational / Up",
                  isAutoGenerated: true,
                  generationMethod: "User Curated Registry",
                });
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/30 transition-all hover:bg-emerald-500 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Add Source</span>
            </button>
          </div>
        </div>

        {/* Live Aggregated Telemetry Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 border-t border-slate-800/80 pt-4">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <div className="text-[11px] font-mono text-slate-400">INDEXED SOURCES</div>
            <div className="mt-1 text-xl font-bold font-mono text-white">{sources.length}</div>
            <div className="text-[10px] text-slate-500">Global & Corridor Nodes</div>
          </div>

          <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3">
            <div className="text-[11px] font-mono text-emerald-400">OPERATIONAL / UP</div>
            <div className="mt-1 text-xl font-bold font-mono text-emerald-300">
              {operationalCount} <span className="text-xs text-emerald-500">/ {sources.length}</span>
            </div>
            <div className="text-[10px] text-emerald-500/80">
              {sources.length > 0 ? Math.round((operationalCount / sources.length) * 100) : 0}% Uptime Index
            </div>
          </div>

          <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3">
            <div className="text-[11px] font-mono text-cyan-400">SPIDERABLE (ROBOTS.TXT)</div>
            <div className="mt-1 text-xl font-bold font-mono text-cyan-300">
              {spiderableCount} <span className="text-xs text-cyan-500">Permitted</span>
            </div>
            <div className="text-[10px] text-cyan-500/80">{sources.length - spiderableCount} API / Manual Only</div>
          </div>

          <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-3">
            <div className="text-[11px] font-mono text-indigo-400">PUBLIC REST / GRAPHQL</div>
            <div className="mt-1 text-xl font-bold font-mono text-indigo-300">
              {apiCount} <span className="text-xs text-indigo-500">APIs</span>
            </div>
            <div className="text-[10px] text-indigo-500/80">Direct Machine Access</div>
          </div>

          <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-3">
            <div className="text-[11px] font-mono text-amber-400">HOURLY METERING</div>
            <div className="mt-1 text-xl font-bold font-mono text-amber-300">
              {totalRequestsThisHour} <span className="text-xs text-amber-500">/ {maxHourlyQuotaSum}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5">
              <div 
                className="bg-amber-400 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, quotaUtilizationPercent)}%` }}
              ></div>
            </div>
          </div>

          <div className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-3">
            <div className="text-[11px] font-mono text-purple-400">AVG PROBE LATENCY</div>
            <div className="mt-1 text-xl font-bold font-mono text-purple-300">
              {avgLatencyMs} <span className="text-xs font-normal">ms</span>
            </div>
            <div className="text-[10px] text-purple-400/80">DNS & Edge Response</div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="input-search-sources"
            type="text"
            placeholder="Search sources by name, domain, category, robots.txt rule, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Corridor Filter */}
          <select
            id="filter-corridor"
            value={selectedCorridor}
            onChange={(e) => setSelectedCorridor(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Corridors</option>
            <option value="LA_TO_VN">LA ➔ Vietnam</option>
            <option value="VN_TO_US">Vietnam ➔ US</option>
            <option value="DOMESTIC_US">Domestic US / CA</option>
            <option value="DOMESTIC_VN">Domestic Vietnam</option>
            <option value="GLOBAL">Global / Multi-region</option>
          </select>

          {/* Access Method Filter */}
          <select
            id="filter-access-method"
            value={selectedAccessMethod}
            onChange={(e) => setSelectedAccessMethod(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Access Methods</option>
            <option value="Structured Web Scraper">Structured Web Scraper</option>
            <option value="Public REST API">Public REST API</option>
            <option value="GraphQL Endpoint">GraphQL Endpoint</option>
            <option value="RSS / XML Catalog Feed">RSS / XML Feed</option>
            <option value="Manual Verification Only">Manual Verification Only</option>
          </select>

          {/* Health Status Filter */}
          <select
            id="filter-health-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Health States</option>
            <option value="Operational / Up">Operational / Up</option>
            <option value="Degraded / Slow">Degraded / Slow</option>
            <option value="Rate Limited / Cooling Down">Rate Limited / Cooling Down</option>
            <option value="Down / Error">Down / Error</option>
            <option value="Paused by Admin">Paused by Admin</option>
          </select>

          {/* Spidering Filter */}
          <select
            id="filter-spidering"
            value={spideringFilter}
            onChange={(e) => setSpideringFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">Spidering: All</option>
            <option value="ALLOWED">Spidering: Allowed (robots.txt)</option>
            <option value="DISALLOWED">Spidering: Disallowed</option>
          </select>

          {/* API Filter */}
          <select
            id="filter-api"
            value={apiFilter}
            onChange={(e) => setApiFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">API Availability: All</option>
            <option value="HAS_API">Has Official API Available</option>
            <option value="NO_API">No API (Scraper Only)</option>
          </select>

          {/* Sort */}
          <select
            id="filter-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="status">Sort: Status Priority</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="requests">Sort: Highest Request Usage</option>
            <option value="latency">Sort: Lowest Latency (Fastest)</option>
            <option value="uptime">Sort: Highest Uptime %</option>
            <option value="api">Sort: Has Public API</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-950 p-0.5">
            <button
              onClick={() => setViewMode("cards")}
              className={`rounded px-2 py-1 text-xs ${viewMode === "cards" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
              title="Card Grid View"
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`rounded px-2 py-1 text-xs ${viewMode === "table" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}
              title="Dense Table View"
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Sources View */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="flex flex-col items-center gap-3 text-cyan-400">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="font-mono text-sm">Querying GitHub-backed Sources Registry...</span>
          </div>
        </div>
      ) : sources.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Server className="h-12 w-12 text-slate-600" />
          <h3 className="mt-3 text-lg font-bold text-white">No Sources Match Filter Criteria</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-md">
            Try adjusting your search query or corridor/access method filters to find registered listing sources.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCorridor("ALL");
              setSelectedAccessMethod("ALL");
              setSelectedStatus("ALL");
              setSpideringFilter("ALL");
              setApiFilter("ALL");
            }}
            className="mt-4 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === "cards" ? (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {paginatedSources.map((source) => {
            const usagePercent = (source.maxRequestsPerHour ?? 0) > 0 
              ? Math.round(((source.requestsThisHour || 0) / source.maxRequestsPerHour) * 100) 
              : 0;
            const isRateLimitDanger = usagePercent >= 80;
            const isProbingThis = probingSourceId === source.id;

            return (
              <div
                key={source.id}
                id={`source-card-${source.id}`}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-md transition-all hover:border-slate-700 hover:shadow-cyan-950/20"
              >
                <div>
                  {/* Top Badges & Health */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {getHealthBadge(source.healthStatus)}
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-700">
                        {source.tier}
                      </span>
                    </div>

                    {/* Auto Generated Badge */}
                    {source.isAutoGenerated && (
                      <span 
                        className="rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-300"
                        title={`Generation Method: ${source.generationMethod || 'Auto Indexed'}`}
                      >
                        ⚡ AUTO
                      </span>
                    )}
                  </div>

                  {/* Title & Domain */}
                  <div className="mt-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5 group/title">
                      <a
                        href={source.baseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
                        title={`Open ${source.name} website in new window`}
                      >
                        <span>{source.name}</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover/title:opacity-100 text-cyan-400" />
                      </a>
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <a
                        href={source.baseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                        title={`Open ${source.domain} in new window`}
                      >
                        <Globe className="h-3 w-3 text-cyan-500" />
                        {source.domain}
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                      <span className="text-slate-600">•</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {source.corridor}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {source.description}
                  </p>

                  {/* Category Focus Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {source.categoryFocus.map((cat, i) => (
                      <span key={i} className="rounded bg-slate-950 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-800">
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Rules & Access Summary Grid */}
                  <div className="mt-4 rounded-lg border border-slate-800/80 bg-slate-950/70 p-3 space-y-2 text-xs">
                    {/* Spidering & Robots.txt */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                        Spidering (robots.txt):
                      </span>
                      {source.spideringAllowed ? (
                        <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Permitted ({source.crawlDelaySeconds}s delay)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-rose-400">
                          <XCircle className="h-3.5 w-3.5" />
                          Disallowed / API Only
                        </span>
                      )}
                    </div>

                    {/* API Status */}
                                        <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Code className="h-3.5 w-3.5 text-indigo-400" />
                        Current Access:
                      </span>
                      <span className="font-mono text-[11px] text-indigo-300">
                        {source.accessMethod}
                      </span>
                    </div>
                    {/* Public API indicator */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Official API:</span>
                      {source.hasPublicApi ? (
                        <span className="font-mono text-cyan-300 flex items-center gap-1">
                          <Zap className="h-3 w-3 text-cyan-400" />
                          API Available
                        </span>
                      ) : (
                        <span className="font-mono text-slate-500">
                          No API
                        </span>
                      )}
                    </div>

                    {/* Rate Metering Gauge */}
                    <div className="pt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Gauge className="h-3.5 w-3.5 text-amber-400" />
                          Hourly Metering:
                        </span>
                        <span className={`font-mono font-bold ${isRateLimitDanger ? "text-rose-400" : "text-amber-300"}`}>
                          {source.requestsThisHour || 0} / {source.maxRequestsPerHour || 'Unknown'} req/hr
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all ${
                            isRateLimitDanger ? "bg-rose-500" : usagePercent > 50 ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                          style={{ width: `${Math.min(100, usagePercent)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Health Diagnostics & Ping */}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 font-mono text-slate-400">
                      <span>Latency: <span className="text-slate-200">{source.lastLatencyMs || '--'} ms</span></span>
                      <span>HTTP: <span className="text-emerald-400">{source.httpStatusCode || 200}</span></span>
                      <span>Uptime: <span className="text-slate-200">{source.uptimePercent}%</span></span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-1.5">
                    {/* Live Probe Button */}
                    <button
                      id={`btn-probe-${source.id}`}
                      onClick={() => handleProbeSource(source.id)}
                      disabled={isProbingThis}
                      className="inline-flex items-center gap-1 rounded bg-cyan-600/20 border border-cyan-500/40 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:bg-cyan-600/40 transition-all disabled:opacity-50"
                      title="Send live test request to measure latency and verify HTTP status"
                    >
                      <Activity className={`h-3.5 w-3.5 ${isProbingThis ? "animate-spin" : ""}`} />
                      <span>{isProbingThis ? "Pinging..." : "Probe Ping"}</span>
                    </button>

                    {/* Pause / Resume */}
                    <button
                      onClick={() => handleTogglePause(source.id)}
                      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium border transition-all ${
                        source.healthStatus === "Paused by Admin"
                          ? "bg-emerald-950 border-emerald-700 text-emerald-300 hover:bg-emerald-900"
                          : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                      title={source.healthStatus === "Paused by Admin" ? "Resume scraping for this source" : "Pause scraping for this source"}
                    >
                      {source.healthStatus === "Paused by Admin" ? (
                        <>
                          <Play className="h-3 w-3 text-emerald-400" />
                          <span>Resume</span>
                        </>
                      ) : (
                        <>
                          <Pause className="h-3 w-3" />
                          <span>Pause</span>
                        </>
                      )}
                    </button>

                    {/* Reset Quota */}
                    <button
                      onClick={() => handleResetMetering(source.id)}
                      className="rounded bg-slate-800/80 border border-slate-700 p-1 text-slate-400 hover:text-amber-300"
                      title="Reset hourly usage for this source"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Open Web Site in New Window */}
                    <a
                      href={source.baseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-slate-800/80 border border-slate-700 p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-700 transition-colors"
                      title="Open source website in new window"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>

                    {/* Detail Inspector */}
                    <button
                      onClick={() => setSelectedSourceForDetail(source)}
                      className="rounded bg-slate-800/80 border border-slate-700 p-1 text-slate-400 hover:text-white"
                      title="View full source details and robots.txt rules"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditingSource(source);
                        setIsCreateModalOpen(true);
                      }}
                      className="rounded bg-slate-800/80 border border-slate-700 p-1 text-slate-400 hover:text-cyan-300"
                      title="Edit source parameters"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteSource(source.id, source.name)}
                      className="rounded bg-slate-800/80 border border-slate-700 p-1 text-slate-400 hover:text-rose-400"
                      title="Delete source"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DENSE TABLE VIEW */
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-md">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 font-mono text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Source & Domain</th>
                <th className="py-3 px-3">Corridor</th>
                <th className="py-3 px-3">Health & HTTP</th>
                <th className="py-3 px-3">Spidering Rules</th>
                <th className="py-3 px-3">Access Protocol</th>
                <th className="py-3 px-3">Hourly Metering</th>
                <th className="py-3 px-3">Latency</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedSources.map((source) => {
                const usagePercent = (source.maxRequestsPerHour ?? 0) > 0 
                  ? Math.round(((source.requestsThisHour || 0) / source.maxRequestsPerHour) * 100) 
                  : 0;

                return (
                  <tr key={source.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white font-sans text-sm flex items-center gap-1.5 group/table-title">
                        <a
                          href={source.baseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                          title={`Open ${source.name} website in new window`}
                        >
                          <span>{source.name}</span>
                          <ExternalLink className="h-3 w-3 opacity-60 group-hover/table-title:opacity-100 text-cyan-400" />
                        </a>
                        {source.isAutoGenerated && (
                          <span 
                            className="rounded bg-amber-500/15 border border-amber-500/30 px-1 py-0.2 font-mono text-[8px] font-bold text-amber-300"
                            title={`Generation Method: ${source.generationMethod || 'Auto Indexed'}`}
                          >
                            ⚡ AUTO
                          </span>
                        )}
                      </div>
                      <a
                        href={source.baseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                        title={`Open ${source.domain} in new window`}
                      >
                        <Globe className="h-2.5 w-2.5 text-cyan-500" />
                        <span>{source.domain}</span>
                        <ArrowUpRight className="h-2.5 w-2.5 opacity-70" />
                      </a>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-300">
                      {source.corridor}
                    </td>
                    <td className="py-3 px-3">
                      {getHealthBadge(source.healthStatus)}
                    </td>
                    <td className="py-3 px-3 text-[11px]">
                      {source.spideringAllowed ? (
                        <span className="text-emerald-400 font-semibold">Allowed ({source.crawlDelaySeconds}s)</span>
                      ) : (
                        <span className="text-rose-400 font-semibold">Disallowed</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[11px]">
                      <div className="flex flex-col gap-1">
                        <span className="text-indigo-300">{source.accessMethod}</span>
                        {source.hasPublicApi ? (
                          <span className="text-cyan-400 font-semibold flex items-center gap-1"><Zap className="h-3 w-3"/> API Available</span>
                        ) : (
                          <span className="text-slate-500">No API</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[11px] text-amber-300">
                        {source.requestsThisHour || 0} / {source.maxRequestsPerHour || 'Unknown'} req/hr
                      </div>
                      <div className="w-24 bg-slate-800 rounded-full h-1 mt-1">
                        <div 
                          className="bg-amber-400 h-1 rounded-full"
                          style={{ width: `${Math.min(100, usagePercent)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-300">
                      {source.lastLatencyMs ? `${source.lastLatencyMs} ms` : "--"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={source.baseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded bg-slate-800 p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-700 transition-colors"
                          title="Open website in new window"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => handleProbeSource(source.id)}
                          className="rounded bg-cyan-600/20 border border-cyan-500/40 px-2 py-1 text-[11px] text-cyan-300 hover:bg-cyan-600/40"
                          title="Probe Ping"
                        >
                          Ping
                        </button>
                        <button
                          onClick={() => setSelectedSourceForDetail(source)}
                          className="rounded bg-slate-800 p-1 text-slate-400 hover:text-white"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingSource(source);
                            setIsCreateModalOpen(true);
                          }}
                          className="rounded bg-slate-800 p-1 text-slate-400 hover:text-cyan-300"
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION CONTROLS BAR */}
      {sources.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 sm:flex-row backdrop-blur-md">
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span>
              Showing <strong className="text-white">{(currentPage - 1) * (pageSize || 1) + 1}</strong> –{" "}
              <strong className="text-white">
                {pageSize === 0 ? sources.length : Math.min(currentPage * pageSize, sources.length)}
              </strong>{" "}
              of <strong className="text-cyan-400">{sources.length.toLocaleString()}</strong> sources
            </span>
            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
              <span className="text-slate-500">Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded bg-slate-950 px-2 py-1 text-xs text-slate-300 border border-slate-700 focus:border-cyan-500 focus:outline-none"
              >
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={96}>96</option>
                <option value={0}>All ({sources.length})</option>
              </select>
            </div>
          </div>

          {pageSize !== 0 && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="rounded p-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded p-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[28px] rounded px-2 py-1 text-xs font-mono font-medium transition-all ${
                        currentPage === pageNum
                          ? "bg-cyan-600 font-bold text-white shadow-sm"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded p-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded p-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SOURCE DETAIL INSPECTOR MODAL */}
      {selectedSourceForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setSelectedSourceForDetail(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-2">
              <span className="rounded bg-cyan-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/40">
                SOURCE INSPECTOR
              </span>
              {getHealthBadge(selectedSourceForDetail.healthStatus)}
              {selectedSourceForDetail.isAutoGenerated && (
                <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300 border border-amber-500/40">
                  ⚡ AUTO GENERATED
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <a
                  href={selectedSourceForDetail.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
                  title="Open source website in new window"
                >
                  <span>{selectedSourceForDetail.name}</span>
                  <ExternalLink className="h-4 w-4 text-cyan-400 opacity-70 hover:opacity-100" />
                </a>
              </h2>

              <a
                href={selectedSourceForDetail.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600/20 border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-600/40 transition-colors shadow-sm"
              >
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                <span>Visit Main Web Site</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <a
              href={selectedSourceForDetail.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 font-mono text-xs text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1.5 transition-colors"
              title="Open URL in new window"
            >
              <Globe className="h-3.5 w-3.5 text-cyan-500" />
              <span>{selectedSourceForDetail.baseUrl}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Spidering & robots.txt */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  Robots.txt & Spidering Policy
                </h4>
                <div className="space-y-1 text-slate-300 font-mono text-[11px]">
                  <div><span className="text-slate-500">Spidering Allowed:</span> {selectedSourceForDetail.spideringAllowed ? "YES" : "NO"}</div>
                  <div><span className="text-slate-500">Robots.txt Status:</span> {selectedSourceForDetail.robotsTxtStatus}</div>
                  <div>
                    <span className="text-slate-500">Robots.txt URL:</span>{" "}
                    <a
                      href={selectedSourceForDetail.robotsTxtUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                    >
                      {selectedSourceForDetail.robotsTxtUrl}
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    </a>
                  </div>
                  <div><span className="text-slate-500">User Agent Policy:</span> {selectedSourceForDetail.userAgentPolicy}</div>
                  <div><span className="text-slate-500">Crawl Delay:</span> {selectedSourceForDetail.crawlDelaySeconds} seconds</div>
                  <div><span className="text-slate-500">Allowed Paths:</span> {selectedSourceForDetail.allowedPaths.join(", ") || "/*"}</div>
                  <div><span className="text-slate-500">Disallowed Paths:</span> {selectedSourceForDetail.disallowedPaths.join(", ") || "None specified"}</div>
                </div>
              </div>

              {/* Box 2: API & Rate Metering */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-amber-400" />
                  API & Rate-Metering Quotas
                </h4>
                <div className="space-y-1 text-slate-300 font-mono text-[11px]">
                  <div><span className="text-slate-500">Access Protocol:</span> {selectedSourceForDetail.accessMethod}</div>
                  <div><span className="text-slate-500">Has Public API:</span> {selectedSourceForDetail.hasPublicApi ? "YES" : "NO"}</div>
                  {selectedSourceForDetail.apiEndpoint && (
                    <div>
                      <span className="text-slate-500">API Endpoint:</span>{" "}
                      <a
                        href={selectedSourceForDetail.apiEndpoint}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                      >
                        {selectedSourceForDetail.apiEndpoint}
                        <ArrowUpRight className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  )}
                  {selectedSourceForDetail.apiDocsUrl && (
                    <div>
                      <span className="text-slate-500">API Docs:</span>{" "}
                      <a
                        href={selectedSourceForDetail.apiDocsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                      >
                        {selectedSourceForDetail.apiDocsUrl}
                        <ArrowUpRight className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  )}
                  <div><span className="text-slate-500">Max Requests / Hour:</span> {selectedSourceForDetail.maxRequestsPerHour} req/hr</div>
                  <div><span className="text-slate-500">Current Hour Usage:</span> {selectedSourceForDetail.requestsThisHour || 0} req</div>
                  <div><span className="text-slate-500">Lifetime Requests:</span> {selectedSourceForDetail.totalLifetimeRequests || 0} req</div>
                  <div><span className="text-slate-500">Burst Limit:</span> {selectedSourceForDetail.burstLimit} req/sec</div>
                  <div><span className="text-slate-500">Throttle Delay:</span> {selectedSourceForDetail.throttleDelayMs} ms</div>
                </div>
              </div>
            </div>

            {/* Access Rules Summary */}
            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <FileCode className="h-4 w-4 text-indigo-400" />
                Access Rules & Curatorial Notes
              </h4>
              <p className="mt-2 text-slate-300 leading-relaxed">
                {selectedSourceForDetail.accessRulesSummary}
              </p>
              {selectedSourceForDetail.notes && (
                <p className="mt-2 text-slate-400 italic">
                  Note: {selectedSourceForDetail.notes}
                </p>
              )}
            </div>

            {/* GitHub Store Location */}
            <div className="mt-4 rounded-lg border border-slate-800/60 bg-slate-950/40 p-3 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>GitHub Storage Ref: <code className="text-cyan-300">{selectedSourceForDetail.githubStoragePath || `data/sources/${selectedSourceForDetail.id}.json`}</code></span>
              <span>Last Checked: {selectedSourceForDetail.lastCheckedAt && !isNaN(new Date(selectedSourceForDetail.lastCheckedAt).getTime()) ? new Date(selectedSourceForDetail.lastCheckedAt).toLocaleTimeString() : "Recently"}</span>
            </div>

            {/* Footer buttons */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <a
                href={selectedSourceForDetail.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-medium text-cyan-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>Open Main Website in New Window</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleProbeSource(selectedSourceForDetail.id);
                    setSelectedSourceForDetail(null);
                  }}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500"
                >
                  Run Live Probe
                </button>
                <button
                  onClick={() => setSelectedSourceForDetail(null)}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE PROBE RESULT MODAL */}
      {probeResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-cyan-500/40 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setProbeResultModal(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Live Source Probe Diagnostics</h3>
            </div>

            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Domain Tested:</span>
                <span className="text-white font-bold">{probeResultModal.domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">HTTP Status:</span>
                <span className={`font-bold ${probeResultModal.httpStatus >= 200 && probeResultModal.httpStatus < 400 ? "text-emerald-400" : "text-amber-400"}`}>
                  HTTP {probeResultModal.httpStatus} {probeResultModal.success ? "OK" : "Notice"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Latency / Response Time:</span>
                <span className="text-cyan-300 font-bold">{probeResultModal.latencyMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hourly Quota Remaining:</span>
                <span className="text-amber-300 font-bold">{probeResultModal.quotaRemaining} / {probeResultModal.maxRequestsPerHour || 'Unknown'} requests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Health Classification:</span>
                <span className="text-emerald-400">{probeResultModal.healthStatus}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 font-sans">
                <span className="font-bold text-cyan-400">Diagnosis: </span>
                {probeResultModal.message}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setProbeResultModal(null)}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SOURCE MODAL */}
      {isCreateModalOpen && editingSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingSource(null);
              }}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-cyan-400" />
              {editingSource.id ? "Edit Listing Source" : "Register New Equipment Source"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Configure spidering permissions, robots.txt crawl delays, API endpoints, and rate metering limits.
            </p>

            <form onSubmit={handleSaveSource} className="mt-5 space-y-4 text-xs">
              {/* Name & Domain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Source / Entity Name *</label>
                  <input
                    type="text"
                    required
                    value={editingSource.name || ""}
                    onChange={(e) => setEditingSource({ ...editingSource, name: e.target.value })}
                    placeholder="e.g. FJS Cinema Optics"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Domain *</label>
                  <input
                    type="text"
                    required
                    value={editingSource.domain || ""}
                    onChange={(e) => setEditingSource({ ...editingSource, domain: e.target.value })}
                    placeholder="e.g. fjscinema.com"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Base URL & Catalog URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Base URL</label>
                  <input
                    type="url"
                    value={editingSource.baseUrl || ""}
                    onChange={(e) => setEditingSource({ ...editingSource, baseUrl: e.target.value })}
                    placeholder="https://fjscinema.com"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Catalog / Inventory URL</label>
                  <input
                    type="url"
                    value={editingSource.catalogUrl || ""}
                    onChange={(e) => setEditingSource({ ...editingSource, catalogUrl: e.target.value })}
                    placeholder="https://fjscinema.com/lenses"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Corridor & Tier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Trade Corridor</label>
                  <select
                    value={editingSource.corridor || "GLOBAL"}
                    onChange={(e) => setEditingSource({ ...editingSource, corridor: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="LA_TO_VN">LA ➔ Vietnam Corridor</option>
                    <option value="VN_TO_US">Vietnam ➔ US Corridor</option>
                    <option value="DOMESTIC_US">Domestic US / CA</option>
                    <option value="DOMESTIC_VN">Domestic Vietnam</option>
                    <option value="GLOBAL">Global / Multi-region</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Trust Tier</label>
                  <select
                    value={editingSource.tier || "Tier 2 - Verified Broker"}
                    onChange={(e) => setEditingSource({ ...editingSource, tier: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Tier 1 - Primary Rental House">Tier 1 - Primary Rental House</option>
                    <option value="Tier 2 - Verified Broker">Tier 2 - Verified Broker</option>
                    <option value="Tier 3 - Auction Portal">Tier 3 - Auction Portal</option>
                    <option value="Tier 4 - Forum / Social Classifieds">Tier 4 - Forum / Social Classifieds</option>
                  </select>
                </div>
              </div>

              {/* Spidering & robots.txt */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                  Spidering Rules & Robots.txt Policy
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="input-spidering-allowed"
                      checked={editingSource.spideringAllowed !== false}
                      onChange={(e) => setEditingSource({ ...editingSource, spideringAllowed: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                    />
                    <label htmlFor="input-spidering-allowed" className="text-slate-300 font-medium">
                      Spidering Permitted by Origin
                    </label>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Crawl Delay (Seconds)</label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={editingSource.crawlDelaySeconds ?? 2}
                      onChange={(e) => setEditingSource({ ...editingSource, crawlDelaySeconds: Number(e.target.value) })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Protocol & API Endpoint */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Code className="h-3.5 w-3.5 text-indigo-400" />
                  Access Method & Public API
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Access Protocol</label>
                    <select
                      value={editingSource.accessMethod || "Structured Web Scraper"}
                      onChange={(e) => setEditingSource({ ...editingSource, accessMethod: e.target.value as any })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-white"
                    >
                      <option value="Structured Web Scraper">Structured Web Scraper</option>
                      <option value="Public REST API">Public REST API</option>
                      <option value="GraphQL Endpoint">GraphQL Endpoint</option>
                      <option value="RSS / XML Catalog Feed">RSS / XML Catalog Feed</option>
                      <option value="Manual Verification Only">Manual Verification Only</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="input-has-api"
                      checked={!!editingSource.hasPublicApi}
                      onChange={(e) => setEditingSource({ ...editingSource, hasPublicApi: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                    />
                    <label htmlFor="input-has-api" className="text-slate-300 font-medium">
                      Has Public JSON / REST API
                    </label>
                  </div>
                </div>

                {editingSource.hasPublicApi && (
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">API Endpoint URL</label>
                    <input
                      type="url"
                      value={editingSource.apiEndpoint || ""}
                      onChange={(e) => setEditingSource({ ...editingSource, apiEndpoint: e.target.value })}
                      placeholder="https://api.example.com/v1/listings"
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-white"
                    />
                  </div>
                )}
              </div>

              {/* Rate Metering */}
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Gauge className="h-3.5 w-3.5 text-amber-400" />
                  Traffic Rate-Metering & Throttling Limits
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Max Req / Hour</label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={editingSource.maxRequestsPerHour ?? 60}
                      onChange={(e) => setEditingSource({ ...editingSource, maxRequestsPerHour: Number(e.target.value) })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Burst Limit (req/s)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={editingSource.burstLimit ?? 2}
                      onChange={(e) => setEditingSource({ ...editingSource, burstLimit: Number(e.target.value) })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Throttle (ms)</label>
                    <input
                      type="number"
                      min={500}
                      max={10000}
                      step={100}
                      value={editingSource.throttleDelayMs ?? 2000}
                      onChange={(e) => setEditingSource({ ...editingSource, throttleDelayMs: Number(e.target.value) })}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Description & Rules Summary */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Description & Summary</label>
                <textarea
                  rows={2}
                  value={editingSource.description || ""}
                  onChange={(e) => setEditingSource({ ...editingSource, description: e.target.value })}
                  placeholder="Summary of this inventory portal..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingSource(null);
                  }}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-cyan-500"
                >
                  {editingSource.id ? "Save Changes" : "Create Source Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
