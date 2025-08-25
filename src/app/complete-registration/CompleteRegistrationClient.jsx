// src/app/complete-registration/CompleteRegistrationClient.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  runTransaction,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebase/client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/lib/firebase/AuthContext";
import { onlyDigits, validateCPF } from "@/lib/utils/cpf";

/* Seções do formulário */
import RegistrationTypeSection from "@/components/Registration/RegistrationTypeSection";
import IdentificationSection   from "@/components/Registration/IdentificationSection";
import AddressSection          from "@/components/Registration/AddressSection";
import ParentageSection        from "@/components/Registration/ParentageSection";
import PersonalSection         from "@/components/Registration/PersonalSection";
import SpouseSection           from "@/components/Registration/SpouseSection";
import ChildrenSection         from "@/components/Registration/ChildrenSection";
import ChurchInfoSection       from "@/components/Registration/ChurchInfoSection";
import BaptismSection          from "@/components/Registration/BaptismSection";
import AuthorizationSection    from "@/components/Registration/AuthorizationSection";
import SummaryCard             from "@/components/Registration/SummaryCard";
import HelpCard                from "@/components/Registration/HelpCard";
import ProfileImageUploader    from "@/components/Registration/ProfileImageUploader";

/* Input base (não herdar text-white) */
const inputCls =
  "mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 " +
  "bg-white text-stone-900 placeholder-stone-400 " +
  "focus:outline-none focus:ring-2 focus:ring-[#2a3d57]";

/* Estado inicial */
const initialForm = {
  registroTipo: "ADMISSÃO",
  idInterno: "",
  congregacao: "Matriz",
  setor: "Setor 01",

  // identificação/contato
  name: "",
  email: "",
  telefone: "",
  celular: "",
  cpf: "",
  rg: "",
  tituloEleitor: "",

  // endereço
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  cep: "",

  // filiação
  pai: "",
  mae: "",
  cpfPai: "",
  cpfMae: "",
  isOrphan: false, // se true, mãe não é obrigatória

  // pessoais
  nacionalidade: "",
  profissao: "",
  grauInstrucao: "",
  sexo: "",
  dataNascimento: "",
  naturalidade: "",

  // estado civil / família
  estadoCivil: "",
  dtCasamento: "",
  qtdeFilhos: "",
  nomeConjuge: "",
  profissaoConjuge: "",
  grauInstrucaoConjuge: "",
  dataNascimentoConjuge: "",
  cpfConjuge: "",

  // filhos
  filhos: [], // { name:"", cpf:"" }

  // igreja
  dataConversao: "",
  batizadoEspiritoSanto: false,
  dataBatismoEspiritoSanto: "",
  origem: "",
  informacoes: "",

  // batismo/recebimento
  localBatismo: "",
  dataBatismo: "",
  recebimento: "",
  dataRecebimento: "",

  // vínculo de família
  familyId: "",

  // LGPD
  autorizacao: false,

  // mídia
  photoURL: "",
};

/* WebP rápido no browser */
async function fileToWebp(file, { maxWidth = 800, maxHeight = 800, quality = 0.85 } = {}) {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(maxWidth / bitmap.width, maxHeight / bitmap.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/webp", quality));
  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
}

/** Pega o próximo idInterno sequencial (numérico) sem atualizar o contador. */
async function peekNextInternalId() {
  const ctrRef = doc(db, "counters", "idInterno");
  const snap = await getDoc(ctrRef);
  const current = snap.exists() ? Number(snap.data().current || 0) : 0;
  const next = Number.isFinite(current) ? current + 1 : 1;
  return String(next).padStart(6, "0");
}

/** Pega o próximo idInterno sequencial (numérico) de forma atômica. */
async function getNextInternalId() {
  const ctrRef = doc(db, "counters", "idInterno");
  const seed = 0; // começa em 000000
  const newId = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ctrRef);
    let current = snap.exists() ? (snap.data().current || seed) : seed;
    current = Number(current);
    if (!Number.isFinite(current)) current = seed;
    const next = current + 1;
    tx.set(ctrRef, { current: next, updatedAt: new Date() }, { merge: true });
    return next;
  });
  return String(newId).padStart(6, "0"); // garantir string com 6 dígitos
}

