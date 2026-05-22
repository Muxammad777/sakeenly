import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/profile", "/signin"],
      },
    ],
    sitemap: "https://sakeenly.com/sitemap.xml",
    host: "https://sakeenly.com",
  };
}
