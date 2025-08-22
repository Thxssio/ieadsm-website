"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { churchInfo } from "@/lib/churchInfo";

const defaultContent = {
  rssLink: churchInfo.rssFeeds?.facebook || "",
  heroTitle: "Bem-vindo!",
  heroSubtitle: "Um lugar de fé, esperança e amor. Junte-se à nossa Igreja.",
  heroImageURL: "/wallpapertest.png",
  welcomeTitle: "Um Lugar para Pertencer",
  welcomeVerse:
    "“Portanto, vocês já não são estrangeiros nem forasteiros, mas concidadãos dos santos e membros da família de Deus.”",
  welcomeReference: "Efésios 2:19 (NVI)",
  visitTitle: "Visite-nos",
  visitSubtitle:
    "Adoraríamos que você se juntasse a nós em um de nossos cultos.",
  address: churchInfo.address,
  phone: churchInfo.phone,
  mapApiKey: "",
  congregationsMapUrl: churchInfo.mapUrl,
  ministriesPreTitle: "Envolva-se",
  ministriesTitle: "Nossos Ministérios",
  ministriesSubtitle:
    "Encontre o seu lugar em nossa Igreja. Temos diversos departamentos atuando para o crescimento do Reino de Deus.",
  congregationsTitle: "Nossas Congregações",
  congregationsSubtitle:
    "Explore o mapa de nossas congregações e encontre uma igreja perto de você.",
  footerText: "Um lugar de fé, esperança e amor para toda a família.",
  instagramLink: churchInfo.socialLinks?.instagram || "",
  facebookLink: churchInfo.socialLinks?.facebook || "",
  logoLightURL: churchInfo.logoUrlLight,
  logoDarkURL: churchInfo.logoUrlDark,
};

export function useSiteContent() {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "siteContent", "main"));
        if (snap.exists()) {
          setContent({ ...defaultContent, ...snap.data() });
        }
      } catch (e) {
        console.error("Erro carregando conteúdo do site:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { content, loading };
}
