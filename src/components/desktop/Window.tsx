"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, m, useMotionValue, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { useCompact, useViewport } from "./hooks";
import { offsetsStore } from "./session";

const ORIGIN = { x: 0, y: 0 };

export type WindowId =
  | "editor"
  | "browser"
  | "terminal"
  | "about"
  | "script"
  | "settings"
  | "music";
export type WindowVisibility = "open" | "min" | "closed";
export type WindowMode = "normal" | "max" | "full";

export type WindowControls = {
  vis: WindowVisibility;
  mode: WindowMode;
  focused: boolean;
  zIndex: number;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleFull: () => void;
  onToggleMax: () => void;
};

const ease = [0.22, 1, 0.36, 1] as const;

const visibility: Variants = {
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    visibility: "visible",
    transition: { duration: 0.38, ease },
  },
  min: {
    opacity: 0,
    scale: 0.12,
    y: "55%",
    transition: { duration: 0.42, ease: [0.55, 0, 0.75, 0.2] },
    transitionEnd: { visibility: "hidden" },
  },
  closed: {
    opacity: 0,
    scale: 0.94,
    y: 0,
    transition: { duration: 0.22, ease: "easeIn" },
    transitionEnd: { visibility: "hidden" },
  },
};

const instantVisibility: Variants = Object.fromEntries(
  Object.entries(visibility).map(([key, value]) => [
    key,
    { ...(value as object), transition: { duration: 0 } },
  ]),
);

const isCompact = () => window.matchMedia("(max-width: 767px)").matches;

