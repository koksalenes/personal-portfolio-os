"use client";

import { localeStorageKey } from "@/i18n/config";
import { createLocalStore } from "./store";

type Store<T> = ReturnType<typeof createLocalStore<T>>;
const stores = new Map<string, Store<unknown>>();

export function persistentStore<T>(key: string, fallback: T): Store<T> {
  let store = stores.get(key) as Store<T> | undefined;
  if (!store) {
    store = createLocalStore<T>(`ek-os:${key}`, fallback);
    stores.set(key, store as Store<unknown>);
  }
  return store;
}

export type SetPersistent<T> = (next: T | ((prev: T) => T)) => void;

export function usePersistent<T>(
  key: string,
  fallback: T,
): [T, SetPersistent<T>] {
  const store = persistentStore(key, fallback);
  const value = store.useValue();
  const set: SetPersistent<T> = (next) =>
    store.write(
      typeof next === "function"
        ? (next as (prev: T) => T)(store.read())
        : next,
    );
  return [value, set];
}

export type Offset = { x: number; y: number };
export const offsetsStore = persistentStore<Record<string, Offset>>(
  "offsets",
  {},
);

export const introStore = persistentStore("introPlayed", false);
export const starPromptStore = persistentStore("starPrompted", false);
export const scrollStore = persistentStore("scrollTop", 0);
export const wifiStore = persistentStore("wifi", {
  on: true,
  network: "",
});

export function resetPersistentState() {
  try {
    Object.keys(localStorage)
      .filter(
        (k) => k.startsWith("ek-") || k === "theme" || k === localeStorageKey,
      )
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // Storage blocked: nothing was persisted anyway.
  }
}

export const desktopPrefs = persistentStore("prefs", {
  showReminders: true,
  showMusic: true as boolean | undefined,
  dockMagnify: true,
});
