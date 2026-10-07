"use client";

import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
import { m, type Variants } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronLeft, ChevronRight, Lock, Reload } from "@/components/ui/icons";
import { site } from "@/config/site";
import { openRepo, repoUrl, socialLinks } from "@/lib/socials";
import { localeStorageKey, locales, type Locale } from "@/i18n/config";
import type { OsActions, SectionId } from "./actions";
import { AboutApp } from "./apps/About";
import { ScriptRunner, type ScriptKind } from "./apps/ScriptRunner";
import { CrashScreen, type CrashStrings } from "./CrashScreen";
import {
  containers,
  dockerStore,
  startDocker,
  stopDocker,
  toggleContainer,
} from "./docker";
import { SearchPage, searchUrl } from "./apps/SearchPage";
import { TerminalApp } from "./apps/Terminal";
import { ScrollContainerContext, SiteLaunchContext } from "./context";
import { DesktopIcons, type DesktopIcon } from "./DesktopIcons";
import {
  BrowserTile,
  DocTile,
  DockerTile,
  ScriptTile,
  Dock,
  EditorTile,
  GithubTile,
  SystemTile,
  TerminalTile,
} from "./Dock";
import { Editor, type EditorNav } from "./editor/Editor";
import { PAGE_PATH, README_PATH, allFiles, nameOf } from "./editor/files";
import {
  isBotAgent,
  useCompact,
  useHydrated,
  useIsBot,
  usePrefersReducedMotion,
} from "./hooks";
import { PhoneHome } from "./PhoneHome";
import { PhoneStatusBar } from "./PhoneStatusBar";
import { ContextMenu, heading, item, sep, type MenuEntry } from "./Menu";
import { MenuBar, type MenuBarMenu } from "./MenuBar";
import { Notifications, type OsNotification } from "./Notifications";
import { PowerOverlay, type PowerState } from "./Power";
import { MusicApp, MusicTile, MusicWidget } from "./apps/Music";
import { music } from "./apps/music-engine";
import { NetworkError } from "./apps/NetworkError";
import {
  SettingsApp,
  SettingsTile,
  type Pane as SettingsPane,
} from "./apps/Settings";
import {
  desktopPrefs,
  introStore,
  persistentStore,
  resetPersistentState,
  scrollStore,
  starPromptStore,
  usePersistent,
  wifiStore,
} from "./session";
import { Spotlight, type SpotlightItem } from "./Spotlight";
import { TodoWidget } from "./TodoWidget";
import {
  iconPositions,
  todoStore,
  viewStore,
  wallpaperStore,
  wallpapers,
  type Wallpaper,
} from "./store";
import {
  Window,
  type WindowControls,
  type WindowId,
  type WindowMode,
  type WindowVisibility,
} from "./Window";

let noteCounter = 0;
const nextNoteId = () => ++noteCounter;

type WindowState = { vis: WindowVisibility; mode: WindowMode };

const DEFAULT_WINS: Record<WindowId, WindowState> = {
  editor: { vis: "open", mode: "normal" },
  browser: { vis: "open", mode: "normal" },
  terminal: { vis: "closed", mode: "normal" },
  about: { vis: "closed", mode: "normal" },
  script: { vis: "closed", mode: "normal" },
  settings: { vis: "closed", mode: "normal" },
  music: { vis: "closed", mode: "normal" },
};
const DEFAULT_ORDER: WindowId[] = [
  "script",
  "music",
  "settings",
  "terminal",
  "about",
  "browser",
  "editor",
];
const REMINDERS_AREA = { right: 320, bottom: 460 };

const DEFAULT_NAV = { open: [PAGE_PATH], active: PAGE_PATH };

const windowIds = Object.keys(DEFAULT_WINS) as WindowId[];

type BrowserPage = "site" | "search";

const screen: Variants = {
  on: {
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    filter: "none",
    transition: { duration: 0.3 },
  },
  shutting: {
    scaleY: [1, 0.004, 0.004],
    scaleX: [1, 1, 0],
    filter: ["brightness(1)", "brightness(4)", "brightness(8)"],
    transition: { duration: 0.6, times: [0, 0.55, 1], ease: "easeIn" },
  },
  restarting: { opacity: 0, transition: { duration: 0.7 } },
  off: { opacity: 0, transition: { duration: 0 } },
  locked: { opacity: 0, transition: { duration: 0, delay: 0.7 } },
};

const screenVariant = (power: PowerState) =>
  power === "shutting" || power === "restarting"
    ? power
    : power === "off" || power === "booting"
      ? "off"
      : power === "locked"
        ? "locked"
        : "on";

