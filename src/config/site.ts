import type { Palette } from "@/lib/data";

export type SocialKey = "github" | "linkedin" | "freelancer";

export type IconName =
  | "monitor"
  | "code"
  | "globe"
  | "cpu"
  | "briefcase"
  | "sparkle"
  | "rocket";

type Month = `${number}-${number}`;

export const site = {
  name: "Enes Köksal",
  firstName: "Enes",
  handle: "koksalenes",
  domain: "eneskoksal.com",
  url: "https://eneskoksal.com",
  email: "contact@eneskoksal.com",
  country: "TR",
  timeZone: "Europe/Istanbul",
  alumniOf: "Bursa Technical University",

  images: {
    logo: "/logo/logo.png",
    avatar: "/profile/profile-mobile.webp",
    portrait: "/profile/profile-desktop.webp",
    jsonLd: "/profile/profile-desktop.webp",
  },

  socials: {
    github: "https://github.com/koksalenes",
    linkedin: "https://linkedin.com/in/koksalenes",
    freelancer: "https://freelancer.com/u/koksalenes",
  } as Partial<Record<SocialKey, string>>,

  repo: "https://github.com/koksalenes/personal-portfolio-os" as string,

  knowsAbout: [
    "C#",
    ".NET",
    "Node.js",
    "NestJS",
    "TypeScript",
    "Java",
    "Spring Boot",
    "Python",
    "React",
    "Next.js",
    "Flutter",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Docker",
    "Microservices",
  ],
  lastModified: "2026-10-30",

  palette: {
    defaultPalette: "charcoal" as Palette,
    showSwitcher: false,
  },

  heroStack: [
    ".NET",
    "C#",
    "TypeScript",
    "Node.js",
    "NestJS",
    "Next.js",
    "React",
    "PostgreSQL",
  ],
  heroStats: [
    { id: "experience", value: null, suffix: "+" },
    { id: "clients", value: "20", suffix: "+" },
    { id: "satisfaction", value: "100", suffix: "%" },
  ] as Array<{ id: string; value: string | null; suffix: string }>,

  aboutHighlights: [
    { id: "fullstack", icon: "globe" },
    { id: "architecture", icon: "briefcase" },
    { id: "responsibility", icon: "sparkle" },
  ] as Array<{ id: string; icon: IconName }>,

  experiences: [
    {
      id: "subtello",
      icon: "sparkle",
      start: "2026-06",
      end: null,
      href: "https://subtello.com",
    },
    { id: "octopus", icon: "monitor", start: "2026-04", end: "2026-09" },
    { id: "founder", icon: "code", start: "2025-05", end: "2026-09" },
    {
      id: "freelancer",
      icon: "globe",
      start: "2024-07",
      end: "2025-05",
      href: "https://freelancer.com/u/koksalenes",
    },
    {
      id: "tofas",
      icon: "cpu",
      start: "2023-07",
      end: "2024-07",
      href: "https://www.knime.com/success-story/how-tofas-automated-quality-control-and-predictive-maintenance-with-knime",
    },
    {
      id: "teknofest",
      icon: "rocket",
      start: "2021-10",
      end: "2023-07",
      href: "#certificates",
    },
  ] as Array<{
    id: string;
    icon: IconName;
    start: Month;
    end: Month | null;
    href?: string;
  }>,

  skillCategories: [
    {
      id: "technologies",
      span: "lg",
      skills: [
        "C#",
        ".NET(ASP.NET Core)",
        "TypeScript",
        "JavaScript",
        "Java",
        "Python",
        "Node.js",
        "NestJS",
        "Spring Boot",
        "React",
        "Next.js",
        "Astro",
        "Redux Toolkit",
        "Zustand",
        "TanStack Query",
        "Tailwind CSS",
        "Flutter",
      ],
    },
    {
      id: "architecture",
      span: "md",
      skills: [
        "Clean Architecture",
        "Microservices",
        "Modular Monolith",
        "CQRS",
        "Event Sourcing",
        "Saga Pattern",
        "Outbox Pattern",
        "Event-Driven",
        "OOP / SOLID",
        "RESTful APIs",
        "gRPC",
        "OAuth2 / OIDC",
        "JWT",
        "IdP Integration",
      ],
    },
    {
      id: "data",
      span: "md",
      skills: [
        "SQL",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "RabbitMQ",
        "Entity Framework Core",
        "Dapper",
        "Prisma",
        "Drizzle",
      ],
    },
    {
      id: "devtools",
      span: "sm",
      skills: [
        "Docker",
        "CI/CD",
        "GitHub Actions",
        "Postman",
        "Swagger / OpenAPI",
        "Sentry",
        "SonarQube",
        "AI Coding Agents",
      ],
    },
    {
      id: "collaboration",
      span: "sm",
      skills: ["Agile/Scrum", "Git", "Code Review", "Technical Documentation"],
    },
  ] as Array<{ id: string; span: "sm" | "md" | "lg"; skills: string[] }>,

  languages: [
    { id: "turkish", value: 100 },
    { id: "english", value: 55 },
  ],

  os: {
    name: "EnesOS",
    version: "1.0",
    user: "eneskoksal",
    host: "192",
    password: "hello",
    wifi: "EnesNet-5G",
  },
} as const;

export const sameAs = Object.values(site.socials).filter(Boolean) as string[];

export const shellPrompt = `${site.os.user}@${site.os.host} ~ %`;

export const absoluteUrl = (path = "") => `${site.url}${path}`;

export const personJsonLd = (meta: {
  jobTitle: string;
  description: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  image: absoluteUrl(site.images.jsonLd),
  email: site.email,
  jobTitle: meta.jobTitle,
  description: meta.description,
  sameAs,
  knowsAbout: site.knowsAbout,
  address: { "@type": "PostalAddress", addressCountry: site.country },
  alumniOf: { "@type": "CollegeOrUniversity", name: site.alumniOf },
});
