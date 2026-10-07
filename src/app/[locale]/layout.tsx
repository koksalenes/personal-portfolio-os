import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { HtmlLang } from "@/components/providers/HtmlLang";
import { defaultLocale, isLocale, locales, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { site } from "@/config/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const siteUrl = site.url;

const ogLocales: Record<Locale, string> = { en: "en_US", tr: "tr_TR" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = isLocale(requested) ? requested : defaultLocale;
  const { meta } = getMessages(locale);
  const title = `${site.name} - ${meta.jobTitle}`;
  const canonical = `${siteUrl}/${locale}`;

  return {
    title: { absolute: title },
    description: meta.description,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}`])),
        "x-default": `${siteUrl}/${defaultLocale}`,
      },
    },
    openGraph: {
      title,
      description: meta.description,
      url: canonical,
      locale: ogLocales[locale],
      alternateLocale: locales
        .filter((l) => l !== locale)
        .map((l) => ogLocales[l]),
    },
  };
}

export const dynamicParams = false;

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={getMessages(locale)}
      timeZone={site.timeZone}
    >
      <HtmlLang locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
