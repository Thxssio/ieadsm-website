"use client";

import React, { useEffect, useState, useCallback } from "react";
import PageContent from "@/components/portal/ui/PageContent";
import {
  getAuth,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { db, storage } from "@/lib/firebase/client";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { AnimatePresence, motion } from "framer-motion";
import {
  Upload,
  Loader2,
  Image as ImageIcon,
  UserCircle2,
  Mail,
  Lock,
  RotateCcw,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import { useRouter } from "next/navigation";

/* Helpers */
function cx(...xs) { return xs.filter(Boolean).join(" "); }
function initialsFromName(name = "") {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("");
}

/* Compressão para WEBP no browser */
async function fileToWebp(file, opts = {}) {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.85 } = opts;
  const blobUrl = URL.createObjectURL(file);

  const toWebpFromCanvas = (canvas) =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) return reject(new Error("Falha ao gerar WEBP"));
          resolve(new File([b], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" }));
        },
        "image/webp",
        quality
      );
    });

  try {
    if (typeof createImageBitmap === "function") {
      const bmp = await createImageBitmap(file);
      const ratio = Math.min(maxWidth / bmp.width, maxHeight / bmp.height, 1);
      const w = Math.round(bmp.width * ratio);
      const h = Math.round(bmp.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")?.drawImage(bmp, 0, 0, w, h);
      const out = await toWebpFromCanvas(canvas);
      URL.revokeObjectURL(blobUrl);
      return out;
    }

    // Fallback com <img>
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = blobUrl;
    });
    const ratio = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight, 1);
    const w = Math.round(img.naturalWidth * ratio);
    const h = Math.round(img.naturalHeight * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
    const out = await toWebpFromCanvas(canvas);
    URL.revokeObjectURL(blobUrl);
    return out;
  } catch (e) {
    console.error(e);
    URL.revokeObjectURL(blobUrl);
    throw e;
  }
}

