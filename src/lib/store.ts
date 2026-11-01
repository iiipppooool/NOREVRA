"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartLine = {
  /** Stable identity: product + variant + chosen finishes. */
  id: string;
  slug: string;
  variantId: string;
  /** Option group id → material id. */
  options: Record<string, string>;
  qty: number;
  addedAt: number;
};

export type AddInput = Omit<CartLine, "id" | "addedAt"> & { qty?: number };

export function lineId(slug: string, variantId: string, options: Record<string, string>): string {
  const opt = Object.keys(options)
    .sort()
    .map((k) => `${k}:${options[k]}`)
    .join("|");
  return `${slug}@${variantId}${opt ? `#${opt}` : ""}`;
}

type State = {
  lines: CartLine[];
  wishlist: string[];
  /** Slide-out bag. */
  bagOpen: boolean;
  /** Set briefly after an add, so the UI can acknowledge it. */
  justAdded: string | null;
};

type Actions = {
  add: (input: AddInput) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  toggleWish: (slug: string) => void;
  clearWishlist: () => void;
  openBag: () => void;
  closeBag: () => void;
  acknowledge: () => void;
};

const MAX_QTY = 20;

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      lines: [],
      wishlist: [],
      bagOpen: false,
      justAdded: null,

      add: (input) => {
        const id = lineId(input.slug, input.variantId, input.options);
        const qty = Math.min(MAX_QTY, Math.max(1, input.qty ?? 1));
        const existing = get().lines.find((l) => l.id === id);
        set({
          lines: existing
            ? get().lines.map((l) =>
                l.id === id ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l,
              )
            : [...get().lines, { ...input, id, qty, addedAt: Date.now() }],
          justAdded: id,
          bagOpen: true,
        });
      },

      remove: (id) => set({ lines: get().lines.filter((l) => l.id !== id) }),

      setQty: (id, qty) =>
        set({
          lines:
            qty <= 0
              ? get().lines.filter((l) => l.id !== id)
              : get().lines.map((l) =>
                  l.id === id ? { ...l, qty: Math.min(MAX_QTY, qty) } : l,
                ),
        }),

      clear: () => set({ lines: [] }),

      toggleWish: (slug) =>
        set({
          wishlist: get().wishlist.includes(slug)
            ? get().wishlist.filter((s) => s !== slug)
            : [slug, ...get().wishlist],
        }),

      clearWishlist: () => set({ wishlist: [] }),

      openBag: () => set({ bagOpen: true }),
      closeBag: () => set({ bagOpen: false, justAdded: null }),
      acknowledge: () => set({ justAdded: null }),
    }),
    {
      name: "norevra.bag.v1",
      storage: createJSONStorage(() => localStorage),
      // Transient UI state is never persisted.
      partialize: (s) => ({ lines: s.lines, wishlist: s.wishlist }),
      version: 1,
    },
  ),
);

export const MAX_LINE_QTY = MAX_QTY;
