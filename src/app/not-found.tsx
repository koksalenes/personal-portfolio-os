"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { CrashScreen } from "@/components/desktop/CrashScreen";
import { BootScreen } from "@/components/desktop/Power";
import {
  defaultLocale,
  isLocale,
  localeStorageKey,
  type Locale,
} from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

function getInitialLocale(pathname: string | null): Locale {
  const fromPath = pathname?.split("/")[1];
  if (isLocale(fromPath)) return fromPath;
  try {
    const stored = localStorage.getItem(localeStorageKey);
    if (isLocale(stored)) return stored;
  } catch {
    // Storage blocked: fall back to the default locale.
  }
  return defaultLocale;
}

const noop = () => () => {};

type Phase = "crashed" | "off" | "booting";

export default function NotFound() {
  const pathname = useSyncExternalStore(
    noop,
    () => window.location.pathname,
    () => "",
  );
  const router = useRouter();
  const locale = useSyncExternalStore(
    noop,
    () => getInitialLocale(pathname),
    () => defaultLocale,
  );
  const t = getMessages(locale).notFound;
  const [phase, setPhase] = useState<Phase>("crashed");

  const restart = () => {
    if (phase !== "crashed") return;
    setPhase("off");
    setTimeout(() => setPhase("booting"), 700);
  };

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-black select-none">
      <CrashScreen
        strings={t}
        stopCode="PAGE_NOT_FOUND (0x00000194)"
        failed={pathname}
        hidden={phase !== "crashed"}
        onRestart={restart}
      />

      <AnimatePresence>
        {phase === "booting" && (
          <BootScreen onDone={() => router.replace(`/${locale}`)} />
        )}
      </AnimatePresence>
    </main>
  );
}
