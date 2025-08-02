"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";

export default function MinistriesSection({ ministries = [] }) {
  if (!ministries.length) {
    return null;
  }

  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlTab = search.get("tab");
  
  const activeTab = useMemo(() => {
    const isValidTab = ministries.some(m => m.id === urlTab);
    return isValidTab ? urlTab : ministries[0].id;
  }, [urlTab, ministries]);

  const activeMinistry = useMemo(
    () => ministries.find((m) => m.id === activeTab),
    [ministries, activeTab]
  );

  const handleSelect = (id) => {
    const params = new URLSearchParams(search.toString());
    params.set("tab", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false }); 
  };

  return (
    <section id="ministries" className="py-20 sm:py-28 bg-stone-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* COR ATUALIZADA */}
          <h2 className="text-base font-semibold text-[#2a3d57] tracking-wider uppercase">Envolva-se</h2>
          <p className="mt-2 text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">Nossos Ministérios</p>
          <p className="mt-4 text-lg text-stone-600">
            Encontre o seu lugar em nossa Igreja. Temos diversos departamentos atuando para o crescimento do Reino de Deus.
          </p>
        </div>

        <div className="mt-16 flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-7xl mx-auto">
          <div className="lg:w-1/3 flex-shrink-0">
            <ul className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 -mx-4 px-4 whitespace-nowrap lg:whitespace-normal">
              {ministries.map((ministry) => {
                const isActive = activeTab === ministry.id;
                return (
                  <li key={ministry.id} className="flex-shrink-0 lg:flex-shrink">
                    <button
                      type="button"
                      onClick={() => handleSelect(ministry.id)}
                      // COR ATUALIZADA
                      className={`w-full flex items-center gap-3 p-4 rounded-lg text-left font-semibold transition-all duration-300
                        ${isActive ? "bg-[#2a3d57] text-white shadow-lg scale-105" : "bg-white hover:bg-[#2a3d57]/10 text-stone-700"}`}
                      aria-pressed={isActive}
                    >
                      {ministry.icon || <LayoutGrid size={20} />}
                      <span>{ministry.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="lg:w-2/3">
            {activeMinistry && (
              <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl">
                <div className="relative w-full h-56 sm:h-64 mb-6 rounded-lg overflow-hidden">
                  <Image src={activeMinistry.image || '/images/ministries/placeholder.jpg'} alt={`Imagem do ${activeMinistry.name}`} layout="fill" objectFit="cover" />
                </div>
                <h3 className="text-3xl font-bold text-stone-900">{activeMinistry.name}</h3>
                <p className="mt-4 text-base md:text-lg text-stone-600">{activeMinistry.description}</p>
                
                <div className="mt-6 border-t border-stone-200 pt-6 space-y-4">
                  <h4 className="text-xl font-bold text-stone-800">Nossa Equipe</h4>
                  {activeMinistry.team && Object.entries(activeMinistry.team).map(([role, names]) => (
                    <div key={role}>
                      <p className="font-semibold text-stone-700">{role}</p>
                      <ul className="list-disc list-inside pl-2 text-stone-600">
                        {names.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {activeMinistry.schedule && (
                  <div className="mt-6 border-t border-stone-200 pt-6">
                    <p className="font-semibold text-stone-800">Encontros</p>
                    <p className="text-stone-600">{activeMinistry.schedule}</p>
                  </div>
                )}
                {/* COR ATUALIZADA */}
                <a href={`/contato?assunto=${encodeURIComponent(activeMinistry.name)}`} className="mt-8 inline-block bg-[#2a3d57] hover:bg-[#202e42] text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300">
                  Quero Participar
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}