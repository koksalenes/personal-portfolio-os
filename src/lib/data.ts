import { site } from "@/config/site";

export type Palette = "orange" | "purple" | "charcoal";

export const paletteConfig = site.palette;

export const paletteAccents: Record<
  Palette,
  { accent: string; accent2: string; accentBorder: string }
> = {
  orange: {
    accent: "#ff7840",
    accent2: "#4d6fff",
    accentBorder: "rgba(255,120,64,0.35)",
  },
  purple: {
    accent: "#8b6bff",
    accent2: "#34d9f5",
    accentBorder: "rgba(139,107,255,0.35)",
  },
  charcoal: {
    accent: "#c6ff00",
    accent2: "#00e5c6",
    accentBorder: "rgba(198,255,0,0.35)",
  },
};

export type Experience = (typeof site.experiences)[number];
export type ExperienceId = Experience["id"];

export const experiences = site.experiences;
export const skillCategories = site.skillCategories;
export const heroStack = site.heroStack;
export const heroStats = site.heroStats;

export const socials = { email: site.email, ...site.socials } as const;

const parseMonth = (value: string) => {
  const [y, m] = value.split("-").map(Number);
  return new Date(y, m - 1);
};

const startOfMonth = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth());

export function formatPeriod(
  exp: Pick<Experience, "start" | "end">,
  locale: string,
  presentLabel: string,
) {
  const fmt = new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: site.timeZone,
  });
  const start = fmt.format(parseMonth(exp.start));
  const end = exp.end ? fmt.format(parseMonth(exp.end)) : presentLabel;
  return `${start} - ${end}`;
}

function countUniqueExperienceMonths(): number {
  const ranges: Array<[Date, Date]> = experiences.map((e) => [
    parseMonth(e.start),
    e.end ? parseMonth(e.end) : startOfMonth(),
  ]);

  ranges.sort((a, b) => a[0].getTime() - b[0].getTime());

  const merged: Array<[Date, Date]> = [];
  for (const [start, end] of ranges) {
    const last = merged.at(-1);
    if (!last || start.getTime() > last[1].getTime()) {
      merged.push([start, end]);
    } else if (end.getTime() > last[1].getTime()) {
      last[1] = end;
    }
  }

  return merged.reduce((total, [start, end]) => {
    return (
      total +
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth())
    );
  }, 0);
}

export function getExperienceYears(): number {
  return Math.floor(countUniqueExperienceMonths() / 12);
}
