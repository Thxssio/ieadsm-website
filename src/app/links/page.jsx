    "use client";

      import { useState, useEffect } from 'react';
      import { useDarkMode } from "@/hooks/useDarkMode";
    import Image from "next/image";

    const MoonIcon = () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
    );

    const SunIcon = () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
    );

    const ShareIcon = () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12v8c0 1.1.9 2 2 2h12a2 2 0 002-2v-8m-4-6l-4-4-4 4m4-4v12"></path></svg>
    );

    const MoreIcon = () => (
        <svg className="w-5 h-5 text-gray-400 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/></svg>
    );

    const SocialIcons = () => (
        <div className="flex space-x-5 mt-4">
            <a href="https://www.instagram.com/adsantamariars/" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.626c-3.141 0-3.495.012-4.71.068-2.818.128-4.015 1.314-4.15 4.15-.056 1.215-.067 1.569-.067 4.71s.011 3.495.067 4.71c.135 2.836 1.332 4.022 4.15 4.15 1.215.056 1.569.067 4.71.067s3.495-.011 4.71-.067c2.818-.128 4.015-1.314 4.15-4.15.056-1.215.067-1.569.067-4.71s-.011-3.495-.067-4.71c-.135-2.836-1.332-4.022-4.15-4.15-1.215-.056-1.569-.067-4.71-.067zm0 3.442c-2.403 0-4.35 1.947-4.35 4.35s1.947 4.35 4.35 4.35 4.35-1.947 4.35-4.35-1.947-4.35-4.35-4.35zm0 7.164c-1.554 0-2.814-1.26-2.814-2.814s1.26-2.814 2.814-2.814 2.814 1.26 2.814 2.814-1.26 2.814-2.814 2.814zm4.448-7.562c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1z"></path></svg></a>
            <a href="mailto:contato@adsm.org.br" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path></svg></a>
            <a href="https://www.facebook.com/ADSantaMariaRS/" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg></a>
            <a href="https://www.youtube.com/c/ADSMcomunica" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21.582 7.243c-.24-.88-.9-1.54-1.78-1.78C18.25 5 12 5 12 5s-6.25 0-7.802.463c-.88.24-1.54.9-1.78 1.78C2 8.793 2 12 2 12s0 3.207.418 4.757c.24.88.9 1.54 1.78 1.78C5.75 19 12 19 12 19s6.25 0 7.802-.463c.88-.24 1.54-.9 1.78-1.78C22 15.207 22 12 22 12s0-3.207-.418-4.757zM9.75 15.5V8.5l6 3.5-6 3.5z"></path></svg></a>
        </div>
    );

    // --- Componente Principal da Página ---
    export default function LinktreePage() {
          const { isDark, toggle } = useDarkMode();
          const [showToast, setShowToast] = useState(false);
          // Estado para garantir que o componente só renderiza no lado do cliente
          const [isMounted, setIsMounted] = useState(false);

          // Efeito para indicar que o componente está montado
          useEffect(() => {
              setIsMounted(true);
          }, []);

        // Função para o botão de compartilhar
        const handleShare = () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000); // Esconde o toast após 3 segundos
            }).catch(err => {
                console.error('Erro ao copiar link: ', err);
            });
        };
        
        // Dados dos links para facilitar a manutenção
        const links = [
            { href: "#", text: "CAPACITAÇÃO PARA PROFESSORES DA EBD | 3º TRIMESTRE" },
            { href: "https://api.whatsapp.com/send?phone=555599999999", text: "IEADSM | WHATSAPP", icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" },
            { href: "#", text: "AGENDA IEADSM | 2025", icon: "https://adsm.org.br/wp-content/uploads/2022/08/logo-adsm-azul.png" },
            { href: "#", text: "INSCRIÇÃO | ESCOLA DE MÚSICA FLORAVANTE BASTOS.", icon: "https://placehold.co/100x100/1e40af/ffffff?text=EFB" },
            { href: "#", text: "IEADSM | NOSSAS CONGREGAÇÕES.", icon: "https://adsm.org.br/wp-content/uploads/2022/08/logo-adsm-azul.png" },
            { href: "#", text: "PIX IEADSM", icon: "https://adsm.org.br/wp-content/uploads/2022/08/logo-adsm-azul.png" },
            { href: "https://maps.app.goo.gl/r5yF6f7z8a9b10c29", text: "ENDEREÇO DO TEMPLO MATRIZ DA IEADSM", icon: "https://adsm.org.br/wp-content/uploads/2022/08/logo-adsm-azul.png" },
            { href: "https://www.ciepadergs.com.br/", text: "SITE CIEPADERGS", icon: "https://www.ciepadergs.com.br/img/logo.png" },
            { href: "https://cgadb.org.br/", text: "SITE CGADB", icon: "https://cgadb.org.br/wp-content/uploads/2021/04/cropped-cgadb-1.png" },
        ];
        
        // Evita a renderização no servidor para prevenir erros de hidratação
        if (!isMounted) {
            return null;
        }

        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-white font-sans">
                <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen w-full max-w-lg">
                    
                    {/* Botões de Ação Superiores */}
                    <div className="w-full flex justify-between items-center px-2 mb-6">
                      <button onClick={toggle} className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 transition-colors">
                              {isDark ? <SunIcon /> : <MoonIcon />}
                          </button>
                        <button onClick={handleShare} className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 transition-colors">
                            <ShareIcon />
                        </button>
                    </div>

                    <main className="w-full text-center">
                        {/* Seção do Perfil */}
                        <header className="flex flex-col items-center mb-6">
                            <Image
                                className="w-24 h-24 rounded-full object-contain shadow-lg mb-4 bg-white p-1"
                                src="https://adsm.org.br/wp-content/uploads/2022/08/logo-adsm-azul.png"
                                alt="Logo AD Santa Maria"
                                width={96}
                                height={96}
                                onError={(e) => { e.currentTarget.src='https://placehold.co/200x200/e0e0e0/333333?text=Logo'; }}
                                unoptimized
                            />
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">@adsantamariars</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 px-4">Igreja Evangélica Assembleia de Deus de Santa Maria/RS.</p>
                            <SocialIcons />
                        </header>

                        {/* Seção de Links */}
                        <div className="w-full flex flex-col space-y-4">
                            {links.map((link, index) => (
                                <a 
                                    key={index}
                                    href={link.href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="border-2 border-gray-300/80 dark:border-gray-500/80 font-semibold py-3 px-4 rounded-lg flex items-center w-full transition-all transform hover:scale-[1.02] hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    {link.icon && <Image src={link.icon} width={24} height={24} className={`w-6 h-6 mr-3 ${link.icon.includes('placehold') || link.icon.includes('adsm') ? 'rounded-full' : ''}`} alt="" unoptimized />}
                                    <span className={`flex-grow text-sm ${link.icon ? 'text-left' : 'text-center'}`}>{link.text}</span>
                                    <MoreIcon />
                                </a>
                            ))}
                        </div>
                    </main>
                    
                    {/* Rodapé */}
                    <footer className="text-center mt-12">
                        <p className="text-sm text-gray-500">
                            Igreja Evangélica Assembleia de Deus de Santa Maria
                        </p>
                    </footer>
                </div>

                {/* Toast de Notificação */}
                <div className={`fixed left-1/2 -translate-x-1/2 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg transition-all duration-500 ${showToast ? 'bottom-5 opacity-100' : '-bottom-20 opacity-0'}`}>
                    Link copiado para a área de transferência!
                </div>
            </div>
        );
    }

