import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private surfaces: portals, APIs, and the per-order payment page.
        disallow: ["/dashboard", "/admin", "/api", "/order/*/pay", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