export function Desktop({ children }: Readonly<{ children: ReactNode }>) {
  const t = useTranslations("desktop");
  const tm = useTranslations("desktop.menu");
  const tNav = useTranslations("nav");
  const tEditor = useTranslations("hero.editor");
  const tRoot = useTranslations();
  const tView = useTranslations("view");
  const tc = (key: string) => t(`ctx.${key}`);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const isDark = !hydrated || resolvedTheme !== "light";
  const reduceMotion = usePrefersReducedMotion();
  const isBot = useIsBot();
  const wallpaper = wallpaperStore.useValue();

  const played = introStore.useValue();
  const [replaying, setReplaying] = useState(false);
  const [introKey, setIntroKey] = useState(0);
  const [storedWins, setWins] = usePersistent("wins", DEFAULT_WINS);
  const [storedOrder, setOrder] = usePersistent("order", DEFAULT_ORDER);
  const [launch, setLaunch] = useState(0);
  const [nav, setNav] = usePersistent<EditorNav>("editorNav", DEFAULT_NAV);
  const [browserPage, setBrowserPage] = usePersistent<BrowserPage>(
    "browserPage",
    "site",
  );
  const [query, setQuery] = usePersistent("query", site.domain as string);
  const [scriptRun, setScriptRun] = useState(0);
  const [scriptKind, setScriptKind] = useState<ScriptKind>("info");
  const [crashed, setCrashed] = useState(false);
  const [terminalCommand, setTerminalCommand] = useState<{
    cmd: string;
    n: number;
  } | null>(null);
  const [settingsPane, setSettingsPane] = useState<SettingsPane>("general");
  const [selected, setSelected] = useState<string[]>([]);
  const [menu, setMenu] = useState<{
    x: number;
    y: number;
    iconId: string | null;
  } | null>(null);
  const [osMenu, setOsMenu] = useState<{
    x: number;
    y: number;
    entries: MenuEntry[];
  } | null>(null);
  const [spotlight, setSpotlight] = useState(false);
  const [notes, setNotes] = useState<OsNotification[]>([]);
  const [power, setPower] = useState<PowerState>("on");
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const wifi = wifiStore.useValue();
  const compact = useCompact();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!introStore.read() && !reduce && !isBotAgent())
      persistentStore("wins", DEFAULT_WINS).write({
        ...persistentStore("wins", DEFAULT_WINS).read(),
        browser: { vis: "closed", mode: "normal" },
      });
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setReady(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);
  const prefs = desktopPrefs.useValue();
  const showMusic = prefs.showMusic !== false;

  const wins: Record<WindowId, WindowState> = {
    ...DEFAULT_WINS,
    ...storedWins,
  };
  if (!scriptRun) wins.script = { vis: "closed", mode: "normal" };
  const order = [
    ...DEFAULT_ORDER.filter((id) => !storedOrder.includes(id)),
    ...storedOrder.filter((id) => windowIds.includes(id)),
  ];

  const instantIntro = (played && !replaying) || reduceMotion || isBot;

  useEffect(() => {
    if (!scrollEl) return;
    scrollEl.scrollTo({ top: scrollStore.read(), behavior: "instant" });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => scrollStore.write(scrollEl.scrollTop), 200);
    };
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      scrollEl.removeEventListener("scroll", onScroll);
    };
  }, [scrollEl]);

  const dismiss = (id: number) => setNotes((n) => n.filter((x) => x.id !== id));
  const notify = (
    title: string,
    body: string | undefined,
    icon: ReactNode,
    onClick?: () => void,
  ) => {
    const id = nextNoteId();
    setNotes((n) => [...n.slice(-2), { id, title, body, icon, onClick }]);
    setTimeout(() => dismiss(id), onClick ? 10000 : compact ? 3000 : 5000);
  };

  const promptStar = useEffectEvent(() => {
    if (!repoUrl || starPromptStore.read()) return;
    starPromptStore.write(true);
    notify(
      t("notify.star", { os: site.os.name }),
      t("notify.starBody"),
      <GithubTile />,
      () => openRepo(),
    );
  });
  useEffect(() => {
    if (power !== "on" || isBot) return;
    const id = setTimeout(promptStar, 60_000);
    return () => clearTimeout(id);
  }, [power, isBot]);

  const focus = (id: WindowId) =>
    setOrder((o) => [...o.filter((w) => w !== id), id]);
  const patch = (id: WindowId, next: Partial<WindowState>) =>
    setWins((w) => ({
      ...w,
      [id]: { ...DEFAULT_WINS[id], ...w[id], ...next },
    }));
  const openWindow = (id: WindowId) => {
    patch(id, { vis: "open" });
    focus(id);
  };

  const topWindow =
    [...order].reverse().find((id) => wins[id].vis === "open") ?? null;

  const launchSite = (auto: boolean) => {
    if (auto && introStore.read() && !replaying) return;
    const first = !introStore.read();
    introStore.write(true);
    setReplaying(false);
    setBrowserPage("site");
    setLaunch((k) => k + 1);
    openWindow("browser");
    if (first && !instantIntro)
      notify(
        t("notify.ready", { domain: site.domain }),
        t("notify.readyBody"),
        <BrowserTile />,
      );
  };

  const replayIntro = () => {
    setReplaying(true);
    setIntroKey((k) => k + 1);
    openWindow("editor");
    setNav((n) => ({
      open: n.open.includes(PAGE_PATH) ? n.open : [PAGE_PATH, ...n.open],
      active: PAGE_PATH,
    }));
  };

  const openFile = (path: string) => {
    setNav((n) => ({
      open: n.open.includes(path) ? n.open : [...n.open, path],
      active: path,
    }));
    openWindow("editor");
  };

  const goTo = (section: SectionId) => {
    openWindow("browser");
    setBrowserPage("site");
    requestAnimationFrame(() => {
      const el = scrollEl;
      if (!el) return;
      const target =
        section === "top" ? null : el.querySelector<HTMLElement>(`#${section}`);
      const top = target
        ? target.getBoundingClientRect().top -
          el.getBoundingClientRect().top +
          el.scrollTop
        : 0;
      el.scrollTo({ top, behavior: "smooth" });
    });
  };

  const switchLocale = (code: Locale) => {
    if (code === locale) return;
    const segments = pathname.split("/");
    segments[1] = code;
    try {
      localStorage.setItem(localeStorageKey, code);
    } catch {
      // Storage blocked: the URL still carries the locale.
    }
    router.push(segments.join("/") || `/${code}`);
  };

  const setWallpaper = (w: Wallpaper) => wallpaperStore.write(w);

  const actions: OsActions = {
    open: openWindow,
    close: (id) => patch(id, { vis: "closed", mode: "normal" }),
    openFile,
    goTo,
    setTheme,
    toggleTheme: () => setTheme(isDark ? "light" : "dark"),
    setWallpaper,
    nextWallpaper: () =>
      setWallpaper(
        wallpapers[(wallpapers.indexOf(wallpaper) + 1) % wallpapers.length],
      ),
    copyEmail: () => {
      navigator.clipboard?.writeText(site.email).catch(() => {});
      notify(t("notify.copied"), site.email, <SystemTile />);
    },
    replayIntro,
    spotlight: () => setSpotlight(true),
    lock: () => powerTo("locked"),
    sleep: () => powerTo("sleep"),
    restart: () => powerTo("restarting"),
    shutDown: () => powerTo("shutting"),
    setLocale: switchLocale,
    resetAll: () => {
      music.stop();
      resetPersistentState();
      window.location.reload();
    },
  };

  const powerTo = (next: PowerState) => {
    if (next !== "on" && next !== "locked") music.pause();
    setPower(next);
  };

  const quitMusic = () => {
    music.stop();
    actions.close("music");
  };

  const runScript = (kind: ScriptKind = "info") => {
    setScriptKind(kind);
    setScriptRun((n) => n + 1);
    patch("script", { vis: "open", mode: "normal" });
    focus("script");
  };
  const closeScript = () => {
    patch("script", { vis: "closed", mode: "normal" });
    setTimeout(() => setScriptRun(0), 300);
  };

  const fullIdx = order.findIndex(
    (id) => wins[id].vis === "open" && wins[id].mode === "full",
  );

  const controls = (id: WindowId): WindowControls => ({
    vis: wins[id].vis,
    mode: wins[id].mode,
    focused: topWindow === id,
    zIndex:
      20 +
      order.indexOf(id) +
      (fullIdx !== -1 && order.indexOf(id) >= fullIdx ? 50 : 0),
    onFocus: () => {
      if (topWindow !== id) focus(id);
    },
    onClose: () =>
      id === "script"
        ? closeScript()
        : id === "music"
          ? quitMusic()
          : actions.close(id),
    onMinimize: () =>
      patch(id, {
        vis: "min",
        mode: wins[id].mode === "full" ? "normal" : wins[id].mode,
      }),
    onToggleFull: () =>
      patch(id, { mode: wins[id].mode === "full" ? "normal" : "full" }),
    onToggleMax: () =>
      patch(id, { mode: wins[id].mode === "max" ? "normal" : "max" }),
  });

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.code === "KeyK") {
      e.preventDefault();
      setSpotlight((v) => !v);
      return;
    }
    if (e.key === "Escape") {
      setSpotlight(false);
      setWins((w) => {
        const next = { ...DEFAULT_WINS, ...w };
        for (const id of windowIds)
          if (next[id].mode === "full")
            next[id] = { ...next[id], mode: "normal" };
        return next;
      });
      return;
    }
    if (power !== "on") return;
    const top = topWindow;
    const alt = e.altKey && !mod;
    const run = (fn: () => void) => {
      e.preventDefault();
      fn();
    };
    if (alt && e.code === "KeyT") return run(() => openWindow("terminal"));
    if (alt && e.code === "Comma") return run(() => openWindow("settings"));
    if (!top) return;
    const c = controls(top);
    const tab = nav.active;
    const closesTab =
      top === "editor" && tab && !(nav.pinned ?? []).includes(tab);
    if (alt && e.code === "KeyW" && closesTab)
      return run(() =>
        setNav((n) => {
          const idx = n.open.indexOf(tab);
          const open = n.open.filter((p) => p !== tab);
          return {
            ...n,
            open,
            active: open[Math.min(idx, open.length - 1)] ?? null,
          };
        }),
      );
    if (alt && (e.code === "KeyW" || e.code === "KeyQ")) return run(c.onClose);
    if (alt && e.code === "KeyM") return run(c.onMinimize);
    if (alt && e.code === "KeyF") return run(c.onToggleFull);
    if (mod && !e.shiftKey && (e.code === "KeyW" || e.code === "KeyQ"))
      return run(c.onClose);
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const scriptFile = t("scriptFile");
  const deployFile = t("deploy.file");
  const openSettings = (pane: SettingsPane) => {
    setSettingsPane(pane);
    openWindow("settings");
  };
  const labels: Record<WindowId, string> = {
    editor: t("editor"),
    browser: site.domain,
    terminal: t("terminal"),
    about: tm("aboutOs", { os: site.os.name }),
    script: scriptFile,
    settings: t("settings.title"),
    music: t("music.title"),
  };
  const tiles: Record<WindowId, ReactNode> = {
    editor: <EditorTile />,
    browser: <BrowserTile />,
    terminal: <TerminalTile />,
    about: <SystemTile />,
    script: <TerminalTile />,
    settings: <SettingsTile />,
    music: <MusicTile />,
  };
  const appNames: Record<WindowId, string> = {
    editor: "Code",
    browser: t("browser"),
    terminal: t("terminal"),
    about: site.os.name,
    script: t("terminal"),
    settings: t("settings.title"),
    music: t("music.title"),
  };
  const appName = topWindow ? appNames[topWindow] : "Finder";

  const desktopIcons: DesktopIcon[] = [
    {
      id: "editor",
      label: t("editor"),
      tile: <EditorTile />,
      open: () => openWindow("editor"),
    },
    {
      id: "browser",
      label: site.domain,
      tile: <BrowserTile />,
      open: () => goTo("top"),
    },
    {
      id: "readme",
      label: "README.md",
      tile: <DocTile />,
      open: () => openFile(README_PATH),
    },
    {
      id: "terminal",
      label: t("terminal"),
      tile: <TerminalTile />,
      open: () => openWindow("terminal"),
    },
    {
      id: "script",
      label: scriptFile,
      tile: <ScriptTile />,
      open: () => runScript("info"),
    },
    {
      id: "deploy",
      label: deployFile,
      tile: <ScriptTile />,
      open: () => runScript("deploy"),
    },
  ];

  const sections: Array<[SectionId, string]> = [
    ["top", tm("home")],
    ["about", tNav("about")],
    ["experience", tNav("experience")],
    ["skills", tNav("skills")],
    ["education", tNav("education")],
    ["contact", tNav("contact")],
  ];

  const wallpaperEntries = wallpapers.map((w) =>
    item(t(`wallpapers.${w}`), () => setWallpaper(w), {
      checked: wallpaper === w,
    }),
  );
  const top = topWindow;

  const docker = dockerStore.useValue();
  const dockerMenu: MenuEntry[] = [
    heading(t(`settings.docker.${docker.status}`)),
    item(tc("dockerDashboard"), () => {
      openWindow("terminal");
      setTerminalCommand((c) => ({ cmd: "docker ps", n: (c?.n ?? 0) + 1 }));
    }),
    sep,
    heading(tc("dockerContainers")),
    ...containers.map((c) =>
      item(c.name, () => toggleContainer(c.name), {
        checked: !docker.stopped.includes(c.name),
        disabled: docker.status !== "running",
      }),
    ),
    sep,
    item(tc("dockerSettings"), () => openSettings("docker")),
    item(
      tc("dockerRestart"),
      () =>
        startDocker(() =>
          notify(tc("dockerReady"), tc("dockerReadyBody"), <DockerTile />),
        ),
      { disabled: docker.status === "starting" },
    ),
    docker.status === "stopped"
      ? item(tc("dockerStart"), () =>
          startDocker(() =>
            notify(tc("dockerReady"), tc("dockerReadyBody"), <DockerTile />),
          ),
        )
      : item(tc("dockerQuit"), stopDocker, {
          disabled: docker.status === "starting",
        }),
  ];

  const repoEntries: MenuEntry[] = repoUrl
    ? [
        item(tm("starRepo"), () => openRepo()),
        item(tm("useTemplate"), () => openRepo("/generate")),
      ]
    : [];

  const logoMenu: MenuEntry[] = [
    item(tm("aboutOs", { os: site.os.name }), () => openWindow("about")),
    ...repoEntries.slice(0, 1),
    sep,
    item(t("settings.title") + "…", () => openWindow("settings"), {
      shortcut: "⌥,",
    }),
    sep,
    item(tm("darkMode"), actions.toggleTheme, { checked: isDark }),
    item(tm("replay"), replayIntro),
    item(tView("text"), () => viewStore.write("text")),
    sep,
    item(tm("sleep"), actions.sleep),
    item(tm("restart"), actions.restart),
    item(tm("shutDown"), actions.shutDown),
    sep,
    item(tm("lock"), actions.lock),
  ];

  const menus: MenuBarMenu[] = [
    {
      id: "app",
      label: appName,
      entries: [
        item(tm("aboutApp", { app: appName }), () => openWindow("about")),
        sep,
        item(t("settings.title") + "…", () => openWindow("settings"), {
          shortcut: "⌥,",
        }),
        sep,
        item(
          tm("hide", { app: appName }),
          () => top && controls(top).onMinimize(),
          {
            disabled: !top,
            shortcut: "⌥M",
          },
        ),
        item(
          tm("quit", { app: appName }),
          () => top && controls(top).onClose(),
          {
            disabled: !top,
            shortcut: "⌥Q",
          },
        ),
      ],
    },
    {
      id: "file",
      label: tm("file"),
      desktopOnly: true,
      entries: [
        item(tm("newTerminal"), () => openWindow("terminal"), {
          shortcut: "⌥T",
        }),
        item(tm("openSite", { domain: site.domain }), () => goTo("top")),
        item(tm("openEditor"), () => openWindow("editor")),
        item(t("music.title"), () => openWindow("music")),
        item(tm("openReadme"), () => openFile(README_PATH)),
        sep,
        item(tm("closeWindow"), () => top && controls(top).onClose(), {
          disabled: !top,
          shortcut: "⌥W",
        }),
      ],
    },
    {
      id: "edit",
      label: tm("edit"),
      desktopOnly: true,
      entries: [
        item(tm("selectAll"), () => setSelected(desktopIcons.map((i) => i.id))),
        item(tm("copyEmail"), actions.copyEmail),
      ],
    },
    {
      id: "view",
      label: tm("view"),
      desktopOnly: true,
      entries: [
        item(tm("darkMode"), actions.toggleTheme, { checked: isDark }),
        item(tm("enterFull"), () => top && controls(top).onToggleFull(), {
          disabled: !top,
          shortcut: "⌥F",
        }),
        sep,
        heading(tm("wallpaper")),
        ...wallpaperEntries,
        sep,
        item(tm("cleanUp"), () => iconPositions.write({})),
        sep,
        heading(tm("language")),
        ...locales.map((code) =>
          item(code === "tr" ? "Türkçe" : "English", () => switchLocale(code), {
            checked: locale === code,
          }),
        ),
      ],
    },
    {
      id: "go",
      label: tm("go"),
      entries: [
        ...sections.map(([id, label]) => item(label, () => goTo(id))),
        sep,
        item(tm("spotlight"), () => setSpotlight(true), { shortcut: "⌘K" }),
      ],
    },
    {
      id: "window",
      label: tm("window"),
      desktopOnly: true,
      entries: [
        item(tm("minimize"), () => top && controls(top).onMinimize(), {
          disabled: !top,
          shortcut: "⌥M",
        }),
        item(tm("zoom"), () => top && controls(top).onToggleMax(), {
          disabled: !top,
        }),
        sep,
        ...windowIds
          .filter((id) => id !== "script" || scriptRun > 0)
          .map((id) =>
            item(labels[id], () => openWindow(id), { checked: top === id }),
          ),
      ],
    },
    {
      id: "help",
      label: tm("help"),
      desktopOnly: true,
      entries: [
        item(tm("osHelp", { os: site.os.name }), () => openFile(README_PATH)),
        item(tm("terminalHelp"), () => openWindow("terminal")),
        ...(repoUrl
          ? [sep, item(tm("viewSource"), () => openRepo()), ...repoEntries]
          : []),
        sep,
        item(tm("contactMe", { name: site.firstName }), () => goTo("contact")),
        ...socialLinks
          .slice(0, 2)
          .map(({ label, href }) =>
            item(label, () => window.open(href, "_blank", "noopener")),
          ),
      ],
    },
  ];

  const windowEntries = (id: WindowId): MenuEntry[] => {
    const c = controls(id);
    return [
      item(tm("minimize"), c.onMinimize, { shortcut: "⌥M" }),
      item(tm("zoom"), c.onToggleMax),
      item(
        c.mode === "full" ? tc("exitFull") : tm("enterFull"),
        c.onToggleFull,
        {
          shortcut: "⌥F",
        },
      ),
      sep,
      item(tc("close"), c.onClose, { shortcut: "⌥W" }),
    ];
  };

  const osContextEntries = (el: HTMLElement): MenuEntry[] => {
    const context = el.closest<HTMLElement>("[data-context]")?.dataset.context;
    if (context?.startsWith("dock:")) {
      const id = context.slice(5) as WindowId;
      const running = wins[id].vis !== "closed";
      const c = controls(id);
      return [
        heading(labels[id]),
        item(running ? tc("show") : tc("open"), () =>
          id === "browser" ? goTo("top") : openWindow(id),
        ),
        ...(running
          ? [
              item(tc("hide"), c.onMinimize, {
                disabled: wins[id].vis !== "open",
              }),
              sep,
              item(tc("quit"), c.onClose),
            ]
          : []),
      ];
    }
    if (context?.startsWith("link:")) {
      const href = context.slice(5);
      return [
        item(tc("open"), () => window.open(href, "_blank", "noopener")),
        item(tc("copyLink"), () =>
          navigator.clipboard
            ?.writeText(href.replace(/^mailto:/, ""))
            .catch(() => {}),
        ),
      ];
    }
    if (context === "dock")
      return [
        item(
          tc("magnify"),
          () =>
            desktopPrefs.write({ ...prefs, dockMagnify: !prefs.dockMagnify }),
          { checked: prefs.dockMagnify },
        ),
        item(tc("dockSettings"), () => openSettings("desktop")),
      ];
    if (context === "widget:reminders")
      return [
        item(tc("clearCompleted"), () =>
          todoStore.write(todoStore.read().filter((x) => !x.done)),
        ),
        sep,
        item(tc("editWidgets"), () => openSettings("desktop")),
        item(tc("hideWidget"), () =>
          desktopPrefs.write({ ...prefs, showReminders: false }),
        ),
      ];
    if (context === "widget:music") {
      const playing = music.getState().playing;
      return [
        item(playing ? tc("pause") : tc("play"), () => music.toggle()),
        item(tc("nextTrack"), () => music.next()),
        sep,
        item(tc("openMusic"), () => openWindow("music")),
        item(tc("hideWidget"), () =>
          desktopPrefs.write({ ...prefs, showMusic: false }),
        ),
      ];
    }

    const winId = el.closest<HTMLElement>("[data-window]")?.dataset.window as
      | WindowId
      | undefined;
    if (!winId) return [];
    const selection = window.getSelection()?.toString() ?? "";
    const link = el.closest("a")?.href;
    const extra: MenuEntry[] = [];
    if (selection)
      extra.push(
        item(
          tc("copy"),
          () => navigator.clipboard?.writeText(selection).catch(() => {}),
          {
            shortcut: "⌘C",
          },
        ),
      );
    if (link)
      extra.push(
        item(tc("openLink"), () => window.open(link, "_blank", "noopener")),
        item(tc("copyLink"), () =>
          navigator.clipboard?.writeText(link).catch(() => {}),
        ),
      );
    if (winId === "browser")
      extra.push(
        ...(extra.length ? [sep] : []),
        item(tc("back"), () => setBrowserPage("search"), {
          disabled: browserPage === "search",
        }),
        item(tc("forward"), () => setBrowserPage("site"), {
          disabled: browserPage === "site",
        }),
        item(tc("reload"), () => goTo("top")),
        sep,
        item(tc("viewSource"), () => openFile(PAGE_PATH)),
        ...(repoUrl ? [item(tm("viewSource"), () => openRepo())] : []),
      );
    return [...extra, ...(extra.length ? [sep] : []), ...windowEntries(winId)];
  };

  const onOsContextMenu = (e: React.MouseEvent) => {
    if (e.defaultPrevented) return;
    const el = e.target as HTMLElement;
    if (el.closest("input, textarea, select, [contenteditable]")) return;
    e.preventDefault();
    const entries = osContextEntries(el);
    if (entries.length) setOsMenu({ x: e.clientX, y: e.clientY, entries });
  };

  const contextEntries = (iconId: string | null): MenuEntry[] =>
    iconId
      ? [
          item(tm("open"), () =>
            desktopIcons
              .filter((i) => selected.includes(i.id) || i.id === iconId)
              .forEach((i) => i.open()),
          ),
          ...(compact
            ? []
            : [sep, item(tm("cleanUp"), () => iconPositions.write({}))]),
        ]
      : [
          item(tm("newTerminal"), () => openWindow("terminal")),
          item(tm("openSite", { domain: site.domain }), () => goTo("top")),
          item(tm("openEditor"), () => openWindow("editor")),
          sep,
          heading(tm("wallpaper")),
          ...wallpaperEntries,
          ...(compact
            ? []
            : [
                sep,
                item(tm("cleanUp"), () => iconPositions.write({})),
                item(tm("selectAll"), () =>
                  setSelected(desktopIcons.map((i) => i.id)),
                ),
              ]),
          sep,
          item(tm("darkMode"), actions.toggleTheme, { checked: isDark }),
          item(tm("copyEmail"), actions.copyEmail),
          sep,
          item(tm("aboutOs", { os: site.os.name }), () => openWindow("about")),
          ...repoEntries.slice(0, 1),
          item(tm("lock"), actions.lock),
        ];

  const spotlightItems: SpotlightItem[] = [
    ...windowIds.map((id) => ({
      id: `app-${id}`,
      group: t("spotlight.apps"),
      label: labels[id],
      keywords: appNames[id],
      icon: tiles[id],
      run: () =>
        id === "browser"
          ? goTo("top")
          : id === "script"
            ? runScript()
            : openWindow(id),
    })),
    ...sections.map(([id, label]) => ({
      id: `section-${id}`,
      group: t("spotlight.sections"),
      label,
      keywords: id,
      icon: <BrowserTile />,
      run: () => goTo(id),
    })),
    ...allFiles.map((path) => ({
      id: `file-${path}`,
      group: t("spotlight.files"),
      label: nameOf(path),
      keywords: path,
      icon: path.endsWith(".md") ? <DocTile /> : <EditorTile />,
      run: () => openFile(path),
    })),
    ...[
      [tm("darkMode"), actions.toggleTheme],
      [tm("nextWallpaper"), actions.nextWallpaper],
      [tm("copyEmail"), actions.copyEmail],
      [tm("replay"), replayIntro],
      [tm("lock"), actions.lock],
      [tm("restart"), actions.restart],
      [tm("shutDown"), actions.shutDown],
    ].map(([label, run], i) => ({
      id: `cmd-${i}`,
      group: t("spotlight.commands"),
      label: label as string,
      icon: <SystemTile />,
      run: run as () => void,
    })),
    ...(repoUrl
      ? [
          [tm("starRepo"), "star github repo source", () => openRepo()],
          [
            tm("useTemplate"),
            "template fork clone",
            () => openRepo("/generate"),
          ],
        ]
      : []
    ).map(([label, keywords, run]) => ({
      id: `repo-${keywords}`,
      group: t("spotlight.commands"),
      label: label as string,
      keywords: keywords as string,
      icon: <GithubTile />,
      run: run as () => void,
    })),
  ];

  const browserTitleBar = (
    <>
      <div className="text-faint flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => setBrowserPage("search")}
          disabled={browserPage === "search"}
          aria-label={t("back")}
          title={t("back")}
          className="hover:text-foreground grid h-7 w-6 place-items-center rounded disabled:opacity-35"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setBrowserPage("site")}
          disabled={browserPage === "site"}
          aria-label={t("forward")}
          title={t("forward")}
          className="hover:text-foreground grid h-7 w-6 place-items-center rounded disabled:opacity-35"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => goTo("top")}
        className="border-border bg-background/70 text-muted hover:text-accent mx-auto flex w-full max-w-md min-w-0 items-center justify-center gap-2 rounded-md border px-3 py-1 font-mono text-xs transition-colors"
      >
        <Lock className="h-3 w-3 shrink-0" />
        <span className="truncate">
          {browserPage === "search" ? searchUrl(query) : site.domain}
        </span>
      </button>
      <button
        type="button"
        onClick={replayIntro}
        aria-label={tEditor("replay")}
        title={tEditor("replay")}
        className="text-faint hover:text-accent grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors"
      >
        <Reload className="h-4 w-4" />
      </button>
      {launch > 0 && !reduceMotion && (
        <m.span
          key={launch}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{
            scaleX: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            opacity: { delay: 0.75, duration: 0.3 },
          }}
          className="bg-accent absolute inset-x-0 -bottom-px h-0.5 origin-left"
        />
      )}
    </>
  );

  return (
    <div
      style={{ opacity: ready ? 1 : 0 }}
      className="relative h-[100dvh] w-full overflow-clip bg-black transition-opacity duration-300 select-none"
      onContextMenu={onOsContextMenu}
    >
      <m.div
        data-wallpaper={wallpaper}
        className="wallpaper relative h-full w-full overflow-clip"
        initial={false}
        animate={screenVariant(power)}
        variants={screen}
        onAnimationComplete={(name) => {
          if (name === "shutting") setPower("off");
          if (name === "restarting") setPower("booting");
        }}
      >
        {compact ? (
          <PhoneStatusBar
            logoMenu={logoMenu}
            menus={[
              ...menus,
              { id: "docker", label: "Docker", entries: dockerMenu },
            ]}
            isDark={isDark}
            locale={locale}
            onToggleTheme={actions.toggleTheme}
            onToggleLocale={() => switchLocale(locale === "tr" ? "en" : "tr")}
            onSpotlight={() => setSpotlight(true)}
            onLock={actions.lock}
          />
        ) : (
          <MenuBar
            logoMenu={logoMenu}
            menus={menus}
            dockerMenu={dockerMenu}
            dockerStatus={docker.status}
            onMenuOpen={() => setNotes([])}
            isDark={isDark}
            locale={locale}
            onToggleTheme={actions.toggleTheme}
            onToggleLocale={() => switchLocale(locale === "tr" ? "en" : "tr")}
            onSpotlight={() => setSpotlight(true)}
            labels={{
              search: t("spotlight.placeholder"),
              theme: tm("darkMode"),
              logo: site.os.name,
              language: tm("language"),
            }}
          />
        )}

        {compact ? (
          <PhoneHome
            icons={desktopIcons}
            onContextMenu={(x, y, iconId) => setMenu({ x, y, iconId })}
          >
            {prefs.showReminders && (
              <TodoWidget compact className="min-h-0 w-full flex-1" />
            )}
            {showMusic && <MusicWidget className="w-full shrink-0" />}
          </PhoneHome>
        ) : (
          <>
            <DesktopIcons
              icons={desktopIcons}
              selected={selected}
              onSelect={setSelected}
              onContextMenu={(x, y, iconId) => setMenu({ x, y, iconId })}
              avoid={
                prefs.showReminders || showMusic
                  ? {
                      right: REMINDERS_AREA.right,
                      bottom:
                        (prefs.showReminders ? REMINDERS_AREA.bottom : 40) +
                        (showMusic ? 110 : 0),
                    }
                  : null
              }
            />
            <div className="absolute top-10 left-5 z-[5] flex w-[min(290px,calc(100%-120px))] flex-col gap-3">
              {prefs.showReminders && <TodoWidget className="w-full" />}
              {showMusic && <MusicWidget className="w-full" />}
            </div>
          </>
        )}

        <Editor
          key={introKey}
          controls={controls("editor")}
          nav={nav}
          setNav={setNav}
          instant={instantIntro}
          onLaunch={launchSite}
          actions={actions}
        />

        <Window
          id="browser"
          label={site.domain}
          controls={controls("browser")}
          titleBar={browserTitleBar}
          className="browser-window"
        >
          <ScrollContainerContext.Provider value={scrollEl}>
            <SiteLaunchContext.Provider value={launch}>
              <div className="relative flex min-h-0 flex-1 flex-col">
                <div
                  ref={setScrollEl}
                  className="bg-background [container-type:size] relative min-h-0 flex-1 overflow-x-clip overflow-y-auto overscroll-contain scroll-smooth select-text"
                >
                  {children}
                </div>
                {browserPage === "search" && (
                  <SearchPage
                    query={query}
                    onQuery={setQuery}
                    onOpenSite={goTo}
                  />
                )}
                {!wifi.on && (
                  <NetworkError
                    onTurnOn={() => wifiStore.write({ ...wifi, on: true })}
                  />
                )}
              </div>
            </SiteLaunchContext.Provider>
          </ScrollContainerContext.Provider>
        </Window>

        <TerminalApp
          controls={controls("terminal")}
          actions={actions}
          autorun={terminalCommand}
        />
        <AboutApp controls={controls("about")} actions={actions} />
        <SettingsApp
          controls={controls("settings")}
          actions={actions}
          pane={settingsPane}
          onPane={setSettingsPane}
        />
        <MusicApp controls={controls("music")} />
        {scriptRun > 0 && (
          <ScriptRunner
            key={scriptRun}
            controls={controls("script")}
            fileName={scriptKind === "deploy" ? deployFile : scriptFile}
            kind={scriptKind}
            onClose={closeScript}
            onCrash={() => {
              music.pause();
              setCrashed(true);
              closeScript();
            }}
          />
        )}

        <Dock
          apps={(
            ["editor", "browser", "terminal", "music", "settings"] as const
          ).map((id) => ({
            id,
            label: labels[id],
            tile: tiles[id],
            running: wins[id].vis !== "closed",
            onClick: () => openWindow(id),
          }))}
          minimized={windowIds
            .filter((id) => wins[id].vis === "min")
            .map((id) => ({
              id: `min-${id}`,
              label: labels[id],
              tile: tiles[id],
              running: false,
              onClick: () => openWindow(id),
            }))}
        />
      </m.div>

      <Notifications items={power === "on" ? notes : []} onDismiss={dismiss} />
      {osMenu && (
        <ContextMenu
          x={osMenu.x}
          y={osMenu.y}
          entries={osMenu.entries}
          onClose={() => setOsMenu(null)}
        />
      )}
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          entries={contextEntries(menu.iconId)}
          onClose={() => setMenu(null)}
        />
      )}
      {spotlight && power === "on" && (
        <Spotlight items={spotlightItems} onClose={() => setSpotlight(false)} />
      )}
      {crashed && (
        <CrashScreen
          className="fixed inset-0 z-[210]"
          strings={{
            ...(tRoot.raw("notFound") as CrashStrings),
            text: t("deploy.crashText"),
          }}
          stopCode="MEMORY_MANAGEMENT (0x0000001A)"
          failed={deployFile}
          onRestart={() => {
            setCrashed(false);
            setPower("booting");
          }}
        />
      )}
      <PowerOverlay
        state={power}
        wallpaper={wallpaper}
        onPowerOn={() => setPower("booting")}
        onBooted={() => setPower("locked")}
        onWake={() => setPower("locked")}
        onUnlock={() => {
          setPower("on");
          notify(
            t("notify.welcome", { name: site.firstName }),
            t("notify.welcomeBody"),
            <SystemTile />,
          );
        }}
        onSleep={actions.sleep}
        onRestart={actions.restart}
        onShutDown={actions.shutDown}
      />
    </div>
  );
}
