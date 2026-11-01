import type { Metadata } from "next";
import { brand } from "@/data/brand";
import { buildMetadata } from "@/lib/seo";
import { OverHero } from "@/components/layout/Chrome";
import { Hero } from "@/components/home/Hero";
import { CollectionSequence } from "@/components/home/CollectionSequence";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Philosophy } from "@/components/home/Philosophy";
import { Editorial } from "@/components/home/Editorial";
import { ServiceStrip } from "@/components/home/ServiceStrip";
import { JournalTeaser } from "@/components/home/JournalTeaser";

export const metadata: Metadata = buildMetadata({
  title: `${brand.name} — ${brand.descriptor}`,
  description: brand.summary,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <OverHero />
      <Hero />
      <CollectionSequence />
      <FeaturedProducts />
      <Philosophy />
      <Editorial />
      <ServiceStrip />
      <JournalTeaser />
    </>
  );
}
