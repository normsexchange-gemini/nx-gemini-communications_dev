import { ListingSource, SourceProbeResult, SourceProbeBatchResponse, SourcesApiResponse } from "../types";

export interface SourcesQueryParams {
  q?: string;
  corridor?: string;
  accessMethod?: string;
  status?: string;
  spideringAllowed?: boolean;
  tier?: string;
  apiFilter?: string;
  sortBy?: "name" | "status" | "requests" | "uptime" | "latency";
}

export const sourcesApi = {
  /**
   * Fetch all sources matching optional filters
   */
  async getSources(params: SourcesQueryParams = {}): Promise<SourcesApiResponse> {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.corridor && params.corridor !== "ALL") query.set("corridor", params.corridor);
    if (params.accessMethod && params.accessMethod !== "ALL") query.set("accessMethod", params.accessMethod);
    if (params.status && params.status !== "ALL") query.set("status", params.status);
    if (params.spideringAllowed !== undefined) query.set("spideringAllowed", String(params.spideringAllowed));
    if (params.tier && params.tier !== "ALL") query.set("tier", params.tier);
    if (params.apiFilter !== undefined) query.set("apiFilter", String(params.apiFilter));
    if (params.sortBy) query.set("sortBy", params.sortBy);

    const queryString = query.toString();
    const url = `/api/sources${queryString ? `?${queryString}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch sources: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Fetch single source by ID
   */
  async getSourceById(id: string): Promise<{ source: ListingSource }> {
    const res = await fetch(`/api/sources/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch source ${id}: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Create a new source in the GitHub-backed registry
   */
  async createSource(source: Partial<ListingSource>): Promise<{ success: boolean; source: ListingSource }> {
    const res = await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(source),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create source`);
    }
    return res.json();
  },

  /**
   * Update an existing source
   */
  async updateSource(id: string, updates: Partial<ListingSource>): Promise<{ success: boolean; source: ListingSource }> {
    const res = await fetch(`/api/sources/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update source ${id}`);
    }
    return res.json();
  },

  /**
   * Delete a source from registry
   */
  async deleteSource(id: string): Promise<{ success: boolean; deletedId: string }> {
    const res = await fetch(`/api/sources/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to delete source ${id}`);
    }
    return res.json();
  },

  /**
   * Toggle pause / resume on a source
   */
  async togglePause(id: string): Promise<{ success: boolean; source: ListingSource }> {
    const res = await fetch(`/api/sources/${id}/toggle-pause`, {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to toggle status`);
    }
    return res.json();
  },

  /**
   * Probe single source for live latency, HTTP code, and health
   */
  async probeSource(id: string, testUrl?: string): Promise<{ success: boolean; result: SourceProbeResult; source: ListingSource }> {
    const res = await fetch(`/api/sources/${id}/probe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to probe source ${id}`);
    }
    return res.json();
  },

  /**
   * Probe all sources in registry
   */
  async probeAll(): Promise<SourceProbeBatchResponse> {
    const res = await fetch("/api/sources/probe-all", {
      method: "POST",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to probe sources");
    }
    return res.json();
  },

  /**
   * Reset hourly metering quota counters
   */
  async resetMetering(sourceId?: string): Promise<{ success: boolean; resetCount: number }> {
    const res = await fetch("/api/sources/reset-metering", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId }),
    });
    if (!res.ok) {
      throw new Error("Failed to reset metering");
    }
    return res.json();
  },

  /**
   * Download sources JSON registry for Git
   */
  getExportUrl(): string {
    return "/api/sources/export-github";
  },
};
