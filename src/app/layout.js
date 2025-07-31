import { Geist, Geist_Mono } from "next/font/google";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import DevelopmentSeal from "./components/layout/DevelopmentSeal";

import { churchInfo } from "./lib/churchInfo";
import { ministries } from "./lib/ministries";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport = {
  themeColor: "#0ea5e9",
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

        {/* main cresce para ocupar o espaço disponível */}
        <main className="flex-1">
          {children}
        </main>

        <Footer
          logoUrl={churchInfo.logoUrlDark}
          address={churchInfo.address}
          phone={churchInfo.phone}
          socialLinks={churchInfo.socialLinks}
        />

        {/* Se o selo é fixo, reserve espaço para não cobrir o footer */}
        {process.env.NODE_ENV !== "production" && (
          <>
            <DevelopmentSeal />
            <div className="h-10" aria-hidden /> {/* espaçador opcional */}
          </>
        )}
      </body>
    </html>
  );
}
