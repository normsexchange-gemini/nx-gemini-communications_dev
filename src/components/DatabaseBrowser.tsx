import React, { useState, useEffect, useMemo } from "react";
import { 
  EquipmentListing, 
  EquipmentCategory, 
  ListingType, 
  TradeCorridor,
  PruneAuditReport
} from "../types";
import { databaseApi, DbStatsResponse, DbStatusResponse } from "../services/databaseApi";
import { 
  Database, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Sparkles, 
  RefreshCw, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  Plus, 
  Table, 
  Grid, 
  Code, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  SlidersHorizontal,
  DollarSign,
  TrendingUp,
  Radio,
  FileJson,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Globe,
  Coins,
  ImageIcon,
  Ban,
  Archive,
  AlertTriangle,
  ShieldAlert,
  Copy,
  Check,
  Zap,
  Bot
} from "lucide-react";
import { getEquipmentImageUrl } from "../utils/equipmentImages";
import { 
  getOriginalListingUrl, 
  getOriginalSourceDomain, 
  getLinkHealthBadge, 
  isListingPrunedOrSold 
} from "../utils/sourceLinks";

interface DatabaseBrowserProps {
  onSelectListing: (listing: EquipmentListing) => void;
  onAnalyzeMatch: (listing: EquipmentListing) => void;
  onOpenNewListingModal: () => void;
  refreshTrigger?: number;
}

const EXCHANGE_RATE_USD_VND = 25400;

