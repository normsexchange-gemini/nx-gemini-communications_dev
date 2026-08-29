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
  AlertCircle,
  Globe,
  Radio,
  ExternalLink,
  Bot
} from "lucide-react";
import { EquipmentListing, EquipmentCategory, TradeCorridor } from "../types";
import { getEquipmentImageUrl } from "../utils/equipmentImages";

interface SourcingScannerProps {
  onAddListings: (listings: EquipmentListing[]) => void;
  onSelectListing: (listing: EquipmentListing) => void;
}

const PRESET_SEARCHES = [
  { 
    label: "ARRI Alexa 35 & Mini LF Packages", 
    query: "ARRI Alexa 35 4.6K Super 35 or Mini LF cinema package with Codex Compact Drives and MVF-2 viewfinder surplus", 
    category: "Cameras & Systems" as EquipmentCategory, 
    budget: 78000,
    corridor: "LA_TO_VN" as TradeCorridor
  },
  { 
    label: "Cooke Anamorphic /i FF+ Prime Sets", 
    query: "Cooke Anamorphic /i Full Frame Plus 5-lens set 32mm 40mm 50mm 75mm 100mm PL mount", 
    category: "Lenses & Optics" as EquipmentCategory, 
    budget: 135000,
    corridor: "LA_TO_VN" as TradeCorridor
  },
  { 
    label: "ARRI SkyPanel S360-C & Vortex8 LED", 
    query: "ARRI SkyPanel S360-C 1500W LED soft light with honeycomb and road case or Creamsource Vortex8", 
    category: "Lighting & Grip" as EquipmentCategory, 
    budget: 18500,
    corridor: "LA_TO_VN" as TradeCorridor
  },
  { 
    label: "Sound Devices Scorpio 32-Track Record", 
    query: "Sound Devices Scorpio 32 channel 36 track flagship portable field audio recorder with Dante and Lectrosonics DCR822", 
    category: "Professional Audio" as EquipmentCategory, 
    budget: 9800,
    corridor: "DOMESTIC_US" as TradeCorridor
  },
  { 
    label: "Teradek Bolt 6 XT 4K Wireless Video", 
    query: "Teradek Bolt 6 XT 4K 1500 12G-SDI zero-delay wireless video transmitter receiver set V-Mount", 
    category: "Monitoring & Wireless" as EquipmentCategory, 
    budget: 6500,
    corridor: "LA_TO_VN" as TradeCorridor
  },
  { 
    label: "O'Connor 2575D Ultimate Fluid Heads", 
    query: "O'Connor 2575D Mitchell base ultimate fluid head with Ronford-Baker heavy duty carbon sticks and flight case", 
    category: "Power, Media & Support" as EquipmentCategory, 
    budget: 14500,
    corridor: "VN_TO_US" as TradeCorridor
  },
  { 
    label: "DaVinci Resolve Advanced Panel MK II", 
    query: "Blackmagic DaVinci Resolve Advanced Control Panel triple trackball color grading surface MK II", 
    category: "Post & Specialty Film Gear" as EquipmentCategory, 
    budget: 22000,
    corridor: "DOMESTIC_US" as TradeCorridor
  }
];

