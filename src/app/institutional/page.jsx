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
            <p className="text-lg text-stone-600">
              A história da nossa igreja é uma jornada de fé, perseverança e da manifestação do poder de Deus. Desde a sua fundação, temos visto vidas transformadas e a comunidade abençoada.
            </p>
            <p className="mt-4 text-lg text-stone-600">
              (Esta secção será preenchida com a história detalhada da Igreja Evangélica Assembleia de Deus de Santa Maria/RS.)
            </p>
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
          <img src={logoUrl} alt="Logo" className="h-20 w-auto mx-auto mb-6" />
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
