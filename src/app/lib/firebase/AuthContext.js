// AuthContext.js
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
// 1. Importar o 'updateDoc'
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
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

  // Removi a função 'refreshAuthData' pois a lógica foi integrada no useEffect principal

  useEffect(() => {
    let unsubscribeSnap = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeSnap(); // Cancela o listener anterior

      if (firebaseUser) {
        setIsLoading(true);
        const userDocRef = doc(db, "users", firebaseUser.uid);

        unsubscribeSnap = onSnapshot(
          userDocRef,
          async (snap) => { // 2. Tornamos o callback assíncrono para usar await
            if (snap.exists()) {
              const data = snap.data();

              // 3. LÓGICA DE SINCRONIZAÇÃO ADICIONADA AQUI
              // Se na Auth o e-mail está verificado, mas no Firestore não, atualizamos o Firestore.
              if (firebaseUser.emailVerified && !data.emailVerified) {
                await updateDoc(userDocRef, { emailVerified: true });
                // A atualização vai acionar o onSnapshot novamente com os dados corretos,
                // então podemos simplesmente sair desta execução.
                return;
              }

              // 4. Criamos um objeto de usuário mais completo
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: data.name || firebaseUser.email, // Usa o nome do DB ou o e-mail como fallback
                emailVerified: data.emailVerified === true, // Garante que o valor seja booleano
              });

              setRole(data.role || null);
              setProfileComplete(data.profileComplete === true || !!data.cpf);
            } else {
              // Usuário autenticado mas sem registro no Firestore (ex: durante o cadastro)
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
            console.error("Erro no onSnapshot:", error);
            // Em caso de erro, você pode adicionar um fallback se necessário
            setIsLoading(false);
          }
        );
      } else {
        // Usuário deslogou
        setUser(null);
        setRole(null);
        setProfileComplete(false);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnap();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, role, profileComplete, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}