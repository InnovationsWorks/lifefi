import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/", "/connect"],
    },
    sitemap: "https://lifefi.ai/sitemap.xml",
    host: "https://lifefi.ai",
  };
}
