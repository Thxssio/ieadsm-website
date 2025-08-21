"use client";

import Link from "next/link";
import { MapPin, Phone, Instagram, Facebook } from "lucide-react";

export default function Footer({
  logoUrl,
  address,
  phone,
  socialLinks,
  tagline = "Um lugar de fé, esperança e amor para toda a família.",
}) {
  return (
    <footer className="bg-slate-900 text-stone-300 border-t-4 border-[#2a3d57]">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e slogan */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <img
              src={logoUrl}
              alt="Logo"
              className="h-20 md:h-24 lg:h-28 w-auto mb-4 object-contain"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/160x80/ffffff/1e293b?text=Logo";
              }}
            />
            <p className="text-sm text-center md:text-left text-stone-400">
              {tagline}
            </p>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="text-lg font-semibold text-white">Navegação</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-stone-400 hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/institutional" className="text-stone-400 hover:text-white transition-colors">
                  Institucional
                </Link>
              </li>
              <li>
                <Link href="/#ministries" className="text-stone-400 hover:text-white transition-colors">
                  Ministérios
                </Link>
              </li>
              <li>
                <Link href="/eventos" className="text-stone-400 hover:text-white transition-colors">
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-stone-400 hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-semibold text-white">Contato</h3>
            <ul className="mt-4 space-y-3 text-stone-400">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="flex-shrink-0 mt-1" />
                <span>{address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={20} className="flex-shrink-0 mt-1" />
                <span>{phone}</span>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="text-lg font-semibold text-white">Redes Sociais</h3>
            <div className="flex items-center gap-4 mt-4">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 rounded-full text-stone-400 hover:text-white hover:bg-[#2a3d57] transition-all"
                >
                  <span className="sr-only">Instagram</span>
                  <Instagram size={24} />
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 rounded-full text-stone-400 hover:text-white hover:bg-[#2a3d57] transition-all"
                >
                  <span className="sr-only">Facebook</span>
                  <Facebook size={24} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Links legais */}
        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-stone-400 space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-6 space-y-1 sm:space-y-0">
            <Link
              href="https://adsantamariars.com.br/politica-de-privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Política de Privacidade
            </Link>
            <Link
              href="https://adsantamariars.com.br/excluir-dados"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Como Excluir Meus Dados
            </Link>
            <Link
              href="https://adsantamariars.com.br/termos-de-servico"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Termos de Serviço
            </Link>
          </div>
          <p className="mt-4">
            © {new Date().getFullYear()} DECOM - TECNOLOGIA DA INFORMAÇÃO. Todos os Direitos Reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
