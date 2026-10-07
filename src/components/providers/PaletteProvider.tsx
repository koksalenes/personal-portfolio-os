"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type Palette, paletteConfig } from "@/lib/data";

export type { Palette };

interface PaletteContextValue {
  palette: Palette;
  toggle: () => void;
}

const PaletteContext = createContext<PaletteContextValue>({
  palette: paletteConfig.defaultPalette,
  toggle: () => {},
});

export function usePalette() {
  return useContext(PaletteContext);
}

const STORAGE_KEY = "ek-palette";
const CYCLE: Palette[] = ["orange", "purple", "charcoal"];
const VALID = new Set<string>(CYCLE);

function applyPalette(p: Palette) {
  if (p === "orange") {
    delete document.documentElement.dataset.palette;
  } else {
    document.documentElement.dataset.palette = p;
  }
}

export function PaletteProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [palette, setPalette] = useState<Palette>(() => {
    if (globalThis.window === undefined) return paletteConfig.defaultPalette;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && VALID.has(stored)
      ? (stored as Palette)
      : paletteConfig.defaultPalette;
  });

  useEffect(() => {
    applyPalette(palette);
  }, [palette]);

  const ctx = useMemo<PaletteContextValue>(
    () => ({
      palette,
      toggle() {
        const next = CYCLE[(CYCLE.indexOf(palette) + 1) % CYCLE.length];
        setPalette(next);
        localStorage.setItem(STORAGE_KEY, next);
        applyPalette(next);
      },
    }),
    [palette],
  );

  return (
    <PaletteContext.Provider value={ctx}>{children}</PaletteContext.Provider>
  );
}
