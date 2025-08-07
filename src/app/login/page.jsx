"use client"; // Esta linha transforma o componente para rodar no navegador

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from "lucide-react";
import IconWrapper from "../components/common/IconWrapper";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  // Lógica que roda no navegador para verificar se já existe uma sessão
  useEffect(() => {
    const verifySession = async () => {
      try {
        // Pergunta para a nossa API se o usuário está logado
        const response = await fetch('/api/auth/session');
        
        if (response.ok) {
          // Se a API responder "sim", redireciona imediatamente
          router.push('/portal'); 
        } else {
          // Se responder "não", para de verificar e mostra a página
          setIsVerifying(false);
        }
      } catch (error) {
        console.error("Falha ao verificar sessão:", error);
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [router]);

  // Enquanto a verificação acontece, mostramos uma mensagem de carregamento
  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-lg text-stone-600">Verificando sessão...</p>
      </div>
    );
  }

  // Se a verificação terminou e o usuário não foi redirecionado, mostra o formulário de login
  return (
    <div className="bg-white py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <IconWrapper><LogIn size={32} /></IconWrapper>

        <h1 className="mt-6 text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">
          Área do Ministro
        </h1>
        <p className="mt-4 text-lg text-stone-600">
          Entre com seu e‑mail e senha para continuar.
        </p>

        <div className="mt-10 mx-auto max-w-md space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm text-left">
            <LoginForm />
            <p className="mt-4 text-xs text-stone-500 text-center">
              Ao continuar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}