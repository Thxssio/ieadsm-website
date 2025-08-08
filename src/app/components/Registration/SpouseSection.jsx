"use client";

import FormSection from "./FormSection";
import Field from "./Field";
import { maskCPF } from "../../lib/utils/cpf";
import { HeartHandshake } from "lucide-react";

export default function SpouseSection({ form, setForm, inputCls }) {
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <FormSection title="Cônjuge" subtitle="Dados do cônjuge (se houver)" icon={<HeartHandshake size={18} />}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Field label="Nome do Cônjuge"><input name="nomeConjuge" className={inputCls} value={form.nomeConjuge || ""} onChange={onChange} /></Field>
        <Field label="CPF do Cônjuge"><input name="cpfConjuge" className={inputCls} value={maskCPF(form.cpfConjuge || "")} onChange={(e)=>setForm(f=>({...f,cpfConjuge:maskCPF(e.target.value)}))} /></Field>
        <Field label="Profissão"><input name="profissaoConjuge" className={inputCls} value={form.profissaoConjuge || ""} onChange={onChange} /></Field>
        <Field label="Grau de Instrução">
        <select
            name="grauInstrucaoConjuge"
            className={inputCls}
            value={form.grauInstrucaoConjuge || ""}
            onChange={onChange}
        >
            <option value="">Selecione</option>
            <option value="fundamental incompleto">Fundamental incompleto</option>
            <option value="fundamental completo">Fundamental completo</option>
            <option value="médio incompleto">Médio incompleto</option>
            <option value="médio completo">Médio completo</option>
            <option value="superior incompleto">Superior incompleto</option>
            <option value="superior completo">Superior completo</option>
            <option value="pós-graduação">Pós-graduação</option>
            <option value="mestrado">Mestrado</option>
            <option value="doutorado">Doutorado</option>
        </select>
        </Field>

        <Field label="Data de Nascimento"><input name="dataNascimentoConjuge" type="date" className={inputCls} value={form.dataNascimentoConjuge || ""} onChange={onChange} /></Field>
      </div>
    </FormSection>
  );
}
