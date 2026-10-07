"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, m, useScroll } from "framer-motion";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/controls/ThemeToggle";
import { LocaleSwitcher } from "@/components/controls/LocaleSwitcher";
import { PaletteSwitcher } from "@/components/controls/PaletteSwitcher";
import { ScrollContainerContext } from "@/components/desktop/context";
import { cn } from "@/lib/cn";
import { site } from "@/config/site";

const sections = [
  "about",
  "experience",
  "skills",
  "education",
  "contact",
] as const;

export function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const container = useContext(ScrollContainerContext);
  const inDesktop = container !== undefined;
  const containerRef = useMemo(
    () => ({ current: container ?? null }),
    [container],
  );
  const { scrollYProgress } = useScroll(
    container ? { container: containerRef } : undefined,
  );

  useEffect(() => {
    const el = container;
    const target: HTMLElement | Window = el ?? window;
    const onScroll = () =>
      setScrolled((el ? el.scrollTop : window.scrollY) > 24);
    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [container]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn("inset-x-0 top-0 z-50", inDesktop ? "sticky h-0" : "fixed")}
    >
      <m.div
        style={{ scaleX: scrollYProgress }}
        className="bg-accent absolute inset-x-0 top-0 h-0.5 origin-left"
      />
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between px-5 transition-all duration-300 sm:px-8",
          scrolled ? "my-2.5" : "my-4",
        )}
      >
        <a
          href="#top"
          aria-label={site.domain}
          className="group flex min-w-0 items-center gap-2 rounded-full px-1 transition-all"
        >
          <span className="text-accent font-mono text-sm font-medium tracking-tight">
            {site.domain}
          </span>
        </a>

        <nav
          className={cn(
            "border-border hidden items-center gap-1 rounded-full border px-2 py-1.5 text-sm md:flex",
            scrolled ? "glass shadow-sm" : "bg-surface/40",
          )}
        >
          {sections.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-muted hover:bg-accent-soft hover:text-foreground rounded-full px-3.5 py-1.5 transition-colors"
            >
              {t(id)}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className={cn(inDesktop && "hidden min-[420px]:block")}>
            <LocaleSwitcher />
          </div>
          <PaletteSwitcher />
          <ThemeToggle />
          <button
            type="button"
            aria-label={t("menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="border-border bg-surface/60 relative grid h-10 w-10 place-items-center rounded-full border md:hidden"
          >
            <span className="relative block h-3.5 w-5">
              <m.span
                animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="bg-foreground absolute top-0 left-0 h-0.5 w-5"
              />
              <m.span
                animate={open ? { opacity: 0 } : { opacity: 1 }}
                className="bg-foreground absolute top-1.5 left-0 h-0.5 w-5"
              />
              <m.span
                animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="bg-foreground absolute top-3 left-0 h-0.5 w-5"
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "border-border mx-4 overflow-hidden rounded-2xl border p-2 shadow-xl md:hidden",
              inDesktop ? "bg-surface" : "glass",
            )}
          >
            {sections.map((id, i) => (
              <m.a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="text-foreground hover:bg-accent-soft flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium"
              >
                <span>{t(id)}</span>
                <span className="text-faint font-mono text-xs">0{i + 1}</span>
              </m.a>
            ))}
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
