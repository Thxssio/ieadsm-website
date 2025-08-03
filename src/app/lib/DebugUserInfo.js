"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function DebugModal() {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          setUserDoc(docSnap.exists() ? docSnap.data() : null);
        } catch (error) {
          console.error("Erro ao buscar documento:", error);
          setUserDoc(null);
        }
      } else {
        setUserDoc(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-full shadow-lg text-sm z-50"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-lg">Debug - Informações do Usuário</h3>
          <button
            onClick={() => setShowDebug(false)}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="text-center py-4">Carregando informações...</div>
          ) : !user ? (
            <div className="text-center py-4 text-gray-600">Usuário não autenticado</div>
          ) : (
            <>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">Firebase Auth:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p><strong>UID:</strong> {user.uid}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>DisplayName:</strong> {user.displayName || "Não definido"}</p>
                  <p><strong>Email Verificado:</strong> {user.emailVerified ? "Sim" : "Não"}</p>
                  
                  <h5 className="font-medium mt-3 mb-1">Provedores Vinculados:</h5>
                  {user.providerData.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {user.providerData.map((provider, index) => (
                        <li key={index}>
                          <strong>{provider.providerId}</strong> - {provider.email}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-500">Nenhum provedor encontrado!</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">Documento Firestore:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {userDoc ? (
                    <div className="space-y-1">
                      <p><strong>Nome:</strong> {userDoc.name || "Não definido"}</p>
                      <p><strong>Email:</strong> {userDoc.email || "Não definido"}</p>
                      <p><strong>CPF:</strong> {userDoc.cpf || "Não definido"}</p>
                      <p><strong>Role:</strong> {userDoc.role || "Não definido"}</p>
                      <p><strong>Criado em:</strong> {userDoc.createdAt?.toDate?.()?.toLocaleString() || "Não definido"}</p>
                      <p><strong>Perfil Completo:</strong> {userDoc.profileComplete ? "Sim" : "Não"}</p>
                    </div>
                  ) : (
                    <p className="text-red-600">Documento não encontrado no Firestore!</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => console.log("User object:", user, "User doc:", userDoc)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Log no Console
                </button>
                
                <button
                  onClick={() => {
                    const info = {
                      uid: user.uid,
                      email: user.email,
                      providers: user.providerData.map(p => p.providerId),
                      firestoreDoc: userDoc
                    };
                    navigator.clipboard.writeText(JSON.stringify(info, null, 2));
                    alert('Informações copiadas para a área de transferência!');
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Copiar Info
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}