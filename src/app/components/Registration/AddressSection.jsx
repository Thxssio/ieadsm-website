"use client";

import FormSection from "./FormSection";
import Field from "./Field";
import { MapPinned } from "lucide-react";
import { useCepLookup } from "../../hooks/useCepLookup";

export default function AddressSection({ form, setForm, inputCls }) {
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const { loading: cepLoading, error: cepErr, handleCepInput } =
    useCepLookup({ form, setForm });

  return (
    <FormSection title="Endereço" subtitle="Residência atual" icon={<MapPinned size={18} />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Endereço" required>
          <input
            name="endereco"
            className={inputCls}
            value={form.endereco || ""}
            onChange={onChange}
            placeholder="Rua / Avenida"
          />
        </Field>

        <Field label="Número">
          <input
            name="numero"
            className={inputCls}
            value={form.numero || ""}
            onChange={onChange}
            placeholder="Nº"
            inputMode="numeric"
          />
        </Field>

        <Field label="Complemento">
          <input
            name="complemento"
            className={inputCls}
            value={form.complemento || ""}
            onChange={onChange}
            placeholder="Ap., bloco, referência..."
          />
        </Field>

        <Field label="Bairro" required>
          <input
            name="bairro"
            className={inputCls}
            value={form.bairro || ""}
            onChange={onChange}
          />
        </Field>

        <Field label="Cidade" required>
          <input
            name="cidade"
            className={inputCls}
            value={form.cidade || ""}
            onChange={onChange}
          />
        </Field>

        <Field label="UF" required>
          <input
            name="uf"
            maxLength={2}
            className={inputCls}
            value={(form.uf || "").toUpperCase()}
            onChange={(e) =>
              setForm((f) => ({ ...f, uf: e.target.value.toUpperCase() }))
            }
          />
        </Field>

        {/* CEP sem botão: busca automática quando tiver 8 dígitos */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">CEP</label>
          <input
            name="cep"
            className={`${inputCls} mt-1`}
            value={form.cep || ""}
            onChange={(e) => handleCepInput(e.target.value)}
            placeholder="00000-000"
            inputMode="numeric"
            autoComplete="postal-code"
          />
          {(cepLoading || cepErr) && (
            <p className={`mt-1 text-xs ${cepErr ? "text-red-600" : "text-slate-500"}`}>
              {cepErr ? cepErr : "Buscando CEP..."}
            </p>
          )}
        </div>
      </div>
    </FormSection>
  );
}