/** Atualiza o contador de idInterno para, no mínimo, o valor informado. */
async function ensureInternalIdCounterAtLeast(id) {
  const target = Number(id);
  if (!Number.isFinite(target)) return;
  const ctrRef = doc(db, "counters", "idInterno");
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ctrRef);
    let current = snap.exists() ? Number(snap.data().current || 0) : 0;
    if (!Number.isFinite(current)) current = 0;
    if (current < target) {
      tx.set(ctrRef, { current: target, updatedAt: new Date() }, { merge: true });
    }
  });
}

/* Tenta incluir o usuário como "filho" em families/{id}/members/{uid}.
   Se passar, retorna { ok: true, familyId }. Se falhar, { ok: false }. */
async function tryJoinFamilyByCpf(cpfToJoin, uid, userName, userCpfDigits) {
  const cpfDigits = onlyDigits(cpfToJoin || "");
  if (!cpfDigits || !validateCPF(cpfDigits)) return { ok: false };
  try {
    const familiesCol = collection(db, "families");
    const q = query(familiesCol, where("responsibleCpf", "==", cpfDigits));
    const snap = await getDocs(q);
    let familyRef;
    if (snap.empty) {
      familyRef = doc(familiesCol, crypto.randomUUID());
      await setDoc(familyRef, { responsibleCpf: cpfDigits });
    } else {
      familyRef = snap.docs[0].ref;
    }
    await setDoc(
      doc(familyRef, "members", uid),
      {
        uid,
        name: userName,
        cpf: userCpfDigits, // CPF do usuário que está entrando
        kinship: "filho",
        updatedAt: new Date(),
      },
      { merge: true }
    );
    return { ok: true, familyId: familyRef.id };
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
}

export default function CompleteRegistrationClient() {
  const { user, isLoading, profileComplete, refreshProfile } = useAuth();
  const router = useRouter();

  // Guardamos o valor anterior para detectar transições de true -> false.
  const prevProfileComplete = useRef(profileComplete);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // foto
  const [profileFile, setProfileFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Se o perfil voltar a ficar incompleto (ex: reabertura do cadastro),
  // limpamos estados locais para evitar que dados antigos bloqueiem o formulário.
  useEffect(() => {
    if (prevProfileComplete.current && !profileComplete) {
      setForm(initialForm);
      setProfileFile(null);
      setPreviewImage("");
      setUploadProgress(0);
      setErr("");
    }
    prevProfileComplete.current = profileComplete;
  }, [profileComplete]);

  /* Guards */
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (profileComplete) router.replace("/portal");
  }, [user, isLoading, profileComplete, router]);

  /* Carrega dados e gera idInterno / preview */
  useEffect(() => {
    if (!user) return;
    (async () => {
      const r = doc(db, "users", user.uid);
      const snap = await getDoc(r);

      let next = { ...initialForm, email: user?.email || "" };
      if (snap.exists()) next = { ...next, ...snap.data() };

      // Geração numérica (sem atualizar o contador) do idInterno, se não existir
      if (!next.idInterno) {
        try {
          next.idInterno = await peekNextInternalId();
        } catch (e) {
          console.error("Falha ao gerar idInterno:", e);
          // fallback simples: timestamp (ainda numérico, mas menos bonito)
          next.idInterno = String(Date.now());
        }
      } else {
        // se já veio salvo, normaliza pra dígitos (evita lixo)
        next.idInterno = onlyDigits(next.idInterno);
      }

      setForm(next);
      setPreviewImage(next.photoURL || user.photoURL || "");
    })();
  }, [user, profileComplete]);

  // manter idInterno sempre só dígitos, mesmo se editar manualmente no form
  useEffect(() => {
    if (!form?.idInterno) return;
    const digits = onlyDigits(form.idInterno);
    if (digits !== form.idInterno) {
      setForm((old) => ({ ...old, idInterno: digits }));
    }
  }, [form.idInterno]);

  /* Obrigatórios mínimos */
  const requiredOk = () => {
    const base = [
      "name","cpf","endereco","bairro","cidade","uf","cep",
      "sexo","dataNascimento","estadoCivil","email",
    ];
    const baseFilled = base.every((k) => String(form[k] || "").trim());
    const motherOk = form.isOrphan ? true : Boolean(String(form.mae || "").trim());
    return baseFilled && motherOk && form.autorizacao === true;
  };

  /* Upload (opcional) */
  const uploadProfileIfNeeded = async (uid) => {
    if (!profileFile) return form.photoURL || previewImage || "";
    const compressed = await fileToWebp(profileFile);
    const storageRef = ref(storage, `profileImages/${uid}/profile.webp`);
    const task = uploadBytesResumable(storageRef, compressed);
    const url = await new Promise((resolve, reject) => {
      task.on("state_changed",
        (s) => setUploadProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref))
      );
    });
    return url;
  };

  /* Verifica unicidade do idInterno usando índice dedicado */
  const assertUniqueInternalId = async (candidateId, myUid) => {
    try {
      await setDoc(
        doc(db, "idInterno_index", candidateId),
        { uid: myUid, updatedAt: new Date() },
        { merge: true }
      );
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!user) return setErr("Você precisa estar logado.");
    if (!requiredOk()) return setErr("Preencha os obrigatórios (*) e aceite a autorização.");

    setSaving(true);

    const step = async (label, fn) => {
      try { return await fn(); }
      catch (e) { e.__step = label; console.error(`✗ Falhou em: "${label}"`, e); throw e; }
    };

    try {
      const uid       = user.uid;
      const cpf       = onlyDigits(form.cpf);
      const cpfConj   = onlyDigits(form.cpfConjuge);
      const cpfPai    = onlyDigits(form.cpfPai);
      const cpfMae    = onlyDigits(form.cpfMae);
      const filhos    = (form.filhos || []).map((f) => ({ name: (f.name||"").trim(), cpf: onlyDigits(f.cpf) }));

      let idInterno = onlyDigits(form.idInterno);
      if (!idInterno) {
        idInterno = await step("Gerar idInterno", () => getNextInternalId());
        setForm((old) => ({ ...old, idInterno }));
      }

      // valida idInterno: só dígitos e não vazio
      if (!idInterno || !/^\d+$/.test(idInterno)) {
        setSaving(false);
        return setErr("ID interno inválido. Use apenas números.");
      }

      // valida unicidade do idInterno
      const isUnique = await step("Checar unicidade do idInterno", () =>
        assertUniqueInternalId(idInterno, uid)
      );
      if (!isUnique) {
        setSaving(false);
        return setErr(`O ID interno ${idInterno} já existe no sistema. Por favor, escolha outro.`);
      }

      // garante avanço do contador para evitar repetições
      await step("Atualizar contador do idInterno", () =>
        ensureInternalIdCounterAtLeast(idInterno)
      );

      // valida CPFs
      const invalids = [];
      if (!validateCPF(cpf)) invalids.push("Titular");
      if (cpfConj && !validateCPF(cpfConj)) invalids.push("Cônjuge");
      if (cpfPai  && !validateCPF(cpfPai))  invalids.push("Pai");
      if (cpfMae  && !validateCPF(cpfMae))  invalids.push("Mãe");
      filhos.forEach((f, i) => { if (f.cpf && !validateCPF(f.cpf)) invalids.push(`Filho #${i+1}`); });
      if (invalids.length) { setSaving(false); return setErr(`CPF inválido: ${invalids.join(", ")}.`); }

      // 1) Vincular família existente (por CPF) → consulta pai, depois mãe
      let familyId = null;
      let kinship  = "titular";

      let join = await step("Vincular família pelo CPF do pai", () =>
        tryJoinFamilyByCpf(cpfPai, uid, form.name, cpf)
      );
      if (!join.ok) {
        join = await step("Vincular família pelo CPF da mãe", () =>
          tryJoinFamilyByCpf(cpfMae, uid, form.name, cpf)
        );
      }
      if (join.ok) {
        familyId = join.familyId; // entrou como "filho"
        kinship  = "filho";
      } else {
        // cria própria família (titular)
        familyId = cpf;
        await step("Criar/atualizar família (se titular)", () =>
          setDoc(doc(db, "families", familyId), { responsibleCpf: familyId, updatedAt: new Date() }, { merge: true })
        );
        await step("Adicionar titular na família", () =>
          setDoc(
            doc(db, "families", familyId, "members", uid),
            { uid, name: form.name, cpf, kinship, updatedAt: new Date() },
            { merge: true },
          )
        );
      }

      const formData = { ...form, familyId };
      setForm(formData);

      // 2) Upload foto (opcional)
      const photoURL = await step("Upload de foto (se houver)", () => uploadProfileIfNeeded(uid));
      if (photoURL) setPreviewImage(photoURL + "?t=" + Date.now());

      // 3) Salvar/atualizar usuário
      await step("Salvar usuário (users/{uid})", () =>
        setDoc(doc(db, "users", uid), {
          ...formData,
          idInterno,            // já normalizado
          cpf,
          cpfConjuge: cpfConj,
          cpfPai, cpfMae,
          filhos,
          photoURL: photoURL || formData.photoURL || "",
          cep: onlyDigits(formData.cep),
          updatedAt: new Date(),
          profileComplete: true,
        }, { merge: true })
      );
      // Garante que o AuthContext enxergue o novo estado de profileComplete
      await refreshProfile();

      // 4) Placeholders (agora você já é membro)
      await step("Adicionar placeholders (familiares)", async () => {
        const placeholders = [
          { name: formData.nomeConjuge, cpf: cpfConj, kinship: "cônjuge" },
          { name: formData.pai,         cpf: cpfPai,  kinship: "pai" },
          { name: formData.mae,         cpf: cpfMae,  kinship: "mãe" },
          ...filhos.map((f) => ({ name: f.name, cpf: f.cpf, kinship: "filho" })),
        ].filter(p => p.cpf);

        for (const p of placeholders) {
          try {
            await setDoc(
              doc(db, "families", familyId, "members", p.cpf),
              { ...p, updatedAt: new Date() },
              { merge: true }
            );
          } catch (e) {
            // não bloquear o fluxo por placeholder
            console.error(e);
          }
        }
      });

      router.replace("/portal");
    } catch (e) {
      console.error(e);
      setErr(e.message || `Erro em: ${e.__step || "processo"}. Tente novamente.`);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user || profileComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-stone-800">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header sticky */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Ficha Cadastral de Membros</h1>
            <p className="text-sm text-slate-500">Preencha os dados com atenção. Campos com * são obrigatórios.</p>
          </div>
          <button
            type="submit"
            form="member-form"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 active:scale-[.99] disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <form id="member-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Foto 3x4 */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <ProfileImageUploader
                previewImage={previewImage || form.photoURL}
                uploadProgress={uploadProgress}
                onFileChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setProfileFile(file);
                  setPreviewImage(URL.createObjectURL(file));
                }}
              />
            </section>

            <RegistrationTypeSection form={form} setForm={setForm} inputCls={inputCls} />
            <IdentificationSection   form={form} setForm={setForm} inputCls={inputCls} />
            <AddressSection          form={form} setForm={setForm} inputCls={inputCls} />
            <ParentageSection        form={form} setForm={setForm} inputCls={inputCls} />
            <PersonalSection         form={form} setForm={setForm} inputCls={inputCls} />
            <SpouseSection           form={form} setForm={setForm} inputCls={inputCls} />
            <ChildrenSection         form={form} setForm={setForm} inputCls={inputCls} />
            <ChurchInfoSection       form={form} setForm={setForm} inputCls={inputCls} />
            <BaptismSection          form={form} setForm={setForm} inputCls={inputCls} />
            <AuthorizationSection    form={form} setForm={setForm} />
            {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">{err}</p>}
          </div>

          {/* Coluna lateral */}
          <aside className="lg:col-span-1">
            <div className="sticky top-[76px] space-y-4">
              <SummaryCard form={form} photoURL={previewImage || form.photoURL} />
              <HelpCard />
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
}

