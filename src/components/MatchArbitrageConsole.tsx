import React, { useState } from "react";
import { 
  Sparkles, 
  ArrowLeftRight, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  FileCode, 
  Copy, 
  AlertTriangle, 
  Building2, 
  RefreshCw,
  Send,
  GitBranch,
  Bot
} from "lucide-react";
import { EquipmentListing, WTBRequest } from "../types";
import { getEquipmentImageUrl } from "../utils/equipmentImages";

interface MatchArbitrageConsoleProps {
  listings: EquipmentListing[];
  onDispatchToOutbox?: (contractEnvelope: any) => void;
}

export const MatchArbitrageConsole: React.FC<MatchArbitrageConsoleProps> = ({
  listings,
  onDispatchToOutbox,
}) => {
  const wtbListings = listings.filter((l) => l.type === "WTB");
  const wtsListings = listings.filter((l) => l.type === "WTS");

  const [selectedWtbId, setSelectedWtbId] = useState<string>(wtbListings[0]?.id || "");
  const [selectedWtsId, setSelectedWtsId] = useState<string>(wtsListings[0]?.id || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [generatedContract, setGeneratedContract] = useState<any | null>(null);
  const [copiedContract, setCopiedContract] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  const currentWtb = listings.find((l) => l.id === selectedWtbId) || wtbListings[0];
  const currentWts = listings.find((l) => l.id === selectedWtsId) || wtsListings[0];

  const handleRunMatchAnalysis = async () => {
    if (!currentWtb || !currentWts) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setGeneratedContract(null);
    setIsDispatched(false);

    try {
      const response = await fetch("/api/sourcing/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wtbItem: currentWtb,
          wtsItem: currentWts,
        }),
      });

      const data = await response.json();
      setAnalysisResult(data.matchAnalysis);

      // Also generate contract payload
      const contractResp = await fetch("/api/sourcing/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wtbItem: currentWtb,
          wtsItem: currentWts,
          matchAnalysis: data.matchAnalysis,
        }),
      });
      const contractData = await contractResp.json();
      setGeneratedContract(contractData.contractEnvelope);
    } catch (err) {
      console.error("Match error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyContract = () => {
    if (!generatedContract) return;
    navigator.clipboard.writeText(JSON.stringify(generatedContract, null, 2));
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2500);
  };

  const handleDispatch = () => {
    if (!generatedContract) return;
    onDispatchToOutbox?.(generatedContract);
    setIsDispatched(true);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 p-6 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-400 border border-amber-500/30">
            PROTOCOL: nx-sourcing-contract v0.2.0
          </span>
          <span className="font-mono text-xs text-slate-400">|</span>
          <span className="font-mono text-xs text-slate-300">LA / US ⇄ Vietnam Arbitrage & Cross-Border Logistics</span>
        </div>
        <h2 className="mt-2 text-2xl font-bold text-white">
          Film Equipment WTB Demand vs. Sourced Surplus Matchmaking
        </h2>
        <p className="mt-1 text-sm text-slate-300 max-w-3xl">
          Pair active Want-to-Buy cinema buyer demands with autonomous physical equipment candidates. Calculate compatibility scores, gross spreads, air-cargo freight rates, and generate verifiable bilateral contracts for Codex intake.
        </p>
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Buyer Demand (WTB) */}
        <div className="rounded-xl border border-emerald-500/40 bg-slate-900/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="font-bold text-emerald-300 text-sm uppercase tracking-wide font-mono">
                1. Select Buyer Demand (WTB)
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-400">{wtbListings.length} Active Demands</span>
          </div>

          <div className="mt-4">
            <select
              value={selectedWtbId}
              onChange={(e) => {
                setSelectedWtbId(e.target.value);
                setAnalysisResult(null);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            >
              {wtbListings.map((wtb) => (
                <option key={wtb.id} value={wtb.id}>
                  [{wtb.id}] {wtb.make} {wtb.model} - Max: ${(wtb.priceTarget ?? 0).toLocaleString()} ({wtb.contact?.entityName})
                </option>
              ))}
            </select>
          </div>

          {currentWtb && (
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-950/90 text-xs font-mono">
              <div className="relative h-32 w-full overflow-hidden bg-slate-950 border-b border-slate-800">
                <img
                  src={getEquipmentImageUrl(currentWtb)}
                  alt={`${currentWtb.make} ${currentWtb.model}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                  <span className="text-white font-bold font-sans text-sm drop-shadow">{currentWtb.make} {currentWtb.model}</span>
                  <span className="bg-emerald-950/90 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 text-[10px]">
                    ${(currentWtb.priceTarget ?? 0).toLocaleString()} USD
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Buyer Entity:</span>
                  <span className="text-white font-bold">{currentWtb.contact?.entityName}</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Required Condition:</span>
                  <span className="text-slate-300">{currentWtb.condition}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Key Buyer Criteria:</span>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    {Object.entries(currentWtb.specs).map(([k, v]) => (
                      <span key={k} className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-300">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sourced Supply (WTS) */}
        <div className="rounded-xl border border-cyan-500/40 bg-slate-900/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
              <h3 className="font-bold text-cyan-300 text-sm uppercase tracking-wide font-mono">
                2. Select Discovered Supply (WTS)
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-400">{wtsListings.length} Sourced Items</span>
          </div>

          <div className="mt-4">
            <select
              value={selectedWtsId}
              onChange={(e) => {
                setSelectedWtsId(e.target.value);
                setAnalysisResult(null);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            >
              {wtsListings.map((wts) => (
                <option key={wts.id} value={wts.id}>
                  [{wts.id}] {wts.make} {wts.model} - Ask: ${(wts.priceTarget ?? 0).toLocaleString()} ({wts.contact?.entityName})
                </option>
              ))}
            </select>
          </div>

          {currentWts && (
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-800 bg-slate-950/90 text-xs font-mono">
              <div className="relative h-32 w-full overflow-hidden bg-slate-950 border-b border-slate-800">
                <img
                  src={getEquipmentImageUrl(currentWts)}
                  alt={`${currentWts.make} ${currentWts.model}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                  <span className="text-white font-bold font-sans text-sm drop-shadow">{currentWts.make} {currentWts.model}</span>
                  <span className="bg-cyan-950/90 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 text-[10px]">
                    ${(currentWts.priceTarget ?? 0).toLocaleString()} USD
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Seller Entity (Inferred):</span>
                  <span className="text-white font-bold">{currentWts.contact?.entityName}</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Inferred Lead:</span>
                  <span className="text-slate-300">{currentWts.contact?.email || currentWts.contact?.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Discovered Specs:</span>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    {Object.entries(currentWts.specs).map(([k, v]) => (
                      <span key={k} className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-300">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action to Run Match */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleRunMatchAnalysis}
          disabled={isAnalyzing || !currentWtb || !currentWts}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-500 px-8 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 disabled:opacity-50 active:scale-95"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
              <span>Analyzing Match & Calculating Arbitrage...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-slate-950" />
              <span>Run AI Dyadic Match & Synthesize Contract</span>
            </>
          )}
        </button>
      </div>

      {/* Match Results and Contract Envelope View */}
      {analysisResult && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping"></span>
                <h3 className="text-xl font-bold text-white">
                  Match Compatibility: {analysisResult.matchScore}%
                </h3>
                <span className="inline-flex items-center gap-1 rounded bg-purple-950/90 border border-purple-500/50 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300">
                  <Bot className="h-3 w-3 text-purple-400" />
                  <span>⚡ AUTO GENERATED</span>
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300 max-w-2xl">{analysisResult.feasibilitySummary}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Gross Arbitrage Spread</div>
                <div className="font-mono text-lg font-bold text-emerald-400">
                  +${((currentWtb?.priceTarget || 0) - (currentWts?.priceTarget || 0)).toLocaleString()} USD
                </div>
              </div>
            </div>
          </div>

          {/* Key Deal Terms & Remedy Protocol */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="text-xs font-mono text-slate-400 uppercase">Inspection Window</div>
              <div className="mt-1 text-base font-bold text-white">
                {analysisResult.recommendedDealTerms?.inspectionWindowDays || 7} Days RMA Window
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Full testing on recipient dock before fund release.</div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="text-xs font-mono text-slate-400 uppercase">Escrow Hold</div>
              <div className="mt-1 text-base font-bold text-emerald-400">
                {analysisResult.recommendedDealTerms?.escrowHoldPercent || 100}% Protected
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Governed via NormsExchange Escrow.</div>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="text-xs font-mono text-slate-400 uppercase">Freight Responsibility</div>
              <div className="mt-1 text-base font-bold text-cyan-300">
                {analysisResult.recommendedDealTerms?.freightResponsibility || "Buyer"} Managed
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Insured air freight & crate crating.</div>
            </div>
          </div>

          {/* Blameless Remedy Protocol */}
          <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300 font-mono">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>BLAMELESS REMEDY PROTOCOL</span>
            </div>
            <p className="mt-1 text-slate-300">
              {analysisResult.recommendedDealTerms?.blamelessRemedyProtocol || 
                "If optical or mechanical parameters differ by >5% from declared spec sheet upon receipt, buyer initiates immediate RMA with 100% refund without dispute escalation."}
            </p>
          </div>

          {/* Generated Contract JSON Envelope */}
          {generatedContract && (
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                  <FileCode className="h-4 w-4" />
                  <span>Outbox Sourcing Contract Envelope (nx-sourcing-contract v0.1.0)</span>
                  <span className="inline-flex items-center gap-1 rounded bg-purple-950/90 border border-purple-500/50 px-2 py-0.5 text-[9px] font-mono font-bold text-purple-300">
                    <Bot className="h-2.5 w-2.5 text-purple-400" />
                    <span>AUTO GENERATED</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyContract}
                    className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-slate-300 hover:bg-slate-700"
                  >
                    {copiedContract ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDispatch}
                    disabled={isDispatched}
                    className={`flex items-center gap-1.5 rounded px-3 py-1 font-semibold ${
                      isDispatched
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:brightness-110"
                    }`}
                  >
                    {isDispatched ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span>Dispatched to Outbox</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3" />
                        <span>Dispatch to Codex / Shopify</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <pre className="overflow-x-auto text-[11px] text-slate-300 max-h-60 p-2 bg-slate-900/80 rounded border border-slate-800">
                {JSON.stringify(generatedContract, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
