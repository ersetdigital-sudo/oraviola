import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SITE } from "@/data/site";

const dmSans = localFont({
  src: [
    { path: "./fonts/dmsans-regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/dmsans-medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/dmsans-bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

const bricolage = localFont({
  src: [
    {
      path: "./fonts/bricolagegrotesque-opsz-wdth-wght--regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/bricolagegrotesque-opsz-wdth-wght--medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/bricolagegrotesque-opsz-wdth-wght--semibold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/bricolagegrotesque-opsz-wdth-wght--bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/bricolagegrotesque-opsz-wdth-wght--extrabold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Bayar & Isi Ulang Digital, Tenang dan Cepat`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "isi pulsa",
    "top up e-wallet",
    "token PLN",
    "top up game",
    "bayar BPJS",
    "bayar PDAM",
    "paket data",
    "pembayaran digital",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Bayar & Isi Ulang Digital, Tenang dan Cepat`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Bayar & Isi Ulang Digital`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#07130F",
  colorScheme: "dark",
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/images/orraviola-logo.png`,
  description: SITE.description,
  areaServed: "ID",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    areaServed: "ID",
    availableLanguage: ["id"],
    telephone: SITE.waNumber || undefined,
    email: SITE.email || undefined,
  },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  inLanguage: "id-ID",
  publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE.url}/cek?id={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${dmSans.variable} ${bricolage.variable}`}>
      <body className="min-h-screen bg-bg text-txt antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-lime focus:px-4 focus:py-2 focus:font-bold focus:text-bg"
        >
          Lewati ke konten
        </a>

        <Header />

        <div id="main">{children}</div>

        <Footer />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </body>
    </html>
  );
}