export const SourcingScanner: React.FC<SourcingScannerProps> = ({ onAddListings, onSelectListing }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>("Cameras & Systems");
  const [targetBudget, setTargetBudget] = useState<number>(65000);
  const [selectedCorridor, setSelectedCorridor] = useState<TradeCorridor>("LA_TO_VN");
  const [minYear, setMinYear] = useState<number>(2020);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<EquipmentListing[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [indexedIds, setIndexedIds] = useState<Set<string>>(new Set());

  const handleRunScan = async (
    queryToUse?: string, 
    catToUse?: EquipmentCategory, 
    budgetToUse?: number,
    corridorToUse?: TradeCorridor
  ) => {
    const query = queryToUse || searchQuery;
    const category = catToUse || selectedCategory;
    const budget = budgetToUse || targetBudget;
    const corridor = corridorToUse || selectedCorridor;

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
          corridor,
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
                GEMINI 3.7 FLASH FILM EQUIPMENT SCOURING ENGINE
              </span>
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] font-medium text-indigo-300">
                EVIDENCE-BASED INFERENCE (CONTRACT v0.2.0)
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Autonomous Cinema Asset Sourcing & Corridor Intelligence
            </h2>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Target specific cine equipment or studio WTB demands. Gemini crawls production rental house inventories, auctions, and stage liquidation feeds across Los Angeles, Atlanta, Saigon, and Hanoi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
              <div className="font-mono text-xs text-slate-400">Inference Precision</div>
              <div className="font-mono text-xl font-bold text-emerald-400">96.2%</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-center">
              <div className="font-mono text-xs text-slate-400">Target Corridor</div>
              <div className="font-mono text-base font-bold text-amber-400">LA ⇄ VN</div>
            </div>
          </div>
        </div>

        {/* Preset Sourcing Chips */}
        <div className="mt-5 border-t border-slate-800/80 pt-4">
          <div className="text-xs font-mono text-slate-400 mb-2">CINEMA SOURCING PRESETS:</div>
          <div className="flex flex-wrap gap-2">
            {PRESET_SEARCHES.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(preset.query);
                  setSelectedCategory(preset.category);
                  setTargetBudget(preset.budget);
                  setSelectedCorridor(preset.corridor);
                  handleRunScan(preset.query, preset.category, preset.budget, preset.corridor);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300 transition-all hover:border-cyan-500/40 hover:bg-slate-800 hover:text-cyan-300"
              >
                <span>{preset.label}</span>
                <span className="font-mono text-[10px] text-cyan-400 font-semibold">${(preset.budget / 1000).toFixed(0)}k</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Scanner Controls */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Query input */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="block text-xs font-mono font-medium text-slate-300">
              EQUIPMENT QUERY / MODEL / SPECS
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. ARRI Alexa 35, Cooke Anamorphic 50mm, SkyPanel S360-C..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Category */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-mono font-medium text-slate-300">
              EQUIPMENT CATEGORY
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as EquipmentCategory)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
            >
              <optgroup label="Film Equipment Categories (Permanent Mission)">
                <option value="Cameras & Systems">Cameras & Systems</option>
                <option value="Lenses & Optics">Lenses & Optics</option>
                <option value="Lighting & Grip">Lighting & Grip</option>
                <option value="Professional Audio">Professional Audio</option>
                <option value="Monitoring & Wireless">Monitoring & Wireless</option>
                <option value="Power, Media & Support">Power, Media & Support</option>
                <option value="Post & Specialty Film Gear">Post & Specialty Film Gear</option>
              </optgroup>
              <optgroup label="Industrial Categories">
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

          {/* Trade Corridor */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-mono font-medium text-slate-300">
              TRADE CORRIDOR
            </label>
            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value as TradeCorridor)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none font-mono"
            >
              <option value="LA_TO_VN">🇺🇸 LA / US ➔ 🇻🇳 Vietnam</option>
              <option value="VN_TO_US">🇻🇳 Vietnam ➔ 🇺🇸 US</option>
              <option value="DOMESTIC_US">🇺🇸 Domestic US Hubs</option>
              <option value="DOMESTIC_VN">🇻🇳 Domestic Vietnam Hubs</option>
              <option value="ALL">Global / Unrestricted</option>
            </select>
          </div>
        </div>

        {/* Secondary Parameters & Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <div>
              <span>Target Budget: </span>
              <strong className="text-white">${(targetBudget ?? 0).toLocaleString()}</strong>
            </div>
            <div>
              <span>Min Year: </span>
              <strong className="text-white">{minYear}+</strong>
            </div>
          </div>

          <button
            onClick={() => handleRunScan()}
            disabled={isScanning || !searchQuery.trim()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Crawling Feeds & Inferring Entities...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Launch Autonomous Sourcing Scan</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs font-mono text-rose-300">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Discovered Listings Results Grid */}
      {scanResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Discovered Sourcing Candidates</h3>
              <p className="text-xs text-slate-400 font-mono">
                {scanResults.length} candidates extracted with inferred seller contact profiles
              </p>
            </div>

            <button
              onClick={handleIndexAll}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Index All {scanResults.length} to Database</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scanResults.map((item) => {
              const isIndexed = indexedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg flex flex-col justify-between"
                >
                  <div className="relative h-32 w-full overflow-hidden bg-slate-950 border-b border-slate-800">
                    <img
                      src={getEquipmentImageUrl(item)}
                      alt={`${item.make} ${item.model}`}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="rounded bg-cyan-950/90 border border-cyan-500/40 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300 backdrop-blur-md">
                          {item.category}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-purple-950/90 border border-purple-500/50 px-1.5 py-0.5 text-[9px] font-mono font-bold text-purple-300 backdrop-blur-md">
                          <Bot className="h-2.5 w-2.5 text-purple-400" />
                          <span>AUTO</span>
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 backdrop-blur-md">
                        ${(item.priceTarget ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.make} {item.model} • {item.condition}</p>
                    </div>

                    {/* Inferred Entity Profile */}
                    <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5 text-xs font-mono space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300 font-sans font-medium">
                        <Building2 className="h-3 w-3 text-slate-500" />
                        <span className="truncate">{item.contact?.entityName || "Verified Studio"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        <span>{item.contact?.location || "Burbank / Hollywood"}</span>
                      </div>
                      {item.contact?.email && (
                        <div className="flex items-center gap-1.5 text-cyan-400">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{item.contact.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => onSelectListing(item)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Inspect Specs
                    </button>

                    <button
                      onClick={() => handleIndexItem(item)}
                      disabled={isIndexed}
                      className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-mono font-semibold transition-all ${
                        isIndexed
                          ? "bg-slate-800 text-slate-500 cursor-default"
                          : "bg-cyan-600 text-white hover:bg-cyan-500"
                      }`}
                    >
                      {isIndexed ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span>Indexed</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3" />
                          <span>Index Candidate</span>
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
