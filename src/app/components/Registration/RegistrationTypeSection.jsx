"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import FormSection from "@/components/Registration/FormSection";
import Field from "@/components/Registration/Field";
import { Settings2 } from "lucide-react";

export default function RegistrationTypeSection({ form, setForm, inputCls }) {
  const [sectors, setSectors] = useState([]);
  const [congregations, setCongregations] = useState([]);

  useEffect(() => {
    const loadSectors = async () => {
      const snap = await getDocs(collection(db, "sectors"));
      if (snap.empty) {
        const defaultSector = { id: "default", name: "Setor 01" };
        const defaultCong  = { id: "default", name: "Matriz" };
        setSectors([defaultSector]);
        setCongregations([defaultCong]);
        setForm((f) => ({ ...f, setor: defaultSector.name, congregacao: defaultCong.name }));
      } else {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSectors(list);
        // pré-carrega a primeira congregação
        const first = list[0];
        if (first) {
          await handleSectorChange({ target: { value: first.name } }, list);
        }
      }
    };
    loadSectors();
  }, [setForm]);

  const handleSectorChange = async (e, sectorsList = sectors) => {
    const name = e.target.value;
    setForm((f) => ({ ...f, setor: name, congregacao: "" }));
    const sector = sectorsList.find((s) => s.name === name);
    if (sector) {
      const congSnap = await getDocs(collection(db, "sectors", sector.id, "congregations"));
      setCongregations(congSnap.docs.map((c) => ({ id: c.id, ...c.data() })));
    } else {
      setCongregations([]);
    }
  };

  const handleCongregationChange = (e) => {
    setForm((f) => ({ ...f, congregacao: e.target.value }));
  };

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

        <Field label="Setor" required>
          <select
            name="setor"
            className={inputCls}
            value={form.setor || ""}
            onChange={handleSectorChange}
            disabled={!sectors.length}
          >
            <option value="">
              {sectors.length ? "Selecione..." : "Nenhum setor encontrado"}
            </option>
            {sectors.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Congregação" required>
          <select
            name="congregacao"
            className={inputCls}
            value={form.congregacao || ""}
            onChange={handleCongregationChange}
            disabled={!congregations.length}
          >
            <option value="">
              {congregations.length ? "Selecione..." : "Nenhuma congregação encontrada"}
            </option>
            {congregations.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </FormSection>
  );
}

