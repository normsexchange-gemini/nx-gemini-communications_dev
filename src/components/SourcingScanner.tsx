import React, { useState } from "react";
import { 
  Search, 
  Cpu, 
  Sparkles, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  RefreshCw, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { EquipmentListing, EquipmentCategory } from "../types";

interface SourcingScannerProps {
  onAddListings: (listings: EquipmentListing[]) => void;
  onSelectListing: (listing: EquipmentListing) => void;
}

const PRESET_SEARCHES = [
  { label: "Femtosecond Lasers (Coherent / Trumpf)", query: "Coherent Monaco 1035nm or Trumpf TruMicro ultrafast femtosecond laser surplus", category: "Precision Optics & Lasers", budget: 65000 },
  { label: "Keysight SMU Parameter Analyzers", query: "Keysight B1500A semiconductor parameter analyzer mainframe with HRSMU modules", category: "Semiconductor & Cleanroom", budget: 35000 },
  { label: "5-Axis CNC Centers (DMG MORI / Mazak)", query: "DMG MORI DMU 50 or Mazak Variaxis 5-axis machining center under power", category: "Industrial CNC & Machining", budget: 140000 },
  { label: "FTIR & Raman Spectrometers", query: "Thermo Nicolet iS50 FTIR spectrometer with ATR module analytical chemistry", category: "Lab & Metrology Testing", budget: 40000 },
  { label: "6-Axis Industrial Robotics", query: "FANUC M-20iD or KUKA KR 6 cleanroom handling robot R-30iB", category: "Automation & Robotics", budget: 28000 }
];

export const SourcingScanner: React.FC<SourcingScannerProps> = ({ onAddListings, onSelectListing }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>("Precision Optics & Lasers");
  const [targetBudget, setTargetBudget] = useState<number>(50000);
  const [minYear, setMinYear] = useState<number>(2019);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<EquipmentListing[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [indexedIds, setIndexedIds] = useState<Set<string>>(new Set());

  const handleRunScan = async (queryToUse?: string, catToUse?: EquipmentCategory, budgetToUse?: number) => {
    const query = queryToUse || searchQuery;
    const category = catToUse || selectedCategory;
    const budget = budgetToUse || targetBudget;

    if (!query.trim()) return;

    setIsScanning(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/sourcing/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          targetCategory: category,
          targetBudget: budget,
          minYear,
        }),
      });

      if (!response.ok) {
        throw new Error(`Scan failed with status ${response.status}`);
      }

      const data = await response.json();
      const results: EquipmentListing[] = data.results || [];
      setScanResults(results);
    } catch (err: any) {
      console.error("Scan error:", err);
      setErrorMsg(err.message || "Failed to scan web sources. Check Gemini API key.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleIndexItem = (item: EquipmentListing) => {
    onAddListings([item]);
    setIndexedIds((prev) => new Set([...prev, item.id]));
  };

  const handleIndexAll = () => {
    if (scanResults.length === 0) return;
    onAddListings(scanResults);
    setIndexedIds(new Set(scanResults.map((r) => r.id)));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 font-mono text-xs font-semibold text-cyan-400">
                <Sparkles className="h-3 w-3 animate-spin" />
                GEMINI 3.7 FLASH MULTI-SOURCE SCOURING ENGINE
              </span>
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] font-medium text-indigo-300">
                CONTACT INFERENCE ACTIVE
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Autonomous Equipment & Asset Sourcing
            </h2>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Input target equipment specs or WTB demands. Gemini crawls listings, auctions, and plant liquidation feeds, performs entity resolution to infer verified seller contacts, and grades condition.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
              <div className="font-mono text-xs text-slate-400">Inference Accuracy</div>
              <div className="font-mono text-xl font-bold text-emerald-400">94.8%</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
              <div className="font-mono text-xs text-slate-400">Catalog Repos</div>
              <div className="font-mono text-xl font-bold text-cyan-400">nx-gemini_dev</div>
            </div>
          </div>
        </div>

        {/* Preset Sourcing Chips */}
        <div className="mt-5 border-t border-slate-800/80 pt-4">
          <div className="text-xs font-mono text-slate-400 mb-2">QUICK SOURCING PRESETS:</div>
          <div className="flex flex-wrap gap-2">
            {PRESET_SEARCHES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(preset.query);
                  setSelectedCategory(preset.category as EquipmentCategory);
                  setTargetBudget(preset.budget);
                  handleRunScan(preset.query, preset.category as EquipmentCategory, preset.budget);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-cyan-500/40 hover:bg-slate-800 hover:text-cyan-300"
              >
                <Cpu className="h-3 w-3 text-cyan-400" />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sourcing Input Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Query Bar */}
          <div className="md:col-span-6">
            <label className="block text-xs font-mono font-medium text-slate-400 mb-1.5">
              EQUIPMENT QUERY / MODEL / KEYWORDS
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRunScan()}
                placeholder="e.g. Coherent Monaco 1035nm, Keysight B1500A, DMG MORI DMU 50..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <label className="block text-xs font-mono font-medium text-slate-400 mb-1.5">
              ASSET CATEGORY
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as EquipmentCategory)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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

          {/* Budget Target */}
          <div className="md:col-span-3">
            <label className="block text-xs font-mono font-medium text-slate-400 mb-1.5">
              BUDGET BENCHMARK ($ USD)
            </label>
            <input
              type="number"
              value={targetBudget}
              onChange={(e) => setTargetBudget(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-mono text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-4">
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Filter: Min Year <strong>{minYear}</strong></span>
            <span>•</span>
            <span>Target Protocol: <strong className="text-cyan-400">nx-sourcing-contract v0.1.0</strong></span>
          </div>

          <button
            id="btn-trigger-scour"
            disabled={isScanning || !searchQuery.trim()}
            onClick={() => handleRunScan()}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 disabled:opacity-50 active:scale-95"
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Scouring Sources & Inferring Contacts...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-white" />
                <span>Launch Autonomous Sourcing Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <div>
            <p className="text-sm font-semibold">Sourcing Scan Error</p>
            <p className="text-xs text-rose-300/80">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Scan Results Stream */}
      {scanResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="text-lg font-bold text-white">
                Discovered Sourcing Candidates ({scanResults.length})
              </h3>
            </div>

            <button
              onClick={handleIndexAll}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Index All to Exchange & Git Outbox</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {scanResults.map((item) => {
              const isIndexed = indexedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-md hover:border-cyan-500/50"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                        WTS DISCOVERED
                      </span>
                      <span className="font-mono text-xs text-slate-400">{item.year}</span>
                    </div>

                    <h4 className="mt-2 text-base font-bold text-white leading-snug">
                      {item.title}
                    </h4>
                    <p className="mt-1 font-mono text-xs text-slate-400">
                      {item.make} • {item.model}
                    </p>

                    {/* Price & Comp */}
                    <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                      <div className="flex items-baseline justify-between font-mono">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Asking Price</div>
                          <div className="text-lg font-bold text-white">
                            ${item.priceTarget?.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 uppercase">Market Comp</div>
                          <div className="text-sm font-medium text-slate-300">
                            ${item.marketCompAverage?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Inferred Contact Card */}
                    <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-200 truncate">
                          <Building2 className="h-3.5 w-3.5 text-cyan-400" />
                          <span className="truncate">{item.contact?.entityName}</span>
                        </div>
                        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          {item.contact?.inferenceConfidence}% CONFIDENCE
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-400">
                        {item.contact?.contactPerson && (
                          <div className="text-slate-300">Lead: {item.contact.contactPerson}</div>
                        )}
                        {item.contact?.email && (
                          <div className="text-cyan-300 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-500" />
                            <span className="truncate">{item.contact.email}</span>
                          </div>
                        )}
                        {item.contact?.phone && (
                          <div className="text-slate-300 flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-500" />
                            <span>{item.contact.phone}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 pt-1">
                          Inferred via: {item.contact?.inferenceMethod}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-800 pt-3">
                    <button
                      onClick={() => onSelectListing(item)}
                      className="rounded border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
                    >
                      Spec Sheet
                    </button>

                    <button
                      onClick={() => handleIndexItem(item)}
                      disabled={isIndexed}
                      className={`flex items-center gap-1 rounded px-3 py-1.5 text-xs font-semibold ${
                        isIndexed
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default"
                          : "bg-cyan-600 text-white hover:bg-cyan-500"
                      }`}
                    >
                      {isIndexed ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Indexed in Git</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add to Index</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
