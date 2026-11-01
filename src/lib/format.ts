import { brand } from "@/data/brand";
import type { Product, Variant } from "@/data/types";

const { locale, currency } = brand.commerce;

const money = new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
  maximumFractionDigits: 0,
});

const moneyCents = new Intl.NumberFormat(locale, {
  style: "currency",
  currency,
  minimumFractionDigits: 2,
});

/** Catalogue prices are whole euros; carts can be any amount. */
export function formatPrice(minorUnits: number): string {
  return minorUnits % 100 === 0
    ? money.format(minorUnits / 100)
    : moneyCents.format(minorUnits / 100);
}

export function formatPriceFrom(minorUnits: number): string {
  return `From ${formatPrice(minorUnits)}`;
}

/** 264 → "2640 mm". Dimensions are published in millimetres. */
export function mm(cm: number): string {
  return `${Math.round(cm * 10)} mm`;
}

export function dimensionLine(v: Variant): string {
  const { w, d, h, sh } = v.dim;
  const base = `W ${mm(w)} · D ${mm(d)} · H ${mm(h)}`;
  return sh ? `${base} · Seat ${mm(sh)}` : base;
}

export function dimensionRows(v: Variant): { label: string; value: string }[] {
  const rows = [
    { label: "Width", value: mm(v.dim.w) },
    { label: "Depth", value: mm(v.dim.d) },
    { label: "Height", value: mm(v.dim.h) },
  ];
  if (v.dim.sh) rows.push({ label: "Seat height", value: mm(v.dim.sh) });
  return rows;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "Sofa, three seat, in Chalk Bouclé" — used in the bag and in emails. */
export function lineTitle(product: Product, variant: Variant): string {
  return `${product.name} · ${variant.label}`;
}
