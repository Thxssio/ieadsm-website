// app/portal/PortalClient.jsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthContext";
import { auth } from "@/lib/firebase/client";
import AdminPortalLayout from "@/components/portal/AdminPortalLayout";
import AccessDeniedPage from "@/components/portal/ui/AccessDeniedPage";
import { ThemeProvider } from "@/lib/ThemeContext";

export default function PortalClient() {
  const { user, role, profileComplete, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!user && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    if (user && !profileComplete && pathname !== "/complete-registration") {
      router.replace("/complete-registration");
      return;
    }
  }, [user, profileComplete, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user || !profileComplete) {
    return null; 
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace("/login");
    } catch (e) {
      console.error("Erro ao sair:", e);
    }
  };

  const hasAccess = [
    "admin",
    "pastor",
    "supervisor_departamento",
    "supervisor_setor"
  ].includes(role);

    return (
      <ThemeProvider>
        {hasAccess
          ? <AdminPortalLayout key={user.uid} user={user} onLogout={handleLogout} />
          : <AccessDeniedPage />}
      </ThemeProvider>
    );
  }

