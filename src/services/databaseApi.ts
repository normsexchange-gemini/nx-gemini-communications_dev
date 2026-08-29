import { EquipmentListing, MarketDepthItem, PruneAuditReport } from "../types";

export interface DbStatusResponse {
  status: string;
  engine: string;
  filePath: string;
  version: string;
  lastUpdated: string;
  totalListings: number;
  totalWTB: number;
  totalWTS: number;
  totalMatches: number;
  totalOutboxEnvelopes: number;
  fileSizeBytes: number;
}

export interface DbStatsResponse {
  totalRecords: number;
  activeCount?: number;
  soldCount?: number;
  delistedCount?: number;
  archivedCount?: number;
  prunedCount?: number;
  wtbCount: number;
  wtsCount: number;
  matchedCount: number;
  totalWtbValue: number;
  totalWtsValue: number;
  totalArbitrageSpread: number;
  uniqueEntitiesCount: number;
  categoryCounts: Record<string, number>;
  conditionCounts: Record<string, number>;
  outboxMessagesCount: number;
  lastUpdated: string;
  dbFileSize: number;
}

export interface QueryListingsParams {
  q?: string;
  category?: string;
  type?: string;
  corridor?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  status?: string;
  verifiedOnly?: boolean;
  sortBy?: "match" | "margin" | "price-desc" | "price-asc" | "newest";
}

