"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase/client";
import { 
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail 
} from "firebase/auth";

const getProviderName = (providerId) => {
  switch (providerId) {
    case "google.com": return "Google";
    case "apple.com": return "Apple";
    case "facebook.com": return "Facebook";
    default: return providerId;
  }
};

export default function EmailPasswordForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => setMounted(true), []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), pwd);
      router.push("/portal");
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);

          if (methods.length > 0) {
            const providerName = getProviderName(methods[0]);
            setErr(`Este e-mail foi usado com ${providerName}. Por favor, faça login com o botão correspondente.`);
          } else {
            setErr("E-mail ou senha inválidos.");
          }
        } catch (fetchError) {
          setErr("Ocorreu um erro ao verificar seu e-mail.");
        }
      } else {
        setErr("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={disabled}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2a3d57] disabled:opacity-60"
          placeholder="usuario@mail.com"
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
          value={pwd}
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