"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Blocks,
  Close,
  Files,
  GitBranch,
  Pause,
  Play,
  Search,
  Settings,
} from "@/components/ui/icons";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import type { OsActions } from "../actions";
import { useCompact, usePhone } from "../hooks";
import { usePersistent } from "../session";
import { ContextMenu, item, sep, type MenuEntry } from "../Menu";
import { Window, type WindowControls } from "../Window";
import {
  ExtensionsPanel,
  GitPanel,
  SearchPanel,
  SettingsPanel,
  initialGit,
  type EditorPrefs,
  type GitState,
  type Panel,
} from "./panels";
import {
  PAGE_PATH,
  extOf,
  languageOf,
  nameOf,
  pageSource,
  staticSources,
  tree,
  type TreeNode,
} from "./files";
import { highlight, tokenColor, typedLength, type Token } from "./highlight";

const NO_EXT: string[] = [];
const DEFAULT_PREFS: EditorPrefs = { fontSize: 13, minimap: true };

export type EditorNav = {
  open: string[];
  active: string | null;
  pinned?: string[];
};

type BottomTab = "problems" | "output" | "terminal";
type LogLevel = "info" | "warn" | "error";
type LogEntry = { id: number; time: string; level: LogLevel; text: string };

let logCounter = 0;
const stamp = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

const CHARS_PER_MS = 0.12;
const TYPING_DELAY_MS = 700;

const isCompact = () => window.matchMedia("(max-width: 767px)").matches;

const okLines: ReactNode[] = [
  <>
    <span className="text-accent">➜</span>{" "}
    <span className="text-(--syn-fn)">{site.domain}</span>{" "}
    <span className="text-foreground">npm run dev</span>
  </>,
  <span key="next" className="text-foreground">
    {"   ▲ Next.js 16"}
  </span>,
  <>
    {"   - Local:   "}
    <span className="text-(--syn-fn) underline">{site.url}</span>
  </>,
  <>
    <span className="text-(--syn-string)">{" ✓"}</span>
    {" Ready in 412ms"}
  </>,
];

const errorLines = (line: number, col: number): ReactNode[] => [
  okLines[0],
  okLines[1],
  <span key="fail" className="text-(--syn-error)">
    {" ✗ Failed to compile"}
  </span>,
  <>
    {"   "}
    <span className="underline">{`./apps/web-next/src/app/page.tsx:${line}:${col}`}</span>
  </>,
  <span key="syntax" className="text-(--syn-error)">
    {"   SyntaxError: Unexpected end of input."}
  </span>,
  <span key="hint" className="text-faint">
    {"   Code is still being written, wait for it to finish."}
  </span>,
];

function FileIcon({ path }: Readonly<{ path: string }>) {
  const ext = extOf(path);
  const icon: Record<string, [string, string]> = {
    tsx: ["⚛", "text-(--syn-fn)"],
    ts: ["TS", "text-[#3178c6] text-[8px] font-bold"],
    cs: ["C#", "text-[#a179dc] text-[8px] font-bold"],
    java: ["☕", "text-[#e76f00] text-[9px]"],
    yml: ["≡", "text-[#cb171e] text-[10px] font-bold"],
    json: ["{}", "text-(--syn-tag) text-[9px] font-bold"],
    md: ["M↓", "text-(--syn-fn) text-[8px] font-bold"],
  };
  const [glyph, color] = icon[ext] ?? ["•", "text-faint"];
  return (
    <span className={cn("inline-grid w-4 shrink-0 place-items-center", color)}>
      {glyph}
    </span>
  );
}

function Caret() {
  return (
    <span className="bg-accent animate-caret ml-px inline-block h-[1.15em] w-[2px] translate-y-[0.2em]" />
  );
}

