"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    Users,
    BookText,
    Church,
    LayoutTemplate,
    Calendar,
    Clock,
    LogOut,
    Settings,
    Moon,
    Sun,
    Link as LinkIcon,
    GitBranch,
  } from "lucide-react";

import PageContent from "@/components/portal/ui/PageContent";
import DashboardPage from "@/components/portal/features/DashboardPage";
import UserManagementPage from "@/components/portal/features/UserManagementPage";
import SchedulePage from "@/components/portal/features/SchedulePage";
import MinistriesPage from "@/components/portal/features/MinistriesPage";
import ConfigurationPage from "@/components/portal/features/ConfigurationPage";
import CongregationsPage from "@/components/portal/features/CongregationsPage";
import SiteContentPage from "@/components/portal/features/SiteContentPage";
import LinktreePage from "@/components/portal/features/LinktreePage";
import FamiliesPage from "@/components/portal/features/FamiliesPage";


import { useHasRole } from "@/hooks/useClaims";
import { useAuthUser } from "@/hooks/useAuthUser"; // unifica Auth + Firestore
import { useTheme } from "@/lib/ThemeContext";
import { db } from "@/lib/firebase/client";
import { doc, setDoc } from "firebase/firestore";

// --------- helpers
function cx(...xs) { return xs.filter(Boolean).join(" "); }
function initialsFromName(name = "") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() || "").join("");
}

