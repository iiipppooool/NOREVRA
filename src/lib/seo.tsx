import type { Metadata } from "next";
import { brand } from "@/data/brand";
import { siteAssets } from "@/data/assets";
import { products, priceRange } from "@/data/products";
import type { Product } from "@/data/types";
import { formatPrice } from "./format";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? brand.url;

export const absolute = (p: string) => `${siteUrl}${p.startsWith("/") ? p : `/${p}`}`;

type Args = {
  title: string;
  description: string;
  path: string;
  image?: { src: string; width: number; height: number; alt: string };
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
};

/** One metadata builder, so no page can forget canonical or Open Graph. */
export function buildMetadata({
  title,
  description,
  path,
  image = siteAssets.ogDefault,
  type = "website",
  publishedTime,
  noIndex,
}: Args): Metadata {
  const url = absolute(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} — ${brand.name}`,
      description,
      url,
      siteName: brand.name,
      locale: "en_GB",
      type,
      ...(publishedTime ? { publishedTime } : {}),
      images: [
        {
          url: absolute(image.src),
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${brand.name}`,
      description,
      images: [absolute(image.src)],
    },
    // Keep following links out of a page we do not want indexed: a filtered
    // catalogue view is still a perfectly good route to every product on it.
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

/* ------------------------------------------------------------ structured -- */

export function organisationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organisation`,
    name: brand.legalEntity,
    alternateName: brand.name,
    url: siteUrl,
    description: brand.summary,
    foundingDate: brand.launched,
    email: brand.email.general,
    telephone: brand.telephone.display,
    logo: absolute(siteAssets.ogDefault.src),
    sameAs: brand.social.map((s) => s.href),
    address: brand.locations.map((l) => ({
      "@type": "PostalAddress",
      streetAddress: l.lines[0],
      addressLocality: l.city,
      postalCode: l.lines[1]?.split(" ")[0],
      addressCountry: l.lines[l.lines.length - 1],
    })),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: brand.name,
    publisher: { "@id": `${siteUrl}/#organisation` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/furniture?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productLd(p: Product) {
  const { min, max } = priceRange(p);
  const img = p.images.filter((i) => i.kind !== "elevation").map((i) => absolute(i.src));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${brand.name} ${p.name}`,
    sku: p.slug,
    category: p.typology,
    description: p.summary,
    image: img,
    brand: { "@type": "Brand", name: brand.name },
    material: p.options
      .flatMap((g) => g.materialIds)
      .slice(0, 6)
      .join(", "),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: brand.commerce.currency,
      lowPrice: (min / 100).toFixed(0),
      highPrice: (max / 100).toFixed(0),
      offerCount: p.variants.length,
      availability: "https://schema.org/PreOrder",
      url: absolute(`/furniture/${p.slug}`),
      seller: { "@id": `${siteUrl}/#organisation` },
    },
    additionalProperty: p.construction.map((c) => ({
      "@type": "PropertyValue",
      name: c.label,
      value: c.value,
    })),
  };
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: absolute(t.path),
    })),
  };
}

export function articleLd(post: {
  slug: string;
  title: string;
  standfirst: string;
  date: string;
  author: string;
  images: { src: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.standfirst,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@id": `${siteUrl}/#organisation` },
    image: post.images.map((i) => absolute(i.src)),
    mainEntityOfPage: absolute(`/journal/${post.slug}`),
  };
}

/** Renders a JSON-LD script tag. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is built from our own catalogue, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const priceLabel = (p: Product) => {
  const { min, max } = priceRange(p);
  return min === max ? formatPrice(min) : `From ${formatPrice(min)}`;
};

export const allProductPaths = () => products.map((p) => ({ slug: p.slug }));
