"use client"; 
import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Phone, Users, Menu, X, Instagram, Facebook, Map, Feather, BookOpen, Music, Globe2, Megaphone, Smile, Hand, Star, CalendarDays, BookMarked, Heart, UserCheck, Handshake, Stethoscope, Speaker, Radio, ChevronDown, Building, MessageSquare, Book, Briefcase, HardHat, LogIn, Mail } from 'lucide-react';
import dynamic from "next/dynamic";

const PdfFlipbook = dynamic(() => import("../components/PdfFlipbook"), {
  ssr: false,
});


// Componente auxiliar para Ícones com novo estilo
const IconWrapper = ({ children }) => (
  <div className="flex-shrink-0 w-16 h-16 bg-[#2a3d57]/10 text-[#2a3d57] rounded-full inline-flex items-center justify-center border-4 border-white shadow-sm">
    {children}
  </div>
);

// Componente do Cabeçalho
const Header = ({ churchName, logoUrl, ministries, setActiveMinistryTab, setPage, setScrollToId }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMinistriesOpen, setIsMinistriesOpen] = useState(false);
  const ministriesTimeoutRef = useRef(null);

  const handleMinistriesEnter = () => {
    clearTimeout(ministriesTimeoutRef.current);
    setIsMinistriesOpen(true);
  };

  const handleMinistriesLeave = () => {
    ministriesTimeoutRef.current = setTimeout(() => {
      setIsMinistriesOpen(false);
    }, 200); // 200ms delay to allow mouse to travel to the dropdown
  };

  const handleNavClick = (page, scrollTo) => {
    setPage(page);
    if (scrollTo) {
        setScrollToId(scrollTo);
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Início', page: 'home', scrollTo: null },
    { name: 'Institucional', page: 'institutional', scrollTo: null },
    { name: 'Eventos', page: 'events', scrollTo: null },
    { name: 'Contato', page: 'contact', scrollTo: null },
  ];

  return (
    <header className="bg-stone-50/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex-shrink-0">
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} className="flex items-center space-x-3 group">
              <img
                className="h-16 w-auto transition-transform duration-300 group-hover:scale-105"
                src={logoUrl}
                alt={`Logo ${churchName}`}
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x40/0ea5e9/ffffff?text=Logo'; }}
              />
            </a>
          </div>
          <nav className="hidden md:flex md:items-center md:space-x-6">
            {navLinks.map((link) => (
              <a key={link.name} href={`#${link.scrollTo || ''}`} onClick={(e) => { e.preventDefault(); handleNavClick(link.page, link.scrollTo); }} className="text-stone-600 hover:text-[#2a3d57] font-medium transition-colors duration-300 px-2 py-1">
                {link.name}
              </a>
            ))}
            {/* Dropdown Ministérios */}
            <div className="relative" onMouseEnter={handleMinistriesEnter} onMouseLeave={handleMinistriesLeave}>
              <a href="#ministries" onClick={(e) => { e.preventDefault(); handleNavClick('home', 'ministries'); }} className="text-stone-600 hover:text-[#2a3d57] font-medium transition-colors duration-300 flex items-center gap-1 px-2 py-1">
                Ministérios <ChevronDown size={16} />
              </a>
              {isMinistriesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[34rem] bg-white rounded-lg shadow-xl p-4 z-20">
                  <ul className="grid grid-cols-2 gap-2">
                    {ministries.map((ministry) => (
                      <li key={ministry.id}>
                        <a
                          href="#ministries"
                          onClick={() => {
                            handleNavClick('home', 'ministries');
                            setActiveMinistryTab(ministry.id);
                            setIsMinistriesOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-md text-left font-medium text-sm text-stone-700 hover:bg-[#2a3d57]/10 hover:text-[#2a3d57] transition-colors duration-200"
                        >
                          {ministry.icon}
                          <span>{ministry.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
             <button onClick={() => setPage('login')} className="ml-4 flex items-center gap-2 bg-[#2a3d57] text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-[#202e42] transition-colors duration-300">
                <LogIn size={16} />
                Área do Ministro
            </button>
          </nav>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-stone-700 hover:text-[#2a3d57] focus:outline-none">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>
      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-stone-50 border-t border-stone-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a key={link.name} href={`#${link.scrollTo || ''}`} onClick={(e) => { e.preventDefault(); handleNavClick(link.page, link.scrollTo); }} className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-[#2a3d57] hover:bg-stone-100">
                {link.name}
              </a>
            ))}
             <a href="#ministries" onClick={(e) => { e.preventDefault(); handleNavClick('home', 'ministries'); }} className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-[#2a3d57] hover:bg-stone-100">
                Ministérios
              </a>
              <button onClick={() => {setPage('login'); setIsMenuOpen(false);}} className="w-full mt-2 flex items-center justify-center gap-2 bg-[#2a3d57] text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-[#202e42] transition-colors duration-300">
                <LogIn size={16} />
                Área do Ministro
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

// Componente da Seção Hero
const HeroSection = () => (
  <section className="relative bg-slate-900 text-white py-28 sm:py-36 lg:py-48">
    <div className="absolute inset-0">
      <img
        src="/wallpapertest.png"
        alt="Capa do site da Igreja"
        className="w-full h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent"></div>
    </div>
    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
        Bem-vindo!
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-stone-300">
        Um lugar de fé, esperança e amor. Junte-se à nossa Igreja.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="#location" className="w-full sm:w-auto inline-block bg-[#2a3d57] hover:bg-[#202e42] text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
          Planeje sua Visita
        </a>
        <a href="#" className="w-full sm:w-auto inline-block bg-transparent border-2 border-stone-300 hover:bg-stone-50 hover:text-slate-900 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
          Assista Online
        </a>
      </div>
    </div>
  </section>
);

// Componente da Mensagem de Boas-Vindas (NOVO DESIGN)
const WelcomeMessage = () => {
  return (
    <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
                Um Lugar para Pertencer
            </h1>
            <blockquote className="mt-6">
                <p className="text-lg md:text-xl leading-relaxed text-stone-600">
                “Portanto, vocês já não são estrangeiros nem forasteiros, mas concidadãos dos santos e <strong>membros da família de Deus</strong>.”
                </p>
                <footer className="mt-4 text-sm text-stone-500">— Efésios 2:19 (NVI)</footer>
            </blockquote>
        </div>
    </section>
  );
};


// Componente de Horários (ESTILO TIMELINE)
const ScheduleSection = () => {
    const weeklySchedule = {
        "Terça-feira": [ { name: "Culto de Oração", time: "19h30", icon: <Hand size={20} /> } ],
        "Quarta-feira": [ { name: "Círculo de Oração", time: "15h00", icon: <Users size={20} /> } ],
        "Quinta-feira": [ { name: "Culto de Ensino", time: "19h45", note: "Oração às 19h15", icon: <BookOpen size={20} /> } ],
        "Sexta-feira": [ { name: "Culto da Vitória", time: "15h00", icon: <Star size={20} /> } ],
        "Sábado": [ { name: "DEPAD (Adolescentes)", time: "15h00", icon: <Users size={20} /> }, { name: "Culto de Jovens", time: "19h30", icon: <Users size={20} /> } ],
        "Domingo": [ { name: "Escola Bíblica Dominical", time: "09h00", icon: <BookMarked size={20} /> }, { name: "Programa 'A Voz da Assembleia de Deus'", time: "11h00", icon: <Radio size={20} /> }, { name: "Culto Público", time: "19h00", icon: <CalendarDays size={20} /> } ]
    };

    return (
        <section id="schedule" className="py-20 sm:py-28 bg-stone-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-base font-semibold text-[#2a3d57] tracking-wider uppercase">Nossa Programação</h2>
                    <p className="mt-2 text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">Participe Conosco</p>
                </div>
                <div className="mt-16 max-w-4xl mx-auto">
                    <div className="space-y-8">
                        {Object.entries(weeklySchedule).map(([day, events]) => (
                            <div key={day} className="flex flex-col md:flex-row gap-6 md:gap-8">
                                <div className="md:w-32 text-left md:text-center">
                                    <h3 className="text-xl font-bold text-stone-800">{day}</h3>
                                </div>
                                <div className="flex-1 space-y-4 border-l-2 border-stone-200 pl-6 md:pl-8">
                                    {events.map(event => (
                                        <div key={event.name} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-[#2a3d57]/10 text-[#2a3d57] p-2 rounded-full">{event.icon}</div>
                                                    <div>
                                                        <p className="font-bold text-stone-700">{event.name}</p>
                                                        {event.note && <p className="text-xs text-stone-500">{event.note}</p>}
                                                    </div>
                                                </div>
                                                <p className="text-lg font-bold text-[#2a3d57]">{event.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};


// Componente de Localização
const LocationSection = ({ address, phone, apiKey }) => {
    const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=Rua+Venancio+Aires,1504,Santa+Maria,RS`;
    return (
        <section id="location" className="py-20 sm:py-28 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">Visite-nos</h2>
                        <p className="mt-4 text-xl text-stone-600">Adoraríamos que você se juntasse a nós em um de nossos cultos.</p>
                        <div className="mt-8 space-y-6 border-l-4 border-[#2a3d57] pl-6">
                            <div className="flex items-start">
                                <MapPin className="h-6 w-6 text-[#2a3d57] mt-1 flex-shrink-0" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-stone-900">Endereço</h3>
                                    <p className="mt-1 text-base text-stone-600">{address}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Phone className="h-6 w-6 text-[#2a3d57] mt-1 flex-shrink-0" />
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-stone-900">Telefone</h3>
                                    <p className="mt-1 text-base text-stone-600">{phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 lg:mt-0 h-96 lg:h-full min-h-[400px]">
                        <iframe src={mapSrc} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" className="rounded-2xl shadow-xl"></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Componente de Ministérios com Abas
const MinistriesSection = ({ ministries, activeTab, setActiveTab }) => {
    const activeMinistry = ministries.find(m => m.id === activeTab);
    return (
        <section id="ministries" className="py-20 sm:py-28 bg-stone-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-base font-semibold text-[#2a3d57] tracking-wider uppercase">Envolva-se</h2>
                    <p className="mt-2 text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">Nossos Ministérios</p>
                    <p className="mt-4 text-lg text-stone-600">Encontre o seu lugar em nossa Igreja. Temos diversos departamentos atuando para o crescimento do Reino de Deus.</p>
                </div>
                <div className="mt-16 flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-7xl mx-auto">
                    <div className="lg:w-1/3 flex-shrink-0">
                        <ul className="space-y-2">
                            {ministries.map((ministry) => (
                                <li key={ministry.id}>
                                    <a href={`#${ministry.id}`} onClick={(e) => { e.preventDefault(); setActiveTab(ministry.id); }} className={`w-full flex items-center gap-3 p-4 rounded-lg text-left font-semibold transition-all duration-200 ${activeTab === ministry.id ? 'bg-[#2a3d57] text-white shadow-lg' : 'bg-white hover:bg-[#2a3d57]/10 hover:text-[#2a3d57] text-stone-700'}`}>
                                        {ministry.icon}
                                        <span>{ministry.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="lg:w-2/3 bg-white p-8 md:p-12 rounded-2xl shadow-xl">
                        {activeMinistry && (
                            <div>
                                <h3 className="text-3xl font-bold text-stone-900">{activeMinistry.name}</h3>
                                <p className="mt-4 text-lg text-stone-600">Aqui teremos a descrição sobre o ministério {activeMinistry.name}. Fale sobre os objetivos, atividades, como participar e quem são os líderes.</p>
                                <p className="mt-4 text-lg text-stone-600">Podemos adicionar fotos, vídeos e informações de contato específicas para este departamento.</p>
                                <a href="#" className="mt-6 inline-block bg-[#2a3d57] hover:bg-[#202e42] text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300">Saber Mais</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

// Seção de Congregações
const CongregationsSection = () => (
    <section className="py-20 sm:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">Nossas Congregações</h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-stone-600">Explore o mapa de nossas congregações e encontre uma igreja perto de você.</p>
            <div className="mt-12 rounded-2xl shadow-xl overflow-hidden">
                <iframe src="https://www.google.com/maps/d/u/0/embed?mid=1rURiewtiWetlNdZPz8IziCAUJVFF35Q&ehbc=2E312F" className="w-full h-96 md:h-[600px]" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
        </div>
    </section>
);

// Componente do Rodapé (DESIGN MELHORADO)
const Footer = ({ logoUrl, address, phone, socialLinks, setPage, setScrollToId }) => (
  <footer className="bg-slate-900 text-stone-300 border-t-4 border-[#2a3d57]">
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 flex flex-col items-center md:items-start">
          <img src={logoUrl} alt="Logo" className="h-16 w-auto mb-4" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x40/ffffff/1e293b?text=Logo'; }}/>
          <p className="text-sm text-center md:text-left text-stone-400">Um lugar de fé, esperança e amor para toda a família.</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white">Navegação</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="#" onClick={(e) => {e.preventDefault(); setPage('home'); setScrollToId(null);}} className="text-stone-400 hover:text-white transition-colors">Início</a></li>
            <li><a href="#" onClick={(e) => {e.preventDefault(); setPage('institutional');}} className="text-stone-400 hover:text-white transition-colors">Institucional</a></li>
            <li><a href="#ministries" onClick={(e) => {e.preventDefault(); setPage('home'); setScrollToId('ministries');}} className="text-stone-400 hover:text-white transition-colors">Ministérios</a></li>
            <li><a href="#" onClick={(e) => {e.preventDefault(); setPage('events');}} className="text-stone-400 hover:text-white transition-colors">Eventos</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Contato</h3>
          <ul className="mt-4 space-y-3 text-stone-400">
            <li className="flex items-start gap-3">
              <MapPin size={20} className="flex-shrink-0 mt-1"/>
              <span>{address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={20} className="flex-shrink-0 mt-1"/>
              <span>{phone}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Redes Sociais</h3>
          <div className="flex items-center gap-4 mt-4">
            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full text-stone-400 hover:text-white hover:bg-[#2a3d57] transition-all"><span className="sr-only">Instagram</span><Instagram size={24} /></a>
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-full text-stone-400 hover:text-white hover:bg-[#2a3d57] transition-all"><span className="sr-only">Facebook</span><Facebook size={24} /></a>
          </div>
        </div>
      </div>
      <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-stone-400">
        <p>© {new Date().getFullYear()} DECOM - TECNOLOGIA DA INFORMAÇÃO. Todos os Direitos Reservados.</p>
      </div>
    </div>
  </footer>
);

// PÁGINA PRINCIPAL (HOME)
const HomePage = ({ ministries, activeMinistryTab, setActiveMinistryTab }) => (
    <>
        <HeroSection />
        <WelcomeMessage />
        <ScheduleSection />
        <LocationSection address="R. Venâncio Aires, 1504 - Centro, Santa Maria - RS, 97010-001" phone="(55) 3221-5863" apiKey="AIzaSyCat-KJwpVkCjR7Bux7IOeZvwssr48nLbw" />
        <MinistriesSection ministries={ministries} activeTab={activeMinistryTab} setActiveTab={setActiveMinistryTab} />
        <CongregationsSection />
    </>
);

// PÁGINA INSTITUCIONAL
const InstitutionalPage = ({ logoUrl }) => {
    const [activeTab, setActiveTab] = useState('diretoria');
    const tabs = [
        { id: 'diretoria', name: "Diretoria", icon: <Users size={20} /> }, { id: 'palavra', name: "Palavra do Presidente", icon: <MessageSquare size={20} /> },
        { id: 'historia', name: "Nossa História", icon: <Book size={20} /> }, { id: 'assessorias', name: "Assessorias da Presidência", icon: <Briefcase size={20} /> },
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
        "Comissão de Exame de Contas": [ { role: "Coordenadora", name: "Eloise Andrade" }, { role: "Relator", name: "Heverton Hautrive" }, { role: "Secretário", name: "Nilton Rosa Lopes" }, { role: "Membro", name: "Zípora de Oliveira Campos Nunes" }, { role: "Membro", name: "Rosaura Elisabeth Severo" }, { role: "Membro", name: "Marta Martins" }, ],
        "Assessoria Administrativa": [ { role: "Secretária Adjunta", name: "Cláudia Mucenecki" }, { role: "Tesoureiro Adjunto", name: "Pr. Paulo Ricardo Moraes" }, ],
        "Co-Pastor": [{ role: "", name: "Pr. Renato Charão" }],
        "Supervisores Regionais": [ { role: "Região 1", name: "Pr. Moisés Lamberty e Pr. Alcindo Costa" }, { role: "Região 2", name: "Pr. José de Ávila" }, { role: "Região 3", name: "Pr. Adailto Cassol" }, { role: "Região 4", name: "Pr. Renato Charão" }, { role: "Região 5", name: "Ev. Davi Soares" }, { role: "Região 6", name: "Pr. Paulo Ricardo Moraes" }, { role: "Região 7", name: "Pr. Joel Jardim" }, ],
        "Comissão do Crivo Ministerial": [ { role: "Coordenador", name: "Ev. Emerson Rolim" }, { role: "Relator", name: "Ev. Roberto Belle" }, { role: "Membro", name: "Ev. Elton Reis" }, { role: "Membro", name: "Ev. Renato Kuhn" }, { role: "Membro", name: "Ev. Adonir Marques" }, ],
        "Comissão de Ética e Disciplina": [ { role: "Coordenador", name: "Pr. Renato Charão" }, { role: "Relator", name: "Pr. Paulo Ricardo Moraes" }, { role: "Membro", name: "Pr. Adailto Cassol" }, { role: "Membro", name: "Pr. Alcindo Costa" }, { role: "Membro", name: "Pr. Cláudio Moisés Ferreira" }, { role: "Membro", name: "Pr. Joel Jardim" }, { role: "Membro", name: "Pr. José de Ávila" }, { role: "Membro", name: "Pr. Manoel Cezar" }, { role: "Membro", name: "Pr. Salvador da Silva" }, ],
        "Comissão de Política": [ { role: "", name: "Pb. Ishmael Vieira" }, { role: "", name: "Ev. Emerson Rolim" }, { role: "", name: "Ev. Elton Reis" }, ],
        "Conselho Ministerial": [ { role: "", name: "Pr. Renato Charão" }, { role: "", name: "Pr. José de Ávila" }, { role: "", name: "Pr. Alcindo Costa" }, ]
    };
    const renderContent = () => {
        const president = diretoria.find(m => m.role === 'Presidente');
        switch (activeTab) {
            case 'diretoria': return ( <div> <h3 className="text-3xl font-bold text-stone-900 mb-8">Diretoria</h3> <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"> {diretoria.map(membro => ( <div key={membro.name} className="bg-stone-50 p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300"> <img src={membro.imageUrl} alt={`Foto de ${membro.name}`} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-md" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/256x256/cccccc/969696?text=Foto'; }} /> <p className="font-bold text-[#2a3d57]">{membro.role}</p> <p className="text-lg font-semibold text-stone-800 mt-1">{membro.name}</p> </div> ))} </div> </div> );
            case 'palavra': return ( <div> <h3 className="text-3xl font-bold text-stone-900 mb-6">Palavra do Presidente</h3> <div className="prose prose-lg max-w-none text-stone-700"> <blockquote className="border-l-4 border-[#2a3d57] pl-4 italic"> “Mas nós perseveraremos na oração e no ministério da palavra.” At 6.4 </blockquote> <p>Dirijo-me aos queridos irmãos com muita alegria saudando a todos com nossa costumeira e calorosa saudação assembleiana: A Paz do Senhor Jesus, nosso Senhor e Salvador.</p> <p>Enfrentamos um 2024 de muitos desafios, experimentamos situações novas que jamais imaginaríamos passar, mas em tudo fomos vencedores na pessoa bendita de Cristo. Agora, as aflições de antes e de ontem não podem mais nos alcançar, por isso disse o Apóstolo Paulo “deixando as coisas que para trás ficam, avanço para o alvo”. Diante disso, o que temos é a cada dia a oportunidade nova e abençoada que Deus nos dá de viver e vivendo, servir a Ele e a sua Obra.</p> <p>Em 2024 nosso lema foi focado na Palavra de Deus – a Santa Bíblia. Em 2025 continuaremos perseverando na Palavra sem descuidar das outras funções principais da Igreja de Cristo na terra, como a adoração verdadeira, o culto, a fidelidade, as virtudes bíblicas, a evangelização, a missão, os trabalhos sociais e as visitas aos necessitados através da Capelania e obreiros da Igreja em todo o campo da IEADSM.</p> <p>Prossigamos, sabendo que nosso descanso e coroação não é aqui, mas está reservado um dia para que a Igreja de Cristo receba das mãos do seu Senhor o seu galardão.</p> <p>Deixo minha palavra de orientação e aconselhamento a todos os obreiros, esposas e membros da IEADSM: vamos nos fortalecer naquilo que realmente edifica que é a Palavra de Deus e servir a Deus cada dia mais com inteireza de coração, pois estamos muito perto do grande dia da Igreja.</p> <p>Fortalecei-vos uns aos outros! Vamos chorar com os que choram, nos alegrar com os que se alegram e continuar nos quatro cantos de Santa Maria dizendo que Jesus Cristo é o Senhor, que Ele salva, cura, batiza com o Espírito Santo e brevemente vai voltar para buscar a sua Igreja.</p> <p>Por fim desejo a todos os queridos irmãos um 2025 abençoado em todos os sentidos da vossa vida e que nossa igreja possa crescer para a glória de Deus, sabendo que todos são importantes para o reino de Deus.</p> <div className="mt-12 flex justify-end items-center gap-4 not-prose"> <div className="text-right"> <p className="font-bold">Pr. Moisés Lamberty</p> <p className="text-sm">Presidente da Igreja Evangélica Assembleia de Deus de Santa Maria - RS</p> </div> <img src={president.imageUrl} alt={`Foto de ${president.name}`} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" /> </div> </div> </div> );
            case 'historia': return ( <div> <h3 className="text-3xl font-bold text-stone-900 mb-6">Nossa História</h3> <p className="text-lg text-stone-600"> A história da nossa igreja é uma jornada de fé, perseverança e da manifestação do poder de Deus. Desde a sua fundação, temos visto vidas transformadas e a comunidade abençoada. </p> <p className="mt-4 text-lg text-stone-600"> (Esta secção será preenchida com a história detalhada da Igreja Evangélica Assembleia de Deus de Santa Maria/RS.) </p> </div> );
            case 'assessorias': return ( <div> <h3 className="text-3xl font-bold text-stone-900 mb-8">Assessorias da Presidência</h3> <div className="space-y-8"> {Object.entries(assessorias).map(([title, members]) => ( <div key={title}> <h4 className="text-xl font-bold text-[#202e42] border-b-2 border-[#2a3d57]/20 pb-2 mb-4">{title}</h4> <ul className="space-y-2"> {members.map(member => ( <li key={member.name} className="flex items-baseline"> {member.role && <span className="font-semibold w-40 flex-shrink-0 text-stone-600">{member.role}:</span>} <span className="text-stone-800">{member.name}</span> </li> ))} </ul> </div> ))} </div> </div> );
            default: return null;
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
                            {tabs.map((tab) => ( <li key={tab.id}> <button onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 p-4 rounded-lg text-left font-semibold transition-all duration-200 ${activeTab === tab.id ? 'bg-[#2a3d57] text-white shadow-lg' : 'bg-white hover:bg-[#2a3d57]/10 hover:text-[#2a3d57] text-stone-700'}`}> {tab.icon} <span>{tab.name}</span> </button> </li> ))}
                        </ul>
                    </div>
                    <div className="lg:w-3/4 bg-stone-50 p-8 md:p-12 rounded-2xl shadow-inner"> {renderContent()} </div>
                </div>
            </div>
        </div>
    );
};

// PÁGINA DE EVENTOS
const EventsPage = () => {
  const pdfUrl = "/agendaieadsm.pdf"; 

  return (
    <div className="bg-stone-50 py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-base font-semibold text-[#2a3d57] tracking-wider uppercase">
            Agenda da Igreja
          </h2>
          <p className="mt-2 text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">
            Calendário Geral
          </p>
          <p className="mt-4 text-lg text-stone-600">
            Consulte a nossa agenda completa de eventos e atividades.
          </p>
        </div>

        <div className="mt-16 max-w-5xl mx-auto">
          <PdfFlipbook
            fileUrl={pdfUrl}
            singlePageBreakpoint={768}   // 1 página no mobile, 2 no desktop
            // bottomGapPx={32}           // ajuste se tiver barra fixa no rodapé
          />
        </div>
      </div>
    </div>
  );
};



// PÁGINA DE LOGIN
const LoginPage = () => (
    <div className="bg-white py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <IconWrapper><LogIn size={32} /></IconWrapper>
            <h2 className="mt-6 text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">Área do Ministro</h2>
            <p className="mt-4 text-xl text-stone-600">A área de login para ministros está em desenvolvimento.</p>
        </div>
    </div>
);

// PÁGINA DE CONTATO
const ContactPage = ({ address, phone }) => (
    <div className="bg-stone-50 py-20 sm:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-base font-semibold text-[#2a3d57] tracking-wider uppercase">Fale Conosco</h2>
                <p className="mt-2 text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">Entre em Contato</p>
                <p className="mt-4 text-lg text-stone-600">Estamos aqui para ajudar. Envie-nos uma mensagem ou visite-nos.</p>
            </div>
            <div className="mt-16 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-lg">
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-stone-900">Informações de Contato</h3>
                        <ul className="mt-4 space-y-4 text-stone-600">
                             <li className="flex items-start gap-3">
                                <MapPin size={20} className="flex-shrink-0 mt-1 text-[#2a3d57]"/>
                                <span>{address}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone size={20} className="flex-shrink-0 mt-1 text-[#2a3d57]"/>
                                <span>{phone}</span>
                            </li>
                             <li className="flex items-start gap-3">
                                <Mail size={20} className="flex-shrink-0 mt-1 text-[#2a3d57]"/>
                                <span>adsantamariars@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-stone-900">Envie uma Mensagem</h3>
                    <form className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="sr-only">Nome</label>
                            <input type="text" name="name" id="name" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-[#2a3d57] focus:border-[#2a3d57] placeholder-stone-500" placeholder="Seu Nome" />
                        </div>
                         <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input type="email" name="email" id="email" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-[#2a3d57] focus:border-[#2a3d57] placeholder-stone-500" placeholder="Seu Email" />
                        </div>
                         <div>
                            <label htmlFor="subject" className="sr-only">Assunto</label>
                            <input type="text" name="subject" id="subject" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-[#2a3d57] focus:border-[#2a3d57] placeholder-stone-500" placeholder="Assunto" />
                        </div>
                        <div>
                            <label htmlFor="message" className="sr-only">Mensagem</label>
                            <textarea name="message" id="message" rows="4" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-[#2a3d57] focus:border-[#2a3d57] placeholder-stone-500" placeholder="Sua Mensagem"></textarea>
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#2a3d57] text-white font-semibold px-4 py-3 rounded-lg shadow-sm hover:bg-[#202e42] transition-colors duration-300">
                            Enviar Mensagem
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
);

// Componente do Selo de Desenvolvimento
const DevelopmentSeal = () => (
  <div className="fixed bottom-0 left-0 right-0 bg-amber-500 text-white text-center p-2 text-sm z-50 flex items-center justify-center gap-2">
    <HardHat size={16} />
    <span>Este portal está em desenvolvimento. Algumas funcionalidades podem não estar disponíveis.</span>
  </div>
);


// Componente Principal da Aplicação
export default function App() {
  const [page, setPage] = useState('home');
  const [scrollToId, setScrollToId] = useState(null);
  const churchInfo = {
    name: "Igreja Evangélica Assembleia de Deus de Santa Maria/RS",
    logoUrlLight: "/logo-dark.svg",
    logoUrlDark: "/logo-light.svg",
    address: "R. Venâncio Aires, 1504 - Centro, Santa Maria - RS, 97010-001",
    phone: "(55) 3221-5863",
    socialLinks: {
        instagram: "https://www.instagram.com/adsantamariars/",
        facebook: "https://www.facebook.com/adsantamariars/?locale=pt_BR"
    }
  };
  const ministries = [
    { id: 'umadesma', name: "União da Mocidade - UMADESMA", icon: <Users size={20} /> }, { id: 'depad', name: "Adolescentes - DEPAD", icon: <Users size={20} /> }, { id: 'decom', name: "Comunicação - DECOM", icon: <Megaphone size={20} /> },
    { id: 'afinidade', name: "Amigos Fiéis da Nova Idade - AFINIDADE", icon: <Smile size={20} /> }, { id: 'defam', name: "Família - DEFAM", icon: <Heart size={20} /> }, { id: 'ebd', name: "Escola Bíblica Dominical - EBD", icon: <BookMarked size={20} /> },
    { id: 'musica', name: "Música", icon: <Music size={20} /> }, { id: 'discipulado', name: "Discipulado", icon: <UserCheck size={20} /> }, { id: 'acaoSocial', name: "Ação Social", icon: <Handshake size={20} /> },
    { id: 'capelania', name: "Capelania", icon: <Stethoscope size={20} /> }, { id: 'evangelismo', name: "Evangelismo", icon: <Speaker size={20} /> }, { id: 'depinf', name: "Infantil - DEPINF", icon: <Smile size={20} /> },
    { id: 'ufadesma', name: "União Feminina - UFADESMA", icon: <Users size={20} /> }, { id: 'voz', name: "Programa “A Voz da Assembleia de Deus”", icon: <Radio size={20} /> }, { id: 'missoes', name: "Missões", icon: <Globe2 size={20} /> },
  ];
  const [activeMinistryTab, setActiveMinistryTab] = useState(ministries[0].id);

  useEffect(() => {
    if (page === 'home' && scrollToId) {
      const element = document.getElementById(scrollToId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          setScrollToId(null);
        }, 100);
      }
    } else if (!scrollToId) {
        window.scrollTo(0, 0);
    }
  }, [page, scrollToId]);

  return (
    <div className="bg-stone-50 font-sans antialiased pb-10">
      <Header 
        churchName={churchInfo.name} 
        logoUrl={churchInfo.logoUrlLight} 
        ministries={ministries}
        setActiveMinistryTab={setActiveMinistryTab}
        setPage={setPage}
        setScrollToId={setScrollToId}
      />
      <main>
        {page === 'home' && <HomePage ministries={ministries} activeMinistryTab={activeMinistryTab} setActiveMinistryTab={setActiveMinistryTab} />}
        {page === 'institutional' && <InstitutionalPage logoUrl={churchInfo.logoUrlLight} />}
        {page === 'events' && <EventsPage />}
        {page === 'login' && <LoginPage />}
        {page === 'contact' && <ContactPage address={churchInfo.address} phone={churchInfo.phone} />}
      </main>
      <Footer 
        logoUrl={churchInfo.logoUrlDark}
        address={churchInfo.address}
        phone={churchInfo.phone}
        socialLinks={churchInfo.socialLinks}
        setPage={setPage}
        setScrollToId={setScrollToId}
      />
      <DevelopmentSeal />
    </div>
  );
}
