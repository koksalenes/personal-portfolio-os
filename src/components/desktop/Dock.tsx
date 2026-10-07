"use client";

import { useRef, type ReactNode } from "react";
import {
  m,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { Compass, Github, Whale, Mail } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { socials } from "@/lib/data";
import { socialLinks } from "@/lib/socials";
import { OsMark } from "./Power";
import { desktopPrefs } from "./session";

export function EditorTile({ className }: Readonly<{ className?: string }>) {
  return (
    <span
      className={cn(
        "grid h-full w-full place-items-center rounded-[24%] bg-gradient-to-b from-[#3ea6ff] to-[#0062cc] font-mono font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
        className,
      )}
    >
      <span className="text-[0.38em] tracking-tighter">{"</>"}</span>
    </span>
  );
}

export function BrowserTile({ className }: Readonly<{ className?: string }>) {
  return (
    <span
      className={cn(
        "grid h-full w-full place-items-center rounded-[24%] bg-gradient-to-b from-white to-[#dfe7f2] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
        className,
      )}
    >
      <Compass className="h-[70%] w-[70%] text-[#1a73e8]" strokeWidth={1.2} />
    </span>
  );
}

export function TerminalTile() {
  return (
    <span className="grid h-full w-full place-items-start rounded-[24%] bg-gradient-to-b from-[#3b3f46] to-[#111317] p-[16%] font-mono text-[0.3em] leading-none font-bold text-[#4ade80] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
      {">_"}
    </span>
  );
}

export function SystemTile() {
  return (
    <span className="grid h-full w-full place-items-center rounded-[24%] bg-gradient-to-b from-[#26282e] to-[#0b0c0f] text-[#c6ff00] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
      <OsMark className="h-[78%] w-[78%]" />
    </span>
  );
}

export function ScriptTile() {
  return (
    <span className="relative grid h-full w-[80%] place-items-center rounded-[10%] bg-[#1f2328] font-mono text-[0.24em] font-bold text-[#4ade80] shadow">
      <span className="absolute top-0 right-0 h-[24%] w-[30%] rounded-bl-md bg-[#3b4048]" />
      {">_ sh"}
    </span>
  );
}

export function DockerTile() {
  return (
    <span className="grid h-full w-full place-items-center rounded-[24%] bg-gradient-to-b from-[#2496ed] to-[#1d63ed] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
      <Whale className="h-[62%] w-[62%]" />
    </span>
  );
}

export function GithubTile() {
  return (
    <span className="grid h-full w-full place-items-center rounded-[24%] bg-gradient-to-b from-[#3a3f47] to-[#15181d] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
      <Github className="h-[62%] w-[62%]" />
    </span>
  );
}

export function DocTile() {
  return (
    <span className="relative grid h-full w-[80%] place-items-end justify-items-center rounded-[10%] bg-white pb-[18%] text-[0.22em] font-bold text-[#6b7280] shadow">
      <span className="absolute top-0 right-0 h-[24%] w-[30%] rounded-bl-md bg-[#e5e7eb]" />
      MD
    </span>
  );
}

const linkTiles: Array<{
  label: string;
  href: string;
  Icon: (typeof socialLinks)[number]["Icon"];
  tile: string;
  desktopOnly?: boolean;
}> = [
  ...socialLinks.map(({ label, href, Icon, tile }, i) => ({
    label,
    href,
    Icon,
    tile,
    desktopOnly: i >= 2,
  })),
  {
    label: "Mail",
    href: `mailto:${socials.email}`,
    Icon: Mail,
    desktopOnly: true,
    tile: "bg-gradient-to-b from-[#6dd5fa] to-[#2980ff] text-white",
  },
];

function DockItem({
  mouseX,
  label,
  running,
  onClick,
  href,
  className,
  context,
  children,
}: Readonly<{
  mouseX: MotionValue<number>;
  context: string;
  className?: string;
  label: string;
  running?: boolean;
  onClick?: () => void;
  href?: string;
  children: ReactNode;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  const distance = useTransform(mouseX, (x) => {
    const box = ref.current?.getBoundingClientRect();
    return box ? x - box.left - box.width / 2 : Infinity;
  });
  const target = useTransform(distance, [-130, 0, 130], [1, 1.45, 1]);
  const scale = useSpring(target, { mass: 0.1, stiffness: 180, damping: 14 });
  const margin = useTransform(scale, (s) => (s - 1) * 24);

  const inner = (
    <m.span
      style={{ scale }}
      className="block h-10 w-10 origin-bottom text-[40px] sm:h-12 sm:w-12 sm:text-[48px]"
    >
      {children}
    </m.span>
  );

  return (
    <m.div
      ref={ref}
      style={{ marginLeft: margin, marginRight: margin }}
      data-context={context}
      className={cn(
        "group/dock relative flex flex-col items-center",
        className,
      )}
    >
      <span className="dock-tip pointer-events-none absolute -top-11 rounded-md bg-black/70 px-2.5 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg backdrop-blur transition-opacity group-hover/dock:opacity-100">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          aria-label={label}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
        >
          {inner}
        </a>
      ) : (
        <button type="button" aria-label={label} onClick={onClick}>
          {inner}
        </button>
      )}
      <span
        className={cn(
          "mt-1 h-1 w-1 rounded-full bg-white/80",
          !running && "opacity-0",
        )}
      />
    </m.div>
  );
}

