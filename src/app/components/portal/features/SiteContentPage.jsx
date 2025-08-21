"use client";

import { useEffect, useState } from "react";
import PageContent from "@/components/portal/ui/PageContent";
import { db, storage } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { Loader2 } from "lucide-react";

const inputStyle =
  "block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2a3d57] sm:text-sm";

const initialForm = {
  rssLink: "",
  heroTitle: "",
  heroSubtitle: "",
  heroImageURL: "",
  heroImagePath: "",
  welcomeTitle: "",
  welcomeVerse: "",
  welcomeReference: "",
  visitTitle: "",
  visitSubtitle: "",
  address: "",
  phone: "",
  mapApiKey: "",
  ministriesPreTitle: "",
  ministriesTitle: "",
  ministriesSubtitle: "",
  congregationsTitle: "",
  congregationsSubtitle: "",
  footerText: "",
  instagramLink: "",
  facebookLink: "",
  logoLightURL: "",
  logoLightPath: "",
  logoDarkURL: "",
  logoDarkPath: "",
};

export default function SiteContentPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "siteContent", "main"));
        if (snap.exists()) {
          setForm({ ...form, ...snap.data() });
        }
      } catch (e) {
        console.error("Erro carregando conteúdo:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleUpload = async (field, file) => {
    if (!file) return;
    setSaving(true);
    try {
      const path = `siteContent/${field}_${Date.now()}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);
      await new Promise((resolve, reject) => {
        task.on("state_changed", null, reject, resolve);
      });
      const url = await getDownloadURL(storageRef);
      const prevPath = form[`${field}Path`];
      setForm((f) => ({ ...f, [`${field}URL`]: url, [`${field}Path`]: path }));
      if (prevPath) {
        try {
          await deleteObject(ref(storage, prevPath));
        } catch {}
      }
    } catch (e) {
      console.error("Erro no upload:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "siteContent", "main"), form, { merge: true });
      setMessage("Conteúdo salvo!");
      setTimeout(() => setMessage(null), 4000);
    } catch (e) {
      console.error("Erro ao salvar:", e);
      setMessage("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContent title="Conteúdo do Site">
        <p>Carregando...</p>
      </PageContent>
    );
  }

  return (
    <PageContent title="Conteúdo do Site">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">RSS</h2>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Link RSS do Facebook
          </label>
          <input
            type="url"
            name="rssLink"
            value={form.rssLink}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Seção Inicial</h2>
          <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <input
            name="heroTitle"
            value={form.heroTitle}
            onChange={handleChange}
            className={inputStyle}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Subtítulo</label>
          <textarea
            name="heroSubtitle"
            value={form.heroSubtitle}
            onChange={handleChange}
            className={inputStyle}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">
            Imagem de Fundo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload("heroImage", e.target.files[0])}
          />
          {form.heroImageURL && (
            <img
              src={form.heroImageURL}
              alt="Hero"
              className="mt-2 h-32 object-cover rounded"
            />
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Mensagem de Boas-vindas</h2>
          <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <input
            name="welcomeTitle"
            value={form.welcomeTitle}
            onChange={handleChange}
            className={inputStyle}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Verso</label>
          <textarea
            name="welcomeVerse"
            value={form.welcomeVerse}
            onChange={handleChange}
            className={inputStyle}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Referência</label>
          <input
            name="welcomeReference"
            value={form.welcomeReference}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Visite-nos</h2>
          <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <input
            name="visitTitle"
            value={form.visitTitle}
            onChange={handleChange}
            className={inputStyle}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Subtítulo</label>
          <textarea
            name="visitSubtitle"
            value={form.visitSubtitle}
            onChange={handleChange}
            className={inputStyle}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Endereço</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            className={inputStyle}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Telefone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={inputStyle}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">
            API Google Maps
          </label>
          <input
            name="mapApiKey"
            value={form.mapApiKey}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Ministérios</h2>
          <label className="block text-sm font-medium text-slate-700 mb-1">Pré-título</label>
          <input
            name="ministriesPreTitle"
            value={form.ministriesPreTitle}
            onChange={handleChange}
            className={inputStyle}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Título</label>
          <input
            name="ministriesTitle"
            value={form.ministriesTitle}
            onChange={handleChange}
            className={inputStyle}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Subtítulo</label>
          <textarea
            name="ministriesSubtitle"
            value={form.ministriesSubtitle}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Congregações</h2>
          <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <input
            name="congregationsTitle"
            value={form.congregationsTitle}
            onChange={handleChange}
            className={inputStyle}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Subtítulo</label>
          <textarea
            name="congregationsSubtitle"
            value={form.congregationsSubtitle}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Logos</h2>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Logo clara
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload("logoLight", e.target.files[0])}
          />
          {form.logoLightURL && (
            <img src={form.logoLightURL} alt="Logo light" className="mt-2 h-16" />
          )}
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">
            Logo escura
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload("logoDark", e.target.files[0])}
          />
          {form.logoDarkURL && (
            <img src={form.logoDarkURL} alt="Logo dark" className="mt-2 h-16 bg-slate-800 p-2 rounded" />
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Rodapé</h2>
          <label className="block text-sm font-medium text-slate-700 mb-1">Texto</label>
          <textarea
            name="footerText"
            value={form.footerText}
            onChange={handleChange}
            className={inputStyle}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Instagram</label>
          <input
            name="instagramLink"
            value={form.instagramLink}
            onChange={handleChange}
            className={inputStyle}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">Facebook</label>
          <input
            name="facebookLink"
            value={form.facebookLink}
            onChange={handleChange}
            className={inputStyle}
          />
        </div>

        {message && <p className="text-sm text-slate-600">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-[#2a3d57] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#202e42] transition-colors flex items-center gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar
        </button>
      </form>
    </PageContent>
  );
}
