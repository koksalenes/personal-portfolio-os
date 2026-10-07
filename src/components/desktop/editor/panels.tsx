"use client";

import { useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Check } from "@/components/ui/icons";
import { locales, type Locale } from "@/i18n/config";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { useHydrated } from "../hooks";
import type { OsActions } from "../actions";
import { wallpaperStore, wallpapers, type Wallpaper } from "../store";
import { allFiles, nameOf, README_PATH, PAGE_PATH } from "./files";

export type Panel = "explorer" | "search" | "git" | "extensions" | "settings";

function PanelTitle({
  children,
  action,
}: Readonly<{ children: ReactNode; action?: ReactNode }>) {
  return (
    <div className="text-faint mb-2 flex items-center justify-between px-4 text-[10px] tracking-[0.18em] uppercase">
      <span>{children}</span>
      {action}
    </div>
  );
}

const inputClass =
  "os-plain border-border bg-background/60 focus:border-accent w-full rounded border px-2 py-1 text-xs outline-none";

export function SearchPanel({
  sources,
  onOpen,
}: Readonly<{
  sources: Record<string, string>;
  onOpen: (path: string, line: number) => void;
}>) {
  const t = useTranslations("editor");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const results = q
    ? allFiles
        .map((path) => ({
          path,
          hits: (sources[path] ?? "")
            .split("\n")
            .map((text, line) => ({ text, line }))
            .filter(({ text }) => text.toLowerCase().includes(q)),
        }))
        .filter((r) => r.hits.length > 0)
    : [];
  const count = results.reduce((n, r) => n + r.hits.length, 0);

  const mark = (text: string) => {
    const i = text.toLowerCase().indexOf(q);
    const start = Math.max(0, i - 18);
    return (
      <>
        {start > 0 && "…"}
        {text.slice(start, i).trimStart()}
        <mark className="bg-accent/35 text-foreground rounded-[2px]">
          {text.slice(i, i + q.length)}
        </mark>
        {text.slice(i + q.length, i + q.length + 60)}
      </>
    );
  };

  return (
    <>
      <PanelTitle>{t("search")}</PanelTitle>
      <div className="px-3">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("search")}
          className={inputClass}
        />
        {q && (
          <p className="text-faint mt-2 text-[11px]">
            {count
              ? t("results", { n: count, files: results.length })
              : t("noResults")}
          </p>
        )}
      </div>
      <div className="mt-2">
        {results.map(({ path, hits }) => (
          <div key={path} className="mb-1">
            <p className="text-foreground flex items-center justify-between px-3 py-0.5 text-[11px] font-semibold">
              <span className="truncate">{nameOf(path)}</span>
              <span className="bg-foreground/10 rounded-full px-1.5 text-[10px]">
                {hits.length}
              </span>
            </p>
            {hits.slice(0, 8).map(({ text, line }) => (
              <button
                key={line}
                type="button"
                onClick={() => onOpen(path, line)}
                className="text-muted hover:bg-foreground/5 block w-full truncate py-0.5 pr-3 pl-6 text-left text-[11px]"
              >
                {mark(text)}
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

type Change = { path: string; status: "M" | "A" | "U" };
export type GitState = {
  staged: Change[];
  changes: Change[];
  commits: Array<{ hash: string; message: string }>;
  ahead: number;
};

export const initialGit: GitState = {
  staged: [
    { path: PAGE_PATH, status: "M" },
    { path: "apps/web-next/src/components/Hero.tsx", status: "M" },
    { path: "apps/api-dotnet/ContactEndpoint.cs", status: "A" },
  ],
  changes: [
    { path: README_PATH, status: "M" },
    { path: "apps/api-nest/src/projects.service.ts", status: "M" },
    { path: "apps/worker-node/index.ts", status: "U" },
  ],
  commits: [
    { hash: "9f3c2ab", message: "feat(os): lock screen and boot animation" },
    { hash: "4e81d07", message: "feat(web): run the site inside a desktop" },
    { hash: "b27a5c1", message: "chore: initial commit" },
  ],
  ahead: 0,
};

const statusColor = {
  M: "text-(--syn-tag)",
  A: "text-(--syn-string)",
  U: "text-(--syn-string)",
};

export function GitPanel({
  git,
  setGit,
  onOpen,
}: Readonly<{
  git: GitState;
  setGit: (next: GitState) => void;
  onOpen: (path: string) => void;
}>) {
  const t = useTranslations("editor");
  const [message, setMessage] = useState("");

  const commit = () => {
    if (!git.staged.length) return;
    const hash = Math.random().toString(16).slice(2, 9);
    setGit({
      ...git,
      staged: [],
      commits: [
        {
          hash,
          message: message.trim() || t("defaultCommit", { os: site.os.name }),
        },
        ...git.commits,
      ],
      ahead: git.ahead + 1,
    });
    setMessage("");
  };

  const move = (change: Change, to: "staged" | "changes") => {
    const from = to === "staged" ? "changes" : "staged";
    setGit({
      ...git,
      [from]: git[from].filter((c) => c.path !== change.path),
      [to]: [...git[to], change],
    });
  };

  const list = (items: Change[], to: "staged" | "changes") =>
    items.map((c) => (
      <div
        key={c.path}
        className="group hover:bg-foreground/5 flex items-center gap-2 py-[3px] pr-2 pl-5"
      >
        <button
          type="button"
          onClick={() => onOpen(c.path)}
          className="text-muted flex min-w-0 flex-1 items-baseline gap-1.5 text-left"
        >
          <span className="text-foreground truncate">{nameOf(c.path)}</span>
          <span className="text-faint truncate text-[10px]">
            {c.path.split("/").slice(0, -1).join("/")}
          </span>
        </button>
        <button
          type="button"
          onClick={() => move(c, to)}
          aria-label={to === "staged" ? t("stage") : t("unstage")}
          title={to === "staged" ? t("stage") : t("unstage")}
          className="text-faint hover:text-foreground hidden w-4 group-hover:block"
        >
          {to === "staged" ? "+" : "−"}
        </button>
        <span
          className={cn("w-3 text-center font-bold", statusColor[c.status])}
        >
          {c.status}
        </span>
      </div>
    ));

  return (
    <>
      <PanelTitle>{t("sourceControl")}</PanelTitle>
      <div className="px-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              commit();
            }
          }}
          rows={2}
          placeholder={t("commitPlaceholder")}
          aria-label={t("commitPlaceholder")}
          className={cn(inputClass, "resize-none")}
        />
        <button
          type="button"
          onClick={commit}
          disabled={!git.staged.length}
          className="bg-accent text-on-accent mt-1.5 flex w-full items-center justify-center gap-1.5 rounded py-1 text-xs font-semibold disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" /> {t("commit")}
        </button>
      </div>

      <p className="text-foreground mt-3 flex items-center justify-between px-3 text-[11px] font-semibold">
        {t("staged")}
        <span className="bg-foreground/10 rounded-full px-1.5 text-[10px]">
          {git.staged.length}
        </span>
      </p>
      {git.staged.length ? (
        list(git.staged, "changes")
      ) : (
        <p className="text-faint px-5 py-1 text-[11px]">{t("nothingStaged")}</p>
      )}

      <p className="text-foreground mt-2 flex items-center justify-between px-3 text-[11px] font-semibold">
        {t("changes")}
        <span className="bg-foreground/10 rounded-full px-1.5 text-[10px]">
          {git.changes.length}
        </span>
      </p>
      {list(git.changes, "staged")}

      <p className="text-foreground mt-3 px-3 text-[11px] font-semibold">
        {t("commits")}
      </p>
      {git.commits.slice(0, 6).map((c) => (
        <p
          key={c.hash}
          className="text-muted flex gap-2 truncate px-5 py-[3px] text-[11px]"
        >
          <span className="text-(--syn-fn)">{c.hash}</span>
          <span className="truncate">{c.message}</span>
        </p>
      ))}
    </>
  );
}

const extensions = [
  {
    id: "csharp",
    name: "C# Dev Kit",
    publisher: "Microsoft",
    icon: "C#",
    tile: "bg-[#68217a]",
  },
  {
    id: "eslint",
    name: "ESLint",
    publisher: "Microsoft",
    icon: "ES",
    tile: "bg-[#4b32c3]",
  },
  {
    id: "prettier",
    name: "Prettier",
    publisher: "Prettier",
    icon: "P",
    tile: "bg-[#1a2b34]",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS IntelliSense",
    publisher: "Tailwind Labs",
    icon: "tw",
    tile: "bg-[#0ea5e9]",
  },
  {
    id: "nest",
    name: "NestJS Snippets",
    publisher: "Community",
    icon: "N",
    tile: "bg-[#e0234e]",
  },
  {
    id: "docker",
    name: "Docker",
    publisher: "Microsoft",
    icon: "🐳",
    tile: "bg-[#1d63ed]",
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    publisher: "Microsoft",
    icon: "PG",
    tile: "bg-[#336791]",
  },
  {
    id: "gitlens",
    name: "GitLens",
    publisher: "GitKraken",
    icon: "GL",
    tile: "bg-[#212a3a]",
  },
  {
    id: "rest",
    name: "REST Client",
    publisher: "Huachao Mao",
    icon: "{}",
    tile: "bg-[#2e7d32]",
  },
] as const;

export function ExtensionsPanel({
  disabled,
  setDisabled,
}: Readonly<{ disabled: string[]; setDisabled: (ids: string[]) => void }>) {
  const t = useTranslations("editor");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = extensions.filter((e) =>
    `${e.name} ${e.publisher} ${t(`ext.${e.id}`)}`.toLowerCase().includes(q),
  );

  return (
    <>
      <PanelTitle>{t("extensions")}</PanelTitle>
      <div className="px-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("extSearch")}
          aria-label={t("extSearch")}
          className={inputClass}
        />
      </div>
      <p className="text-foreground mt-3 flex items-center justify-between px-3 text-[11px] font-semibold">
        {t("installed")}
        <span className="bg-foreground/10 rounded-full px-1.5 text-[10px]">
          {shown.length}
        </span>
      </p>
      {shown.map((ext) => {
        const off = disabled.includes(ext.id);
        return (
          <div
            key={ext.id}
            className={cn(
              "hover:bg-foreground/5 flex gap-2.5 px-3 py-2",
              off && "opacity-50",
            )}
          >
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded font-sans text-[11px] font-bold text-white",
                ext.tile,
              )}
            >
              {ext.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-foreground block truncate text-[12px] font-semibold">
                {ext.name}
              </span>
              <span className="text-faint block truncate text-[11px]">
                {t(`ext.${ext.id}`)}
              </span>
              <span className="mt-1 flex items-center justify-between">
                <span className="text-faint truncate text-[10px]">
                  {ext.publisher}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDisabled(
                      off
                        ? disabled.filter((d) => d !== ext.id)
                        : [...disabled, ext.id],
                    )
                  }
                  className="border-border hover:border-accent rounded border px-1.5 text-[10px]"
                >
                  {off ? t("enable") : t("disable")}
                </button>
              </span>
            </span>
          </div>
        );
      })}
    </>
  );
}

export type EditorPrefs = { fontSize: number; minimap: boolean };

export function SettingsPanel({
  prefs,
  setPrefs,
  actions,
}: Readonly<{
  prefs: EditorPrefs;
  setPrefs: (next: EditorPrefs) => void;
  actions: OsActions;
}>) {
  const t = useTranslations("editor");
  const tw = useTranslations("desktop.wallpapers");
  const locale = useLocale();
  const { theme: storedTheme } = useTheme();
  const theme = useHydrated() ? storedTheme : undefined;
  const wallpaper = wallpaperStore.useValue();

  const row = (
    label: string,
    id: string,
    control: ReactNode,
    hint?: string,
  ) => (
    <div className="border-border border-b px-3 py-2.5">
      <label
        htmlFor={id}
        className="text-foreground block text-[11px] font-semibold"
      >
        {label}
      </label>
      {hint && <p className="text-faint mb-1.5 text-[10px]">{hint}</p>}
      {control}
    </div>
  );

  return (
    <>
      <PanelTitle>{t("settings")}</PanelTitle>
      {row(
        t("theme"),
        "set-theme",
        <select
          id="set-theme"
          value={theme ?? "dark"}
          onChange={(e) => actions.setTheme(e.target.value as "dark" | "light")}
          className={inputClass}
        >
          <option value="dark">{t("themeDark")}</option>
          <option value="light">{t("themeLight")}</option>
          <option value="system">{t("themeSystem")}</option>
        </select>,
        t("themeHint"),
      )}
      {row(
        t("language"),
        "set-lang",
        <select
          id="set-lang"
          value={locale}
          onChange={(e) => actions.setLocale(e.target.value as Locale)}
          className={inputClass}
        >
          {locales.map((code) => (
            <option key={code} value={code}>
              {code === "tr" ? "Türkçe" : "English"}
            </option>
          ))}
        </select>,
      )}
      {row(
        t("fontSize"),
        "set-font",
        <select
          id="set-font"
          value={prefs.fontSize}
          onChange={(e) =>
            setPrefs({ ...prefs, fontSize: Number(e.target.value) })
          }
          className={inputClass}
        >
          {[12, 13, 14, 16].map((n) => (
            <option key={n} value={n}>
              {n}px
            </option>
          ))}
        </select>,
      )}
      {row(
        t("wallpaper"),
        "set-wall",
        <select
          id="set-wall"
          value={wallpaper}
          onChange={(e) => actions.setWallpaper(e.target.value as Wallpaper)}
          className={inputClass}
        >
          {wallpapers.map((w) => (
            <option key={w} value={w}>
              {tw(w)}
            </option>
          ))}
        </select>,
      )}
      <label className="text-foreground flex items-center gap-2 px-3 py-2.5 text-[11px] font-semibold">
        <input
          type="checkbox"
          checked={prefs.minimap}
          onChange={(e) => setPrefs({ ...prefs, minimap: e.target.checked })}
          className="accent-(--accent)"
        />
        {t("minimap")}
      </label>
    </>
  );
}
