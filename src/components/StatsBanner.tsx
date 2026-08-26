import React from "react";
import { 
  Scale, 
  Users, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  ArrowUpRight,
  Zap
} from "lucide-react";

interface StatsBannerProps {
  totalNormsCount: number;
  totalAdoptionsCount: number;
  avgReciprocity: number;
  onOpenAIArchitect: () => void;
  onOpenSimulator: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  totalNormsCount,
  totalAdoptionsCount,
  avgReciprocity,
  onOpenAIArchitect,
  onOpenSimulator,
}) => {
  return (
    <div className="space-y-4">
      
      {/* Top Main Sleek Hero Glass Card */}
      <div className="glass rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        {/* Sleek subtle ambient lights */}
        <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left Headline & Overview */}
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Decentralized Operating Agreements & Social Capital Protocol</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Exchange Implicit Friction for <span className="text-indigo-400">Explicit Operating Norms</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
              Unspoken rules breed anxiety, resentment, and organizational gridlock. Mint, audit, and standardize high-reciprocity contracts for high-velocity teams.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onOpenAIArchitect}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Architect Norms with AI</span>
              </button>

              <button
                onClick={onOpenSimulator}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all hover:border-slate-600"
              >
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span>Reciprocity Sandbox</span>
              </button>
            </div>
          </div>

          {/* Right Protocol Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
                <span>Norms Minted</span>
                <span className="text-indigo-400 font-mono text-[10px]">VERIFIED</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {totalNormsCount}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Across 8 categories</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
                <span>Total Adoptions</span>
                <span className="text-emerald-400 font-mono text-[10px] flex items-center">
                  ↑ 14.8%
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {totalAdoptionsCount.toLocaleString()}+
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Active team charters</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-medium">
                <span>Equity Ratio</span>
                <span className="text-indigo-400 font-mono text-[10px]">EQUITY</span>
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-400">
                {avgReciprocity}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Reciprocity index</div>
            </div>
          </div>

        </div>
      </div>

      {/* Sleek Sub-Row: Market Sentiment & Trending Norms Ticker (From Design Template) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Market Sentiment Bars */}
        <div className="md:col-span-7 glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-indigo-400" />
              <span>Cultural Market Sentiment</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              HIGH TRUST
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Civility Index</span>
                <span className="text-emerald-400 font-mono font-semibold">+4.2%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "78%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Implicit Debt</span>
                <span className="text-rose-400 font-mono font-semibold">-6.4%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: "24%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Reciprocity Rate</span>
                <span className="text-indigo-400 font-mono font-semibold">+12.0%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: "89%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Trending Norms Ticker matching Sleek Interface */}
        <div className="md:col-span-5 glass rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>Trending Behavioral Assets</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">24H CYCLE</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs flex items-center gap-2">
              <span className="font-medium text-slate-200">#NoMeetingsFriday</span>
              <span className="text-emerald-400 font-mono text-[10px] font-bold">HOT</span>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs flex items-center gap-2">
              <span className="font-medium text-slate-200">#AsyncSlackSLA</span>
              <span className="text-indigo-400 font-mono text-[10px] font-bold">RISING</span>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs flex items-center gap-2">
              <span className="font-medium text-slate-200">#HSTariffDualSignoff</span>
              <span className="text-sky-400 font-mono text-[10px] font-bold">STABLE</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
