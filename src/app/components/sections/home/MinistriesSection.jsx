"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function MinistriesSection({ ministries = [] }) {
  if (!ministries.length) {
    return null;
  }

  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initial = search.get("tab") || ministries[0].id;
  const [activeTab, setActiveTab] = useState(initial);

  useEffect(() => {
    const urlTab = search.get("tab");
    setActiveTab(urlTab || ministries[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]); // depende do objeto de busca

  const activeMinistry = useMemo(
    () => ministries.find((m) => m.id === activeTab),
    [ministries, activeTab]
  );

  const handleSelect = (id) => {
    setActiveTab(id);
    const params = new URLSearchParams(search?.toString() || "");
    params.set("tab", id);
    // Mantém a rolagem; ancora para a seção
    router.replace(`${pathname}?${params.toString()}#ministries`, { scroll: false });
  };

  return (
    <section id="ministries" className="py-20 sm:py-28 bg-stone-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-base font-semibold text-[#2a3d57] tracking-wider uppercase">Envolva-se</h2>
          <p className="mt-2 text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">Nossos Ministérios</p>
          <p className="mt-4 text-lg text-stone-600">
            Encontre o seu lugar em nossa Igreja. Temos diversos departamentos atuando para o crescimento do Reino de Deus.
          </p>
        </div>

        <div className="mt-16 flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Lista de abas */}
          <div className="lg:w-1/3 flex-shrink-0">
            <ul className="space-y-2">
              {ministries.map((ministry) => {
                const isActive = activeTab === ministry.id;
                return (
                  <li key={ministry.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(ministry.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg text-left font-semibold transition-all duration-200
                        ${isActive ? "bg-[#2a3d57] text-white shadow-lg" : "bg-white hover:bg-[#2a3d57]/10 hover:text-[#2a3d57] text-stone-700"}`}
                      aria-pressed={isActive}
                    >
                      {ministry.icon}
                      <span>{ministry.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Conteúdo da aba */}
          <div className="lg:w-2/3 bg-white p-8 md:p-12 rounded-2xl shadow-xl">
            {activeMinistry && (
              <div>
                <h3 className="text-3xl font-bold text-stone-900">{activeMinistry.name}</h3>
                <p className="mt-4 text-lg text-stone-600">
                  Aqui teremos a descrição sobre o ministério {activeMinistry.name}. Fale sobre os objetivos, atividades, como participar e quem são os líderes.
                </p>
                <p className="mt-4 text-lg text-stone-600">
                  Podemos adicionar fotos, vídeos e informações de contato específicas para este departamento.
                </p>
                <a
                  href="/contato"
                  className="mt-6 inline-block bg-[#2a3d57] hover:bg-[#202e42] text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300"
                >
                  Saber Mais
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
