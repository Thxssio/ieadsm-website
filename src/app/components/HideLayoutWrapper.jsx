"use client";

import { usePathname } from "next/navigation";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import DevelopmentSeal from "./layout/DevelopmentSeal";

import { churchInfo } from "@/lib/churchInfo";
import { ministries } from "@/lib/ministries-data";

export default function HideLayoutWrapper({ children }) {
  const pathname = usePathname();
  const hideGlobal = pathname === "/links";

  return (
    <>
      {!hideGlobal && (
        <Header
          churchName={churchInfo.name}
          logoUrl={churchInfo.logoUrlLight}
          ministries={ministries}
        />
      )}

      <main className={hideGlobal ? "" : "flex-1"}>{children}</main>

      {!hideGlobal && (
        <Footer
          logoUrl={churchInfo.logoUrlDark}
          address={churchInfo.address}
          phone={churchInfo.phone}
          socialLinks={churchInfo.socialLinks}
        />
      )}

      {!hideGlobal && process.env.NODE_ENV !== "production" && (
        <>
          <DevelopmentSeal />
          <div className="h-10" aria-hidden />
        </>
      )}
    </>
  );
}
