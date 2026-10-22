import type { MetadataRoute } from "next";
import { SITE } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, freq: "daily" },
    { path: "/pulsa", priority: 0.9, freq: "weekly" },
    { path: "/pln", priority: 0.9, freq: "weekly" },
    { path: "/ewallet", priority: 0.9, freq: "weekly" },
    { path: "/game", priority: 0.9, freq: "weekly" },
    { path: "/bpjs", priority: 0.9, freq: "weekly" },
    { path: "/pdam", priority: 0.9, freq: "weekly" },
    { path: "/tagihan", priority: 0.8, freq: "weekly" },
    { path: "/cek", priority: 0.6, freq: "monthly" },
  ];

  return routes.map((route) => ({
    url: `${SITE.url}${route.path}`,
    lastModified,
    changeFrequency: route.freq,
    priority: route.priority,
  }));
}
