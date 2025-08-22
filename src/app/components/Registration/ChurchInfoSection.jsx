"use client";

import { Switch } from "@headlessui/react";
import { Church } from "lucide-react";
import FormSection from "@/components/Registration/FormSection";
import Field from "@/components/Registration/Field";

export default function ChurchInfoSection({ form, setForm, inputCls }) {
  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const batizado = !!form.batizadoEspiritoSanto;

  const setBatizado = (value) => {
    setForm((f) => ({
      ...f,
      batizadoEspiritoSanto: value,
      dataBatismoEspiritoSanto: value ? f.dataBatismoEspiritoSanto : "",
    }));
  };

  return (
    <FormSection
      title="Conversão e Batismo no Espirito Santo"
      subtitle="Histórico de fé"
      icon={<Church size={18} />}
    >
      {/* Linha 1: Conversão + Toggle + Data Batismo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Data da Conversão */}
        <Field label="Data da Conversão" required>
          <input
            name="dataConversao"
            type="date"
            className={inputCls}
            value={form.dataConversao || ""}
            onChange={onChange}
          />
        </Field>

        {/* Toggle central */}
        <div className="flex flex-col items-center justify-center pt-6">
          <Switch
            checked={batizado}
            onChange={setBatizado}
            className={`${
              batizado ? "bg-slate-900" : "bg-slate-300"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
          >
            <span
              className={`${
                batizado ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          <span className="text-xs mt-1">Batizado</span>
        </div>

        {/* Data Batismo no Espirito Santo */}
        <Field label="Data Batismo no Espirito Santo">
          <input
            name="dataBatismoEspiritoSanto"
            type="date"
            className={`${inputCls} ${
              !batizado ? "opacity-60 cursor-not-allowed" : ""
            }`}
            value={form.dataBatismoEspiritoSanto || ""}
            onChange={onChange}
            disabled={!batizado}
            aria-disabled={!batizado}
            required={batizado}
          />
        </Field>
      </div>

      {/* Linha 2: Origem + Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Origem" required>
          <input
            name="origem"
            className={inputCls}
            value={form.origem || ""}
            onChange={onChange}
          />
        </Field>
        <Field label="Informações">
          <input
            name="informacoes"
            className={inputCls}
            value={form.informacoes || ""}
            onChange={onChange}
          />
        </Field>
      </div>
    </FormSection>
  );
}

