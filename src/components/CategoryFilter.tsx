import React from "react";
import { NormCategory } from "../types";
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Scale, 
  Users, 
  SlidersHorizontal,
  Flame,
  ArrowUpDown
} from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: NormCategory;
  onSelectCategory: (category: NormCategory) => void;
  sortBy: "popular" | "reciprocity" | "clarity" | "newest";
  onSetSortBy: (sort: "popular" | "reciprocity" | "clarity" | "newest") => void;
  totalNorms: number;
}

const CATEGORIES: NormCategory[] = [
  "All",
  "Communication",
  "Engineering",
  "Reciprocity & Social",
  "Meetings & Time",
  "Decision Making",
  "Cross-Cultural",
  "Trade & Compliance",
  "Leadership",
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSetSortBy,
  totalNorms,
}) => {
  return (
    <div className="space-y-4">
      {/* Category Pills Scroller */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            ORDER_BY:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSetSortBy(e.target.value as any)}
            className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 font-mono transition-all"
          >
            <option value="popular">🔥 Most Adopted & Voted</option>
            <option value="reciprocity">⚖️ Highest Reciprocity Equity</option>
            <option value="clarity">🎯 Rule Clarity Score</option>
            <option value="newest">✨ Recently Minted</option>
          </select>
        </div>
      </div>
    </div>
  );
};

