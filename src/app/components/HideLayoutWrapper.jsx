"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DevelopmentSeal from "@/components/layout/DevelopmentSeal";

import { churchInfo } from "@/lib/churchInfo";

// Firestore
import { db } from "@/lib/firebase/client";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function HideLayoutWrapper({ children }) {
  const pathname = usePathname();

  // rotas onde não queremos mostrar header/footer
  const pathsToHide = ["/portal", "/links"];
  const hideGlobal = pathsToHide.some((p) => pathname.startsWith(p));

  // estado p/ ministérios dinâmicos
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const q = query(
          collection(db, "ministries"),
          orderBy("name", "asc")
        );
        const snap = await getDocs(q);
        setMinistries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Erro carregando ministérios:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      {!hideGlobal && (
        <Header
          churchName={churchInfo.name}
          logoUrl={churchInfo.logoUrlLight}
          ministries={loading ? [] : ministries}
        />
      )}
      <main className="flex-1">{children}</main>
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

