import { ImageResponse } from "next/og";
import {
  heroStats,
  getExperienceYears,
  paletteConfig,
  paletteAccents,
} from "@/lib/data";
import { getMessages } from "@/i18n/messages";
import { site } from "@/config/site";
import { locales, type Locale } from "@/i18n/config";
import path from "node:path";
import sharp from "sharp";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function hexToRgb(hex: string) {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const msgs = getMessages(locale as Locale);
  const h = msgs.hero;

  const { accent, accent2 } = paletteAccents[paletteConfig.defaultPalette];

  const accentRgb = hexToRgb(accent);
  const accent2Rgb = hexToRgb(accent2);

  const stats = heroStats.map((s) => ({
    value: `${s.value ?? getExperienceYears()}${s.suffix}`,
    label: h.stats[s.id as keyof typeof h.stats],
  }));

  const profileBuf = await sharp(
    path.join(process.cwd(), `public${site.images.portrait}`),
  )
    .jpeg({ quality: 90 })
    .toBuffer();
  const profileSrc = `data:image/jpeg;base64,${profileBuf.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        background: "#07070a",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "64px 72px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "sans-serif",
        gap: 56,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${accentRgb},0.4) 0%, transparent 65%)`,
          filter: "blur(70px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${accent2Rgb},0.28) 0%, transparent 65%)`,
          filter: "blur(70px)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
        }}
      >
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 14,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#a0a0ad",
            margin: 0,
            marginBottom: 16,
          }}
        >
          {h.greeting}
        </p>
        <h1
          style={{
            fontSize: 76,
            fontWeight: 700,
            color: "#f3f3f6",
            margin: 0,
            lineHeight: 0.92,
            letterSpacing: "-3px",
          }}
        >
          {site.name}
        </h1>
        <p
          style={{
            fontSize: 34,
            fontWeight: 600,
            color: accent,
            letterSpacing: "-0.5px",
            margin: 0,
            marginTop: 18,
          }}
        >
          {msgs.meta.jobTitle}
        </p>
        <p
          style={{
            fontSize: 17,
            color: "#8a8a96",
            lineHeight: 1.55,
            maxWidth: 560,
            margin: 0,
            marginTop: 20,
          }}
        >
          {h.tagline}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginTop: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#f3f3f6",
              color: "#07070a",
              borderRadius: 999,
              padding: "10px 24px",
              fontSize: 15,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {h.ctaContact} →
          </div>
          <div
            style={{
              display: "flex",
              gap: 28,
              paddingLeft: 24,
              borderLeft: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: accent,
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </span>
                <span style={{ fontSize: 12, color: "#8a8a96" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 14,
            color: `rgba(${accentRgb},0.55)`,
            letterSpacing: "0.08em",
            margin: 0,
            marginTop: 32,
          }}
        >
          {site.domain}
        </p>
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -16,
            borderRadius: "1.5rem",
            background: `radial-gradient(circle, rgba(${accentRgb},0.35) 0%, transparent 70%)`,
            filter: "blur(32px)",
          }}
        />
        <img
          src={profileSrc}
          alt={site.name}
          width={320}
          height={420}
          style={{
            position: "relative",
            width: 320,
            height: 420,
            objectFit: "cover",
            borderRadius: "1.5rem",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        />
      </div>
    </div>,
    { ...size },
  );
}
