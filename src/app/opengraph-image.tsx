import LocaleImage from "@/app/[locale]/opengraph-image";
import { defaultLocale } from "@/i18n/config";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGFallbackImage() {
  return LocaleImage({ params: Promise.resolve({ locale: defaultLocale }) });
}
