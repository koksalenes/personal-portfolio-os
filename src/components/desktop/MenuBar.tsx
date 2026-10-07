"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Whale, Battery, Moon, Search, Sun, Wifi } from "@/components/ui/icons";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { MenuPanel, type MenuEntry } from "./Menu";
import { wifiStore } from "./session";

function subscribeClock(cb: () => void) {
  const id = setInterval(cb, 10_000);
  return () => clearInterval(id);
}

export const stripMeridiem = (time: string) =>
  time.replace(/^(ÖÖ|ÖS)\s|\s?(AM|PM|ÖÖ|ÖS)$/i, "");

let regional: { hour12: boolean; timeZone: string } | null = null;

const TWELVE_HOUR_ZONE =
  /^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Adak|Boise|Detroit|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+|Menominee|Juneau|Sitka|Metlakatla|Nome|Yakutat|Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Whitehorse|Yellowknife|Iqaluit|Glace_Bay|Goose_Bay|Mexico_City|Bogota|Puerto_Rico)|US\/.+|Canada\/.+|Pacific\/(Honolulu|Auckland|Guam)|Australia\/.+|Asia\/(Kolkata|Calcutta|Karachi|Dhaka|Manila|Riyadh)|Africa\/Cairo)$/;

function regionalClock() {
  if (!regional) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let hour12: boolean;
    if (timeZone) hour12 = TWELVE_HOUR_ZONE.test(timeZone);
    else {
      const { hourCycle } = new Intl.DateTimeFormat(navigator.language, {
        hour: "numeric",
      }).resolvedOptions();
      hour12 = hourCycle === "h11" || hourCycle === "h12";
    }
    regional = { hour12, timeZone };
  }
  return regional;
}

export function useClock(options: Intl.DateTimeFormatOptions) {
  const locale = useLocale();
  return useSyncExternalStore(
    subscribeClock,
    () => {
      const { hour12, timeZone } = regionalClock();
      return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
        ...options,
        ...(options.hour ? { hour12 } : {}),
        timeZone,
      }).format(new Date());
    },
    () => "",
  );
}

const clockFormat: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
};

export type MenuBarMenu = {
  id: string;
  label: string;
  entries: MenuEntry[];
  desktopOnly?: boolean;
};

export type BatteryInfo = { level: number; charging: boolean; time: number };
type BatteryManagerLike = {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
};

