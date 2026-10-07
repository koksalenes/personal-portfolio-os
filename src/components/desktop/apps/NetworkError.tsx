"use client";

import { useTranslations } from "next-intl";
import { Wifi } from "@/components/ui/icons";
import { site } from "@/config/site";

export function NetworkError({ onTurnOn }: Readonly<{ onTurnOn: () => void }>) {
  const t = useTranslations("desktop.offline");
  return (
    <div
      role="alert"
      className="bg-background absolute inset-0 z-[70] grid place-items-center overflow-y-auto px-6 py-10"
    >
      <div className="max-w-md text-center">
        <span className="bg-foreground/5 text-faint relative mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full">
          <Wifi className="h-10 w-10" />
          <span className="absolute h-0.5 w-16 rotate-45 rounded-full bg-red-500" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted mt-3 text-sm leading-relaxed">
          {t("body", { domain: site.domain })}
        </p>
        <ul className="text-muted mt-4 list-disc space-y-1 pl-5 text-left text-sm">
          <li>{t("tip1")}</li>
          <li>{t("tip2")}</li>
        </ul>
        <p className="text-faint mt-4 font-mono text-[11px]">
          ERR_INTERNET_DISCONNECTED
        </p>
        <button
          type="button"
          onClick={onTurnOn}
          className="mt-6 rounded-full bg-[#2f6fe4] px-5 py-2 text-sm font-semibold text-white"
        >
          {t("turnOn")}
        </button>
      </div>
    </div>
  );
}
