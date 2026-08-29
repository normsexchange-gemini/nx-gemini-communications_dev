import React, { useState, useEffect } from "react";
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Zap, 
  Play, 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  Search, 
  Plus, 
  RefreshCw, 
  Layers, 
  Building2, 
  DollarSign, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Database,
  Radio
} from "lucide-react";
import { AgentGoal, EquipmentListing, SiteIndexTestResult, EquipmentCategory, TradeCorridor } from "../types";
import { databaseApi } from "../services/databaseApi";

interface GoalConsoleProps {
  onListingIndexed?: (listing: EquipmentListing) => void;
  onNavigateToDb: () => void;
  onNavigateToScanner: () => void;
}

const PRESET_INDEX_TARGETS = [
  { domain: "sharegrid.com/los-angeles/buy", name: "ShareGrid LA", category: "Cameras & Systems", corridor: "LA_TO_VN" },
  { domain: "cinematography.com/classifieds", name: "Cinematography.com", category: "Lenses & Optics", corridor: "LA_TO_VN" },
  { domain: "reduser.net/forum/wtb", name: "REDuser WTB", category: "Cameras & Systems", corridor: "DOMESTIC_US" },
  { domain: "abelcine.com/used-equipment", name: "AbelCine Used", category: "Lenses & Optics", corridor: "LA_TO_VN" },
  { domain: "mpb.com/en-us/cinema", name: "MPB Cinema", category: "Cameras & Systems", corridor: "DOMESTIC_US" },
  { domain: "saigon-cine-rentals.vn/surplus", name: "Saigon Cine Rentals", category: "Cameras & Systems", corridor: "LA_TO_VN" },
  { domain: "hanoi-broadcast-exchange.vn/demands", name: "Hanoi Broadcast", category: "Lighting & Grip", corridor: "LA_TO_VN" },
  { domain: "soundflow-audio.com/used", name: "SoundFlow Audio", category: "Professional Audio", corridor: "DOMESTIC_US" },
];

