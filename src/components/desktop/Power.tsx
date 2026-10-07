"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, Lock, Moon, Power, Reload } from "@/components/ui/icons";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { stripMeridiem, useClock } from "./MenuBar";

export type PowerState =
  | "on"
  | "shutting"
  | "off"
  | "sleep"
  | "restarting"
  | "booting"
  | "locked";

const BOOT_MS = 3200;

export function OsMark({ className }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M23 10h54v9a8 8 0 0 0 8 8h9v46h-9a8 8 0 0 0-8 8v9H23v-9a8 8 0 0 0-8-8H6V27h9a8 8 0 0 0 8-8z"
        opacity="0.14"
      />
      <text
        x="50"
        y="64"
        textAnchor="middle"
        fontFamily="var(--font-display), sans-serif"
        fontWeight="700"
        fontSize="40"
        fill="currentColor"
      >
        {site.firstName[0]}
        {site.name.split(" ").at(-1)?.[0]}
      </text>
    </svg>
  );
}

function PowerButton({ onPowerOn }: Readonly<{ onPowerOn: () => void }>) {
  const t = useTranslations("desktop.power");
  return (
    <m.div
      className="fixed inset-0 z-[200] bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      <m.div
        className="pointer-events-none absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        initial={{ opacity: 0.9, scale: 1 }}
        animate={{ opacity: 0, scale: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <button
        type="button"
        onClick={onPowerOn}
        aria-label={t("on")}
        title={t("on")}
        className="group absolute right-5 bottom-5 flex items-center gap-3 text-white/35 transition-colors hover:text-white/90 sm:right-8 sm:bottom-8"
      >
        <span className="text-xs opacity-0 transition-opacity group-hover:opacity-100">
          {t("hint")}
        </span>
        <span className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/5">
          <Lock className="h-5 w-5" />
        </span>
      </button>
    </m.div>
  );
}

export function BootScreen({ onDone }: Readonly<{ onDone: () => void }>) {
  const done = useEffectEvent(onDone);
  useEffect(() => {
    const id = setTimeout(() => done(), BOOT_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <m.div
      className="fixed inset-0 z-[200] grid place-items-center bg-black text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <div className="flex flex-col items-center gap-14">
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <OsMark className="h-24 w-24 sm:h-28 sm:w-28" />
        </m.div>
        <div className="h-[5px] w-44 overflow-hidden rounded-full bg-white/20 sm:w-52">
          <m.div
            className="h-full origin-left rounded-full bg-white"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 0.18, 0.42, 0.5, 0.86, 1] }}
            transition={{
              duration: BOOT_MS / 1000 - 0.4,
              delay: 0.5,
              times: [0, 0.15, 0.4, 0.55, 0.85, 1],
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </m.div>
  );
}

function LockScreen({
  wallpaper,
  onUnlock,
  onSleep,
  onRestart,
  onShutDown,
}: Readonly<{
  wallpaper: string;
  onUnlock: () => void;
  onSleep: () => void;
  onRestart: () => void;
  onShutDown: () => void;
}>) {
  const t = useTranslations("desktop.lock");
  const time = stripMeridiem(useClock({ hour: "numeric", minute: "2-digit" }));
  const date = useClock({ weekday: "long", day: "numeric", month: "long" });
  const [value, setValue] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [shake, setShake] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim().toLowerCase() === site.os.password) {
      onUnlock();
      return;
    }
    setAttempts((a) => a + 1);
    setShake((s) => s + 1);
    setShowHint(true);
    setValue("");
  };

  const powerActions = [
    { label: t("sleep"), Icon: Moon, onClick: onSleep },
    { label: t("restart"), Icon: Reload, onClick: onRestart },
    { label: t("shutDown"), Icon: Power, onClick: onShutDown },
  ];

  return (
    <m.div
      data-wallpaper={wallpaper}
      className="wallpaper fixed inset-0 z-[150] text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.45 } }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-2xl" />
      <div className="relative flex h-full flex-col items-center justify-between px-6 pt-[8vh] pb-8">
        <div className="text-center [text-shadow:0_2px_12px_rgba(0,0,0,0.3)]">
          <p
            className="text-lg font-medium text-white/85 sm:text-xl"
            suppressHydrationWarning
          >
            {date}
          </p>
          <p
            className="font-display text-[5.5rem] leading-none font-semibold tracking-tight sm:text-[8rem]"
            suppressHydrationWarning
          >
            {time}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-white/40">
            <Image
              src={site.images.avatar}
              alt={site.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <p className="text-lg font-semibold [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
            {site.name}
          </p>
          <m.form
            key={shake}
            onSubmit={submit}
            animate={shake ? { x: [0, -12, 10, -8, 6, -3, 0] } : undefined}
            transition={{ duration: 0.45 }}
            className="flex items-center gap-2"
          >
            <label className="sr-only" htmlFor="os-password">
              {t("placeholder")}
            </label>
            <input
              id="os-password"
              type="password"
              autoFocus
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t("placeholder")}
              className="os-input h-9 w-52 rounded-full border border-white/25 bg-white/20 px-4 text-sm text-white placeholder:text-white/70 focus:bg-white/25 focus:outline-none"
            />
            <button
              type="submit"
              aria-label={t("unlock")}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/20 hover:bg-white/30"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t("showHint")}
              aria-expanded={showHint}
              onClick={() => setShowHint((s) => !s)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/20 text-sm font-semibold hover:bg-white/30"
            >
              ?
            </button>
          </m.form>
          <div className="h-10 text-center text-sm" aria-live="polite">
            {attempts > 0 && <p className="text-white/90">{t("wrong")}</p>}
            <AnimatePresence>
              {showHint && (
                <m.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-white/75"
                >
                  {t("hint", { password: site.os.password })}
                </m.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-8">
          {powerActions.map(({ label, Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="flex flex-col items-center gap-1.5 text-xs text-white/80 hover:text-white"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur">
                <Icon className="h-4 w-4" />
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </m.div>
  );
}

export function PowerOverlay({
  state,
  wallpaper,
  onPowerOn,
  onBooted,
  onWake,
  onUnlock,
  onSleep,
  onRestart,
  onShutDown,
}: Readonly<{
  state: PowerState;
  wallpaper: string;
  onPowerOn: () => void;
  onBooted: () => void;
  onWake: () => void;
  onUnlock: () => void;
  onSleep: () => void;
  onRestart: () => void;
  onShutDown: () => void;
}>) {
  return (
    <AnimatePresence>
      {state === "off" && <PowerButton key="off" onPowerOn={onPowerOn} />}
      {state === "booting" && <BootScreen key="boot" onDone={onBooted} />}
      {state === "sleep" && (
        <m.button
          key="sleep"
          type="button"
          aria-label="Wake"
          onClick={onWake}
          onKeyDown={onWake}
          autoFocus
          className={cn("fixed inset-0 z-[200] cursor-default bg-black")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {state === "locked" && (
        <LockScreen
          key="lock"
          wallpaper={wallpaper}
          onUnlock={onUnlock}
          onSleep={onSleep}
          onRestart={onRestart}
          onShutDown={onShutDown}
        />
      )}
    </AnimatePresence>
  );
}