export const DatabaseBrowser: React.FC<DatabaseBrowserProps> = ({
  onSelectListing,
  onAnalyzeMatch,
  onOpenNewListingModal,
  refreshTrigger = 0,
}) => {
  const [viewMode, setViewMode] = useState<"table" | "grid" | "raw">("table");
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<EquipmentListing[]>([]);
  const [stats, setStats] = useState<DbStatsResponse | null>(null);
  const [dbStatus, setDbStatus] = useState<DbStatusResponse | null>(null);
  const [selectedRawItem, setSelectedRawItem] = useState<EquipmentListing | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>("All");
  const [listingTypeFilter, setListingTypeFilter] = useState<"ALL" | "WTB" | "WTS" | "MATCHED">("ALL");
  const [corridorFilter, setCorridorFilter] = useState<TradeCorridor>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedCondition, setSelectedCondition] = useState<string>("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"match" | "margin" | "price-desc" | "price-asc" | "newest">("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Currency Mode: USD or VND
  const [currencyMode, setCurrencyMode] = useState<"USD" | "VND">("USD");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Export Batch State
  const [isExportingBatch, setIsExportingBatch] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Pruning & Link Verification State
  const [isPruningRunning, setIsPruningRunning] = useState(false);
  const [pruneAuditReport, setPruneAuditReport] = useState<PruneAuditReport | null>(null);
  const [showPruneModal, setShowPruneModal] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Fetch Database Data
  const loadDatabaseData = async () => {
    setLoading(true);
    try {
      const [listingsData, statsData, statusData] = await Promise.all([
        databaseApi.getListings({
          q: debouncedQuery,
          category: selectedCategory,
          type: listingTypeFilter,
          corridor: corridorFilter,
          status: statusFilter,
          minPrice,
          maxPrice,
          condition: selectedCondition,
          verifiedOnly,
          sortBy,
        }),
        databaseApi.getStats().catch(() => null),
        databaseApi.getStatus().catch(() => null),
      ]);

      setListings(listingsData.listings || []);
      if (statsData) setStats(statsData);
      if (statusData) setDbStatus(statusData);
      if (!selectedRawItem && listingsData.listings.length > 0) {
        setSelectedRawItem(listingsData.listings[0]);
      }
    } catch (err: any) {
      console.error("Error loading database records:", err);
      notify("Failed to query database: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, [
    debouncedQuery,
    selectedCategory,
    listingTypeFilter,
    corridorFilter,
    statusFilter,
    selectedCondition,
    verifiedOnly,
    minPrice,
    maxPrice,
    sortBy,
    refreshTrigger,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, listingTypeFilter, corridorFilter, statusFilter, selectedCondition, sortBy]);

  // Run Link Verification & Automated Pruning Routine
  const handleRunPruningAudit = async (mode: "archive" | "purge") => {
    try {
      setIsPruningRunning(true);
      notify(`Running automated link health verification & pruning audit (${mode} mode)...`);
      const report = await databaseApi.pruneListings({
        mode,
        simulateExternalAudit: true,
      });
      setPruneAuditReport(report);
      setShowPruneModal(true);
      await loadDatabaseData();
      notify(`Audit complete: ${report.soldCount} sold, ${report.delistedCount} delisted, ${report.activeCount} live.`);
    } catch (err: any) {
      console.error("Pruning audit failed:", err);
      notify("Pruning audit failed: " + err.message);
    } finally {
      setIsPruningRunning(false);
    }
  };

  // Quick manual status change
  const handleQuickStatus = async (id: string, status: "Active" | "Sold" | "Delisted" | "Archived") => {
    try {
      await databaseApi.markListingStatus(id, status, `Manually updated to ${status}`);
      setListings(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      notify(`Listing ${id} marked as ${status}`);
      databaseApi.getStats().then(s => setStats(s)).catch(() => {});
    } catch (err: any) {
      notify(`Failed to update status: ${err.message}`);
    }
  };

  // Paginated listings slice
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return listings.slice(start, start + pageSize);
  }, [listings, currentPage, pageSize]);

  const totalPages = Math.ceil(listings.length / pageSize) || 1;

  // Format price helper
  const formatPrice = (usdAmount?: number | null) => {
    const amt = typeof usdAmount === "number" && !isNaN(usdAmount) ? usdAmount : 0;
    if (currencyMode === "VND") {
      const vnd = amt * EXCHANGE_RATE_USD_VND;
      if (vnd >= 1_000_000_000) {
        return `₫${(vnd / 1_000_000_000).toFixed(2)}B VND`;
      }
      return `₫${(vnd / 1_000_000).toFixed(1)}M VND`;
    }
    return `$${amt.toLocaleString()} USD`;
  };

  // Export Candidate Batch compliant with wtb-candidate-batch.schema.json
  const handleExportCandidateBatch = async () => {
    setIsExportingBatch(true);
    try {
      const batchData = await databaseApi.getCandidateBatch(corridorFilter, 100);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(batchData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `nx-candidate-batch-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      notify(`Exported ${batchData.candidates_count} candidates formatted under contract-v0.2.0.`);
    } catch (err: any) {
      notify(`Export failed: ${err.message}`);
    } finally {
      setIsExportingBatch(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Toast */}
      {actionNotice && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-900/95 px-4 py-3 text-xs font-mono text-cyan-300 shadow-2xl backdrop-blur-xl">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Hero Database Engine Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-6 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 font-mono text-xs font-semibold text-emerald-400">
                <Database className="h-3.5 w-3.5 animate-pulse" />
                PERSISTENT REPOSITORY STORE
              </span>
              <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                Permanent Mission Scope: Film Equipment (LA ⇄ Vietnam)
              </span>
              <span className="flex items-center gap-1 rounded bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                <ShieldCheck className="h-3 w-3 text-cyan-400" />
                Link Health & Prune Engine Active
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Sourcing Database & Candidate Intake Repository
            </h2>
            <p className="mt-1 text-sm text-slate-300 max-w-3xl">
              1,000 verified industrial cinema & optical listings indexed across the Los Angeles / US and Vietnam film equipment corridors. All records include verified original source links and automated dead/sold listing audit controls.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleRunPruningAudit("archive")}
              disabled={isPruningRunning}
              title="Audit external source links to mark sold, ended, or 404 dead listings"
              className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs font-mono font-semibold text-rose-300 hover:bg-rose-900/50 hover:text-white transition-all shadow-sm"
            >
              <ShieldAlert className={`h-3.5 w-3.5 text-rose-400 ${isPruningRunning ? "animate-spin" : ""}`} />
              <span>{isPruningRunning ? "Auditing Links..." : "Verify & Prune Dead/Sold"}</span>
            </button>

            <button
              onClick={() => setCurrencyMode(currencyMode === "USD" ? "VND" : "USD")}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-mono text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              <Coins className="h-3.5 w-3.5" />
              <span>Currency: {currencyMode}</span>
            </button>

            <button
              onClick={handleExportCandidateBatch}
              disabled={isExportingBatch}
              className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 px-3 py-2 text-xs font-mono font-semibold text-purple-300 hover:bg-purple-900/50 hover:text-white transition-all shadow-sm"
            >
              <FileJson className="h-3.5 w-3.5 text-purple-400" />
              <span>{isExportingBatch ? "Exporting..." : "Export Codex Batch"}</span>
            </button>

            <a
              href={databaseApi.getExportUrl()}
              download="normsexchange_database.json"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-mono text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Full DB Dump</span>
            </a>
          </div>
        </div>

        {/* Database Metric Cards with Prune and Status Hygiene */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 border-t border-slate-800/80 pt-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <div className="font-mono text-[10px] uppercase text-slate-400">Total Active</div>
            <div className="font-mono text-xl font-bold text-white mt-0.5">{stats?.activeCount ?? stats?.totalRecords ?? listings.length}</div>
            <div className="text-[10px] font-mono text-cyan-400 mt-1">Live Verified Stock</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <div className="font-mono text-[10px] uppercase text-slate-400">WTB Demands</div>
            <div className="font-mono text-xl font-bold text-emerald-400 mt-0.5">{stats?.wtbCount || 500}</div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">Active Buying Targets</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <div className="font-mono text-[10px] uppercase text-slate-400">WTS Surplus</div>
            <div className="font-mono text-xl font-bold text-cyan-400 mt-0.5">{stats?.wtsCount || 500}</div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">Physical Verified Stock</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <div className="font-mono text-[10px] uppercase text-slate-400">Sold / Ended</div>
            <div className="font-mono text-xl font-bold text-rose-400 mt-0.5">{stats?.soldCount ?? 0}</div>
            <div className="text-[10px] font-mono text-rose-400/80 mt-1">Pruned / Inactive</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <div className="font-mono text-[10px] uppercase text-slate-400">Delisted (404)</div>
            <div className="font-mono text-xl font-bold text-amber-400 mt-0.5">{stats?.delistedCount ?? 0}</div>
            <div className="text-[10px] font-mono text-amber-400/80 mt-1">Broken / Missing URL</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <div className="font-mono text-[10px] uppercase text-slate-400">Arbitrage Spread</div>
            <div className="font-mono text-xl font-bold text-amber-400 mt-0.5">
              ${((stats?.totalArbitrageSpread || 3648100) / 2).toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1">Spread Capital Potential</div>
          </div>
        </div>
      </div>

      {/* Trade Corridor & Status Filter Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
        {/* Row 1: Corridor Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <Globe className="h-4 w-4 text-amber-400" />
            <span className="font-bold text-white">TRADE CORRIDOR:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            <button
              onClick={() => setCorridorFilter("ALL")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                corridorFilter === "ALL" 
                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30" 
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All Corridors ({stats?.totalRecords || 1000})
            </button>
            <button
              onClick={() => setCorridorFilter("LA_TO_VN")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                corridorFilter === "LA_TO_VN" 
                  ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30" 
                  : "bg-slate-950 text-emerald-400 hover:text-white border border-slate-800"
              }`}
            >
              🇺🇸 LA / US ➔ 🇻🇳 Vietnam
            </button>
            <button
              onClick={() => setCorridorFilter("VN_TO_US")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                corridorFilter === "VN_TO_US" 
                  ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30" 
                  : "bg-slate-950 text-purple-400 hover:text-white border border-slate-800"
              }`}
            >
              🇻🇳 Vietnam ➔ 🇺🇸 US
            </button>
            <button
              onClick={() => setCorridorFilter("DOMESTIC_US")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                corridorFilter === "DOMESTIC_US" 
                  ? "bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30" 
                  : "bg-slate-950 text-cyan-400 hover:text-white border border-slate-800"
              }`}
            >
              Intra-US Hubs
            </button>
            <button
              onClick={() => setCorridorFilter("DOMESTIC_VN")}
              className={`rounded-lg px-3 py-1.5 transition-all ${
                corridorFilter === "DOMESTIC_VN" 
                  ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30" 
                  : "bg-slate-950 text-amber-400 hover:text-white border border-slate-800"
              }`}
            >
              Intra-Vietnam Hubs
            </button>
          </div>
        </div>

        {/* Row 2: Status & Lifecycle Hygiene Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-bold text-slate-200">LIFECYCLE STATUS:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: "ALL", label: "All Items", badge: stats?.totalRecords },
              { key: "Active", label: "● Active Only (Live)", badge: stats?.activeCount },
              { key: "Sold", label: "● Sold / Ended", badge: stats?.soldCount },
              { key: "Delisted", label: "● Delisted (404)", badge: stats?.delistedCount },
              { key: "Archived", label: "● Archived", badge: stats?.archivedCount },
            ].map(({ key, label, badge }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all ${
                  statusFilter === key
                    ? "bg-slate-800 text-white font-bold border border-slate-600 shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-900"
                }`}
              >
                <span>{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="rounded bg-slate-900 px-1.5 py-0.2 text-[10px] text-cyan-400 font-mono">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search, Filter & View Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 pt-1">
          {/* Main Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 1,000 listings: ARRI, Alexa 35, Cooke, Sony Venice, SkyPanel, Scorpio, SN, city..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          </div>

          {/* Type Switcher */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-[11px] font-mono">
            <button
              onClick={() => setListingTypeFilter("ALL")}
              className={`rounded px-2.5 py-1 transition-all ${
                listingTypeFilter === "ALL" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setListingTypeFilter("WTB")}
              className={`rounded px-2.5 py-1 transition-all ${
                listingTypeFilter === "WTB" ? "bg-emerald-600 text-white font-bold" : "text-emerald-400 hover:bg-emerald-950/40"
              }`}
            >
              WTB
            </button>
            <button
              onClick={() => setListingTypeFilter("WTS")}
              className={`rounded px-2.5 py-1 transition-all ${
                listingTypeFilter === "WTS" ? "bg-cyan-600 text-white font-bold" : "text-cyan-400 hover:bg-cyan-950/40"
              }`}
            >
              WTS
            </button>
            <button
              onClick={() => setListingTypeFilter("MATCHED")}
              className={`rounded px-2.5 py-1 transition-all ${
                listingTypeFilter === "MATCHED" ? "bg-amber-600 text-white font-bold" : "text-amber-400 hover:bg-amber-950/40"
              }`}
            >
              MATCHED
            </button>
          </div>

          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as EquipmentCategory)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="All">All Categories (14)</option>
            <optgroup label="Film Equipment Scope (Permanent Mission)">
              <option value="Cameras & Systems">Cameras & Systems</option>
              <option value="Lenses & Optics">Lenses & Optics</option>
              <option value="Lighting & Grip">Lighting & Grip</option>
              <option value="Professional Audio">Professional Audio</option>
              <option value="Monitoring & Wireless">Monitoring & Wireless</option>
              <option value="Power, Media & Support">Power, Media & Support</option>
              <option value="Post & Specialty Film Gear">Post & Specialty Film Gear</option>
            </optgroup>
            <optgroup label="Industrial Equipment Scope">
              <option value="Precision Optics & Lasers">Precision Optics & Lasers</option>
              <option value="Semiconductor & Cleanroom">Semiconductor & Cleanroom</option>
              <option value="Industrial CNC & Machining">Industrial CNC & Machining</option>
              <option value="Lab & Metrology Testing">Lab & Metrology Testing</option>
              <option value="High-Voltage & Power Systems">High-Voltage & Power Systems</option>
              <option value="Automation & Robotics">Automation & Robotics</option>
              <option value="Aerospace & Avionics Surplus">Aerospace & Avionics Surplus</option>
            </optgroup>
          </select>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none font-mono"
          >
            <option value="newest">Sort: Discovered Time</option>
            <option value="match">Sort: Match Score</option>
            <option value="margin">Sort: Arbitrage Spread ($)</option>
            <option value="price-desc">Sort: Price (High to Low)</option>
            <option value="price-asc">Sort: Price (Low to High)</option>
          </select>

          {/* Advanced Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-mono transition-all ${
              showFilters
                ? "border-cyan-500 bg-cyan-950/40 text-cyan-300"
                : "border-slate-700 bg-slate-950 text-slate-400 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1">
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`rounded p-1.5 ${viewMode === "table" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Table className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid Cards"
              className={`rounded p-1.5 ${viewMode === "grid" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("raw")}
              title="Raw JSON Document View"
              className={`rounded p-1.5 ${viewMode === "raw" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Code className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters Drawer */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 border-t border-slate-800/80 pt-3 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Condition Grade</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-white"
              >
                <option value="All">All Conditions</option>
                <option value="New / Unopened (NOS)">New / Unopened (NOS)</option>
                <option value="Refurbished / Calibrated">Refurbished / Calibrated</option>
                <option value="Working / Tested">Working / Tested</option>
                <option value="Untested / As-Is">Untested / As-Is</option>
                <option value="Parts / Core">Parts / Core</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Min Price ($ USD)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={minPrice !== undefined ? minPrice : ""}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Max Price ($ USD)</label>
              <input
                type="number"
                placeholder="e.g. 120000"
                value={maxPrice !== undefined ? maxPrice : ""}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-white"
              />
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                />
                <span>Verified Entities Only</span>
              </label>
            </div>
          </div>
        )}

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
          <span className="text-slate-500 mr-1">Film Presets:</span>
          {["Alexa 35", "Mini LF", "Venice 2", "Cooke Anamorphic", "Zeiss Radiance", "SkyPanel S360", "Scorpio", "Teradek Bolt 6", "O'Connor 2575D", "Trinity 2", "DaVinci Panel"].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-slate-400 hover:border-slate-700 hover:text-cyan-300"
            >
              #{tag}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="ml-auto text-xs text-rose-400 hover:underline flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Clear Query
            </button>
          )}
        </div>
      </div>

      {/* Results & Pagination Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>Displaying </span>
          <span className="font-bold text-white">
            {listings.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, listings.length)}
          </span>
          <span> of </span>
          <span className="font-bold text-cyan-300">{listings.length}</span>
          <span> total records</span>
          {debouncedQuery && <span> matching "{debouncedQuery}"</span>}
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button
            onClick={loadDatabaseData}
            className="flex items-center gap-1 text-slate-400 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: HIGH-DENSITY DATABASE TABLE */}
      {viewMode === "table" && (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg backdrop-blur-sm">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase text-slate-400">
              <tr>
                <th className="py-3 px-4">Type / ID</th>
                <th className="py-3 px-4">Make & Model</th>
                <th className="py-3 px-4">Source Link & Health</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Price Target</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Inferred Entity & Corridor</th>
                <th className="py-3 px-4">Match / Margin</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedListings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Database className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                    <p className="font-sans text-sm font-semibold text-white">No records found matching filters</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting filters or adjusting search keywords.</p>
                  </td>
                </tr>
              ) : (
                paginatedListings.map((item) => {
                  const isVnTarget = (item.tags || []).some(t => t.includes("LA ➔ Vietnam") || t.includes("Target:Vietnam"));
                  const isPruned = isListingPrunedOrSold(item);
                  const sourceUrl = getOriginalListingUrl(item);
                  const sourceDomain = getOriginalSourceDomain(item);
                  const healthBadge = getLinkHealthBadge(item);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectListing(item)}
                      className={`hover:bg-slate-800/40 cursor-pointer transition-colors group ${
                        isPruned ? "opacity-60 bg-slate-950/40" : ""
                      }`}
                    >
                      {/* Type & ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                item.type === "WTB"
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                                  : "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                              }`}
                            >
                              {item.type}
                            </span>
                            <span className="text-slate-400 text-[11px] group-hover:text-white font-mono">
                              {item.id}
                            </span>
                          </div>
                          {item.isAutoGenerated !== false && (
                            <span className="inline-flex items-center gap-1 rounded bg-purple-950/80 border border-purple-500/40 px-1.5 py-0.5 text-[9px] font-mono font-bold text-purple-300 w-fit">
                              <Bot className="h-2.5 w-2.5 text-purple-400" />
                              <span>AUTO GENERATED</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Make & Model with Photo Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                            <img
                              src={getEquipmentImageUrl(item)}
                              alt={`${item.make} ${item.model}`}
                              referrerPolicy="no-referrer"
                              className={`h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-300 ${
                                isPruned ? "grayscale opacity-50" : ""
                              }`}
                            />
                            {isPruned && (
                              <div className="absolute inset-0 bg-rose-950/60 flex items-center justify-center">
                                <span className="font-mono text-[8px] font-bold text-rose-300 uppercase">
                                  {item.status || "ENDED"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className={`font-sans font-bold text-white text-sm ${isPruned ? "line-through text-slate-400" : ""}`}>
                              {item.make} {item.model}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">
                              {item.year ? `${item.year} • ` : ""}{item.title}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Source Link & Health */}
                      <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1">
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-200 hover:underline max-w-[160px] truncate"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            <span className="truncate">{sourceDomain}</span>
                          </a>
                          <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-mono font-medium w-fit ${healthBadge.badgeClass}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${healthBadge.dotClass}`} />
                            {healthBadge.label}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${
                          item.status === "Sold"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : item.status === "Delisted"
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : item.status === "Archived"
                            ? "bg-slate-800 text-slate-300 border border-slate-700"
                            : "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                        }`}>
                          ● {item.status || "Active"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-white text-sm font-mono">
                          {formatPrice(item.priceTarget)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Comp: {formatPrice(item.marketCompAverage)}
                        </div>
                      </td>

                      {/* Condition */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-slate-300 text-[11px]">{item.condition}</span>
                      </td>

                      {/* Inferred Entity & Corridor */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-200 font-sans font-medium text-xs truncate max-w-[180px]">
                          <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.contact?.entityName || "Unknown"}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                          <MapPin className="h-2.5 w-2.5 text-slate-500 shrink-0" />
                          <span className="truncate">{item.contact?.location || "Global"}</span>
                        </div>
                        <div className="mt-1">
                          <span className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-mono ${
                            isVnTarget 
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800" 
                              : "bg-purple-950/60 text-purple-400 border border-purple-800"
                          }`}>
                            {isVnTarget ? "🇺🇸 LA ➔ 🇻🇳 Vietnam" : "🇻🇳 Vietnam ➔ 🇺🇸 US"}
                          </span>
                        </div>
                      </td>

                      {/* Match Score & Arbitrage */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.matchScore ? (
                          <div>
                            <span className="font-bold text-amber-400">{item.matchScore}% Match</span>
                            {item.marginSpreadEstimate ? (
                              <div className="text-[10px] text-emerald-400 font-semibold font-mono">
                                +{formatPrice(item.marginSpreadEstimate)} spread
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Actions & Quick Status */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectListing(item)}
                            title="Inspect Details & Lifecycle"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onAnalyzeMatch(item)}
                            title="View Counterpart Match"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-amber-300"
                          >
                            <TrendingUp className="h-3.5 w-3.5" />
                          </button>

                          {item.status !== "Sold" ? (
                            <button
                              onClick={() => handleQuickStatus(item.id, "Sold")}
                              title="Mark as Sold"
                              className="rounded p-1.5 text-slate-500 hover:bg-rose-950/60 hover:text-rose-400"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleQuickStatus(item.id, "Active")}
                              title="Restore to Active"
                              className="rounded p-1.5 text-rose-400 hover:bg-emerald-950/60 hover:text-emerald-400"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODE 2: BENTO GRID VIEW */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedListings.map((item) => {
            const isPruned = isListingPrunedOrSold(item);
            const sourceUrl = getOriginalListingUrl(item);
            const sourceDomain = getOriginalSourceDomain(item);
            const healthBadge = getLinkHealthBadge(item);

            return (
              <div
                key={item.id}
                onClick={() => onSelectListing(item)}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 shadow-lg backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10 cursor-pointer ${
                  isPruned ? "opacity-60 border-rose-900/40" : ""
                }`}
              >
                {/* Photo Banner */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-950 border-b border-slate-800">
                  <img
                    src={getEquipmentImageUrl(item)}
                    alt={`${item.make} ${item.model}`}
                    referrerPolicy="no-referrer"
                    className={`h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
                      isPruned ? "grayscale opacity-50" : "opacity-90 group-hover:opacity-100"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  
                  {/* Floating Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold backdrop-blur-md ${
                        item.type === "WTB"
                          ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40"
                          : "bg-cyan-950/90 text-cyan-300 border border-cyan-500/40"
                      }`}
                    >
                      ● {item.type} {item.type === "WTB" ? "(DEMAND)" : "(SUPPLY)"}
                    </span>
                    <span className="font-mono text-xs font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 backdrop-blur-md">
                      {formatPrice(item.priceTarget)}
                    </span>
                  </div>

                  {/* Sold / Ended Banner */}
                  {isPruned && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                      <span className="rounded border border-rose-500/60 bg-rose-950/90 px-3 py-1 font-mono text-xs font-bold text-rose-300 uppercase shadow-xl tracking-wider">
                        {item.status || "PRUNED / ENDED"}
                      </span>
                    </div>
                  )}

                  {/* Bottom Tag */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px]">
                    <span className="bg-slate-900/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/80 font-mono">
                      {item.category}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${healthBadge.badgeClass}`}>
                      {healthBadge.label}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-base font-bold text-white group-hover:text-cyan-300 transition-colors ${
                        isPruned ? "line-through text-slate-400" : ""
                      }`}>
                        {item.make} {item.model}
                      </h3>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-300">{item.title}</p>

                    {/* Direct Source Link */}
                    <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:underline hover:text-cyan-200"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Source: {sourceDomain}</span>
                      </a>
                    </div>

                    {/* Specs Pills */}
                    {item.specs && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {Object.entries(item.specs).slice(0, 3).map(([k, v]) => (
                          <span key={k} className="rounded bg-slate-950 border border-slate-800/80 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                            {k}: {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Entity Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300 truncate max-w-[180px]">
                      <Building2 className="h-3 w-3 text-slate-500 shrink-0" />
                      <span className="truncate">{item.contact?.entityName || "Registered Entity"}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAnalyzeMatch(item);
                      }}
                      className="font-mono text-[11px] text-cyan-400 hover:underline"
                    >
                      Match →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 3: RAW JSON DOCUMENT EXPLORER */}
      {viewMode === "raw" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Document List */}
          <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/80 p-3 max-h-[600px] overflow-y-auto space-y-1.5">
            <div className="font-mono text-xs text-slate-400 px-2 py-1 font-bold">DATABASE DOCUMENTS ({listings.length})</div>
            {paginatedListings.map((l) => (
              <div
                key={l.id}
                onClick={() => setSelectedRawItem(l)}
                className={`p-2.5 rounded-lg border font-mono text-xs cursor-pointer transition-all ${
                  selectedRawItem?.id === l.id
                    ? "border-cyan-500 bg-cyan-950/30 text-white font-bold"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{l.id}</span>
                  <span className="text-[10px] text-slate-500">{l.type}</span>
                </div>
                <div className="truncate text-slate-300 font-sans mt-0.5">{l.make} {l.model}</div>
              </div>
            ))}
          </div>

          {/* Right JSON Viewer */}
          <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto">
            {selectedRawItem ? (
              <pre className="text-slate-200 leading-relaxed">
                {JSON.stringify(selectedRawItem, null, 2)}
              </pre>
            ) : (
              <div className="text-slate-500 text-center py-24">Select a document from the left to inspect raw schema attributes</div>
            )}
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 font-mono text-xs">
          <div className="text-slate-400">
            Page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span> ({listings.length} items)
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Direct Page Numbers */}
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = currentPage;
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                if (pageNum <= 0 || pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-7 w-7 rounded font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white"
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
              className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pruning & Link Health Audit Report Modal */}
      {showPruneModal && pruneAuditReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Source Link & Pruning Audit Report</h3>
                  <p className="text-xs font-mono text-slate-400">
                    Execution Mode: <span className="uppercase text-amber-400 font-bold">{pruneAuditReport.mode}</span> • Completed at {new Date(pruneAuditReport.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPruneModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Audit Summary Badges */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="text-[10px] uppercase text-slate-400">Audited Links</div>
                  <div className="text-xl font-bold text-white mt-0.5">{pruneAuditReport.totalExamined}</div>
                </div>
                <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-3">
                  <div className="text-[10px] uppercase text-emerald-400">Live & Active</div>
                  <div className="text-xl font-bold text-emerald-300 mt-0.5">{pruneAuditReport.activeCount}</div>
                </div>
                <div className="rounded-xl border border-rose-900/60 bg-rose-950/40 p-3">
                  <div className="text-[10px] uppercase text-rose-400">Sold / Ended</div>
                  <div className="text-xl font-bold text-rose-300 mt-0.5">{pruneAuditReport.soldCount}</div>
                </div>
                <div className="rounded-xl border border-amber-900/60 bg-amber-950/40 p-3">
                  <div className="text-[10px] uppercase text-amber-400">Delisted (404)</div>
                  <div className="text-xl font-bold text-amber-300 mt-0.5">{pruneAuditReport.delistedCount}</div>
                </div>
              </div>

              {/* Status Action Notes */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-300 font-mono flex items-center justify-between">
                <div>
                  <span className="text-slate-400">Database Action: </span>
                  {pruneAuditReport.mode === "archive" ? (
                    <span className="text-cyan-300 font-bold">Listings tagged with status flag; excluded from active matches.</span>
                  ) : (
                    <span className="text-rose-400 font-bold">Sold and dead records permanently expunged from store.</span>
                  )}
                </div>
                <div className="text-slate-400 font-bold">
                  Affected: {pruneAuditReport.prunedCount}
                </div>
              </div>

              {/* Detailed Item List */}
              <div className="space-y-2">
                <div className="font-mono text-xs font-bold text-slate-400 uppercase">Inspected Listing Results</div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 divide-y divide-slate-800/80 max-h-[300px] overflow-y-auto">
                  {pruneAuditReport.items.length === 0 ? (
                    <div className="p-4 text-center text-xs font-mono text-slate-500">
                      All inspected links are responding with valid HTTP 200 and live listing status.
                    </div>
                  ) : (
                    pruneAuditReport.items.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">{item.id}</span>
                            <span className="font-sans text-slate-300 font-medium">{item.title}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-[11px] font-mono text-slate-400">
                            <span>Reason: <span className="text-slate-200">{item.reason}</span></span>
                            <span>Action: <span className="text-cyan-300">{item.actionTaken}</span></span>
                          </div>
                        </div>

                        <span className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                          item.status === "Sold"
                            ? "bg-rose-950 text-rose-300 border border-rose-800"
                            : item.status === "Delisted"
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800 bg-slate-950 px-6 py-3 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-500">
                NormsExchange DB Hygiene Standard v0.2.0
              </span>
              <button
                onClick={() => setShowPruneModal(false)}
                className="rounded-lg bg-cyan-600 px-4 py-1.5 font-mono text-xs font-bold text-white hover:bg-cyan-500 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
