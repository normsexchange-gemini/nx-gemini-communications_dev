import React, { useState } from "react";
import { Norm } from "../types";
import { 
  Globe2, 
  ShieldCheck, 
  FileCheck, 
  AlertTriangle, 
  Plus, 
  Check, 
  ArrowRight,
  ExternalLink,
  Layers,
  Scale
} from "lucide-react";

interface TradeStandardsViewProps {
  onAdoptNorm: (norm: Norm) => void;
  charterNormIds: Set<string>;
}

const TRADE_NORMS: Norm[] = [
  {
    id: "trade-hs-code-audit-cadence",
    title: "HS Tariff Code Dual-Verification Protocol",
    category: "Trade & Compliance",
    tagline: "Prevent customs border seizure and misdeclaration penalties with mandatory dual classification.",
    description: "Harmonized System (HS) classifications drive duties, sanctions screening, and regulatory clearance. This norm requires engineering/catalog updates to undergo dual-signoff from a licensed customs broker or automated HS AI engine prior to manifest submission.",
    triggerSituation: "When launching a new international SKU, changing product materials, or updating export destinations.",
    explicitRule: "Every new tariff classification must have at least 2 independent verification points (e.g. ERP rule match + Customs Compliance lead sign-off) within 48 hours of catalog intake.",
    violationRemedy: "If customs discrepancy flags exceed 0.5% in a quarter, freeze unverified international SKU dispatch and trigger an emergency customs audit sprint.",
    reciprocityIndex: 94,
    frictionRisk: "High",
    clarityScore: 98,
    antiPatterns: [
      "Copy-pasting generic 6-digit HS codes without verifying country-specific 8-10 digit statistical suffixes",
      "Relying on freight forwarders to guess product chemistry without technical documentation"
    ],
    adoptionWeeks: 3,
    culturalContextNotes: "Universal WCO (World Customs Organization) standards; essential for transatlantic and Asia-Pacific trade lanes.",
    votesCount: 380,
    adoptionsCount: 1120,
    tags: ["Customs", "Tariff", "HSCode", "TradeCompliance", "SupplyChain"],
    author: {
      name: "Raymond Chen",
      role: "Global Customs Strategist",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      organization: "WebCustoms Trade Institute"
    }
  },
  {
    id: "trade-incoterms-handoff-sla",
    title: "Incoterms® 2020 Risk Allocation & Responsibility Handoff",
    category: "Trade & Compliance",
    tagline: "Eliminate demurrage disputes by explicitly defining risk transfer points (FOB, FCA, DDP).",
    description: "Trade friction frequently arises from mismatched assumptions regarding who pays port storage, insurance, or import VAT. This norm establishes strict documentation handover milestones.",
    triggerSituation: "Negotiating vendor purchase orders, cross-border distributor agreements, or multi-modal carrier contracts.",
    explicitRule: "Never use Incoterms abbreviations without specifying named port/terminal (e.g., 'FCA Chicago Logistics Hub Incoterms 2020'). Bill of Lading / Airway Bill draft must be validated 72h prior to vessel departure.",
    violationRemedy: "If demurrage fees are incurred due to late documentation, the delaying party absorbs the storage cost automatically as per pre-agreed contract.",
    reciprocityIndex: 91,
    frictionRisk: "High",
    clarityScore: 95,
    antiPatterns: [
      "Using 'FOB' for containerized maritime cargo instead of FCA",
      "Assuming 'DDP' covers destination demurrage and local customs inspection delays"
    ],
    adoptionWeeks: 2,
    culturalContextNotes: "Standardized across International Chamber of Commerce (ICC) rules.",
    votesCount: 290,
    adoptionsCount: 840,
    tags: ["Incoterms", "Logistics", "RiskAllocation", "InternationalTrade"],
    author: {
      name: "Dr. Genevieve Bouchard",
      role: "International Commercial Law Professor",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      organization: "Maritime & Trade Governance"
    }
  },
  {
    id: "trade-rules-of-origin-audit",
    title: "Preferential Rules of Origin & Non-Alteration Proof SLA",
    category: "Trade & Compliance",
    tagline: "Capture free trade agreement duty exemptions legally with airtight value-add proof.",
    description: "Guarantees that products claiming preferential tariff rates (USMCA, CPTPP, EU-UK TCA) meet regional value content (RVC) or tariff shift rules with audit-proof certificate chains.",
    triggerSituation: "When claiming zero-duty status under international Free Trade Agreements (FTAs).",
    explicitRule: "Bill of Materials (BOM) origin certificates must be refreshed annually. Any component supplier change triggers an automated RVC calculation re-run before goods clear export customs.",
    violationRemedy: "If an FTA audit fails, immediately re-file retroactive duties and conduct a supplier country-of-origin reverification.",
    reciprocityIndex: 88,
    frictionRisk: "High",
    clarityScore: 92,
    antiPatterns: [
      "Signing origin certificates based on supplier marketing claims without manufacturing BOMs",
      "Ignoring transshipment non-manipulation certificate requirements"
    ],
    adoptionWeeks: 4,
    culturalContextNotes: "Essential for global supply chains navigating complex geopolitical trade agreements.",
    votesCount: 245,
    adoptionsCount: 670,
    tags: ["RulesOfOrigin", "FreeTrade", "USMCA", "CustomsAudit"],
    author: {
      name: "Klaus Hoffmann",
      role: "Cross-Border Trade Director",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      organization: "Global Compliance Guild"
    }
  }
];

