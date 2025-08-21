"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import HeroSection         from "@/components/sections/home/HeroSection";
import WelcomeMessage      from "@/components/sections/home/WelcomeMessage";
import ScheduleSection     from "@/components/sections/home/ScheduleSection";
import SocialFeed          from "@/components/sections/home/FacebookFeed";
import LocationSection     from "@/components/sections/home/LocationSection";
import MinistriesSection   from "@/components/sections/home/MinistriesSection";
import CongregationsSection from "@/components/sections/home/CongregationsSection";

import { useSiteContent } from "@/hooks/useSiteContent";

export default function HomeClient({ ministries = [] }) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(ministries[0]?.id);
  const { content } = useSiteContent();

  // Sempre que o query string `?tab=` mudar, rola até a seção certa
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
      document
        .getElementById("ministries")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchParams]);

  return (
    <>
      <HeroSection
        backgroundSrc={content.heroImageURL}
        title={content.heroTitle}
        subtitle={content.heroSubtitle}
        primaryCta={{ href: "/#location", label: "Planeje sua Visita" }}
        secondaryCta={{ href: "#", label: "Assista Online" }}
      />

      <WelcomeMessage
        title={content.welcomeTitle}
        verse={content.welcomeVerse}
        reference={content.welcomeReference}
      />
      <ScheduleSection />
      <SocialFeed />

      <LocationSection
        address={content.address}
        phone={content.phone}
        title={content.visitTitle}
        subtitle={content.visitSubtitle}
        apiKey={content.mapApiKey}
      />

      <MinistriesSection
        ministries={ministries}
        preTitle={content.ministriesPreTitle}
        title={content.ministriesTitle}
        subtitle={content.ministriesSubtitle}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <CongregationsSection
        title={content.congregationsTitle}
        subtitle={content.congregationsSubtitle}
      />
    </>
  );
}

