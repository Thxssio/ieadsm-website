"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Users, // Ícone padrão
  HeartHandshake, // Ícone para "missions"
  BookOpen, // Ícone para "teaching"
} from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ------------------------------------------------------------------
// Helper: Renderiza o ícone correto baseado no nome
// ------------------------------------------------------------------
const MinistryIcon = ({ iconName, ...props }) => {
  switch (iconName) {
    case "missions":
      return <HeartHandshake {...props} />;
    case "teaching":
      return <BookOpen {...props} />;
    default:
      return <Users {...props} />;
  }
};

// ------------------------------------------------------------------
// Modal de Detalhes do Ministério
// ------------------------------------------------------------------
function MinistryModal({ ministry, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-stone-50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-500 hover:text-stone-900 transition-colors z-10"
          aria-label="Fechar modal"
        >
          <X size={28} />
        </button>
        <div className="relative w-full h-56 sm:h-72 bg-stone-100">
          <Image
            src={ministry.imageURL || "/images/ministries/placeholder.jpg"}
            alt={`Imagem do ${ministry.name}`}
            layout="fill"
            objectFit="contain"
            className="rounded-t-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div className="p-6 sm:p-8 md:p-10">
          <h3 className="text-3xl sm:text-4xl font-bold text-[#2a3d57]">{ministry.name}</h3>
          <p className="mt-4 text-base md:text-lg text-stone-600">{ministry.description}</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {ministry.team && Object.keys(ministry.team).length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-stone-800 border-b-2 border-[#2a3d57] pb-2">Nossa Equipe</h4>
                {Object.entries(ministry.team).map(([role, names]) => (
                  <div key={role}>
                    <p className="font-semibold text-stone-700">{role}</p>
                    <ul className="list-disc list-inside pl-2 text-stone-600">
                      {/* CORREÇÃO APLICADA AQUI: Adicionado 'index' para criar uma chave única */}
                      {(names || []).map((name, index) => <li key={`${role}-${name}-${index}`}>{name}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {ministry.schedule && (
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-stone-800 border-b-2 border-[#2a3d57] pb-2">Encontros</h4>
                <p className="text-stone-600">{ministry.schedule}</p>
              </div>
            )}
          </div>
          <a
            href={`/contato?assunto=${encodeURIComponent(ministry.name)}`}
            className="mt-10 inline-block bg-[#2a3d57] hover:bg-[#202e42] text-white font-bold py-3 px-8 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
          >
            Quero Participar
          </a>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Setas de Navegação do Slider
// ------------------------------------------------------------------
function NextArrow({ onClick }) {
  return (
    <button
      className="absolute top-1/2 right-[-20px] sm:right-[-52px] z-10 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-stone-200 transition-colors"
      onClick={onClick}
      aria-label="Próximo slide"
    >
      <ChevronRight size={24} className="text-[#2a3d57]" />
    </button>
  );
}

function PrevArrow({ onClick }) {
  return (
    <button
      className="absolute top-1/2 left-[-20px] sm:left-[-52px] z-10 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-stone-200 transition-colors"
      onClick={onClick}
      aria-label="Slide anterior"
    >
      <ChevronLeft size={24} className="text-[#2a3d57]" />
    </button>
  );
}

// ------------------------------------------------------------------
// Componente Principal da Seção
// ------------------------------------------------------------------
export default function MinistriesSection({
  ministries = [],
  preTitle = "Envolva-se",
  title = "Nossos Ministérios",
  subtitle = "Encontre o seu lugar em nossa Igreja. Temos diversos departamentos atuando para o crescimento do Reino de Deus.",
}) {
  const [selectedMinistry, setSelectedMinistry] = useState(null);
  const [sliderInitialized, setSliderInitialized] = useState(false);
  const sliderRef = useRef();

  useEffect(() => {
    const processHash = (hash) => {
      if (!hash.startsWith("#ministry-") || !ministries.length || !sliderInitialized) {
        return;
      }
      const id = hash.replace("#ministry-", "");
      const index = ministries.findIndex(m => m.id.toLowerCase() === id.toLowerCase());

      if (index !== -1 && sliderRef.current) {
        sliderRef.current.slickGoTo(index);
        setTimeout(() => {
          const section = document.getElementById("ministries");
          if (section) {
            const rect = section.getBoundingClientRect();
            window.scrollTo({
              top: window.pageYOffset + rect.top - 100, // Ajuste de offset
              behavior: 'smooth'
            });
          }
        }, 300);
      }
    };

    const handleHashChange = () => processHash(window.location.hash);
    
    if (window.location.hash) {
      processHash(window.location.hash);
    }
    
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);

  }, [sliderInitialized, ministries]);

  if (!ministries || ministries.length === 0) return null;

  const sliderSettings = {
    dots: true,
    dotsClass: "slick-dots-custom",
    appendDots: (dots) => (
      <div style={{ paddingTop: "40px" }}>
        <ul className="flex items-center justify-center space-x-3">{dots}</ul>
      </div>
    ),
    customPaging: () => <div className="w-3 h-3 bg-stone-300 rounded-full cursor-pointer"></div>,
    infinite: ministries.length > 3,
    speed: 500,
    centerMode: true,
    centerPadding: "0px",
    slidesToShow: 3,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    onInit: () => setTimeout(() => setSliderInitialized(true), 500),
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 1, centerPadding: "100px" } },
      { breakpoint: 768, settings: { slidesToShow: 1, centerPadding: "0px", arrows: false } },
    ],
  };

  return (
    <>
      <section id="ministries" className="py-20 sm:py-28 bg-stone-50">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto px-4">
            <h2 className="text-base font-semibold text-[#2a3d57] tracking-wider uppercase">{preTitle}</h2>
            <p className="mt-2 text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">{title}</p>
            <p className="mt-4 text-lg text-stone-600">{subtitle}</p>
          </div>

          <div className="mt-16 relative">
            <div className="mx-auto px-10 sm:px-14 mb-16">
              <Slider {...sliderSettings} ref={sliderRef}>
                {ministries.map((ministry) => (
                  <div key={ministry.id} className="px-4 h-full">
                    <div className="h-full pb-6">
                      <button
                        onClick={() => setSelectedMinistry(ministry)}
                        className="bg-white rounded-xl shadow-lg overflow-hidden text-left group transition-all duration-300 w-full h-[450px] flex flex-col"
                      >
                        <div className="relative h-48 w-full flex-shrink-0 bg-stone-100">
                          <Image
                            src={ministry.imageURL || "/images/ministries/placeholder.jpg"}
                            alt={`Imagem do ${ministry.name}`}
                            layout="fill"
                            objectFit="contain"
                            className="transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <div className="p-5 flex-grow flex flex-col">
                          <div className="flex items-start gap-3">
                            <div className="text-[#2a3d57] pt-1 flex-shrink-0">
                              <MinistryIcon iconName={ministry.icon} size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-800">{ministry.name}</h3>
                          </div>
                          <p className="mt-2 text-sm text-stone-600 line-clamp-3 flex-grow">
                            {ministry.description}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </div>
      </section>

      {selectedMinistry && (
        <MinistryModal
          ministry={selectedMinistry}
          onClose={() => setSelectedMinistry(null)}
        />
      )}
    </>
  );
}