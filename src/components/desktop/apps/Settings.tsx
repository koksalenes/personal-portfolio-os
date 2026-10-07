"use client";

import { useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  Moon,
  Whale,
  Settings as Gear,
  Sun,
  Volume,
  Wifi,
} from "@/components/ui/icons";
import { site } from "@/config/site";
import { locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { useHydrated } from "../hooks";
import type { OsActions } from "../actions";
import { OsMark } from "../Power";
import { desktopPrefs, wifiStore } from "../session";
import { iconPositions, wallpaperStore, wallpapers } from "../store";
import { Window, type WindowControls } from "../Window";
import { dockerStore, setDocker, startDocker, stopDocker } from "../docker";
import { music } from "./music-engine";
import { useMusic } from "./Music";

export type Pane =
  | "general"
  | "appearance"
  | "wallpaper"
  | "language"
  | "wifi"
  | "sound"
  | "docker"
  | "desktop";

export function SettingsTile() {
  return (
    <span className="grid h-full w-full place-items-center rounded-[24%] bg-gradient-to-b from-[#9ca3af] to-[#4b5563] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
      <Gear className="h-[62%] w-[62%]" strokeWidth={1.4} />
    </span>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: Readonly<{ on: boolean; onChange: (v: boolean) => void; label: string }>) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        on ? "bg-[#2f6fe4]" : "bg-foreground/20",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left]",
          on ? "left-[18px]" : "left-0.5",
        )}
      />
    </button>
  );
}

