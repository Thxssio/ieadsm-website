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
    // AJUSTE 1: A função de 'unsubscribe' do snapshot é definida no escopo externo
    // para que seu valor persista entre as chamadas do onAuthStateChanged.
    let unsubscribeSnapshot = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // AJUSTE 2: Limpa o listener do snapshot do usuário anterior ANTES de criar um novo.
      // Isso resolve o erro de permissão no logout.
      unsubscribeSnapshot();

      if (firebaseUser) {
        setIsLoading(true);
        const userDocRef = doc(db, "users", firebaseUser.uid);

        unsubscribeSnapshot = onSnapshot(
          userDocRef,
          async (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              if (firebaseUser.emailVerified && !data.emailVerified) {
                await updateDoc(userDocRef, { emailVerified: true });
                return;
              }
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: data.name || firebaseUser.email,
                emailVerified: !!data.emailVerified,
              });
              setRole(data.role || null);
              setProfileComplete(!!(data.name && data.cpf));
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
        // Usuário deslogado
        setUser(null);
        setRole(null);
        setProfileComplete(false);
        setIsLoading(false);
      }
    });

    // Função de limpeza final do useEffect
    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, []);

  const value = { user, role, profileComplete, isLoading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}