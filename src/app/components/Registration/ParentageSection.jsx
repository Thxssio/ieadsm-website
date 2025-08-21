"use client";

import FormSection from "@/components/Registration/FormSection";
import Field from "@/components/Registration/Field";
import { maskCPF } from "@/lib/utils/cpf";
import { Users } from "lucide-react";

export default function ParentageSection({ form, setForm, inputCls }) {
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggleOrphan = (e) => {
    const checked = e.target.checked;
    setForm((f) => ({
      ...f,
      isOrphan: checked,
      // se marcar órfão, limpa e desabilita campos de pai/mãe
      pai: checked ? "" : f.pai,
      mae: checked ? "" : f.mae,
      cpfPai: checked ? "" : f.cpfPai,
      cpfMae: checked ? "" : f.cpfMae,
    }));
  };

  const disabled = !!form.isOrphan;

  return (
    <FormSection title="Filiação" subtitle="Dados de pai e mãe" icon={<Users size={18} />}>
      {/* Linha do toggle */}
      <div className="mb-2">
        <label className="inline-flex items-center gap-2 text-slate-700">
          <input
            type="checkbox"
            name="isOrphan"
            checked={!!form.isOrphan}
            onChange={toggleOrphan}
          />
          <span>Sou órfão(ã)</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pai (NÃO obrigatório) */}
        <Field label="Pai">
          <input
            name="pai"
            className={inputCls}
            value={form.pai || ""}
            onChange={onChange}
            disabled={disabled}
          />
        </Field>

        <Field label="CPF do Pai">
          <input
            name="cpfPai"
            className={inputCls}
            value={maskCPF(form.cpfPai || "")}
            onChange={(e) =>
              setForm((f) => ({ ...f, cpfPai: maskCPF(e.target.value) }))
            }
            disabled={disabled}
          />
        </Field>

        {/* Mãe (OBRIGATÓRIO quando NÃO órfão) */}
        <Field label="Mãe" required={!form.isOrphan}>
          <input
            name="mae"
            className={inputCls}
            value={form.mae || ""}
            onChange={onChange}
            disabled={disabled}
            required={!form.isOrphan}
          />
        </Field>

        <Field label="CPF da Mãe">
          <input
            name="cpfMae"
            className={inputCls}
            value={maskCPF(form.cpfMae || "")}
            onChange={(e) =>
              setForm((f) => ({ ...f, cpfMae: maskCPF(e.target.value) }))
            }
            disabled={disabled}
          />
        </Field>
      </div>
    </FormSection>
  );
}

