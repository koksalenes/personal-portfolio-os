"use client";

import { useTranslations } from "next-intl";
import { Mail } from "@/components/ui/icons";
import { socials } from "@/lib/data";
import { socialLinks } from "@/lib/socials";
import { site } from "@/config/site";

export function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("contact");
  const year = new Date().getFullYear();

  const links = [
    { href: `mailto:${socials.email}`, label: "Email", Icon: Mail },
    ...socialLinks,
  ];

  return (
    <footer className="border-border bg-surface/40 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <p className="font-medium">{site.name}</p>
            <p className="text-faint">
              © {year} · {t("rights")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {links.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              title={label}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
              className="border-border text-muted hover:border-accent hover:text-accent grid h-10 w-10 place-items-center rounded-full border transition-colors"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          ))}
        </div>
      </div>
      <div className="border-border border-t">
        <p className="text-faint mx-auto max-w-6xl px-5 py-4 text-center font-mono text-xs sm:px-8">
          {tc("emailLabel")}: {socials.email}
        </p>
      </div>
    </footer>
  );
}
