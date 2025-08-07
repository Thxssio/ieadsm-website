"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase/client";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { validateCPF, maskCPF } from "../lib/utils/cpf.js";

const getProviderName = (providerId) => {
  switch (providerId) {
    case "google.com": return "Google";
    case "apple.com": return "Apple";
    default: return providerId;
  }
};

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf]     = useState("");
  const [pwd, setPwd]     = useState("");
  const [pwd2, setPwd2]   = useState("");
  const [err, setErr]     = useState("");
  const [ok, setOk]       = useState("");
  const [loading, setLoading] = useState(false);

  const handleCpfChange = (e) => setCpf(maskCPF(e.target.value));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (pwd !== pwd2) return setErr("As senhas não coincidem.");
    if (!validateCPF(cpf)) return setErr("CPF inválido. Verifique o número.");

    setLoading(true);
    const rawCpf = cpf.replace(/\D/g, "");

    let createdAuthUser = null;
    let cpfIndexCreated = false;

    try {
      // 1) Cria usuário no Auth
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        pwd
      );
      createdAuthUser = cred.user;

      // 2) Atualiza displayName (opcional)
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }

      // 3) Garante unicidade: tenta criar cpf_index/{cpf}
      //    Regras impedem criar se já existir (retorna permission-denied)
      const cpfIndexRef = doc(db, "cpf_index", rawCpf);
      await setDoc(cpfIndexRef, {
        uid: cred.user.uid,
        createdAt: serverTimestamp(),
      });
      cpfIndexCreated = true;

      // 4) Cria doc do usuário
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email: cred.user.email,
        cpf: rawCpf,
        role: null,
        createdAt: serverTimestamp(),
        emailVerified: !!cred.user.emailVerified,
        profileComplete: true,
      }, { merge: true });

      // 5) Envia verificação de e-mail
      await sendEmailVerification(cred.user);

      // 6) Desloga (para re-login após verificar e-mail)
      await signOut(auth);

      setOk("Conta criada! Verifique seu e-mail para confirmar.");
      setTimeout(() => router.push("/login"), 2500);

    } catch (error) {
      console.error("Erro no cadastro:", error);

      // Se a criação do índice falhou por já existir, mostre mensagem amigável
      if (error.code === "permission-denied") {
        setErr("Este CPF já está cadastrado.");
      } else if (error.code === "auth/email-already-in-use") {
        // Obs: no emulador, pode não listar methods; mantenho a mensagem genérica
        setErr("Este e-mail já está cadastrado. Faça login.");
      } else if (error.code === "auth/weak-password") {
        setErr("Senha fraca (mínimo 6 caracteres).");
      } else {
        setErr(error.message || "Ocorreu um erro. Tente novamente.");
      }

      // Cleanup: se criamos o usuário no Auth mas algo falhou depois, remova-o
      if (createdAuthUser) {
        try { await createdAuthUser.delete(); } catch (e) { /* ignore */ }
      }
      // Se criamos o cpf_index mas falhou ao criar o doc do usuário, remova o índice
      if (cpfIndexCreated) {
        try { await deleteDoc(doc(db, "cpf_index", rawCpf)); } catch (e) { /* ignore */ }
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
        <label className="block text-sm font-medium text-stone-700">Confirmar senha</label>
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
      {ok  && <p className="text-sm text-emerald-600">{ok}</p>}

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
