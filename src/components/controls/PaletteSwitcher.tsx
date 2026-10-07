"use client";

import { flushSync } from "react-dom";
import { useTranslations } from "next-intl";
import {
  usePalette,
  type Palette,
} from "@/components/providers/PaletteProvider";
import { paletteConfig } from "@/lib/data";

const P = {
  top: "9,1",
  right: "15.928,13",
  left: "2.072,13",
  center: "9,9",
} as const;

const ARC = "A8,8 0 0,1";

const SECTORS: Record<Palette, string> = {
  orange: `M${P.center} L${P.top}   ${ARC} ${P.right} Z`,
  purple: `M${P.center} L${P.right} ${ARC} ${P.left}  Z`,
  charcoal: `M${P.center} L${P.left}  ${ARC} ${P.top}   Z`,
};

const FILLS: Record<Palette, string> = {
  orange: "#f45d22",
  purple: "#6d4aff",
  charcoal: "#c6ff00",
};

const DIM = "0.25";
const FULL = "1";

export function PaletteSwitcher() {
  const t = useTranslations("palette");
  const { palette, toggle } = usePalette();

  if (!paletteConfig.showSwitcher) return null;

  function handleToggle() {
    const prefersReduced =
      globalThis.window !== undefined &&
      globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || prefersReduced) {
      toggle();
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => toggle());
    });
  }

  const palettes = Object.keys(SECTORS) as Palette[];

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={t("toggle")}
      title={t(palette)}
      className="group border-border bg-surface/60 hover:border-accent relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        {palettes.map((p) => (
          <path
            key={p}
            d={SECTORS[p]}
            fill={FILLS[p]}
            opacity={p === palette ? FULL : DIM}
            style={{ transition: "opacity 0.35s" }}
          />
        ))}
        <line
          x1="9"
          y1="9"
          x2="9"
          y2="1"
          stroke="white"
          strokeWidth="0.75"
          strokeOpacity="0.35"
        />
        <line
          x1="9"
          y1="9"
          x2="15.928"
          y2="13"
          stroke="white"
          strokeWidth="0.75"
          strokeOpacity="0.35"
        />
        <line
          x1="9"
          y1="9"
          x2="2.072"
          y2="13"
          stroke="white"
          strokeWidth="0.75"
          strokeOpacity="0.35"
        />
      </svg>
    </button>
  );
}
