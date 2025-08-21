"use client";

import FormSection from "@/components/Registration/FormSection";
import Field from "@/components/Registration/Field";
import { BadgeInfo } from "lucide-react";

const ESTADOS_CIVIS = ["Solteiro(a)", "Casado(a)", "Viúvo(a)", "Divorciado(a)"];
const SEXOS = ["Masculino", "Feminino"];
const GRAUS_INSTRUCAO = [
  "Sem escolaridade",
  "Fundamental Incompleto",
  "Fundamental Completo",
  "Médio Incompleto",
  "Médio Completo",
  "Técnico",
  "Superior Incompleto",
  "Superior Completo",
  "Pós-graduação",
  "Mestrado",
  "Doutorado",
];

export default function PersonalSection({ form, setForm, inputCls }) {
  const onChange = (e) => {
    const { name, value } = e.target;

    // controla criação/remoção dos itens de filhos ao alterar a quantidade
    if (name === "qtdeFilhos") {
      const n = Math.max(0, parseInt(value || 0, 10) || 0);
      setForm((prev) => {
        const curr = Array.isArray(prev.filhos) ? prev.filhos : [];
        let novo = curr.slice(0, n);
        while (novo.length < n) novo.push({ name: "", cpf: "" });
        return { ...prev, qtdeFilhos: String(n), filhos: novo };
      });
      return;
    }

    // se mudar estado civil e não for "Casado(a)", limpa data do casamento
    if (name === "estadoCivil") {
      setForm((prev) => ({
        ...prev,
        estadoCivil: value,
        dtCasamento: value === "Casado(a)" ? prev.dtCasamento : "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isCasado = form.estadoCivil === "Casado(a)";

  return (
    <FormSection
      title="Dados Pessoais"
      subtitle="Informações civis e de nascimento"
      icon={<BadgeInfo size={18} />}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Nacionalidade" required>
          <input
            name="nacionalidade"
            className={inputCls}
            value={form.nacionalidade || ""}
            onChange={onChange}
          />
        </Field>

        <Field label="Profissão" required>
          <input
            name="profissao"
            className={inputCls}
            value={form.profissao || ""}
            onChange={onChange}
          />
        </Field>

        <Field label="Grau de Instrução" required>
          <select
            name="grauInstrucao"
            className={inputCls}
            value={form.grauInstrucao || ""}
            onChange={onChange}
          >
            <option value="" disabled>
              Selecione
            </option>
            {GRAUS_INSTRUCAO.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Sexo" required>
          <select
            name="sexo"
            className={inputCls}
            value={form.sexo || ""}
            onChange={onChange}
          >
            <option value="" disabled>
              Selecione
            </option>
            {SEXOS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Data de Nascimento" required>
          <input
            name="dataNascimento"
            type="date"
            className={inputCls}
            value={form.dataNascimento || ""}
            onChange={onChange}
          />
        </Field>

        <Field label="Local de Nascimento" required>
          <input
            name="localNascimento"
            className={inputCls}
            value={form.localNascimento || ""}
            onChange={onChange}
          />
        </Field>

        <Field label="Estado Civil" required>
          <select
            name="estadoCivil"
            className={inputCls}
            value={form.estadoCivil || ""}
            onChange={onChange}
          >
            <option value="" disabled>
              Selecione
            </option>
            {ESTADOS_CIVIS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Data de Casamento">
          <input
            name="dtCasamento"
            type="date"
            className={`${inputCls} ${!isCasado ? "opacity-60 cursor-not-allowed" : ""}`}
            value={form.dtCasamento || ""}
            onChange={onChange}
            disabled={!isCasado}
            required={isCasado} // obrigatório somente se casado
          />
        </Field>

        <Field label="Qtde Filhos" required>
          <input
            name="qtdeFilhos"
            type="number"
            min={0}
            className={inputCls}
            value={form.qtdeFilhos || ""}
            onChange={onChange}
            placeholder="0"
            inputMode="numeric"
          />
        </Field>
      </div>
    </FormSection>
  );
}