function Row({
  label,
  hint,
  children,
}: Readonly<{ label: string; hint?: string; children: ReactNode }>) {
  return (
    <div className="border-border flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm">{label}</p>
        {hint && <p className="text-faint text-xs">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

const Group = ({ children }: Readonly<{ children: ReactNode }>) => (
  <div className="border-border bg-surface-2 mb-4 overflow-hidden rounded-xl border">
    {children}
  </div>
);

export function SettingsApp({
  controls,
  actions,
  pane,
  onPane,
}: Readonly<{
  controls: WindowControls;
  actions: OsActions;
  pane: Pane;
  onPane: (pane: Pane) => void;
}>) {
  const t = useTranslations("desktop.settings");
  const tw = useTranslations("desktop.wallpapers");
  const locale = useLocale();
  const { theme: storedTheme } = useTheme();
  const theme = useHydrated() ? storedTheme : undefined;
  const wallpaper = wallpaperStore.useValue();
  const wifi = wifiStore.useValue();
  const prefs = desktopPrefs.useValue();
  const player = useMusic();
  const setPane = onPane;
  const docker = dockerStore.useValue();
  const [resetDone, setResetDone] = useState(false);

  const panes: Array<{ id: Pane; color: string; icon: ReactNode }> = [
    {
      id: "general",
      color: "bg-[#8e8e93]",
      icon: <Gear className="h-3.5 w-3.5" />,
    },
    {
      id: "appearance",
      color: "bg-[#1c1c1e]",
      icon: <Moon className="h-3.5 w-3.5" />,
    },
    {
      id: "wallpaper",
      color: "bg-[#32ade6]",
      icon: <Sun className="h-3.5 w-3.5" />,
    },
    {
      id: "language",
      color: "bg-[#007aff]",
      icon: <span className="text-[10px] font-bold">Aa</span>,
    },
    {
      id: "wifi",
      color: "bg-[#007aff]",
      icon: <Wifi className="h-3.5 w-3.5" />,
    },
    {
      id: "sound",
      color: "bg-[#ff2d55]",
      icon: <Volume className="h-3.5 w-3.5" />,
    },
    {
      id: "docker",
      color: "bg-[#1d63ed]",
      icon: <Whale className="h-3.5 w-3.5" />,
    },
    {
      id: "desktop",
      color: "bg-[#5856d6]",
      icon: <span className="text-[10px] font-bold">▭</span>,
    },
  ];

  const select =
    "border-border bg-background rounded-md border px-2 py-1 text-sm outline-none";

  return (
    <Window
      id="settings"
      label={t("title")}
      controls={controls}
      titleBar={
        <p className="text-faint pointer-events-none absolute inset-x-0 text-center text-xs">
          {t("title")}
        </p>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <nav className="border-border bg-surface-2 flex shrink-0 gap-1 overflow-x-auto border-b p-2 sm:w-52 sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0">
          {panes.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPane(p.id)}
              aria-current={pane === p.id}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] whitespace-nowrap",
                pane === p.id
                  ? "bg-[#2f6fe4] text-white"
                  : "hover:bg-foreground/5",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-md text-white",
                  p.color,
                )}
              >
                {p.icon}
              </span>
              {t(`panes.${p.id}`)}
            </button>
          ))}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <h2 className="mb-4 text-lg font-bold">{t(`panes.${pane}`)}</h2>

          {pane === "general" && (
            <>
              <Group>
                <div className="flex items-center gap-4 p-4">
                  <span className="bg-foreground text-background grid h-14 w-14 shrink-0 place-items-center rounded-2xl">
                    <OsMark className="h-10 w-10" />
                  </span>
                  <div>
                    <p className="font-semibold">{site.os.name}</p>
                    <p className="text-faint text-xs">
                      {t("version", { version: site.os.version })}
                    </p>
                    <p className="text-faint text-xs">{site.name}</p>
                  </div>
                </div>
              </Group>
              <Group>
                <Row label={t("about")}>
                  <button
                    type="button"
                    onClick={() => actions.open("about")}
                    className={select}
                  >
                    {t("open")}
                  </button>
                </Row>
                <Row
                  label={t("reset")}
                  hint={resetDone ? t("resetDone") : t("resetHint")}
                >
                  <button
                    type="button"
                    onClick={() => {
                      actions.resetAll();
                      setResetDone(true);
                    }}
                    className="rounded-md bg-red-500 px-2.5 py-1 text-sm font-medium text-white"
                  >
                    {t("resetButton")}
                  </button>
                </Row>
              </Group>
            </>
          )}

          {pane === "appearance" && (
            <Group>
              <div className="grid grid-cols-3 gap-3 p-4">
                {(["light", "dark", "system"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => actions.setTheme(mode)}
                    className="flex flex-col items-center gap-1.5 text-xs"
                  >
                    <span
                      className={cn(
                        "h-14 w-full rounded-lg border-2",
                        mode === "light" && "bg-[#f4f4f5]",
                        mode === "dark" && "bg-[#18181b]",
                        mode === "system" &&
                          "bg-[linear-gradient(90deg,#f4f4f5_50%,#18181b_50%)]",
                        (theme ?? "dark") === mode
                          ? "border-[#2f6fe4]"
                          : "border-transparent",
                      )}
                    />
                    {t(`themes.${mode}`)}
                  </button>
                ))}
              </div>
            </Group>
          )}

          {pane === "wallpaper" && (
            <div className="grid grid-cols-2 gap-3">
              {wallpapers.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => actions.setWallpaper(w)}
                  className="text-left text-xs"
                >
                  <span
                    data-wallpaper={w}
                    className={cn(
                      "wallpaper mb-1 block aspect-video rounded-lg border-2",
                      wallpaper === w
                        ? "border-[#2f6fe4]"
                        : "border-transparent",
                    )}
                  />
                  {tw(w)}
                </button>
              ))}
            </div>
          )}

          {pane === "language" && (
            <Group>
              <Row label={t("language")} hint={t("languageHint")}>
                <select
                  value={locale}
                  onChange={(e) => actions.setLocale(e.target.value as Locale)}
                  className={select}
                  aria-label={t("language")}
                >
                  {locales.map((code) => (
                    <option key={code} value={code}>
                      {code === "tr" ? "Türkçe" : "English"}
                    </option>
                  ))}
                </select>
              </Row>
            </Group>
          )}

          {pane === "wifi" && (
            <Group>
              <Row
                label="Wi-Fi"
                hint={
                  wifi.on
                    ? t("connectedTo", {
                        network: wifi.network || site.os.wifi,
                      })
                    : t("wifiOff")
                }
              >
                <Toggle
                  on={wifi.on}
                  onChange={(on) => wifiStore.write({ ...wifi, on })}
                  label="Wi-Fi"
                />
              </Row>
            </Group>
          )}

          {pane === "sound" && (
            <Group>
              <Row label={t("volume")}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={player.volume}
                  onChange={(e) => music.setVolume(Number(e.target.value))}
                  aria-label={t("volume")}
                  className="w-40 accent-(--accent)"
                />
              </Row>
              <Row label={t("music")}>
                <button
                  type="button"
                  onClick={() => actions.open("music")}
                  className={select}
                >
                  {t("open")}
                </button>
              </Row>
            </Group>
          )}

          {pane === "docker" && (
            <Group>
              <Row label="Docker Desktop" hint={t(`docker.${docker.status}`)}>
                <button
                  type="button"
                  onClick={() =>
                    docker.status === "stopped" ? startDocker() : stopDocker()
                  }
                  className={select}
                >
                  {docker.status === "stopped"
                    ? t("docker.start")
                    : t("docker.stop")}
                </button>
              </Row>
              <Row label={t("docker.startOnLogin")}>
                <Toggle
                  on={docker.startOnLogin}
                  onChange={(startOnLogin) => setDocker({ startOnLogin })}
                  label={t("docker.startOnLogin")}
                />
              </Row>
              <Row label={t("docker.cpus")} hint={String(docker.cpus)}>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={docker.cpus}
                  onChange={(e) => setDocker({ cpus: Number(e.target.value) })}
                  aria-label={t("docker.cpus")}
                  className="w-40 accent-[#1d63ed]"
                />
              </Row>
              <Row label={t("docker.memory")} hint={`${docker.memoryGb} GB`}>
                <input
                  type="range"
                  min={2}
                  max={16}
                  step={2}
                  value={docker.memoryGb}
                  onChange={(e) =>
                    setDocker({ memoryGb: Number(e.target.value) })
                  }
                  aria-label={t("docker.memory")}
                  className="w-40 accent-[#1d63ed]"
                />
              </Row>
            </Group>
          )}

          {pane === "desktop" && (
            <Group>
              <Row label={t("reminders")}>
                <Toggle
                  on={prefs.showReminders}
                  onChange={(showReminders) =>
                    desktopPrefs.write({ ...prefs, showReminders })
                  }
                  label={t("reminders")}
                />
              </Row>
              <Row label={t("musicWidget")}>
                <Toggle
                  on={prefs.showMusic !== false}
                  onChange={(showMusic) =>
                    desktopPrefs.write({ ...prefs, showMusic })
                  }
                  label={t("musicWidget")}
                />
              </Row>
              <Row label={t("magnify")}>
                <Toggle
                  on={prefs.dockMagnify}
                  onChange={(dockMagnify) =>
                    desktopPrefs.write({ ...prefs, dockMagnify })
                  }
                  label={t("magnify")}
                />
              </Row>
              <Row label={t("cleanUp")} hint={t("cleanUpHint")}>
                <button
                  type="button"
                  onClick={() => iconPositions.write({})}
                  className={select}
                >
                  {t("cleanUpButton")}
                </button>
              </Row>
            </Group>
          )}
        </div>
      </div>
    </Window>
  );
}
