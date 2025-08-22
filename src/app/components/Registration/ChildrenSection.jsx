"use client";

import { Trash2 } from "lucide-react";
import FormSection from "@/components/Registration/FormSection";
import Field from "@/components/Registration/Field";
import { maskCPF } from "@/lib/utils/cpf";

export default function ChildrenSection({ form, setForm, inputCls }) {
  const filhos = Array.isArray(form.filhos) ? form.filhos : [];

  const updateChild = (idx, field, value) => {
    setForm((f) => {
      const arr = [...(f.filhos || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...f, filhos: arr };
    });
  };

  const removeChild = (idx) => {
    setForm((f) => {
      const arr = [...(f.filhos || [])];
      arr.splice(idx, 1);
      return { ...f, filhos: arr, qtdeFilhos: String(arr.length) };
    });
  };

  return (
    <FormSection title="Filhos" subtitle="Informe nome e CPF">
      <div className="space-y-3">
        {filhos.length === 0 && (
          <p className="text-sm text-slate-600">
            Defina a <b>Qtde Filhos</b> em “Dados Pessoais” para gerar os campos automaticamente.
          </p>
        )}

        {filhos.map((c, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          >
            <div className="md:col-span-1">
              <span className="text-sm text-slate-600">#{index + 1}</span>
            </div>

            <div className="md:col-span-6">
              <Field label="Nome do filho(a)">
                <input
                  className={inputCls}
                  value={c.name || ""}
                  onChange={(e) => updateChild(index, "name", e.target.value)}
                />
              </Field>
            </div>

            <div className="md:col-span-4">
              <Field label="CPF do filho(a)">
                <input
                  className={inputCls}
                  value={maskCPF(c.cpf || "")}
                  onChange={(e) =>
                    updateChild(index, "cpf", maskCPF(e.target.value))
                  }
                />
              </Field>
            </div>

            <div className="md:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={() => removeChild(index)}
                className="p-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Remover filho"
                aria-label={`Remover filho ${index + 1}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  );
}

