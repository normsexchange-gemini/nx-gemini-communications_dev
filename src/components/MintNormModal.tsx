import React, { useState } from "react";
import { Norm, NormCategory } from "../types";
import { X, Plus, Sparkles, Scale, Zap, ShieldCheck } from "lucide-react";

interface MintNormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMintNorm: (norm: Norm) => void;
}

const CATEGORIES: Array<Exclude<NormCategory, "All">> = [
  "Communication",
  "Engineering",
  "Reciprocity & Social",
  "Meetings & Time",
  "Decision Making",
  "Cross-Cultural",
  "Trade & Compliance",
  "Leadership",
];

export const MintNormModal: React.FC<MintNormModalProps> = ({
  isOpen,
  onClose,
  onMintNorm,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Exclude<NormCategory, "All">>("Communication");
  const [tagline, setTagline] = useState("");
  const [triggerSituation, setTriggerSituation] = useState("");
  const [explicitRule, setExplicitRule] = useState("");
  const [violationRemedy, setViolationRemedy] = useState("");
  const [reciprocityIndex, setReciprocityIndex] = useState(85);
  const [frictionRisk, setFrictionRisk] = useState<"Low" | "Medium" | "High">("Medium");
  const [antiPatternsText, setAntiPatternsText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !triggerSituation.trim() || !explicitRule.trim()) return;

    const antiPatterns = antiPatternsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const newNorm: Norm = {
      id: `custom-norm-${Date.now()}`,
      title: title.trim(),
      category,
      tagline: tagline.trim() || explicitRule.slice(0, 80) + "...",
      description: `${title.trim()} establishes clear explicit boundaries and mutual reciprocity for ${category.toLowerCase()} workflows.`,
      triggerSituation: triggerSituation.trim(),
      explicitRule: explicitRule.trim(),
      violationRemedy: violationRemedy.trim() || "Gently remind peer of the explicit norm in 1:1 without blame.",
      reciprocityIndex,
      frictionRisk,
      clarityScore: 92,
      antiPatterns: antiPatterns.length > 0 ? antiPatterns : ["Implicit passive-aggressive expectations", "Unbalanced individual effort"],
      adoptionWeeks: 2,
      votesCount: 1,
      adoptionsCount: 1,
      tags: [category.replace(/\s+/g, ""), "CommunityMinted"],
      author: {
        name: authorName.trim() || "Community Architect",
        role: authorRole.trim() || "NormsExchange Contributor",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      },
      isCustom: true,
    };

    onMintNorm(newNorm);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Mint a New Operating Norm
              </h2>
              <p className="text-xs text-slate-400">
                Publish an explicit, battle-tested operational rule to the open exchange.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
                Norm Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The 48-Hour RFC Cooling Window"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
              One-Sentence Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Protect deep focus by batching non-urgent requests."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Trigger Situation */}
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-amber-400 block mb-1">
              ⚡ Trigger Situation (When does this norm activate?) *
            </label>
            <textarea
              required
              rows={2}
              value={triggerSituation}
              onChange={(e) => setTriggerSituation(e.target.value)}
              placeholder="e.g. When sending a message after 6:00 PM local time to a remote teammate..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Explicit Rule */}
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-indigo-300 block mb-1">
              📜 The Explicit Behavioral Rule (What is the contract?) *
            </label>
            <textarea
              required
              rows={2}
              value={explicitRule}
              onChange={(e) => setExplicitRule(e.target.value)}
              placeholder="e.g. Always use scheduled send or prefix with [ASYNC-NO-RUSH]. Never expect replies before 9 AM."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Violation Remedy */}
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-emerald-400 block mb-1">
              🛡️ Blameless Violation Remedy (How to gracefully reset without hostility?)
            </label>
            <input
              type="text"
              value={violationRemedy}
              onChange={(e) => setViolationRemedy(e.target.value)}
              placeholder="e.g. Reply with the :palm_tree: emoji and schedule for tomorrow's standup."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Metrics & Risk */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300">
                  Reciprocity Index
                </label>
                <span className="font-mono font-bold text-emerald-400">{reciprocityIndex}%</span>
              </div>
              <input
                type="range"
                min={40}
                max={100}
                value={reciprocityIndex}
                onChange={(e) => setReciprocityIndex(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
                Friction Risk If Violated
              </label>
              <div className="flex gap-2">
                {(["Low", "Medium", "High"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFrictionRisk(r)}
                    className={`flex-1 py-1.5 rounded-xl font-mono font-semibold text-xs border transition-all ${
                      frictionRisk === r
                        ? r === "High"
                          ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40"
                          : r === "Medium"
                          ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-950/40"
                          : "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950/40"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Anti-Patterns */}
          <div>
            <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
              Anti-Patterns Prevented (1 per line)
            </label>
            <textarea
              rows={2}
              value={antiPatternsText}
              onChange={(e) => setAntiPatternsText(e.target.value)}
              placeholder="Sending 'ping?' 5 minutes after a Slack DM&#10;Guilt-tripping peers for taking PTO"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Author info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
                Your Name / Handle
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Maya Lin"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="e.g. Lead Engineer"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-700/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all"
            >
              Mint Norm to Exchange
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

