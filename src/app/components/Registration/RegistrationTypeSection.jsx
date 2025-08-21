"use client";

import FormSection from "@/components/Registration/FormSection";
import Field from "@/components/Registration/Field";
import { Settings2 } from "lucide-react";

export default function RegistrationTypeSection({ form, setForm, inputCls }) {
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <FormSection
      title="Tipo de Registro"
      subtitle="Selecione a modalidade"
      icon={<Settings2 size={18} />}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Field label="Tipo">
          <select
            name="registroTipo"
            value={form.registroTipo}
            onChange={onChange}
            className={inputCls}
          >
            {[
              "ATUALIZAÇÃO",
              "BATISMO",
              "ADMISSÃO",
              "RECONCILIAÇÃO",
              "TRANSFERÊNCIA",
              "OUTROS",
            ].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>

        <Field label="ID Interno">
          <input
            name="idInterno"
            className={inputCls}
            value={form.idInterno || ""}
            readOnly
          />
        </Field>

        <Field label="Congregação" required>
          <input
            name="congregacao"
            className={inputCls}
            value={form.congregacao || ""}
            onChange={onChange}
          />
        </Field>

        <Field label="Setor" required>
          <input
            name="setor"
            className={inputCls}
            value={form.setor || ""}
            onChange={onChange}
          />
        </Field>
      </div>
    </FormSection>
  );
}

