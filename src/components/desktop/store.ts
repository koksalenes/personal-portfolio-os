"use client";

import { useSyncExternalStore } from "react";

export function createLocalStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let memory: T | undefined;

  const read = (): T => {
    if (memory !== undefined) return memory;
    let value = fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw) value = JSON.parse(raw) as T;
    } catch {
      // Private mode or blocked storage: keep the fallback.
    }
    memory = value;
    return value;
  };

  const write = (value: T) => {
    memory = value;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore; the in-memory value still updates the UI.
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const readServer = () => fallback;
  const useValue = () => useSyncExternalStore(subscribe, read, readServer);

  return { useValue, read, write };
}

export type IconPosition = { right: number; top: number };

export const iconPositions = createLocalStore<Record<string, IconPosition>>(
  "ek-desktop-icons",
  {},
);

export const wallpapers = ["aurora", "sunset", "ocean", "graphite"] as const;
export type Wallpaper = (typeof wallpapers)[number];

export const wallpaperStore = createLocalStore<Wallpaper>(
  "ek-wallpaper",
  "aurora",
);

export type Todo = {
  id: string;
  key?: string;
  text?: string;
  due: string | null;
  done: boolean;
};

export const isoDay = (offsetDays: number, from = new Date()) => {
  const d = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate() + offsetDays,
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const daysToNextWeekEnd = () => {
  const day = new Date().getDay();
  return ((5 - day + 7) % 7) + 7;
};

const defaultTodos = (): Todo[] => [
  { id: "d1", key: "launch", due: isoDay(-1), done: true },
  { id: "d2", key: "coffee", due: isoDay(0), done: false },
  { id: "d3", key: "app", due: isoDay(2), done: false },
  { id: "d4", key: "proposal", due: isoDay(4), done: false },
  { id: "d5", key: "blog", due: isoDay(daysToNextWeekEnd()), done: false },
];

export const todoStore = createLocalStore<Todo[]>("ek-todos", defaultTodos());

export type SiteView = "os" | "text";

export const viewStore = createLocalStore<SiteView>("ek-view", "os");
