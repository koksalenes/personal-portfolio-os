"use client";

import { useTranslations } from "next-intl";
import { site } from "@/config/site";
import { getExperienceYears, heroStack } from "@/lib/data";
import { openRepo, repoUrl } from "@/lib/socials";
import { Github } from "@/components/ui/icons";
import type { OsActions } from "../actions";
import { OsMark } from "../Power";
import { Window, type WindowControls } from "../Window";

export function AboutApp({
  controls,
  actions,
}: Readonly<{ controls: WindowControls; actions: OsActions }>) {
  const t = useTranslations("desktop.aboutWin");
  const td = useTranslations("desktop");
  const tm = useTranslations("meta");

  const rows: Array<[string, string]> = [
    [t("owner"), site.name],
    [t("role"), tm("jobTitle")],
    [t("experience"), t("years", { n: getExperienceYears() })],
    [t("stack"), heroStack.slice(0, 4).join(" · ")],
    [t("serial"), site.handle.toUpperCase()],
  ];

  return (
    <Window
      id="about"
      label={td("menu.aboutOs", { os: site.os.name })}
      controls={controls}
      titleBar={null}
    >
      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 pt-4 pb-6 text-center">
        <span className="bg-foreground text-background grid h-24 w-24 place-items-center rounded-[22px] shadow-lg">
          <OsMark className="h-16 w-16" />
        </span>
        <h2 className="font-display mt-4 text-2xl font-bold tracking-tight">
          {site.os.name}
        </h2>
        <p className="text-faint text-xs">
          {t("version", { version: site.os.version })}
        </p>
        <dl className="mt-5 grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-left text-xs">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-right font-semibold">{k}</dt>
              <dd className="text-muted truncate">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => actions.goTo("about")}
            className="border-border hover:border-accent rounded-md border px-3 py-1.5 text-xs font-medium"
          >
            {t("moreInfo")}
          </button>
          <button
            type="button"
            onClick={() => actions.goTo("contact")}
            className="bg-accent text-on-accent rounded-md px-3 py-1.5 text-xs font-semibold"
          >
            {t("contact")}
          </button>
        </div>
        {repoUrl && (
          <div className="border-border mt-6 w-full rounded-lg border p-3 text-xs">
            <p className="text-muted">
              {t("openSource", { os: site.os.name })}
            </p>
            <div className="mt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => openRepo()}
                className="bg-foreground text-background inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold"
              >
                <Github className="h-3.5 w-3.5" />
                {t("star")} ⭐
              </button>
              <button
                type="button"
                onClick={() => openRepo("/generate")}
                className="border-border hover:border-accent rounded-md border px-3 py-1.5 font-medium"
              >
                {t("template")}
              </button>
            </div>
          </div>
        )}
        <p className="text-faint mt-auto pt-6 text-[10px]">
          ™ & © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </Window>
  );
}
