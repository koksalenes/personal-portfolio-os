import type { SVGProps } from "react";
import type { IconName } from "@/config/site";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export function ArrowUpRight(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function ArrowRight(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowDown(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

export function Sun(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
    </svg>
  );
}

export function Moon(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export function Github(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

export function Linkedin(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Mail(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

export function Briefcase(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export function Globe(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" />
    </svg>
  );
}

export function Sparkle(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v4m0 10v4m9-9h-4M7 12H3m13.5-6.5-2.8 2.8m-5.4 5.4-2.8 2.8m11-0-2.8-2.8m-5.4-5.4L5.5 5.5" />
    </svg>
  );
}

export function MapPin(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function GraduationCap(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5" />
    </svg>
  );
}

export function Code(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="m9 8-5 4 5 4m6-8 5 4-5 4" />
    </svg>
  );
}

export function Monitor(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8m-4-4v4" />
    </svg>
  );
}

export function Cpu(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
    </svg>
  );
}

export function Rocket(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2 0-2.7a2 2 0 0 0-3 0Z" />
      <path d="M12 15 9 12c1-4 4-8 10-9 1 6-3 9-7 10Z" />
      <path d="M9 12H5s.5-2.7 2-4c1.3-1 4 0 4 0m1 3v4s2.7-.5 4-2c1.5-1.3 0-4 0-4" />
    </svg>
  );
}

export function Copy(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function Check(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Award(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="6" />
      <path d="M9 14.5 8 21l4-2 4 2-1-6.5" />
    </svg>
  );
}

export function Freelancer(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" stroke="none" {...props}>
      <path d="m18.78 5.464 2.203 3.067L32 5.464H18.78ZM7.334 29.464l5.954-5.867-3.586-3.899-2.368 9.766ZM17.891 5.464l-3.19 2.9 5.362.2-2.172-3.1ZM5.492 5.464 6.643 7.83l6.314.4-7.465-2.767ZM8.88 17.73l4.67-8.767L0 8.23l8.88 9.5ZM9.406 18.296l4.407 4.767 4.866-4.8 1.513-8.933-5.918-.333-4.868 9.3Z" />
    </svg>
  );
}

export function Lock(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

export function Reload(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" />
    </svg>
  );
}

export function ChevronLeft(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

export function ChevronRight(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function Play(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}

export function Pause(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M8 5v14M16 5v14" strokeWidth={3} />
    </svg>
  );
}

export function Files(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7z" />
      <path d="M14 3v4h4M9 21h8a2 2 0 0 0 2-2V9" />
    </svg>
  );
}

export function Search(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  );
}

export function GitBranch(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="7" r="2" />
      <path d="M6 7v10M18 9c0 5-6 4-11.5 8.5" />
    </svg>
  );
}

export function Blocks(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
      <rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1.5"
        transform="rotate(12 17.5 6.5)"
      />
    </svg>
  );
}

export function Settings(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

export function Wifi(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M2 8.8a15 15 0 0 1 20 0M5 12.4a10 10 0 0 1 14 0M8.5 15.9a5 5 0 0 1 7 0" />
      <circle cx="12" cy="19.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function Battery(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="7" width="18" height="10" rx="2.5" />
      <rect
        x="4"
        y="9"
        width="11"
        height="6"
        rx="1"
        fill="currentColor"
        stroke="none"
      />
      <path d="M22 11v2" />
    </svg>
  );
}

export function Compass(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" fill="currentColor" />
    </svg>
  );
}

export function Close(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function Terminal(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="m5 7 5 5-5 5M12 18h7" />
    </svg>
  );
}

export function Power(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v8M6.3 6.3a8 8 0 1 0 11.4 0" />
    </svg>
  );
}

export function Folder(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path
        d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        fill="currentColor"
        fillOpacity="0.25"
      />
    </svg>
  );
}

export function SkipBack(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M18 6v12l-9-6z" fill="currentColor" />
      <path d="M6 6v12" strokeWidth={2.4} />
    </svg>
  );
}

export function SkipForward(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6v12l9-6z" fill="currentColor" />
      <path d="M18 6v12" strokeWidth={2.4} />
    </svg>
  );
}

export function Volume(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 10v4h4l5 4V6L8 10z" fill="currentColor" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

export function Music(props: Readonly<IconProps>) {
  return (
    <svg {...base} {...props}>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" fill="currentColor" />
      <circle cx="17" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}

export function Whale(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        d="M2.5 11.5h18c.4-1 1.2-1.6 2.2-1.6-.2-.9-.9-1.5-1.8-1.6-.3-.9-1-1.5-1.8-1.6-.3.8-.2 1.8.3 2.5-.6.3-1.2.3-1.8.3H2.5c-.3 3.4 1.5 6.9 6.9 6.9 4.4 0 7.7-2 9.3-5.3"
        opacity="0.95"
      />
      <rect x="4" y="8.3" width="2.2" height="2.2" rx=".3" />
      <rect x="6.8" y="8.3" width="2.2" height="2.2" rx=".3" />
      <rect x="9.6" y="8.3" width="2.2" height="2.2" rx=".3" />
      <rect x="12.4" y="8.3" width="2.2" height="2.2" rx=".3" />
      <rect x="6.8" y="5.5" width="2.2" height="2.2" rx=".3" />
      <rect x="9.6" y="5.5" width="2.2" height="2.2" rx=".3" />
      <rect x="9.6" y="2.7" width="2.2" height="2.2" rx=".3" />
    </svg>
  );
}

export const iconByName: Record<
  IconName,
  (props: Readonly<IconProps>) => React.JSX.Element
> = {
  monitor: Monitor,
  code: Code,
  globe: Globe,
  cpu: Cpu,
  briefcase: Briefcase,
  sparkle: Sparkle,
  rocket: Rocket,
};
