
import { MapPin, Phone, Mail } from "lucide-react";
import { churchInfo } from "../lib/churchInfo";

export const metadata = {
  title: "Contato — IEADSM",
  description: "Fale conosco. Endereço, telefone e formulário de contato.",
};

export default function ContactPage() {
  const { address, phone } = churchInfo;

  return (
    <div className="bg-stone-50 py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-base font-semibold text-[#2a3d57] tracking-wider uppercase">
            Fale Conosco
          </h2>
          <p className="mt-2 text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">
            Entre em Contato
          </p>
          <p className="mt-4 text-lg text-stone-600">
            Estamos aqui para ajudar. Envie-nos uma mensagem ou visite-nos.
          </p>
        </div>

        <div className="mt-16 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-lg">
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-stone-900">Informações de Contato</h3>
              <ul className="mt-4 space-y-4 text-stone-600">
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="flex-shrink-0 mt-1 text-[#2a3d57]" />
                  <span>{address}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={20} className="flex-shrink-0 mt-1 text-[#2a3d57]" />
                  <span>{phone}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={20} className="flex-shrink-0 mt-1 text-[#2a3d57]" />
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
                <input
                  type="text" id="name" name="name"
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-[#2a3d57] focus:border-[#2a3d57] placeholder-stone-500"
                  placeholder="Seu Nome"
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  type="email" id="email" name="email"
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-[#2a3d57] focus:border-[#2a3d57] placeholder-stone-500"
                  placeholder="Seu Email"
                />
              </div>
              <div>
                <label htmlFor="subject" className="sr-only">Assunto</label>
                <input
                  type="text" id="subject" name="subject"
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-[#2a3d57] focus:border-[#2a3d57] placeholder-stone-500"
                  placeholder="Assunto"
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">Mensagem</label>
                <textarea
                  id="message" name="message" rows={4}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-[#2a3d57] focus:border-[#2a3d57] placeholder-stone-500"
                  placeholder="Sua Mensagem"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#2a3d57] text-white font-semibold px-4 py-3 rounded-lg shadow-sm hover:bg-[#202e42] transition-colors duration-300"
              >
                Enviar Mensagem
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
