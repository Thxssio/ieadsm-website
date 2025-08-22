"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import IconWrapper from "@/components/common/IconWrapper";
import LoginForm from "@/login/LoginForm";
import { useAuth } from "@/lib/firebase/AuthContext"; // ← usar AuthContext

export default function LoginPage() {
  const router = useRouter();
  const { user, profileComplete, isLoading } = useAuth();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      if (profileComplete) {
        router.replace("/portal");
      } else {
        router.replace("/complete-registration");
      }
    } else {
      setCheckingSession(false); // mostrar form de login
    }
  }, [user, profileComplete, isLoading, router]);

  if (checkingSession || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-lg text-stone-600 dark:text-stone-300">Verificando sessão...</p>
      </div>
    );
  }

  return (
    <div className="bg-background py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <IconWrapper><LogIn size={32} /></IconWrapper>

        <h1 className="mt-6 text-3xl font-bold text-foreground tracking-tight sm:text-4xl">
          Área do Membro
        </h1>
        <p className="mt-4 text-lg text-stone-600 dark:text-stone-300">
          Entre com seu e-mail e senha para continuar.
        </p>

        <div className="mt-10 mx-auto max-w-md space-y-6">
          <div className="bg-card border border-stone-200 dark:border-slate-600 rounded-2xl p-6 shadow-sm text-left">
            <LoginForm />
            <p className="mt-4 text-xs text-stone-500 dark:text-stone-400 text-center">
              Ao continuar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

