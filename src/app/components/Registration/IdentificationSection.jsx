"use client";

import FormSection from "./FormSection";
import Field from "./Field";
import { maskCPF } from "../../lib/utils/cpf";
import { IdCard } from "lucide-react";

export default function IdentificationSection({ form, setForm, inputCls }) {
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <FormSection title="Identificação" subtitle="Dados pessoais e contato" icon={<IdCard size={18} />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nome do Membro" required>
          <input name="name" className={inputCls} value={form.name || ""} onChange={onChange} />
        </Field>
        <Field label="E-mail" required>
          <input name="email" type="email" className={inputCls} value={form.email || ""} onChange={onChange} />
        </Field>
        <Field label="Telefone">
          <input name="telefone" className={inputCls} value={form.telefone || ""} onChange={onChange} />
        </Field>
        <Field label="Celular" required>
          <input name="celular" className={inputCls} value={form.celular || ""} onChange={onChange} />
        </Field>
        <Field label="CPF" required hint="Digite apenas números; a máscara aparece automaticamente.">
          <input
            name="cpf"
            className={inputCls}
            value={maskCPF(form.cpf || "")}
            onChange={(e) => setForm((f) => ({ ...f, cpf: maskCPF(e.target.value) }))}
          />
        </Field>
        <Field label="RG" required>
          <input name="rg" className={inputCls} value={form.rg || ""} onChange={onChange} />
        </Field>
        <Field label="Título de Eleitor" required>
          <input name="tituloEleitor" className={inputCls} value={form.tituloEleitor || ""} onChange={onChange} />
        </Field>
      </div>
    </FormSection>
  );
}
