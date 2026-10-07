"use client";

import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export function SectionHeading({
  index,
  label,
  title,
  align = "left",
}: {
  index: string;
  label: string;
  title: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
      )}
    >
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="text-accent font-mono text-sm font-medium">
            {index}
          </span>
          <span className="bg-border-strong h-px w-8" />
          <span className="mono-label">{label}</span>
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="font-display max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h2>
      </Reveal>
    </div>
  );
}
