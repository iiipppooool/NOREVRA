import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { collections } from "@/data/collections";
import { journal } from "@/data/journal";
import { legalDocuments } from "@/data/legal";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const stat = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    lastModified: Date | string = now,
  ) => ({ url: `${siteUrl}${path}`, lastModified, changeFrequency, priority });

  return [
    stat("/", 1, "weekly"),
    stat("/furniture", 0.9, "weekly"),
    stat("/collections", 0.9, "monthly"),
    stat("/our-story", 0.7, "yearly"),
    stat("/journal", 0.7, "monthly"),
    stat("/contact", 0.6, "yearly"),
    ...collections.map((c) => stat(`/collections/${c.id}`, 0.8, "monthly")),
    ...products.map((p) => stat(`/furniture/${p.slug}`, 0.8, "weekly")),
    ...journal.map((p) => stat(`/journal/${p.slug}`, 0.6, "yearly", p.date)),
    ...legalDocuments.map((d) => stat(`/legal/${d.slug}`, 0.2, "yearly", d.updated)),
  ];
}
