import { site } from "@/config/site";
import { defaultLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { experiences, formatPeriod, skillCategories } from "@/lib/data";
import { socialLinks } from "@/lib/socials";

export const dynamic = "force-static";

export function GET() {
  const m = getMessages(defaultLocale);
  const items = m.experience.items as Record<
    string,
    { role: string; company: string; bullets: string[]; linkLabel?: string }
  >;
  const categories = m.skills.categories as Record<string, string>;
  const languageList = m.education.languageList as Record<
    string,
    { name: string; level: string }
  >;

  const lines = [
    `# ${site.name}`,
    "",
    `> ${m.meta.description}`,
    "",
    m.about.summary,
    "",
    "## Experience",
    "",
    ...experiences.map((exp) => {
      const item = items[exp.id];
      const company = item.company.replace("{name}", site.name);
      const period = formatPeriod(exp, defaultLocale, m.experience.present);
      const link = exp.href ? ` ${exp.href}` : "";
      return `- ${item.role} at ${company} (${period}): ${item.bullets.join(" ")}${link}`;
    }),
    "",
    "## Education",
    "",
    `- ${m.education.degree}, ${m.education.school} (${m.education.period})`,
    "",
    "## Core Skills",
    "",
    ...skillCategories.map(
      (c) => `- ${categories[c.id] ?? c.id}: ${c.skills.join(", ")}`,
    ),
    "",
    "## Languages",
    "",
    ...site.languages.map(
      (l) => `- ${languageList[l.id].name}: ${languageList[l.id].level}`,
    ),
    "",
    "## Contact",
    "",
    `- Email: ${site.email}`,
    ...socialLinks.map((s) => `- ${s.label}: ${s.href}`),
    `- Website: ${site.url}`,
    "",
    "## Pages",
    "",
    `- [Full portfolio](${site.url}/${defaultLocale}): Complete portfolio with experience, skills, and contact info.`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
