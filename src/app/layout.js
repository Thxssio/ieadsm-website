// app/layout.js (ou layout.tsx)
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import DevelopmentSeal from "./components/layout/DevelopmentSeal";

import { churchInfo } from "./lib/churchInfo";
import { ministries } from "./lib/ministries";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// 1. Metadados globais do site
export const metadata = {
  title: churchInfo.name,                     // ex: "Igreja XYZ – Bem-vindo"
  description: churchInfo.description,         // pegue da sua lib, ou coloque uma string fixa
  themeColor: "#2a3d57",                       // cor principal da barra no mobile
  icons: {
    icon: churchInfo.faviconUrl,               // caminho do favicon
    apple: churchInfo.appleTouchIconUrl,       // se tiver
  },
  openGraph: {
    title: churchInfo.name,
    description: churchInfo.description,
    url: "https://seudominio.com",              // domínio do site
    images: [churchInfo.ogImageUrl],            // imagem para link no WhatsApp/Facebook
  },
  twitter: {
    card: "summary_large_image",
    title: churchInfo.name,
    description: churchInfo.description,
    images: [churchInfo.ogImageUrl],
  },
};

// 2. Viewport (padrão de responsividade)
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full min-h-screen flex flex-col font-sans antialiased bg-white text-stone-900`}
      >
        <Header
          churchName={churchInfo.name}
          logoUrl={churchInfo.logoUrlLight}
          ministries={ministries}
        />

        <main className="flex-1">{children}</main>

        <Footer
          logoUrl={churchInfo.logoUrlDark}
          address={churchInfo.address}
          phone={churchInfo.phone}
          socialLinks={churchInfo.socialLinks}
        />

        {process.env.NODE_ENV !== "production" && (
          <>
            <DevelopmentSeal />
            <div className="h-10" aria-hidden />
          </>
        )}
      </body>
    </html>
  );
}
