import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  EquipmentListing, 
  EquipmentCategory, 
  ListingType, 
  WTBRequest,
  MarketDepthItem 
} from "./types";
import { databaseApi, DbStatsResponse } from "./services/databaseApi";
import { Navbar } from "./components/Navbar";
import { MarketTicker } from "./components/MarketTicker";
import { EquipmentCard } from "./components/EquipmentCard";
import { DatabaseBrowser } from "./components/DatabaseBrowser";
import { SourcingScanner } from "./components/SourcingScanner";
import { AutonomousScannerFeed } from "./components/AutonomousScannerFeed";
import { MatchArbitrageConsole } from "./components/MatchArbitrageConsole";
import { GitOutboxConsole } from "./components/GitOutboxConsole";
import { EquipmentDetailModal } from "./components/EquipmentDetailModal";
import { NewListingModal } from "./components/NewListingModal";
import { AINormsArchitect } from "./components/AINormsArchitect";
import { GoalConsole } from "./components/GoalConsole";
import { SourcesManager } from "./components/SourcesManager";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  TrendingUp, 
  Sparkles, 
  Radio, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  Building2, 
  PlusCircle, 
  CheckCircle2,
  Database,
  Server
} from "lucide-react";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<
    "exchange" | "database" | "sources" | "wtb-demands" | "autonomous-feed" | "sourcing-scanner" | "matches" | "git-outbox" | "operating-norms" | "goals"
  >("exchange");


  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>("All");
  const [listingTypeFilter, setListingTypeFilter] = useState<"ALL" | "WTB" | "WTS" | "MATCHED">("ALL");
  const [sortBy, setSortBy] = useState<"margin" | "match" | "price-desc" | "price-asc" | "newest">("match");

  // Database State
  const [listings, setListings] = useState<EquipmentListing[]>([]);
  const [dbStats, setDbStats] = useState<DbStatsResponse | null>(null);
  const [marketDepth, setMarketDepth] = useState<MarketDepthItem[]>([]);
  const [dispatchedContracts, setDispatchedContracts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Modal State
  const [selectedListing, setSelectedListing] = useState<EquipmentListing | null>(null);
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Primary Database Loader
  const loadDatabase = useCallback(async () => {
    try {
      const [listingsData, statsData, depthData, outboxData] = await Promise.all([
        databaseApi.getListings(),
        databaseApi.getStats().catch(() => null),
        databaseApi.getMarketDepth().catch(() => []),
        databaseApi.getOutbox().catch(() => []),
      ]);

      setListings(listingsData.listings || []);
      if (statsData) setDbStats(statsData);
      if (depthData && depthData.length > 0) setMarketDepth(depthData);
      if (outboxData) setDispatchedContracts(outboxData);
    } catch (err: any) {
      console.error("Database sync error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatabase();
  }, [loadDatabase, refreshTrigger]);

  // Handler: Add listings directly to Server Database & refresh
  const handleAddListings = async (newListings: EquipmentListing[]) => {
    try {
      if (newListings.length === 1) {
        await databaseApi.createListing(newListings[0]);
      } else {
        await databaseApi.createListingsBatch(newListings);
      }
      showToast(`Committed ${newListings.length} listing(s) to Server Database & Git Index.`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      console.error("Error saving listing to database:", err);
      // Fallback local update
      setListings((prev) => [...newListings, ...prev]);
      showToast(`Saved locally. (${err.message})`);
    }
  };

  // Handler: Dispatch contract to Server Database Outbox
  const handleDispatchContract = async (contractEnvelope: any) => {
    try {
      await databaseApi.saveOutboxEnvelope(contractEnvelope);
      setDispatchedContracts((prev) => [contractEnvelope, ...prev]);
      showToast("Contract envelope stored in Server Database Outbox for Shopify / Codex.");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      console.error("Error saving outbox envelope:", err);
      setDispatchedContracts((prev) => [contractEnvelope, ...prev]);
      showToast("Contract recorded locally.");
    }
  };

  const handleAnalyzeMatch = (listing: EquipmentListing) => {
    setSelectedListing(null);
    setActiveTab("matches");
  };

  // Filtered & Sorted Listings for Exchange Floor
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Type filter
        if (listingTypeFilter === "WTB" && item.type !== "WTB") return false;
        if (listingTypeFilter === "WTS" && item.type !== "WTS") return false;
        if (listingTypeFilter === "MATCHED" && (!item.matchScore || item.matchScore <= 0)) return false;

        // Category filter
        if (selectedCategory !== "All" && item.category !== selectedCategory) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesMake = item.make.toLowerCase().includes(q);
          const matchesModel = item.model.toLowerCase().includes(q);
          const matchesEntity = item.contact?.entityName.toLowerCase().includes(q);
          const matchesDesc = item.description.toLowerCase().includes(q);
          const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesMake && !matchesModel && !matchesEntity && !matchesDesc && !matchesTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "match") {
          return (b.matchScore || 0) - (a.matchScore || 0);
        }
        if (sortBy === "margin") {
          return (b.marginSpreadEstimate || 0) - (a.marginSpreadEstimate || 0);
        }
        if (sortBy === "price-desc") {
          return b.priceTarget - a.priceTarget;
        }
        if (sortBy === "price-asc") {
          return a.priceTarget - b.priceTarget;
        }
        // newest
        return new Date(b.discoveredAt).getTime() - new Date(a.discoveredAt).getTime();
      });
  }, [listings, listingTypeFilter, selectedCategory, searchQuery, sortBy]);

  // Counts
  const wtbCount = useMemo(() => listings.filter((l) => l.type === "WTB").length, [listings]);
  const wtsCount = useMemo(() => listings.filter((l) => l.type === "WTS").length, [listings]);
  const matchCount = useMemo(() => listings.filter((l) => l.matchScore && l.matchScore > 0).length, [listings]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-slate-900/95 px-4 py-3 text-xs font-mono text-emerald-300 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wtbCount={wtbCount}
        wtsCount={wtsCount}
        matchCount={matchCount}
        totalDbCount={listings.length}
        onOpenNewListingModal={() => setIsNewListingModalOpen(true)}
        onOpenScanner={() => setActiveTab("sourcing-scanner")}
      />

      {/* Market Depth Ticker */}
      <MarketTicker depthItems={marketDepth} recentScourCount={listings.length} />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* TAB 1: EXCHANGE FLOOR */}
        {activeTab === "exchange" && (
          <div className="space-y-6">
            {/* Hero Exchange Header */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 backdrop-blur-xl shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-indigo-400">
                    <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>LIVE AGENT EXCHANGE FLOOR</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">SYNCED WITH PERSISTENT DB</span>
                  </div>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-white md:text-3xl">
                    Precision Equipment & Sourced Asset Exchange
                  </h1>
                  <p className="mt-1 text-sm text-slate-300 max-w-2xl">
                    Autonomous Want-to-Buy (WTB) demands and Want-to-Sell (WTS) supply cards. Includes verified entity resolution, inferred contact dossiers, and continuous comp tracking.
                  </p>
                </div>

                {/* Stat Badges */}
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center min-w-[100px]">
                    <div className="font-mono text-[10px] uppercase text-slate-400">WTB Demands</div>
                    <div className="font-mono text-xl font-bold text-emerald-400">{wtbCount}</div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center min-w-[100px]">
                    <div className="font-mono text-[10px] uppercase text-slate-400">WTS Supply</div>
                    <div className="font-mono text-xl font-bold text-cyan-400">{wtsCount}</div>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center min-w-[100px]">
                    <div className="font-mono text-[10px] uppercase text-slate-400">Arbitrage Matches</div>
                    <div className="font-mono text-xl font-bold text-amber-400">{matchCount}</div>
                  </div>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3 border-t border-slate-800/80 pt-4">
                {/* Search Bar */}
                <div className="md:col-span-5 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search equipment: Make, Model, Entity, City, Spec, Tags..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                </div>

                {/* Type Filter */}
                <div className="md:col-span-3 flex rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
                  <button
                    onClick={() => setListingTypeFilter("ALL")}
                    className={`flex-1 rounded py-1 font-mono transition-all ${
                      listingTypeFilter === "ALL" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    ALL ({listings.length})
                  </button>
                  <button
                    onClick={() => setListingTypeFilter("WTB")}
                    className={`flex-1 rounded py-1 font-mono transition-all ${
                      listingTypeFilter === "WTB" ? "bg-emerald-600 text-white font-bold" : "text-emerald-400 hover:bg-emerald-950/40"
                    }`}
                  >
                    WTB ({wtbCount})
                  </button>
                  <button
                    onClick={() => setListingTypeFilter("WTS")}
                    className={`flex-1 rounded py-1 font-mono transition-all ${
                      listingTypeFilter === "WTS" ? "bg-cyan-600 text-white font-bold" : "text-cyan-400 hover:bg-cyan-950/40"
                    }`}
                  >
                    WTS ({wtsCount})
                  </button>
                  <button
                    onClick={() => setListingTypeFilter("MATCHED")}
                    className={`flex-1 rounded py-1 font-mono transition-all ${
                      listingTypeFilter === "MATCHED" ? "bg-amber-600 text-white font-bold" : "text-amber-400 hover:bg-amber-950/40"
                    }`}
                  >
                    MATCH ({matchCount})
                  </button>
                </div>

                {/* Category Select */}
                <div className="md:col-span-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as EquipmentCategory)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="All">All Categories (14)</option>
                    <optgroup label="Film Equipment (Permanent Mission)">
                      <option value="Cameras & Systems">Cameras & Systems</option>
                      <option value="Lenses & Optics">Lenses & Optics</option>
                      <option value="Lighting & Grip">Lighting & Grip</option>
                      <option value="Professional Audio">Professional Audio</option>
                      <option value="Monitoring & Wireless">Monitoring & Wireless</option>
                      <option value="Power, Media & Support">Power, Media & Support</option>
                      <option value="Post & Specialty Film Gear">Post & Specialty Film Gear</option>
                    </optgroup>
                    <optgroup label="Industrial Equipment">
                      <option value="Precision Optics & Lasers">Precision Optics & Lasers</option>
                      <option value="Semiconductor & Cleanroom">Semiconductor & Cleanroom</option>
                      <option value="Industrial CNC & Machining">Industrial CNC & Machining</option>
                      <option value="Lab & Metrology Testing">Lab & Metrology Testing</option>
                      <option value="High-Voltage & Power Systems">High-Voltage & Power Systems</option>
                      <option value="Automation & Robotics">Automation & Robotics</option>
                      <option value="Aerospace & Avionics Surplus">Aerospace & Avionics Surplus</option>
                    </optgroup>
                  </select>
                </div>

                {/* Sort Select */}
                <div className="md:col-span-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                  >
                    <option value="match">Sort: Match Score</option>
                    <option value="margin">Sort: Spread Margin ($)</option>
                    <option value="price-desc">Sort: Price (High to Low)</option>
                    <option value="price-asc">Sort: Price (Low to High)</option>
                    <option value="newest">Sort: Discovered Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid of Listings */}
            {filteredListings.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
                <Search className="mx-auto h-8 w-8 text-slate-600 mb-3" />
                <h3 className="text-base font-bold text-white">No listings match your filter criteria</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Try adjusting search keywords, exploring the Database Explorer, or launch the autonomous scanner.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab("autonomous-feed")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:brightness-110"
                  >
                    <Radio className="h-4 w-4" />
                    <span>Launch Autonomous Scanner & Live Feed</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("database")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50"
                  >
                    <Database className="h-4 w-4" />
                    <span>Open Database Explorer</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredListings.map((item) => (
                  <EquipmentCard
                    key={item.id}
                    listing={item}
                    onSelect={(l) => setSelectedListing(l)}
                    onAnalyzeMatch={(l) => handleAnalyzeMatch(l)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DATABASE EXPLORER & MASTER CATALOG */}
        {activeTab === "database" && (
          <DatabaseBrowser
            onSelectListing={(l) => setSelectedListing(l)}
            onAnalyzeMatch={handleAnalyzeMatch}
            onOpenNewListingModal={() => setIsNewListingModalOpen(true)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {/* TAB 3: INDEXED SOURCES & RATE-METERING REGISTRY */}
        {activeTab === "sources" && (
          <SourcesManager
            onSelectSourceForScan={() => setActiveTab("sourcing-scanner")}
          />
        )}

        {/* TAB 4: WTB DEMANDS */}
        {activeTab === "wtb-demands" && (

          <div className="space-y-6">
            <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-6 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  BUYER POOL QUEUE
                </span>
                <span className="font-mono text-xs text-slate-400">•</span>
                <span className="font-mono text-xs text-slate-300">NormsExchange Verified Demands</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white">Active Want-to-Buy (WTB) Demands</h2>
              <p className="mt-1 text-sm text-slate-300 max-w-3xl">
                Real-time active buy requests posted by research institutions, fabs, and precision manufacturers. The Gemini agent monitors these demands to continuously scour global surplus and auction listings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.filter((l) => l.type === "WTB").map((item) => (
                <EquipmentCard
                  key={item.id}
                  listing={item}
                  onSelect={(l) => setSelectedListing(l)}
                  onAnalyzeMatch={(l) => handleAnalyzeMatch(l)}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AUTONOMOUS SCANNER & LIVE ACTIVITY FEED */}
        {activeTab === "autonomous-feed" && (
          <AutonomousScannerFeed
            onListingIndexed={(newListing) => {
              setListings((prev) => [newListing, ...prev]);
              setRefreshTrigger((prev) => prev + 1);
            }}
            onSelectListing={(l) => setSelectedListing(l)}
            onNavigateToDb={() => setActiveTab("database")}
            onNavigateToMatches={() => setActiveTab("matches")}
          />
        )}

        {/* TAB 5: AI SOURCING SCANNER (MANUAL / CUSTOM SEARCH) */}
        {activeTab === "sourcing-scanner" && (
          <SourcingScanner
            onAddListings={handleAddListings}
            onSelectListing={(l) => setSelectedListing(l)}
          />
        )}

        {/* TAB 5: ARBITRAGE & MATCHES */}
        {activeTab === "matches" && (
          <MatchArbitrageConsole
            listings={listings}
            onDispatchToOutbox={handleDispatchContract}
          />
        )}

        {/* TAB 6: GIT OUTBOX & REPOSITORY */}
        {activeTab === "git-outbox" && (
          <GitOutboxConsole
            listings={listings}
            dispatchedContracts={dispatchedContracts}
          />
        )}

        {/* TAB 7: OPERATING NORMS & CHARTERS */}
        {activeTab === "operating-norms" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/30 p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 font-mono text-xs text-purple-400">
                <ShieldCheck className="h-4 w-4" />
                <span>ROLE BRANCH: role/culture-architect/operating-norms</span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-white">Team & Trade Operating Norms Architecture</h2>
              <p className="mt-1 text-sm text-slate-300 max-w-3xl">
                Codified behavioral agreements, dispute remedies, and psychological safety contracts governing human teams and federated AI agent interactions.
              </p>
            </div>

            <AINormsArchitect
              onAddGeneratedNorms={(newNorms) => {
                showToast(`Added ${newNorms.length} generated norms.`);
              }}
              activeCharter={[]}
            />
          </div>
        )}

        {/* TAB 8: AUTONOMOUS GOALS & BOT-BYPASS SITE INDEXER */}
        {activeTab === "goals" && (
          <GoalConsole
            onListingIndexed={(newListing) => {
              setListings((prev) => [newListing, ...prev]);
              setRefreshTrigger((prev) => prev + 1);
            }}
            onNavigateToDb={() => setActiveTab("database")}
            onNavigateToScanner={() => setActiveTab("sourcing-scanner")}
          />
        )}
      </main>

      {/* Detail Modal */}
      <EquipmentDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onAnalyzeMatch={handleAnalyzeMatch}
        onListingUpdated={(updated) => {
          setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
          setSelectedListing(updated);
          showToast(`Listing ${updated.id} status updated to ${updated.status || 'Active'}`);
          setRefreshTrigger((prev) => prev + 1);
        }}
        onListingDeleted={(deletedId) => {
          setListings((prev) => prev.filter((l) => l.id !== deletedId));
          setSelectedListing(null);
          showToast(`Listing ${deletedId} purged from database.`);
          setRefreshTrigger((prev) => prev + 1);
        }}
      />

      {/* New Listing Modal */}
      <NewListingModal
        isOpen={isNewListingModalOpen}
        onClose={() => setIsNewListingModalOpen(false)}
        onAddListing={(l) => handleAddListings([l])}
      />
    </div>
  );
}
