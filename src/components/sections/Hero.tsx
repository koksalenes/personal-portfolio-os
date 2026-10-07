"use client";

import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { AnimatePresence, m, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight, Mail } from "@/components/ui/icons";
import { SiteLaunchContext } from "@/components/desktop/context";
import { site } from "@/config/site";
import { getExperienceYears, heroStats, socials } from "@/lib/data";
import { socialLinks } from "@/lib/socials";

function RotatingRole({ roles }: Readonly<{ roles: string[] }>) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % roles.length), 2600);
    return () => clearInterval(id);
  }, [roles.length]);

  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      {roles.map((role) => (
        <span
          key={role}
          aria-hidden="true"
          className="invisible col-start-1 row-start-1"
        >
          {role}
        </span>
      ))}
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={i}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
          className="text-accent col-start-1 row-start-1"
        >
          {roles[i]}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

const ease = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.15 + delay, ease },
  }),
};

const pop: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay: 0.15 + delay, ease },
  }),
};

export function Hero() {
  const t = useTranslations("hero");
  const roles = t.raw("rolesTyped") as string[];
  const launch = useContext(SiteLaunchContext);

  return (
    <section
      id="top"
      className="relative flex min-h-[100cqh] items-center overflow-hidden pt-28 pb-16"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="grid-bg absolute inset-0 opacity-70" />
      </div>

      <m.div
        key={launch}
        initial={launch === 0 ? false : "hidden"}
        animate="show"
        className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]"
      >
        <div>
          <div className="flex items-start gap-4 lg:block">
            <div className="min-w-0 flex-1">
              <m.p variants={rise} custom={0.05} className="mono-label mb-3">
                {t("greeting")}
              </m.p>

              <m.h1
                variants={rise}
                custom={0.1}
                className="font-display text-5xl leading-[0.95] font-bold tracking-tight sm:text-6xl lg:text-7xl"
              >
                {site.name}
              </m.h1>

              <m.div
                variants={rise}
                custom={0.18}
                className="font-display mt-3 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
              >
                <RotatingRole roles={roles} />
              </m.div>
            </div>
            <m.div
              variants={pop}
              custom={0.15}
              className="mt-1 shrink-0 lg:hidden"
            >
              <div className="border-border-strong bg-surface relative h-24 w-24 overflow-hidden rounded-full border-2 shadow-lg sm:h-28 sm:w-28">
                <Image
                  src={site.images.avatar}
                  alt={site.name}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </m.div>
          </div>

          <m.p
            variants={rise}
            custom={0.26}
            className="text-muted mt-6 max-w-xl text-lg leading-relaxed sm:text-xl"
          >
            {t("tagline")}
          </m.p>

          <m.div
            variants={rise}
            custom={0.34}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="#contact"
              className="group bg-foreground text-background inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            >
              {t("ctaContact")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#experience"
              className="group border-border-strong hover:border-accent hover:text-accent inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
            >
              {t("ctaWork")}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <div className="ml-1 flex items-center gap-1.5">
              {[
                { href: `mailto:${socials.email}`, Icon: Mail, label: "Email" },
                ...socialLinks,
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    href.startsWith("http") ? "noreferrer noopener" : undefined
                  }
                  className="border-border text-muted hover:border-accent hover:text-accent grid h-10 w-10 place-items-center rounded-full border transition-colors"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </m.div>
          <m.dl
            variants={rise}
            custom={0.42}
            className="border-border mt-10 grid max-w-md grid-cols-3 gap-4 border-t pt-6"
          >
            {heroStats.map((s) => (
              <div key={s.id}>
                <dt
                  className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
                  suppressHydrationWarning
                >
                  {s.value ?? getExperienceYears()}
                  <span className="text-accent">{s.suffix}</span>
                </dt>
                <dd className="text-faint mt-1 text-xs leading-snug">
                  {t(`stats.${s.id}`)}
                </dd>
              </div>
            ))}
          </m.dl>
        </div>
        <m.div
          variants={pop}
          custom={0.2}
          className="relative mx-auto hidden w-full max-w-sm lg:block"
        >
          <div className="border-border-strong bg-surface relative overflow-hidden rounded-[2rem] border shadow-2xl">
            <Image
              src={site.images.portrait}
              alt={site.name}
              width={898}
              height={788}
              priority
              className="h-auto w-full object-cover"
            />
            <div className="from-foreground/20 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
          </div>
        </m.div>
      </m.div>
    </section>
  );
}
