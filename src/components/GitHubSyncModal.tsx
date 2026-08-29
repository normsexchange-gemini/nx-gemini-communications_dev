import React, { useState } from "react";
import { GitBranch, GitPullRequest, Check, AlertCircle, Loader2, ExternalLink, X, FolderGit2 } from "lucide-react";

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  charterMarkdown: string;
  charterTitle: string;
  teamName: string;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  charterMarkdown,
  charterTitle,
  teamName,
}) => {
  const [token, setToken] = useState(() => localStorage.getItem("norms_github_token") || "");
  const [owner, setOwner] = useState(() => localStorage.getItem("norms_github_owner") || "");
  const [repo, setRepo] = useState(() => localStorage.getItem("norms_github_repo") || "");
  const [filePath, setFilePath] = useState("TEAM_CHARTER.md");
  const [targetBranch, setTargetBranch] = useState("main");
  const [createPR, setCreatePR] = useState(false);
  const [prTitle, setPrTitle] = useState(`docs: update ${charterTitle} team charter`);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    url: string;
    type: "commit" | "pr";
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !owner || !repo || !filePath) {
      setError("Please provide your GitHub Personal Access Token, Repository Owner, and Repository Name.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessResult(null);

    // Persist credentials locally in browser
    localStorage.setItem("norms_github_token", token);
    localStorage.setItem("norms_github_owner", owner);
    localStorage.setItem("norms_github_repo", repo);

    try {
      const headers = {
        Authorization: `Bearer ${token.trim()}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };

      // 1. Verify repo and fetch default/target branch ref
      const repoRes = await fetch(`https://api.github.com/repos/${owner.trim()}/${repo.trim()}`, { headers });
      if (!repoRes.ok) {
        if (repoRes.status === 401) throw new Error("Invalid GitHub Token. Please check token permissions.");
        if (repoRes.status === 404) throw new Error(`Repository "${owner}/${repo}" was not found or access is forbidden.`);
        throw new Error(`GitHub API Error: ${repoRes.statusText}`);
      }
      const repoData = await repoRes.json();
      const baseBranch = targetBranch.trim() || repoData.default_branch || "main";

      // 2. Fetch existing file SHA if updating
      let existingSha: string | undefined = undefined;
      const getFileRes = await fetch(
        `https://api.github.com/repos/${owner.trim()}/${repo.trim()}/contents/${filePath.trim()}?ref=${baseBranch}`,
        { headers }
      );
      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        existingSha = fileData.sha;
      }

      // 3. UTF-8 to Base64 encode markdown content
      const utf8Bytes = new TextEncoder().encode(charterMarkdown);
      let binaryStr = "";
      for (let i = 0; i < utf8Bytes.length; i++) {
        binaryStr += String.fromCharCode(utf8Bytes[i]);
      }
      const base64Content = btoa(binaryStr);

      if (!createPR) {
        // Direct commit to branch
        const commitRes = await fetch(
          `https://api.github.com/repos/${owner.trim()}/${repo.trim()}/contents/${filePath.trim()}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({
              message: `docs: update ${charterTitle} (${teamName}) via NormsExchange`,
              content: base64Content,
              branch: baseBranch,
              ...(existingSha ? { sha: existingSha } : {}),
            }),
          }
        );

        if (!commitRes.ok) {
          const errData = await commitRes.json();
          throw new Error(errData.message || "Failed to commit charter file to GitHub repository.");
        }

        const commitData = await commitRes.json();
        setSuccessResult({
          url: commitData.content?.html_url || `https://github.com/${owner}/${repo}/blob/${baseBranch}/${filePath}`,
          type: "commit",
          message: `Successfully committed ${filePath} to branch '${baseBranch}'!`,
        });
      } else {
        // Create new branch and submit PR
        const refRes = await fetch(
          `https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/ref/heads/${baseBranch}`,
          { headers }
        );
        if (!refRes.ok) throw new Error(`Could not fetch head reference for branch '${baseBranch}'.`);
        const refData = await refRes.json();
        const baseSha = refData.object.sha;

        const newBranchName = `norms-charter-${Date.now().toString().slice(-4)}`;
        const createRefRes = await fetch(
          `https://api.github.com/repos/${owner.trim()}/${repo.trim()}/git/refs`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              ref: `refs/heads/${newBranchName}`,
              sha: baseSha,
            }),
          }
        );
        if (!createRefRes.ok) throw new Error("Failed to create new branch for pull request.");

        // Commit file to new branch
        const commitRes = await fetch(
          `https://api.github.com/repos/${owner.trim()}/${repo.trim()}/contents/${filePath.trim()}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({
              message: `docs: propose ${charterTitle} updates`,
              content: base64Content,
              branch: newBranchName,
            }),
          }
        );
        if (!commitRes.ok) throw new Error("Failed to commit charter file to feature branch.");

        // Open PR
        const prRes = await fetch(
          `https://api.github.com/repos/${owner.trim()}/${repo.trim()}/pulls`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              title: prTitle || `docs: update ${charterTitle} team charter`,
              head: newBranchName,
              base: baseBranch,
              body: `## 📜 Team Operating Charter Ratification\n\nThis pull request commits the ratified operating norms for **${teamName}** from [NormsExchange](https://normsexchange.dev).\n\n### Included Agreements\n- Explicit behavioral triggers and contractual rules\n- Blameless violation remedies\n- Social reciprocity balance matrix\n\n*Generated with NormsExchange & Gemini 3.7 Flash.*`,
            }),
          }
        );
        if (!prRes.ok) {
          const prErr = await prRes.json();
          throw new Error(prErr.message || "Failed to open Pull Request on GitHub.");
        }
        const prData = await prRes.json();
        setSuccessResult({
          url: prData.html_url,
          type: "pr",
          message: `Pull Request #${prData.number} successfully created!`,
        });
      }
    } catch (err: any) {
      console.error("GitHub Sync error:", err);
      setError(err.message || "An unexpected error occurred during GitHub sync.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="glass rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <FolderGit2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Sync Charter to GitHub
              </h2>
              <p className="text-xs text-slate-400">
                Commit <code className="text-indigo-300 font-mono">TEAM_CHARTER.md</code> directly or open a Pull Request
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {successResult ? (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-3 text-center animate-in zoom-in-95 duration-150">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-emerald-300">
                {successResult.message}
              </h3>
              <p className="text-slate-300 text-xs">
                Your team charter has been committed to the repository and is ready for team review.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <a
                  href={successResult.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-950/50"
                >
                  <span>View on GitHub</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setSuccessResult(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Sync Again
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSync} className="space-y-4">
              {/* Token Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300">
                    GitHub Personal Access Token (PAT) *
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Generate token (`repo` scope)</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Repo & Owner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
                    Repository Owner / Org *
                  </label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="e.g. your-org or username"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
                    Repository Name *
                  </label>
                  <input
                    type="text"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    placeholder="e.g. backend-api or company-handbook"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* File Path & Target Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
                    Target File Path
                  </label>
                  <input
                    type="text"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    placeholder="TEAM_CHARTER.md or .github/NORMS.md"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
                    Target Branch
                  </label>
                  <input
                    type="text"
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* PR Mode Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <GitPullRequest className="h-4 w-4 text-indigo-400" />
                  <div>
                    <span className="font-semibold text-slate-200 block text-xs">
                      Submit as Pull Request (PR)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Creates a feature branch and opens a PR for team review instead of direct commit
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={createPR}
                  onChange={(e) => setCreatePR(e.target.checked)}
                  className="h-4 w-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {createPR && (
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
                    PR Title
                  </label>
                  <input
                    type="text"
                    value={prTitle}
                    onChange={(e) => setPrTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 flex items-start gap-2 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-700/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Syncing to GitHub...</span>
                    </>
                  ) : (
                    <>
                      {createPR ? <GitPullRequest className="h-3.5 w-3.5" /> : <GitBranch className="h-3.5 w-3.5" />}
                      <span>{createPR ? "Open Pull Request" : "Commit to GitHub"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
