"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { site } from "@/config/site";
import {
  experiences,
  formatPeriod,
  getExperienceYears,
  heroStack,
  skillCategories,
} from "@/lib/data";
import { sectionIds, type OsActions, type SectionId } from "../actions";
import {
  isSocialKey,
  openRepo,
  repoName,
  repoUrl,
  socialLinks,
} from "@/lib/socials";
import { staticSources } from "../editor/files";
import { wallpapers, type Wallpaper } from "../store";
import { dockerPs, startDocker, stopDocker } from "../docker";
import { Window, type WindowControls, type WindowId } from "../Window";
import { TerminalTitle } from "./TerminalTitle";

const PROMPT_USER = `${site.os.user}@${site.os.host}`;

const commands: Record<string, string> = {
  help: "list available commands",
  whoami: "who built this computer",
  about: "short bio",
  experience: "work history",
  skills: "technology stack",
  education: "degree and school",
  contact: "email and social links",
  neofetch: "system information",
  ls: "list files",
  "cat <file>": "print a file (try README.md)",
  "open <app|section>": "open editor, browser, about, github, linkedin…",
  "cd <section>": "scroll the site to a section",
  "docker <ps|start|stop|restart>": "manage the local containers",
  ...(repoUrl && {
    star: "like this OS? star it on GitHub ⭐",
    source: "view the source code",
    "git clone": "use this OS as your own portfolio",
  }),
  "theme <dark|light>": "switch appearance",
  "wallpaper [name]": `change wallpaper (${wallpapers.join(", ")})`,
  date: "current date and time",
  "echo <text>": "print text",
  replay: "replay the intro",
  "lock | sleep | reboot | shutdown": "power options",
  clear: "clear the screen",
  exit: "close the terminal",
};

const Accent = ({ children }: { children: ReactNode }) => (
  <span className="text-(--syn-fn)">{children}</span>
);

const notFound = (cmd: string): ReactNode[] => [
  `zsh: command not found: ${cmd}`,
  <span key="tip" className="text-faint">
    Type <Accent>help</Accent> to see what you can do.
  </span>,
];

function Prompt({ cmd }: Readonly<{ cmd?: string }>) {
  return (
    <span>
      <span className="text-(--syn-string)">{PROMPT_USER}</span>{" "}
      <span className="text-(--syn-fn)">~</span>{" "}
      <span className="text-foreground">%</span> {cmd}
    </span>
  );
}