function UserAvatar({ name, photoURL, size = 48 }) {
  const [err, setErr] = React.useState(false);
  const initials = initialsFromName(name || "Usuário");

  return (
    <div className="relative">
      <div className="absolute inset-0 blur-md rounded-full bg-sky-100/60 scale-110" aria-hidden />
      <div
        className="relative rounded-full overflow-hidden border border-slate-200 bg-white"
        style={{ width: size, height: size }}
      >
        {!photoURL || err ? (
          <div className="w-full h-full grid place-items-center bg-slate-50">
            <span className="text-sm font-semibold text-slate-600">{initials || "?"}</span>
          </div>
        ) : (
          <img
            src={photoURL}
            alt={name || "Usuário"}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setErr(true)}
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick, disabled }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={cx(
      "w-full relative group flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
      disabled && "text-slate-400 cursor-not-allowed",
      !disabled && !active && "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
      active && "text-sky-900 bg-sky-50 ring-1 ring-sky-200"
    )}
  >
    <span
      className={cx(
        "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r",
        active ? "bg-[#2a3d57]" : "bg-transparent group-hover:bg-slate-300"
      )}
    />
    <div className={cx("shrink-0", active ? "text-sky-700" : "text-slate-500 group-hover:text-slate-700")}>
      {icon}
    </div>
    <span className="font-medium">{label}</span>
  </button>
);

export default function AdminPortalLayout({ user: userProp, onLogout, logoUrl }) {
  const { photoURL } = useAuthUser(userProp?.uid);
  const [activePage, setActivePage] = useState("dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Permissões
  const { allowed: canSeeUsers,  loading: rlUsers } = useHasRole(["admin","pastor","supervisor_departamento","supervisor_setor"]);
  const { allowed: canSeeMin,    loading: rlMin   } = useHasRole(["admin","pastor","supervisor_departamento","supervisor_setor","ministro"]);
  const { allowed: canSeeSched,  loading: rlSched } = useHasRole(["admin","pastor","supervisor_departamento","supervisor_setor"]);
  const rolesLoading = rlUsers || rlMin || rlSched;

  const { theme, toggleTheme } = useTheme();

  const handleThemeToggle = async () => {
    const uid = userProp?.uid;
    const next = theme === "dark" ? "light" : "dark";
    toggleTheme();
    if (uid) {
      try {
        await setDoc(doc(db, "users", uid), { theme: next }, { merge: true });
      } catch (e) {
        console.error("Erro ao salvar tema:", e);
      }
    }
  };

  const handleNavItemClick = (page) => {
    if (isLoggingOut) return;
    setActivePage(page);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const maybe = onLogout?.();
      if (maybe && typeof maybe.then === "function") await maybe;
    } finally {
      setIsLoggingOut(false);
    }
  };

  const LoggingOutPage = () => (
    <PageContent title="Saindo...">
      <p className="text-slate-700">Finalizando sua sessão, aguarde.</p>
    </PageContent>
  );

  const LoadingPermissionsPage = () => (
    <PageContent title="Carregando permissões">
      <p className="text-slate-700">Verificando seu acesso…</p>
    </PageContent>
  );

  const ActivePage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage user={userProp} />;
      case "users":
        return canSeeUsers ? (
          <UserManagementPage currentUser={userProp} />
        ) : (
          <PageContent title="Acesso restrito">
            <p className="text-slate-700">Você não tem permissão para acessar esta seção.</p>
          </PageContent>
        );
      case "families":
        return canSeeUsers ? (
          <FamiliesPage />
        ) : (
          <PageContent title="Acesso restrito">
            <p className="text-slate-700">Você não tem permissão para acessar esta seção.</p>
          </PageContent>
        );
      case "ministries":
        return canSeeMin ? (
          <MinistriesPage />
        ) : (
          <PageContent title="Acesso restrito">
            <p className="text-slate-700">Você não tem permissão para acessar esta seção.</p>
          </PageContent>
        );
      case "congregations":
        return <CongregationsPage />;
      case "siteContent":
        return <SiteContentPage />;
      case "linktree":
        return <LinktreePage />;
      case "events":
        return (
          <PageContent title="Eventos">
            <p className="text-slate-700">Página para gerenciar eventos (em construção).</p>
          </PageContent>
        );
      case "schedule":
        return canSeeSched ? (
          <SchedulePage />
        ) : (
          <PageContent title="Acesso restrito">
            <p className="text-slate-700">Você não tem permissão para acessar esta seção.</p>
          </PageContent>
        );
      case "configuration":
        return <ConfigurationPage />;
      default:
        return (
          <PageContent title="Dashboard">
            <p className="text-slate-700">Página não encontrada.</p>
          </PageContent>
        );
    }
  };

  const PageRenderer = useMemo(() => {
    if (isLoggingOut) return LoggingOutPage;
    if (rolesLoading) return LoadingPermissionsPage;
    return ActivePage;
  }, [isLoggingOut, rolesLoading, activePage, userProp, canSeeUsers, canSeeMin, canSeeSched]);

  const navLinksBlock = (
    <>
      <div className="text-[11px] uppercase tracking-wide text-slate-400 px-3 mt-2 mb-1">Principal</div>
      <NavItem icon={<Home size={20} strokeWidth={2} />} label="Dashboard" active={activePage === "dashboard"} onClick={() => handleNavItemClick("dashboard")} disabled={isLoggingOut} />

      {!rolesLoading && canSeeUsers && (
        <>
          <div className="text-[11px] uppercase tracking-wide text-slate-400 px-3 mt-4 mb-1">Pessoas</div>
          <NavItem icon={<Users size={20} strokeWidth={2} />} label="Usuários" active={activePage === "users"} onClick={() => handleNavItemClick("users")} disabled={isLoggingOut} />
          <NavItem icon={<GitBranch size={20} strokeWidth={2} />} label="Famílias" active={activePage === "families"} onClick={() => handleNavItemClick("families")} disabled={isLoggingOut} />
        </>
      )}

      {!rolesLoading && canSeeMin && (
        <>
          <div className="text-[11px] uppercase tracking-wide text-slate-400 px-3 mt-4 mb-1">Ministérios & Conteúdo</div>
          <NavItem icon={<BookText size={20} strokeWidth={2} />} label="Ministérios" active={activePage === "ministries"} onClick={() => handleNavItemClick("ministries")} disabled={isLoggingOut} />
          <NavItem icon={<LinkIcon size={20} strokeWidth={2} />} label="Linktree" active={activePage === "linktree"} onClick={() => handleNavItemClick("linktree")} disabled={isLoggingOut} />
        </>
      )}

      <NavItem icon={<Church size={20} strokeWidth={2} />} label="Congregações" active={activePage === "congregations"} onClick={() => handleNavItemClick("congregations")} disabled={isLoggingOut} />
      <NavItem icon={<LayoutTemplate size={20} strokeWidth={2} />} label="Conteúdo do Site" active={activePage === "siteContent"} onClick={() => handleNavItemClick("siteContent")} disabled={isLoggingOut} />
      <NavItem icon={<Calendar size={20} strokeWidth={2} />} label="Eventos" active={activePage === "events"} onClick={() => handleNavItemClick("events")} disabled={isLoggingOut} />
      
      {!rolesLoading && canSeeSched && (
        <>
          <div className="text-[11px] uppercase tracking-wide text-slate-400 px-3 mt-4 mb-1">Operacional</div>
          <NavItem icon={<Clock size={20} strokeWidth={2} />} label="Programação" active={activePage === "schedule"} onClick={() => handleNavItemClick("schedule")} disabled={isLoggingOut} />
          <NavItem icon={<Settings size={20} strokeWidth={2} />} label="Configurações"active={activePage === "configuration"} onClick={() => handleNavItemClick("configuration")} disabled={isLoggingOut}/>

        </>
      )}
    </>
  );

  const overlayVariants = { visible: { opacity: 1 }, hidden: { opacity: 0 } };
  const menuVariants = { visible: { x: 0, transition: { type: "spring", stiffness: 400, damping: 40 } }, hidden: { x: "-100%" } };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        {/* Header da sidebar — branco, com destaque suave no avatar */}
        <div className="px-4 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <UserAvatar name={userProp?.displayName} photoURL={photoURL} size={56} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-4 opacity-90" />
                ) : (
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    IEADSM
                  </span>
                )}
              </div>
              <div className="font-semibold text-slate-900 truncate">{userProp?.displayName || "Usuário"}</div>
              <div className="text-xs text-slate-500 truncate">{userProp?.email || "sem e-mail"}</div>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">{navLinksBlock}</nav>

        {/* Tema + Sair */}
        <div className="p-3 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cx(
              "flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              "border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
            )}
          >
            <LogOut size={18} />
            {isLoggingOut ? "Saindo..." : "Sair"}
          </button>
        </div>
      </aside>

      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Topbar (mobile) */}
        <header className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 p-3 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <UserAvatar name={userProp?.displayName} photoURL={photoURL} size={34} />
            <div className="leading-tight">
              <div className="text-[13px] font-semibold text-slate-800">Portal IEADSM</div>
              <div className="text-[11px] text-slate-500 truncate">{userProp?.displayName || "Usuário"}</div>
            </div>
          </div>
          <button
            onClick={() => !isLoggingOut && setIsMenuOpen(true)}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-700"
            disabled={isLoggingOut}
            aria-label="Abrir menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                className="fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 flex flex-col"
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="px-4 pt-6 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={userProp?.displayName} photoURL={photoURL} size={52} />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{userProp?.displayName || "Usuário"}</div>
                      <div className="text-xs text-slate-500 truncate">{userProp?.email || "sem e-mail"}</div>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">{navLinksBlock}</nav>

                <div className="p-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={handleThemeToggle}
                    className="p-2 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                    aria-label="Alternar tema"
                  >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={cx(
                      "flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      "border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                    )}
                  >
                    <LogOut size={18} />
                    {isLoggingOut ? "Saindo..." : "Sair"}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage + (isLoggingOut ? "-logout" : "") + (rolesLoading ? "-loading" : "")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="p-4 md:p-6"
            >
              <PageRenderer />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

