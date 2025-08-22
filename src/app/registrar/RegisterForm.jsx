"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/client";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { validateCPF, maskCPF } from "@/lib/utils/cpf";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [cpf, setCpf]         = useState("");
  const [pwd, setPwd]         = useState("");
  const [pwd2, setPwd2]       = useState("");
  const [err, setErr]         = useState("");
  const [ok, setOk]           = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (pwd !== pwd2) return setErr("As senhas não coincidem.");
    if (!validateCPF(cpf)) return setErr("CPF inválido. Verifique o número.");

    setLoading(true);
    let userCreated = null;
    const cpfDigits = String(cpf).replace(/\D/g, "");

    try {
      // 1) Criar usuário no Auth
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        pwd
      );
      userCreated = cred.user;

      // 2) Esperar autenticação “assentar”
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          unsub();
          reject(new Error("Timeout na autenticação"));
        }, 10000);
        const unsub = onAuthStateChanged(auth, (u) => {
          if (u && u.uid === cred.user.uid) {
            clearTimeout(timeout);
            unsub();
            resolve(u);
          }
        });
      });

      // 3) Forçar refresh das claims
      await cred.user.getIdToken(true);

      // 4) Reservar CPF (unicidade). Se já existir placeholder, será reivindicado.
      try {
        await setDoc(
          doc(db, "cpf_index", cpfDigits),
          { uid: cred.user.uid, createdAt: serverTimestamp() },
          { merge: true }
        );
      } catch {
        // Se falhar aqui, provavelmente CPF já está em uso.
        // Remover usuário criado e abortar.
        try {
          await userCreated.delete();
        } catch {
          // ignore
        }
        throw new Error("Este CPF já está em uso.");
      }

      // 5) Atualizar displayName (opcional)
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }

      // 6) Criar doc em users/{uid}
      await setDoc(
        doc(db, "users", cred.user.uid),
        {
          name,
          email: cred.user.email,
          cpf: cpfDigits,
          role: null,
          emailVerified: cred.user.emailVerified || false,
          profileComplete: false, // começa como incompleto
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 7) Enviar verificação de e-mail
      await sendEmailVerification(cred.user);

      // 8) Sair para forçar login só após verificação
      await signOut(auth);

      // 9) Feedback e redireciona pro login
      setOk("Conta criada! Verifique seu e-mail para confirmar.");
      setTimeout(() => router.push("/login"), 2500);
    } catch (error) {
      console.error("Erro no cadastro de usuário:", error);

      // Se criou o usuário no Auth mas falhou depois, tente remover
      if (userCreated) {
        try {
          await userCreated.delete();
        } catch (e2) {
          console.error("Erro ao remover usuário após falha:", e2);
        }
      }

      // Mensagens amigáveis
      const code = error?.code || "";
      if (error?.message === "Este CPF já está em uso.") {
        setErr(error.message);
      } else if (code === "auth/email-already-in-use") {
        setErr("Este e-mail já está cadastrado.");
      } else if (code === "auth/weak-password") {
        setErr("Senha fraca (mínimo 6 caracteres).");
      } else {
        setErr(error?.message || "Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Nome
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          className="mt-1 w-full rounded-lg border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-stone-900 dark:text-stone-100 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57] placeholder-stone-400 dark:placeholder-slate-400"
          placeholder="Seu nome completo"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          CPF
        </label>
        <input
          value={cpf}
          onChange={(e) => setCpf(maskCPF(e.target.value))}
          required
          inputMode="numeric"
          autoComplete="off"
          className="mt-1 w-full rounded-lg border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-stone-900 dark:text-stone-100 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57] placeholder-stone-400 dark:placeholder-slate-400"
          placeholder="000.000.000-00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          E-mail
        </label>
        <input
          type="email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-stone-900 dark:text-stone-100 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57] placeholder-stone-400 dark:placeholder-slate-400"
          placeholder="usuario@mail.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Senha
        </label>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          required
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-stone-900 dark:text-stone-100 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57] placeholder-stone-400 dark:placeholder-slate-400"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Confirmar senha
        </label>
        <input
          type="password"
          value={pwd2}
          onChange={(e) => setPwd2(e.target.value)}
          required
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-stone-900 dark:text-stone-100 px-3 py-2 focus:ring-2 focus:ring-[#2a3d57] placeholder-stone-400 dark:placeholder-slate-400"
          placeholder="Repita a senha"
        />
      </div>

      {err && <p className="text-sm text-red-600 dark:text-red-400">{err}</p>}
      {ok && <p className="text-sm text-emerald-600 dark:text-emerald-400">{ok}</p>}

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