export const databaseApi = {
  async getStatus(): Promise<DbStatusResponse> {
    const res = await fetch("/api/database/status");
    if (!res.ok) throw new Error("Failed to fetch database status");
    return res.json();
  },

  async getListings(params: QueryListingsParams = {}): Promise<{ total: number; listings: EquipmentListing[] }> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set("q", params.q);
    if (params.category && params.category !== "All") searchParams.set("category", params.category);
    if (params.type && params.type !== "ALL") searchParams.set("type", params.type);
    if (params.corridor && params.corridor !== "ALL") searchParams.set("corridor", params.corridor);
    if (params.minPrice !== undefined && params.minPrice > 0) searchParams.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined && params.maxPrice > 0) searchParams.set("maxPrice", String(params.maxPrice));
    if (params.condition && params.condition !== "All") searchParams.set("condition", params.condition);
    if (params.status && params.status !== "ALL") searchParams.set("status", params.status);
    if (params.verifiedOnly) searchParams.set("verifiedOnly", "true");
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);

    const res = await fetch(`/api/database/listings?${searchParams.toString()}`);
    if (!res.ok) throw new Error("Failed to query database listings");
    return res.json();
  },

  async getCandidateBatch(corridor?: string, limit: number = 50): Promise<any> {
    const searchParams = new URLSearchParams();
    if (corridor && corridor !== "ALL") searchParams.set("corridor", corridor);
    searchParams.set("limit", String(limit));
    const res = await fetch(`/api/database/candidate-batch?${searchParams.toString()}`);
    if (!res.ok) throw new Error("Failed to export candidate batch");
    return res.json();
  },

  async getListingById(id: string): Promise<{ listing: EquipmentListing; matchedCandidate: EquipmentListing | null }> {
    const res = await fetch(`/api/database/listings/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error("Failed to fetch listing from database");
    return res.json();
  },

  async createListing(listing: Partial<EquipmentListing>): Promise<EquipmentListing> {
    const res = await fetch("/api/database/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(listing),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to create database listing");
    }
    const data = await res.json();
    return data.listing;
  },

  async createListingsBatch(listings: EquipmentListing[]): Promise<{ count: number; added: EquipmentListing[] }> {
    const res = await fetch("/api/database/listings/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listings }),
    });
    if (!res.ok) throw new Error("Failed to batch save listings");
    return res.json();
  },

  async updateListing(id: string, updates: Partial<EquipmentListing>): Promise<EquipmentListing> {
    const res = await fetch(`/api/database/listings/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update database listing");
    const data = await res.json();
    return data.listing;
  },

  async markListingStatus(id: string, status: "Active" | "Sold" | "Delisted" | "Archived", reason?: string): Promise<EquipmentListing> {
    const res = await fetch(`/api/database/listings/${encodeURIComponent(id)}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    if (!res.ok) throw new Error("Failed to update listing status");
    const data = await res.json();
    return data.listing;
  },

  async pruneListings(options: { mode?: "archive" | "purge"; simulateExternalAudit?: boolean } = {}): Promise<PruneAuditReport> {
    const res = await fetch("/api/database/prune", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    if (!res.ok) throw new Error("Failed to execute pruning audit");
    const data = await res.json();
    return data.report;
  },

  async deleteListing(id: string): Promise<boolean> {
    const res = await fetch(`/api/database/listings/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete database listing");
    return true;
  },

  async getStats(): Promise<DbStatsResponse> {
    const res = await fetch("/api/database/stats");
    if (!res.ok) throw new Error("Failed to fetch database stats");
    return res.json();
  },

  async getMarketDepth(): Promise<MarketDepthItem[]> {
    const res = await fetch("/api/database/market-depth");
    if (!res.ok) throw new Error("Failed to fetch market depth");
    const data = await res.json();
    return data.marketDepth || [];
  },

  async getOutbox(): Promise<any[]> {
    const res = await fetch("/api/database/outbox");
    if (!res.ok) throw new Error("Failed to fetch outbox");
    const data = await res.json();
    return data.outbox || [];
  },

  async saveOutboxEnvelope(envelope: any): Promise<any> {
    const res = await fetch("/api/database/outbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
    });
    if (!res.ok) throw new Error("Failed to save to outbox database");
    return res.json();
  },

  async seedAiRecords(category: string, customPrompt?: string, count: number = 2): Promise<EquipmentListing[]> {
    const res = await fetch("/api/database/ai-seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, customPrompt, count }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate AI seed records");
    }
    const data = await res.json();
    return data.generated || [];
  },

  async purgeAllListings(): Promise<{ success: boolean; purgedCount: number; remainingCount: number }> {
    const res = await fetch("/api/database/purge-all", {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to purge database records");
    return res.json();
  },

  async resetDatabase(): Promise<boolean> {
    const res = await fetch("/api/database/reset", {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to reset database");
    return true;
  },

  // Autonomous Crawler & Live Stream APIs
  async getCrawlerStatus(): Promise<any> {
    const res = await fetch("/api/crawler/status");
    if (!res.ok) throw new Error("Failed to fetch crawler status");
    return res.json();
  },

  async startCrawler(intervalMs?: number): Promise<any> {
    const res = await fetch("/api/crawler/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intervalMs }),
    });
    if (!res.ok) throw new Error("Failed to start autonomous crawler");
    return res.json();
  },

  async stopCrawler(): Promise<any> {
    const res = await fetch("/api/crawler/stop", {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to pause autonomous crawler");
    return res.json();
  },

  async stepCrawler(): Promise<{ success: boolean; newListing?: any; logEvents: any[] }> {
    const res = await fetch("/api/crawler/step", {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to execute crawler step");
    return res.json();
  },

  async runCrawlerBatch(count: number = 5): Promise<{ success: boolean; count: number; listings: any[] }> {
    const res = await fetch("/api/crawler/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });
    if (!res.ok) throw new Error("Failed to run crawler batch");
    return res.json();
  },

  async getCrawlerLogs(limit: number = 100): Promise<{ logs: any[] }> {
    const res = await fetch(`/api/crawler/logs?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch crawler logs");
    return res.json();
  },

  async clearCrawlerLogs(): Promise<boolean> {
    const res = await fetch("/api/crawler/clear-logs", {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to clear crawler logs");
    return true;
  },

  // Resilient Anti-Bot Site Indexer APIs
  async testSiteConnectivity(url: string): Promise<any> {
    const res = await fetch("/api/crawler/test-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error("Failed to test site connectivity");
    return res.json();
  },

  async indexTargetSite(params: {
    url: string;
    category?: string;
    corridor?: string;
    query?: string;
    maxItems?: number;
  }): Promise<any> {
    const res = await fetch("/api/crawler/index-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to index target site");
    }
    return res.json();
  },

  // Goals API
  async getGoals(): Promise<{ goals: any[]; summary: { total: number; completed: number; inProgress: number; avgProgress: number } }> {
    const res = await fetch("/api/goals");
    if (!res.ok) throw new Error("Failed to fetch goals");
    return res.json();
  },

  async createGoal(goal: any): Promise<{ success: boolean; goal: any }> {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goal),
    });
    if (!res.ok) throw new Error("Failed to create goal");
    return res.json();
  },

  async updateGoal(id: string, updates: any): Promise<{ success: boolean; goal: any }> {
    const res = await fetch(`/api/goals/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update goal");
    return res.json();
  },

  async toggleMilestone(goalId: string, milestoneId: string): Promise<{ success: boolean; goal: any }> {
    const res = await fetch(`/api/goals/${encodeURIComponent(goalId)}/milestones/${encodeURIComponent(milestoneId)}/toggle`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to toggle milestone");
    return res.json();
  },

  async executeGoal(id: string): Promise<{ success: boolean; goal: any; executionReport: any }> {
    const res = await fetch(`/api/goals/${encodeURIComponent(id)}/execute`, {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to execute goal");
    }
    return res.json();
  },

  getExportUrl(): string {
    return "/api/database/export";
  },
};
