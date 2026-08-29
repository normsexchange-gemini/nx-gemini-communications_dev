import { EquipmentListing } from "../types";
import { generateBrandLogoSvgDataUrl } from "./equipmentLogos";

/**
 * Returns a high-definition representative image or authentic manufacturer brand logo
 * for any equipment listing when a direct photograph is unavailable.
 */
export function getEquipmentImageUrl(
  listing: EquipmentListing | { category: string; make?: string; model?: string; imageUrl?: string }
): string {
  // If the listing already has a real external photograph, use it
  if (
    listing.imageUrl &&
    listing.imageUrl.startsWith("http") &&
    !listing.imageUrl.includes("localhost")
  ) {
    return listing.imageUrl;
  }

  // Generate an authentic vector manufacturer logo and product badge
  return generateBrandLogoSvgDataUrl(listing.make, listing.model, listing.category);
}

