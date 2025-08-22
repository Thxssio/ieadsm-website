"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import PageContent from "@/components/portal/ui/PageContent";
import { db } from "@/lib/firebase/client";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Check,
  Link as LinkIcon,
  GripVertical,
  Copy,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ===================== Helpers ===================== */
const sanitizeUrl = (u) => {
  const trimmed = (u || "").trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
};

const domainFromUrl = (u) => {
  try {
    const url = new URL(sanitizeUrl(u));
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const autoIcon = (u) => {
  const d = domainFromUrl(u);
  if (!d) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`;
};

/* shimmer skeleton */
const Skeleton = ({ className = "" }) => (
  <div className={`overflow-hidden rounded-xl ${className}`}>
    <div className="h-full w-full animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
  </div>
);

/* toast */
function Toast({ kind = "ok", text = "", onDone }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 10, opacity: 0, scale: 0.98 }}
      className={`pointer-events-auto flex items-center gap-2 rounded-xl px-3 py-2 text-sm shadow-lg
      ${kind === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}
      onAnimationComplete={() => setTimeout(onDone, 2500)}
    >
      {kind === "error" ? <Sparkles className="h-4 w-4 rotate-12" /> : <Check className="h-4 w-4" />}
      <span className="font-medium">{text}</span>
    </motion.div>
  );
}

/* ===================== Página ===================== */
export default function LinksPage() {
  const emptyForm = { text: "", href: "", icon: "", order: "" };
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState(null); // { kind: "ok"|"error", text: "" }
  const showToast = useCallback((text, isError = false) => {
    setToast({ kind: isError ? "error" : "ok", text });
  }, []);

  /* ----- Live data (tempo real) ----- */
  useEffect(() => {
    const q = query(collection(db, "links"), orderBy("order"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLinks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("onSnapshot error:", err);
        setLoading(false);
        showToast("Erro ao carregar links", true);
      }
    );
    return () => unsub();
  }, [showToast]);

  const maxOrder = useMemo(() => {
    if (!links?.length) return 0;
    return Math.max(...links.map((l) => Number(l.order) || 0));
  }, [links]);

  const normalizeOrders = useCallback(async () => {
    const ordered = [...links].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    const batch = writeBatch(db);
    let current = 10;
    ordered.forEach((l) => {
      if ((Number(l.order) || 0) !== current) {
        batch.update(doc(db, "links", l.id), { order: current });
      }
      current += 10;
    });
    await batch.commit();
    showToast("Ordem normalizada");
  }, [links, showToast]);

  /* ----- Form ----- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      text: (form.text || "").trim(),
      href: sanitizeUrl(form.href),
      icon: (form.icon || "").trim(),
      order: Number(form.order) || maxOrder + 10,
    };
    if (!data.text) return showToast("Informe o texto do link", true);
    if (!data.href) return showToast("Informe uma URL válida", true);
    if (!data.icon) data.icon = autoIcon(data.href);

    try {
      if (editingId) {
        await updateDoc(doc(db, "links", editingId), data);
        showToast("Link atualizado!");
      } else {
        await addDoc(collection(db, "links"), data);
        showToast("Link adicionado!");
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (e) {
      console.error("Erro ao salvar:", e);
      showToast("Erro ao salvar link", true);
    }
  };

  const handleEdit = (link) => {
    setForm({
      text: link.text || "",
      href: link.href || "",
      icon: link.icon || "",
      order: link.order ?? "",
    });
    setEditingId(link.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir este link?")) return;
    try {
      await deleteDoc(doc(db, "links", id));
      showToast("Link removido!");
    } catch (e) {
      console.error("Erro ao excluir:", e);
      showToast("Erro ao excluir link", true);
    }
  };

  /* ----- Reordenar (arrastar/soltar + setas + atalhos) ----- */
  const dragId = useRef(null);

  const onDragStart = (e, id) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e) => {
    e.preventDefault(); // necessário p/ permitir drop
  };
  const swapOrders = async (a, b) => {
    const batch = writeBatch(db);
    batch.update(doc(db, "links", a.id), { order: Number(b.order) || 0 });
    batch.update(doc(db, "links", b.id), { order: Number(a.order) || 0 });
    await batch.commit();
  };
  const onDrop = async (e, overId) => {
    e.preventDefault();
    const from = links.find((l) => l.id === dragId.current);
    const to = links.find((l) => l.id === overId);
    dragId.current = null;
    if (!from || !to || from.id === to.id) return;
    await swapOrders(from, to);
  };

  const move = async (id, dir) => {
    const idx = links.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= links.length) return;
    await swapOrders(links[idx], links[targetIdx]);
  };

  const onKeyDownRow = async (e, link) => {
    if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      await move(link.id, e.key === "ArrowUp" ? -1 : +1);
    }
  };

  /* ===================== UI ===================== */
  return (
      <PageContent
        title={
          <div className="flex items-center gap-2">
            <span>Gerenciar Links</span>
            <motion.span
              initial={{ rotate: -8, scale: 0.9 }}
              animate={{ rotate: [0, -8, 0], scale: [1, 0.95, 1] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="inline-flex"
              title="deixe brilhante ✨"
            >
              <Sparkles className="h-5 w-5 text-amber-500" />
            </motion.span>
          </div>
        }
      >
      {/* ======= Toasts ======= */}
      <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
        <AnimatePresence>{toast && <Toast {...toast} onDone={() => setToast(null)} />}</AnimatePresence>
      </div>

      {/* ======= Grid: Form + Preview ======= */}
      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* -------- Form -------- */}
        <motion.form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-4 shadow-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Texto</label>
              <input
                name="text"
                value={form.text}
                onChange={handleChange}
                placeholder="Ex.: Instagram"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">URL</label>
              <input
                name="href"
                value={form.href}
                onChange={handleChange}
                placeholder="https://seusite.com/perfil"
                type="url"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ícone (opcional)</label>
              <input
                name="icon"
                value={form.icon}
                onChange={handleChange}
                placeholder="https://.../icone.png"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
              />
              <p className="mt-1 text-xs text-slate-500">Vazio → usa o favicon do domínio.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ordem</label>
              <input
                name="order"
                value={form.order}
                onChange={handleChange}
                placeholder="Auto"
                type="number"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
              />
              <p className="mt-1 text-xs text-slate-500">Se vazio, será {maxOrder + 10}.</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="group inline-flex items-center gap-2 rounded-lg bg-[#2a3d57] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2a3d57]"
            >
              {editingId ? "Salvar alterações" : "Adicionar link"}
              <Plus size={16} className="transition-transform group-hover:rotate-90" />
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setEditingId(null);
                }}
                className="text-sm text-slate-700 underline"
              >
                Cancelar edição
              </button>
            )}

            <button
              type="button"
              onClick={normalizeOrders}
              disabled={links.length === 0}
              className={`ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 ${links.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              title="Normalizar ordem (10,20,30,...)"
            >
              <RefreshCw className={`h-4 w-4 ${links.length === 0 ? "" : "animate-spin [animation-duration:2.2s]"}`} /> Normalizar
            </button>
          </div>
        </motion.form>

        {/* -------- Preview (estilo bio card) -------- */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5 shadow-sm"
        >
          <div className="absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(60%_60%_at_30%_20%,rgba(56,189,248,0.25),transparent),radial-gradient(40%_40%_at_80%_0%,rgba(99,102,241,0.20),transparent)] blur-3xl" />
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/70 shadow">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Preview</p>
                <h3 className="font-semibold">Seu cartão de links</h3>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <>
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </>
              ) : links.length === 0 ? (
                <p className="text-center text-slate-500">Sem links ainda.</p>
              ) : (
                links.map((l) => (
                  <a
                    key={l.id}
                    href={sanitizeUrl(l.href)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 shadow hover:shadow-md transition-all"
                    title={l.href}
                  >
                    {l.icon ? (
                      <img src={l.icon} alt="" className="h-7 w-7 rounded" />
                    ) : (
                      <div className="grid h-7 w-7 place-items-center rounded bg-slate-200 text-slate-600">
                        <LinkIcon className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{l.text}</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                      <p className="truncate text-xs text-slate-500">{domainFromUrl(l.href)}</p>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ======= Lista Gerenciável ======= */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : links.length === 0 ? (
          <p className="text-center text-slate-500">Nenhum link cadastrado.</p>
        ) : (
          <ul className="space-y-3">
            {links.map((link, idx) => (
              <motion.li
                key={link.id}
                layout
                drag={false}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 250, damping: 22, mass: 0.5 }}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm"
                draggable
                onDragStart={(e) => onDragStart(e, link.id)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, link.id)}
                onKeyDown={(e) => onKeyDownRow(e, link)}
                tabIndex={0}
                title="Dica: Alt+↑/↓ reordena; arraste pelo grip."
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="cursor-grab active:cursor-grabbing text-slate-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  {link.icon ? (
                    <img src={link.icon} alt="" className="h-8 w-8 rounded" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-slate-200 text-slate-600 grid place-items-center text-sm">
                      {domainFromUrl(link.href)?.[0]?.toUpperCase() || <LinkIcon className="h-4 w-4" />}
                    </div>
                  )}
                  <div className="min-w-0">
                    <a
                      href={sanitizeUrl(link.href)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-semibold text-slate-900 hover:underline"
                    >
                      {link.text}
                    </a>
                    <p className="truncate text-xs text-slate-500">{domainFromUrl(link.href)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                    #{link.order}
                  </span>

                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(sanitizeUrl(link.href)).then(() => showToast("Link copiado!"))}
                    className="inline-flex items-center rounded-md border border-slate-200 bg-white p-1 text-slate-700 hover:bg-slate-50"
                    title="Copiar URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => move(link.id, -1)}
                    disabled={idx === 0}
                    className="inline-flex items-center rounded-md border border-slate-200 bg-white p-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    title="Mover para cima"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(link.id, +1)}
                    disabled={idx === links.length - 1}
                    className="inline-flex items-center rounded-md border border-slate-200 bg-white p-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEdit(link)}
                    className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    title="Editar"
                  >
                    <Pencil size={16} className="m-1" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(link.id)}
                    className="inline-flex items-center rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    title="Excluir"
                  >
                    <Trash2 size={16} className="m-1" />
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </PageContent>
  );
}