export function useBattery(active: boolean) {
  const [info, setInfo] = useState<BatteryInfo | null>(null);
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManagerLike>;
    };
    nav
      .getBattery?.()
      .then((b) => {
        if (cancelled) return;
        setInfo({
          level: b.level,
          charging: b.charging,
          time: b.charging ? b.chargingTime : b.dischargingTime,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [active]);
  return info ?? { level: 1, charging: true, time: 0 };
}

const panelClass =
  "absolute top-[calc(100%+3px)] right-0 w-72 rounded-xl border border-black/20 bg-white/80 p-3 text-[13px] text-neutral-900 shadow-[0_12px_40px_rgba(0,0,0,0.3)] ring-1 ring-white/40 backdrop-blur-2xl dark:bg-neutral-800/85 dark:text-white/90 dark:ring-white/10";

function BatteryPanel({ info }: Readonly<{ info: BatteryInfo }>) {
  const t = useTranslations("desktop.status");
  const pct = Math.round(info.level * 100);
  const minutes =
    Number.isFinite(info.time) && info.time > 0
      ? Math.round(info.time / 60)
      : 0;
  const duration = t("duration", {
    h: Math.floor(minutes / 60),
    m: minutes % 60,
  });
  const status =
    pct >= 100 && info.charging
      ? t("full")
      : info.charging
        ? minutes
          ? t("untilFull", { duration })
          : t("charging")
        : minutes
          ? t("remaining", { duration })
          : t("onBattery");
  return (
    <div className={panelClass} role="dialog" aria-label={t("battery")}>
      <div className="flex items-baseline justify-between">
        <p className="font-semibold">{t("battery")}</p>
        <p className="font-semibold tabular-nums">{pct}%</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
        <div
          className={cn(
            "h-full rounded-full",
            pct <= 20 ? "bg-red-500" : "bg-green-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="opacity-60">{t("source")}</dt>
        <dd>{info.charging ? t("adapter") : t("battery")}</dd>
        <dt className="opacity-60">{t("state")}</dt>
        <dd>{status}</dd>
        <dt className="opacity-60">{t("health")}</dt>
        <dd>{t("normal")}</dd>
        <dt className="opacity-60">{t("energyMode")}</dt>
        <dd>{t("automatic")}</dd>
      </dl>
    </div>
  );
}

const otherNetworks = ["Office-Guest", "Cafe Free WiFi", "Home-2.4G"];

function WifiPanel({
  on,
  network,
  onToggle,
  onConnect,
}: Readonly<{
  on: boolean;
  network: string;
  onToggle: () => void;
  onConnect: (name: string) => void;
}>) {
  const t = useTranslations("desktop.status");
  return (
    <div className={panelClass} role="dialog" aria-label="Wi-Fi">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Wi-Fi</p>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Wi-Fi"
          onClick={onToggle}
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            on ? "bg-[#2f6fe4]" : "bg-black/20 dark:bg-white/20",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left]",
              on ? "left-[18px]" : "left-0.5",
            )}
          />
        </button>
      </div>
      {on ? (
        <>
          <p className="mt-3 text-[11px] font-semibold opacity-50">
            {t("knownNetwork")}
          </p>
          <div className="mt-1 flex items-center gap-2.5 rounded-md bg-[#2f6fe4]/10 px-2 py-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#2f6fe4] text-white">
              <Wifi className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1">
              <span className="block font-medium">{network}</span>
              <span className="block text-[11px] opacity-60">
                {t("connected")}
              </span>
            </span>
            <span aria-hidden="true">🔒</span>
          </div>
          <p className="mt-3 text-[11px] font-semibold opacity-50">
            {t("otherNetworks")}
          </p>
          {otherNetworks
            .filter((n) => n !== network)
            .concat(network === site.os.wifi ? [] : [site.os.wifi])
            .map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => onConnect(name)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1 text-left hover:bg-black/5 dark:hover:bg-white/10"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-black/10 dark:bg-white/15">
                  <Wifi className="h-3.5 w-3.5" />
                </span>
                {name}
              </button>
            ))}
        </>
      ) : (
        <p className="mt-3 text-xs opacity-60">{t("wifiOff")}</p>
      )}
    </div>
  );
}

