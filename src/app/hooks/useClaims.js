// src/hooks/useClaims.js
"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../lib/firebase/client";

export function useClaims() {
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    // manter a referência do snapshot atual para poder limpar
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // sempre encerra o snapshot anterior antes de continuar
      if (typeof unsubscribeSnapshot === "function") {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!user) {
        setClaims(null);
        setLoading(false);
        return;
      }

      try {
        // força refresh para pegar claims recentes
        const tokenResult = await user.getIdTokenResult(true);
        setClaims(tokenResult.claims || {});
      } catch (e) {
        console.error("Erro ao obter claims:", e);
        setClaims(null);
      } finally {
        setLoading(false);
      }

      // escuta o doc do usuário para forçar refresh das claims quando mudar
      const ref = doc(db, "users", user.uid);
      unsubscribeSnapshot = onSnapshot(
        ref,
        async () => {
          try {
            await user.getIdToken(true); // força refresh
            const tr = await user.getIdTokenResult();
            setClaims(tr.claims || {});
          } catch (e) {
            console.error("Erro ao atualizar claims após mudança no Firestore:", e);
          }
        },
        (err) => {
          // evita barulho no console ao sair/sem permissão
          if (err?.code === "permission-denied") {
            // opcional: limpar claims/estado aqui
            return;
          }
          console.error("Erro no snapshot de claims:", err);
        }
      );
    });

    // cleanup do effect: encerra ambos
    return () => {
      unsubscribeAuth();
      if (typeof unsubscribeSnapshot === "function") {
        unsubscribeSnapshot();
      }
    };
  }, []);

  return { claims, loading };
}

export function useHasRole(roles = []) {
  const { claims, loading } = useClaims();

  if (loading) return { allowed: false, loading: true, role: null };

  const role = claims?.role || null;
  const list = Array.isArray(roles) ? roles : [roles];
  const allowed = role ? list.includes(role) : false;

  return { allowed, loading: false, role };
}