export function TerminalApp({
  controls,
  actions,
  autorun,
}: Readonly<{
  controls: WindowControls;
  actions: OsActions;
  autorun?: { cmd: string; n: number } | null;
}>) {
  const t = useTranslations();
  const td = useTranslations("desktop");
  const locale = useLocale();
  const [lines, setLines] = useState<ReactNode[]>(() => [
    <span key="w" className="text-faint" suppressHydrationWarning>
      Last login: {new Date().toDateString()} on ttys001
    </span>,
    <span key="h">
      Welcome to {site.os.name} {site.os.version}. Type <Accent>help</Accent> to
      get started.
    </span>,
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { vis, focused } = controls;

  useEffect(() => {
    if (vis !== "open" || !focused) return;
    const id = setTimeout(
      () => inputRef.current?.focus({ preventScroll: true }),
      60,
    );
    return () => clearTimeout(id);
  }, [vis, focused]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const openTarget = (target: string): string | null => {
    const apps: Record<string, WindowId> = {
      editor: "editor",
      code: "editor",
      browser: "browser",
      site: "browser",
      [site.domain]: "browser",
      terminal: "terminal",
      about: "about",
      music: "music",
      settings: "settings",
    };
    if (repoUrl && (target === "repo" || target === "source")) {
      openRepo();
      return `Opening ${repoUrl}…`;
    }
    if (apps[target]) {
      actions.open(apps[target]);
      return `Opening ${target}…`;
    }
    if (isSocialKey(target)) {
      window.open(site.socials[target], "_blank", "noopener,noreferrer");
      return `Opening ${site.socials[target]}…`;
    }
    if ((sectionIds as readonly string[]).includes(target)) {
      actions.goTo(target as SectionId);
      return `Navigating to #${target}…`;
    }
    return null;
  };

  const run = (raw: string): ReactNode[] | "clear" => {
    const [cmd = "", ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ");
    switch (cmd.toLowerCase()) {
      case "":
        return [];
      case "help":
        return Object.entries(commands).map(([name, desc]) => (
          <span key={name} className="flex flex-wrap gap-x-3">
            <span className="w-[34ch] max-w-full shrink-0">
              <Accent>{name}</Accent>
            </span>
            <span className="text-faint">{desc}</span>
          </span>
        ));
      case "whoami":
        return [`${site.name} — ${t("meta.jobTitle")}`];
      case "about":
        return [t("about.lead"), "", t("about.summary")];
      case "experience":
        return experiences.flatMap((exp) => [
          <span key={exp.id}>
            <Accent>{t(`experience.items.${exp.id}.role`)}</Accent> @{" "}
            {t(`experience.items.${exp.id}.company`, { name: site.name })}
          </span>,
          <span key={`${exp.id}-p`} className="text-faint">
            {"  "}
            {formatPeriod(exp, locale, t("experience.present"))} ·{" "}
            {t(`experience.items.${exp.id}.location`)}
          </span>,
        ]);
      case "skills":
        return skillCategories.map((c) => (
          <span key={c.id}>
            <Accent>{t(`skills.categories.${c.id}`)}</Accent>:{" "}
            {c.skills.join(", ")}
          </span>
        ));
      case "education":
        return [
          <span key="d">
            <Accent>{t("education.degree")}</Accent> — {t("education.school")}
          </span>,
          <span key="p" className="text-faint">
            {"  "}
            {t("education.period")} · {t("education.location")}
          </span>,
        ];
      case "contact":
      case "socials":
        return [
          <span key="e">
            email{"      "}
            <a className="underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </span>,
          ...socialLinks.map(({ key: name, href: url }) => (
            <span key={name}>
              {name.padEnd(11, " ")}
              <a
                className="underline"
                href={url}
                target="_blank"
                rel="noreferrer noopener"
              >
                {url}
              </a>
            </span>
          )),
        ];
      case "neofetch":
        return [
          <span key="n" className="flex gap-6">
            <span className="text-accent leading-tight whitespace-pre">
              {
                "  ███████╗██╗  ██╗\n  ██╔════╝██║ ██╔╝\n  █████╗  █████╔╝ \n  ██╔══╝  ██╔═██╗ \n  ███████╗██║  ██╗\n  ╚══════╝╚═╝  ╚═╝"
              }
            </span>
            <span className="flex flex-col">
              <span>
                <Accent>{PROMPT_USER}</Accent>
              </span>
              <span className="text-faint">-----------------</span>
              <span>
                <Accent>OS</Accent>: {site.os.name} {site.os.version}
              </span>
              <span>
                <Accent>Host</Accent>: {site.domain}
              </span>
              <span>
                <Accent>Owner</Accent>: {site.name}
              </span>
              <span>
                <Accent>Uptime</Accent>: {getExperienceYears()}+ years
              </span>
              <span>
                <Accent>Shell</Accent>: zsh 5.9
              </span>
              <span>
                <Accent>Stack</Accent>: {heroStack.slice(0, 5).join(", ")}
              </span>
              {repoUrl && (
                <span>
                  <Accent>Source</Accent>: {repoName}
                </span>
              )}
            </span>
          </span>,
        ];
      case "ls":
        return [
          <span key="ls">
            <Accent>apps/</Accent>
            {"    "}package.json{"    "}README.md
          </span>,
        ];
      case "cat": {
        const sources = staticSources({
          jobTitle: t("meta.jobTitle"),
          description: t("meta.description"),
          roles: t.raw("hero.rolesTyped") as string[],
        });
        const file = Object.keys(sources).find(
          (path) => path === arg || path.endsWith(`/${arg}`),
        );
        if (!file)
          return [`cat: ${arg || "<file>"}: No such file or directory`];
        return sources[file].split("\n");
      }
      case "open":
        return [
          openTarget(arg.toLowerCase()) ?? `open: unknown target "${arg}"`,
        ];
      case "cd":
        if (!arg || arg === "~") return [];
        if (!(sectionIds as readonly string[]).includes(arg))
          return [`cd: no such section: ${arg}`];
        actions.goTo(arg as SectionId);
        return [`Navigating to #${arg}…`];
      case "theme":
        if (arg !== "dark" && arg !== "light")
          return ["usage: theme <dark|light>"];
        actions.setTheme(arg);
        return [`Appearance set to ${arg}.`];
      case "wallpaper":
        if (!arg) {
          actions.nextWallpaper();
          return [td("notify.wallpaper")];
        }
        if (!(wallpapers as readonly string[]).includes(arg))
          return [`wallpaper: choose one of ${wallpapers.join(", ")}`];
        actions.setWallpaper(arg as Wallpaper);
        return [td("notify.wallpaper")];
      case "date":
        return [new Date().toString()];
      case "echo":
        return [arg];
      case "docker": {
        const sub = args[0];
        if (sub === "ps") return dockerPs();
        if (sub === "restart") {
          startDocker();
          return ["Restarting Docker Desktop…"];
        }
        if (sub === "stop") {
          stopDocker();
          return ["Docker Desktop stopped."];
        }
        if (sub === "start") {
          startDocker();
          return ["Starting Docker Desktop…"];
        }
        return ["usage: docker <ps|start|stop|restart>"];
      }
      case "star":
      case "source":
      case "repo":
        if (!repoUrl) return notFound(cmd);
        openRepo();
        return cmd === "star"
          ? [
              <span key="s">
                Opening <Accent>{repoName}</Accent>… thanks for the ⭐!
              </span>,
            ]
          : [`Opening ${repoUrl}…`];
      case "git":
        if (!repoUrl) return notFound(cmd);
        if (args[0] !== "clone")
          return [
            <span key="g">
              Try <Accent>git clone</Accent> to get your own copy of{" "}
              {site.os.name}.
            </span>,
          ];
        return [
          `Cloning into '${repoName.split("/").at(-1)}'...`,
          <span key="c" className="text-faint">
            {"  "}$ git clone {repoUrl}.git
          </span>,
          <span key="t">
            Or start fresh with{" "}
            <a
              className="underline"
              href={`${repoUrl}/generate`}
              target="_blank"
              rel="noreferrer noopener"
            >
              Use this template
            </a>{" "}
            and edit <Accent>src/config/site.ts</Accent>.
          </span>,
          <span key="s" className="text-faint">
            If you like it, a <Accent>star</Accent> goes a long way ⭐
          </span>,
        ];
      case "sudo":
        return [
          `${site.os.user} is not in the sudoers file. This incident will be reported. 😉`,
        ];
      case "replay":
        actions.replayIntro();
        return ["Replaying intro…"];
      case "lock":
        actions.lock();
        return [];
      case "sleep":
        actions.sleep();
        return [];
      case "reboot":
      case "restart":
        actions.restart();
        return [];
      case "shutdown":
        actions.shutDown();
        return [];
      case "clear":
        return "clear";
      case "exit":
        actions.close("terminal");
        return [];
      default:
        return notFound(cmd);
    }
  };

  const [handled, setHandled] = useState(0);
  if (autorun && autorun.n !== handled) {
    setHandled(autorun.n);
    const out = run(autorun.cmd);
    if (out !== "clear")
      setLines((l) => [
        ...l,
        <Prompt key={`p${l.length}`} cmd={autorun.cmd} />,
        ...out,
      ]);
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const out = run(input);
    if (out === "clear") setLines([]);
    else
      setLines((l) => [
        ...l,
        <Prompt key={`p${l.length}`} cmd={input} />,
        ...out,
      ]);
    if (input.trim()) setHistory((h) => [...h, input]);
    setInput("");
    setCursor(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      if (!history.length) return;
      const next =
        e.key === "ArrowUp"
          ? Math.max(0, (cursor ?? history.length) - 1)
          : Math.min(history.length, (cursor ?? history.length) + 1);
      setCursor(next);
      setInput(history[next] ?? "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = Object.keys(commands)
        .map((c) => c.split(" ")[0])
        .find((c) => input && c.startsWith(input));
      if (match) setInput(`${match} `);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <Window
      id="terminal"
      label={td("terminal")}
      controls={controls}
      titleBar={<TerminalTitle folder={site.os.user} process="-zsh" />}
    >
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
        className="text-foreground/90 min-h-0 flex-1 overflow-y-auto bg-[color-mix(in_srgb,var(--surface)_70%,black)] p-3 font-mono text-[12px] leading-5 select-text sm:text-[13px]"
      >
        {lines.map((line, i) => (
          <div key={i} className="break-words whitespace-pre-wrap">
            {line}
          </div>
        ))}
        <form onSubmit={submit} className="flex gap-2">
          <Prompt />
          <label htmlFor="os-terminal" className="sr-only">
            {td("terminal")}
          </label>
          <input
            id="os-terminal"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="os-plain caret-accent min-w-0 flex-1 bg-transparent outline-none"
          />
        </form>
      </div>
    </Window>
  );
}
