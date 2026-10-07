<div align="center">

```
 ██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗      ██████╗ ███████╗
 ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗    ██╔═══██╗██╔════╝
 ██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║    ██║   ██║███████╗
 ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║    ██║   ██║╚════██║
 ██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝    ╚██████╔╝███████║
 ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝      ╚═════╝ ╚══════╝
```

### Personal Portfolio OS

**A portfolio that boots like an operating system.**
Lock screen · Dock · Windows · Terminal · Code Editor · Spotlight · Music · Settings

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Static Export](https://img.shields.io/badge/output-static-8b5cf6?style=flat-square)](#-shut-down--deploy)
[![License](https://img.shields.io/badge/License-Custom-22c55e?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/koksalenes/personal-portfolio-os?style=flat-square&logo=github)](https://github.com/koksalenes/personal-portfolio-os/stargazers)

**[▶ Boot the live system](https://eneskoksal.com)**

</div>

---

## 🖥 Boot sequence

```text
[    0.000000] Personal Portfolio OS — kernel: Next.js 16 / React 19
[    0.000412] Mounting /src/config/site.ts ......................... [  OK  ]
[    0.000873] Loading locale packs (en, tr) ........................ [  OK  ]
[    0.001204] Starting window manager .............................. [  OK  ]
[    0.001519] Starting dock, menu bar & spotlight .................. [  OK  ]
[    0.001988] Generating sitemap.xml, robots.txt, llms.txt ......... [  OK  ]
[    0.002301] Rendering Open Graph images .......................... [  OK  ]
[    0.002777] Reached target: Portfolio ............................ [  OK  ]

Welcome! Enter the password to unlock (hint is on the lock screen).
```

---

## 📟 `neofetch`

```text
        ▄▄▄▄▄▄▄▄▄        visitor@portfolio-os
      ▄█████████████▄    ─────────────────────
     ███▀▀▀▀▀▀▀▀▀▀███    OS:        Personal Portfolio OS
     ███  ▄▄▄  ▄▄ ███    Kernel:    Next.js 16 (App Router, static export)
     ███  ███  ██ ███    UI:        React 19 + Tailwind CSS v4
     ███▄▄▄▄▄▄▄▄▄▄███    Motion:    Framer Motion
      ▀█████████████▀    i18n:      next-intl (en, tr)
          ▄█████▄        Themes:    Dark / Light · 3 colour palettes
        ▀▀▀▀▀▀▀▀▀▀▀      Shell:     zsh-ish, built into the browser
                         Config:    src/config/site.ts + messages/*.json
```

---

## 🧩 Pre-installed applications

The site has two layers. The **portfolio** is a normal, SEO-friendly one-page site (Hero, About, Experience, Skills, Education, Contact). The **desktop shell** wraps it in a fake OS.

| App                | What it does                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| 🔒 **Lock Screen** | Boot, sleep, restart and shut down. The password hint is shown on screen.                       |
| 🌐 **Browser**     | Runs the portfolio itself, plus a fake search engine that lists your social profiles.           |
| 💻 **Terminal**    | An interactive shell with `whoami`, `experience`, `skills`, `neofetch`, `cat`, `docker`…        |
| 📝 **Code Editor** | A VS Code-style editor with a file tree, search, source control, extensions and a "Run" button. |
| 🔎 **Spotlight**   | `⌘K` / `Ctrl+K` to search apps, sections, files and commands.                                   |
| 🎵 **Music**       | A music player whose tracks are synthesized live in the browser, with a desktop widget.         |
| ⚙️ **Settings**    | Appearance, wallpaper, language, Wi-Fi, sound, dock and Docker settings.                        |
| ✅ **Reminders**   | A to-do widget on the desktop.                                                                  |
| 🐳 **Docker**      | A fake Docker Desktop. Running `deployment.sh` makes it crash the whole system. 💥              |
| 📱 **Phone mode**  | On small screens the shell switches to a phone home screen and status bar.                      |

Other system services:

- **i18n**: English and Turkish. The browser language is detected and the visitor's choice is remembered.
- **SEO**: per-locale metadata, JSON-LD `Person` schema, Open Graph images generated at build time, `sitemap.xml`, `robots.txt` and [`llms.txt`](https://llmstxt.org). All are generated from your config.
- **Static export**: `next build` writes plain HTML/CSS/JS to `out/`, so it runs on any static host.

---

## 💿 Installation

**System requirements:** Node.js 20+ and npm.

```bash
git clone https://github.com/koksalenes/personal-portfolio-os.git
cd personal-portfolio-os
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The system redirects to `/en` or `/tr` based on the browser language.

---

## ⚙️ System Preferences: make it yours

You never need to edit a component. Everything personal lives in **three places**:

```text
/
├── src/config/site.ts      ← identity, links, dates, skills, OS settings
├── messages/
│   ├── en.json             ← all English text
│   └── tr.json             ← all Turkish text
└── public/ + src/app/      ← photos, logo, favicons
```

### 1. `src/config/site.ts`: identity & settings

Each field is commented in the file.

| Field                               | Purpose                                                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `name`, `firstName`, `handle`       | Your full name, first name (used in greetings) and username (shown next to social links).                                               |
| `domain`, `url`, `email`            | Your domain, full URL (canonical URLs, sitemap, Open Graph) and contact email.                                                          |
| `country`, `timeZone`, `alumniOf`   | Used for JSON-LD and date formatting.                                                                                                   |
| `images`                            | Paths (relative to `public/`) of your logo, avatar and portrait.                                                                        |
| `socials`                           | `github`, `linkedin`, `freelancer`. **Remove a key to hide that platform everywhere** (hero, footer, contact, dock, terminal, search…). |
| `knowsAbout`                        | Topics for JSON-LD. The first six are also meta keywords.                                                                               |
| `lastModified`                      | `lastModified` date in `sitemap.xml`.                                                                                                   |
| `palette`                           | Default palette (`"orange"`, `"purple"` or `"charcoal"`) and whether visitors can switch it.                                            |
| `heroStack`, `heroStats`, `marquee` | Tech list in the hero/editor, the stat counters and the scrolling tech strip.                                                           |
| `aboutHighlights`                   | Cards in the About section (id + icon).                                                                                                 |
| `experiences`                       | Your jobs, newest first: `id`, `icon`, `start`/`end` (`"YYYY-MM"`, `end: null` = present) and an optional `href`.                       |
| `skillCategories`                   | Skill groups: `id`, grid size (`sm`/`md`/`lg`) and skills.                                                                              |
| `languages`                         | Spoken languages with a 0–100 progress bar value.                                                                                       |
| `os`                                | The OS itself: name and version, shell `user@host`, lock-screen password and Wi-Fi network name.                                        |

```ts
os: {
  name: "EnesOS",        // → "About EnesOS", "EnesOS Sessions" playlist, search engine…
  version: "1.0",
  user: "eneskoksal",    // → eneskoksal@192 ~ %
  host: "192",
  password: "hello",     // lock screen (shown as a hint, not a secret)
  wifi: "EnesNet-5G",
},
```

> The **years of experience** stat and each job's **date range** are calculated from `experiences[].start`/`end`. Overlapping jobs are counted only once.

Available icons for `experiences` and `aboutHighlights`: `monitor`, `code`, `globe`, `cpu`, `briefcase`, `sparkle`. See [Install new icons](#install-new-icons).

### 2. `messages/*.json`: language packs

All visible text lives here. The parts you will most likely edit:

| Key                      | Content                                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta.jobTitle`          | Your job title. Used in the page title, JSON-LD, OG image, terminal, "About this computer"…                                                                     |
| `meta.description`       | One-line description for search engines and social cards.                                                                                                       |
| `meta.keywords`          | Extra meta keywords.                                                                                                                                            |
| `hero.*`                 | Greeting, rotating roles (`rolesTyped`), tagline, stat labels (`stats.<id>` matches `heroStats[].id`).                                                          |
| `about.*`                | Title, lead, summary and highlight cards (`highlights.<id>` matches `aboutHighlights[].id`).                                                                    |
| `experience.items.<id>`  | `role`, `company`, `location`, `bullets`, optional `linkLabel`. `<id>` matches `experiences[].id`. `{name}` is replaced with your name.                         |
| `skills.categories.<id>` | Category titles, matching `skillCategories[].id`.                                                                                                               |
| `education.*`            | Degree, school, period, location, `languageList.<id>` (`name` + `level`, matching `languages[].id`) and certificates.                                           |
| `contact.*`              | Contact section copy.                                                                                                                                           |
| `desktop.script.lines`   | Output of the `quick-info.sh` desktop script. Placeholders: `{name}`, `{role}`, `{years}`, `{degree}`, `{school}`, `{email}`, `{github}`, `{linkedin}`, `{os}`. |
| `desktop.todo.items`     | Default reminders in the desktop widget.                                                                                                                        |

> Keep all language packs in sync. The message types are inferred from `en.json`.

### 3. Wallpapers & icons: images

| File                                  | Used for                                             |
| ------------------------------------- | ---------------------------------------------------- |
| `public/profile/profile-desktop.webp` | Hero portrait (≈ 898×788), Open Graph image, JSON-LD |
| `public/profile/profile-mobile.webp`  | Round avatar (mobile hero, lock screen)              |
| `public/logo/logo.png`                | Menu bar and search page logo                        |
| `src/app/icon.png`                    | Favicon                                              |
| `src/app/apple-icon.png`              | Apple touch icon                                     |
| `favicon.ico`                         | Legacy favicon                                       |

If you rename the files, update `site.images` too.

### 4. Before you ship

- [ ] `package.json`: change `name`.
- [ ] `LICENSE`: put your own name in it, or pick another licence for your fork.
- [ ] `public/_headers`: security and cache headers (Cloudflare Pages). Edit the CSP if you add analytics or external resources, and also the `<meta httpEquiv="Content-Security-Policy">` in `src/app/layout.tsx`.
- [ ] Replace every photo and all text with your own (see [License](#-license-agreement)).

---

## 🛠 Package manager: extending the system

### Add a job

1. Add an entry to `experiences` in `src/config/site.ts`:
   ```ts
   { id: "acme", icon: "code", start: "2027-01", end: null, href: "https://acme.com" },
   ```
2. Add its text under `experience.items.acme` in **every** `messages/*.json`:
   ```json
   "acme": {
     "role": "Senior Engineer",
     "company": "Acme Inc.",
     "location": "Berlin, Germany · Remote",
     "bullets": ["Did something great."],
     "linkLabel": "Visit website"
   }
   ```

Skill categories, about highlights, hero stats and languages work the same way: an `id` in the config and matching text in the language packs.

### Add a social platform

1. Add the key to the `SocialKey` type and to `socials` in `src/config/site.ts`.
2. Add an SVG icon component to `src/components/ui/icons.tsx`.
3. Add the platform's label, host, icon and colours to `platforms` in `src/lib/socials.ts`.
4. Add a search-result description under `desktop.searchEngine.<key>` in the language packs, and a fake URL path/title in `results` in `src/components/desktop/apps/SearchPage.tsx`.

### Install new icons

Add the icon component to `src/components/ui/icons.tsx`, add its name to the `IconName` type in `src/config/site.ts` and register it in `iconByName` at the bottom of `icons.tsx`.

### Install a language pack

1. Copy `messages/en.json` to `messages/<code>.json` and translate it.
2. Register it in `src/i18n/messages.ts` (`messagesByLocale`) and `src/i18n/config.ts` (`locales`).
3. Add its Open Graph locale (for example `de_DE`) to `ogLocales` in `src/app/[locale]/layout.tsx`.
4. Add its display name under `locale.<code>` in every language pack.

### Change the colour scheme

Palette accents live in `src/lib/data.ts` (`paletteAccents`) and `src/app/globals.css`. Pick the default with `site.palette.defaultPalette`.

---

## 🗂 File system

```text
src/
├── config/site.ts            # ⭐ All personal, non-translatable data
├── app/
│   ├── layout.tsx            # Root layout + default metadata
│   ├── [locale]/             # Per-locale page, metadata and OG image
│   ├── llms.txt/route.ts     # Generated llms.txt
│   ├── robots.ts             # Generated robots.txt
│   └── sitemap.ts            # Generated sitemap.xml
├── components/
│   ├── desktop/              # 🖥 The OS shell: windows, dock, menu bar, power, spotlight…
│   │   ├── apps/             #    Terminal, Settings, Music, Browser search, About…
│   │   └── editor/           #    The code editor app
│   ├── sections/             # Portfolio sections: Hero, About, Experience, Skills…
│   ├── layout/               # Header, Footer
│   ├── controls/             # Theme, locale and palette switchers
│   ├── providers/            # Context providers
│   └── ui/                   # Shared UI and icons
├── i18n/                     # Locale list, message loader, next-intl config
└── lib/
    ├── data.ts               # Derived data (experience years, periods) + palette tokens
    └── socials.ts            # Social platform definitions
messages/
├── en.json                   # ⭐ English language pack
└── tr.json                   # ⭐ Turkish language pack
```

---

## ⌨️ Terminal: available commands

### Development

```console
$ npm run dev            # start the development server
$ npm run build          # static production build → out/
$ npm run start          # start the production server
$ npm run lint           # run ESLint
$ npm run lint:fix       # run ESLint with auto-fix
$ npm run format         # format with Prettier
$ npm run format:check   # check formatting (CI)
$ npm run analyze        # build with the bundle analyzer
```

### Inside the OS

Open the Terminal app on the desktop and try:

```console
user@host ~ % help
user@host ~ % whoami
user@host ~ % neofetch
user@host ~ % experience
user@host ~ % cat README.md
user@host ~ % open editor
user@host ~ % docker ps
user@host ~ % theme light
user@host ~ % sudo rm -rf /     # go on, try it 😉
```

---

## ⏻ Shut down & deploy

The project uses `output: "export"`, so `npm run build` creates a fully static site in `out/`.

| Host                 | Settings                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Cloudflare Pages** | Build command `npm run build`, output directory `out`. `public/_headers` applies automatically. |
| **Any static host**  | Upload the contents of `out/` (GitHub Pages, Netlify, Vercel, S3, nginx…).                      |

---

## 📜 License agreement

```text
By using this software you agree to the following:

  [✓] The source code and design are free to use for your own portfolio.
  [✗] The personal content is NOT. You may not reuse the photos, biography,
      work history or any other text or media that identifies the original
      author. Replace all of it with your own before you publish.
```

See [LICENSE](LICENSE) for the full terms.

---

<div align="center">

**If this system booted a smile, consider giving it a ⭐**

[Report a bug](https://github.com/koksalenes/personal-portfolio-os/issues) · [Request a feature](https://github.com/koksalenes/personal-portfolio-os/issues) · [Live demo](https://eneskoksal.com)

<sub>Personal Portfolio OS · Built by [Enes Köksal](https://eneskoksal.com)</sub>

</div>
