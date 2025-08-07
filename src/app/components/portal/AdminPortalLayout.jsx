"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  BookText,        // Ministérios
  Church,
  LayoutTemplate,  // Conteúdo do site
  Calendar,
  Settings,        // Programação
  LogOut,
} from "lucide-react";

import PageContent from "./ui/PageContent";
import DashboardPage from "./features/DashboardPage";
import UserManagementPage from "./features/UserManagementPage";
import SchedulePage from "./features/SchedulePage";
import MinistriesPage from "./features/MinistriesPage";

import { useHasRole } from "../../hooks/useClaims";

const NavItem = ({ icon, label, active, onClick, disabled }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`w-full flex items-center px-4 py-2.5 text-sm transition-all duration-200 rounded-lg
      ${disabled
        ? "text-slate-400 cursor-not-allowed"
        : active
          ? "bg-[#2a3d57] text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
      }`}
    aria-disabled={disabled}
  >
    <div className="mr-3">{icon}</div>
    <span className="font-semibold">{label}</span>
  </button>
);

export default function AdminPortalLayout({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Permissões por papel
  const { allowed: canSeeUsers,  loading: rlUsers  } = useHasRole(["admin", "pastor", "supervisor_departamento", "supervisor_setor"]);
  const { allowed: canSeeMin,    loading: rlMin    } = useHasRole(["admin", "pastor", "supervisor_departamento", "supervisor_setor", "ministro"]);
  const { allowed: canSeeSched,  loading: rlSched  } = useHasRole(["admin", "pastor", "supervisor_departamento", "supervisor_setor"]); // ajuste se quiser abrir mais

  const rolesLoading = rlUsers || rlMin || rlSched;

  const handleNavItemClick = (page) => {
    if (isLoggingOut) return;
    setActivePage(page);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true); // evita que telas internas montem listeners durante a transição
    try {
      const maybePromise = onLogout?.();
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }
    } finally {
      // Após o signOut, a tela que te envolve provavelmente redireciona; se não, podemos manter um estado mínimo
    }
  };

  const PageRenderer = useMemo(() => {
    if (isLoggingOut) {
      return () => (
        <PageContent title="Saindo...">
          <p style={{ color: "#2a3d57" }}>Finalizando sua sessão, aguarde.</p>
        </PageContent>
      );
    }
    if (rolesLoading) {
      return () => (
        <PageContent title="Carregando permissões">
          <p style={{ color: "#2a3d57" }}>Verificando seu acesso...</p>
        </PageContent>
      );
    }
    return () => {
      switch (activePage) {
        case "dashboard":
          return <DashboardPage user={user} />;
        case "users":
          return canSeeUsers ? (
            <UserManagementPage currentUser={user} />
          ) : (
            <PageContent title="Acesso restrito">
              <p style={{ color: "#2a3d57" }}>Você não tem permissão para acessar esta seção.</p>
            </PageContent>
          );
        case "ministries":
          return canSeeMin ? (
            <MinistriesPage />
          ) : (
            <PageContent title="Acesso restrito">
              <p style={{ color: "#2a3d57" }}>Você não tem permissão para acessar esta seção.</p>
            </PageContent>
          );
        case "congregations":
          return (
            <PageContent title="Congregações">
              <p style={{ color: "#2a3d57" }}>Página para gerenciar as congregações (em construção).</p>
            </PageContent>
          );
        case "siteContent":
          return (
            <PageContent title="Conteúdo do Site">
              <p style={{ color: "#2a3d57" }}>Página para gerenciar o conteúdo do site (em construção).</p>
            </PageContent>
          );
        case "events":
          return (
            <PageContent title="Eventos">
              <p style={{ color: "#2a3d57" }}>Página para gerenciar eventos (em construção).</p>
            </PageContent>
          );
        case "schedule":
          return canSeeSched ? (
            <SchedulePage />
          ) : (
            <PageContent title="Acesso restrito">
              <p style={{ color: "#2a3d57" }}>Você não tem permissão para acessar esta seção.</p>
            </PageContent>
          );
        default:
          return (
            <PageContent title="Dashboard">
              <p style={{ color: "#2a3d57" }}>Página não encontrada.</p>
            </PageContent>
          );
      }
    };
  }, [activePage, user, canSeeUsers, canSeeMin, canSeeSched, rolesLoading, isLoggingOut]);

  const navLinksBlock = (
    <>
      <NavItem
        icon={<Home size={20} strokeWidth={2} />}
        label="Dashboard"
        active={activePage === "dashboard"}
        onClick={() => handleNavItemClick("dashboard")}
        disabled={isLoggingOut}
      />

      {/* Usuários (somente se permitido) */}
      {(!rolesLoading && canSeeUsers) && (
        <NavItem
          icon={<Users size={20} strokeWidth={2} />}
          label="Usuários"
          active={activePage === "users"}
          onClick={() => handleNavItemClick("users")}
          disabled={isLoggingOut}
        />
      )}

      {/* Ministérios (somente se permitido) */}
      {(!rolesLoading && canSeeMin) && (
        <NavItem
          icon={<BookText size={20} strokeWidth={2} />}
          label="Ministérios"
          active={activePage === "ministries"}
          onClick={() => handleNavItemClick("ministries")}
          disabled={isLoggingOut}
        />
      )}

      {/* As demais seções podem ficar visíveis para todos (ajuste conforme política) */}
      <NavItem
        icon={<Church size={20} strokeWidth={2} />}
        label="Congregações"
        active={activePage === "congregations"}
        onClick={() => handleNavItemClick("congregations")}
        disabled={isLoggingOut}
      />
      <NavItem
        icon={<LayoutTemplate size={20} strokeWidth={2} />}
        label="Conteúdo do Site"
        active={activePage === "siteContent"}
        onClick={() => handleNavItemClick("siteContent")}
        disabled={isLoggingOut}
      />
      <NavItem
        icon={<Calendar size={20} strokeWidth={2} />}
        label="Eventos"
        active={activePage === "events"}
        onClick={() => handleNavItemClick("events")}
        disabled={isLoggingOut}
      />

      {/* Programação (somente se permitido) */}
      {(!rolesLoading && canSeeSched) && (
        <NavItem
          icon={<Settings size={20} strokeWidth={2} />}
          label="Programação"
          active={activePage === "schedule"}
          onClick={() => handleNavItemClick("schedule")}
          disabled={isLoggingOut}
        />
      )}
    </>
  );

  const overlayVariants = { visible: { opacity: 1 }, hidden: { opacity: 0 } };
  const menuVariants = {
    visible: { x: 0, transition: { type: "spring", stiffness: 400, damping: 40 } },
    hidden: { x: "-100%" },
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar (desktop) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col p-4 hidden lg:flex">
        <div className="p-4 text-center border-b border-slate-200 mb-4">
          <h2 className="text-xl font-bold text-[#2a3d57]">Portal IEADSM</h2>
          <p className="text-sm text-slate-500 mt-1 capitalize">
            {user?.displayName || "Usuário"}
          </p>
        </div>
        <nav className="flex-1 space-y-2">{navLinksBlock}</nav>
        <div className="pt-4 border-t border-slate-200">
          <NavItem
            icon={<LogOut size={20} strokeWidth={2} />}
            label={isLoggingOut ? "Saindo..." : "Sair"}
            onClick={handleLogout}
            disabled={isLoggingOut}
          />
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col">
        {/* Topbar (mobile) */}
        <header className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4 sticky top-0 z-30">
          <h2 className="text-lg font-bold text-[#2a3d57]">Portal IEADSM</h2>
          <button
            onClick={() => !isLoggingOut && setIsMenuOpen(true)}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-700"
            aria-label="Abrir menu"
            disabled={isLoggingOut}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>

        {/* Drawer (mobile) */}
        <AnimatePresence>
          {isMenuOpen && !isLoggingOut && (
            <>
              <motion.div
                key="overlay"
                className="lg:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={() => setIsMenuOpen(false)}
              />
              <motion.div
                key="menu"
                className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl p-4 z-50 flex flex-col"
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="px-4 pt-4 pb-5 border-b border-slate-200 mb-4">
                  <h2 className="text-lg font-semibold text-[#2a3d57]">Menu</h2>
                  <p className="text-sm text-slate-500 capitalize">
                    {user?.displayName || "Usuário"}
                  </p>
                </div>
                <nav className="flex-1 space-y-2">{navLinksBlock}</nav>
                <div className="pt-4 border-t border-slate-200">
                  <NavItem
                    icon={<LogOut size={20} strokeWidth={2} />}
                    label="Sair"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Página ativa */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage + (isLoggingOut ? "-logout" : "") + (rolesLoading ? "-loading" : "")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PageRenderer />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
