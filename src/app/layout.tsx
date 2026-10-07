import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { paletteConfig } from "@/lib/data";
import { site } from "@/config/site";
import { defaultLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

const meta = getMessages(defaultLocale).meta;
const title = `${site.name} - ${meta.jobTitle}`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s - ${site.name}`,
  },
  description: `${site.name} - ${meta.description}`,
  keywords: [
    ...new Set([site.name, ...meta.keywords, ...site.knowsAbout.slice(0, 6)]),
  ],
  authors: [{ name: site.name, url: site.url }],
  openGraph: {
    type: "website",
    title,
    description: meta.description,
    url: site.url,
    siteName: site.name,
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#07070a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={defaultLocale}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <noscript>
          <style>{`*,*::before,*::after{opacity:1!important;transform:none!important;filter:none!important;animation:none!important;transition:none!important}`}</style>
        </noscript>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; object-src 'none'; base-uri 'self'; form-action 'self'"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem('ek-palette')||'${paletteConfig.defaultPalette}';if(p!=='orange')document.documentElement.dataset.palette=p}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