function TreeItems({
  nodes,
  depth,
  active,
  collapsed,
  onToggle,
  onOpen,
  onMenu,
}: Readonly<{
  nodes: TreeNode[];
  depth: number;
  active: string | null;
  collapsed: string[];
  onToggle: (path: string) => void;
  onOpen: (path: string) => void;
  onMenu: (e: React.MouseEvent, path: string) => void;
}>) {
  return nodes.map((node) => {
    const pad = { paddingLeft: `${0.75 + depth * 0.75}rem` };
    if (node.kind === "file") {
      return (
        <button
          key={node.path}
          type="button"
          style={pad}
          onClick={() => onOpen(node.path)}
          onContextMenu={(e) => onMenu(e, node.path)}
          className={cn(
            "flex w-full items-center gap-1.5 truncate py-[3px] pr-3 text-left",
            active === node.path
              ? "bg-accent-soft text-foreground"
              : "text-muted hover:bg-foreground/5",
          )}
        >
          <FileIcon path={node.path} />
          {node.name}
        </button>
      );
    }
    const isOpen = !collapsed.includes(node.path);
    return (
      <div key={node.path}>
        <button
          type="button"
          style={pad}
          onClick={() => onToggle(node.path)}
          aria-expanded={isOpen}
          className="text-muted hover:bg-foreground/5 flex w-full items-center gap-1.5 truncate py-[3px] pr-3 text-left"
        >
          <span
            className={cn(
              "inline-block w-4 text-center text-[9px] transition-transform",
              isOpen && "rotate-90",
            )}
          >
            ▶
          </span>
          {node.name}
        </button>
        {isOpen && (
          <TreeItems
            nodes={node.children}
            depth={depth + 1}
            active={active}
            collapsed={collapsed}
            onToggle={onToggle}
            onOpen={onOpen}
            onMenu={onMenu}
          />
        )}
      </div>
    );
  });
}

