"use client";

import { useEffect, useState } from "react";
import { HardHat, X } from "lucide-react";

const STORAGE_KEY = "dev_seal_dismissed";

export default function DevelopmentSeal({
  text = "Este portal está em desenvolvimento. Algumas funcionalidades podem não estar disponíveis.",
  className = "",
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1";
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 bg-amber-500 text-white text-sm z-50"
    >
      <div
        className={`container mx-auto px-4 py-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 ${className}`}
      >
        {/* Centro absolutamente centralizado dentro do container */}
        <div className="col-start-2 flex items-center justify-center gap-2 text-center">
          <HardHat size={16} aria-hidden="true" />
          <span>{text}</span>
        </div>

        {/* Botão à direita */}
        <button
          aria-label="Fechar aviso de desenvolvimento"
          className="col-start-3 justify-self-end inline-flex items-center p-1.5 rounded hover:opacity-90"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "1");
            setVisible(false);
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
