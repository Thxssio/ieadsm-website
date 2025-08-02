// app/layout.js (ou layout.tsx)
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import DevelopmentSeal from "./components/layout/DevelopmentSeal";

import { churchInfo } from "./lib/churchInfo";
import { ministries } from "./lib/ministries-data";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: churchInfo.name,                    
  description: churchInfo.description,        
  icons: {
    icon: churchInfo.faviconUrl,              
    apple: churchInfo.appleTouchIconUrl,       
  },
  openGraph: {
    title: churchInfo.name,
    description: churchInfo.description,
    url: "https://adsantamariars.com.br",             
    images: [churchInfo.ogImageUrl],            
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
