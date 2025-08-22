"use client";

import { useEffect, useState } from "react";
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
} from "firebase/firestore";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function LinksPage() {
  const emptyForm = { text: "", href: "", icon: "", order: "" };
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "links"), orderBy("order"));
      const snap = await getDocs(q);
      setLinks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Erro ao buscar links:", e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { text: form.text, href: form.href, icon: form.icon, order: Number(form.order) || 0 };
    try {
      if (editingId) {
        await updateDoc(doc(db, "links", editingId), data);
        setMessage("Link atualizado!");
      } else {
        await addDoc(collection(db, "links"), data);
        setMessage("Link adicionado!");
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchLinks();
    } catch (e) {
      console.error("Erro ao salvar:", e);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEdit = (link) => {
    setForm({ text: link.text || "", href: link.href || "", icon: link.icon || "", order: link.order || "" });
    setEditingId(link.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir este link?")) return;
    try {
      await deleteDoc(doc(db, "links", id));
      setMessage("Link removido!");
      fetchLinks();
    } catch (e) {
      console.error("Erro ao excluir:", e);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <PageContent title="Gerenciar Links">
      {message && <p className="mb-4 text-sm text-green-600 bg-green-100 p-2 rounded-md">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          name="text"
          value={form.text}
          onChange={handleChange}
          placeholder="Texto"
          className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
          required
        />
        <input
          name="href"
          value={form.href}
          onChange={handleChange}
          placeholder="URL"
          className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
          required
        />
        <input
          name="icon"
          value={form.icon}
          onChange={handleChange}
          placeholder="URL do ícone (opcional)"
          className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
        />
        <input
          name="order"
          value={form.order}
          onChange={handleChange}
          placeholder="Ordem"
          type="number"
          className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-[#2a3d57] text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
        >
          {editingId ? "Salvar" : "Adicionar"}
          <Plus size={16} />
        </button>
      </form>

      {loading ? (
        <p>Carregando...</p>
      ) : links.length === 0 ? (
        <p className="text-center text-slate-500">Nenhum link cadastrado.</p>
      ) : (
        <ul className="space-y-3">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex items-center justify-between bg-white p-3 border border-slate-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {link.icon && <img src={link.icon} alt="" className="w-6 h-6 rounded" />}
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-800 hover:underline"
                >
                  {link.text}
                </a>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(link)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(link.id)}
                  className="text-red-600 hover:text-red-800"
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
