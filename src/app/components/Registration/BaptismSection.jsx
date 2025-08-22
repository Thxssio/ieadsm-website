"use client";

import FormSection from "@/components/Registration/FormSection";
import Field from "@/components/Registration/Field";
import { Waves } from "lucide-react";

export default function BaptismSection({ form, setForm, inputCls }) {
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <FormSection title="Batismo e Recebimento" subtitle="Informações de batismo em águas" icon={<Waves size={18} />}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Local de Batismo" required><input name="localBatismo" className={inputCls} value={form.localBatismo || ""} onChange={onChange} /></Field>
        <Field label="Data de Batismo" required><input name="dataBatismo" type="date" className={inputCls} value={form.dataBatismo || ""} onChange={onChange} /></Field>
        <Field label="Recebimento"><input name="recebimento" className={inputCls} value={form.recebimento || ""} onChange={onChange} /></Field>
        <Field label="Data de Recebimento"><input name="dataRecebimento" type="date" className={inputCls} value={form.dataRecebimento || ""} onChange={onChange} /></Field>
      </div>
    </FormSection>
  );
}

