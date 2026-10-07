import en from "../../messages/en.json";
import tr from "../../messages/tr.json";
import type { Locale } from "./config";

export const messagesByLocale = { en, tr } as const;

export type Messages = typeof en;

export function getMessages(locale: Locale): Messages {
  return messagesByLocale[locale];
}
