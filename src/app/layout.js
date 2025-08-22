// src/app/layout.js  (ou page.js se você chamou diferente)
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";                       // ⬅️ novo
import HideLayoutWrapper from "@/components/HideLayoutWrapper";
import { churchInfo } from "@/lib/churchInfo";
import { AuthProvider } from "@/lib/firebase/AuthContext";
import "@/globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID || "766585979212640";

/* --------- metadata export continua igual --------- */
export const metadata = {
  metadataBase: new URL("https://adsantamariars.com.br"),
  title: churchInfo.name,
  description: churchInfo.description,
  icons: {
    icon: churchInfo.faviconUrl,
    apple: churchInfo.appleTouchIconUrl,
  },
  alternates: {
    canonical: "/",          // https://adsantamariars.com.br/
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: churchInfo.name,
    title: churchInfo.name,
    description: churchInfo.description,
    images: [{ url: churchInfo.ogImageUrl }],
  },
  twitter: {
    card: "summary_large_image",
    title: churchInfo.name,
    description: churchInfo.description,
    images: [churchInfo.ogImageUrl],
  },
  other: {
    "fb:app_id": FB_APP_ID,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

/* ---------- JSON-LD a ser injetado ---------- */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: churchInfo.name,
  url: "https://adsantamariars.com.br",
  logo: churchInfo.logoUrlLight,          // ajuste conforme seu caminho
  sameAs: [
    "https://www.instagram.com/ieadsmrs",
    "https://github.com/ieadsm",
  ],
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: "https://adsantamariars.com.br/",
  name: churchInfo.name,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full">
      {/* HEAD personalizado — qualquer conteúdo aqui será renderizado no <head> */}
      <head>
        {/* Script injetando os dados estruturados */}
        <Script
          id="org-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Script
          id="site-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full min-h-screen flex flex-col font-sans antialiased bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100 transition-colors`}
      >
        <AuthProvider>
          <HideLayoutWrapper>{children}</HideLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}

