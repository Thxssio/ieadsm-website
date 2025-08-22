"use client";

import { useEffect, useState } from "react";
import PageContent from "@/components/portal/ui/PageContent";
import { db, storage } from "@/lib/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  Loader2,
  Rss,
  Image as ImageIcon,
  FileText,
  MapPin,
  Phone,
  Church,
  LayoutGrid,
  Link2,
  Instagram,
  Globe,
  Save as SaveIcon,
  X,
} from "lucide-react";

const BRAND = "#0f172b";
const BRAND_HOVER = "#1e293b";

const inputBase =
  "block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2";
const inputStyle = `${inputBase} focus:ring-[${BRAND}] sm:text-sm`;

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
  congregationsMapUrl: "",
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
  const [message, setMessage] = useState(null); // string | null
  const [uploadProgress, setUploadProgress] = useState({}); // field -> number 0..100

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "siteContent", "main"));
        if (snap.exists()) {
          setForm((f) => ({ ...f, ...snap.data() }));
        }
      } catch (e) {
        console.error("Erro carregando conteúdo:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleUpload = async (field, file) => {
    if (!file) return;
    setSaving(true);
    setUploadProgress((p) => ({ ...p, [field]: 0 }));
    try {
      const path = `siteContent/${field}_${Date.now()}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            setUploadProgress((p) => ({ ...p, [field]: pct }));
          },
          reject,
          resolve
        );
      });

      const url = await getDownloadURL(storageRef);
      const prevPath = form[`${field}Path`];

      setForm((f) => ({
        ...f,
        [`${field}URL`]: url,
        [`${field}Path`]: path,
      }));

      if (prevPath) {
        try {
          await deleteObject(ref(storage, prevPath));
        } catch {
          /* noop */
        }
      }
    } catch (e) {
      console.error("Erro no upload:", e);
      setMessage("Erro no upload da imagem.");
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setSaving(false);
      setUploadProgress((p) => ({ ...p, [field]: undefined }));
    }
  };

  const handleClearImage = async (field) => {
    const prevPath = form[`${field}Path`];
    try {
      if (prevPath) await deleteObject(ref(storage, prevPath));
    } catch {
      /* noop */
    } finally {
      setForm((f) => ({
        ...f,
        [`${field}URL`]: "",
        [`${field}Path`]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, "siteContent", "main"), form, { merge: true });
      setMessage("Conteúdo salvo!");
      setTimeout(() => setMessage(null), 3000);
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
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando…
          </div>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent title="Conteúdo do Site">
      {message && (
        <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
          {message}
        </div>
      )}

      {/* form id para botão flutuante submeter */}
      <form id="site-content-form" onSubmit={handleSubmit} className="space-y-6">
        {/* ====== RSS ====== */}
        <SectionCard
          icon={Rss}
          title="Feed RSS"
          desc="Configure a fonte de posts para sua página inicial."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Link RSS do Facebook" iconLeft={<Link2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />}>
              <input
                type="url"
                name="rssLink"
                value={form.rssLink}
                onChange={handleChange}
                className={inputStyle}
                placeholder="https://rss.app/feeds/..."
              />
            </Field>
          </div>
        </SectionCard>

        {/* ====== Seção Inicial ====== */}
        <SectionCard
          icon={LayoutGrid}
          title="Seção Inicial (Hero)"
          desc="Título, subtítulo e imagem de destaque da home."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Título">
              <input
                name="heroTitle"
                value={form.heroTitle}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Ex.: Uma igreja para toda a família"
              />
            </Field>

            <Field label="Subtítulo">
              <textarea
                name="heroSubtitle"
                value={form.heroSubtitle}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Mensagem curta para acolher quem visita o site."
              />
            </Field>
          </div>

          <div className="mt-2">
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Imagem de Fundo
            </span>

            {!form.heroImageURL ? (
              <UploadBox
                onPick={(file) => handleUpload("heroImage", file)}
                caption="Selecione uma imagem (JPG/PNG)"
              />
            ) : (
              <ImagePreview
                url={form.heroImageURL}
                ratioClass="h-40"
                onRemove={() => handleClearImage("heroImage")}
              />
            )}

            {typeof uploadProgress.heroImage === "number" && (
              <ProgressBar value={uploadProgress.heroImage} />
            )}
          </div>
        </SectionCard>

        {/* ====== Mensagem de Boas-vindas ====== */}
        <SectionCard
          icon={FileText}
          title="Mensagem de Boas-vindas"
          desc="Texto de abertura com versículo e referência."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Título">
              <input
                name="welcomeTitle"
                value={form.welcomeTitle}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Ex.: Seja muito bem-vindo!"
              />
            </Field>

            <Field label="Referência do Verso">
              <input
                name="welcomeReference"
                value={form.welcomeReference}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Ex.: João 3:16"
              />
            </Field>

            <Field label="Verso (texto)" className="md:col-span-2">
              <textarea
                name="welcomeVerse"
                value={form.welcomeVerse}
                onChange={handleChange}
                className={inputStyle}
                rows={3}
                placeholder="Digite o versículo de boas-vindas."
              />
            </Field>
          </div>
        </SectionCard>

        {/* ====== Visite-nos ====== */}
        <SectionCard
          icon={Church}
          title="Visite-nos"
          desc="Informações de endereço, telefone e chave do mapa."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Título">
              <input
                name="visitTitle"
                value={form.visitTitle}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Ex.: Venha nos visitar"
              />
            </Field>

            <Field label="Subtítulo">
              <textarea
                name="visitSubtitle"
                value={form.visitSubtitle}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Mensagem curta sobre horários/recepção."
              />
            </Field>

            <Field label="Endereço" iconLeft={<MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500" />}>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className={inputStyle}
                rows={2}
                placeholder="Rua, número, bairro, cidade/UF"
              />
            </Field>

            <Field label="Telefone" iconLeft={<Phone className="h-4 w-4 text-slate-400 dark:text-slate-500" />}>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputStyle}
                placeholder="(55) 9 9999-9999"
              />
            </Field>

            <Field
              label="Google Maps API Key"
              iconLeft={<Globe className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
            >
              <input
                name="mapApiKey"
                value={form.mapApiKey}
                onChange={handleChange}
                className={inputStyle}
                placeholder="AIzaSyA... (opcional)"
              />
            </Field>

            <Field
              label="Link do mapa das congregações (URL de embed, ex.: Google My Maps)"
              iconLeft={<Link2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />}
            >
              <input
                name="congregationsMapUrl"
                value={form.congregationsMapUrl}
                onChange={handleChange}
                className={inputStyle}
                placeholder="https://www.google.com/maps/d/embed?..."
              />
            </Field>
          </div>
        </SectionCard>

        {/* ====== Ministérios ====== */}
        <SectionCard
          icon={LayoutGrid}
          title="Ministérios"
          desc="Textos da seção de ministérios."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Pré-título">
              <input
                name="ministriesPreTitle"
                value={form.ministriesPreTitle}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Ex.: Nossos Ministérios"
              />
            </Field>
            <Field label="Título">
              <input
                name="ministriesTitle"
                value={form.ministriesTitle}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Ex.: Servimos com propósito"
              />
            </Field>
            <Field label="Subtítulo" className="md:col-span-2">
              <textarea
                name="ministriesSubtitle"
                value={form.ministriesSubtitle}
                onChange={handleChange}
                className={inputStyle}
                rows={3}
                placeholder="Breve explicação sobre os ministérios."
              />
            </Field>
          </div>
        </SectionCard>

        {/* ====== Congregações ====== */}
        <SectionCard
          icon={Church}
          title="Congregações"
          desc="Textos de topo da seção de congregações."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Título">
              <input
                name="congregationsTitle"
                value={form.congregationsTitle}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Ex.: Nossas Congregações"
              />
            </Field>
            <Field label="Subtítulo">
              <textarea
                name="congregationsSubtitle"
                value={form.congregationsSubtitle}
                onChange={handleChange}
                className={inputStyle}
                placeholder="Descrição breve da rede de congregações."
              />
            </Field>
          </div>
        </SectionCard>

        {/* ====== Logos ====== */}
        <SectionCard
          icon={ImageIcon}
          title="Logos"
          desc="Versões clara e escura para a identidade do site."
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Logo clara */}
            <div>
              <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Logo Clara
              </span>

              {!form.logoLightURL ? (
                <UploadBox
                  onPick={(file) => handleUpload("logoLight", file)}
                  caption="PNG/SVG com fundo transparente"
                />
              ) : (
                <ImagePreview
                  url={form.logoLightURL}
                  ratioClass="h-24"
                  onRemove={() => handleClearImage("logoLight")}
                />
              )}

              {typeof uploadProgress.logoLight === "number" && (
                <ProgressBar value={uploadProgress.logoLight} />
              )}
            </div>

            {/* Logo escura */}
            <div>
              <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Logo Escura
              </span>

              {!form.logoDarkURL ? (
                <UploadBox
                  onPick={(file) => handleUpload("logoDark", file)}
                  caption="PNG/SVG com fundo transparente"
                />
              ) : (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-800 p-3">
                  <ImagePreview
                    url={form.logoDarkURL}
                    ratioClass="h-24"
                    onRemove={() => handleClearImage("logoDark")}
                    darkBg
                  />
                </div>
              )}

              {typeof uploadProgress.logoDark === "number" && (
                <ProgressBar value={uploadProgress.logoDark} />
              )}
            </div>
          </div>
        </SectionCard>

        {/* ====== Rodapé ====== */}
        <SectionCard
          icon={FileText}
          title="Rodapé"
          desc="Texto institucional e links sociais."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Texto do Rodapé" className="md:col-span-2">
              <textarea
                name="footerText"
                value={form.footerText}
                onChange={handleChange}
                className={inputStyle}
                rows={3}
                placeholder="Ex.: © 2025 IEADSM — Todos os direitos reservados."
              />
            </Field>

            <Field label="Instagram" iconLeft={<Instagram className="h-4 w-4 text-slate-400 dark:text-slate-500" />}>
              <input
                name="instagramLink"
                value={form.instagramLink}
                onChange={handleChange}
                className={inputStyle}
                placeholder="https://instagram.com/..."
              />
            </Field>

            <Field label="Facebook" iconLeft={<Globe className="h-4 w-4 text-slate-400 dark:text-slate-500" />}>
              <input
                name="facebookLink"
                value={form.facebookLink}
                onChange={handleChange}
                className={inputStyle}
                placeholder="https://facebook.com/..."
              />
            </Field>
          </div>
        </SectionCard>

        {/* Botão "fantasma" para acessibilidade (também temos o FAB) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center gap-2 rounded-lg bg-[${BRAND}] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[${BRAND_HOVER}] ${saving ? "opacity-80" : ""}`}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar alterações
          </button>
        </div>
      </form>

      {/* FAB de Salvar sempre visível */}
      <button
        form="site-content-form"
        type="submit"
        disabled={saving}
        className={`fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[${BRAND}] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[${BRAND_HOVER}] ${saving ? "opacity-80" : ""}`}
        title="Salvar"
        aria-label="Salvar"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
        Salvar
      </button>
    </PageContent>
  );
}

