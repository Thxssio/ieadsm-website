"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase/client";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

/* ---------- Ícones ---------- */
const ShareIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4m4-4v12"/>
  </svg>
);
const MoreIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/>
  </svg>
);

/* ---------- Helpers ---------- */
const sanitizeUrl = (u) => {
  const t = (u || "").trim();
  if (!t) return "";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};
const domainFromUrl = (u) => {
  try { return new URL(sanitizeUrl(u)).hostname.replace(/^www\./, ""); }
  catch { return ""; }
};
const autoIcon = (u) => {
  const d = domainFromUrl(u);
  return d ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128` : "";
};

/* ---------- Social ---------- */
const SocialIcons = () => (
  <div className="flex gap-5 mt-4">
    <a href="https://www.instagram.com/adsantamariars/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919C2.174 15.584 2.163 15.204 2.163 12s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zM12 7.231a4.769 4.769 0 100 9.538 4.769 4.769 0 000-9.538zm6.448-.398a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"/></svg>
    </a>
    <a href="mailto:contato@adsm.org.br" className="opacity-80 hover:opacity-100 transition">
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18a2 2 0 002 2h16a2 2 0 002-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
    </a>
    <a href="https://www.facebook.com/ADSantaMariaRS/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
    </a>
    <a href="https://www.youtube.com/c/ADSMcomunica" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M21.582 7.243c-.24-.88-.9-1.54-1.78-1.78C18.25 5 12 5 12 5s-6.25 0-7.802.463c-.88.24-1.54.9-1.78 1.78C2 8.793 2 12 2 12s0 3.207.418 4.757c.24.88.9 1.54 1.78 1.78C5.75 19 12 19 12 19s6.25 0 7.802-.463c.88-.24 1.54-.9 1.78-1.78C22 15.207 22 12 22 12s0-3.207-.418-4.757zM9.75 15.5V8.5l6 3.5-6 3.5z"/></svg>
    </a>
  </div>
);

/* ---------- Skeleton ---------- */
const Skeleton = ({ className = "" }) => (
  <div className={`overflow-hidden rounded-xl ${className}`}>
    <div className="h-full w-full animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
  </div>
);

/* ---------- Página ---------- */
export default function LinktreePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const q = query(collection(db, "links"), orderBy("order"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLinks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const handleShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => { setShowToast(true); setTimeout(() => setShowToast(false), 2500); })
      .catch(console.error);
  };

  const safeLinks = useMemo(
    () => links.map((l) => ({ ...l, href: sanitizeUrl(l.href), icon: l.icon || autoIcon(l.href) })),
    [links]
  );

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800 font-sans relative overflow-hidden">
      {/* Glows decorativos */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-30 bg-cyan-400/30" />
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full blur-3xl opacity-25 bg-indigo-400/30" />
      </div>

      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen w-full max-w-lg">
        {/* Ações topo (apenas compartilhar) */}
        <div className="w-full flex justify-end items-center px-1 mb-6">
          <motion.button
            onClick={handleShare}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-slate-700 transition-colors"
            aria-label="Compartilhar link"
            title="Compartilhar link"
          >
            <ShareIcon />
          </motion.button>
        </div>

        {/* Perfil */}
        <motion.header
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center mb-6"
        >
          <div className="relative mb-4">
            <motion.div
              className="absolute inset-0 rounded-full bg-white/70 blur-md"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 4 }}
            />
            <Image
              className="relative w-24 h-24 rounded-full object-contain shadow-xl ring-2 ring-white/70 bg-white p-1"
              src="/icon.svg"
              alt="Logo AD Santa Maria"
              width={96}
              height={96}
              onError={(e) => { e.currentTarget.src = "https://placehold.co/200x200/e0e0e0/333333?text=Logo"; }}
              unoptimized
            />
          </div>

          <motion.h1
            className="text-xl font-semibold text-slate-900"
            initial={{ letterSpacing: "-0.04em", opacity: 0 }}
            animate={{ letterSpacing: "0em", opacity: 1 }}
          >
            @adsantamariars
          </motion.h1>
          <p className="text-sm text-slate-600 mt-1 px-4 text-center">
            Igreja Evangélica Assembleia de Deus de Santa Maria/RS.
          </p>
          <SocialIcons />
        </motion.header>

        {/* Links */}
        <main className="w-full">
          <div className="w-full flex flex-col gap-4">
            {loading ? (
              <>
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </>
            ) : safeLinks.length === 0 ? (
              <p className="text-center text-slate-500">Nenhum link disponível.</p>
            ) : (
              <AnimatePresence initial={false}>
                {safeLinks.map((link, i) => (
                  <motion.a
                    key={link.id ?? i}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="group relative overflow-hidden border-2 border-slate-300/70 font-semibold py-3 px-4 rounded-2xl flex items-center w-full transition-all bg-white/80 backdrop-blur hover:shadow-lg"
                    title={link.href}
                  >
                    <span className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="absolute -inset-[2px] bg-[conic-gradient(at_top_left,_theme(colors.cyan.400),_transparent_25%,_theme(colors.indigo.400),_transparent_60%)] opacity-15 blur-xl" />
                    </span>

                    {link.icon ? (
                      <Image
                        src={link.icon}
                        width={28}
                        height={28}
                        className={`w-7 h-7 mr-3 ${link.icon.includes("placehold") ? "rounded-full" : ""}`}
                        alt=""
                        unoptimized
                        onError={(e) => { e.currentTarget.src = autoIcon(link.href); }}
                      />
                    ) : (
                      <div className="w-7 h-7 mr-3 rounded-md bg-slate-200 grid place-items-center text-slate-600 text-xs">
                        {domainFromUrl(link.href).slice(0, 2).toUpperCase() || "↗"}
                      </div>
                    )}

                    <div className="flex-1 text-left">
                      <span className="block leading-tight">{link.text}</span>
                      <span className="block text-[11px] font-normal text-slate-500 -mt-0.5">
                        {domainFromUrl(link.href)}
                      </span>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreIcon />
                    </div>
                  </motion.a>
                ))}
              </AnimatePresence>
            )}
          </div>
        </main>

        {/* Rodapé */}
        <footer className="text-center mt-12">
          <p className="text-sm text-slate-500">Igreja Evangélica Assembleia de Deus de Santa Maria</p>
        </footer>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-emerald-600 text-white rounded-xl shadow-lg"
          >
            Link copiado para a área de transferência!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
