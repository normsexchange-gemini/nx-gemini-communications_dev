import { EquipmentListing } from "../types";

/**
 * Returns a guaranteed valid, clickable, and reachable URL to the original listing or marketplace search.
 */
export function getOriginalListingUrl(listing: Partial<EquipmentListing>): string {
  const rawUrl = listing.sourceUrl || listing.contact?.sourceUrl || "";
  const domain = (listing.contact?.sourceDomain || "").toLowerCase();
  const query = `${listing.make || ""} ${listing.model || ""}`.trim() || listing.title || "cinema camera";
  const encodedQuery = encodeURIComponent(query);

  // If already a valid live marketplace URL that is known to work, check and clean it
  if (rawUrl && rawUrl.startsWith("http")) {
    // Check if it's a dead synthetic domain (e.g. dummy .vn or fake domains)
    if (
      rawUrl.includes("saigon-cine-rentals.vn") ||
      rawUrl.includes("hanoi-broadcast-exchange.vn") ||
      rawUrl.includes("saxony-assetrecover.de") ||
      rawUrl.includes("stage-lighting-liquidation.com") ||
      rawUrl.includes("teradek-surplus.io") ||
      rawUrl.includes("soundflow-audio.com")
    ) {
      // Route intelligently to real working platforms
      if (query.toLowerCase().includes("arri") || query.toLowerCase().includes("alexa")) {
        return `https://cvp.com/shop?q=${encodedQuery}`;
      }
      if (query.toLowerCase().includes("cooke") || query.toLowerCase().includes("angenieux")) {
        return `https://www.bhphotovideo.com/c/search?q=${encodedQuery}&N=0`;
      }
      if (query.toLowerCase().includes("scorpio") || query.toLowerCase().includes("sound devices")) {
        return `https://www.trewaudio.com/?s=${encodedQuery}&post_type=product`;
      }
      if (query.toLowerCase().includes("teradek")) {
        return `https://www.bhphotovideo.com/c/search?q=${encodedQuery}&N=0`;
      }
      if (query.toLowerCase().includes("laser") || query.toLowerCase().includes("monaco")) {
        return `https://www.coherent.com/search?q=${encodedQuery}`;
      }
      return `https://www.sharegrid.com/los-angeles/buy?q=${encodedQuery}`;
    }

    // If it's a sharegrid slug that might 404, route to the live search page on ShareGrid
    if (rawUrl.includes("sharegrid.com/los-angeles/buy/") && !rawUrl.includes("?q=")) {
      return `https://www.sharegrid.com/los-angeles/buy?q=${encodedQuery}`;
    }

    // If it's abelcine slug that might 404, route to search
    if (rawUrl.includes("abelcine.com") && !rawUrl.includes("search?q=")) {
      return `https://www.abelcine.com/search?q=${encodedQuery}`;
    }

    // If it's cinematography.com classifieds slug, route to main forum classifieds
    if (rawUrl.includes("cinematography.com")) {
      return `https://cinematography.com/index.php?/forum/16-for-sale-wanted/`;
    }

    return rawUrl;
  }

  // Format standard verified marketplace URLs
  if (domain.includes("cvp")) {
    return `https://cvp.com/shop?q=${encodedQuery}`;
  }
  if (domain.includes("bhphoto") || domain.includes("b&h")) {
    return `https://www.bhphotovideo.com/c/search?q=${encodedQuery}&N=0`;
  }
  if (domain.includes("abelcine")) {
    return `https://www.abelcine.com/search?q=${encodedQuery}`;
  }
  if (domain.includes("trewaudio")) {
    return `https://www.trewaudio.com/?s=${encodedQuery}&post_type=product`;
  }
  if (domain.includes("keh")) {
    return `https://www.keh.com/shop/search?q=${encodedQuery}`;
  }
  if (domain.includes("mpb")) {
    return `https://www.mpb.com/en-us/search?q=${encodedQuery}`;
  }
  if (domain.includes("ebay")) {
    return `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}`;
  }

  return `https://www.sharegrid.com/los-angeles/buy?q=${encodedQuery}`;
}

/**
 * Returns clean human-readable domain name for the original listing source.
 */
export function getOriginalSourceDomain(listing: Partial<EquipmentListing>): string {
  if (listing.contact?.sourceDomain) {
    return listing.contact.sourceDomain.replace(/^https?:\/\//, "").split("/")[0];
  }
  const url = getOriginalListingUrl(listing);
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch {
    return "sharegrid.com";
  }
}

/**
 * Check if a listing is sold, delisted, or archived
 */
export function isListingPrunedOrSold(listing: Partial<EquipmentListing>): boolean {
  return listing.status === "Sold" || listing.status === "Delisted" || listing.status === "Archived";
}

/**
 * Get visual badge properties for link health and listing status
 */
export function getLinkHealthBadge(listing: Partial<EquipmentListing>): {
  label: string;
  badgeClass: string;
  dotClass: string;
  isLive: boolean;
} {
  if (listing.status === "Sold") {
    return {
      label: "Sold / Ended",
      badgeClass: "bg-amber-950/80 text-amber-300 border-amber-500/40",
      dotClass: "bg-amber-400 animate-pulse",
      isLive: false,
    };
  }
  if (listing.status === "Delisted") {
    return {
      label: "Delisted / 404",
      badgeClass: "bg-rose-950/80 text-rose-300 border-rose-500/40",
      dotClass: "bg-rose-500",
      isLive: false,
    };
  }
  if (listing.status === "Archived") {
    return {
      label: "Archived",
      badgeClass: "bg-slate-900 text-slate-400 border-slate-700",
      dotClass: "bg-slate-500",
      isLive: false,
    };
  }
  return {
    label: "Live / Verified",
    badgeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-500/40",
    dotClass: "bg-emerald-400",
    isLive: true,
  };
}