export type DockApp = {
  id: string;
  label: string;
  tile: ReactNode;
  running: boolean;
  onClick: () => void;
};

export function Dock({
  apps,
  minimized,
}: Readonly<{ apps: DockApp[]; minimized: DockApp[] }>) {
  const t = useTranslations("desktop");
  const mouseX = useMotionValue(Infinity);
  const { dockMagnify } = desktopPrefs.useValue();

  return (
    <nav
      aria-label={t("dock")}
      data-context="dock"
      onPointerMove={(e) =>
        dockMagnify && e.pointerType === "mouse" && mouseX.set(e.clientX)
      }
      onPointerLeave={() => mouseX.set(Infinity)}
      className="absolute bottom-2 left-1/2 z-50 flex max-w-[calc(100%-12px)] -translate-x-1/2 items-end gap-1.5 rounded-2xl border border-white/20 bg-white/15 px-2 pt-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:gap-2 dark:bg-black/25"
    >
      {apps.map((app) => (
        <DockItem
          key={app.id}
          mouseX={mouseX}
          label={app.label}
          running={app.running}
          onClick={app.onClick}
          context={`dock:${app.id}`}
        >
          {app.tile}
        </DockItem>
      ))}
      <span className="mx-0.5 mb-3 h-9 w-px self-end bg-white/25 max-sm:hidden sm:h-11" />
      {linkTiles.map(({ label, href, Icon, tile, desktopOnly }) => (
        <DockItem
          key={label}
          mouseX={mouseX}
          label={label}
          href={href}
          context={`link:${href}`}
          className={desktopOnly ? "max-md:hidden" : "max-sm:hidden"}
        >
          <span
            className={cn(
              "grid h-full w-full place-items-center rounded-[24%] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]",
              tile,
            )}
          >
            <Icon className="h-[52%] w-[52%]" />
          </span>
        </DockItem>
      ))}
      {minimized.length > 0 && (
        <span className="mx-0.5 mb-3 h-9 w-px self-end bg-white/25 max-sm:hidden sm:h-11" />
      )}
      {minimized.map((win) => (
        <DockItem
          key={win.id}
          mouseX={mouseX}
          label={win.label}
          onClick={win.onClick}
          context={`dock:${win.id.replace(/^min-/, "")}`}
          className="max-sm:hidden"
        >
          <span className="bg-surface border-border grid h-full w-full place-items-center overflow-hidden rounded-[18%] border p-[14%] shadow">
            {win.tile}
          </span>
        </DockItem>
      ))}
    </nav>
  );
}
