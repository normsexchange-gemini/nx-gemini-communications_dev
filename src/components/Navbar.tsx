import React from "react";
import { 
  Radio, 
  Layers, 
  Search, 
  Cpu, 
  ArrowLeftRight, 
  GitBranch, 
  PlusCircle, 
  ShieldCheck, 
  TrendingUp, 
  FileText,
  Database
} from "lucide-react";

interface NavbarProps {
  activeTab: "exchange" | "database" | "wtb-demands" | "sourcing-scanner" | "matches" | "git-outbox" | "operating-norms";
  setActiveTab: (tab: "exchange" | "database" | "wtb-demands" | "sourcing-scanner" | "matches" | "git-outbox" | "operating-norms") => void;
  wtbCount: number;
  wtsCount: number;
  matchCount: number;
  totalDbCount?: number;
  onOpenNewListingModal: () => void;
  onOpenScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  wtbCount,
  wtsCount,
  matchCount,
  totalDbCount,
  onOpenNewListingModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      {/* Top Protocol Status Bar */}
      <div className="border-b border-slate-900 bg-slate-950 px-4 py-1.5 text-xs text-slate-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              NODE: normsexchange-gemini
            </span>
            <span className="text-slate-700">|</span>
            <span className="font-mono text-[11px] text-slate-400">
              DATABASE: <span className="text-cyan-400">data/normsexchange_db.json</span>
            </span>
            <span className="hidden text-slate-700 sm:inline">|</span>
            <span className="hidden font-mono text-[11px] text-amber-400/90 sm:inline">
              PROTOCOL: <span className="text-slate-300">nx-communications v0.2.0</span>
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="hidden text-slate-400 md:inline">HUB: <span className="text-white font-medium">normsexchange.com</span> (Shopify / Codex)</span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 text-indigo-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              PERSISTENT STORE ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div 
            id="brand-logo"
            onClick={() => setActiveTab("exchange")}
            className="flex cursor-pointer items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-600 shadow-md shadow-indigo-500/20">
              <ArrowLeftRight className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">NORMS<span className="text-cyan-400">EXCHANGE</span></span>
                <span className="rounded border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-300">
                  GEMINI SOURCING NODE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Equipment & Asset Exchange • Inferred Seller Intelligence</p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <nav className="hidden items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1 lg:flex">
          <button
            id="nav-tab-exchange"
            onClick={() => setActiveTab("exchange")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "exchange"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Exchange Floor
          </button>

          <button
            id="nav-tab-database"
            onClick={() => setActiveTab("database")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "database"
                ? "bg-cyan-600 text-white shadow-sm font-bold"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            Database Explorer
            {totalDbCount !== undefined && (
              <span className="ml-1 rounded-full bg-cyan-950 px-1.5 py-0.2 text-[10px] font-mono text-cyan-300">
                {totalDbCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-wtb"
            onClick={() => setActiveTab("wtb-demands")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "wtb-demands"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            WTB Demands
            <span className="ml-1 rounded-full bg-emerald-950 px-1.5 py-0.2 text-[10px] font-mono text-emerald-300">
              {wtbCount}
            </span>
          </button>

          <button
            id="nav-tab-scanner"
            onClick={() => setActiveTab("sourcing-scanner")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "sourcing-scanner"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <Search className="h-3.5 w-3.5 text-indigo-400" />
            AI Scanner
          </button>

          <button
            id="nav-tab-matches"
            onClick={() => setActiveTab("matches")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "matches"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            Matches
            <span className="ml-1 rounded-full bg-amber-950 px-1.5 py-0.2 text-[10px] font-mono text-amber-300">
              {matchCount}
            </span>
          </button>

          <button
            id="nav-tab-git"
            onClick={() => setActiveTab("git-outbox")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "git-outbox"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <GitBranch className="h-3.5 w-3.5 text-slate-300" />
            Git Outbox
          </button>

          <button
            id="nav-tab-norms"
            onClick={() => setActiveTab("operating-norms")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "operating-norms"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-purple-300" />
            Norms
          </button>
        </nav>

        {/* Quick Action Button */}
        <div className="flex items-center gap-2">
          <button
            id="btn-post-listing"
            onClick={onOpenNewListingModal}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post WTB / WTS</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex overflow-x-auto border-t border-slate-800/60 bg-slate-950/60 px-3 py-2 lg:hidden">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("exchange")}
            className={`whitespace-nowrap rounded-md px-3 py-1 text-xs ${
              activeTab === "exchange" ? "bg-indigo-600 text-white" : "text-slate-400"
            }`}
          >
            Exchange Floor
          </button>
          <button
            onClick={() => setActiveTab("database")}
            className={`whitespace-nowrap rounded-md px-3 py-1 text-xs ${
              activeTab === "database" ? "bg-cyan-600 text-white" : "text-slate-400"
            }`}
          >
            Database ({totalDbCount || 0})
          </button>
          <button
            onClick={() => setActiveTab("wtb-demands")}
            className={`whitespace-nowrap rounded-md px-3 py-1 text-xs ${
              activeTab === "wtb-demands" ? "bg-emerald-600 text-white" : "text-slate-400"
            }`}
          >
            WTB Demands ({wtbCount})
          </button>
          <button
            onClick={() => setActiveTab("sourcing-scanner")}
            className={`whitespace-nowrap rounded-md px-3 py-1 text-xs ${
              activeTab === "sourcing-scanner" ? "bg-cyan-600 text-white" : "text-slate-400"
            }`}
          >
            AI Scanner
          </button>
          <button
            onClick={() => setActiveTab("matches")}
            className={`whitespace-nowrap rounded-md px-3 py-1 text-xs ${
              activeTab === "matches" ? "bg-amber-600 text-white" : "text-slate-400"
            }`}
          >
            Matches ({matchCount})
          </button>
          <button
            onClick={() => setActiveTab("git-outbox")}
            className={`whitespace-nowrap rounded-md px-3 py-1 text-xs ${
              activeTab === "git-outbox" ? "bg-slate-700 text-white" : "text-slate-400"
            }`}
          >
            Git Outbox
          </button>
          <button
            onClick={() => setActiveTab("operating-norms")}
            className={`whitespace-nowrap rounded-md px-3 py-1 text-xs ${
              activeTab === "operating-norms" ? "bg-purple-600 text-white" : "text-slate-400"
            }`}
          >
            Norms
          </button>
        </div>
      </div>
    </header>
  );
};