function TrafficLights({
  focused,
  onClose,
  onMinimize,
  onToggleFull,
}: Readonly<{
  focused: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleFull: () => void;
}>) {
  const t = useTranslations("desktop");
  const lights = [
    {
      label: t("close"),
      onClick: onClose,
      color: "bg-[#ff5f57]",
      idle: "group-hover/lights:bg-[#ff5f57]",
      glyph: "M3 3l6 6M9 3 3 9",
    },
    {
      label: t("minimize"),
      onClick: onMinimize,
      color: "bg-[#febc2e]",
      idle: "group-hover/lights:bg-[#febc2e]",
      glyph: "M2.5 6h7",
    },
    {
      label: t("fullscreen"),
      onClick: onToggleFull,
      color: "bg-[#28c840]",
      idle: "group-hover/lights:bg-[#28c840]",
      glyph: "M3.5 8.5V3.5h5zM8.5 3.5v5h-5z",
    },
  ];
  return (
    <div
      className="group/lights flex shrink-0 items-center gap-2 max-md:gap-2.5"
      data-no-drag
    >
      {lights.map(({ label, onClick, color, idle, glyph }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          title={label}
          onClick={onClick}
          className={cn(
            "relative grid h-3 w-3 place-items-center rounded-full ring-1 ring-black/10 ring-inset after:absolute after:-inset-1.5 max-md:h-4 max-md:w-4",
            focused ? color : cn("bg-foreground/20", idle),
          )}
        >
          <svg
            viewBox="0 0 12 12"
            className="h-2 w-2 opacity-0 transition-opacity group-hover/lights:opacity-100"
            fill={glyph.endsWith("z") ? "rgba(0,0,0,.55)" : "none"}
            stroke="rgba(0,0,0,.55)"
            strokeWidth="1.4"
            strokeLinecap="round"
          >
            <path d={glyph} />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function Window({
  id,
  label,
  controls,
  titleBar,
  children,
  animateIn = false,
  className,
}: Readonly<{
  id: WindowId;
  label: string;
  controls: WindowControls;
  titleBar: ReactNode;
  children: ReactNode;
  animateIn?: boolean;
  className?: string;
}>) {
  const { vis, mode, focused, zIndex } = controls;
  const frame = useRef<HTMLDivElement>(null);
  const compact = useCompact();
  const viewport = useViewport();
  const offsets = offsetsStore.useValue();
  const offset = compact ? ORIGIN : (offsets[id] ?? ORIGIN);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const prevMode = useRef<WindowMode | null>(null);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSettled(true), 400);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const target = mode === "normal" ? offset : ORIGIN;
    const instant = prevMode.current === null || prevMode.current === mode;
    prevMode.current = mode;
    if (instant) {
      x.set(target.x);
      y.set(target.y);
      return;
    }
    const opts = { duration: 0.45, ease };
    const a = animate(x, target.x, opts);
    const b = animate(y, target.y, opts);
    return () => {
      a.stop();
      b.stop();
    };
  }, [mode, offset, x, y]);

  useEffect(() => {
    const el = frame.current;
    if (!el || compact || mode !== "normal") return;
    const id = setTimeout(() => {
      const r = el.getBoundingClientRect();
      let dx = 0;
      let dy = 0;
      if (r.left > viewport.width - 140) dx = viewport.width - 140 - r.left;
      if (r.right < 140) dx = 140 - r.right;
      if (r.top > viewport.height - 70) dy = viewport.height - 70 - r.top;
      if (r.top < 28) dy = 28 - r.top;
      if (dx) x.set(x.get() + dx);
      if (dy) y.set(y.get() + dy);
    }, 500);
    return () => clearTimeout(id);
  }, [viewport.width, viewport.height, compact, mode, x, y]);

  const startDrag = (e: React.PointerEvent) => {
    if (e.button !== 0 || mode !== "normal") return;
    if ((e.target as HTMLElement).closest("button,a,input,[data-no-drag]"))
      return;
    const el = frame.current;
    if (!el || isCompact()) return;
    e.preventDefault();

    const rect = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const ox = x.get();
    const oy = y.get();
    const baseLeft = rect.left - ox;
    const baseTop = rect.top - oy;
    const clamp = (v: number, min: number, max: number) =>
      Math.min(max, Math.max(min, v));

    const move = (ev: PointerEvent) => {
      x.set(
        clamp(
          ox + ev.clientX - startX,
          140 - baseLeft - rect.width,
          window.innerWidth - baseLeft - 140,
        ),
      );
      y.set(
        clamp(
          oy + ev.clientY - startY,
          28 - baseTop,
          window.innerHeight - baseTop - 70,
        ),
      );
    };
    const up = () => {
      offsetsStore.write({
        ...offsetsStore.read(),
        [id]: { x: x.get(), y: y.get() },
      });
      window.removeEventListener("pointermove", move);
      document.body.style.userSelect = "";
    };
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  const rectClass = mode === "normal" ? `win-${id}` : `win-${mode}`;

  return (
    <m.div
      ref={frame}
      style={{ x, y, zIndex }}
      className={cn(
        "win absolute",
        !settled && "transition-none",
        rectClass,
        vis !== "open" && "pointer-events-none",
      )}
      onPointerDownCapture={controls.onFocus}
    >
      <m.section
        aria-label={label}
        data-window={id}
        inert={vis !== "open"}
        initial={animateIn ? { opacity: 0, scale: 0.96, y: 16 } : false}
        animate={vis}
        variants={settled ? visibility : instantVisibility}
        style={{ transformOrigin: "50% 100%" }}
        className={cn(
          "bg-surface flex h-full flex-col overflow-clip border border-black/25 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.6),0_0_0_0.5px_rgba(255,255,255,0.12)_inset] transition-[border-radius] duration-300",
          mode === "full" ? "rounded-none" : "rounded-xl",
          className,
        )}
      >
        <div
          onPointerDown={startDrag}
          onDoubleClick={(e) => {
            if (
              (e.target as HTMLElement).closest("button,a,input,[data-no-drag]")
            )
              return;
            if (!isCompact() && mode !== "full") controls.onToggleMax();
          }}
          className="border-border bg-surface-2 relative flex h-11 shrink-0 items-center gap-3 border-b px-3 select-none sm:px-4"
        >
          <TrafficLights
            focused={focused}
            onClose={controls.onClose}
            onMinimize={controls.onMinimize}
            onToggleFull={controls.onToggleFull}
          />
          {titleBar}
        </div>
        {children}
      </m.section>
    </m.div>
  );
}
