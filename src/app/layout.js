import { Geist, Geist_Mono } from "next/font/google";
import HideLayoutWrapper from "./components/HideLayoutWrapper";
import { churchInfo } from "./lib/churchInfo";
import { AuthProvider } from './lib/firebase/AuthContext';
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
      <AuthProvider>
        <HideLayoutWrapper>
          {children}
        </HideLayoutWrapper>
      </AuthProvider>
      </body>
    </html>
  );
}
