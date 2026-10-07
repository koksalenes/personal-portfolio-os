"use client";

import { useRef, type ReactNode } from "react";
import { stripMeridiem, useClock } from "./MenuBar";
import type { DesktopIcon } from "./DesktopIcons";

const LONG_PRESS_MS = 550;

export function PhoneHome({
  icons,
  children,
  onContextMenu,
}: Readonly<{
  icons: DesktopIcon[];
  children: ReactNode;
  onContextMenu: (x: number, y: number, iconId: string | null) => void;
}>) {
  const time = useClock({ hour: "2-digit", minute: "2-digit" });
  const date = useClock({ weekday: "long", day: "numeric", month: "long" });
  const press = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  const startPress = (e: React.PointerEvent, iconId: string | null) => {
    longPressed.current = false;
    const { clientX, clientY } = e;
    press.current = setTimeout(() => {
      longPressed.current = true;
      onContextMenu(clientX, clientY, iconId);
    }, LONG_PRESS_MS);
  };
  const cancelPress = () => {
    if (press.current) clearTimeout(press.current);
  };

  return (
    <div
      className="absolute inset-x-0 top-7 bottom-24 flex flex-col gap-3 overflow-hidden px-4 pt-3 pb-1 select-none"
      onPointerDown={(e) => e.target === e.currentTarget && startPress(e, null)}
      onPointerUp={cancelPress}
      onPointerMove={cancelPress}
      onContextMenu={(e) => {
        if ((e.target as HTMLElement).closest("[data-context]")) return;
        e.preventDefault();
        const iconId =
          (e.target as HTMLElement).closest<HTMLElement>("[data-icon]")?.dataset
            .icon ?? null;
        onContextMenu(e.clientX, e.clientY, iconId);
      }}
    >
      <div className="shrink-0 text-center text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.35)] [@media(max-height:700px)]:hidden">
        <p
          className="font-display text-4xl leading-none font-semibold tracking-tight"
          suppressHydrationWarning
        >
          {stripMeridiem(time)}
        </p>
        <p
          className="mt-1 text-sm font-medium text-white/85"
          suppressHydrationWarning
        >
          {date}
        </p>
      </div>

      <ul className="grid shrink-0 grid-cols-4 gap-x-2 gap-y-3">
        {icons.map((icon) => (
          <li key={icon.id}>
            <button
              type="button"
              data-icon={icon.id}
              onPointerDown={(e) => startPress(e, icon.id)}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
              onClick={() => !longPressed.current && icon.open()}
              className="flex w-full flex-col items-center gap-1.5 text-white transition-transform active:scale-95"
            >
              <span className="pointer-events-none grid h-[52px] w-[52px] place-items-center text-[52px]">
                {icon.tile}
              </span>
              <span className="pointer-events-none px-0.5 text-center text-[10px] leading-[13px] font-medium tracking-tight whitespace-nowrap [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">
                {icon.label}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex min-h-0 flex-1 flex-col gap-3">{children}</div>
    </div>
  );
}
