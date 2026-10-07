import type { ComponentType, SVGProps } from "react";
import { Freelancer, Github, Linkedin } from "@/components/ui/icons";
import { site, type SocialKey } from "@/config/site";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const platforms: Record<
  SocialKey,
  {
    label: string;
    host: string;
    Icon: Icon;
    tile: string;
    badge: string;
  }
> = {
  github: {
    label: "GitHub",
    host: "github.com",
    Icon: Github,
    tile: "bg-gradient-to-b from-[#3a3f47] to-[#15181d] text-white",
    badge: "bg-[#181717] text-white",
  },
  linkedin: {
    label: "LinkedIn",
    host: "linkedin.com",
    Icon: Linkedin,
    tile: "bg-gradient-to-b from-[#1c8ae6] to-[#0a5cb0] text-white",
    badge: "bg-[#0a66c2] text-white",
  },
  freelancer: {
    label: "Freelancer",
    host: "freelancer.com",
    Icon: Freelancer,
    tile: "bg-gradient-to-b from-[#4cc4ff] to-[#1a8fd6] text-white",
    badge: "bg-[#29b2fe] text-white",
  },
};

export type SocialLink = (typeof platforms)[SocialKey] & {
  key: SocialKey;
  href: string;
};

export const socialLinks: SocialLink[] = (
  Object.entries(site.socials) as Array<[SocialKey, string | undefined]>
)
  .filter(([key, href]) => href && key in platforms)
  .map(([key, href]) => ({ key, href: href!, ...platforms[key] }));

export const isSocialKey = (value: string): value is SocialKey =>
  socialLinks.some((s) => s.key === value);

export const socialHref = (key: SocialKey) => site.socials[key];

export const repoUrl = site.repo || null;
export const repoName = repoUrl?.replace(/^https?:\/\/(www\.)?/, "") ?? "";

export const openRepo = (path: "" | "/generate" = "") => {
  if (repoUrl) window.open(`${repoUrl}${path}`, "_blank", "noopener");
};
