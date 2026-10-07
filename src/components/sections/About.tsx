"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { iconByName } from "@/components/ui/icons";
import { site } from "@/config/site";

const highlightConfig = site.aboutHighlights.map(({ id, icon }) => ({
  id,
  Icon: iconByName[icon],
}));

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function About() {
  const t = useTranslations("about");

  return (
    <section
      id="about"
      className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32"
    >
      <SectionHeading index="01" label={t("label")} title={t("title")} />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <Reveal>
            <p className="font-display text-xl leading-snug font-medium sm:text-2xl">
              {t("lead")}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-muted text-base leading-relaxed sm:text-lg">
              {t("summary")}
            </p>
          </Reveal>
        </div>

        <RevealGroup className="grid gap-4 sm:grid-cols-1">
          {highlightConfig.map(({ id, Icon }) => (
            <m.div
              key={id}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              className="group border-border bg-surface/60 hover:border-accent/50 relative overflow-hidden rounded-2xl border p-6 transition-colors"
            >
              <div className="dotted-bg absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="flex items-start gap-4">
                <span className="bg-accent-soft text-accent grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">
                    {t(`highlights.${id}.title`)}
                  </h3>
                  <p className="text-muted mt-1 text-sm leading-relaxed">
                    {t(`highlights.${id}.desc`)}
                  </p>
                </div>
              </div>
            </m.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
