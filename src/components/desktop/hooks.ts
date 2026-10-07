"use client";

import { useSyncExternalStore } from "react";

function mediaStore(query: string) {
  return {
    subscribe(cb: () => void) {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    get: () => window.matchMedia(query).matches,
  };
}

const reduced = mediaStore("(prefers-reduced-motion: reduce)");

export function usePrefersReducedMotion() {
  return useSyncExternalStore(reduced.subscribe, reduced.get, () => false);
}

const noop = () => () => {};
const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|lighthouse|pagespeed|facebookexternalhit|embedly|whatsapp|telegram|discord/i;

export const isBotAgent = () => BOT_RE.test(navigator.userAgent);

export function useIsBot() {
  return useSyncExternalStore(
    noop,
    () => BOT_RE.test(navigator.userAgent),
    () => false,
  );
}

export const isCompact = () => window.matchMedia("(max-width: 767px)").matches;

export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

const phone = mediaStore("(max-width: 639px)");

export function usePhone() {
  return useSyncExternalStore(phone.subscribe, phone.get, () => false);
}

const compactQuery = mediaStore("(max-width: 767px)");

export function useCompact() {
  return useSyncExternalStore(
    compactQuery.subscribe,
    compactQuery.get,
    () => false,
  );
}

function subscribeResize(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

export function useViewport() {
  const width = useSyncExternalStore(
    subscribeResize,
    () => window.innerWidth,
    () => Infinity,
  );
  const height = useSyncExternalStore(
    subscribeResize,
    () => window.innerHeight,
    () => Infinity,
  );
  return { width, height };
}
