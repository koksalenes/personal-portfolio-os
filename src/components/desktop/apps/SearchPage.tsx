"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "@/components/ui/icons";
import { site, type SocialKey } from "@/config/site";
import { socialLinks } from "@/lib/socials";
import type { SectionId } from "../actions";

export const searchUrl = (q: string) =>
  `search.${site.os.name.toLowerCase()}.app/?q=${encodeURIComponent(q).replace(/%20/g, "+")}`;

export function SearchPage({
  query,
  onQuery,
  onOpenSite,
}: Readonly<{
  query: string;
  onQuery: (q: string) => void;
  onOpenSite: (section: SectionId) => void;
}>) {
  const t = useTranslations("desktop.searchEngine");
  const tNav = useTranslations("nav");
  const tm = useTranslations("meta");
  const [draft, setDraft] = useState(query);
  const role = tm("jobTitle");

  const results: Record<SocialKey, { path: string; title: string }> = {
    linkedin: {
      path: `in › ${site.handle}`,
      title: `${site.name} - ${role} - LinkedIn`,
    },
    github: {
      path: site.handle,
      title: `${site.handle} (${site.name}) · GitHub`,
    },
    freelancer: {
      path: `u › ${site.handle}`,
      title: `${site.name} | ${role} | Freelancer`,
    },
  };

  const external = socialLinks.map(({ key, href, host, Icon, badge }) => ({
    href,
    host,
    Icon,
    tile: badge,
    ...results[key],
    body: t(key, { name: site.name, role }),
  }));

  const sitelinks: Array<[SectionId, string]> = [
    ["about", tNav("about")],
    ["experience", tNav("experience")],
    ["skills", tNav("skills")],
    ["contact", tNav("contact")],
  ];

  return (
    <div className="bg-background absolute inset-0 z-[60] overflow-y-auto">
      <header className="border-border flex flex-wrap items-center gap-x-6 gap-y-3 border-b px-5 py-4 sm:px-8">
        <p className="font-display text-xl font-bold tracking-tight">
          {site.os.name}
          <span className="text-accent"> {t("brand")}</span>
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onQuery(draft.trim() || site.domain);
          }}
          className="border-border bg-surface flex w-full max-w-xl items-center gap-3 rounded-full border px-4 py-2 shadow-sm"
        >
          <Search className="text-faint h-4 w-4" />
          <label htmlFor="os-search" className="sr-only">
            {t("brand")}
          </label>
          <input
            id="os-search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="os-plain min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </form>
      </header>

      <div className="max-w-2xl px-5 py-5 sm:px-8">
        <p className="text-faint mb-5 text-xs">
          {t("stats", { n: external.length + 1, q: query })}
        </p>

        <article className="mb-7">
          <button
            type="button"
            onClick={() => onOpenSite("top")}
            className="group text-left"
          >
            <span className="flex items-center gap-2.5">
              <Image
                src={site.images.logo}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
              />
              <span className="text-xs leading-tight">
                <span className="block">{site.name}</span>
                <span className="text-faint block">{site.url}</span>
              </span>
            </span>
            <span className="mt-1.5 block text-lg text-[#5b8def] group-hover:underline">
              {site.name} - {role}
            </span>
          </button>
          <p className="text-muted mt-1 text-sm leading-relaxed">
            {tm("description")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:pl-4">
            {sitelinks.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onOpenSite(id)}
                className="text-left text-sm text-[#5b8def] hover:underline"
              >
                {label}
              </button>
            ))}
          </div>
        </article>

        {external.map(({ href, host, path, title, body, Icon, tile }) => (
          <article key={href} className="mb-7">
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="group block"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full ${tile}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs leading-tight">
                  <span className="block">{host}</span>
                  <span className="text-faint block">
                    https://{host} › {path}
                  </span>
                </span>
              </span>
              <span className="mt-1.5 block text-lg text-[#5b8def] group-hover:underline">
                {title}
              </span>
            </a>
            <p className="text-muted mt-1 text-sm leading-relaxed">{body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
