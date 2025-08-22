"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

const AuthContext = createContext({
  user: null,
  role: null,
  profileComplete: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // limpa listener anterior
      unsubscribeSnapshot();

      if (firebaseUser) {
        setIsLoading(true);
        const userDocRef = doc(db, "users", firebaseUser.uid);

        unsubscribeSnapshot = onSnapshot(
          userDocRef,
          async (snap) => {
            if (snap.exists()) {
              const data = snap.data();

              // só sincroniza emailVerified -> banco (sem mexer em profileComplete aqui)
              if (firebaseUser.emailVerified && !data.emailVerified) {
                try {
                  await updateDoc(userDocRef, { emailVerified: true });
                } catch (e) {
                  console.error("Falha ao atualizar emailVerified:", e);
                }
              }

              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: data.name || firebaseUser.email,
                emailVerified: !!(data.emailVerified || firebaseUser.emailVerified),
              });
              setRole(data.role || null);

              // 👇 confia no flag salvo pelo formulário
              setProfileComplete(!!data.profileComplete);
            } else {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
              });
              setRole(null);
              setProfileComplete(false);
            }
            setIsLoading(false);
          },
          (error) => {
            console.error("Erro no listener do documento do usuário:", error);
            setIsLoading(false);
          }
        );
      } else {
        setUser(null);
        setRole(null);
        setProfileComplete(false);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, []);

  // Permite forçar uma atualização manual dos dados do usuário, útil após
  // operações que alteram o documento em users/{uid} via setDoc/updateDoc.
  const refreshProfile = async () => {
    const current = auth.currentUser;
    if (!current) return;
    try {
      const snap = await getDoc(doc(db, "users", current.uid));
      if (snap.exists()) {
        const data = snap.data();
        setRole(data.role || null);
        setProfileComplete(!!data.profileComplete);
        setUser({
          uid: current.uid,
          email: current.email,
          displayName: data.name || current.email,
          emailVerified: !!(data.emailVerified || current.emailVerified),
        });
      }
    } catch (e) {
      console.error("Falha ao atualizar dados do usuário:", e);
    }
  };

  const value = { user, role, profileComplete, isLoading, refreshProfile };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

