import React, { useState, useEffect, useRef } from "react";
import { 
  Radio, 
  Sparkles, 
  Play, 
  Pause, 
  RefreshCw, 
  Zap, 
  Layers, 
  Globe, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink, 
  Trash2, 
  Terminal, 
  Clock, 
  ShieldCheck,
  Cpu,
  ArrowRight,
  Database,
  Bot
} from "lucide-react";
import { EquipmentListing } from "../types";
import { databaseApi } from "../services/databaseApi";
import { getEquipmentImageUrl } from "../utils/equipmentImages";

interface AutonomousScannerFeedProps {
  onListingIndexed?: (listing: EquipmentListing) => void;
  onSelectListing: (listing: EquipmentListing) => void;
  onNavigateToDb: () => void;
  onNavigateToMatches: () => void;
}

export const AutonomousScannerFeed: React.FC<AutonomousScannerFeedProps> = ({
  onListingIndexed,
  onSelectListing,
  onNavigateToDb,
  onNavigateToMatches,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [intervalSec, setIntervalSec] = useState<number>(6);
  const [statusData, setStatusData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [recentDiscovered, setRecentDiscovered] = useState<EquipmentListing[]>([]);
  const [isStepping, setIsStepping] = useState<boolean>(false);
  const [isBatching, setIsBatching] = useState<boolean>(false);
  const [logFilter, setLogFilter] = useState<string>("ALL");
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [purgeConfirmOpen, setPurgeConfirmOpen] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Poll status & fetch recent logs
  const fetchStatusAndLogs = async () => {
    try {
      const [status, logsRes] = await Promise.all([
        databaseApi.getCrawlerStatus().catch(() => null),
        databaseApi.getCrawlerLogs(80).catch(() => ({ logs: [] })),
      ]);

      if (status) {
        setStatusData(status);
        setIsRunning(status.isRunning);
      }
      if (logsRes?.logs) {
        setLogs(logsRes.logs);
      }
    } catch (err) {
      console.error("Error polling crawler status:", err);
    }
  };

  // Setup Server-Sent Events (SSE) stream for instant real-time pushes
  useEffect(() => {
    fetchStatusAndLogs();

    try {
      const es = new EventSource("/api/crawler/stream");
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          if (event && event.type !== "CONNECTED") {
            setLogs((prev) => [event, ...prev.slice(0, 150)]);

            if (event.type === "INDEXED_TO_DB" && event.data) {
              setRecentDiscovered((prev) => [event.data, ...prev.slice(0, 20)]);
              if (onListingIndexed) {
                onListingIndexed(event.data);
              }
            }
          }
        } catch (parseErr) {
          console.error("SSE parse error:", parseErr);
        }
      };

      es.onerror = () => {
        // Fallback to polling if SSE drops
        es.close();
      };
    } catch (err) {
      console.warn("SSE not supported, using polling fallback.");
    }

    const intervalTimer = setInterval(() => {
      fetchStatusAndLogs();
    }, 4000);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      clearInterval(intervalTimer);
    };
  }, []);

  // Auto-scroll log box
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  // Toggle Autonomous Scanner
  const handleToggleScanner = async () => {
    try {
      if (isRunning) {
        const res = await databaseApi.stopCrawler();
        setIsRunning(false);
        setStatusData(res.status);
        showFeedback("Autonomous scanning paused.");
      } else {
        const res = await databaseApi.startCrawler(intervalSec * 1000);
        setIsRunning(true);
        setStatusData(res.status);
        showFeedback(`Autonomous scanner activated (Speed: ${intervalSec}s).`);
      }
      fetchStatusAndLogs();
    } catch (err: any) {
      console.error("Error toggling crawler:", err);
      showFeedback(`Failed to toggle crawler: ${err.message}`);
    }
  };

  // Step single cycle
  const handleStepOnce = async () => {
    if (isStepping) return;
    setIsStepping(true);
    try {
      const res = await databaseApi.stepCrawler();
      if (res.success && res.newListing) {
        setRecentDiscovered((prev) => [res.newListing, ...prev.slice(0, 20)]);
        showFeedback(`Discovered & Indexed: ${res.newListing.make} ${res.newListing.model}`);
      }
      fetchStatusAndLogs();
    } catch (err: any) {
      console.error("Step error:", err);
      showFeedback(`Step failed: ${err.message}`);
    } finally {
      setIsStepping(false);
    }
  };

  // Run Batch Sweep
  const handleRunBatch = async (count: number) => {
    if (isBatching) return;
    setIsBatching(true);
    showFeedback(`Launching rapid multi-corridor sweep of ${count} listings...`);
    try {
      const res = await databaseApi.runCrawlerBatch(count);
      if (res.success) {
        if (res.listings && res.listings.length > 0) {
          setRecentDiscovered((prev) => [...res.listings, ...prev].slice(0, 25));
        }
        showFeedback(`Sweep completed: ${res.count} listings scoured and indexed into database!`);
      }
      fetchStatusAndLogs();
    } catch (err: any) {
      console.error("Batch error:", err);
      showFeedback(`Batch sweep failed: ${err.message}`);
    } finally {
      setIsBatching(false);
    }
  };

  // Clear Logs
  const handleClearLogs = async () => {
    try {
      await databaseApi.clearCrawlerLogs();
      setLogs([]);
      showFeedback("Telemetry logs cleared.");
    } catch (err: any) {
      console.error("Clear logs error:", err);
    }
  };

  // Purge All Records from Database
  const handlePurgeAll = async () => {
    try {
      const res = await databaseApi.purgeAllListings();
      setRecentDiscovered([]);
      setPurgeConfirmOpen(false);
      showFeedback(`Purged ${res.purgedCount} records. Database is now at 0 listings.`);
      fetchStatusAndLogs();
    } catch (err: any) {
      console.error("Purge error:", err);
      showFeedback(`Purge failed: ${err.message}`);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (logFilter === "ALL") return true;
    if (logFilter === "INDEXED") return log.type === "INDEXED_TO_DB";
    if (logFilter === "INFERENCE") return log.type === "ENTITY_INFERENCE";
    if (logFilter === "MATCHES") return log.type === "MATCH_FOUND";
    if (logFilter === "TARGETS") return log.type === "CRAWL_TARGET";
    return true;
  });

  const currentMission = statusData?.currentMission || {
    targetDomain: "sharegrid.com/los-angeles/buy",
    category: "Cameras & Systems",
    query: "ARRI Alexa 35 or Mini LF Cinema Package",
    corridor: "LA_TO_VN",
  };

  return (
    <div className="space-y-6">
      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-cyan-500/40 bg-slate-950/95 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Top Autonomous Mission Control Header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`flex h-6 items-center gap-1.5 rounded-full border px-3 font-mono text-xs font-bold transition-all ${
                isRunning 
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/20" 
                  : "border-amber-500/50 bg-amber-500/10 text-amber-400"
              }`}>
                <span className={`relative flex h-2 w-2`}>
                  {isRunning && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>}
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${isRunning ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                </span>
                {isRunning ? "AUTONOMOUS AGENT ACTIVE" : "SCANNER STANDBY"}
              </span>

              <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-300">
                LIVE WEB CRAWLER & EVIDENCE EXTRACTOR
              </span>

              <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] text-slate-300">
                LA ⇄ VIETNAM CORRIDOR
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Autonomous Equipment Sourcing & Live Indexing Stream
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Continuous autonomous crawler inspecting production rental house inventories, classified forums, and stage surplus. Ingests genuine listings, reconstructs seller contact intelligence, and indexes records into the local database store.
            </p>
          </div>

          {/* Master Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggleScanner}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-lg transition-all active:scale-95 ${
                isRunning
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20"
                  : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:brightness-110 shadow-emerald-500/20"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause Scanning</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-slate-950" />
                  <span>Start Autonomous Scan</span>
                </>
              )}
            </button>

            <button
              onClick={handleStepOnce}
              disabled={isStepping}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-sm font-semibold text-white transition-all hover:border-cyan-500/50 hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-cyan-400 ${isStepping ? "animate-spin" : ""}`} />
              <span>Step 1 Cycle</span>
            </button>

            <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/90 p-1">
              <button
                onClick={() => handleRunBatch(5)}
                disabled={isBatching}
                className="rounded-lg px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 disabled:opacity-50"
              >
                +5 Rapid
              </button>
              <button
                onClick={() => handleRunBatch(10)}
                disabled={isBatching}
                className="rounded-lg px-2.5 py-1.5 font-mono text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 disabled:opacity-50"
              >
                +10 Sweep
              </button>
            </div>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 border-t border-slate-800/80 pt-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <div className="font-mono text-[11px] text-slate-400">Total Scoured</div>
            <div className="mt-1 font-mono text-xl font-bold text-white">
              {statusData?.totalCyclesCompleted || 0}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <div className="font-mono text-[11px] text-slate-400">Indexed to DB</div>
            <div className="mt-1 font-mono text-xl font-bold text-emerald-400">
              {statusData?.totalListingsDiscovered || 0}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <div className="font-mono text-[11px] text-slate-400">WTS / WTB Ratio</div>
            <div className="mt-1 font-mono text-sm font-bold text-cyan-300 flex items-center gap-1.5">
              <span>{statusData?.stats?.wtsDiscovered || 0} S</span>
              <span className="text-slate-600">/</span>
              <span className="text-amber-400">{statusData?.stats?.wtbDiscovered || 0} B</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <div className="font-mono text-[11px] text-slate-400">Matches Detected</div>
            <div className="mt-1 font-mono text-xl font-bold text-amber-400">
              {statusData?.totalMatchesFound || 0}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-xl border border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
              <span>Cycle Speed:</span>
              <span className="text-cyan-400 font-bold">{intervalSec}s</span>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {[3, 6, 12].map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    setIntervalSec(sec);
                    if (isRunning) {
                      databaseApi.startCrawler(sec * 1000);
                    }
                  }}
                  className={`flex-1 rounded py-0.5 text-center font-mono text-[10px] font-bold transition-all ${
                    intervalSec === sec
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Target Radar Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Radio className={`h-5 w-5 ${isRunning ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-400">CURRENT TARGET MISSION:</span>
              <span className="font-mono text-xs font-bold text-cyan-400">{currentMission.targetDomain}</span>
            </div>
            <div className="text-sm font-bold text-white">
              "{currentMission.query}"
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setPurgeConfirmOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Purge All & Reset DB</span>
          </button>
        </div>
      </div>

      {/* Purge Confirmation Modal */}
      {purgeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">Reset Database to 0 Listings?</h3>
            </div>
            <p className="text-sm text-slate-300">
              This will purge all listings from the local store (<code className="text-red-300">normsexchange_db.json</code>) so you can start clean and let the autonomous scanner populate 100% genuine scoured leads.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPurgeConfirmOpen(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeAll}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-500"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout: Live Telemetry Terminal + Newly Discovered Equipment Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real-Time Telemetry Terminal */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <h3 className="font-mono text-sm font-bold text-white">AUTONOMOUS TELEMETRY STREAM</h3>
              <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                {filteredLogs.length} events
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter pills */}
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 font-mono text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Events</option>
                <option value="INDEXED">Indexed to DB</option>
                <option value="INFERENCE">Entity Inference</option>
                <option value="MATCHES">Arbitrage Matches</option>
                <option value="TARGETS">Target Crawls</option>
              </select>

              <button
                onClick={handleClearLogs}
                className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                title="Clear Logs"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Terminal Box */}
          <div className="h-[480px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs shadow-2xl space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredLogs.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-600">
                <div className="text-center space-y-2">
                  <Terminal className="h-8 w-8 mx-auto opacity-40 text-cyan-500" />
                  <p>Ready for telemetry. Click "Start Autonomous Scan" or "Step 1 Cycle".</p>
                </div>
              </div>
            ) : (
              filteredLogs.map((log) => {
                let badgeColor = "border-slate-700 bg-slate-800 text-slate-300";
                if (log.type === "INDEXED_TO_DB") badgeColor = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
                if (log.type === "ENTITY_INFERENCE") badgeColor = "border-indigo-500/40 bg-indigo-500/10 text-indigo-300";
                if (log.type === "MATCH_FOUND") badgeColor = "border-amber-500/40 bg-amber-500/10 text-amber-300";
                if (log.type === "CRAWL_TARGET") badgeColor = "border-cyan-500/40 bg-cyan-500/10 text-cyan-300";
                if (log.type === "SYSTEM" && log.level === "error") badgeColor = "border-red-500/40 bg-red-500/10 text-red-300";

                const time = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "";

                return (
                  <div key={log.id} className="rounded-lg border border-slate-900 bg-slate-900/40 p-2.5 hover:bg-slate-900/80 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${badgeColor}`}>
                          [{log.type}]
                        </span>
                        {log.targetDomain && (
                          <span className="text-slate-400 text-[11px]">
                            {log.targetDomain}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-600">{time}</span>
                    </div>

                    <div className="mt-1 text-slate-200 leading-relaxed font-sans text-xs">
                      {log.message}
                    </div>

                    {log.data && (log.type === "ENTITY_INFERENCE" || log.type === "MATCH_FOUND") && (
                      <div className="mt-1.5 rounded border border-slate-800/80 bg-slate-950 p-2 text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                        {log.data.entityName && (
                          <span>Entity: <strong className="text-slate-200">{log.data.entityName}</strong></span>
                        )}
                        {log.data.email && (
                          <span>Email: <strong className="text-cyan-400">{log.data.email}</strong></span>
                        )}
                        {log.data.grossSpread !== undefined && (
                          <span className="text-amber-400">Spread: <strong>${(log.data.grossSpread ?? 0).toLocaleString()} ({log.data.marginPct}%)</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Right Column: Live Stream of Indexed Equipment Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h3 className="font-mono text-sm font-bold text-white">LIVE INDEXED FEED</h3>
              <span className="rounded bg-emerald-950 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                {recentDiscovered.length} incoming
              </span>
            </div>

            <button
              onClick={onNavigateToDb}
              className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              <span>View Full DB</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Cards Stack */}
          <div className="h-[480px] overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {recentDiscovered.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 p-6 text-center text-slate-500">
                <Database className="h-10 w-10 text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-400">No new items in this session yet.</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Activate the autonomous scanner to see live scoured equipment records stream in.
                </p>
                <button
                  onClick={handleStepOnce}
                  className="mt-4 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-cyan-500"
                >
                  Scour 1st Live Listing
                </button>
              </div>
            ) : (
              recentDiscovered.map((item) => {
                const isWtb = item.type === "WTB";
                const imgUrl = getEquipmentImageUrl(item);

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectListing(item)}
                    className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg transition-all hover:border-cyan-500/50 hover:bg-slate-800/90"
                  >
                    <div className="flex gap-3">
                      {/* Logo / Specification Preview */}
                      <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-700/60 bg-slate-950">
                        <img
                          src={imgUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Content Block */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                              isWtb 
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            }`}>
                              {item.type}
                            </span>
                            <span className="inline-flex items-center gap-0.5 rounded bg-purple-950/80 border border-purple-500/40 px-1 py-0.2 text-[8px] font-mono font-bold text-purple-300">
                              <Bot className="h-2 w-2 text-purple-400" />
                              <span>AUTO</span>
                            </span>
                          </div>
                          <span className="font-mono text-sm font-black text-white">
                            ${(item.priceTarget || 0).toLocaleString()}
                          </span>
                        </div>

                        <h4 className="truncate text-xs font-bold text-white group-hover:text-cyan-300">
                          {item.make} {item.model}
                        </h4>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate">{item.contact?.entityName || "Dealer Lead"}</span>
                          <span className="text-slate-500">{item.contact?.location || "US Hub"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px] font-mono text-slate-400">
                      <span className="text-cyan-400 truncate max-w-[160px]">
                        {item.contact?.sourceDomain || "Verified Source"}
                      </span>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="h-3 w-3" />
                        <span>{item.contact?.inferenceConfidence || 95}% Conf</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