export function MenuBar({
  logoMenu,
  menus,
  isDark,
  locale,
  onToggleTheme,
  onToggleLocale,
  onSpotlight,
  labels,
  dockerMenu,
  dockerStatus,
  onMenuOpen,
}: Readonly<{
  onMenuOpen?: () => void;
  dockerMenu: MenuEntry[];
  dockerStatus: "running" | "starting" | "stopped";
  logoMenu: MenuEntry[];
  menus: MenuBarMenu[];
  isDark: boolean;
  locale: string;
  onToggleTheme: () => void;
  onToggleLocale: () => void;
  onSpotlight: () => void;
  labels: {
    search: string;
    theme: string;
    logo: string;
    language: string;
  };
}>) {
  const clock = useClock(clockFormat);
  const shortClock = useClock({ hour: "2-digit", minute: "2-digit" });
  const [open, setOpen] = useState<string | null>(null);
  const wifi = wifiStore.useValue();
  const wifiOn = wifi.on;
  const network = wifi.network || site.os.wifi;
  const battery = useBattery(open === "battery");
  const toggle = (id: string) => {
    if (open !== id) onMenuOpen?.();
    setOpen((o) => (o === id ? null : id));
  };
  const statusButton = (active: boolean) =>
    cn(
      "relative grid h-6 place-items-center rounded px-1.5",
      active ? "bg-white/25" : "hover:bg-white/10",
    );

  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open]);

  const all: MenuBarMenu[] = [
    { id: "logo", label: labels.logo, entries: logoMenu },
    ...menus,
  ];

  return (
    <div
      ref={barRef}
      role="menubar"
      className="absolute inset-x-0 top-0 z-[60] flex h-7 items-center justify-between gap-1 bg-black/30 px-1 text-[13px] whitespace-nowrap text-white backdrop-blur-xl sm:px-2.5"
    >
      <ul className="relative flex min-w-0 items-center">
        {all.map((menu, i) => (
          <li
            key={menu.id}
            className={cn(
              "relative",
              menu.id === "logo" ? "shrink-0" : "min-w-0",
              menu.desktopOnly && "hidden md:block",
            )}
          >
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={open === menu.id}
              aria-label={menu.id === "logo" ? labels.logo : undefined}
              onClick={() => setOpen((o) => (o === menu.id ? null : menu.id))}
              onPointerEnter={(e) =>
                e.pointerType === "mouse" && open && setOpen(menu.id)
              }
              className={cn(
                "flex h-6 max-w-full items-center truncate rounded px-2 whitespace-nowrap",
                i === 1 && "font-semibold",
                open === menu.id ? "bg-white/25" : "hover:bg-white/10",
              )}
            >
              {menu.id === "logo" ? (
                <Image
                  src={site.images.logo}
                  alt=""
                  width={15}
                  height={15}
                  className="h-[15px] w-[15px] max-w-none shrink-0 rounded-[3px]"
                />
              ) : (
                menu.label
              )}
            </button>
            {open === menu.id && (
              <MenuPanel
                entries={menu.entries}
                onClose={() => setOpen(null)}
                className="absolute top-[calc(100%+3px)] left-0"
                autoFocus
              />
            )}
          </li>
        ))}
      </ul>
      <div className="relative flex shrink-0 items-center gap-0.5 text-white/90 sm:gap-1">
        <button
          type="button"
          onClick={onToggleLocale}
          aria-label={labels.language}
          title={labels.language}
          className="grid h-6 place-items-center rounded px-1.5 text-[11px] font-semibold tracking-wide uppercase hover:bg-white/10"
        >
          {locale}
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={labels.theme}
          title={labels.theme}
          className="grid h-6 w-7 place-items-center rounded hover:bg-white/10"
        >
          {isDark ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
        </button>
        <div className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open === "docker"}
            aria-label="Docker Desktop"
            title="Docker Desktop"
            onClick={() => toggle("docker")}
            className={statusButton(open === "docker")}
          >
            <Whale
              className={cn(
                "h-4 w-5",
                dockerStatus === "starting" && "animate-pulse",
                dockerStatus === "stopped" && "opacity-40",
              )}
            />
          </button>
          {open === "docker" && (
            <MenuPanel
              entries={dockerMenu}
              onClose={() => setOpen(null)}
              className="absolute top-[calc(100%+3px)] right-0"
              autoFocus
            />
          )}
        </div>
        <div className="relative hidden sm:block">
          <button
            type="button"
            aria-expanded={open === "battery"}
            aria-label="Battery"
            onClick={() => toggle("battery")}
            className={statusButton(open === "battery")}
          >
            <Battery className="h-4 w-5" />
          </button>
          {open === "battery" && <BatteryPanel info={battery} />}
        </div>
        <div className="relative">
          <button
            type="button"
            aria-expanded={open === "wifi"}
            aria-label="Wi-Fi"
            onClick={() => toggle("wifi")}
            className={statusButton(open === "wifi")}
          >
            <Wifi className={cn("h-4 w-4", !wifiOn && "opacity-35")} />
          </button>
          {open === "wifi" && (
            <WifiPanel
              on={wifiOn}
              network={network}
              onToggle={() => wifiStore.write({ ...wifi, on: !wifiOn })}
              onConnect={(name) => wifiStore.write({ on: true, network: name })}
            />
          )}
        </div>
        <button
          type="button"
          onClick={onSpotlight}
          aria-label={labels.search}
          title={`${labels.search} (⌘K)`}
          className="grid h-6 w-7 place-items-center rounded hover:bg-white/10"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
        <span
          className="hidden px-1 tabular-nums sm:inline"
          suppressHydrationWarning
        >
          {clock}
        </span>
        <span className="px-1 tabular-nums sm:hidden" suppressHydrationWarning>
          {shortClock}
        </span>
      </div>
    </div>
  );
}
