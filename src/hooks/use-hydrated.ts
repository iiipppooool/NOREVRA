"use client";

import { useSyncExternalStore } from "react";

/** No external source to watch: the value flips once, at hydration. */
const noop = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * True once the client has hydrated. Cart counts and saved pieces come from
 * localStorage, so they must not be rendered during SSR.
 *
 * Implemented with useSyncExternalStore rather than an effect, which gives
 * React an explicit server snapshot instead of a second render pass.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, onClient, onServer);
}
