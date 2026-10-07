"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { m } from "framer-motion";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

function FakeQr() {
  const size = 21;
  const finder = (x: number, y: number) =>
    [
      [0, 0],
      [size - 7, 0],
      [0, size - 7],
    ].some(([fx, fy]) => {
      const dx = x - fx;
      const dy = y - fy;
      if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return false;
      return (
        dx === 0 ||
        dy === 0 ||
        dx === 6 ||
        dy === 6 ||
        (dx > 1 && dx < 5 && dy > 1 && dy < 5)
      );
    });
  const inFinderZone = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9);
  const cells = Array.from({ length: size * size }, (_, i) => {
    const x = i % size;
    const y = Math.floor(i / size);
    if (inFinderZone(x, y)) return finder(x, y);
    return (x * 7 + y * 13 + x * y) % 5 < 2;
  });
  return (
    <div
      aria-hidden="true"
      className="grid h-[84px] w-[84px] shrink-0 bg-white p-1 sm:h-28 sm:w-28 sm:p-1.5"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
      }}
    >
      {cells.map((on, i) => (
        <span key={i} className={on ? "bg-[#0a5ec8]" : ""} />
      ))}
    </div>
  );
}

export type CrashStrings = {
  title: string;
  text: string;
  progress: string;
  more: string;
  stopCode: string;
  failed: string;
  restart: string;
  hint: string;
};

export function CrashScreen({
  strings: t,
  stopCode,
  failed,
  hidden = false,
  onRestart,
  className,
}: Readonly<{
  strings: CrashStrings;
  stopCode: string;
  failed: string;
  hidden?: boolean;
  onRestart: () => void;
  className?: string;
}>) {
  const [progress, setProgress] = useState(0);
  const ready = progress >= 100;

  useEffect(() => {
    if (ready) return;
    const id = setTimeout(
      () =>
        setProgress((p) =>
          Math.min(100, p + 7 + Math.floor(Math.random() * 18)),
        ),
      350 + Math.random() * 500,
    );
    return () => clearTimeout(id);
  }, [progress, ready]);

  const restart = () => {
    if (ready && !hidden) onRestart();
  };
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Enter") restart();
  });
  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return (
    <m.div
      role="alert"
      initial={{ opacity: 1 }}
      animate={hidden ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={cn(
        "flex min-h-[100svh] items-start overflow-y-auto bg-[#0a5ec8] px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-10 text-white select-none sm:items-center sm:px-[10vw] sm:py-12",
        className,
      )}
    >
      <div className="w-full max-w-3xl">
        <p className="font-display text-[4rem] leading-none sm:text-[9rem]">
          :(
        </p>
        <h1 className="mt-4 text-lg leading-snug font-light sm:mt-6 sm:text-3xl">
          {t.title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed font-light text-white/90 sm:mt-4 sm:text-xl">
          {t.text}
        </p>
        <p
          className="mt-4 text-lg font-light tabular-nums sm:mt-6 sm:text-2xl"
          aria-live="polite"
        >
          {t.progress.replace("{n}", String(progress))}
        </p>

        <div className="mt-6 flex items-start gap-4 sm:mt-8 sm:gap-5">
          <FakeQr />
          <div className="min-w-0 text-xs leading-relaxed font-light sm:text-base">
            <p>
              {t.more}{" "}
              <span className="font-normal underline underline-offset-2">
                {site.url}
              </span>
            </p>
            <p className="mt-3 text-white/85">
              {t.stopCode}:{" "}
              <span className="block font-mono sm:inline">{stopCode}</span>
            </p>
            <p className="text-white/85">
              {t.failed}: <span className="font-mono break-all">{failed}</span>
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
          <button
            type="button"
            onClick={restart}
            disabled={!ready}
            autoFocus
            className="bsod-button w-full rounded-md border-2 border-white px-6 py-2.5 text-base font-semibold transition-[color,background-color,opacity] enabled:hover:bg-white enabled:hover:text-[#0a5ec8] enabled:focus-visible:bg-white enabled:focus-visible:text-[#0a5ec8] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {t.restart}
          </button>
          {ready && (
            <span className="text-sm text-white/70 max-sm:hidden">
              {t.hint}
            </span>
          )}
        </div>
      </div>
    </m.div>
  );
}
