"use client";

/**
 * One shared IntersectionObserver for every reveal on the page. Dozens of
 * individual observers is the usual way this is done and it is measurably
 * worse; this keeps scroll work off the main thread.
 */
type Handler = (entry: IntersectionObserverEntry) => void;

let observer: IntersectionObserver | null = null;
const handlers = new WeakMap<Element, Handler>();

function get(): IntersectionObserver | null {
  if (typeof window === "undefined") return null;
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          handlers.get(entry.target)?.(entry);
        }
      },
      { rootMargin: "-8% 0px -12% 0px", threshold: [0, 0.01, 0.2] },
    );
  }
  return observer;
}

export function observe(el: Element, handler: Handler): () => void {
  const o = get();
  if (!o) return () => {};
  handlers.set(el, handler);
  o.observe(el);
  return () => {
    o.unobserve(el);
    handlers.delete(el);
  };
}
