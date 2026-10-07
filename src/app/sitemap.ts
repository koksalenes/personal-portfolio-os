import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { site } from "@/config/site";

export const dynamic = "force-static";

const BASE_URL = site.url;
const LAST_MODIFIED = new Date(site.lastModified);

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly",
    priority: 1,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}`]),
      ),
    },
  }));
}
