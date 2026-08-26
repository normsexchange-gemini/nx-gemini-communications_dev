import React from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Radio, Search } from "lucide-react";
import { MarketDepthItem } from "../types";

interface MarketTickerProps {
  depthItems: MarketDepthItem[];
  recentScourCount: number;
}

export const MarketTicker: React.FC<MarketTickerProps> = ({ depthItems, recentScourCount }) => {
  return (
    <div className="w-full border-b border-slate-800/80 bg-slate-900/70 overflow-hidden py-2 px-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Live Badge */}
        <div className="flex items-center gap-2 shrink-0 border-r border-slate-800 pr-4">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">
            MARKET DEPTH
          </span>
        </div>

        {/* Scrolling or Ticker items */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar text-xs">
          {depthItems.map((item) => {
            const isPositiveSpread = item.spread >= 0;
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 shrink-0 rounded border border-slate-800/60 bg-slate-950/60 px-3 py-1 font-mono"
              >
                <span className="font-semibold text-slate-300">{item.item}</span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400">BID ${item.bidPrice.toLocaleString()}</span>
                <span className="text-slate-600">/</span>
                <span className="text-cyan-400">ASK ${item.askPrice.toLocaleString()}</span>
                <span
                  className={`flex items-center text-[11px] font-semibold ${
                    isPositiveSpread ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositiveSpread ? (
                    <ArrowUpRight className="h-3 w-3 inline" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 inline" />
                  )}
                  {item.spreadPercent > 0 ? `+${item.spreadPercent}%` : `${item.spreadPercent}%`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Scour Counter */}
        <div className="hidden shrink-0 items-center gap-2 text-xs font-mono text-cyan-400 lg:flex">
          <Search className="h-3.5 w-3.5 animate-spin" />
          <span>INDEXED FEEDS: <strong className="text-white">1,482</strong></span>
        </div>
      </div>
    </div>
  );
};
