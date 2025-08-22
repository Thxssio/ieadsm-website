"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMsg("Se o e‑mail estiver cadastrado, enviaremos um link para redefinir a senha.");
    } catch {
      setErr("Não foi possível enviar o e‑mail. Verifique o endereço e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">E‑mail</label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-stone-900 dark:text-stone-100 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57] placeholder-stone-400 dark:placeholder-slate-400"
          placeholder="usuario@mail.com"
        />
      </div>

      {msg && <p className="text-sm text-emerald-600 dark:text-emerald-400">{msg}</p>}
      {err && <p className="text-sm text-red-600 dark:text-red-400">{err}</p>}

      <button
        type="submit" disabled={loading}
        className="w-full inline-flex items-center justify-center bg-[#2a3d57] text-white font-semibold px-4 py-3 rounded-lg hover:bg-[#202e42] disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Enviar link"}
      </button>
    </form>
  );
}

