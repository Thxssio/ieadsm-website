"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase/client";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

const mapError = (code) => {
  switch (code) {
    case "auth/email-already-in-use": return "E-mail já cadastrado.";
    case "auth/invalid-email": return "E-mail inválido.";
    case "auth/operation-not-allowed": return "Método de cadastro desativado.";
    case "auth/weak-password": return "Senha fraca (mínimo 6 caracteres).";
    default: return "Não foi possível criar a conta. Tente novamente.";
  }
};

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd]     = useState("");
  const [pwd2, setPwd2]   = useState("");
  const [err, setErr]     = useState("");
  const [ok, setOk]       = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    if (pwd !== pwd2) return setErr("As senhas não coincidem.");

    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pwd);
      if (name) await updateProfile(cred.user, { displayName: name });

      // opcional: verificação de e-mail
      try { await sendEmailVerification(cred.user); } catch {}

      setOk("Conta criada com sucesso. Verifique seu e-mail para confirmar.");
      // Redirecione após uns segundos, se quiser:
      setTimeout(() => router.push("/"), 1500);
    } catch (e) {
      setErr(mapError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700">Nome</label>
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57]"
          placeholder="Seu nome"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">E‑mail</label>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57]"
          placeholder="voce@exemplo.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">Senha</label>
        <input
          type="password" required value={pwd} onChange={(e) => setPwd(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57]"
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">Confirmar senha</label>
        <input
          type="password" required value={pwd2} onChange={(e) => setPwd2(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57]"
          placeholder="Repita a senha"
        />
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {ok  && <p className="text-sm text-emerald-600">{ok}</p>}

      <button
        type="submit" disabled={loading}
        className="w-full inline-flex items-center justify-center bg-[#2a3d57] text-white font-semibold px-4 py-3 rounded-lg hover:bg-[#202e42] disabled:opacity-60"
      >
        {loading ? "Cadastrando..." : "Criar conta"}
      </button>
    </form>
  );
}
