"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { GraduationCap, Globe, MapPin, Award } from "@/components/ui/icons";
import { site } from "@/config/site";

const languages = site.languages;

export function Education() {
  const t = useTranslations("education");

  return (
    <section
      id="education"
      className="border-border bg-surface/30 relative border-y"
    >
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <SectionHeading index="04" label={t("label")} title={t("title")} />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Reveal>
            <div className="border-border bg-surface/60 relative h-full overflow-hidden rounded-3xl border p-7">
              <span className="bg-accent-soft text-accent grid h-12 w-12 place-items-center rounded-xl">
                <GraduationCap className="h-6 w-6" />
              </span>
              <h3 className="font-display mt-5 text-xl font-semibold">
                {t("degree")}
              </h3>
              <p className="text-accent mt-1 font-medium">{t("school")}</p>
              <p className="text-muted mt-3 font-mono text-xs">{t("period")}</p>
              <p className="text-faint mt-1 flex items-center gap-1 text-xs">
                <MapPin className="h-3.5 w-3.5" />
                {t("location")}
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="border-border bg-surface/60 h-full rounded-3xl border p-7">
              <span className="bg-accent-soft text-accent grid h-12 w-12 place-items-center rounded-xl">
                <Globe className="h-6 w-6" />
              </span>
              <h3 className="font-display mt-5 text-lg font-semibold">
                {t("languages")}
              </h3>
              <div className="mt-5 space-y-5">
                {languages.map((lang) => (
                  <div key={lang.id}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium">
                        {t(`languageList.${lang.id}.name`)}
                      </span>
                      <span className="text-muted font-mono text-xs">
                        {t(`languageList.${lang.id}.level`)}
                      </span>
                    </div>
                    <div className="bg-background mt-2 h-1.5 overflow-hidden rounded-full">
                      <m.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${lang.value}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1,
                          ease: [0.22, 1, 0.36, 1] as const,
                        }}
                        className="bg-accent h-full rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.16} className="md:col-span-2 lg:col-span-1">
            <div
              id="certificates"
              className="border-border bg-surface/60 h-full scroll-mt-24 rounded-3xl border p-7"
            >
              <span className="bg-accent-soft text-accent grid h-12 w-12 place-items-center rounded-xl">
                <Award className="h-6 w-6" />
              </span>
              <h3 className="font-display mt-5 text-lg font-semibold">
                {t("certificates.title")}
              </h3>
              <div className="mt-5 space-y-4">
                {(
                  t.raw("certificates.items") as Array<{
                    name: string;
                    issuer: string;
                    date: string;
                    credentialId: string;
                    url: string;
                  }>
                ).map((cert) => (
                  <a
                    key={cert.credentialId}
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-border hover:border-accent group block border-l-2 pl-3 transition-colors"
                  >
                    <p className="group-hover:text-accent text-sm leading-snug font-medium transition-colors">
                      {cert.name}
                    </p>
                    <p className="text-accent mt-0.5 font-mono text-xs font-medium">
                      {cert.issuer}
                    </p>
                    <p className="text-muted mt-0.5 font-mono text-xs">
                      {cert.date} · ID {cert.credentialId}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
