"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, m, useMotionValue, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { Battery, Lock, Moon, Search, Sun, Wifi } from "@/components/ui/icons";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { MusicWidget } from "./apps/Music";
import type { MenuEntry } from "./Menu";
import {
  stripMeridiem,
  useBattery,
  useClock,
  type MenuBarMenu,
} from "./MenuBar";
import { wifiStore } from "./session";

const OPEN_DISTANCE = 48;

function Tile({
  icon,
  title,
  subtitle,
  active,
  onClick,
}: Readonly<{
  icon: ReactNode;
  title: string;
  subtitle?: string;
  active?: boolean;
  onClick?: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-white/12 p-2.5 text-left transition-transform active:scale-[0.97]"
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-full",
          active ? "bg-[#2f6fe4] text-white" : "bg-white/15 text-white",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold">
          {title}
        </span>
        {subtitle && (
          <span className="block truncate text-[11px] text-white/65">
            {subtitle}
          </span>
        )}
      </span>
    </button>
  );
}

export function PhoneStatusBar({
  logoMenu,
  menus,
  isDark,
  locale,
  onToggleTheme,
  onToggleLocale,
  onSpotlight,
  onLock,
}: Readonly<{
  logoMenu: MenuEntry[];
  menus: MenuBarMenu[];
  isDark: boolean;
  locale: string;
  onToggleTheme: () => void;
  onToggleLocale: () => void;
  onSpotlight: () => void;
  onLock: () => void;
}>) {
  const t = useTranslations("desktop.control");
  const ts = useTranslations("desktop.status");
  const time = stripMeridiem(useClock({ hour: "2-digit", minute: "2-digit" }));
  const bigTime = stripMeridiem(
    useClock({ hour: "2-digit", minute: "2-digit" }),
  );
  const date = useClock({ weekday: "long", day: "numeric", month: "long" });
  const battery = useBattery(true);
  const wifi = wifiStore.useValue();
  const pct = Math.round(battery.level * 100);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>("go");
  const sheet = useRef<HTMLDivElement>(null);
  const y = useMotionValue(-1000);
  const height = () => sheet.current?.offsetHeight ?? 600;
  const backdrop = useTransform(y, (v) => Math.max(0, 1 + v / height()));

  const openedAt = useRef(0);
  const settle = (toOpen: boolean) => {
    if (toOpen && !open) openedAt.current = performance.now();
    setOpen(toOpen);
    animate(y, toOpen ? 0 : -height(), {
      type: "spring",
      stiffness: 420,
      damping: 40,
    });
  };

  useEffect(() => {
    if (!open) y.set(-height());
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && settle(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const startDrag = (e: React.PointerEvent, fromOpen: boolean) => {
    const startY = e.clientY;
    const base = fromOpen ? 0 : -height();
    let moved = 0;
    const move = (ev: PointerEvent) => {
      moved = ev.clientY - startY;
      y.set(Math.min(0, Math.max(-height(), base + moved)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      const tap = Math.abs(moved) < 6;
      if (fromOpen) settle(!(tap || moved < -OPEN_DISTANCE));
      else settle(tap || moved > OPEN_DISTANCE);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  const run = (fn: () => void) => {
    settle(false);
    fn();
  };

  const groups: MenuBarMenu[] = [
    { id: "logo", label: site.os.name, entries: logoMenu },
    ...menus,
  ];

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={t("open")}
        aria-expanded={open}
        onPointerDown={(e) => startDrag(e, false)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && settle(true)}
        className="absolute inset-x-0 top-0 z-[60] flex h-7 touch-none items-center justify-between px-5 text-[13px] font-semibold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.35)]"
      >
        <span className="tabular-nums" suppressHydrationWarning>
          {time}
        </span>
        <span
          aria-hidden="true"
          className="h-1 w-10 rounded-full bg-white/35"
        />
        <span className="flex items-center gap-1.5">
          <Wifi className={cn("h-4 w-4", !wifi.on && "opacity-35")} />
          <span className="text-[11px] tabular-nums" suppressHydrationWarning>
            {pct}%
          </span>
          <Battery className="h-4 w-5" />
        </span>
      </div>

      <m.div
        aria-hidden="true"
        style={{ opacity: backdrop }}
        onClick={() => {
          if (performance.now() - openedAt.current > 400) settle(false);
        }}
        className={cn(
          "fixed inset-0 z-[125] bg-black/45 backdrop-blur-sm",
          !open && "pointer-events-none",
        )}
      />
      <m.div
        ref={sheet}
        role="dialog"
        aria-label={t("title")}
        aria-modal={open}
        inert={!open}
        style={{ y }}
        className="fixed inset-x-0 top-0 z-[126] max-h-[85dvh] overflow-y-auto rounded-b-3xl bg-neutral-900/85 px-4 pt-6 text-white shadow-2xl backdrop-blur-2xl"
      >
        <div
          className="touch-none pb-4 text-center"
          onPointerDown={(e) => startDrag(e, true)}
        >
          <p
            className="font-display text-5xl font-semibold tracking-tight"
            suppressHydrationWarning
          >
            {bigTime}
          </p>
          <p className="mt-1 text-sm text-white/75" suppressHydrationWarning>
            {date}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Tile
            icon={<Wifi className="h-4 w-4" />}
            title="Wi-Fi"
            subtitle={wifi.on ? wifi.network || site.os.wifi : ts("wifiOff")}
            active={wifi.on}
            onClick={() => wifiStore.write({ ...wifi, on: !wifi.on })}
          />
          <Tile
            icon={<Battery className="h-4 w-5" />}
            title={`${ts("battery")} ${pct}%`}
            subtitle={battery.charging ? ts("charging") : ts("onBattery")}
          />
          <Tile
            icon={
              isDark ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )
            }
            title={t("darkMode")}
            subtitle={isDark ? t("on") : t("off")}
            active={isDark}
            onClick={onToggleTheme}
          />
          <Tile
            icon={
              <span className="text-xs font-bold">{locale.toUpperCase()}</span>
            }
            title={t("language")}
            subtitle={locale === "tr" ? "Türkçe" : "English"}
            onClick={() => run(onToggleLocale)}
          />
          <Tile
            icon={<Search className="h-4 w-4" />}
            title="Spotlight"
            subtitle={t("search")}
            onClick={() => run(onSpotlight)}
          />
          <Tile
            icon={<Lock className="h-4 w-4" />}
            title={t("lock")}
            onClick={() => run(onLock)}
          />
        </div>

        <MusicWidget className="mt-2.5 border-white/10 bg-white/12 text-white dark:bg-white/12" />

        <div className="mt-3 overflow-hidden rounded-2xl bg-white/8">
          {groups.map((group) => (
            <div
              key={group.id}
              className="border-b border-white/10 last:border-b-0"
            >
              <button
                type="button"
                aria-expanded={expanded === group.id}
                onClick={() =>
                  setExpanded((g) => (g === group.id ? null : group.id))
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left text-[14px] font-semibold"
              >
                {group.label}
                <span
                  className={cn(
                    "text-xs text-white/50 transition-transform",
                    expanded === group.id && "rotate-90",
                  )}
                >
                  ▶
                </span>
              </button>
              {expanded === group.id && (
                <ul className="pb-2">
                  {group.entries.map((entry, i) =>
                    entry.type === "item" ? (
                      <li key={i}>
                        <button
                          type="button"
                          disabled={entry.disabled}
                          onClick={() => run(entry.onSelect)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-left text-[14px] text-white/90 active:bg-white/10 disabled:opacity-40"
                        >
                          <span className="w-4 text-xs">
                            {entry.checked ? "✓" : ""}
                          </span>
                          {entry.label}
                        </button>
                      </li>
                    ) : entry.type === "label" ? (
                      <li
                        key={i}
                        className="px-4 pt-2 pb-1 text-[11px] font-semibold text-white/45"
                      >
                        {entry.label}
                      </li>
                    ) : null,
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label={t("close")}
          className="sticky bottom-0 -mx-4 flex touch-none justify-center bg-neutral-900/90 pt-2.5 pb-2.5 backdrop-blur"
          onPointerDown={(e) => startDrag(e, true)}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && settle(false)
          }
        >
          <span className="h-1.5 w-12 rounded-full bg-white/40" />
        </div>
      </m.div>
    </>
  );
}
