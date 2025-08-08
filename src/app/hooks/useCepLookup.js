"use client";

import { useState } from "react";

// máscara simples de CEP 00000-000
export const maskCEP = (v = "") =>
  v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

export function useCepLookup({ form, setForm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [lastFetched, setLastFetched] = useState("");

  const setCepMasked = (value) => {
    const masked = maskCEP(value || "");
    setForm((f) => ({ ...f, cep: masked }));
  };

  const fetchByCep = async (cepDigits, { onlyIfMissing = true } = {}) => {
    if (cepDigits === lastFetched) return;
    setError("");
    if (cepDigits.length !== 8) return;

    try {
      setLoading(true);
      const res  = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = await res.json();

      if (!res.ok || data?.erro) {
        setError("CEP não encontrado.");
        return;
      }

      setForm((f) => ({
        ...f,
        endereco: onlyIfMissing && f.endereco ? f.endereco : (data.logradouro || f.endereco),
        bairro:   onlyIfMissing && f.bairro   ? f.bairro   : (data.bairro     || f.bairro),
        cidade:   onlyIfMissing && f.cidade   ? f.cidade   : (data.localidade || f.cidade),
        uf:       onlyIfMissing && f.uf       ? f.uf       : ((data.uf || f.uf || "").toUpperCase()),
      }));
      setLastFetched(cepDigits);
    } catch (e) {
      console.error(e);
      setError("Falha ao consultar o CEP.");
    } finally {
      setLoading(false);
    }
  };

  // uso direto no onChange do CEP
  const handleCepInput = (value) => {
    setError("");
    setCepMasked(value);
    const digits = (value || "").replace(/\D/g, "");
    if (digits.length === 8) {
      fetchByCep(digits, { onlyIfMissing: true });
    }
  };

  return {
    loading,
    error,
    handleCepInput,
  };
}
