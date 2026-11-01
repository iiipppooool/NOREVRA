"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Chrome = {
  /** True while a full-bleed dark hero is under the header. */
  overHero: boolean;
  setOverHero: (v: boolean) => void;
};

const Ctx = createContext<Chrome>({ overHero: false, setOverHero: () => {} });

export function ChromeProvider({ children }: { children: ReactNode }) {
  const [overHero, setOverHero] = useState(false);
  return <Ctx.Provider value={{ overHero, setOverHero }}>{children}</Ctx.Provider>;
}

export const useChrome = () => useContext(Ctx);

/**
 * Declares that this page opens with a full-bleed image, so the header starts
 * transparent with light type. Rendered by the page, not guessed by the header.
 */
export function OverHero() {
  const { setOverHero } = useChrome();
  useEffect(() => {
    setOverHero(true);
    return () => setOverHero(false);
  }, [setOverHero]);
  return null;
}
