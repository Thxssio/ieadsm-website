"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  doc, getDoc, setDoc, collection, query, where, getDocs
} from "firebase/firestore";
import { db, storage } from "../lib/firebase/client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuth } from "../lib/firebase/AuthContext";
import { onlyDigits, validateCPF } from "../lib/utils/cpf";

import RegistrationTypeSection from "../components/Registration/RegistrationTypeSection";
import IdentificationSection   from "../components/Registration/IdentificationSection";
import AddressSection          from "../components/Registration/AddressSection";
import ParentageSection        from "../components/Registration/ParentageSection";
import PersonalSection         from "../components/Registration/PersonalSection";
import SpouseSection           from "../components/Registration/SpouseSection";
import ChildrenSection         from "../components/Registration/ChildrenSection";
import ChurchInfoSection       from "../components/Registration/ChurchInfoSection";
import BaptismSection          from "../components/Registration/BaptismSection";
import AuthorizationSection    from "../components/Registration/AuthorizationSection";
import SummaryCard             from "../components/Registration/SummaryCard";
import HelpCard                from "../components/Registration/HelpCard";
import ProfileImageUploader    from "../components/Registration/ProfileImageUploader";

/* força cores para não herdar text-white */
const inputCls =
  "mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 " +
  "bg-white text-stone-900 placeholder-stone-400 " +
  "focus:outline-none focus:ring-2 focus:ring-[#2a3d57]";