export const GoalConsole: React.FC<GoalConsoleProps> = ({
  onListingIndexed,
  onNavigateToDb,
  onNavigateToScanner,
}) => {
  const [goals, setGoals] = useState<AgentGoal[]>([]);
  const [summary, setSummary] = useState<{ total: number; completed: number; inProgress: number; avgProgress: number }>({
    total: 0,
    completed: 0,
    inProgress: 0,
    avgProgress: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [executingGoalId, setExecutingGoalId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Anti-Bot Site Indexer State
  const [targetUrl, setTargetUrl] = useState<string>("sharegrid.com/los-angeles/buy");
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>("Cameras & Systems");
  const [selectedCorridor, setSelectedCorridor] = useState<TradeCorridor>("LA_TO_VN");
  const [specificQuery, setSpecificQuery] = useState<string>("");
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [probeResult, setProbeResult] = useState<any | null>(null);
  const [indexResult, setIndexResult] = useState<SiteIndexTestResult | null>(null);

  // New Goal Modal
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState<boolean>(false);
  const [newGoalTitle, setNewGoalTitle] = useState<string>("");
  const [newGoalCategory, setNewGoalCategory] = useState<AgentGoal["category"]>("Site Indexing & Sourcing");
  const [newGoalDesc, setNewGoalDesc] = useState<string>("");
  const [newGoalTarget, setNewGoalTarget] = useState<number>(10);
  const [newGoalUnit, setNewGoalUnit] = useState<string>("Items Indexed");
  const [newGoalPriority, setNewGoalPriority] = useState<"CRITICAL" | "HIGH" | "MEDIUM">("HIGH");

  const showNotification = (text: string, type: "success" | "error" | "info" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const res = await databaseApi.getGoals();
      setGoals(res.goals || []);
      setSummary(res.summary || { total: 0, completed: 0, inProgress: 0, avgProgress: 0 });
    } catch (err: any) {
      console.error("Error loading goals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleExecuteGoal = async (goal: AgentGoal) => {
    if (executingGoalId) return;
    setExecutingGoalId(goal.id);
    showNotification(`Executing autonomous routine for: "${goal.title}"...`, "info");

    try {
      const res = await databaseApi.executeGoal(goal.id);
      if (res.success) {
        showNotification(res.executionReport?.message || `Goal updated to ${res.goal?.progress}%!`, "success");
        loadGoals();
      }
    } catch (err: any) {
      console.error("Error executing goal:", err);
      showNotification(`Execution failed: ${err.message}`, "error");
    } finally {
      setExecutingGoalId(null);
    }
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    try {
      await databaseApi.toggleMilestone(goalId, milestoneId);
      loadGoals();
    } catch (err) {
      console.error("Error toggling milestone:", err);
    }
  };

  const handleProbeSite = async () => {
    if (!targetUrl.trim()) return;
    setIsProbing(true);
    setProbeResult(null);
    setIndexResult(null);

    try {
      const res = await databaseApi.testSiteConnectivity(targetUrl);
      setProbeResult(res);
      if (res.botBlocked) {
        showNotification(`Anti-Bot protection detected (${res.blockReason || "WAF 403"}). Search Grounding ready to bypass.`, "info");
      } else {
        showNotification(`Site is directly reachable (HTTP ${res.httpStatus}).`, "success");
      }
    } catch (err: any) {
      setProbeResult({
        reachable: false,
        httpStatus: 0,
        botBlocked: true,
        blockReason: err.message,
      });
    } finally {
      setIsProbing(false);
    }
  };

  const handleIndexSite = async () => {
    if (!targetUrl.trim()) return;
    setIsIndexing(true);
    setIndexResult(null);

    try {
      const res: SiteIndexTestResult = await databaseApi.indexTargetSite({
        url: targetUrl,
        category: selectedCategory === "All" ? "Cameras & Systems" : selectedCategory,
        corridor: selectedCorridor,
        query: specificQuery,
        maxItems: 2,
      });

      setIndexResult(res);
      showNotification(res.rawSummary, "success");

      if (res.extractedItems && res.extractedItems.length > 0 && onListingIndexed) {
        res.extractedItems.forEach((item) => onListingIndexed(item));
      }
      loadGoals();
    } catch (err: any) {
      console.error("Index site error:", err);
      showNotification(`Failed to index site: ${err.message}`, "error");
    } finally {
      setIsIndexing(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    try {
      await databaseApi.createGoal({
        title: newGoalTitle,
        category: newGoalCategory,
        description: newGoalDesc,
        targetCount: Number(newGoalTarget),
        currentCount: 0,
        unit: newGoalUnit,
        status: "IN_PROGRESS",
        priority: newGoalPriority,
        corridor: "LA_TO_VN",
        actionLabel: `Execute ${newGoalTitle}`,
        actionType: "INDEX_SWEEP",
        milestones: [
          { id: "m-custom-1", title: `Phase 1: Initial Discovery`, completed: false },
          { id: "m-custom-2", title: `Phase 2: Target Fulfillment (${newGoalTarget} ${newGoalUnit})`, completed: false },
        ],
      });

      setIsNewGoalModalOpen(false);
      setNewGoalTitle("");
      setNewGoalDesc("");
      showNotification("New autonomous goal registered successfully!", "success");
      loadGoals();
    } catch (err: any) {
      showNotification(`Failed to create goal: ${err.message}`, "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`fixed top-16 right-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-2xl backdrop-blur-md transition-all ${
            feedbackMsg.type === "success"
              ? "border-emerald-500/30 bg-emerald-950/90 text-emerald-300"
              : feedbackMsg.type === "error"
              ? "border-rose-500/30 bg-rose-950/90 text-rose-300"
              : "border-cyan-500/30 bg-cyan-950/90 text-cyan-300"
          }`}
        >
          {feedbackMsg.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          {feedbackMsg.type === "error" && <AlertCircle className="h-4 w-4 text-rose-400" />}
          {feedbackMsg.type === "info" && <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 font-mono text-xs font-semibold text-indigo-400">
                <Target className="h-3 w-3" />
                AUTONOMOUS GOAL ORCHESTRATION & RESILIENT SITE INDEXER
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-300">
                BOT-BLOCK BYPASS v0.3.0
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              Agent Objectives, Strategic Milestones & Anti-Bot Indexing
            </h2>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Track real-time multi-corridor sourcing goals, execute automated sweeps, bypass Cloudflare/WAF bot blocks on cinema exchanges, and dispatch bilateral arbitrage contracts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewGoalModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:brightness-110 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Set New /goal</span>
            </button>
            <button
              onClick={loadGoals}
              className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
              title="Refresh Goals"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-800/80 pt-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="text-xs font-mono text-slate-400">Active Goals</div>
            <div className="mt-1 text-xl font-bold text-white font-mono">{summary.total}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="text-xs font-mono text-slate-400">Overall Progress</div>
            <div className="mt-1 text-xl font-bold text-cyan-400 font-mono">{summary.avgProgress}%</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="text-xs font-mono text-slate-400">Completed Objectives</div>
            <div className="mt-1 text-xl font-bold text-emerald-400 font-mono">{summary.completed}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <div className="text-xs font-mono text-slate-400">Anti-Bot Bypass Engine</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: RESILIENT ANTI-BOT SITE INDEXER & PROBER */}
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Live Site Indexer & Bot-Bypass Tester</h3>
              <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-cyan-300 font-semibold">
                TIER 1 (BROWSER) + TIER 2 (SEARCH GROUNDING)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              If an external site blocks standard HTTP crawlers with Cloudflare 403 or captcha, our engine activates Gemini Search Grounding to index live equipment specs & seller contacts without failures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">TARGET CORRIDOR:</span>
            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value as TradeCorridor)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-mono text-amber-400 focus:outline-none focus:border-cyan-500"
            >
              <option value="LA_TO_VN">LA ⇄ Vietnam</option>
              <option value="DOMESTIC_US">Intra-US Domestic</option>
              <option value="VN_TO_US">Vietnam ➔ US</option>
              <option value="ALL">Global / Multi-Corridor</option>
            </select>
          </div>
        </div>

        {/* URL Input Bar */}
        <div className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="Enter marketplace URL (e.g. sharegrid.com/los-angeles/buy, reduser.net, cinematography.com)"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
              />
            </div>

            <button
              onClick={handleProbeSite}
              disabled={isProbing || !targetUrl.trim()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-700 hover:text-white disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>{isProbing ? "Probing WAF..." : "Probe Bot Status"}</span>
            </button>

            <button
              onClick={handleIndexSite}
              disabled={isIndexing || !targetUrl.trim()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <Zap className={`h-4 w-4 ${isIndexing ? "animate-spin" : ""}`} />
              <span>{isIndexing ? "Indexing & Extracting..." : "Index Site & Bypass Blocks"}</span>
            </button>
          </div>

          {/* Preset Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono text-slate-400 mr-1">PRESET TARGETS:</span>
            {PRESET_INDEX_TARGETS.map((target, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTargetUrl(target.domain);
                  setSelectedCategory(target.category as EquipmentCategory);
                  setSelectedCorridor(target.corridor as TradeCorridor);
                }}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-mono transition-all ${
                  targetUrl === target.domain
                    ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {target.name}
              </button>
            ))}
          </div>

          {/* Probe Diagnosis Report */}
          {probeResult && (
            <div className={`mt-3 rounded-xl border p-4 text-xs font-mono transition-all ${
              probeResult.botBlocked 
                ? "border-amber-500/30 bg-amber-950/20 text-amber-300"
                : "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  {probeResult.botBlocked ? <AlertCircle className="h-4 w-4 text-amber-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  DIAGNOSTIC STATUS: {probeResult.botBlocked ? "BOT PROTECTION TRIGGERED" : "DIRECT ACCESS OK"}
                </span>
                <span className="rounded bg-slate-950 px-2 py-0.5 text-[10px] text-slate-300">
                  HTTP Status: {probeResult.httpStatus || "Timeout"}
                </span>
              </div>
              <div className="mt-2 text-slate-300">
                {probeResult.botBlocked ? (
                  <p>
                    <strong className="text-amber-400">Block Reason:</strong> {probeResult.blockReason || "WAF 403 Forbidden"}.{" "}
                    <span className="text-cyan-300">Resilient Anti-Bot Fallback will automatically query Google Search Grounding to index authentic live listings without failing.</span>
                  </p>
                ) : (
                  <p>Direct HTTP connection established successfully with browser-mimicking headers.</p>
                )}
              </div>
            </div>
          )}

          {/* Index Result View */}
          {indexResult && (
            <div className="mt-4 rounded-xl border border-cyan-500/40 bg-slate-950/90 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Indexed {indexResult.extractedCount} Listing(s) into Database</span>
                  <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                    {indexResult.fetchMethod}
                  </span>
                </div>
                <button
                  onClick={onNavigateToDb}
                  className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  <span>View in Database</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Listing Previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {indexResult.extractedItems.map((item, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-indigo-300">
                        {item.type} • {item.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        ${(item.priceTarget ?? 0).toLocaleString()} {item.currency || "USD"}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">{item.title}</div>
                    <div className="text-xs text-slate-300 line-clamp-2">{item.description}</div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                      <span>{item.contact?.entityName || "Rental House"} ({item.contact?.location || "LA"})</span>
                      <span className="text-cyan-400">Conf: {item.contact?.inferenceConfidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: ACTIVE GOALS DASHBOARD */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Active Strategic Goals ({goals.length})</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            AUTO-SYNCED WITH PROTOCOL v0.3.0
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`rounded-2xl border bg-slate-900/80 p-5 backdrop-blur-md transition-all ${
                goal.status === "COMPLETED"
                  ? "border-emerald-500/30 hover:border-emerald-500/50"
                  : goal.priority === "CRITICAL"
                  ? "border-amber-500/30 hover:border-amber-500/50"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${
                      goal.priority === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : goal.priority === "HIGH"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-slate-800 text-slate-300"
                    }`}>
                      {goal.priority} PRIORITY
                    </span>
                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] text-indigo-300 font-semibold">
                      {goal.category}
                    </span>
                    {goal.corridor && (
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-amber-400">
                        {goal.corridor}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-2 text-base font-bold text-white tracking-tight">{goal.title}</h4>
                </div>

                <span className={`rounded-full px-2.5 py-1 font-mono text-xs font-bold ${
                  goal.status === "COMPLETED"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                }`}>
                  {goal.status === "COMPLETED" ? "COMPLETED" : `${goal.progress}%`}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-300 leading-relaxed">{goal.description}</p>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Progress Target</span>
                  <span className="font-bold text-slate-200">
                    {(goal.currentCount ?? 0).toLocaleString()} / {(goal.targetCount ?? 0).toLocaleString()} {goal.unit}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      goal.status === "COMPLETED"
                        ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                        : "bg-gradient-to-r from-indigo-500 to-cyan-400"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, goal.progress))}%` }}
                  />
                </div>
              </div>

              {/* Milestones Checklist */}
              {goal.milestones && goal.milestones.length > 0 && (
                <div className="mt-4 border-t border-slate-800/80 pt-3 space-y-1.5">
                  <div className="text-[11px] font-mono text-slate-400">KEY MILESTONES:</div>
                  <div className="space-y-1">
                    {goal.milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleToggleMilestone(goal.id, m.id)}
                        className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white"
                      >
                        <input
                          type="checkbox"
                          checked={m.completed}
                          onChange={() => handleToggleMilestone(goal.id, m.id)}
                          className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                        />
                        <span className={m.completed ? "line-through text-slate-500" : ""}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <div className="text-[10px] font-mono text-slate-500">
                  {goal.lastExecutedAt ? `Last run: ${new Date(goal.lastExecutedAt).toLocaleTimeString()}` : "Not yet run"}
                </div>

                <button
                  onClick={() => handleExecuteGoal(goal)}
                  disabled={executingGoalId === goal.id}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-600 hover:text-white disabled:opacity-50"
                >
                  <Zap className={`h-3.5 w-3.5 ${executingGoalId === goal.id ? "animate-spin text-cyan-400" : ""}`} />
                  <span>{executingGoalId === goal.id ? "Executing..." : goal.actionLabel || "Execute Goal"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEW GOAL MODAL */}
      {isNewGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Define New Autonomous /goal</h3>
              </div>
              <button
                onClick={() => setIsNewGoalModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="font-mono text-slate-400">Goal Title</label>
                <input
                  type="text"
                  required
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Index ARRI 35 Packages under $70k in Vietnam"
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono text-slate-400">Category</label>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Site Indexing & Sourcing">Site Indexing & Sourcing</option>
                    <option value="Market Arbitrage">Market Arbitrage</option>
                    <option value="Outbox & Codex">Outbox & Codex</option>
                    <option value="Hygiene & Audit">Hygiene & Audit</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-slate-400">Priority</label>
                  <select
                    value={newGoalPriority}
                    onChange={(e) => setNewGoalPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-slate-400">Description & Mission Intent</label>
                <textarea
                  rows={2}
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  placeholder="Describe what the agent should target and achieve..."
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono text-slate-400">Target Count</label>
                  <input
                    type="number"
                    min={1}
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-mono text-slate-400">Unit of Measure</label>
                  <input
                    type="text"
                    value={newGoalUnit}
                    onChange={(e) => setNewGoalUnit(e.target.value)}
                    placeholder="e.g. Items Indexed, USD Spread"
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewGoalModalOpen(false)}
                  className="rounded-lg border border-slate-800 px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-1.5 font-bold text-white shadow-md hover:brightness-110"
                >
                  Commit Goal to Network
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
