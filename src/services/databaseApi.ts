import { EquipmentListing, MarketDepthItem } from "../types";

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
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
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
    if (params.minPrice !== undefined && params.minPrice > 0) searchParams.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined && params.maxPrice > 0) searchParams.set("maxPrice", String(params.maxPrice));
    if (params.condition && params.condition !== "All") searchParams.set("condition", params.condition);
    if (params.verifiedOnly) searchParams.set("verifiedOnly", "true");
    if (params.sortBy) searchParams.set("sortBy", params.sortBy);

    const res = await fetch(`/api/database/listings?${searchParams.toString()}`);
    if (!res.ok) throw new Error("Failed to query database listings");
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

  async resetDatabase(): Promise<boolean> {
    const res = await fetch("/api/database/reset", {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to reset database");
    return true;
  },

  getExportUrl(): string {
    return "/api/database/export";
  },
};