export function Editor({
  controls,
  nav,
  setNav,
  instant,
  onLaunch,
  actions,
}: Readonly<{
  controls: WindowControls;
  nav: EditorNav;
  setNav: Dispatch<SetStateAction<EditorNav>>;
  instant: boolean;
  onLaunch: (auto: boolean) => void;
  actions: OsActions;
}>) {
  const t = useTranslations("hero.editor");
  const te = useTranslations("editor");
  const td = useTranslations("desktop");
  const tMeta = useTranslations("meta");
  const tHero = useTranslations("hero");
  const jobTitle = tMeta("jobTitle");
  const page = pageSource(jobTitle);
  const pageLines = highlight(page, "tsx");
  const sources: Record<string, string> = {
    ...staticSources({
      jobTitle,
      description: tMeta("description"),
      roles: tHero.raw("rolesTyped") as string[],
    }),
    [PAGE_PATH]: page,
  };
  const total = pageLines.reduce((n, line) => n + typedLength(line) + 1, 0);

  const [startedDone] = useState(instant);
  const [typed, setTyped] = useState(startedDone ? total : 0);
  const [paused, setPaused] = useState(false);
  const [running, setRunning] = useState(startedDone);
  const [shownOk, setShownOk] = useState(startedDone ? okLines.length : 0);
  const [compileError, setCompileError] = useState<{
    line: number;
    col: number;
  } | null>(null);
  const [terminalHidden, setTerminalHidden] = useState(false);
  const [bottomTab, setBottomTab] = useState<BottomTab>("terminal");
  const [panelPinnedOpen, setPanelPinnedOpen] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [tabMenu, setTabMenu] = useState<{
    x: number;
    y: number;
    path: string;
    source: "tab" | "tree";
  } | null>(null);
  const addLog = (level: LogLevel, text: string) =>
    setLog((l) => [
      ...l.slice(-60),
      { id: ++logCounter, time: stamp(), level, text },
    ]);
  const [skipped, setSkipped] = useState(startedDone);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [sidebar, setSidebar] = usePersistent<boolean | null>(
    "editor.sidebar",
    null,
  );
  const [panel, setPanel] = usePersistent<Panel>("editor.panel", "explorer");
  const [git, setGit] = usePersistent<GitState>("editor.git", initialGit);
  const [disabledExt, setDisabledExt] = usePersistent<string[]>(
    "editor.ext",
    NO_EXT,
  );
  const [prefs, setPrefs] = usePersistent<EditorPrefs>(
    "editor.prefs",
    DEFAULT_PREFS,
  );
  const [jump, setJump] = useState<{
    path: string;
    line: number;
    n: number;
  } | null>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = codeRef.current;
    if (!jump || !el) return;
    const row = el.querySelector<HTMLElement>(`[data-line="${jump.line}"]`);
    if (row) el.scrollTop = row.offsetTop - el.clientHeight / 2;
  }, [jump]);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [cursor, setCursor] = useState<Record<string, number>>({});
  const typingDone = typed >= total;

  const progress = useRef(
    startedDone ? total : -TYPING_DELAY_MS * CHARS_PER_MS,
  );
  const instantRef = useRef(instant);
  useEffect(() => {
    instantRef.current = instant;
  }, [instant]);

  useEffect(() => {
    if (paused || typingDone) return;
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      if (instantRef.current) progress.current = total;
      else if (last) progress.current += (now - last) * CHARS_PER_MS;
      last = now;
      const n = Math.max(0, Math.min(total, Math.floor(progress.current)));
      setTyped(n);
      if (n < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, total, typingDone]);

  const launch = useEffectEvent(onLaunch);

  useEffect(() => {
    if (!typingDone || skipped) return;
    const k = instantRef.current ? 0 : 1;
    const steps: Array<[number, () => void]> = [
      [
        350 * k,
        () => {
          setCompileError(null);
          setTerminalHidden(false);
          setRunning(true);
          addLog("info", "> next dev");
          addLog("info", "Compiling /page …");
        },
      ],
      [650 * k, () => setShownOk(1)],
      [1100 * k, () => setShownOk(2)],
      [1350 * k, () => setShownOk(3)],
      [
        1750 * k,
        () => {
          setShownOk(4);
          addLog("info", `Compiled /page in 412ms · ${site.url}`);
        },
      ],
      [2350 * k, () => launch(true)],
    ];
    const timers = steps.map(([ms, fn]) => setTimeout(fn, ms));
    return () => timers.forEach(clearTimeout);
  }, [typingDone, skipped]);

  let remaining = typed;
  let caretLine = 0;
  let caretCol = 0;
  const typedLines: Array<{ tokens: Token[]; caret: boolean }> = [];
  for (const [li, line] of pageLines.entries()) {
    const cost = typedLength(line);
    const indent = line[0]?.[0] === "i" ? line[0][1].length : 0;
    if (remaining > cost) {
      typedLines.push({ tokens: line, caret: false });
      remaining -= cost + 1;
      caretLine = li;
      caretCol = indent + cost;
      continue;
    }
    let budget = remaining;
    const partial: Token[] = [];
    for (const [type, text] of line) {
      if (type === "i") {
        partial.push([type, text]);
        continue;
      }
      if (budget <= 0) break;
      partial.push([type, text.slice(0, budget)]);
      budget -= text.length;
    }
    typedLines.push({ tokens: partial, caret: true });
    caretLine = li;
    caretCol = indent + remaining;
    break;
  }
  if (typingDone && typedLines.length) typedLines.at(-1)!.caret = true;

  const active = nav.active;
  const isPage = active === PAGE_PATH;
  const staticLines =
    active && !isPage ? highlight(sources[active] ?? "", extOf(active)) : [];
  const activeLine = active && !isPage ? (cursor[active] ?? 0) : caretLine;
  const lines: Array<{ tokens: Token[]; caret: boolean; current: boolean }> =
    isPage
      ? typedLines.map((l) => ({ ...l, current: l.caret }))
      : staticLines.map((tokens, i) => ({
          tokens,
          caret: false,
          current: i === activeLine,
        }));

  const pinned = nav.pinned ?? [];
  const tabs = [
    ...pinned.filter((p) => nav.open.includes(p)),
    ...nav.open.filter((p) => !pinned.includes(p)),
  ];

  const openFile = (path: string) => {
    setNav((n) => ({
      ...n,
      open: n.open.includes(path) ? n.open : [...n.open, path],
      active: path,
    }));
    if (isCompact()) setMobileSidebar(false);
  };

  const closeTabs = (paths: string[]) => {
    setNav((n) => {
      const idx = n.active ? n.open.indexOf(n.active) : 0;
      const open = n.open.filter((p) => !paths.includes(p));
      const nextActive =
        n.active && paths.includes(n.active)
          ? (open[Math.min(idx, open.length - 1)] ?? null)
          : n.active;
      return {
        ...n,
        open,
        active: nextActive,
        pinned: (n.pinned ?? []).filter((p) => !paths.includes(p)),
      };
    });
  };
  const closeTab = (path: string) => closeTabs([path]);

  const togglePin = (path: string) =>
    setNav((n) => {
      const list = n.pinned ?? [];
      return {
        ...n,
        open: n.open.includes(path) ? n.open : [...n.open, path],
        pinned: list.includes(path)
          ? list.filter((p) => p !== path)
          : [...list, path],
      };
    });

  const copyPath = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    addLog("info", `${te("copied")}: ${text}`);
  };

  const revealInExplorer = (path: string) => {
    setPanel("explorer");
    openSidebar();
    setCollapsed((c) => c.filter((dir) => !path.startsWith(`${dir}/`)));
  };

  const tabMenuEntries = (
    path: string,
    source: "tab" | "tree",
  ): MenuEntry[] => {
    const isOpen = nav.open.includes(path);
    const isPinned = pinned.includes(path);
    const idx = tabs.indexOf(path);
    const closable = (list: string[]) =>
      list.filter((p) => !pinned.includes(p));
    const fileEntries: MenuEntry[] = [
      item(isPinned ? te("unpin") : te("pin"), () => togglePin(path)),
      sep,
      item(te("copyPath"), () => copyPath(`~/${site.domain}/${path}`)),
      item(te("copyRelativePath"), () => copyPath(path)),
    ];
    if (source === "tree")
      return [
        item(te("open"), () => openFile(path)),
        ...(isOpen ? [item(te("close"), () => closeTab(path))] : []),
        sep,
        ...fileEntries,
      ];
    return [
      item(te("close"), () => closeTab(path), { shortcut: "⌥W" }),
      item(
        te("closeOthers"),
        () => closeTabs(closable(tabs.filter((p) => p !== path))),
        {
          disabled: closable(tabs.filter((p) => p !== path)).length === 0,
        },
      ),
      item(te("closeRight"), () => closeTabs(closable(tabs.slice(idx + 1))), {
        disabled: closable(tabs.slice(idx + 1)).length === 0,
      }),
      item(te("closeAll"), () => closeTabs(closable(tabs)), {
        disabled: closable(tabs).length === 0,
      }),
      sep,
      ...fileEntries,
      sep,
      item(te("reveal"), () => revealInExplorer(path)),
    ];
  };

  const openBottom = (tab: BottomTab) => {
    setBottomTab(tab);
    setPanelPinnedOpen(true);
    setTerminalHidden(false);
  };

  const toggleFolder = (path: string) =>
    setCollapsed((c) =>
      c.includes(path) ? c.filter((p) => p !== path) : [...c, path],
    );

  const openSidebar = () =>
    isCompact() ? setMobileSidebar(true) : setSidebar(true);
  const sidebarShown = () => (isCompact() ? mobileSidebar : (sidebar ?? true));
  const toggleSidebar = () =>
    isCompact() ? setMobileSidebar((v) => !v) : setSidebar(!sidebarShown());
  const showPanel = (next: Panel) => {
    if (panel === next && sidebarShown()) {
      if (isCompact()) setMobileSidebar(false);
      else setSidebar(false);
    } else {
      setPanel(next);
      openSidebar();
    }
  };
  const openAt = (path: string, line: number) => {
    openFile(path);
    if (path !== PAGE_PATH) setCursor((c) => ({ ...c, [path]: line }));
    setJump((j) => ({ path, line, n: (j?.n ?? 0) + 1 }));
  };

  const runOrError = () => {
    if (!typingDone) {
      setTerminalHidden(false);
      setBottomTab("terminal");
      setCompileError({ line: caretLine + 1, col: caretCol + 1 });
      addLog(
        "error",
        `./apps/web-next/src/app/page.tsx:${caretLine + 1}:${caretCol + 1} SyntaxError: Unexpected end of input`,
      );
      return;
    }
    if (shownOk < okLines.length) return;
    setTerminalHidden(false);
    onLaunch(false);
  };

  const skip = () => {
    progress.current = total;
    setTyped(total);
    setPaused(false);
    setSkipped(true);
    setCompileError(null);
    setRunning(true);
    setShownOk(okLines.length);
    onLaunch(false);
  };

  const terminalLines = running
    ? okLines.slice(0, shownOk)
    : compileError
      ? errorLines(compileError.line, compileError.col)
      : [];
  const terminalOpen =
    (running || compileError !== null || panelPinnedOpen) && !terminalHidden;
  const hasError = compileError !== null && !running;

  const titleBar = (
    <>
      <p className="text-faint pointer-events-none absolute inset-x-0 hidden truncate px-48 text-center font-mono text-xs md:block">
        {active ? nameOf(active) : td("welcome")} — {site.domain}
      </p>
      <div className="relative ml-auto flex items-center gap-2">
        {!typingDone && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={paused ? t("resume") : t("pause")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] whitespace-nowrap transition-colors",
              paused
                ? "border-accent text-accent"
                : "border-border text-muted hover:border-accent hover:text-accent",
            )}
          >
            {paused ? (
              <Play className="h-3 w-3" />
            ) : (
              <Pause className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">
              {paused ? t("resume") : t("pause")}
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={runOrError}
          aria-label={t("run")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors duration-300",
            running
              ? "border-accent bg-accent text-on-accent"
              : hasError
                ? "border-(--syn-error) text-(--syn-error)"
                : "border-border text-muted hover:border-accent hover:text-accent",
          )}
        >
          <Play className="h-3 w-3" />
          <span className="hidden sm:inline">{t("run")}</span>
        </button>
        {!skipped && shownOk < okLines.length && (
          <button
            type="button"
            onClick={skip}
            className="text-muted hover:text-accent rounded-md px-2 py-1 font-mono text-[11px] whitespace-nowrap transition-colors"
          >
            {t("skipIntro")} →
          </button>
        )}
      </div>
    </>
  );

  const activity: Array<{
    id: Panel;
    Icon: typeof Files;
    label: string;
    badge?: number;
  }> = [
    { id: "explorer", Icon: Files, label: te("explorer") },
    { id: "search", Icon: Search, label: te("search") },
    {
      id: "git",
      Icon: GitBranch,
      label: te("sourceControl"),
      badge: git.staged.length + git.changes.length,
    },
    { id: "extensions", Icon: Blocks, label: te("extensions") },
  ];
  const panelOpen = (id: Panel) => panel === id && sidebar !== false;
  const compact = usePhone();
  const narrow = useCompact();
  const codeSize = compact ? Math.min(prefs.fontSize, 11) : prefs.fontSize;
  const panelIcons = [
    ...activity,
    {
      id: "settings" as Panel,
      Icon: Settings,
      label: te("settings"),
      badge: 0,
    },
  ];

  return (
    <Window
      id="editor"
      label={td("editor")}
      controls={controls}
      titleBar={titleBar}
      animateIn
      className="desktop-intro"
    >
      <div className="relative flex min-h-0 flex-1 font-mono">
        <nav className="border-border bg-surface-2 hidden w-12 shrink-0 flex-col items-center gap-1 border-r py-2 sm:flex">
          {[
            ...activity,
            {
              id: "settings" as Panel,
              Icon: Settings,
              label: te("settings"),
              badge: 0,
            },
          ].map(({ id, Icon, label, badge }) => (
            <button
              key={id}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={panelOpen(id)}
              onClick={() => showPanel(id)}
              className={cn(
                "relative grid h-10 w-10 place-items-center transition-colors",
                id === "settings" && "mt-auto",
                panelOpen(id)
                  ? "text-foreground"
                  : "text-faint hover:text-muted",
              )}
            >
              {panelOpen(id) && (
                <span className="bg-accent absolute inset-y-2 left-0 w-0.5" />
              )}
              <Icon className="h-5 w-5" />
              {!!badge && (
                <span className="bg-accent text-on-accent absolute right-1 bottom-1 grid h-3.5 min-w-3.5 place-items-center rounded-full px-0.5 text-[8px] font-bold">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <aside
          className={cn(
            "border-border bg-surface-2 w-60 max-w-[85%] shrink-0 flex-col overflow-y-auto border-r py-2 text-xs",
            narrow
              ? mobileSidebar
                ? "absolute inset-y-0 left-0 z-20 flex shadow-2xl"
                : "hidden"
              : sidebar === false
                ? "hidden"
                : "flex",
          )}
        >
          <div className="border-border mb-2 flex justify-around border-b px-2 pb-2 sm:hidden">
            {panelIcons.map(({ id, Icon, label }) => (
              <button
                key={id}
                type="button"
                aria-label={label}
                aria-pressed={panel === id}
                onClick={() => setPanel(id)}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded",
                  panel === id
                    ? "bg-accent-soft text-foreground"
                    : "text-faint",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          {panel === "explorer" && (
            <>
              <p className="text-faint mb-1 px-4 text-[10px] tracking-[0.18em] uppercase">
                {te("explorer")}
              </p>
              <p className="text-foreground px-3 py-1 text-[11px] font-bold tracking-wide uppercase">
                ▾ {site.domain}
              </p>
              <TreeItems
                nodes={tree}
                depth={0}
                active={active}
                collapsed={collapsed}
                onToggle={toggleFolder}
                onOpen={openFile}
                onMenu={(e, path) => {
                  e.preventDefault();
                  setTabMenu({
                    x: e.clientX,
                    y: e.clientY,
                    path,
                    source: "tree",
                  });
                }}
              />
            </>
          )}
          {panel === "search" && (
            <SearchPanel sources={sources} onOpen={openAt} />
          )}
          {panel === "git" && (
            <GitPanel
              git={git}
              setGit={(next) => {
                if (next.commits.length > git.commits.length)
                  addLog(
                    "info",
                    `[main ${next.commits[0].hash}] ${next.commits[0].message}`,
                  );
                setGit(next);
              }}
              onOpen={openFile}
            />
          )}
          {panel === "extensions" && (
            <ExtensionsPanel
              disabled={disabledExt}
              setDisabled={(ids) => {
                const off = ids.find((id) => !disabledExt.includes(id));
                const on = disabledExt.find((id) => !ids.includes(id));
                if (off) addLog("warn", `Extension disabled: ${off}`);
                if (on) addLog("info", `Extension enabled: ${on}`);
                setDisabledExt(ids);
              }}
            />
          )}
          {panel === "settings" && (
            <SettingsPanel
              prefs={prefs}
              setPrefs={setPrefs}
              actions={actions}
            />
          )}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-border bg-surface-2 flex h-9 shrink-0 [scrollbar-width:none] items-stretch overflow-x-auto border-b text-xs">
            {tabs.map((path) => {
              const isActive = path === active;
              const dirty = path === PAGE_PATH && !typingDone;
              const isPinned = pinned.includes(path);
              return (
                <div
                  key={path}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setTabMenu({
                      x: e.clientX,
                      y: e.clientY,
                      path,
                      source: "tab",
                    });
                  }}
                  onAuxClick={(e) =>
                    e.button === 1 && !isPinned && closeTab(path)
                  }
                  className={cn(
                    "group/tab border-border flex shrink-0 items-center border-r",
                    isActive
                      ? "bg-surface text-foreground shadow-[inset_0_2px_0_var(--accent)]"
                      : "text-faint hover:text-muted",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openFile(path)}
                    className="flex h-full items-center gap-1.5 pl-3"
                  >
                    <FileIcon path={path} />
                    {nameOf(path)}
                  </button>
                  {isPinned ? (
                    <button
                      type="button"
                      aria-label={te("unpin")}
                      title={te("unpin")}
                      onClick={() => togglePin(path)}
                      className="hover:bg-foreground/10 mx-1.5 grid h-5 w-5 place-items-center rounded text-[10px]"
                    >
                      📌
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={te("closeTab", { name: nameOf(path) })}
                      onClick={() => closeTab(path)}
                      className="hover:bg-foreground/10 mx-1.5 grid h-5 w-5 place-items-center rounded"
                    >
                      {dirty ? (
                        <span className="bg-muted h-2 w-2 rounded-full group-hover/tab:hidden" />
                      ) : null}
                      <Close
                        className={cn(
                          "h-3 w-3",
                          dirty || !isActive
                            ? "hidden group-hover/tab:block"
                            : "",
                        )}
                      />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {active ? (
            <>
              <div className="text-faint flex h-7 shrink-0 items-center gap-1 truncate px-3 text-[11px]">
                <button
                  type="button"
                  onClick={toggleSidebar}
                  aria-label={te("explorer")}
                  className="hover:text-foreground mr-1 sm:hidden"
                >
                  <Files className="h-4 w-4" />
                </button>
                {active.split("/").map((seg, i, all) => (
                  <span key={seg + i} className="flex items-center gap-1">
                    {i > 0 && <span className="opacity-60">›</span>}
                    <span className={i === all.length - 1 ? "text-muted" : ""}>
                      {seg}
                    </span>
                  </span>
                ))}
              </div>

              <div className="flex min-h-0 flex-1">
                <div
                  ref={codeRef}
                  style={{
                    fontSize: `${codeSize}px`,
                    lineHeight: `${Math.round(codeSize * 1.8)}px`,
                  }}
                  className="relative min-h-0 flex-1 overflow-auto pb-6 select-text"
                >
                  {lines.map((line, li) => {
                    const current = line.current;
                    return (
                      <div
                        key={li}
                        data-line={li}
                        onClick={() =>
                          !isPage && setCursor((c) => ({ ...c, [active]: li }))
                        }
                        className={cn(
                          "flex min-w-max",
                          current &&
                            "bg-foreground/[0.05] shadow-[inset_0_1px_0_var(--border),inset_0_-1px_0_var(--border)]",
                        )}
                      >
                        <span
                          className={cn(
                            "w-9 shrink-0 pr-3 text-right select-none sm:w-14 sm:pr-5",
                            current ? "text-foreground/80" : "text-faint/50",
                          )}
                        >
                          {li + 1}
                        </span>
                        <code className="pr-6 whitespace-pre">
                          {line.tokens.map(([type, text], ti) => (
                            <span key={ti} className={tokenColor[type]}>
                              {text}
                            </span>
                          ))}
                          {line.caret && <Caret />}
                        </code>
                      </div>
                    );
                  })}
                </div>

                <div
                  aria-hidden="true"
                  className={cn(
                    "hidden w-20 shrink-0 py-1 pr-3",
                    prefs.minimap && "xl:block",
                  )}
                >
                  {lines.map((line, li) => {
                    const len = line.tokens.reduce(
                      (n, [, text]) => n + text.length,
                      0,
                    );
                    const first = line.tokens.find(([type]) => type !== "i");
                    return (
                      <div
                        key={li}
                        className={cn(
                          "mb-px h-[3px] rounded-full bg-current opacity-40",
                          first ? tokenColor[first[0]] : "",
                        )}
                        style={{ width: `${Math.min(100, len * 1.6)}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-faint flex min-h-0 flex-1 flex-col items-center justify-center gap-6 text-xs">
              <p className="font-display text-foreground/15 text-4xl font-bold tracking-tight sm:text-6xl">
                {site.domain}
              </p>
              <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-2">
                <dt>{te("showCommands")}</dt>
                <dd className="text-muted">⇧ ⌘ P</dd>
                <dt>{te("goToFile")}</dt>
                <dd className="text-muted">⌘ P</dd>
                <dt>{te("toggleTerminal")}</dt>
                <dd className="text-muted">⌃ `</dd>
              </dl>
            </div>
          )}

          <AnimatePresence>
            {terminalOpen && (
              <m.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="border-border shrink-0 overflow-hidden border-t"
              >
                <div
                  role="tablist"
                  className="text-faint flex items-center gap-4 px-4 pt-2 text-[10px] tracking-[0.15em] uppercase"
                >
                  {(["problems", "output", "terminal"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={bottomTab === tab}
                      onClick={() => setBottomTab(tab)}
                      className={cn(
                        "border-b pb-1 uppercase transition-colors",
                        bottomTab === tab
                          ? "text-foreground border-accent"
                          : "hover:text-muted border-transparent",
                      )}
                    >
                      {te(tab)}
                      {tab === "problems" && hasError && (
                        <span className="ml-1.5 rounded-full bg-(--syn-error) px-1.5 text-[9px] text-white">
                          1
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-label={te("closeTerminal")}
                    onClick={() => {
                      setTerminalHidden(true);
                      setPanelPinnedOpen(false);
                    }}
                    className="hover:text-foreground ml-auto pb-1"
                  >
                    <Close className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div
                  role="tabpanel"
                  className="text-muted h-[5.5rem] overflow-y-auto px-4 py-2 text-[10.5px] leading-5 sm:h-[7.5rem] sm:text-xs"
                >
                  {bottomTab === "terminal" &&
                    (terminalLines.length ? (
                      terminalLines.map((line, i) => (
                        <div
                          key={`${running ? "ok" : "err"}-${i}`}
                          className="whitespace-pre"
                        >
                          {line}
                        </div>
                      ))
                    ) : (
                      <p className="text-faint">{te("terminalIdle")}</p>
                    ))}
                  {bottomTab === "problems" &&
                    (hasError && compileError ? (
                      <button
                        type="button"
                        onClick={() => openAt(PAGE_PATH, compileError.line - 1)}
                        className="hover:bg-foreground/5 -mx-2 flex w-[calc(100%+1rem)] items-start gap-2 rounded px-2 py-0.5 text-left"
                      >
                        <span className="text-(--syn-error)">⊗</span>
                        <span className="min-w-0 flex-1">
                          <span className="text-foreground">
                            SyntaxError: Unexpected end of input.
                          </span>{" "}
                          <span className="text-faint">
                            ts(1005) · page.tsx [Ln {compileError.line}, Col{" "}
                            {compileError.col}]
                          </span>
                        </span>
                      </button>
                    ) : (
                      <p className="text-faint">{te("noProblemsLong")}</p>
                    ))}
                  {bottomTab === "output" &&
                    (log.length ? (
                      log.map((entry) => (
                        <div
                          key={entry.id}
                          className="break-words whitespace-pre-wrap"
                        >
                          <span className="text-faint">{entry.time}</span>{" "}
                          <span
                            className={cn(
                              entry.level === "error" && "text-(--syn-error)",
                              entry.level === "warn" && "text-(--syn-tag)",
                              entry.level === "info" && "text-(--syn-fn)",
                            )}
                          >
                            [{entry.level}]
                          </span>{" "}
                          {entry.text}
                        </div>
                      ))
                    ) : (
                      <p className="text-faint">{te("outputEmpty")}</p>
                    ))}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-accent text-on-accent flex h-6 shrink-0 items-center justify-between px-3 font-mono text-[10.5px]">
        <span className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => showPanel("git")}
            className="flex items-center gap-1"
          >
            <GitBranch className="h-3 w-3" /> main
            {git.ahead > 0 && <span>↑{git.ahead}</span>}
          </button>
          {git.ahead > 0 && (
            <button
              type="button"
              onClick={() => {
                addLog("info", `Pushed ${git.ahead} commit(s) to origin/main`);
                setGit({ ...git, ahead: 0 });
              }}
              className="hidden sm:inline"
            >
              ⟳ {te("push")}
            </button>
          )}
          <button
            type="button"
            onClick={() => openBottom("problems")}
            className={hasError ? "" : "hidden sm:inline"}
          >
            {hasError ? `✗ ${te("oneProblem")}` : `✓ ${te("noProblems")}`}
          </button>
          {paused && !typingDone && <span>⏸ {t("pause")}</span>}
        </span>
        <span className="flex items-center gap-3">
          {active && (
            <span>
              Ln {activeLine + 1}
              {isPage ? `, Col ${caretCol + 1}` : ""}
            </span>
          )}
          <span className="hidden sm:inline">{te("spaces", { n: 2 })}</span>
          <span className="hidden sm:inline">UTF-8</span>
          {active && <span>{languageOf(active)}</span>}
        </span>
      </div>
      {tabMenu &&
        createPortal(
          <ContextMenu
            x={tabMenu.x}
            y={tabMenu.y}
            entries={tabMenuEntries(tabMenu.path, tabMenu.source)}
            onClose={() => setTabMenu(null)}
          />,
          document.body,
        )}
    </Window>
  );
}
