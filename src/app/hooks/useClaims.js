
// src/hooks/useClaims.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../lib/firebase/client";

export function useClaims() {
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);
  const unsubSnapRef = useRef(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (typeof unsubSnapRef.current === "function") {
        unsubSnapRef.current();
        unsubSnapRef.current = null;
      }

      if (!user) {
        setClaims(null);
        setLoading(false);
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult(true);
        setClaims(tokenResult.claims || {});
      } catch (e) {
        console.error("Erro ao obter claims:", e);
        setClaims(null);
      } finally {
        setLoading(false);
      }

      const ref = doc(db, "users", user.uid);
      unsubSnapRef.current = onSnapshot(
        ref,
        async () => {
          try {
            await user.getIdToken(true);
            const tr = await user.getIdTokenResult();
            setClaims(tr.claims || {});
          } catch (e) {
            console.error("Erro ao atualizar claims após mudança no Firestore:", e);
          }
        },
        (err) => {
          if (err?.code !== "permission-denied") {
            console.error("Erro no snapshot de claims:", err);
          }
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (typeof unsubSnapRef.current === "function") unsubSnapRef.current();
    };
  }, []);

  const role = claims?.role || null;
  const hasRole = useMemo(() => (roles) => {
    const list = Array.isArray(roles) ? roles : [roles];
    return role ? list.includes(role) : false;
  }, [role]);

  return { claims, role, hasRole, loading };
}

export function useHasRole(roles = []) {
  const { role, loading } = useClaims();
  if (loading) return { allowed: false, loading: true, role: null };
  const list = Array.isArray(roles) ? roles : [roles];
  return { allowed: role ? list.includes(role) : false, loading: false, role };
}