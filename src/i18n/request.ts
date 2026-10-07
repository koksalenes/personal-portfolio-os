import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale } from "./config";
import { getMessages } from "./messages";
import { site } from "@/config/site";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: getMessages(locale),
    timeZone: site.timeZone,
  };
});
