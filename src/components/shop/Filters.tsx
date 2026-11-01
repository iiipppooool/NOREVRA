"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { collections } from "@/data/collections";
import { categories } from "@/data/types";
import { familyLabels, type MaterialFamily } from "@/data/materials";
import { PRICE_BANDS, SORTS, type Query } from "@/lib/catalogue";
import { Drawer } from "@/components/ui/Overlay";
import { cn } from "@/lib/utils";

type Counts = {
  category: Record<string, number>;
  collection: Record<string, number>;
  family: Record<string, number>;
  band: Record<string, number>;
};

type FacetKey = "category" | "collection" | "family" | "band";

/**
 * Filters live entirely in the URL, so a filtered view is shareable, works
 * with the back button, and is rendered on the server. This component only
 * writes search params.
 */
export function Filters({
  query,
  counts,
  total,
  children,
}: {
  query: Query;
  counts: Counts;
  total: number;
  /** The results. Rendered inside so the rail and the grid share one layout. */
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [sheet, setSheet] = useState(false);
  const [term, setTerm] = useState(query.q);

  useEffect(() => setTerm(query.q), [query.q]);

  const push = useCallback(
    (mutate: (sp: URLSearchParams) => void) => {
      const sp = new URLSearchParams(params.toString());
      mutate(sp);
      const qs = sp.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [params, pathname, router],
  );

  const toggle = useCallback(
    (key: FacetKey, value: string) => {
      push((sp) => {
        const current = (sp.get(key) ?? "").split(",").filter(Boolean);
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        if (next.length) sp.set(key, next.join(","));
        else sp.delete(key);
      });
    },
    [push],
  );

  const setSort = useCallback(
    (value: string) => {
      push((sp) => {
        if (value === "featured") sp.delete("sort");
        else sp.set("sort", value);
      });
    },
    [push],
  );

  const submitSearch = useCallback(
    (value: string) => {
      push((sp) => {
        const v = value.trim();
        if (v) sp.set("q", v);
        else sp.delete("q");
      });
    },
    [push],
  );

  const clearAll = useCallback(() => {
    startTransition(() => router.replace(pathname, { scroll: false }));
  }, [pathname, router]);

  const groups = useMemo(
    () => [
      {
        key: "category" as FacetKey,
        label: "Typology",
        items: categories.map((c) => ({ id: c.id, label: c.plural, n: counts.category[c.id] ?? 0 })),
      },
      {
        key: "collection" as FacetKey,
        label: "Collection",
        items: collections.map((c) => ({ id: c.id, label: c.name, n: counts.collection[c.id] ?? 0 })),
      },
      {
        key: "family" as FacetKey,
        label: "Material",
        items: (Object.keys(familyLabels) as MaterialFamily[]).map((f) => ({
          id: f,
          label: familyLabels[f],
          n: counts.family[f] ?? 0,
        })),
      },
      {
        key: "band" as FacetKey,
        label: "Price",
        items: PRICE_BANDS.map((b) => ({ id: b.id, label: b.label, n: counts.band[b.id] ?? 0 })),
      },
    ],
    [counts],
  );

  const active = [
    ...query.category.map((v) => ({ key: "category" as FacetKey, v, label: categories.find((c) => c.id === v)?.plural ?? v })),
    ...query.collection.map((v) => ({ key: "collection" as FacetKey, v, label: collections.find((c) => c.id === v)?.name ?? v })),
    ...query.family.map((v) => ({ key: "family" as FacetKey, v, label: familyLabels[v] })),
    ...query.band.map((v) => ({ key: "band" as FacetKey, v, label: PRICE_BANDS.find((b) => b.id === v)?.label ?? v })),
  ];

  const facets = (
    <div className="space-y-9">
      {groups.map((g) => (
        <fieldset key={g.key}>
          <legend className="label text-mist">{g.label}</legend>
          <ul className="mt-4 space-y-2.5">
            {g.items.map((item) => {
              const checked = (query[g.key] as string[]).includes(item.id);
              const empty = item.n === 0 && !checked;
              return (
                <li key={item.id}>
                  <label
                    className={cn(
                      "group flex cursor-pointer items-center gap-3 transition-opacity duration-300",
                      empty && "cursor-not-allowed opacity-35",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={checked}
                      disabled={empty}
                      onChange={() => toggle(g.key, item.id)}
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "grid h-3.5 w-3.5 shrink-0 place-items-center border transition-colors duration-300",
                        checked ? "border-ink bg-ink" : "border-hairline group-hover:border-smoke",
                        "peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
                      )}
                    >
                      {checked && <span className="h-1.5 w-1.5 bg-alabaster" />}
                    </span>
                    <span className={cn("label-lg flex-1", checked ? "text-ink" : "text-smoke")}>
                      {item.label}
                    </span>
                    <span className="label tabular-nums text-mist" data-numeric>
                      {item.n}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
    </div>
  );

  return (
    <>
      {/* Toolbar */}
      <div className="rule-b rule-t flex flex-wrap items-center gap-x-6 gap-y-4 py-4">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch(term);
          }}
          className="flex min-w-[12rem] flex-1 items-center gap-3"
        >
          <Search size={15} strokeWidth={1.5} className="shrink-0 text-mist" aria-hidden />
          <input
            type="search"
            name="q"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onBlur={() => term !== query.q && submitSearch(term)}
            placeholder="Search by piece, material or designer"
            aria-label="Search the catalogue"
            className="w-full bg-transparent py-1.5 text-small text-ink outline-none placeholder:text-mist"
          />
          {query.q && (
            <button
              type="button"
              onClick={() => {
                setTerm("");
                submitSearch("");
              }}
              className="label shrink-0 text-smoke"
            >
              Clear
            </button>
          )}
        </form>

        <p
          className="label shrink-0 tabular-nums text-mist"
          data-numeric
          aria-live="polite"
          aria-atomic="true"
        >
          {pending ? "Updating…" : `${total} ${total === 1 ? "piece" : "pieces"}`}
        </p>

        <label className="flex shrink-0 items-center gap-3">
          <span className="label text-mist">Sort</span>
          <span className="relative">
            <select
              value={query.sort}
              onChange={(e) => setSort(e.target.value)}
              className="cursor-pointer appearance-none bg-transparent pr-6 label-lg text-ink outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <span
              aria-hidden
              className="pointer-events-none absolute right-1 top-1 h-1.5 w-1.5 rotate-45 border-b border-r border-smoke"
            />
          </span>
        </label>

        <button
          type="button"
          onClick={() => setSheet(true)}
          className="label flex shrink-0 items-center gap-2.5 text-ink lg:hidden"
          aria-expanded={sheet}
        >
          <SlidersHorizontal size={14} strokeWidth={1.5} aria-hidden />
          Filter
          {active.length > 0 && <span data-numeric>({active.length})</span>}
        </button>
      </div>

      {/* Active filters */}
      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 pt-5">
          {active.map((a) => (
            <button
              key={`${a.key}-${a.v}`}
              type="button"
              onClick={() => toggle(a.key, a.v)}
              className="group flex items-center gap-2 border border-hairline px-3 py-2 label text-ink transition-colors duration-300 hover:border-ink"
            >
              {a.label}
              <X size={11} strokeWidth={1.6} className="text-mist group-hover:text-ink" aria-hidden />
              <span className="sr-only">Remove filter</span>
            </button>
          ))}
          <button type="button" onClick={clearAll} className="link-draw label ml-2 text-smoke">
            Clear all
          </button>
        </div>
      )}

      {/* Rail and results */}
      <div className="grid grid-cols-1 gap-x-[clamp(2rem,4vw,4rem)] pt-10 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block" aria-label="Filters">
          <div className="sticky top-[8rem] pb-10">{facets}</div>
        </aside>
        <div className="lg:col-span-9">{children}</div>
      </div>

      {/* Mobile sheet */}
      <Drawer open={sheet} onClose={() => setSheet(false)} title="Filter" side="left">
        <div className="py-7">{facets}</div>
        <div className="sticky bottom-0 -mx-7 flex gap-3 border-t border-hairline bg-alabaster px-7 py-5">
          <button type="button" onClick={clearAll} className="label-lg flex-1 border border-hairline py-3 text-ink">
            Clear
          </button>
          <button
            type="button"
            onClick={() => setSheet(false)}
            className="label-lg flex-1 bg-ink py-3 text-alabaster"
          >
            Show {total}
          </button>
        </div>
      </Drawer>
    </>
  );
}
