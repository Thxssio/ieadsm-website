// src/app/portal/PortalClient.jsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/firebase/AuthContext";
import { auth } from "../lib/firebase/client";
import AdminPortalLayout from "../components/portal/AdminPortalLayout";
import AccessDeniedPage from "../components/portal/ui/AccessDeniedPage";

export default function PortalClient() {
  const { user, role, profileComplete, isLoading } = useAuth();
  const router = useRouter();

  /* ---------- Redirecionamentos básicos ---------- */
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user && !profileComplete) {
      router.replace("/CompleteRegistration");
    }
  }, [user, profileComplete, isLoading, router]);

  /* ---------- Gate de loading / transições ---------- */
  if (isLoading || !user || !profileComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p>Carregando...</p>
      </div>
    );
  }

  /* ---------- Logout ---------- */
  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace("/login");
    } catch (e) {
      console.error("Erro ao sair:", e);
    }
  };

  /* ---------- Controle de acesso ---------- */
  const hasAccess = [
    "admin",
    "pastor",
    "supervisor_departamento",
    "supervisor_setor",
  ].includes(role);

  if (hasAccess) {
    return (
      <AdminPortalLayout key={user.uid} user={user} onLogout={handleLogout} />
    );
  }

  return <AccessDeniedPage />;
}
