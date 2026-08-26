import React, { useState } from "react";
import { 
  GitBranch, 
  FileCode, 
  Folder, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  ShieldCheck,
  History,
  Bot,
  Sparkles,
  Download,
  UploadCloud,
  AlertCircle,
  Loader2,
  Key
} from "lucide-react";
import { EquipmentListing } from "../types";

interface GitOutboxConsoleProps {
  listings: EquipmentListing[];
  dispatchedContracts: any[];
}

export const GitOutboxConsole: React.FC<GitOutboxConsoleProps> = ({ listings, dispatchedContracts }) => {
  const [activeFile, setActiveFile] = useState<string>("EVOLUTION.md");
  const [copied, setCopied] = useState(false);

  // GitHub Push Sync State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [githubToken, setGithubToken] = useState("");
  const [targetRepo, setTargetRepo] = useState("normsexchange-gemini/nx-gemini-communications_dev");
  const [targetBranch, setTargetBranch] = useState("main");
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    success?: boolean;
    message?: string;
    totalFiles?: number;
    syncedCount?: number;
    errorCount?: number;
    errors?: any[];
  } | null>(null);

  const manifestContent = {
    schema_version: "0.2.0",
    environment_id: "normsexchange-gemini",
    environment_type: "Gemini",
    communications_version: "0.2.0",
    communications_repo: "https://github.com/normsexchange-gemini/nx-gemini-communications_dev",
    access_model: {
      public_read: true,
      owner_write_only: true,
      external_write: false
    },
    protocols_supported: [
      { name: "nx-communications", version: "0.2.0" },
      { name: "nx-sourcing-contract", version: "0.1.0" }
    ],
    role_branches: [
      "role/culture-architect/operating-norms",
      "role/sourcing-agent/equipment-exchange",
      "role/arbitrageur/contract-engine",
      "role/database-custodian/master-catalog"
    ],
    outbox_index_ref: "outbox/index.json",
    catalog_indexed_count: listings.length,
    last_synced: new Date().toISOString()
  };

  const outboxIndexContent = {
    schema_version: "0.2.0",
    environment_id: "normsexchange-gemini",
    messages: [
      {
        id: "msg-init-001",
        file: "outbox/messages/msg-init-001.json",
        type: "INITIALIZATION_ACK",
        recipient: "normsexchange-codex",
        timestamp: "2026-08-25T21:40:00Z",
        status: "DELIVERED"
      },
      ...dispatchedContracts.map((c, idx) => ({
        id: c.messageId || `msg-src-00${idx + 2}`,
        file: `outbox/messages/${c.messageId || `msg-src-00${idx + 2}`}.json`,
        type: "EQUIPMENT_MATCH_PROPOSAL",
        recipient: "normsexchange-codex",
        timestamp: c.timestamp || new Date().toISOString(),
        status: "READY_FOR_SHOPIFY_SYNC"
      }))
    ]
  };

  const evolutionContent = `# NormsExchange Evolution Ledger & Agent Lineage
Protocol: nx-communications v0.2.0 | Contract: nx-sourcing-contract v0.1.0

=== EPOCH TIMELINE ===
Epoch 0: Operating Norms Genesis (Behavioral charters & psychological safety)
Epoch 1: Federated Multi-Agent Protocol (nx-communications v0.2.0 for Codex / Shopify bridge)
Epoch 2: Autonomous Sourcing Scanner & Inferred Entity Dossiers (Gemini Crawler)
Epoch 3: Match Arbitrage Engine & Formal Sourcing Contracts (Escrow terms, spread calc)
Epoch 4: Persistent Server-Side Database & Master Catalog Explorer (data/normsexchange_db.json)
Epoch 5: Self-Replication, Lineage Blueprint & Cloning Engine (AGENTS.md & EVOLUTION.md)

=== ACTIVE CLONE SEED SPECIFICATION ===
- Node Engine: v20+ / TypeScript 5.8
- Storage Engine: Transactional Disk-Backed JSON (server/database.ts)
- Outbox Protocol: schema_version 0.2.0 with owner_write_only: true
- Roles Configured: Culture Architect, Sourcing Agent, Match Arbitrageur, DB Custodian`;

  const agentsMdContent = `# AGENTS.md — NormsExchange Agent Blueprint & Instructions
Target: normsexchange-gemini | Protocol: nx-communications v0.2.0

1. CORE IDENTITY
Autonomous AI Agent operating at the junction of Team Behavioral Charters, High-Precision Equipment Sourcing, and Federated Multi-Agent Synchronization.

2. STATE & PERSISTENCE
- Disk Store: data/normsexchange_db.json
- Database API: /api/database/*
- Outbox Messages: outbox/messages/msg-*.json

3. CONVENTIONS FOR CLONED AGENTS
- Always ingest EVOLUTION.md before executing edits.
- Never clear existing catalog items on startup.
- Validate matching spreads before dispatching contracts.`;

  const cloneSeedContent = JSON.stringify(
    {
      clone_manifest_version: "1.0.0",
      parent_agent_id: "normsexchange-gemini-v0.2.0",
      generated_at: new Date().toISOString(),
      inherited_protocols: ["nx-communications@0.2.0", "nx-sourcing-contract@0.1.0"],
      database_state_summary: {
        total_listings: listings.length,
        wtb_demands: listings.filter(l => l.type === "WTB").length,
        wts_supply: listings.filter(l => l.type === "WTS").length,
        dispatched_outbox_messages: dispatchedContracts.length
      },
      evolution_epoch: "Epoch 5 (Self-Replication & Persistent Lineage)",
      bootstrap_command: "npm install && npm run build && npm start"
    },
    null,
    2
  );

  const currentContent = 
    activeFile === "EVOLUTION.md"
      ? evolutionContent
      : activeFile === "AGENTS.md"
      ? agentsMdContent
      : activeFile === "clone-seed.json"
      ? cloneSeedContent
      : activeFile === "agent-manifest.json" 
      ? JSON.stringify(manifestContent, null, 2)
      : activeFile === "outbox/index.json"
      ? JSON.stringify(outboxIndexContent, null, 2)
      : activeFile === "catalog/equipment-index.json"
      ? JSON.stringify(
          {
            generated_at: new Date().toISOString(),
            total_items: listings.length,
            wtb_demands: listings.filter((l) => l.type === "WTB").length,
            wts_supply: listings.filter((l) => l.type === "WTS").length,
            items: listings.map((l) => ({
              id: l.id,
              type: l.type,
              make: l.make,
              model: l.model,
              target_price: l.priceTarget,
              inferred_entity: l.contact.entityName,
              confidence: l.contact.inferenceConfidence,
              git_ref: l.githubIndexRef
            }))
          },
          null,
          2
        )
      : "// Select a file to view";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSeed = () => {
    const blob = new Blob([cloneSeedContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `normsexchange-agent-clone-seed-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFullZip = () => {
    window.location.href = "/api/export/zip";
  };

  const handleExecuteGitHubSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken.trim()) return;

    setSyncLoading(true);
    setSyncStatus(null);

    try {
      const res = await fetch("/api/github/push-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: githubToken.trim(),
          repo: targetRepo.trim(),
          branch: targetBranch.trim(),
          commitMessage: `feat: Sync persistent database, EVOLUTION.md, AGENTS.md, and epoch 5 lineage (${new Date().toISOString()})`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "GitHub sync failed.");
      }

      setSyncStatus({
        success: data.success,
        message: data.success ? "All project files successfully committed and pushed to GitHub!" : "Partial sync completed with some errors.",
        totalFiles: data.totalFiles,
        syncedCount: data.syncedCount,
        errorCount: data.errorCount,
        errors: data.errors
      });
    } catch (err: any) {
      setSyncStatus({
        success: false,
        message: err.message || "An unexpected error occurred during sync."
      });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-xs font-semibold text-emerald-400">
                GIT REPOSITORY: normsexchange-gemini/nx-gemini-communications_dev
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-xs text-indigo-400">EPOCH 5: AGENT CLONING & LINEAGE</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Agent Evolution History & Multi-Agent Lineage Console
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-3xl">
              All architectural evolutions, protocol changes (<code className="text-indigo-300">nx-communications v0.2.0</code>), and persistent catalog states are codified into standardized files to immediately jumpstart cloned subagents and cross-system handoffs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadFullZip}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-3.5 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/80 transition-all shadow-sm cursor-pointer"
              title="Download full project repository as a .zip"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Download Project ZIP</span>
            </button>

            <button
              onClick={() => setShowSyncModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-sm cursor-pointer"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Push to GitHub Repo</span>
            </button>

            <button
              onClick={handleDownloadSeed}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Clone Seed</span>
            </button>

            <a
              href="https://github.com/normsexchange-gemini/nx-gemini-communications_dev"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-slate-700"
            >
              <span>Repo</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Sync to GitHub Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <UploadCloud className="h-5 w-5 text-indigo-400" />
                <span>Direct GitHub Push & Backup</span>
              </div>
              <button
                onClick={() => {
                  setShowSyncModal(false);
                  setSyncStatus(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-300">
              Commit all current files (<code className="text-indigo-300">AGENTS.md</code>, <code className="text-purple-300">EVOLUTION.md</code>, <code className="text-emerald-300">data/normsexchange_db.json</code>, components, and server endpoints) directly to your GitHub repository using your GitHub Personal Access Token.
            </p>

            <form onSubmit={handleExecuteGitHubSync} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Repository
                </label>
                <input
                  type="text"
                  value={targetRepo}
                  onChange={(e) => setTargetRepo(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-850 px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  placeholder="owner/repository-name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-850 px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  placeholder="main"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Key className="h-3.5 w-3.5 text-amber-400" />
                    GitHub Personal Access Token (PAT)
                  </span>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Generate Token <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-850 px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Requires <code>repo</code> scope to write files. Token is used solely for this commit transaction.
                </span>
              </div>

              {syncStatus && (
                <div
                  className={`rounded-lg border p-3 text-xs ${
                    syncStatus.success
                      ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                      : "border-rose-500/40 bg-rose-950/40 text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    {syncStatus.success ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                    )}
                    <span>{syncStatus.message}</span>
                  </div>
                  {syncStatus.totalFiles && (
                    <div className="mt-1 font-mono text-[11px] text-slate-400">
                      Synced {syncStatus.syncedCount} / {syncStatus.totalFiles} files.
                    </div>
                  )}
                  {syncStatus.errors && syncStatus.errors.length > 0 && (
                    <div className="mt-2 max-h-24 overflow-y-auto space-y-1 font-mono text-[10px] text-rose-400">
                      {syncStatus.errors.map((err, i) => (
                        <div key={i}>⚠️ {err.path}: {err.error}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSyncModal(false)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={syncLoading || !githubToken.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {syncLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Pushing Files to GitHub...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Commit & Push Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tree */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4 font-mono text-xs">
          <div className="text-xs uppercase text-slate-400 font-bold tracking-wider mb-3 pb-2 border-b border-slate-800 flex items-center justify-between">
            <span>Repository & Evolution Files</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="space-y-1">
            {/* Evolution & Agent Instructions */}
            <div
              onClick={() => setActiveFile("EVOLUTION.md")}
              className={`flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer transition-all ${
                activeFile === "EVOLUTION.md" ? "bg-indigo-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <History className="h-4 w-4 text-purple-400" />
              <span>EVOLUTION.md</span>
              <span className="ml-auto rounded bg-purple-950/80 border border-purple-500/40 px-1 text-[9px] text-purple-300">
                Epoch 5
              </span>
            </div>

            <div
              onClick={() => setActiveFile("AGENTS.md")}
              className={`flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer transition-all ${
                activeFile === "AGENTS.md" ? "bg-indigo-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Bot className="h-4 w-4 text-cyan-400" />
              <span>AGENTS.md</span>
              <span className="ml-auto rounded bg-cyan-950/80 border border-cyan-500/40 px-1 text-[9px] text-cyan-300">
                Instructions
              </span>
            </div>

            <div
              onClick={() => setActiveFile("clone-seed.json")}
              className={`flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer transition-all ${
                activeFile === "clone-seed.json" ? "bg-indigo-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>clone-seed.json</span>
              <span className="ml-auto rounded bg-amber-950/80 border border-amber-500/40 px-1 text-[9px] text-amber-300">
                Clone Seed
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 my-2"></div>

            {/* Protocol Outbox */}
            <div
              onClick={() => setActiveFile("agent-manifest.json")}
              className={`flex items-center gap-2 rounded px-2.5 py-1.5 cursor-pointer transition-all ${
                activeFile === "agent-manifest.json" ? "bg-indigo-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <FileCode className="h-4 w-4 text-cyan-400" />
              <span>agent-manifest.json</span>
            </div>

            <div
              onClick={() => setActiveFile("outbox/index.json")}
              className={`flex items-center gap-2 rounded px-2.5 py-1.5 cursor-pointer transition-all ${
                activeFile === "outbox/index.json" ? "bg-indigo-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Folder className="h-4 w-4 text-amber-400" />
              <span>outbox/index.json</span>
              <span className="ml-auto rounded bg-slate-800 px-1 text-[10px] text-slate-400">
                {outboxIndexContent.messages.length} msg
              </span>
            </div>

            <div
              onClick={() => setActiveFile("catalog/equipment-index.json")}
              className={`flex items-center gap-2 rounded px-2.5 py-1.5 cursor-pointer transition-all ${
                activeFile === "catalog/equipment-index.json" ? "bg-indigo-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Folder className="h-4 w-4 text-emerald-400" />
              <span>catalog/equipment-index.json</span>
              <span className="ml-auto rounded bg-slate-800 px-1 text-[10px] text-slate-400">
                {listings.length} items
              </span>
            </div>
          </div>

          {/* Active Role Branches */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase font-bold mb-2">Conforming Role Branches</div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-cyan-300">
                <GitBranch className="h-3.5 w-3.5 text-slate-500" />
                <span>role/culture-architect/operating-norms</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300">
                <GitBranch className="h-3.5 w-3.5 text-slate-500" />
                <span>role/sourcing-agent/equipment-exchange</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <GitBranch className="h-3.5 w-3.5 text-slate-500" />
                <span>role/arbitrageur/contract-engine</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-300">
                <GitBranch className="h-3.5 w-3.5 text-slate-500" />
                <span>role/database-custodian/master-catalog</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <FileCode className="h-4 w-4 text-cyan-400" />
              <span>{activeFile}</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded bg-slate-800 px-3 py-1 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Content</span>
                </>
              )}
            </button>
          </div>

          <pre className="overflow-x-auto text-[11px] text-slate-300 max-h-[500px] leading-relaxed whitespace-pre-wrap">
            {currentContent}
          </pre>
        </div>
      </div>
    </div>
  );
};