export const TradeStandardsView: React.FC<TradeStandardsViewProps> = ({
  onAdoptNorm,
  charterNormIds,
}) => {
  const [selectedHS, setSelectedHS] = useState("8471.30 (Portable Data Processing Machines)");
  const [originCountry, setOriginCountry] = useState("JP (Japan)");
  const [destCountry, setDestCountry] = useState("US (United States)");
  const [simulatedRisk, setSimulatedRisk] = useState<{ riskScore: number; flags: string[]; dutyEstimate: string } | null>(null);

  const handleSimulateCustoms = () => {
    setSimulatedRisk({
      riskScore: 12,
      flags: [
        "HS 8471.30 is covered by the Information Technology Agreement (ITA) - 0% MFN Duty Rate.",
        "Requires Section 301 / Section 232 origin verification if intermediate components originate in CN.",
        "Dual-use encryption self-classification report (ERN) recommended for high-bandwidth Wi-Fi 7 modules."
      ],
      dutyEstimate: "0.0% MFN Preferential Tariff (Clean Compliance Record)"
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Globe2 className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              INTERNATIONAL TRADE & COMPLIANCE MATRIX
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Customs, Tariffs & Regulatory Norms Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Operating agreements and compliance contracts for global trade logistics, HS tariff classification cadences, and supply chain accountability.
          </p>
        </div>
      </div>

      {/* Trade Norms Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <span>Core Trade & Customs Operating Agreements</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TRADE_NORMS.map((norm) => {
            const inCharter = charterNormIds.has(norm.id);
            return (
              <div
                key={norm.id}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {norm.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {norm.reciprocityIndex}% Equity
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white leading-snug">
                    {norm.title}
                  </h4>

                  <p className="text-xs text-slate-400">
                    {norm.tagline}
                  </p>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                    <div>
                      <span className="font-mono font-bold text-amber-400 uppercase text-[10px] block">Trigger:</span>
                      <p className="text-slate-300 text-[11px]">{norm.triggerSituation}</p>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800">
                      <span className="font-mono font-bold text-indigo-300 uppercase text-[10px] block">Rule:</span>
                      <p className="text-slate-200 font-medium text-[11px]">{norm.explicitRule}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    By {norm.author.name}
                  </span>

                  <button
                    onClick={() => onAdoptNorm(norm)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      inCharter
                        ? "bg-slate-800 text-indigo-300 border border-indigo-500/50"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    }`}
                  >
                    {inCharter ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>In Charter</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" />
                        <span>Adopt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Customs Compliance Assessment Widget */}
      <div className="glass rounded-2xl p-6 sm:p-8 space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Interactive Cross-Border Classification & SLA Risk Checker
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate how a structured classification verification SLA prevents border customs delays.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
              HS SUBHEADING CODE
            </label>
            <select
              value={selectedHS}
              onChange={(e) => setSelectedHS(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="8471.30 (Portable Data Processing Machines)">8471.30 (Laptops & Mobile Workstations)</option>
              <option value="8517.62 (Machines for Reception/Transmission of Data)">8517.62 (Network Routers & Switches)</option>
              <option value="9031.80 (Measuring and Checking Instruments)">9031.80 (Optical Inspection Sensors)</option>
              <option value="3926.90 (Other Articles of Plastics)">3926.90 (Precision Enclosures)</option>
            </select>
          </div>

          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
              COUNTRY OF ORIGIN (COO)
            </label>
            <select
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="JP (Japan)">JP (Japan) - FTA Compliant</option>
              <option value="DE (Germany)">DE (Germany) - EU MFN</option>
              <option value="US (United States)">US (United States)</option>
              <option value="VN (Vietnam)">VN (Vietnam) - ASEAN Pact</option>
            </select>
          </div>

          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
              DESTINATION MARKET
            </label>
            <select
              value={destCountry}
              onChange={(e) => setDestCountry(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="US (United States)">US (United States) - US Customs & Border Protection</option>
              <option value="EU (European Union)">EU (European Union) - TARIC System</option>
              <option value="GB (United Kingdom)">GB (United Kingdom) - HMRC Trade Tariff</option>
              <option value="JP (Japan)">JP (Japan) - Japan Customs</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSimulateCustoms}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/25"
        >
          Check Customs Compliance SLA Readiness
        </button>

        {simulatedRisk && (
          <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-emerald-400">
                ✓ Risk Index: {simulatedRisk.riskScore}% (Low Border Friction)
              </span>
              <span className="font-mono text-xs text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-800">
                {simulatedRisk.dutyEstimate}
              </span>
            </div>

            <ul className="space-y-1.5 text-slate-300">
              {simulatedRisk.flags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span className="text-[11px]">{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
};

