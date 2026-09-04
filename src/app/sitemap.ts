import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/** Public pages only — dashboard, admin and payment routes stay out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/pricing"), lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/portfolio"), lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/order/new"), lastModified, changeFrequency: "yearly", priority: 0.8 },
  ];
}
