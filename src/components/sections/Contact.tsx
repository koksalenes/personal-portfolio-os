"use client";

import { m } from "framer-motion";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowUpRight, Check, Copy, Mail } from "@/components/ui/icons";
import { socials } from "@/lib/data";
import { socialLinks } from "@/lib/socials";
import { site } from "@/config/site";

export function Contact() {
  const t = useTranslations("contact");
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText(socials.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section
      id="contact"
      className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="border-border bg-surface/60 relative overflow-hidden rounded-[2rem] border p-8 sm:p-14">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="dotted-bg absolute inset-0 opacity-50" />
        </div>

        <div className="max-w-2xl">
          <Reveal>
            <span className="mono-label">{t("label")}</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              {t("title")}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-muted mt-4 text-base sm:text-lg">{t("text")}</p>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="border-border bg-background/40 mt-8 overflow-hidden rounded-2xl border">
              <div className="border-border flex items-center gap-3 border-b px-5 py-4">
                <Mail className="text-accent h-4 w-4 shrink-0" />
                <span className="font-mono text-sm font-medium sm:text-base">
                  {socials.email}
                </span>
              </div>
              <div className="divide-border grid grid-cols-2 divide-x">
                <m.a
                  href={`mailto:${socials.email}`}
                  whileHover={{ y: -1 }}
                  className="group hover:bg-accent-soft flex items-center justify-center gap-2 px-4 py-3.5 transition-colors"
                >
                  <ArrowUpRight className="text-muted group-hover:text-accent h-4 w-4 transition-colors" />
                  <span className="text-muted group-hover:text-accent text-sm font-medium transition-colors">
                    {t("sendEmail")}
                  </span>
                </m.a>
                <m.button
                  onClick={copyEmail}
                  whileHover={{ y: -1 }}
                  className="group hover:bg-accent-soft flex items-center justify-center gap-2 px-4 py-3.5 transition-colors"
                  aria-label="Copy email"
                >
                  {copied ? (
                    <Check className="text-accent h-4 w-4 shrink-0" />
                  ) : (
                    <Copy className="text-muted group-hover:text-accent h-4 w-4 shrink-0 transition-colors" />
                  )}
                  <span
                    className={`text-sm font-medium transition-colors ${
                      copied
                        ? "text-accent"
                        : "text-muted group-hover:text-accent"
                    }`}
                  >
                    {copied ? t("copied") : t("copyEmail")}
                  </span>
                </m.button>
              </div>
            </div>
          </Reveal>
        </div>

        {socialLinks.length > 0 && (
          <Reveal delay={0.2}>
            <div className="border-border mt-10 border-t pt-8">
              <p className="mono-label mb-4">{t("socials")}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {socialLinks.map(({ key, href, Icon, label }) => (
                  <a
                    key={key}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group border-border bg-background/40 hover:border-accent/50 hover:bg-accent-soft flex items-center justify-between rounded-2xl border px-5 py-4 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="text-muted group-hover:text-accent h-5 w-5 transition-colors" />
                      <span className="font-mono text-sm">{site.handle}</span>
                    </span>
                    <ArrowUpRight className="text-faint group-hover:text-accent h-4 w-4 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
