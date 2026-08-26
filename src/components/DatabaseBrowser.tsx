import React, { useState, useEffect, useMemo, useTransition } from "react";
import { 
  EquipmentListing, 
  EquipmentCategory, 
  ListingType, 
  ConditionGrade 
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
  X
} from "lucide-react";

interface DatabaseBrowserProps {
  onSelectListing: (listing: EquipmentListing) => void;
  onAnalyzeMatch: (listing: EquipmentListing) => void;
  onOpenNewListingModal: () => void;
  refreshTrigger?: number;
}

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
  const [selectedCondition, setSelectedCondition] = useState<string>("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"match" | "margin" | "price-desc" | "price-asc" | "newest">("newest");
  const [showFilters, setShowFilters] = useState(false);

  // AI Seed Generator Modal
  const [isAiSeedModalOpen, setIsAiSeedModalOpen] = useState(false);
  const [aiSeedCategory, setAiSeedCategory] = useState<string>("Precision Optics & Lasers");
  const [aiSeedPrompt, setAiSeedPrompt] = useState("");
  const [aiSeedCount, setAiSeedCount] = useState(2);
  const [isGeneratingSeed, setIsGeneratingSeed] = useState(false);

  // Edit Modal State
  const [editingListing, setEditingListing] = useState<EquipmentListing | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
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
    selectedCondition,
    verifiedOnly,
    minPrice,
    maxPrice,
    sortBy,
    refreshTrigger,
  ]);

  // Handle Delete
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Are you sure you want to permanently delete record ${id} from the database?`)) return;

    try {
      await databaseApi.deleteListing(id);
      notify(`Deleted record ${id} from database store.`);
      loadDatabaseData();
    } catch (err: any) {
      notify(`Delete failed: ${err.message}`);
    }
  };

  // Handle Reset DB
  const handleResetDb = async () => {
    if (!confirm("Reset database to initial catalog seed? Custom added records will be replaced.")) return;
    try {
      await databaseApi.resetDatabase();
      notify("Database restored to default factory seed.");
      loadDatabaseData();
    } catch (err: any) {
      notify(`Reset failed: ${err.message}`);
    }
  };

  // Handle AI Seed Generation
  const handleGenerateAiSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingSeed(true);
    try {
      const generated = await databaseApi.seedAiRecords(aiSeedCategory, aiSeedPrompt, aiSeedCount);
      notify(`Successfully generated and inserted ${generated.length} records into database.`);
      setIsAiSeedModalOpen(false);
      setAiSeedPrompt("");
      loadDatabaseData();
    } catch (err: any) {
      notify(`AI Seed generation error: ${err.message}`);
    } finally {
      setIsGeneratingSeed(false);
    }
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;
    try {
      await databaseApi.updateListing(editingListing.id, editingListing);
      notify(`Updated record ${editingListing.id} in database.`);
      setIsEditModalOpen(false);
      setEditingListing(null);
      loadDatabaseData();
    } catch (err: any) {
      notify(`Save error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-900/95 px-4 py-3 text-xs font-mono text-cyan-300 shadow-2xl backdrop-blur-xl">
          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Hero Header & Status Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
              <Database className="h-4 w-4" />
              <span>SERVER DATABASE ENGINE</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">STORE: {dbStatus?.filePath ? "data/normsexchange_db.json" : "Active"}</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Database Explorer & Master Catalog
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Persistent storage repository for all WTB buyer demands, sourced WTS equipment assets, inferred seller dossiers, and arbitrage contracts.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAiSeedModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-2 text-xs font-semibold text-cyan-300 shadow hover:bg-cyan-900/50"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>AI Seed Database</span>
            </button>
            <button
              onClick={onOpenNewListingModal}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Insert Record</span>
            </button>
            <a
              href={databaseApi.getExportUrl()}
              download="normsexchange_database.json"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </a>
            <button
              onClick={handleResetDb}
              title="Reset Database to Default Seed"
              className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-amber-300"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Aggregation Metrics */}
        {stats && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-3 border-t border-slate-800/80 pt-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-mono text-[10px] uppercase text-slate-400">Total DB Records</span>
              <div className="font-mono text-lg font-bold text-white mt-0.5">{stats.totalRecords}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-mono text-[10px] uppercase text-slate-400">WTB Demands</span>
              <div className="font-mono text-lg font-bold text-emerald-400 mt-0.5">{stats.wtbCount}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-mono text-[10px] uppercase text-slate-400">WTS Surplus</span>
              <div className="font-mono text-lg font-bold text-cyan-400 mt-0.5">{stats.wtsCount}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-mono text-[10px] uppercase text-slate-400">Total Catalog Value</span>
              <div className="font-mono text-lg font-bold text-amber-400 mt-0.5">
                ${((stats.totalWtbValue + stats.totalWtsValue) / 1000).toFixed(0)}k
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-mono text-[10px] uppercase text-slate-400">Arbitrage Spread</span>
              <div className="font-mono text-lg font-bold text-indigo-400 mt-0.5">
                ${(stats.totalArbitrageSpread / 1000).toFixed(1)}k
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="font-mono text-[10px] uppercase text-slate-400">Entities Indexed</span>
              <div className="font-mono text-lg font-bold text-purple-400 mt-0.5">{stats.uniqueEntitiesCount} orgs</div>
            </div>
          </div>
        )}
      </div>

      {/* Search, Filter & View Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Main Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search database: Make, Model, Entity, City, Wavelength, Serial, Spec..."
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
            <option value="All">All Categories</option>
            <option value="Precision Optics & Lasers">Precision Optics & Lasers</option>
            <option value="Semiconductor & Cleanroom">Semiconductor & Cleanroom</option>
            <option value="Industrial CNC & Machining">Industrial CNC & Machining</option>
            <option value="Lab & Metrology Testing">Lab & Metrology Testing</option>
            <option value="High-Voltage & Power Systems">High-Voltage & Power Systems</option>
            <option value="Automation & Robotics">Automation & Robotics</option>
            <option value="Aerospace & Avionics Surplus">Aerospace & Avionics Surplus</option>
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
                placeholder="e.g. 10000"
                value={minPrice !== undefined ? minPrice : ""}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full rounded border border-slate-800 bg-slate-950 p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Max Price ($ USD)</label>
              <input
                type="number"
                placeholder="e.g. 150000"
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
          <span className="text-slate-500 mr-1">Quick Filters:</span>
          {["Coherent", "Femtosecond", "Keysight", "DMG MORI", "5-Axis", "Thermo", "Magna-Power", "FANUC", "Cleanroom"].map((tag) => (
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

      {/* Results Header */}
      <div className="flex items-center justify-between font-mono text-xs text-slate-400 px-1">
        <div>
          <span>Showing </span>
          <span className="font-bold text-white">{listings.length}</span>
          <span> database records</span>
          {debouncedQuery && <span> matching "{debouncedQuery}"</span>}
        </div>
        <div className="flex items-center gap-3">
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
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price Target</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Inferred Entity</th>
                <th className="py-3 px-4">Match / Margin</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Database className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                    <p className="font-sans text-sm font-semibold text-white">No records found matching filters</p>
                    <p className="text-xs text-slate-500 mt-1">Try broadening your search query or reset filters.</p>
                  </td>
                </tr>
              ) : (
                listings.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectListing(item)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    {/* Type & ID */}
                    <td className="py-3 px-4 whitespace-nowrap">
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
                    </td>

                    {/* Make & Model */}
                    <td className="py-3 px-4">
                      <div className="font-sans font-bold text-white text-sm">
                        {item.make} {item.model}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {item.year ? `${item.year} • ` : ""}{item.title}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="rounded bg-slate-950 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-white text-sm">
                        ${item.priceTarget?.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Comp: ${item.marketCompAverage?.toLocaleString()}
                      </div>
                    </td>

                    {/* Condition */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-300 text-[11px]">{item.condition}</span>
                    </td>

                    {/* Inferred Entity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-200 font-sans font-medium text-xs truncate max-w-[180px]">
                        <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.contact?.entityName || "Unknown"}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-2.5 w-2.5 text-slate-500 shrink-0" />
                        <span className="truncate">{item.contact?.location || "Global"}</span>
                      </div>
                    </td>

                    {/* Match Score & Arbitrage */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.matchScore ? (
                        <div>
                          <span className="font-bold text-amber-400">{item.matchScore}% Match</span>
                          {item.marginSpreadEstimate ? (
                            <div className="text-[10px] text-emerald-400 font-semibold">
                              +${item.marginSpreadEstimate.toLocaleString()} spread
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectListing(item)}
                          title="Inspect Details"
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingListing({ ...item });
                            setIsEditModalOpen(true);
                          }}
                          title="Edit Database Record"
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-cyan-300"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          title="Delete from Database"
                          className="rounded p-1.5 text-slate-400 hover:bg-rose-950/50 hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODE 2: BENTO GRID VIEW */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectListing(item)}
              className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10 cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                      item.type === "WTB"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                        : "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                    }`}
                  >
                    ● {item.type} {item.type === "WTB" ? "(DEMAND)" : "(SUPPLY)"}
                  </span>
                  <span className="font-mono text-xs font-bold text-white">${item.priceTarget?.toLocaleString()}</span>
                </div>

                <h3 className="mt-2 text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {item.make} {item.model}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-300">{item.title}</p>

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
                <div className="flex items-center gap-1.5 text-slate-300 truncate max-w-[200px]">
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
          ))}
        </div>
      )}

      {/* VIEW MODE 3: RAW JSON DOCUMENT EXPLORER */}
      {viewMode === "raw" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Document List */}
          <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/80 p-3 max-h-[600px] overflow-y-auto space-y-1.5">
            <div className="font-mono text-xs text-slate-400 px-2 py-1 font-bold">DATABASE DOCUMENTS ({listings.length})</div>
            {listings.map((l) => (
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
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5">
                <FileJson className="h-4 w-4 text-cyan-400" />
                <span>Document: {selectedRawItem?.id || "None"}</span>
              </span>
              {selectedRawItem && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedRawItem, null, 2));
                    notify("JSON copied to clipboard!");
                  }}
                  className="rounded bg-slate-800 px-2.5 py-1 text-slate-300 hover:bg-slate-700"
                >
                  Copy JSON
                </button>
              )}
            </div>
            <pre className="mt-3 text-cyan-200 text-[11px] leading-relaxed max-h-[500px] overflow-y-auto">
              {selectedRawItem ? JSON.stringify(selectedRawItem, null, 2) : "Select a document to inspect raw schema"}
            </pre>
          </div>
        </div>
      )}

      {/* AI SEED GENERATOR MODAL */}
      {isAiSeedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-slate-900 p-6 md:p-8 shadow-2xl space-y-4">
            <button
              onClick={() => setIsAiSeedModalOpen(false)}
              className="absolute right-5 top-5 rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
              <Sparkles className="h-4 w-4" />
              <span>GEMINI 3.7 FLASH DATABASE CURATOR</span>
            </div>

            <h2 className="text-xl font-bold text-white">AI-Generate Authentic Equipment Records</h2>
            <p className="text-xs text-slate-300">
              Leverage Gemini to synthesize high-fidelity industrial assets with realistic pricing, deep specs, and inferred contact dossiers directly into your database.
            </p>

            <form onSubmit={handleGenerateAiSeed} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Target Category</label>
                <select
                  value={aiSeedCategory}
                  onChange={(e) => setAiSeedCategory(e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white"
                >
                  <option value="Precision Optics & Lasers">Precision Optics & Lasers</option>
                  <option value="Semiconductor & Cleanroom">Semiconductor & Cleanroom</option>
                  <option value="Industrial CNC & Machining">Industrial CNC & Machining</option>
                  <option value="Lab & Metrology Testing">Lab & Metrology Testing</option>
                  <option value="High-Voltage & Power Systems">High-Voltage & Power Systems</option>
                  <option value="Automation & Robotics">Automation & Robotics</option>
                  <option value="Aerospace & Avionics Surplus">Aerospace & Avionics Surplus</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Custom Requirements / Parameters (Optional)</label>
                <textarea
                  rows={3}
                  value={aiSeedPrompt}
                  onChange={(e) => setAiSeedPrompt(e.target.value)}
                  placeholder="e.g. 5-Axis milling centers with Siemens 840D control in Europe, or high-power picosecond lasers..."
                  className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white font-sans focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Number of Records to Insert</label>
                <select
                  value={aiSeedCount}
                  onChange={(e) => setAiSeedCount(Number(e.target.value))}
                  className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white"
                >
                  <option value={1}>1 Record</option>
                  <option value={2}>2 Records</option>
                  <option value={3}>3 Records</option>
                  <option value={5}>5 Records</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAiSeedModalOpen(false)}
                  className="rounded bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingSeed}
                  className="flex items-center gap-1.5 rounded bg-gradient-to-r from-cyan-500 to-indigo-500 px-5 py-2 font-bold text-slate-950 shadow hover:brightness-110 disabled:opacity-50"
                >
                  <Sparkles className={`h-4 w-4 ${isGeneratingSeed ? "animate-spin" : ""}`} />
                  <span>{isGeneratingSeed ? "Synthesizing..." : "Generate & Insert into DB"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RECORD MODAL */}
      {isEditModalOpen && editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-5 top-5 rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-lg font-bold text-white">Edit Database Record: {editingListing.id}</h2>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={editingListing.title}
                  onChange={(e) => setEditingListing({ ...editingListing, title: e.target.value })}
                  className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Make</label>
                  <input
                    type="text"
                    value={editingListing.make}
                    onChange={(e) => setEditingListing({ ...editingListing, make: e.target.value })}
                    className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Model</label>
                  <input
                    type="text"
                    value={editingListing.model}
                    onChange={(e) => setEditingListing({ ...editingListing, model: e.target.value })}
                    className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Price Target ($ USD)</label>
                  <input
                    type="number"
                    value={editingListing.priceTarget}
                    onChange={(e) => setEditingListing({ ...editingListing, priceTarget: Number(e.target.value) })}
                    className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-emerald-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Condition</label>
                  <input
                    type="text"
                    value={editingListing.condition}
                    onChange={(e) => setEditingListing({ ...editingListing, condition: e.target.value as any })}
                    className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Inferred Entity Name</label>
                <input
                  type="text"
                  value={editingListing.contact?.entityName || ""}
                  onChange={(e) => setEditingListing({
                    ...editingListing,
                    contact: { ...editingListing.contact, entityName: e.target.value }
                  })}
                  className="w-full rounded border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-cyan-600 px-5 py-2 font-bold text-white hover:bg-cyan-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
