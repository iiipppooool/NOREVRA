import { brand } from "@/data/brand";
import type { Product } from "@/data/types";

const { preOrder, currency } = {
  preOrder: brand.commerce.preOrder,
  currency: brand.commerce.currency,
};

export type Terms = {
  /** True when any part of the order is a reservation rather than a purchase. */
  reserved: boolean;
  depositRate: number;
  /** Minor units. */
  deposit: number;
  balance: number;
  total: number;
  currency: string;
  dispatchFrom: string;
};

/** Rounded to the whole unit: a deposit line should not have odd cents. */
export function depositOf(total: number, rate = preOrder.depositRate): number {
  return Math.round((total * rate) / 100) * 100;
}

export function termsFor(total: number, anyReserved: boolean): Terms {
  const deposit = anyReserved ? depositOf(total) : total;
  return {
    reserved: anyReserved,
    depositRate: preOrder.depositRate,
    deposit,
    balance: total - deposit,
    total,
    currency,
    dispatchFrom: preOrder.dispatchFrom,
  };
}

export const isReserved = (p: Product) => p.availability === "first-run";

export const availabilityLabel: Record<Product["availability"], string> = {
  "first-run": preOrder.runLabel,
  "made-to-order": "Made to order",
  enquire: "Enquire for availability",
};

export const availabilityNote: Record<Product["availability"], string> = {
  "first-run": `Reserved against the first production run. ${Math.round(preOrder.depositRate * 100)}% on confirmation, the balance before despatch.`,
  "made-to-order": "Cut once your order is confirmed. Paid in full at checkout.",
  enquire: "Not currently in production. Write to us and we will tell you honestly when it will be.",
};
