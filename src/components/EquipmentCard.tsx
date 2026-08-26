import React from "react";
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Cpu, 
  Sparkles, 
  TrendingUp, 
  FileCode2,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { EquipmentListing } from "../types";

interface EquipmentCardProps {
  listing: EquipmentListing;
  onSelect: (listing: EquipmentListing) => void;
  onAnalyzeMatch?: (listing: EquipmentListing) => void;
  onDraftContract?: (listing: EquipmentListing) => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  listing,
  onSelect,
  onAnalyzeMatch,
  onDraftContract,
}) => {
  const isWTB = listing.type === "WTB";
  const hasMatch = Boolean(listing.matchScore && listing.matchScore > 0);

  return (
    <div
      id={`card-${listing.id}`}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-indigo-500/10"
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-mono font-bold tracking-wider uppercase ${
                isWTB
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
              }`}
            >
              {isWTB ? "● WTB (BUY DEMAND)" : "● WTS (SOURCED SUPPLY)"}
            </span>

            <span className="rounded-md border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-[11px] font-medium text-slate-300">
              {listing.category}
            </span>

            {listing.year && (
              <span className="rounded border border-slate-800 bg-slate-950/80 px-1.5 py-0.5 font-mono text-[11px] text-slate-400">
                {listing.year}
              </span>
            )}
          </div>

          {/* Match Score Badge if matched */}
          {hasMatch && (
            <div className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-mono font-bold text-amber-400 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>{listing.matchScore}% MATCH</span>
            </div>
          )}
        </div>

        {/* Title & Make/Model */}
        <div className="mt-3 cursor-pointer" onClick={() => onSelect(listing)}>
          <h3 className="text-base font-semibold leading-snug text-white transition-colors group-hover:text-cyan-300">
            {listing.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 font-mono text-xs text-slate-400">
            <span>Make: <strong className="text-slate-200">{listing.make}</strong></span>
            <span>•</span>
            <span>Model: <strong className="text-slate-200">{listing.model}</strong></span>
            {listing.partNumber && (
              <>
                <span>•</span>
                <span className="text-slate-500">P/N: {listing.partNumber}</span>
              </>
            )}
          </div>
        </div>

        {/* Pricing / Valuation Block */}
        <div className="mt-4 rounded-lg border border-slate-800/80 bg-slate-950/60 p-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400">
                {isWTB ? "Max Target Budget" : "Asking / Sourced Price"}
              </span>
              <div className="text-xl font-bold font-mono text-white">
                ${listing.priceTarget.toLocaleString()}{" "}
                <span className="text-xs font-normal text-slate-400">{listing.currency}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono uppercase text-slate-400">Market Comps Avg</span>
              <div className="text-sm font-semibold font-mono text-slate-300">
                ${listing.marketCompAverage.toLocaleString()}
              </div>
            </div>
          </div>

          {listing.marginSpreadEstimate && listing.marginSpreadEstimate > 0 && (
            <div className="mt-2 flex items-center justify-between border-t border-slate-800/60 pt-2 text-xs font-mono text-emerald-400">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Est. Arbitrage / Spread:
              </span>
              <span className="font-bold">+${listing.marginSpreadEstimate.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Technical Specs Pills */}
        <div className="mt-3">
          <div className="text-[11px] font-mono text-slate-400 mb-1.5 uppercase">Key Specs:</div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(listing.specs).slice(0, 3).map(([key, val]) => (
              <div
                key={key}
                className="rounded border border-slate-800 bg-slate-900/80 px-2 py-1 font-mono text-[11px] text-slate-300"
              >
                <span className="text-slate-500">{key}: </span>
                <span className="text-cyan-300 font-medium">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inferred Contact & Entity Card */}
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800/70 pb-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
              <span className="truncate max-w-[180px]">{listing.contact.entityName}</span>
            </div>
            
            {/* Inference Confidence Badge */}
            <div className="flex items-center gap-1">
              <span
                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                  listing.contact.inferenceConfidence >= 90
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}
                title={`Inferred via: ${listing.contact.inferenceMethod}`}
              >
                {listing.contact.inferenceConfidence}% INFERRED
              </span>
            </div>
          </div>

          <div className="mt-2 space-y-1 text-slate-400 font-mono text-[11px]">
            {listing.contact.contactPerson && (
              <div className="text-slate-300 truncate">
                Contact: <strong className="text-white font-sans">{listing.contact.contactPerson}</strong>
              </div>
            )}
            
            <div className="flex items-center gap-3 text-slate-400">
              {listing.contact.location && (
                <div className="flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                  <span className="truncate">{listing.contact.location}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
              <span className="truncate">Source: {listing.contact.sourceDomain}</span>
              <span className="rounded bg-slate-800 px-1 text-slate-400 font-mono">
                {listing.contact.inferenceMethod}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
        <button
          id={`btn-view-${listing.id}`}
          onClick={() => onSelect(listing)}
          className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
        >
          <span>Spec Sheet & Comps</span>
          <ArrowRight className="h-3 w-3" />
        </button>

        {hasMatch ? (
          <button
            id={`btn-match-${listing.id}`}
            onClick={() => onAnalyzeMatch?.(listing)}
            className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-amber-500 to-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-md transition-all hover:brightness-110 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Review Match & Contract</span>
          </button>
        ) : (
          <button
            id={`btn-scour-match-${listing.id}`}
            onClick={() => onAnalyzeMatch?.(listing)}
            className="flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-medium text-indigo-300 transition-all hover:bg-indigo-500/20"
          >
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>Scour Match</span>
          </button>
        )}
      </div>
    </div>
  );
};
