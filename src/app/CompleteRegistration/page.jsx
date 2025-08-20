"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthContext";
import { db } from "@/lib/firebase/client";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { validateCPF, maskCPF } from "@/lib/utils/cpf";

export default function CompleteRegistration() {
  const { user, profileComplete, isLoading, refreshAuthData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && profileComplete) {
      router.push('/portal');
    }
  }, [user, profileComplete, isLoading, router]);

  const [cpf, setCpf] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCpfChange = (e) => {
    setCpf(maskCPF(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!user) return setError("Você precisa estar logado para completar o cadastro.");
    if (!validateCPF(cpf)) return setError("CPF inválido.");

    setLoading(true);
    try {
      // 1) Verifica duplicidade
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("cpf", "==", cpf.replace(/[^\d]+/g, '')));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setLoading(false);
        return setError("Este CPF já está em uso.");
      }

      // 2) Atualiza Firestore
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        cpf: cpf.replace(/[^\d]+/g, ''),
        profileComplete: true,
      });

      // 3) Força o contexto a recarregar os dados do usuário
      await refreshAuthData(user);

      // 4) Agora profileComplete === true → redireciona
      router.push("/portal");
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao salvar seu CPF. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="bg-white py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
        <h1 className="text-3xl font-bold text-stone-900">Complete seu Cadastro</h1>
        <p className="mt-2 text-stone-600">
          Para continuar, por favor, informe seu CPF. Este passo é necessário para garantir a unicidade de cada membro.
        </p>

        <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">CPF</label>
              <input
                value={cpf}
                onChange={handleCpfChange}
                required
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57]"
                placeholder="000.000.000-00"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center bg-[#2a3d57] text-white font-semibold px-4 py-3 rounded-lg hover:bg-[#202e42] disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar e Continuar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
