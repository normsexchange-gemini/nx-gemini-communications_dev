import React, { useState } from "react";
import { Norm, TeamCharter, CharterMemberVote } from "../types";
import { 
  Users, 
  Trash2, 
  Download, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  FileText, 
  Share2, 
  ShieldCheck,
  Scale,
  Zap,
  HelpCircle,
  Vote,
  RefreshCw,
  ArrowUpRight,
  FolderGit2
} from "lucide-react";
import { GitHubSyncModal } from "./GitHubSyncModal";

interface CharterBuilderProps {
  charterNorms: Norm[];
  onRemoveNorm: (normId: string) => void;
  onNavigateToExchange: () => void;
  onTriggerAIAudit: (charterText: string) => void;
  onSelectNorm: (norm: Norm) => void;
}

const DEFAULT_SQUAD_MEMBERS: CharterMemberVote[] = [
  {
    id: "mem-1",
    memberName: "Alex K.",
    role: "Staff Engineer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    status: "approved",
    comment: "The 4h Slack SLA and No-Meeting Wednesdays will save 12 hours of weekly context switching.",
    votedAt: "2h ago"
  },
  {
    id: "mem-2",
    memberName: "Devon M.",
    role: "Senior Product Manager",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    status: "nuanced",
    comment: "Love the async decision RFC rule. Let's make sure urgent customer escalations have an explicit override.",
    votedAt: "5h ago"
  },
  {
    id: "mem-3",
    memberName: "Priya S.",
    role: "Full-Stack Engineer (Remote)",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    status: "approved",
    comment: "Camera-optional default is huge for my timezone overlap hours. 100% support.",
    votedAt: "1d ago"
  },
  {
    id: "mem-4",
    memberName: "Lucas T.",
    role: "DevOps & Infrastructure",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    status: "approved",
    comment: "Blameless post-mortem norm is strictly needed before our next major database migration.",
    votedAt: "1d ago"
  }
];