const initialForm = {
  registroTipo: "ADMISSÃO",
  idInterno: "",
  congregacao: "",
  setor: "",

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
  isOrphan: false, 

  // pessoais
  nacionalidade: "",
  profissao: "",
  grauInstrucao: "",
  sexo: "",
  dataNascimento: "",
  localNascimento: "",

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

async function findExistingFamilyIdByCpfs(cpfs) {
  const membersRef = collection(db, "users");
  for (const raw of cpfs) {
    const cpf = onlyDigits(raw);
    if (!cpf) continue;
    const q1 = query(membersRef, where("cpf", "==", cpf));
    const snap = await getDocs(q1);
    if (!snap.empty) {
      const d = snap.docs[0].data();
      if (d.familyId) return d.familyId;
    }
  }
  return null;
}

// compressão rápida p/ WebP no browser
async function fileToWebp(file, { maxWidth = 800, maxHeight = 800, quality = 0.85 } = {}) {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(maxWidth / bitmap.width, maxHeight / bitmap.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", quality)
  );
  return new File([blob], file.name.replace(/\.\w+$/, ".webp"), {
    type: "image/webp",
  });
}

export default function CompleteRegistrationClient() {
  const { user, isLoading, profileComplete } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // foto
  const [profileFile, setProfileFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // guards
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (profileComplete) router.replace("/portal");
  }, [user, isLoading, profileComplete, router]);

  // carrega e gera idInterno, aplica foto existente
  useEffect(() => {
    if (!user) return;

    (async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      let next = { ...initialForm, email: user?.email || "" };

      if (snap.exists()) {
        const data = snap.data();
        next = { ...next, ...data };
      }

      if (!next.idInterno) {
        next.idInterno =
          "ID-" + Math.random().toString(36).slice(2, 11).toUpperCase();
      }

      setForm(next);
      setPreviewImage(next.photoURL || user.photoURL || ""); // preview inicial
    })();
  }, [user]);

    const requiredOk = () => {
    // telefone NÃO é obrigatório
    // pai NÃO é obrigatório
    // mãe é obrigatória, exceto se isOrphan = true
    const baseReq = [
        "congregacao","setor","name","endereco","bairro","uf","cidade","cep",
        /* "telefone", */ "celular","cpf","rg","tituloEleitor",
        /* "pai", */ /* "mae", */ // mãe tratada abaixo
        "nacionalidade","profissao","grauInstrucao","sexo","dataNascimento",
        "localNascimento","email","estadoCivil","dataConversao","origem",
        "localBatismo","dataBatismo",
    ];

    const allBaseFilled = baseReq.every((k) => String(form[k] || "").trim());
    const motherOk = form.isOrphan ? true : Boolean(String(form.mae || "").trim());

    return allBaseFilled && motherOk && form.autorizacao;
    };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const uploadProfileIfNeeded = async () => {
    if (!profileFile || !user) return previewImage || form.photoURL || "";
    // comprime e envia
    const compressed = await fileToWebp(profileFile);
    const storageRef = ref(storage, `profileImages/${user.uid}/profile.webp`);
    const task = uploadBytesResumable(storageRef, compressed);
    const url = await new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setUploadProgress(pct);
        },
        reject,
        async () => {
          const downloadURL = await getDownloadURL(task.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!user) return;

    if (!requiredOk()) {
      setErr("Preencha os campos obrigatórios (*) e aceite a autorização.");
      return;
    }

    setSaving(true);
    try {
      // normalizações
      const cpf        = onlyDigits(form.cpf);
      const cpfConjuge = onlyDigits(form.cpfConjuge);
      const cpfPai     = onlyDigits(form.cpfPai);
      const cpfMae     = onlyDigits(form.cpfMae);
      const filhos     = (form.filhos || []).map((f) => ({
        name: (f.name || "").trim(),
        cpf: onlyDigits(f.cpf),
      }));

      // validações de CPF
      const invalids = [];
      if (!validateCPF(cpf)) invalids.push("CPF do titular");
      if (cpfConjuge && !validateCPF(cpfConjuge)) invalids.push("CPF do cônjuge");
      if (cpfPai && !validateCPF(cpfPai)) invalids.push("CPF do pai");
      if (cpfMae && !validateCPF(cpfMae)) invalids.push("CPF da mãe");
      filhos.forEach((f, idx) => {
        if (f.cpf && !validateCPF(f.cpf)) invalids.push(`CPF do filho #${idx + 1}`);
      });
      if (invalids.length) {
        setErr(`Revise os seguintes CPFs inválidos: ${invalids.join(", ")}.`);
        setSaving(false);
        return;
      }

      // envia foto se houver
      let photoURL = await uploadProfileIfNeeded();

      // resolve familyId: procura existente por CPFs relacionados; se não, usa CPF do titular
      const probeCpfs = [cpf, cpfConjuge, cpfPai, cpfMae, ...filhos.map((f) => f.cpf)];
      let familyId =
        form.familyId ||
        (await findExistingFamilyIdByCpfs(probeCpfs)) ||
        cpf || null;

      // salva/atualiza usuário
      const refUser = doc(db, "users", user.uid);
      const payload = {
        ...form,
        cpf,
        cpfConjuge,
        cpfPai,
        cpfMae,
        filhos,
        familyId,
        photoURL: photoURL || form.photoURL || "",
        email: form.email || user.email || "",
        cep: onlyDigits(form.cep),
        updatedAt: new Date(),
        profileComplete: true,
      };
      await setDoc(refUser, payload, { merge: true });

      // upsert da família
      if (familyId) {
        const famRef = doc(db, "families", familyId);
        await setDoc(
          famRef,
          {
            responsibleCpf: familyId,
            updatedAt: new Date(),
          },
          { merge: true }
        );

        // titular (usa uid) — salva photoURL também
        await setDoc(
          doc(collection(db, "families", familyId, "members"), user.uid),
          {
            uid: user.uid,
            name: form.name,
            cpf,
            photoURL: photoURL || form.photoURL || "",
            kinship: "titular",
            updatedAt: new Date(),
          },
          { merge: true }
        );

        // placeholders por CPF (cônjuge/pais/filhos)
        const placeholders = [
          { name: form.nomeConjuge, cpf: cpfConjuge, kinship: "cônjuge" },
          { name: form.pai,        cpf: cpfPai,     kinship: "pai" },
          { name: form.mae,        cpf: cpfMae,     kinship: "mãe" },
          ...filhos.map((f) => ({ name: f.name, cpf: f.cpf, kinship: "filho" })),
        ].filter((p) => p.cpf);

        for (const p of placeholders) {
          await setDoc(
            doc(collection(db, "families", familyId, "members"), p.cpf),
            { ...p, updatedAt: new Date() },
            { merge: true }
          );
        }
      }

      router.replace("/portal");
    } catch (e) {
      console.error(e);
      setErr("Não foi possível salvar. Tente novamente.");
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
            {/* Foto de Perfil */}
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
