import type { MetadataRoute } from "next";
import { URL_BASE } from "../lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: URL_BASE, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
