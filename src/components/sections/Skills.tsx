"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { skillCategories } from "@/lib/data";
import { cn } from "@/lib/cn";

const allSkills = skillCategories.flatMap((category) => category.skills);

const chunkSize = Math.ceil(allSkills.length / 4);
const rows = [
  allSkills.slice(0, chunkSize),
  allSkills.slice(chunkSize, chunkSize * 2),
  allSkills.slice(chunkSize * 2, chunkSize * 3),
  allSkills.slice(chunkSize * 3),
];

function SkillChip({ label }: Readonly<{ label: string }>) {
  return (
    <li className="border-border bg-surface/70 text-foreground/90 hover:border-accent hover:text-accent flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors">
      <span className="bg-accent h-1.5 w-1.5 rounded-full" />
      {label}
    </li>
  );
}

function MarqueeRow({
  items,
  reverse,
  duration,
}: Readonly<{
  items: string[];
  reverse?: boolean;
  duration: string;
}>) {
  const doubled = [...items, ...items];
  return (
    <div
      className="flex overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
      }}
    >
      <ul
        className={cn(
          "flex w-max shrink-0 items-center gap-3 pr-3",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
        )}
        style={{ "--marquee-duration": duration } as React.CSSProperties}
      >
        {doubled.map((skill, i) => (
          <SkillChip key={`${skill}-${i}`} label={skill} />
        ))}
      </ul>
    </div>
  );
}

export function Skills() {
  const t = useTranslations("skills");

  return (
    <section
      id="skills"
      className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32"
    >
      <SectionHeading index="03" label={t("label")} title={t("title")} />

      <div className="marquee-pause mt-12 flex flex-col gap-4">
        <MarqueeRow items={rows[0]} duration="46s" />
        <MarqueeRow items={rows[1]} reverse duration="40s" />
        <MarqueeRow items={rows[2]} duration="50s" />
        <MarqueeRow items={rows[3]} reverse duration="44s" />
      </div>
    </section>
  );
}
