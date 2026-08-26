import React, { useState } from "react";
import { 
  X, 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  ShieldCheck, 
  ExternalLink, 
  Cpu, 
  TrendingUp, 
  FileCode, 
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";
import { EquipmentListing } from "../types";

interface EquipmentDetailModalProps {
  listing: EquipmentListing | null;
  onClose: () => void;
  onAnalyzeMatch: (listing: EquipmentListing) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  listing,
  onClose,
  onAnalyzeMatch,
}) => {
  if (!listing) return null;

  const isWTB = listing.type === "WTB";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl p-6 md:p-8 space-y-6 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 pr-12">
          <span
            className={`rounded px-2.5 py-1 text-xs font-mono font-bold uppercase ${
              isWTB
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
            }`}
          >
            {isWTB ? "● WTB (BUY DEMAND)" : "● WTS (SOURCED SUPPLY)"}
          </span>
          <span className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
            {listing.category}
          </span>
          {listing.year && (
            <span className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 font-mono text-xs text-slate-400">
              Year: {listing.year}
            </span>
          )}
          {listing.condition && (
            <span className="rounded border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-xs text-indigo-300">
              {listing.condition}
            </span>
          )}
        </div>

        {/* Title & Make/Model */}
        <div>
          <h2 className="text-2xl font-bold text-white leading-tight">
            {listing.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs text-slate-400">
            <span>Make: <strong className="text-slate-200">{listing.make}</strong></span>
            <span>•</span>
            <span>Model: <strong className="text-slate-200">{listing.model}</strong></span>
            {listing.partNumber && (
              <>
                <span>•</span>
                <span>P/N: <strong className="text-slate-200">{listing.partNumber}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Valuation & Comps Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">
              {isWTB ? "Max Target Budget" : "Asking / Sourced Price"}
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              ${listing.priceTarget.toLocaleString()}{" "}
              <span className="text-xs text-slate-400">{listing.currency}</span>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Market Benchmark Comp</div>
            <div className="text-lg font-semibold font-mono text-slate-300">
              ${listing.marketCompAverage.toLocaleString()} USD
            </div>
            <div className="text-[10px] text-slate-500">Aggregated from historical sales & auctions</div>
          </div>

          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Availability / SLA</div>
            <div className="text-sm font-semibold font-mono text-cyan-300">
              {listing.urgencyOrAvailability}
            </div>
            <div className="text-[10px] text-slate-500">Ready for inspection & crating</div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs font-mono text-slate-400 uppercase mb-1.5 font-bold">
            Listing Scope & Operational Background
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-lg border border-slate-800">
            {listing.description}
          </p>
        </div>

        {/* Technical Specs Grid */}
        <div>
          <h3 className="text-xs font-mono text-slate-400 uppercase mb-2 font-bold">
            Complete Technical Specifications & Measured Diagnostics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            {Object.entries(listing.specs).map(([key, val]) => (
              <div
                key={key}
                className="flex items-baseline justify-between rounded border border-slate-800 bg-slate-950 p-2.5"
              >
                <span className="text-slate-400">{key}:</span>
                <span className="text-cyan-300 font-semibold text-right max-w-[200px] truncate">
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inferred Contact Dossier */}
        <div className="rounded-xl border border-indigo-500/30 bg-slate-950 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm">
              <Building2 className="h-4 w-4 text-indigo-400" />
              <span>Inferred Entity & Contact Dossier</span>
            </div>

            <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30">
              {listing.contact.inferenceConfidence}% INFERENCE CONFIDENCE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-500 block">Entity Name:</span>
              <strong className="text-white text-sm">{listing.contact.entityName}</strong>
            </div>

            {listing.contact.contactPerson && (
              <div>
                <span className="text-slate-500 block">Identified Lead:</span>
                <span className="text-slate-200">{listing.contact.contactPerson}</span>
              </div>
            )}

            {listing.contact.email && (
              <div>
                <span className="text-slate-500 block">Email Channel:</span>
                <span className="text-cyan-300">{listing.contact.email}</span>
              </div>
            )}

            {listing.contact.phone && (
              <div>
                <span className="text-slate-500 block">Direct Phone:</span>
                <span className="text-slate-200">{listing.contact.phone}</span>
              </div>
            )}

            {listing.contact.location && (
              <div>
                <span className="text-slate-500 block">Geographic Location:</span>
                <span className="text-slate-200">{listing.contact.location}</span>
              </div>
            )}

            <div>
              <span className="text-slate-500 block">Inference Method:</span>
              <span className="text-indigo-400">{listing.contact.inferenceMethod}</span>
            </div>
          </div>

          {listing.contact.notes && (
            <div className="mt-2 text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
              <strong className="text-slate-300 font-sans">Verification Notes: </strong>
              {listing.contact.notes}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="text-xs font-mono text-slate-500">
            Index Ref: {listing.githubIndexRef || "normsexchange-gemini/catalog"}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                onAnalyzeMatch(listing);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md hover:brightness-110"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Match & Sourcing Contract</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
