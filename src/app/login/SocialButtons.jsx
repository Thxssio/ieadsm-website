"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase/client";
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { Apple } from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5">
      <path fill="#FFC107" d="M43.6 20.5H42v-.1H24v7.2h11.3C33.7 31 29.3 34 24 34c-7 0-12.7-5.7-12.7-12.7S17 8.7 24 8.7c3.2 0 6.2 1.2 8.4 3.3l5.1-5.1C33.8 3.9 29.2 2 24 2 12.4 2 3 11.4 3 23s9.4 21 21 21c10.9 0 20.4-7.9 20.4-21 0-1.1-.1-2.2-.3-3.3z"/>
      <path fill="#FF3D00" d="M6.3 14.7l5.9 4.3C13.9 15.2 18.5 12 24 12c3.2 0 6.2 1.2 8.4 3.3l5.1-5.1C33.8 3.9 29.2 2 24 2 15.6 2 8.6 6.7 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.5-4.9l-6.2-4.9c-2.1 1.5-4.9 2.4-7.3 2.4-5.2 0-9.6-3.5-11.2-8.3l-5.9 4.6C8.9 39.8 15.9 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42v-.1H24v7.2h11.3c-1.3 3.9-5.3 6.4-9.3 6.4-5.2 0-9.6-3.5-11.2-8.3l-5.9 4.6C8.9 39.8 15.9 44 24 44c10.9 0 20.4-7.9 20.4-21 0-1.1-.1-2.2-.3-3.3z"/>
    </svg>
  );
}

export default function SocialButtons() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);   // <- chave para evitar mismatch
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  const signGoogle = async () => {
    if (!auth) return; // guarda extra
    try {
      setError(""); setLoading("google");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (e) {
      console.error(e);
      setError("Falha ao entrar com Google. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  const signApple = async () => {
    if (!auth) return;
    try {
      setError(""); setLoading("apple");
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (e) {
      console.error(e);
      setError("Falha ao entrar com Apple. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  // Enquanto não montou no cliente, renderizamos botões desabilitados (markup estável)
  if (!mounted) {
    return (
      <div className="space-y-3">
        <button
          disabled
          className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 opacity-60"
        >
          <GoogleIcon /> Entrar com Google
        </button>
        <button
          disabled
          className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-stone-800 bg-stone-900 px-4 py-3 text-sm font-semibold text-white opacity-60"
        >
          <Apple className="h-5 w-5" /> Entrar com Apple
        </button>
      </div>
    );
  }

  // Após montar, usamos o estado real (sem causar hydration mismatch)
  return (
    <>
      <div className="space-y-3">
        <button
          onClick={signGoogle}
          disabled={loading === "google"}
          className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-60"
        >
          <GoogleIcon />
          {loading === "google" ? "Entrando com Google..." : "Entrar com Google"}
        </button>

        <button
          onClick={signApple}
          disabled={loading === "apple"}
          className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-stone-800 bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          <Apple className="h-5 w-5" />
          {loading === "apple" ? "Entrando com Apple..." : "Entrar com Apple"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </>
  );
}
