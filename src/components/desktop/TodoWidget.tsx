"use client";

import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Close } from "@/components/ui/icons";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { isoDay, todoStore, type Todo } from "./store";

const dueChoices = [
  { id: "today", days: 0 },
  { id: "tomorrow", days: 1 },
  { id: "inThreeDays", days: 3 },
  { id: "nextWeek", days: 7 },
  { id: "none", days: null },
] as const;

const dayDiff = (iso: string) => {
  const [y, mo, d] = iso.split("-").map(Number);
  const due = new Date(y, mo - 1, d).getTime();
  const today = new Date(new Date().toDateString()).getTime();
  return Math.round((due - today) / 86_400_000);
};

export function TodoWidget({
  className,
  compact = false,
}: Readonly<{
  className?: string;
  compact?: boolean;
}>) {
  const t = useTranslations("desktop.todo");
  const locale = useLocale() === "tr" ? "tr-TR" : "en-US";
  const todos = todoStore.useValue();
  const [text, setText] = useState("");
  const [due, setDue] = useState<(typeof dueChoices)[number]["id"]>("tomorrow");

  const dueLabel = (iso: string) => {
    const diff = dayDiff(iso);
    const date = new Date(`${iso}T12:00:00`);
    const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(
      date,
    );
    if (diff < 0) return t("overdue");
    if (diff === 0) return t("today");
    if (diff === 1) return t("tomorrow");
    if (diff < 7 - new Date().getDay() || diff < 2) return weekday;
    if (diff < 14) return t("nextWeekday", { weekday });
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const update = (next: Todo[]) => todoStore.write(next);
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    const days = dueChoices.find((c) => c.id === due)?.days ?? null;
    update([
      ...todos,
      {
        id: `u${Date.now()}`,
        text: value.slice(0, 80),
        due: days === null ? null : isoDay(days),
        done: false,
      },
    ]);
    setText("");
  };

  const open = todos.filter((x) => !x.done).length;
  const sorted = [...todos].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      (a.due ?? "9").localeCompare(b.due ?? "9"),
  );

  return (
    <section
      aria-label={t("title")}
      onPointerDown={(e) => e.stopPropagation()}
      data-context="widget:reminders"
      className={cn(
        "flex flex-col rounded-2xl border border-white/20 bg-white/70 text-neutral-900 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-2xl dark:bg-neutral-900/60 dark:text-white",
        compact ? "p-3" : "p-3.5",
        className ??
          "absolute top-10 left-5 z-[5] w-[min(290px,calc(100%-120px))]",
      )}
    >
      <header
        className={cn(
          "flex shrink-0 items-baseline justify-between",
          compact ? "mb-1" : "mb-2",
        )}
      >
        <h2 className="text-[15px] font-bold text-[#f59e0b]">{t("title")}</h2>
        <span className="text-xl font-bold tabular-nums">{open}</span>
      </header>

      <ul
        className={cn(
          "[scrollbar-width:none] space-y-0.5 overflow-y-auto [&::-webkit-scrollbar]:hidden",
          compact ? "min-h-0 flex-1" : "max-h-60",
        )}
      >
        <AnimatePresence initial={false}>
          {sorted.map((todo) => {
            const label = todo.key
              ? t(`items.${todo.key}`, { os: site.os.name })
              : todo.text;
            const overdue = todo.due && !todo.done && dayDiff(todo.due) < 0;
            return (
              <m.li
                key={todo.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={cn(
                  "group flex items-start gap-2.5 rounded-lg px-1",
                  compact ? "py-0.5" : "py-1",
                )}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={todo.done}
                  aria-label={label}
                  onClick={() =>
                    update(
                      todos.map((x) =>
                        x.id === todo.id ? { ...x, done: !x.done } : x,
                      ),
                    )
                  }
                  className={cn(
                    "mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2 text-[10px] text-white transition-colors",
                    todo.done
                      ? "border-[#f59e0b] bg-[#f59e0b]"
                      : "border-black/30 dark:border-white/40",
                  )}
                >
                  {todo.done && "✓"}
                </button>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[13px] leading-snug",
                      compact && "truncate",
                      todo.done && "line-through opacity-45",
                    )}
                  >
                    {label}
                    {compact && todo.due && (
                      <span
                        suppressHydrationWarning
                        className={cn(
                          "ml-1.5 text-[11px]",
                          overdue ? "text-red-500" : "opacity-55",
                        )}
                      >
                        · {dueLabel(todo.due)}
                      </span>
                    )}
                  </span>
                  {todo.due && !compact && (
                    <span
                      suppressHydrationWarning
                      className={cn(
                        "block text-[11px]",
                        overdue ? "text-red-500" : "opacity-55",
                        todo.done && "opacity-35",
                      )}
                    >
                      {t("due", { when: dueLabel(todo.due) })}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  aria-label={t("remove")}
                  onClick={() => update(todos.filter((x) => x.id !== todo.id))}
                  className={cn(
                    "mt-0.5 transition-opacity hover:!opacity-100 focus-visible:opacity-100",
                    compact ? "opacity-40" : "opacity-0 group-hover:opacity-50",
                  )}
                >
                  <Close className="h-3.5 w-3.5" />
                </button>
              </m.li>
            );
          })}
        </AnimatePresence>
        {todos.length === 0 && (
          <li className="py-3 text-center text-xs opacity-60">{t("empty")}</li>
        )}
      </ul>

      <form
        onSubmit={add}
        className={cn(
          "mt-2 shrink-0 border-t border-black/10 pt-2 dark:border-white/10",
          compact && "flex items-center gap-2",
        )}
      >
        <label htmlFor="todo-input" className="sr-only">
          {t("placeholder")}
        </label>
        <input
          id="todo-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("placeholder")}
          maxLength={80}
          className="os-plain w-full min-w-0 bg-transparent py-1 text-[13px] outline-none placeholder:opacity-50"
        />
        <div
          className={cn("flex shrink-0 items-center gap-2", !compact && "mt-1")}
        >
          <label
            htmlFor="todo-due"
            className={cn("text-[11px] opacity-60", compact && "sr-only")}
          >
            {t("dueLabel")}
          </label>
          <select
            id="todo-due"
            value={due}
            onChange={(e) => setDue(e.target.value as typeof due)}
            className={cn(
              "os-plain min-w-0 rounded-md bg-black/5 px-1.5 py-0.5 text-[11px] outline-none dark:bg-white/10",
              compact ? "w-24" : "flex-1",
            )}
          >
            {dueChoices.map((c) => (
              <option key={c.id} value={c.id}>
                {t(`choices.${c.id}`)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!text.trim()}
            className="rounded-md bg-[#f59e0b] px-2.5 py-0.5 text-[11px] font-semibold text-white disabled:opacity-40"
          >
            {t("add")}
          </button>
        </div>
      </form>
    </section>
  );
}
