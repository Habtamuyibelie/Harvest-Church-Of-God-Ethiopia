import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://harvestchurchethiopia.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "", "about", "contact", "programs", "sermons", "events",
    "ministries", "donate", "gallery", "newsletter",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
