"use client";
import { useEffect, useState, useCallback } from "react";
import { db } from "../lib/firebase/client";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export function useOnboarding(uid) {
  const [state, setState] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    let mounted = true;
    (async () => {
      const snap = await getDoc(doc(db, "users", uid));
      if (mounted) {
        const ob = snap.exists() ? snap.data().onboarding : null;
        setState(ob || { status: "incomplete", step: 0, required: ["displayName", "photoURL"] });
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [uid]);

  const setOnboarding = useCallback(async (uid, partial) => {
    await setDoc(
      doc(db, "users", uid),
      { onboarding: { ...(state || {}), ...partial, updatedAt: serverTimestamp() } },
      { merge: true }
    );
    setState((s) => ({ ...(s || {}), ...partial }));
  }, [state]);

  return { onboarding: state, setOnboarding, loading };
}
