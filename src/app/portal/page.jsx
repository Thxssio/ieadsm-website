"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/firebase/AuthContext";
import { auth } from "../lib/firebase/client";
import AdminPortalLayout from "../components/portal/AdminPortalLayout";
import AccessDeniedPage from "../components/portal/ui/AccessDeniedPage";

export default function PortalPage() {
  const { user, role, profileComplete, isLoading } = useAuth();
  const router = useRouter();

  // Redirecionamentos básicos
  useEffect(() => {
    if (isLoading) return;

    // Não autenticado => login
    if (!user) {
      router.replace("/login");
      return;
    }

    // Sem perfil completo => completar cadastro
    if (user && !profileComplete) {
      router.replace("/CompleteRegistration");
    }
  }, [user, profileComplete, isLoading, router]);

  // Gate de loading / transições
  if (isLoading || !user || !profileComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p>Carregando...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // O efeito acima também vai redirecionar, mas já forçamos aqui
      router.replace("/login");
    } catch (e) {
      console.error("Erro ao sair:", e);
    }
  };

  // Papéis que podem acessar o portal completo
  const hasAccess = ["admin", "pastor", "supervisor_departamento", "supervisor_setor"].includes(
    role
  );

  // Se tem acesso, renderiza o portal (o AdminPortalLayout já faz o gate fino de menu)
  if (hasAccess) {
    return <AdminPortalLayout key={user.uid} user={user} onLogout={handleLogout} />;
  }

  // Caso contrário, página de acesso negado
  return <AccessDeniedPage />;
}
