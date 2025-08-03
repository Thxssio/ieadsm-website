// AuthContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "./client";

const AuthContext = createContext({
  user: null,
  role: null,
  profileComplete: false,
  isLoading: true,
  refreshAuthData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // fallback para leitura única
  const refreshAuthData = async (currentUser) => {
    setIsLoading(true);
    if (!currentUser) {
      setUser(null);
      setRole(null);
      setProfileComplete(false);
      setIsLoading(false);
      return;
    }
    const ref = doc(db, "users", currentUser.uid);
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setRole(data.role);
        setProfileComplete(data.profileComplete === true || !!data.cpf);
      }
    } catch (err) {
      console.error("Erro no getDoc:", err);
    } finally {
      setUser(currentUser);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribeSnap = () => {};  // placeholder
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      // sempre cancelamos o listener anterior
      unsubscribeSnap();

      if (currentUser) {
        setIsLoading(true);
        setUser(currentUser);

        const userDocRef = doc(db, "users", currentUser.uid);
        // ativa listener em tempo real
        unsubscribeSnap = onSnapshot(
          userDocRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              setRole(data.role);
              setProfileComplete(data.profileComplete === true || !!data.cpf);
            } else {
              setRole(null);
              setProfileComplete(false);
            }
            setIsLoading(false);
          },
          (error) => {
            console.error("Erro no snapshot:", error);
            // se der permissão, faz fallback de leitura única
            refreshAuthData(currentUser);
          }
        );
      } else {
        // usuário deslogou: limpa tudo e loading
        setUser(null);
        setRole(null);
        setProfileComplete(false);
        setIsLoading(false);
      }
    });

    return () => {
      // cleanup final quando o AuthProvider desmontar
      unsubscribeAuth();
      unsubscribeSnap();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, role, profileComplete, isLoading, refreshAuthData }}
    >
      {children}
    </AuthContext.Provider>
  );
}
