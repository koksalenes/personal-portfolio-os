"use client";

import { m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { site } from "@/config/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  ArrowDown,
  ArrowUpRight,
  iconByName,
  MapPin,
} from "@/components/ui/icons";
import { experiences, formatPeriod } from "@/lib/data";

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Experience() {
  const t = useTranslations("experience");
  const locale = useLocale();

  return (
    <section
      id="experience"
      className="border-border bg-surface/30 relative border-y"
    >
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <SectionHeading index="02" label={t("label")} title={t("title")} />

        <div className="relative mt-14">
          <span
            aria-hidden
            className="bg-accent/20 absolute top-2 bottom-2 left-[19px] w-px sm:left-[27px]"
          />

          <m.ol
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="space-y-4"
          >
            {experiences.map((exp) => {
              const role = t(`items.${exp.id}.role`);
              const company = t(`items.${exp.id}.company`, { name: site.name });
              const period = formatPeriod(exp, locale, t("present"));
              const location = t(`items.${exp.id}.location`);
              const bullets = t.raw(`items.${exp.id}.bullets`) as string[];
              const Icon = iconByName[exp.icon];

              return (
                <m.li
                  key={exp.id}
                  variants={itemVariants}
                  className="relative pl-12 sm:pl-20"
                >
                  <span
                    className="text-accent border-accent bg-background absolute top-1 left-0 grid h-10 w-10 place-items-center rounded-full border sm:h-14 sm:w-14"
                    style={{ boxShadow: "0 0 0 4px var(--background)" }}
                  >
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                  </span>

                  <m.div
                    whileHover={{ y: -3 }}
                    className="group border-border bg-surface/70 hover:border-accent/40 hover:bg-surface relative overflow-hidden rounded-2xl border p-5 transition-colors sm:p-7"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-display text-lg leading-tight font-semibold sm:text-xl">
                          {role}
                        </h3>
                        <p className="text-accent text-sm font-medium">
                          {company}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-muted font-mono text-xs">{period}</p>
                        <p className="text-faint mt-1 flex items-center gap-1 text-xs sm:justify-end">
                          <MapPin className="h-3.5 w-3.5" />
                          {location}
                        </p>
                      </div>
                    </div>

                    <ul className="mt-5 space-y-2.5">
                      {bullets.map((b) => (
                        <li
                          key={b}
                          className="text-muted flex gap-3 text-sm leading-relaxed"
                        >
                          <ArrowUpRight
                            className="text-accent mt-0.5 h-4 w-4 shrink-0"
                            aria-hidden
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    {exp.href && (
                      <a
                        href={exp.href}
                        {...(!exp.href.startsWith("#") && {
                          target: "_blank",
                          rel: "noreferrer noopener",
                        })}
                        className="text-accent mt-4 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                      >
                        {t(`items.${exp.id}.linkLabel`)}
                        {exp.href.startsWith("#") ? (
                          <ArrowDown className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </a>
                    )}
                  </m.div>
                </m.li>
              );
            })}
          </m.ol>
        </div>
      </div>
    </section>
  );
}
