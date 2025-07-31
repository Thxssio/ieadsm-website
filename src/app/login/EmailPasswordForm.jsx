"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase/client";
import { signInWithEmailAndPassword } from "firebase/auth";

const mapError = (code) => {
  switch (code) {
    case "auth/invalid-email": return "E-mail inválido.";
    case "auth/user-disabled": return "Usuário desativado.";
    case "auth/user-not-found": return "Usuário não encontrado.";
    case "auth/wrong-password": return "Senha incorreta.";
    case "auth/invalid-credential": return "Credenciais inválidas.";
    case "auth/too-many-requests": return "Muitas tentativas. Tente novamente em alguns minutos.";
    default: return "Não foi possível entrar. Tente novamente.";
  }
};

export default function EmailPasswordForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");   // <- sempre controlado
  const [pwd, setPwd]     = useState("");   // <- sempre controlado
  const [show, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  useEffect(() => setMounted(true), []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pwd);
      router.push("/");
    } catch (e) {
      setErr(mapError(e.code));
    } finally {
      setLoading(false);
    }
  };

  // enquanto não montou, mantemos disabled para evitar mismatch
  const disabled = !mounted || loading;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-stone-700">E‑mail</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}                         // <- controlado desde o SSR (valor = "")
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2a3d57] disabled:opacity-60"
          placeholder="voce@exemplo.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-stone-700">Senha</label>
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            disabled={!mounted}
            className="text-xs text-stone-500 hover:text-stone-700 disabled:opacity-60"
          >
            {show ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        <input
          id="password"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          required
          value={pwd}                           // <- controlado desde o SSR (valor = "")
          onChange={(e) => setPwd(e.target.value)}
          disabled={disabled}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2a3d57] disabled:opacity-60"
          placeholder="••••••••"
        />
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <button
        type="submit"
        disabled={disabled}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#2a3d57] text-white font-semibold px-4 py-3 rounded-lg shadow-sm hover:bg-[#202e42] disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <div className="mt-3 text-sm text-stone-600 flex items-center justify-between">
        <Link href="/recuperar-senha" className="hover:text-[#2a3d57]">Esqueceu a senha?</Link>
        <Link href="/registrar" className="hover:text-[#2a3d57]">Criar conta</Link>
      </div>
    </form>
  );
}
