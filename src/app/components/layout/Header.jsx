"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, LogIn, User, LogOut } from "lucide-react";
import { useAuth } from "../../lib/firebase/AuthContext"; // 1. Importa o hook de autenticação
import { auth } from "../../lib/firebase/client"; // 2. Importa o auth para o logout

export default function Header({ churchName, logoUrl, ministries = [] }) {
  const { user } = useAuth(); // 3. Usa o hook para obter o usuário logado
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMinistriesOpen, setIsMinistriesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const ministriesTimeout = useRef(null);
  const userMenuTimeout = useRef(null);

  const links = [
    { name: "Início", href: "/" },
    { name: "Institucional", href: "/institutional" },
    { name: "Eventos", href: "/eventos" },
    { name: "Contato", href: "/contato" },
  ];

  const openMinistries = () => { clearTimeout(ministriesTimeout.current); setIsMinistriesOpen(true); };
  const closeMinistries = () => { ministriesTimeout.current = setTimeout(() => setIsMinistriesOpen(false), 200); };
  const openUserMenu = () => { clearTimeout(userMenuTimeout.current); setIsUserMenuOpen(true); };
  const closeUserMenu = () => { userMenuTimeout.current = setTimeout(() => setIsUserMenuOpen(false), 200); };

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 bg-[#abcedd] shadow-md ring-1 ring-black/5 supports-[backdrop-filter]:bg-[#abcedd]/90 supports-[backdrop-filter]:backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group" aria-label="Ir para a página inicial">
            <img
              className="block h-14 md:h-16 lg:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              src={logoUrl}
              alt={`Logo ${churchName}`}
              onError={(e) => { e.currentTarget.src = "https://placehold.co/160x60/0ea5e9/ffffff?text=Logo"; }}
            />
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex md:items-center md:space-x-6" aria-label="Navegação principal">
            {links.map((l) => (
              <Link key={l.name} href={l.href} className="text-stone-600 hover:text-[#2a3d57] font-medium px-2 py-1 transition-colors">
                {l.name}
              </Link>
            ))}

            {/* Dropdown Ministérios */}
            <div className="relative" onMouseEnter={openMinistries} onMouseLeave={closeMinistries}>
              <Link href="/#ministries" className="text-stone-600 hover:text-[#2a3d57] font-medium flex items-center gap-1 px-2 py-1 transition-colors" aria-haspopup="true" aria-expanded={isMinistriesOpen}>
                Ministérios <ChevronDown size={16} />
              </Link>
              {isMinistriesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[34rem] bg-white rounded-lg shadow-xl p-4 z-20 ring-1 ring-black/5">
                  <ul className="grid grid-cols-2 gap-2">
                    {ministries.map((m) => (
                      <li key={m.id}>
                        <Link href={`/#ministry-${m.id}`} onClick={() => setIsMinistriesOpen(false)} className="w-full flex items-center gap-3 p-3 rounded-md text-left font-medium text-sm text-stone-700 hover:bg-[#2a3d57]/10 hover:text-[#2a3d57] transition-colors">
                          {m.icon}
                          <span>{m.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 4. Lógica Condicional: Botão de Login OU Menu do Usuário */}
            {user ? (
              <div className="relative ml-4" onMouseEnter={openUserMenu} onMouseLeave={closeUserMenu}>
                <button className="flex items-center gap-2 text-stone-600 hover:text-[#2a3d57] font-medium px-2 py-1 transition-colors">
                  <User size={18} />
                  <span>{user.displayName || 'Usuário'}</span>
                  <ChevronDown size={16} />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 ring-1 ring-black/5">
                    <div className="p-2">
                      <Link href="/portal" onClick={() => setIsUserMenuOpen(false)} className="block w-full text-left px-4 py-2 text-sm text-stone-700 rounded-md hover:bg-slate-100">Acessar Portal</Link>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 rounded-md hover:bg-slate-100">Sair</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="ml-4 flex items-center gap-2 bg-[#2a3d57] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#202e42] transition-colors">
                <LogIn size={16} />
                Área do Ministro
              </Link>
            )}
          </nav>

          {/* Botão Mobile */}
          <button onClick={() => setIsMenuOpen((v) => !v)} className="md:hidden text-stone-700 hover:text-[#2a3d57]" aria-label="Abrir menu" aria-expanded={isMenuOpen}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-stone-50 border-t border-stone-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((l) => (
              <Link key={l.name} href={l.href} onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-[#2a3d57] hover:bg-stone-100 transition-colors">
                {l.name}
              </Link>
            ))}
            <Link href="/#ministries" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-[#2a3d57] hover:bg-stone-100 transition-colors">
              Ministérios
            </Link>

            {/* 5. Lógica Condicional no Menu Mobile */}
            {user ? (
              <div className="border-t pt-3 mt-2">
                 <div className="px-3 py-2">
                    <p className="font-medium text-stone-800">Logado como</p>
                    <p className="text-sm text-stone-600">{user.displayName || user.email}</p>
                 </div>
                 <Link href="/portal" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-[#2a3d57] hover:bg-stone-100 transition-colors">Acessar Portal</Link>
                 <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-stone-100 transition-colors">Sair</button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full mt-2 flex items-center justify-center gap-2 bg-[#2a3d57] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#202e42] transition-colors">
                <LogIn size={16} />
                Área do Ministro
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
