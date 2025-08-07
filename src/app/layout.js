import { Geist, Geist_Mono } from "next/font/google";
import HideLayoutWrapper from "./components/HideLayoutWrapper";
import { churchInfo } from "./lib/churchInfo";
import { AuthProvider } from "./lib/firebase/AuthContext";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID || "766585979212640";

export const metadata = {
  metadataBase: new URL("https://adsantamariars.com.br"),
  title: churchInfo.name,
  description: churchInfo.description,
  icons: {
    icon: churchInfo.faviconUrl,
    apple: churchInfo.appleTouchIconUrl,
  },
  alternates: {
    canonical: "/", // https://adsantamariars.com.br/
  },
  openGraph: {
    type: "website",                
    url: "/",                       
    siteName: churchInfo.name,
    title: churchInfo.name,
    description: churchInfo.description,
    images: [
      { url: churchInfo.ogImageUrl },
    ],
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

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full min-h-screen flex flex-col font-sans antialiased bg-white text-stone-900`}>
        <AuthProvider>
          <HideLayoutWrapper>{children}</HideLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
