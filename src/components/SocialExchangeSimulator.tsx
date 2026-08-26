import React, { useState } from "react";
import { INITIAL_SIMULATION_SCENARIOS } from "../data/initialNorms";
import { SocialExchangeScenario } from "../types";
import { 
  Activity, 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  Award, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Zap,
  Users
} from "lucide-react";

export const SocialExchangeSimulator: React.FC = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [chosenOptionId, setChosenOptionId] = useState<string | null>(null);
  
  // Ledger state
  const [actorAEquity, setActorAEquity] = useState(50);
  const [actorBEquity, setActorBEquity] = useState(50);
  const [trustLevel, setTrustLevel] = useState(65);
  const [historyLog, setHistoryLog] = useState<Array<{ scenarioTitle: string; outcomeText: string; trustChange: number }>>([]);

  const currentScenario = INITIAL_SIMULATION_SCENARIOS[selectedScenarioIndex];

  const handleSelectOption = (option: any) => {
    setChosenOptionId(option.id);
    setActorAEquity((prev) => Math.max(0, Math.min(100, prev + option.equityImpactA)));
    setActorBEquity((prev) => Math.max(0, Math.min(100, prev + option.equityImpactB)));
    setTrustLevel((prev) => Math.max(0, Math.min(100, prev + option.relationshipTrustChange)));
    
    setHistoryLog((prev) => [
      {
        scenarioTitle: currentScenario.title,
        outcomeText: option.outcomeText,
        trustChange: option.relationshipTrustChange,
      },
      ...prev,
    ]);
  };

  const handleReset = () => {
    setActorAEquity(50);
    setActorBEquity(50);
    setTrustLevel(65);
    setChosenOptionId(null);
    setHistoryLog([]);
  };

  const chosenOption = currentScenario.choiceOptions.find((o) => o.id === chosenOptionId);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header Info */}
      <div className="glass rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              SOCIAL EXCHANGE THEORY SANDBOX
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Interactive Reciprocity & Social Equity Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Test how different norm enforcement and favor fulfillment choices affect social debt, perceived fairness, and psychological safety in real-time.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors border border-slate-700/80"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Ledger</span>
        </button>
      </div>

      {/* Live Social Capital Balance Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold">{currentScenario.actorA} Capital</span>
            <span className="font-mono font-bold text-emerald-400">{actorAEquity}/100</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${actorAEquity}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">Perceived social balance & goodwill</span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold">{currentScenario.actorB} Capital</span>
            <span className="font-mono font-bold text-indigo-400">{actorBEquity}/100</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
              style={{ width: `${actorBEquity}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">Fulfillment satisfaction & fairness</span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold">Dyadic Trust & Safety</span>
            <span className={`font-mono font-bold ${trustLevel >= 60 ? "text-emerald-400" : "text-amber-400"}`}>
              {trustLevel}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                trustLevel >= 60 ? "bg-emerald-400" : "bg-amber-400"
              }`}
              style={{ width: `${trustLevel}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">Resilience against future misalignments</span>
        </div>
      </div>

      {/* Scenario Selector & Interactive Dilemma */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Scenarios Navigator */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            DILEMMA CASE STUDIES
          </h3>

          <div className="space-y-2">
            {INITIAL_SIMULATION_SCENARIOS.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioIndex(idx);
                  setChosenOptionId(null);
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all text-xs ${
                  selectedScenarioIndex === idx
                    ? "bg-slate-800/90 border-indigo-500/80 text-white shadow-lg shadow-indigo-500/10"
                    : "glass-card text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  <span className="h-5 w-5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-mono text-indigo-400">
                    {idx + 1}
                  </span>
                  <span className="text-slate-200">{sc.title}</span>
                </div>
                <p className="text-[11px] line-clamp-2 text-slate-400">
                  {sc.context}
                </p>
              </button>
            ))}
          </div>

          {/* Social Exchange Theory Explainer */}
          <div className="glass-card p-4 rounded-2xl text-xs space-y-2 text-slate-400">
            <span className="font-bold text-slate-200 block flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              <span>Core Law of Social Exchange</span>
            </span>
            <p className="leading-relaxed text-[11px]">
              When mutual expectations remain unwritten, human relationships default to asymmetrical mental tallies. Explicit norms convert implicit social debt into transparent, balanced reciprocity.
            </p>
          </div>
        </div>

        {/* Active Dilemma & Options */}
        <div className="lg:col-span-8 glass-card p-6 sm:p-8 rounded-2xl space-y-6">
          <div>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              INTERACTIVE SIMULATION
            </span>
            <h3 className="text-lg font-bold text-white mt-2">
              {currentScenario.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 bg-slate-950/80 p-4 rounded-xl border border-slate-800 leading-relaxed">
              {currentScenario.context}
            </p>
          </div>

          {/* Decision Paths */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
              CHOOSE AN OPERATIONAL ACTION PATH:
            </span>

            <div className="space-y-2.5">
              {currentScenario.choiceOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full text-left p-4 rounded-xl border transition-all text-xs ${
                    chosenOptionId === opt.id
                      ? "bg-indigo-950/50 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      chosenOptionId === opt.id ? "border-indigo-400 bg-indigo-400 text-slate-950" : "border-slate-600"
                    }`}>
                      {chosenOptionId === opt.id && <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                    </span>
                    <span className="leading-relaxed font-medium">{opt.action}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Outcome Breakdown */}
          {chosenOption && (
            <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
                  Simulation Outcome Analysis
                </span>
                <span className={`text-xs font-mono font-bold ${chosenOption.relationshipTrustChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {chosenOption.relationshipTrustChange >= 0 ? `+${chosenOption.relationshipTrustChange}% Trust` : `${chosenOption.relationshipTrustChange}% Trust`}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                {chosenOption.outcomeText}
              </p>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/90 italic">
                <strong>Theoretical Basis:</strong> {chosenOption.socialTheoryPrinciple}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

