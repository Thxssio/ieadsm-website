"use client";

import { useEffect, useRef, useState } from "react";

const digitsOnly = (s = "") => (s || "").replace(/\D/g, "");
const maskCep = (digs) =>
  digs.length <= 5 ? digs : `${digs.slice(0, 5)}-${digs.slice(5, 8)}`;

export function useCepLookup({ setForm, debounceMs = 350 }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const reqSeq = useRef(0);
  const cacheRef = useRef(new Map()); // Map<cep8, response>

  const handleCepInput = (value) => {
    const digs = digitsOnly(value).slice(0, 8);
    const masked = maskCep(digs);

    // Atualiza campo CEP sempre com máscara
    setForm((f) => ({ ...f, cep: masked }));

    // Enquanto não tiver 8 dígitos, não busca
    if (digs.length < 8) {
      setError("");
      setLoading(false);
      clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchCep(digs), debounceMs);
  };

  async function fetchCep(cep8) {
    // Cache
    if (cacheRef.current.has(cep8)) {
      applyCepData(cep8, cacheRef.current.get(cep8));
      return;
    }

    // Cancela req anterior
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const mySeq = ++reqSeq.current;
    setLoading(true);
    setError("");

    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cep8}/json/`, {
        signal: abortRef.current.signal,
        headers: { Accept: "application/json" },
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();
      if (data?.erro) throw new Error("CEP não encontrado.");

      cacheRef.current.set(cep8, data);

      // evita aplicar resposta antiga
      if (mySeq !== reqSeq.current) return;

      applyCepData(cep8, data);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error(err);
      if (mySeq !== reqSeq.current) return;
      setError(
        err?.message === "CEP não encontrado."
          ? "CEP não encontrado."
          : "Falha ao buscar o CEP. Tente novamente."
      );
    } finally {
      if (mySeq === reqSeq.current) setLoading(false);
    }
  }

  // Aplica usando setForm funcional para não ler 'form' “stale”
  function applyCepData(cep8, data) {
    setForm((prev) => {
      // Se o usuário mudou o CEP no meio do caminho, não sobrescreve
      const now = digitsOnly(prev?.cep);
      if (now !== cep8) return prev;

      return {
        ...prev,
        endereco: data.logradouro || prev.endereco || "",
        bairro: data.bairro || prev.bairro || "",
        cidade: data.localidade || prev.cidade || "",
        uf: (data.uf || prev.uf || "").toUpperCase(),
      };
    });
    setError("");
  }

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { loading, error, handleCepInput };
}
