"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useViewport } from "./hooks";
import { iconPositions, type IconPosition } from "./store";

export type DesktopIcon = {
  id: string;
  label: string;
  tile: ReactNode;
  open: () => void;
};

const ICON_W = 84;
const ICON_H = 88;
const MENU_BAR = 28;

const ROW = 96;
const DOCK_SPACE = 96;

export const defaultIconPosition = (
  index: number,
  viewportHeight = Infinity,
): IconPosition => {
  const perColumn = Math.max(
    1,
    Math.floor((viewportHeight - MENU_BAR - 16 - DOCK_SPACE) / ROW),
  );
  return {
    right: 12 + Math.floor(index / perColumn) * ICON_W,
    top: MENU_BAR + 16 + (index % perColumn) * ROW,
  };
};

type Marquee = { x0: number; y0: number; x1: number; y1: number };

const LONG_PRESS_MS = 550;

export function DesktopIcons({
  icons,
  selected,
  onSelect,
  onContextMenu,
  avoid,
}: Readonly<{
  avoid?: { right: number; bottom: number } | null;
  icons: DesktopIcon[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  onContextMenu: (x: number, y: number, iconId: string | null) => void;
}>) {
  const positions = iconPositions.useValue();
  const layer = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const [marquee, setMarquee] = useState<Marquee | null>(null);

  const viewport = useViewport();
  const posOf = (id: string, i: number): IconPosition => {
    const p = positions[id] ?? defaultIconPosition(i, viewport.height);
    const clamped = {
      right: Math.max(4, Math.min(p.right, viewport.width - ICON_W - 4)),
      top: Math.max(
        MENU_BAR + 4,
        Math.min(p.top, viewport.height - ICON_H - 90),
      ),
    };
    const left = viewport.width - clamped.right - ICON_W;
    if (avoid && left < avoid.right && clamped.top < avoid.bottom) {
      const shifted = viewport.width - avoid.right - ICON_W - 8;
      return shifted >= 4
        ? { ...clamped, right: Math.min(clamped.right, shifted) }
        : defaultIconPosition(i, viewport.height);
    }
    return clamped;
  };

  const startLongPress = (e: React.PointerEvent, iconId: string | null) => {
    if (e.pointerType !== "touch") return () => {};
    const { clientX, clientY } = e;
    const timer = setTimeout(
      () => onContextMenu(clientX, clientY, iconId),
      LONG_PRESS_MS,
    );
    return () => clearTimeout(timer);
  };

  const onIconPointerDown = (e: React.PointerEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const additive = e.shiftKey || e.metaKey || e.ctrlKey;
    const group = selected.includes(id)
      ? selected
      : additive
        ? [...selected, id]
        : [id];
    onSelect(group);

    const startX = e.clientX;
    const startY = e.clientY;
    const cancelLongPress = startLongPress(e, id);
    let moved = false;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < 5) return;
      moved = true;
      cancelLongPress();
      setDrag({ dx, dy });
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      cancelLongPress();
      if (!moved) {
        setDrag(null);
        if (e.pointerType === "touch") icons.find((i) => i.id === id)?.open();
        return;
      }
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const next = { ...iconPositions.read() };
      icons.forEach((icon, i) => {
        if (!group.includes(icon.id)) return;
        const p = posOf(icon.id, i);
        next[icon.id] = {
          right: Math.round(
            Math.min(window.innerWidth - ICON_W - 4, Math.max(4, p.right - dx)),
          ),
          top: Math.round(
            Math.min(
              window.innerHeight - ICON_H - 80,
              Math.max(MENU_BAR + 4, p.top + dy),
            ),
          ),
        };
      });
      iconPositions.write(next);
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  const onLayerPointerDown = (e: React.PointerEvent) => {
    if (e.target !== e.currentTarget || e.button !== 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const cancelLongPress = startLongPress(e, null);
    const additive = e.shiftKey || e.metaKey;
    const base = additive ? selected : [];
    let moved = false;
    if (!additive) onSelect([]);

    const move = (ev: PointerEvent) => {
      if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 5)
        return;
      moved = true;
      cancelLongPress();
      const box = { x0: startX, y0: startY, x1: ev.clientX, y1: ev.clientY };
      setMarquee(box);
      const left = Math.min(box.x0, box.x1);
      const right = Math.max(box.x0, box.x1);
      const top = Math.min(box.y0, box.y1);
      const bottom = Math.max(box.y0, box.y1);
      const hits = [
        ...(layer.current?.querySelectorAll<HTMLElement>("[data-icon]") ?? []),
      ]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.left < right && r.right > left && r.top < bottom && r.bottom > top
          );
        })
        .map((el) => el.dataset.icon!);
      onSelect([...new Set([...base, ...hits])]);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      cancelLongPress();
      setMarquee(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  };

  return (
    <div
      ref={layer}
      className="absolute inset-0 top-7 touch-none select-none"
      onPointerDown={onLayerPointerDown}
      onContextMenu={(e) => {
        e.preventDefault();
        const target = (e.target as HTMLElement).closest<HTMLElement>(
          "[data-icon]",
        );
        const iconId = target?.dataset.icon ?? null;
        if (iconId && !selected.includes(iconId)) onSelect([iconId]);
        onContextMenu(e.clientX, e.clientY, iconId);
      }}
    >
      {icons.map((icon, i) => {
        const p = posOf(icon.id, i);
        const isSelected = selected.includes(icon.id);
        const dragging = drag && isSelected;
        return (
          <button
            key={icon.id}
            type="button"
            data-icon={icon.id}
            onPointerDown={(e) => onIconPointerDown(e, icon.id)}
            onDoubleClick={icon.open}
            onKeyDown={(e) => e.key === "Enter" && icon.open()}
            style={{
              right: p.right,
              top: p.top - MENU_BAR,
              transform: dragging
                ? `translate(${drag.dx}px, ${drag.dy}px)`
                : undefined,
            }}
            className={cn(
              "absolute z-[6] flex w-[84px] flex-col items-center gap-1 rounded-md py-1 text-white outline-none",
              dragging && "z-10 opacity-80",
            )}
          >
            <span
              className={cn(
                "pointer-events-none grid h-14 w-14 place-items-center rounded-lg p-1 text-[56px]",
                isSelected && "bg-black/25 ring-1 ring-white/30",
              )}
            >
              {icon.tile}
            </span>
            <span
              className={cn(
                "pointer-events-none rounded px-1 text-center text-[11px] leading-[13px] font-medium whitespace-nowrap [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]",
                isSelected && "bg-[#2f6fe4] [text-shadow:none]",
              )}
            >
              {icon.label}
            </span>
          </button>
        );
      })}

      {marquee && (
        <div
          className="pointer-events-none fixed border border-white/60 bg-white/15"
          style={{
            left: Math.min(marquee.x0, marquee.x1),
            top: Math.min(marquee.y0, marquee.y1),
            width: Math.abs(marquee.x1 - marquee.x0),
            height: Math.abs(marquee.y1 - marquee.y0),
          }}
        />
      )}
    </div>
  );
}
