import type { Locale } from "@/i18n/config";
import type { Wallpaper } from "./store";
import type { WindowId } from "./Window";

export const sectionIds = [
  "top",
  "about",
  "experience",
  "skills",
  "education",
  "contact",
] as const;
export type SectionId = (typeof sectionIds)[number];

export type OsActions = {
  open: (id: WindowId) => void;
  close: (id: WindowId) => void;
  openFile: (path: string) => void;
  goTo: (section: SectionId) => void;
  setTheme: (theme: "dark" | "light" | "system") => void;
  toggleTheme: () => void;
  setWallpaper: (wallpaper: Wallpaper) => void;
  nextWallpaper: () => void;
  copyEmail: () => void;
  replayIntro: () => void;
  spotlight: () => void;
  lock: () => void;
  sleep: () => void;
  restart: () => void;
  shutDown: () => void;
  setLocale: (locale: Locale) => void;
  resetAll: () => void;
};
