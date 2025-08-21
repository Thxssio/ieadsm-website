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

import { churchInfo } from "@/lib/churchInfo";

export default function HomeClient({ ministries = [] }) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(ministries[0]?.id);

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
        backgroundSrc="/wallpapertest.png"
        title="Bem-vindo!"
        subtitle="Um lugar de fé, esperança e amor. Junte-se à nossa Igreja."
        primaryCta={{ href: "/#location", label: "Planeje sua Visita" }}
        secondaryCta={{ href: "#", label: "Assista Online" }}
      />

      <WelcomeMessage />
      <ScheduleSection />
      <SocialFeed />

      <LocationSection
        address={churchInfo.address}
        phone={churchInfo.phone}
      />

      <MinistriesSection
        ministries={ministries}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <CongregationsSection />
    </>
  );
}

