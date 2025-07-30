import { ministries } from "./lib/ministries";
import { churchInfo } from "./lib/churchInfo";

import HeroSection from "./components/sections/home/HeroSection";
import WelcomeMessage from "./components/sections/home/WelcomeMessage";
import ScheduleSection from "./components/sections/home/ScheduleSection";
import LocationSection from "./components/sections/home/LocationSection";
import MinistriesSection from "./components/sections/home/MinistriesSection";
import CongregationsSection from "./components/sections/home/CongregationsSection";

export default function HomePage() {
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

      <LocationSection
        address={churchInfo.address}
        phone={churchInfo.phone}
      />

      <MinistriesSection ministries={ministries} />
      <CongregationsSection />
    </>
  );
}