/* ========================== UI Subcomponents ========================== */

function SectionCard({ icon: Icon, title, desc, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <header className="flex items-start gap-3 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${BRAND}15` }}>
          <Icon className="h-5 w-5" style={{ color: BRAND }} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          {desc && <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>}
        </div>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({ label, children, iconLeft, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <div className={`relative ${iconLeft ? "pl-0" : ""}`}>
        {iconLeft && <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">{iconLeft}</div>}
        {iconLeft
          ? cloneWithClass(children, `${inputBase} pl-9 focus:ring-2 focus:ring-[${BRAND}] sm:text-sm`)
          : children}
      </div>
    </label>
  );
}

function cloneWithClass(node, extra) {
  return {
    ...node,
    props: {
      ...node.props,
      className: `${node.props.className || ""} ${extra}`.trim(),
    },
  };
}

function UploadBox({ onPick, caption = "Selecione um arquivo" }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <ImageIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
        <p className="text-sm text-slate-600 dark:text-slate-400">{caption}</p>
        <label
          className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white shadow-sm"
          style={{ backgroundColor: BRAND }}
        >
          Escolher arquivo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0])}
          />
        </label>
      </div>
    </div>
  );
}

function ImagePreview({ url, ratioClass = "h-32", onRemove, darkBg = false }) {
  return (
    <div className={`relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 ${darkBg ? "bg-slate-800" : "bg-slate-50 dark:bg-slate-800"}`}>
      <img src={url} alt="preview" className={`${ratioClass} w-full object-contain`} />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/90 dark:bg-slate-800/90 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 shadow hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700"

        title="Remover"
      >
        <X className="h-3.5 w-3.5" />
        Remover
      </button>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-700">
      <div
        className="h-2"
        style={{ width: `${value}%`, backgroundColor: BRAND, transition: "width .2s" }}
      />
    </div>
  );
}
