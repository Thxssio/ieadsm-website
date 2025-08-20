"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/client";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { validateCPF, maskCPF } from "@/lib/utils/cpf";

const getProviderName = (providerId) => {
  switch (providerId) {
    case "google.com":
      return "Google";
    case "apple.com":
      return "Apple";
    default:
      return providerId;
  }
};

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCpfChange = (e) => {
    setCpf(maskCPF(e.target.value));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (pwd !== pwd2) {
      return setErr("As senhas não coincidem.");
    }
    if (!validateCPF(cpf)) {
      return setErr("CPF inválido. Por favor, verifique o número digitado.");
    }

    setLoading(true);
    let userCreated = null;

    try {
      // 1) Criar usuário no Firebase Auth primeiro
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        pwd
      );
      userCreated = cred.user;

      // 2) Aguardar autenticação completa
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          unsub();
          reject(new Error("Timeout na autenticação"));
        }, 10000);

        const unsub = onAuthStateChanged(auth, (user) => {
          if (user && user.uid === cred.user.uid) {
            clearTimeout(timeout);
            unsub();
            resolve(user);
          }
        });
      });

      // 3) Forçar refresh do token
      await cred.user.getIdToken(true);

      // 4) Verificar duplicidade de CPF (agora com usuário autenticado)
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("cpf", "==", cpf.replace(/\D/g, "")));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          // CPF duplicado - deletar usuário recém-criado
          await cred.user.delete();
          return setErr("Este CPF já está cadastrado em nosso sistema.");
        }
      } catch (cpfError) {
        // Erro na verificação - deletar usuário e abortar
        await cred.user.delete();
        throw new Error("Erro na verificação de CPF. Tente novamente.");
      }

      // 5) Atualizar displayName se fornecido
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }

      // 6) Criar documento no Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email: cred.user.email,
        cpf: cpf.replace(/\D/g, ""),
        role: null,
        createdAt: new Date(),
        profileComplete: true,
      });

      // 7) Enviar verificação de email (não bloqueia o fluxo)
      sendEmailVerification(cred.user).catch(() => {});

      setOk("Conta criada com sucesso. Verifique seu e-mail para confirmar.");
      setTimeout(() => router.push("/portal"), 1500);

    } catch (error) {
      console.error("Erro no cadastro de usuário:", error);

      // Cleanup: remover usuário se foi criado mas deu erro depois
      if (userCreated) {
        try {
          await userCreated.delete();
        } catch (deleteError) {
          console.error("Erro ao remover usuário:", deleteError);
        }
      }

      if (error.code === "auth/email-already-in-use") {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
          const providerName = getProviderName(methods[0]);
          setErr(
            `Este e-mail já foi cadastrado via ${providerName}. Por favor, faça login.`
          );
        } else {
          setErr("Este e-mail já está cadastrado.");
        }
      } else if (error.code === "auth/weak-password") {
        setErr("Senha fraca (mínimo 6 caracteres).");
      } else if (error.message === "Timeout na autenticação") {
        setErr("Timeout na autenticação. Tente novamente.");
      } else {
        setErr(error.message || `Erro: ${error.code}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700">Nome</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57]"
          placeholder="Seu nome completo"
        />
      </div>

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

      <div>
        <label className="block text-sm font-medium text-stone-700">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57]"
          placeholder="usuario@mail.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Senha</label>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57]"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          Confirmar senha
        </label>
        <input
          type="password"
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57]"
          placeholder="Repita a senha"
        />
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {ok && <p className="text-sm text-emerald-600">{ok}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center bg-[#2a3d57] text-white font-semibold px-4 py-3 rounded-lg hover:bg-[#202e42] disabled:opacity-60"
      >
        {loading ? "Cadastrando..." : "Criar conta"}
      </button>
    </form>
  );
}