/* Avatar */
function UserAvatar({ name, photoURL, size = 84 }) {
  const [err, setErr] = useState(false);
  const ini = initialsFromName(name || "Usuário");
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full ring-2 ring-[#2a3d57]/15" />
      <div className="relative rounded-full overflow-hidden border border-slate-200 bg-white shadow-sm" style={{ width: size, height: size }}>
        {!photoURL || err ? (
          <div className="w-full h-full grid place-items-center bg-slate-50">
            <span className="text-base font-semibold text-slate-600">{ini}</span>
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

export default function ConfigurationPage() {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const router = useRouter();

  /* Estado */
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [phone, setPhone] = useState("");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
  const [photoPath, setPhotoPath] = useState("");

  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [newEmail, setNewEmail] = useState(currentUser?.email || "");
  const [emailPwd, setEmailPwd] = useState("");

  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [message, setMessage] = useState(null);

  const { theme, toggleTheme } = useTheme();

  const handleThemeToggle = async () => {
    const uid = currentUser?.uid;
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

  /* Carrega doc do usuário */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!currentUser) return;
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (mounted && snap.exists()) {
        const d = snap.data();
        if (d.phone) setPhone(d.phone);
        if (d.photoURL && !currentUser.photoURL) setPhotoURL(d.photoURL);
        if (d.photoPath) setPhotoPath(d.photoPath);
      }
    })();
    return () => { mounted = false; };
  }, [currentUser]);

  const showMsg = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4500);
  }, []);

  /* Upload de foto */
  async function handleSelectPhoto(e) {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    try {
      setUploading(true);
      setUploadPct(0);

      const webp = await fileToWebp(file, { maxWidth: 800, maxHeight: 800, quality: 0.86 });
      const path = `users/${currentUser.uid}/avatar_${Date.now()}.webp`;
      const storageRef = ref(storage, path);

      const task = uploadBytesResumable(storageRef, webp, { contentType: "image/webp" });
      await new Promise((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) => {
            const p = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            setUploadPct(p);
          },
          reject,
          resolve
        );
      });

      const url = await getDownloadURL(task.snapshot.ref);
      await updateProfile(currentUser, { displayName, photoURL: url });
      await setDoc(
        doc(db, "users", currentUser.uid),
        { displayName, photoURL: url, photoPath: path, updatedAt: serverTimestamp() },
        { merge: true }
      );

      if (photoPath && photoPath !== path) {
        try {
          await deleteObject(ref(storage, photoPath));
        } catch {
          /* ignore stale image */
        }
      }

      setPhotoURL(url);
      setPhotoPath(path);
      showMsg("success", "Foto atualizada com sucesso.");
    } catch (err) {
      console.error(err);
      showMsg("error", "Falha ao enviar a foto. Tente novamente.");
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  }

  /* Salva nome/telefone */
  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!currentUser) return;
    try {
      setSavingProfile(true);
      if (displayName && displayName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName });
      }
      await setDoc(
        doc(db, "users", currentUser.uid),
        { displayName, phone, updatedAt: serverTimestamp() },
        { merge: true }
      );
      showMsg("success", "Dados atualizados.");
    } catch (err) {
      console.error(err);
      showMsg("error", "Não foi possível salvar os dados.");
    } finally {
      setSavingProfile(false);
    }
  }

  /* Troca de e-mail */
  async function handleChangeEmail(e) {
    e.preventDefault();
    const u = currentUser;
    if (!u) return;
    if (!newEmail || newEmail === u.email) {
      showMsg("error", "Informe um e-mail diferente para atualizar.");
      return;
    }
    if (!emailPwd) {
      showMsg("error", "Informe sua senha atual.");
      return;
    }
    try {
      setSavingEmail(true);
      const cred = EmailAuthProvider.credential(u.email, emailPwd);
      await reauthenticateWithCredential(u, cred);
      await updateEmail(u, newEmail);
      await setDoc(
        doc(db, "users", u.uid),
        { email: newEmail, updatedAt: serverTimestamp() },
        { merge: true }
      );
      try {
        await sendEmailVerification(u);
      } catch {
        /* ignore verification email errors */
      }
      setEmailPwd("");
      showMsg("success", "E-mail atualizado. Verifique sua caixa de entrada.");
    } catch (err) {
      console.error(err);
      const msg =
        err?.code === "auth/wrong-password" ? "Senha incorreta."
        : err?.code === "auth/requires-recent-login" ? "Faça login novamente para alterar o e-mail."
        : "Não foi possível alterar o e-mail.";
      showMsg("error", msg);
    } finally {
      setSavingEmail(false);
    }
  }

  /* Troca de senha */
  async function handleChangePassword(e) {
    e.preventDefault();
    const u = currentUser;
    if (!u) return;
    if (!pwdCurrent || !pwdNew || !pwdConfirm) {
      showMsg("error", "Preencha todos os campos de senha.");
      return;
    }
    if (pwdNew !== pwdConfirm) {
      showMsg("error", "A confirmação da senha não confere.");
      return;
    }
    try {
      setSavingPassword(true);
      const cred = EmailAuthProvider.credential(u.email, pwdCurrent);
      await reauthenticateWithCredential(u, cred);
      await updatePassword(u, pwdNew);
      setPwdCurrent(""); setPwdNew(""); setPwdConfirm("");
      showMsg("success", "Senha atualizada com sucesso.");
    } catch (err) {
      console.error(err);
      const msg =
        err?.code === "auth/wrong-password" ? "Senha atual incorreta."
        : err?.code === "auth/weak-password" ? "A nova senha é muito fraca."
        : err?.code === "auth/requires-recent-login" ? "Faça login novamente para alterar a senha."
        : "Não foi possível alterar a senha.";
      showMsg("error", msg);
    } finally {
      setSavingPassword(false);
    }
  }

  const inputBase =
    "block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg " +
    "placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2a3d57] " +
    "sm:text-sm";

  return (
    <PageContent
      title="Configurações da Conta"
      // se seu PageContent suporta subtitle, fica massa:
      subtitle="Gerencie seus dados, foto, e credenciais de acesso."
    >
      {/* Toaster simples */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={cx(
              "mb-4 rounded-md px-3 py-2 text-sm border",
              message.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            )}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna esquerda (foto + dados pessoais) */}
        <div className="lg:col-span-1 space-y-6">
          {/* FOTO */}
          <section className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 grid place-items-center rounded-lg bg-[#2a3d57]/10 text-[#2a3d57]">
                <ImageIcon size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 leading-tight">Foto 3x4</h3>
                <p className="text-xs text-slate-500">Formato retrato, até 800×800.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <UserAvatar name={displayName || currentUser?.email} photoURL={photoURL} />
              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleSelectPhoto} />
                  <span className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 active:scale-[.99]">
                    <Upload size={16} /> Escolher arquivo
                  </span>
                </label>

                {uploading && (
                  <div className="mt-3 w-64 max-w-full">
                    <div className="h-2 w-full rounded bg-slate-200 overflow-hidden">
                      <div
                        className="h-2 rounded bg-[#2a3d57] transition-[width]"
                        style={{ width: `${uploadPct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Enviando… {uploadPct}%</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* DADOS PESSOAIS */}
          <section className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 grid place-items-center rounded-lg bg-[#2a3d57]/10 text-[#2a3d57]">
                <UserCircle2 size={18} />
              </div>
              <h3 className="text-base font-semibold text-slate-800 leading-tight">Dados pessoais</h3>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
                <input className={inputBase} value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone (opcional)</label>
                <input className={inputBase} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-[#2a3d57] hover:bg-[#264254] active:scale-[.99] disabled:opacity-60"
                >
                  {savingProfile && <Loader2 className="animate-spin" size={16} />}
                  Salvar dados
                </button>
              </div>
            </form>
          </section>

          {/* TEMA */}
          <section className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 grid place-items-center rounded-lg bg-[#2a3d57]/10 text-[#2a3d57]">
                  {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <h3 className="text-base font-semibold text-slate-800 leading-tight">Tema</h3>
              </div>
              <button
                type="button"
                onClick={handleThemeToggle}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                {theme === "dark" ? "Modo claro" : "Modo escuro"}
              </button>
            </div>
          </section>
        </div>

        {/* Coluna direita (credenciais) */}
        <div className="lg:col-span-2 space-y-6">
          {/* E-MAIL */}
          <section className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 grid place-items-center rounded-lg bg-[#2a3d57]/10 text-[#2a3d57]">
                <Mail size={18} />
              </div>
              <h3 className="text-base font-semibold text-slate-800 leading-tight">Alterar e-mail</h3>
            </div>

            <form onSubmit={handleChangeEmail} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Novo e-mail</label>
                <input className={inputBase} type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha atual</label>
                <input className={inputBase} type="password" value={emailPwd} onChange={(e) => setEmailPwd(e.target.value)} required />
              </div>

              <div className="md:col-span-2 pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingEmail}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-[#2a3d57] hover:bg-[#264254] active:scale-[.99] disabled:opacity-60"
                >
                  {savingEmail && <Loader2 className="animate-spin" size={16} />}
                  Atualizar e-mail
                </button>
              </div>
            </form>
          </section>

          {/* SENHA */}
          <section className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 grid place-items-center rounded-lg bg-[#2a3d57]/10 text-[#2a3d57]">
                <Lock size={18} />
              </div>
              <h3 className="text-base font-semibold text-slate-800 leading-tight">Alterar senha</h3>
            </div>

            <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha atual</label>
                <input className={inputBase} type="password" value={pwdCurrent} onChange={(e) => setPwdCurrent(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nova senha</label>
                <input className={inputBase} type="password" value={pwdNew} onChange={(e) => setPwdNew(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar nova senha</label>
                <input className={inputBase} type="password" value={pwdConfirm} onChange={(e) => setPwdConfirm(e.target.value)} required />
              </div>

              <div className="md:col-span-3 pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-[#2a3d57] hover:bg-[#264254] active:scale-[.99] disabled:opacity-60"
                >
                  {savingPassword && <Loader2 className="animate-spin" size={16} />}
                  Atualizar senha
                </button>
              </div>
            </form>
          </section>

          {/* REABRIR CADASTRO COMPLEMENTAR */}
          <section className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 grid place-items-center rounded-lg bg-[#2a3d57]/10 text-[#2a3d57]">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800 leading-tight">Cadastro complementar</h3>
                  <p className="text-xs text-slate-500">Refaça o passo-a-passo de cadastro quando quiser.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const uid = auth.currentUser?.uid;
                  if (!uid) return;
                  await setDoc(
                    doc(db, "users", uid),
                    {
                      profileComplete: false,
                      onboarding: {
                        status: "pending",
                        step: 0,
                        updatedAt: serverTimestamp(),
                      },
                    },
                    { merge: true }
                  );
                  await auth.signOut();
                  router.replace("/login");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-[#2a3d57] hover:bg-[#264254] active:scale-[.99]"
              >
                Reabrir cadastro
              </button>
            </div>
          </section>
        </div>
      </div>
    </PageContent>
  );
}
