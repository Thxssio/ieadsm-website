"use client";

import { useState } from "react";
import { Users, MessageSquare, Book, Briefcase } from "lucide-react";
import { churchInfo } from "../lib/churchInfo";


export default function InstitucionalPage() {
  const logoUrl = churchInfo.logoUrlLight;

  const [activeTab, setActiveTab] = useState("diretoria");

  const tabs = [
    { id: "diretoria", name: "Diretoria", icon: <Users size={20} /> },
    { id: "palavra", name: "Palavra do Presidente", icon: <MessageSquare size={20} /> },
    { id: "historia", name: "Nossa História", icon: <Book size={20} /> },
    { id: "assessorias", name: "Assessorias da Presidência", icon: <Briefcase size={20} /> },
  ];

  const diretoria = [
    { role: "Presidente", name: "PR. MOISÉS LAMBERTY", imageUrl: "/directors/Moises.png" },
    { role: "1º Vice-Presidente", name: "PR. JOEL JARDIM", imageUrl: "/directors/Joel.png" },
    { role: "2º Vice-Presidente", name: "PR. JOSÉ DE ÁVILA", imageUrl: "/directors/José.png" },
    { role: "1º Secretário", name: "EV. PAULO MUCENECKI", imageUrl: "/directors/Paulo.png" },
    { role: "2º Secretário", name: "EV. ADONIR MARQUES", imageUrl: "/directors/Adonir.png" },
    { role: "1º Tesoureiro", name: "EV. EMERSON ROLIM", imageUrl: "/directors/Emerson.png" },
    { role: "2º Tesoureiro", name: "EV. MAURICIO HILLESHHEIM", imageUrl: "/directors/Mauricio.png" },
  ];

  const assessorias = {
    "Comissão de Exame de Contas": [
      { role: "Coordenadora", name: "Eloise Andrade" },
      { role: "Relator", name: "Heverton Hautrive" },
      { role: "Secretário", name: "Nilton Rosa Lopes" },
      { role: "Membro", name: "Zípora de Oliveira Campos Nunes" },
      { role: "Membro", name: "Rosaura Elisabeth Severo" },
      { role: "Membro", name: "Marta Martins" },
    ],
    "Assessoria Administrativa": [
      { role: "Secretária Adjunta", name: "Cláudia Mucenecki" },
      { role: "Tesoureiro Adjunto", name: "Pr. Paulo Ricardo Moraes" },
    ],
    "Co-Pastor": [{ role: "", name: "Pr. Renato Charão" }],
    "Supervisores Regionais": [
      { role: "Região 1", name: "Pr. Moisés Lamberty e Pr. Alcindo Costa" },
      { role: "Região 2", name: "Pr. José de Ávila" },
      { role: "Região 3", name: "Pr. Adailto Cassol" },
      { role: "Região 4", name: "Pr. Renato Charão" },
      { role: "Região 5", name: "Ev. Davi Soares" },
      { role: "Região 6", name: "Pr. Paulo Ricardo Moraes" },
      { role: "Região 7", name: "Pr. Joel Jardim" },
    ],
    "Comissão do Crivo Ministerial": [
      { role: "Coordenador", name: "Ev. Emerson Rolim" },
      { role: "Relator", name: "Ev. Roberto Belle" },
      { role: "Membro", name: "Ev. Elton Reis" },
      { role: "Membro", name: "Ev. Renato Kuhn" },
      { role: "Membro", name: "Ev. Adonir Marques" },
    ],
    "Comissão de Ética e Disciplina": [
      { role: "Coordenador", name: "Pr. Renato Charão" },
      { role: "Relator", name: "Pr. Paulo Ricardo Moraes" },
      { role: "Membro", name: "Pr. Adailto Cassol" },
      { role: "Membro", name: "Pr. Alcindo Costa" },
      { role: "Membro", name: "Pr. Cláudio Moisés Ferreira" },
      { role: "Membro", name: "Pr. Joel Jardim" },
      { role: "Membro", name: "Pr. José de Ávila" },
      { role: "Membro", name: "Pr. Manoel Cezar" },
      { role: "Membro", name: "Pr. Salvador da Silva" },
    ],
    "Comissão de Política": [
      { role: "", name: "Pb. Ishmael Vieira" },
      { role: "", name: "Ev. Emerson Rolim" },
      { role: "", name: "Ev. Elton Reis" },
    ],
    "Conselho Ministerial": [
      { role: "", name: "Pr. Renato Charão" },
      { role: "", name: "Pr. José de Ávila" },
      { role: "", name: "Pr. Alcindo Costa" },
    ],
  };

  const renderContent = () => {
    const president = diretoria.find((m) => m.role === "Presidente");
    switch (activeTab) {
      case "diretoria":
        return (
          <div>
            <h3 className="text-3xl font-bold text-stone-900 mb-8">Diretoria</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {diretoria.map((membro) => (
                <div
                  key={membro.name}
                  className="bg-stone-50 p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    src={membro.imageUrl}
                    alt={`Foto de ${membro.name}`}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/256x256/cccccc/969696?text=Foto";
                    }}
                  />
                  <p className="font-bold text-[#2a3d57]">{membro.role}</p>
                  <p className="text-lg font-semibold text-stone-800 mt-1">{membro.name}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "palavra":
        return (
          <div>
            <h3 className="text-3xl font-bold text-stone-900 mb-6">Palavra do Presidente</h3>
            <div className="prose prose-lg max-w-none text-stone-700">
              <blockquote className="border-l-4 border-[#2a3d57] pl-4 italic">
                “Mas nós perseveraremos na oração e no ministério da palavra.” At 6.4
              </blockquote>
              <p>Dirijo-me aos queridos irmãos com muita alegria saudando a todos com nossa costumeira e calorosa saudação assembleiana: A Paz do Senhor Jesus, nosso Senhor e Salvador.</p>
              <p>Enfrentamos um 2024 de muitos desafios, experimentamos situações novas que jamais imaginaríamos passar, mas em tudo fomos vencedores na pessoa bendita de Cristo. Agora, as aflições de antes e de ontem não podem mais nos alcançar, por isso disse o Apóstolo Paulo “deixando as coisas que para trás ficam, avanço para o alvo”. Diante disso, o que temos é a cada dia a oportunidade nova e abençoada que Deus nos dá de viver e vivendo, servir a Ele e a sua Obra.</p>
              <p>Em 2024 nosso lema foi focado na Palavra de Deus – a Santa Bíblia. Em 2025 continuaremos perseverando na Palavra sem descuidar das outras funções principais da Igreja de Cristo na terra, como a adoração verdadeira, o culto, a fidelidade, as virtudes bíblicas, a evangelização, a missão, os trabalhos sociais e as visitas aos necessitados através da Capelania e obreiros da Igreja em todo o campo da IEADSM.</p>
              <p>Prossigamos, sabendo que nosso descanso e coroação não é aqui, mas está reservado um dia para que a Igreja de Cristo receba das mãos do seu Senhor o seu galardão.</p>
              <p>Deixo minha palavra de orientação e aconselhamento a todos os obreiros, esposas e membros da IEADSM: vamos nos fortalecer naquilo que realmente edifica que é a Palavra de Deus e servir a Deus cada dia mais com inteireza de coração, pois estamos muito perto do grande dia da Igreja.</p>
              <p>Fortalecei-vos uns aos outros! Vamos chorar com os que choram, nos alegrar com os que se alegram e continuar nos quatro cantos de Santa Maria dizendo que Jesus Cristo é o Senhor, que Ele salva, cura, batiza com o Espírito Santo e brevemente vai voltar para buscar a sua Igreja.</p>
              <p>Por fim desejo a todos os queridos irmãos um 2025 abençoado em todos os sentidos da vossa vida e que nossa igreja possa crescer para a glória de Deus, sabendo que todos são importantes para o reino de Deus.</p>
              <div className="mt-12 flex justify-end items-center gap-4 not-prose">
                <div className="text-right">
                  <p className="font-bold">Pr. Moisés Lamberty</p>
                  <p className="text-sm">Presidente da Igreja Evangélica Assembleia de Deus de Santa Maria - RS</p>
                </div>
                <img
                  src={president?.imageUrl}
                  alt="Foto do Presidente"
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                />
              </div>
            </div>
          </div>
        );

      case "historia":
        return (
          <div>
            <h3 className="text-3xl font-bold text-stone-900 mb-6">Nossa História</h3>
            <ul className="relative border-l-2 border-[#2a3d57] ml-4 mt-8 space-y-8">
              {/* Origem */}
              <li className="ml-6">
                <span className="absolute -left-3 top-1 w-6 h-6 bg-[#2a3d57] rounded-full"></span>
                <time className="block text-sm font-semibold text-[#2a3d57]">1919</time>
                <h4 className="mt-1 font-semibold text-stone-800">Origem</h4>
                <p className="text-stone-700">
                  O Grande Movimento Pentecostal surgiu em várias partes do mundo através de reuniões de oração. Na Suécia,
                  o Pastor Gustav Nordlund iniciou seu ministério em Lidköping, com 16 irmãos em 18 de janeiro de 1919.
                </p>
                <p className="text-stone-700">
                  Em 1922, Gustav e Hedwig Nordlund foram enviados ao Brasil e, em 12 de abril de 1924, realizaram o primeiro culto
                  em Porto Alegre, fundando oficialmente a Assembleia de Deus.
                </p>
              </li>

              {/* Início – Santa Maria */}
              <li className="ml-6">
                <span className="absolute -left-3 top-1 w-6 h-6 bg-[#2a3d57] rounded-full"></span>
                <time className="block text-sm font-semibold text-[#2a3d57]">1927</time>
                <h4 className="mt-1 font-semibold text-stone-800">Início – Santa Maria</h4>
                <p className="text-stone-700">
                  Em 1927, Gustav, Hedwig e Herbert Nordlund viajaram de trem e a pé até Arroio do Só (Santa Maria), realizando
                  o primeiro culto na casa de Guiomar Barcellos, que cedeu sua parreira para os cultos.
                </p>
              </li>

              {/* Primeiro Batismo */}
              <li className="ml-6">
                <span className="absolute -left-3 top-1 w-6 h-6 bg-[#2a3d57] rounded-full"></span>
                <time className="block text-sm font-semibold text-[#2a3d57]">11/11/1928</time>
                <h4 className="mt-1 font-semibold text-stone-800">Primeiro Batismo – Santa Maria</h4>
                <p className="text-stone-700">
                  O primeiro batismo ocorreu em uma sanga nos fundos da propriedade de Guiomar Barcellos, com pioneiros como
                  Osmilda Pires e Rosa Pires.
                </p>
              </li>

              {/* Leonardo Gonçalves */}
              <li className="ml-6">
                <span className="absolute -left-3 top-1 w-6 h-6 bg-[#2a3d57] rounded-full"></span>
                <time className="block text-sm font-semibold text-[#2a3d57]">1928</time>
                <h4 className="mt-1 font-semibold text-stone-800">Leonardo Gonçalves</h4>
                <p className="text-stone-700">
                  Converter-se em 1928, foi nomeado primeiro obreiro e ajudou a erguer a capela de 1929 em terreno doado por Guiomar.
                </p>
              </li>

              {/* Paulo Cruz */}
              <li className="ml-6">
                <span className="absolute -left-3 top-1 w-6 h-6 bg-[#2a3d57] rounded-full"></span>
                <time className="block text-sm font-semibold text-[#2a3d57]">1932</time>
                <h4 className="mt-1 font-semibold text-stone-800">Paulo Cruz</h4>
                <p className="text-stone-700">
                  Em 21 de fevereiro de 1932, Paulo Cruz organizou oficialmente a congregação de Santa Maria como parte de Porto Alegre.
                </p>
              </li>

              {/* Missionários e Pastores */}
              <li className="ml-6">
                <span className="absolute -left-3 top-1 w-6 h-6 bg-[#2a3d57] rounded-full"></span>
                <time className="block text-sm font-semibold text-[#2a3d57]">1940–2021</time>
                <h4 className="mt-1 font-semibold text-stone-800">Missionários e Pastores</h4>
                <p className="text-stone-700">
                  De 1940 a 1942, Leonard Pettersen atuou; 1943, Luiz Neves; 1943 a 1980, Orvalino Lemos (autonomia em 1955);
                  1980–1989, Avelino Maicá; 1989–2008, Elói Rocha; 2008–2014, Domingos Floreni; e, em 2021, Moisés Adriano Lamberty.
                </p>
              </li>

              {/* Ebenezer */}
              <li className="ml-6">
                <span className="absolute -left-3 top-1 w-6 h-6 bg-[#2a3d57] rounded-full"></span>
                <time className="block text-sm font-semibold text-[#2a3d57]">Ebenezer</time>
                <h4 className="mt-1 font-semibold text-stone-800">Ebenezer</h4>
                <p className="text-stone-700">
                  Décadas após o primeiro culto, a Assembleia de Deus de Santa Maria estendeu suas raízes por toda a região,
                  mantendo a missão de levar a Palavra de Deus até o último da terra.
                </p>
              </li>
            </ul>
          </div>
        );

      case "assessorias":
        return (
          <div>
            <h3 className="text-3xl font-bold text-stone-900 mb-8">Assessorias da Presidência</h3>
            <div className="space-y-8">
              {Object.entries(assessorias).map(([title, members]) => (
                <div key={title}>
                  <h4 className="text-xl font-bold text-[#202e42] border-b-2 border-[#2a3d57]/20 pb-2 mb-4">
                    {title}
                  </h4>
                  <ul className="space-y-2">
                    {members.map((member) => (
                      <li key={member.name} className="flex items-baseline">
                        {member.role && (
                          <span className="font-semibold w-40 flex-shrink-0 text-stone-600">{member.role}:</span>
                        )}
                        <span className="text-stone-800">{member.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">Institucional</p>
        </div>

        <div className="mt-16 flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-7xl mx-auto">
          <div className="lg:w-1/4 flex-shrink-0">
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg text-left font-semibold transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-[#2a3d57] text-white shadow-lg"
                        : "bg-white hover:bg-[#2a3d57]/10 hover:text-[#2a3d57] text-stone-700"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:w-3/4 bg-stone-50 p-8 md:p-12 rounded-2xl shadow-inner">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
