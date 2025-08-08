"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "./client";

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

  const value = { user, role, profileComplete, isLoading };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
