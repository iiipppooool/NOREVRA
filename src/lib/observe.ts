"use client";

/**
 * Reveal scheduling.
 *
 * One shared IntersectionObserver for every reveal on the page — dozens of
 * individual observers is the usual approach and measurably worse.
 *
 * The observer alone is not sufficient. If the viewport jumps past an element
 * in a single frame — the End key, dragging the scrollbar, an in-page anchor,
 * or a browser restoring the scroll position on reload — the intersection
 * ratio goes from 0 (below the fold) to 0 (above it) without ever being
 * non-zero, so no callback fires and the element stays hidden for the rest of
 * the session. That is exactly what happened: everything scrolled past in one
 * jump rendered as an empty rectangle.
 *
 * So there is a second, cheap path: a passive scroll listener that batches a
 * single read of whatever is still pending and releases anything now at or
 * above the reveal line. Elements leave the pending set permanently once
 * revealed, so the cost falls to nothing almost immediately.
 */

type OnEnter = () => void;

const pending = new Map<Element, OnEnter>();
let observer: IntersectionObserver | null = null;
let listening = false;
let frame = 0;

/** The line an element has to reach to be considered arrived. */
const LINE = 0.92;

function release(el: Element) {
  const fn = pending.get(el);
  if (!fn) return;
  pending.delete(el);
  observer?.unobserve(el);
  fn();
}

function sweep() {
  frame = 0;
  if (pending.size === 0) return;
  const limit = window.innerHeight * LINE;
  // One batched read, then all the writes — never interleaved.
  const arrived: Element[] = [];
  for (const el of pending.keys()) {
    if (el.getBoundingClientRect().top < limit) arrived.push(el);
  }
  for (const el of arrived) release(el);
}

function schedule() {
  if (frame || pending.size === 0) return;
  frame = requestAnimationFrame(sweep);
}

function ensure() {
  if (typeof window === "undefined") return;
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) release(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
  }
  if (!listening) {
    listening = true;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
  }
}

/**
 * Calls `onEnter` once, when the element reaches the reveal line — or
 * immediately if it is already there. Returns a cleanup function.
 */
export function observe(el: Element, onEnter: OnEnter): () => void {
  if (typeof window === "undefined") return () => {};
  ensure();
  pending.set(el, onEnter);
  observer?.observe(el);
  // An element already on screen at mount reveals on the next frame, so a
  // reload part-way down the page never shows an empty section.
  schedule();
  return () => {
    pending.delete(el);
    observer?.unobserve(el);
  };
}
