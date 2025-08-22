"use client";

import { useEffect, useMemo, useState } from "react";
import PageContent from "@/components/portal/ui/PageContent";
import { db } from "@/lib/firebase/client";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  writeBatch,
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
} from "lucide-react";

export default function LinksPage() {
  const emptyForm = { text: "", href: "", icon: "", order: "" };
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ---------- Utils ----------
  const sanitizeUrl = (u) => {
    const trimmed = (u || "").trim();
    if (!trimmed) return "";
    // se não tiver protocolo, assume https
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
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=64`;
  };

  const showToast = (msg, isError = false) => {
    if (isError) setError(msg);
    else setMessage(msg);
    setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);
  };

  // ---------- Data ----------
  const fetchLinks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "links"), orderBy("order"));
      const snap = await getDocs(q);
      setLinks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Erro ao buscar links:", e);
      showToast("Erro ao carregar links", true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxOrder = useMemo(() => {
    if (!links?.length) return 0;
    return Math.max(...links.map((l) => Number(l.order) || 0));
  }, [links]);

  const normalizeOrders = async () => {
    // reenumera 10,20,30 para evitar colisão e manter espaço
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
    await fetchLinks();
    showToast("Ordem normalizada");
  };

  // ---------- Form ----------
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
      order: Number(form.order) || (maxOrder + 10),
    };

    if (!data.text) return showToast("Informe o texto do link", true);
    if (!data.href) return showToast("Informe uma URL válida", true);

    // se não forneceu ícone, tenta favicon automático
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
      fetchLinks();
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
      fetchLinks();
    } catch (e) {
      console.error("Erro ao excluir:", e);
      showToast("Erro ao excluir link", true);
    }
  };

  // ---------- Reordenar ----------
  const move = async (id, dir) => {
    // dir: -1 = up, +1 = down
    const idx = links.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= links.length) return;

    const a = links[idx];
    const b = links[targetIdx];

    // troca os 'order' no Firestore
    const batch = writeBatch(db);
    batch.update(doc(db, "links", a.id), { order: Number(b.order) || 0 });
    batch.update(doc(db, "links", b.id), { order: Number(a.order) || 0 });
    await batch.commit();
    await fetchLinks();
  };

  // ---------- Render ----------
  return (
    <PageContent title="Gerenciar Links">
      {/* Toasts */}
      {message && (
        <p className="mb-4 text-sm text-green-700 bg-green-100 p-2 rounded-md flex items-center gap-2">
          <Check className="h-4 w-4" /> {message}
        </p>
      )}
      {error && (
        <p className="mb-4 text-sm text-red-700 bg-red-100 p-2 rounded-md">{error}</p>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Texto</label>
            <input
              name="text"
              value={form.text}
              onChange={handleChange}
              placeholder="Ex.: Instagram"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">URL</label>
            <input
              name="href"
              value={form.href}
              onChange={handleChange}
              placeholder="https://seusite.com/perfil"
              type="url"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Ícone (opcional)</label>
            <input
              name="icon"
              value={form.icon}
              onChange={handleChange}
              placeholder="https://.../icone.png"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Deixe vazio para usar o favicon do domínio.</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Ordem</label>
            <input
              name="order"
              value={form.order}
              onChange={handleChange}
              placeholder="Auto"
              type="number"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Se vazio, será {maxOrder + 10}.</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2a3d57] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-opacity-90"
          >
            {editingId ? "Salvar alterações" : "Adicionar link"}
            <Plus size={16} />
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm);
                setEditingId(null);
              }}
              className="text-sm text-slate-700 dark:text-slate-300 underline"
            >
              Cancelar edição
            </button>
          )}

          <button
            type="button"
            onClick={normalizeOrders}
            className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800"
            title="Normalizar ordem (10,20,30,...)"
          >
            <RefreshCw className="h-4 w-4" /> Normalizar ordem
          </button>
        </div>
      </form>

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <p className="text-center text-slate-500 dark:text-slate-400">Nenhum link cadastrado.</p>
      ) : (
        <ul className="space-y-3">
          {links.map((link, idx) => (
            <li
              key={link.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                {link.icon ? (
                  <img src={link.icon} alt="" className="h-8 w-8 rounded" />
                ) : (
                  <div className="h-8 w-8 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 grid place-items-center text-sm">
                    {domainFromUrl(link.href)?.[0]?.toUpperCase() || <LinkIcon className="h-4 w-4" />}
                  </div>
                )}
                <div className="min-w-0">
                  <a
                    href={sanitizeUrl(link.href)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate font-semibold text-slate-900 dark:text-slate-100 hover:underline"
                    title={link.href}
                  >
                    {link.text}
                  </a>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{domainFromUrl(link.href)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  #{link.order}
                </span>

                <button
                  type="button"
                  onClick={() => move(link.id, -1)}
                  disabled={idx === 0}
                  className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 disabled:opacity-40"
                  title="Mover para cima"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(link.id, +1)}
                  disabled={idx === links.length - 1}
                  className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 disabled:opacity-40"
                  title="Mover para baixo"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleEdit(link)}
                  className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 text-blue-700 hover:bg-blue-50"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(link.id)}
                  className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 text-red-700 hover:bg-red-50"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageContent>
  );
}