"use client";

import FormSection from "@/components/Registration/FormSection";
import Field from "@/components/Registration/Field";
import { ShieldCheck } from "lucide-react";

export default function AuthorizationSection({ form, setForm }) {
  const toggle = (e) => setForm((f) => ({ ...f, autorizacao: e.target.checked }));

  return (
    <FormSection title="Autorização" subtitle="Consentimento LGPD" icon={<ShieldCheck size={18} />}>
      <p className="text-sm text-slate-600 mb-3">
        Ao enviar, concordo que meus dados sejam compartilhados com a IGREJA e a CONVENÇÃO para confecção de cartão de membro e
        outros documentos, e autorizo o uso de imagem em transmissões e publicidades da IGREJA/CONVENÇÃO (LGPD).
      </p>
      <Field>
        <label className="flex items-center gap-2 text-slate-700">
          <input type="checkbox" checked={!!form.autorizacao} onChange={toggle} />
          Confirmo que li e concordo com a autorização.
        </label>
      </Field>
    </FormSection>
  );
}