export const CharterBuilder: React.FC<CharterBuilderProps> = ({
  charterNorms,
  onRemoveNorm,
  onNavigateToExchange,
  onTriggerAIAudit,
  onSelectNorm,
}) => {
  const [teamName, setTeamName] = useState("Alpha Core Engineering & Product");
  const [charterTitle, setCharterTitle] = useState("Team Operating Agreement & Social Contract");
  const [members, setMembers] = useState<CharterMemberVote[]>(DEFAULT_SQUAD_MEMBERS);
  const [copiedSlack, setCopiedSlack] = useState(false);
  const [copiedMD, setCopiedMD] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  // Compute metrics
  const totalNorms = charterNorms.length;
  const avgReciprocity = totalNorms > 0 
    ? Math.round(charterNorms.reduce((acc, n) => acc + n.reciprocityIndex, 0) / totalNorms)
    : 0;
  const avgClarity = totalNorms > 0
    ? Math.round(charterNorms.reduce((acc, n) => acc + n.clarityScore, 0) / totalNorms)
    : 0;

  const getCharterHealthText = () => {
    if (totalNorms === 0) return { label: "Empty Charter", color: "text-slate-400", desc: "Adopt norms from the Exchange to construct your team charter." };
    if (totalNorms < 3) return { label: "Initial Scaffold", color: "text-amber-400", desc: "A great start! Add 2-3 more norms to cover meetings, communication, and decision velocity." };
    if (avgReciprocity >= 85 && avgClarity >= 85) return { label: "High Equity & Velocity", color: "text-emerald-400", desc: "Exemplary balance! Clear explicit rules with generous mutual reciprocity." };
    return { label: "Good Operational Coverage", color: "text-indigo-400", desc: "Solid operating foundation with healthy boundary definitions." };
  };

  const health = getCharterHealthText();

  // Export handlers
  const generateMarkdown = () => {
    let md = `# ${charterTitle}\n**Team:** ${teamName}\n**Generated via:** NormsExchange (https://normsexchange.org)\n**Last Updated:** ${new Date().toLocaleDateString()}\n\n---\n\n## 📊 Charter Balance Metrics\n- **Total Operating Norms:** ${totalNorms}\n- **Average Reciprocity Index:** ${avgReciprocity}%\n- **Clarity & Enforcement Score:** ${avgClarity}%\n\n---\n\n## 📜 Team Operating Agreements\n\n`;

    charterNorms.forEach((n, idx) => {
      md += `### ${idx + 1}. ${n.title} (${n.category})\n`;
      md += `> ${n.tagline}\n\n`;
      md += `- **Trigger Situation:** ${n.triggerSituation}\n`;
      md += `- **Explicit Behavioral Rule:** ${n.explicitRule}\n`;
      md += `- **Blameless Violation Remedy:** ${n.violationRemedy}\n`;
      if (n.antiPatterns && n.antiPatterns.length > 0) {
        md += `- **Anti-Patterns Prevented:** ${n.antiPatterns.join("; ")}\n`;
      }
      md += `\n`;
    });

    md += `\n---\n\n## 👥 Team Sign-Off & Consensus\n`;
    members.forEach((m) => {
      md += `- **${m.memberName}** (${m.role}): *${m.status.toUpperCase()}* - "${m.comment}"\n`;
    });

    return md;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopiedMD(true);
    setTimeout(() => setCopiedMD(false), 2000);
  };

  const handleCopySlack = () => {
    let slack = `📋 *${charterTitle} - ${teamName}*\n\n`;
    charterNorms.forEach((n, idx) => {
      slack += `*${idx + 1}. ${n.title}* [${n.category}]\n⚡ *Trigger:* ${n.triggerSituation}\n📜 *Rule:* ${n.explicitRule}\n🛡️ *Remedy:* ${n.violationRemedy}\n\n`;
    });
    slack += `_Full playbook maintained on NormsExchange_`;
    navigator.clipboard.writeText(slack);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2000);
  };

  const handleDownloadFile = () => {
    const text = generateMarkdown();
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${teamName.toLowerCase().replace(/\s+/g, "-")}-charter.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSimulateVote = (memberId: string, status: "approved" | "nuanced" | "blocked") => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, status, votedAt: "Just now" } : m))
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Charter Header & Metadata */}
      <div className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ACTIVE PLAYBOOK
              </span>
              <span className={`text-xs font-mono font-semibold ${health.color}`}>
                ● {health.label}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="text"
                value={charterTitle}
                onChange={(e) => setCharterTitle(e.target.value)}
                className="text-xl sm:text-2xl font-black text-white bg-transparent border-b border-dashed border-slate-700 hover:border-slate-500 focus:border-indigo-500 focus:outline-none transition-all py-0.5 w-full max-w-xl"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-[11px]">SQUAD:</span>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="font-medium text-slate-200 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {health.desc}
            </p>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {totalNorms > 0 && (
              <button
                id="charter-ai-audit-btn"
                onClick={() => onTriggerAIAudit(generateMarkdown())}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>AI Friction & Blindspot Audit</span>
              </button>
            )}

            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700/80 shadow-md transition-all hover:border-indigo-500/50"
            >
              <FolderGit2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Sync to GitHub</span>
            </button>

            <button
              onClick={handleCopySlack}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors"
            >
              <Copy className="h-3.5 w-3.5 text-amber-400" />
              <span>{copiedSlack ? "Copied!" : "Copy for Slack"}</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors"
            >
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <span>{copiedMD ? "Copied MD!" : "Markdown"}</span>
            </button>

            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/80 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export .md</span>
            </button>
          </div>
        </div>

        {/* Balance Metrics Strip */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Active Norms
            </span>
            <span className="text-xl font-bold font-mono text-white">{totalNorms}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Operating rules</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Reciprocity Equity
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400">{avgReciprocity}%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Mutual support ratio</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Clarity Score
            </span>
            <span className="text-xl font-bold font-mono text-indigo-400">{avgClarity}%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Unambiguous triggers</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Squad Consensus
            </span>
            <span className="text-xl font-bold font-mono text-amber-400">
              {members.filter((m) => m.status === "approved").length}/{members.length}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Ratified sign-offs</span>
          </div>
        </div>
      </div>

      {/* Main Charter Content: Adopted Norms List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">
              Assembled Operating Agreements ({totalNorms})
            </h3>
          </div>

          <button
            onClick={onNavigateToExchange}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Browse & Adopt More Norms</span>
          </button>
        </div>

        {totalNorms === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl glass-card space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center mx-auto text-indigo-400">
              <Users className="h-6 w-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h4 className="text-base font-bold text-white">
                Your team charter has no active norms yet
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Explore the open NormsExchange repository to adopt battle-tested norms for async communication, deep work, blameless retrospectives, and cross-cultural alignment.
              </p>
            </div>
            <button
              onClick={onNavigateToExchange}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
            >
              Browse Open Norms Repository
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {charterNorms.map((norm, index) => (
              <div
                key={norm.id}
                className="p-5 rounded-2xl glass-card transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <span className="flex items-center justify-center h-7 w-7 rounded-xl bg-indigo-950 border border-indigo-800 text-xs font-mono font-bold text-indigo-300 shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                        {norm.category}
                      </span>
                      <span className="text-[11px] font-mono font-medium text-emerald-400">
                        {norm.reciprocityIndex}% Reciprocity
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        • {norm.adoptionWeeks}w ramp
                      </span>
                    </div>
                    <h4 
                      onClick={() => onSelectNorm(norm)}
                      className="text-base font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors"
                    >
                      {norm.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-normal leading-relaxed">
                      {norm.explicitRule}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => onSelectNorm(norm)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-200 font-medium border border-slate-700/80 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onRemoveNorm(norm.id)}
                    title="Remove norm from charter"
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Consensus & Ratification Simulator */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Squad Ratification & Consensus Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulate how different roles on your team review, provide feedback, and ratify these operational agreements.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.memberName}
                    className="h-9 w-9 rounded-full object-cover border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block font-sans">
                      {member.memberName}
                    </span>
                    <span className="text-[11px] text-slate-400">{member.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-mono">
                  {member.status === "approved" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                      ✓ Approved
                    </span>
                  )}
                  {member.status === "nuanced" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800">
                      ⚡ Nuance
                    </span>
                  )}
                  {member.status === "blocked" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800">
                      ✕ Blocked
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 italic bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                "{member.comment}"
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-slate-500 font-mono">VOTE:</span>
                <div className="flex gap-1.5 font-mono">
                  <button
                    onClick={() => handleSimulateVote(member.id, "approved")}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                      member.status === "approved"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Agree
                  </button>
                  <button
                    onClick={() => handleSimulateVote(member.id, "nuanced")}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                      member.status === "nuanced"
                        ? "bg-amber-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Nuance
                  </button>
                  <button
                    onClick={() => handleSimulateVote(member.id, "blocked")}
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                      member.status === "blocked"
                        ? "bg-rose-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Object
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Sync Modal */}
      <GitHubSyncModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        charterMarkdown={generateMarkdown()}
        charterTitle={charterTitle}
        teamName={teamName}
      />

    </div>
  );
};

