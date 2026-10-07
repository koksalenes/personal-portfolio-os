"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { shellPrompt, site } from "@/config/site";
import { getExperienceYears } from "@/lib/data";
import { cn } from "@/lib/cn";
import { Window, type WindowControls } from "../Window";
import { TerminalTitle } from "./TerminalTitle";

const CHARS_PER_MS = 0.09;
const START_DELAY_MS = 450;
const LINE_PAUSE = 10;

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

export type ScriptKind = "info" | "deploy";

export function ScriptRunner({
  controls,
  fileName,
  kind = "info",
  onClose,
  onCrash,
}: Readonly<{
  controls: WindowControls;
  fileName: string;
  kind?: ScriptKind;
  onClose: () => void;
  onCrash?: () => void;
}>) {
  const t = useTranslations();
  const td = useTranslations("desktop.script");
  const tDeploy = useTranslations("desktop.deploy");
  const values = {
    name: site.name,
    role: t("meta.jobTitle"),
    years: getExperienceYears(),
    school: t("education.school"),
    degree: t("education.degree"),
    email: site.email,
    ...site.socials,
    os: site.os.name,
  };
  const command = `sh ~/Desktop/${fileName}`;
  const lines = [
    command,
    ...(
      (kind === "deploy" ? tDeploy.raw("lines") : td.raw("lines")) as string[]
    ).map((l) => fill(l, values)),
  ];
  const total = lines.reduce((n, l) => n + l.length + LINE_PAUSE, 0);

  const [typed, setTyped] = useState(0);
  const progress = useRef(-START_DELAY_MS * CHARS_PER_MS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const done = typed >= total;
  const { vis, focused } = controls;

  useEffect(() => {
    if (done) return;
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      if (last) progress.current += (now - last) * CHARS_PER_MS;
      last = now;
      const n = Math.max(0, Math.min(total, Math.floor(progress.current)));
      setTyped(n);
      if (n < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done, total]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [typed]);

  const advance = () => {
    if (!done) {
      progress.current = total;
      setTyped(total);
    } else if (kind !== "deploy") onClose();
  };
  const advanceFromKey = useEffectEvent(advance);

  const crash = useEffectEvent(() => onCrash?.());
  useEffect(() => {
    if (!done || kind !== "deploy") return;
    const id = setTimeout(() => crash(), 1400);
    return () => clearTimeout(id);
  }, [done, kind]);

  useEffect(() => {
    if (vis !== "open" || !focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      e.stopPropagation();
      advanceFromKey();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [vis, focused]);

  let budget = typed;
  const shown: Array<{ text: string; caret: boolean }> = [];
  for (const line of lines) {
    if (budget <= 0) break;
    const visible = line.slice(0, budget);
    budget -= line.length + LINE_PAUSE;
    shown.push({ text: visible, caret: budget < 0 });
  }

  return (
    <Window
      id="script"
      label={fileName}
      controls={controls}
      animateIn
      titleBar={<TerminalTitle folder="Desktop" process={`sh ${fileName}`} />}
    >
      <div
        ref={scrollRef}
        onClick={advance}
        className="text-foreground/90 min-h-0 flex-1 cursor-text overflow-y-auto bg-[color-mix(in_srgb,var(--surface)_70%,black)] p-3 font-mono text-[12px] leading-5 sm:text-[13px]"
      >
        <p className="text-faint" suppressHydrationWarning>
          Last login: {new Date().toDateString()} on ttys002
        </p>
        {shown.map(({ text, caret }, i) => (
          <p key={i} className="min-h-5 break-words whitespace-pre-wrap">
            {i === 0 && (
              <span className="text-(--syn-string)">{shellPrompt} </span>
            )}
            {i === 0 ? (
              <span className="text-foreground">{text}</span>
            ) : (
              <span
                className={cn(
                  text.startsWith("FATAL") && "font-bold text-(--syn-error)",
                  text.includes("⚠") && "text-(--syn-tag)",
                  text.includes("✔") && "text-(--syn-string)",
                )}
              >
                {text}
              </span>
            )}
            {caret && (
              <span className="bg-accent animate-caret ml-px inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em]" />
            )}
          </p>
        ))}
        {done && kind === "deploy" && (
          <p className="animate-pulse text-(--syn-error)">{tDeploy("panic")}</p>
        )}
        {done && kind !== "deploy" && (
          <>
            <p className="min-h-5" />
            <p className="text-faint">[{td("finished")}]</p>
            <p className="text-accent">
              {td("pressKey")}
              <span className="bg-accent animate-caret ml-1 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em]" />
            </p>
          </>
        )}
      </div>
    </Window>
  );
}
