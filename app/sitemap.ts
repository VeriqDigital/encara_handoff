import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  // No production origin or indexable pages are established for this preview.
  return [];
}
