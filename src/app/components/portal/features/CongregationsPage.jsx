"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import PageContent from "@/components/portal/ui/PageContent";

export default function CongregationsPage() {
  const [sectors, setSectors] = useState([]);
  const [newSector, setNewSector] = useState("");
  const [forms, setForms] = useState({}); // sectorId -> congregation form

  const emptyCongForm = {
    name: "",
    isDefault: false,
    primary: { husband: "", wife: "" },
    secondary: { husband: "", wife: "" },
    responsibles: [{ husband: "", wife: "" }],
  };

  const loadData = async () => {
    const secSnap = await getDocs(collection(db, "sectors"));
    if (secSnap.empty) {
      const defaultSectorRef = await addDoc(collection(db, "sectors"), {
        name: "Setor 01",
        isDefault: true,
      });
      await addDoc(collection(db, "sectors", defaultSectorRef.id, "congregations"), {
        name: "Matriz",
        isDefault: true,
      });
      return loadData();
    }
    const data = [];
    for (const s of secSnap.docs) {
      const congSnap = await getDocs(collection(db, "sectors", s.id, "congregations"));
      data.push({ id: s.id, ...s.data(), congregations: congSnap.docs.map((c) => ({ id: c.id, ...c.data() })) });
      data.push({
        id: s.id,
        ...s.data(),
        congregations: congSnap.docs.map((c) => ({ id: c.id, ...c.data() })),
      });
    }
    setSectors(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSector = async (e) => {
    e.preventDefault();
    const name = newSector.trim();
    if (!name) return;
    await addDoc(collection(db, "sectors"), { name });
    setNewSector("");
    await loadData();
  };

  const updateForm = (sectorId, updater) => {
    setForms((prev) => ({ ...prev, [sectorId]: updater(prev[sectorId] || { ...emptyCongForm }) }));
  };

  const handleAddCongregation = async (sectorId) => {
    const form = forms[sectorId] || emptyCongForm;
    const name = form.name.trim();
    if (!name) return;
    const payload = {
      name,
      isDefault: form.isDefault || false,
      supervisors: {
        primary: {
          husband: form.primary.husband.trim(),
          wife: form.primary.wife.trim(),
        },
        secondary: {
          husband: form.secondary.husband.trim(),
          wife: form.secondary.wife.trim(),
        },
      },
      responsibles: (form.responsibles || [])
        .filter((r) => r.husband.trim() || r.wife.trim())
        .map((r) => ({ husband: r.husband.trim(), wife: r.wife.trim() })),
    };
    await addDoc(collection(db, "sectors", sectorId, "congregations"), payload);
    updateForm(sectorId, () => ({ ...emptyCongForm }));
    await loadData();
  };

  return (
    <PageContent title="Congregações">
      <div className="space-y-8">
        <form onSubmit={handleAddSector} className="flex gap-2">
        <form onSubmit={handleAddSector} className="bg-slate-50 p-4 rounded flex gap-2">
          <input
            className="border border-slate-300 rounded px-2 py-1 flex-1"
            placeholder="Novo setor"
            value={newSector}
            onChange={(e) => setNewSector(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
            Adicionar Setor
          </button>
        </form>

        {sectors.map((sector) => (
          <div key={sector.id} className="border-t border-slate-200 pt-4">
            <h3 className="font-semibold text-lg mb-2">{sector.name}</h3>
            <ul className="list-disc pl-5 mb-4">
          <div
            key={sector.id}
            className="border border-slate-200 rounded p-4 space-y-4"
          >
            <h3 className="font-semibold text-xl">{sector.name}</h3>

            <div className="space-y-2">
              {sector.congregations.map((c) => (
                <li key={c.id} className="mb-1">
                  <span className="font-medium">{c.name}</span>
                <div
                  key={c.id}
                  className="pl-4 border-l-2 border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    {c.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        Padrão
                      </span>
                    )}
                  </div>
                  {c.supervisors?.primary?.husband && (
                    <span className="text-sm text-slate-600">
                      {" "}- Sup.1: {c.supervisors.primary.husband} & {c.supervisors.primary.wife}
                    </span>
                    <div className="text-sm text-slate-600 pl-4">
                      Sup.1: {c.supervisors.primary.husband} & {c.supervisors.primary.wife}
                    </div>
                  )}
                  {c.supervisors?.secondary?.husband && (
                    <span className="text-sm text-slate-600">
                      {" "}- Sup.2: {c.supervisors.secondary.husband} & {c.supervisors.secondary.wife}
                    </span>
                    <div className="text-sm text-slate-600 pl-4">
                      Sup.2: {c.supervisors.secondary.husband} & {c.supervisors.secondary.wife}
                    </div>
                  )}
                </li>
                </div>
              ))}
            </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <h4 className="font-medium mb-2">Nova congregação</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <div className="bg-slate-50 p-4 rounded space-y-2">
              <h4 className="font-medium">Nova congregação</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  className="border border-slate-300 rounded px-2 py-1"
                  placeholder="Nome"
                  value={forms[sector.id]?.name || ""}
                  onChange={(e) => updateForm(sector.id, (f) => ({ ...f, name: e.target.value }))}
                />
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={forms[sector.id]?.isDefault || false}
                    onChange={(e) =>
                      updateForm(sector.id, (f) => ({ ...f, isDefault: e.target.checked }))
                    }
                  />
                  Padrão
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="border border-slate-300 rounded px-2 py-1"
                    placeholder="1º Sup. Esposo"
                    value={forms[sector.id]?.primary?.husband || ""}
                    onChange={(e) =>
                      updateForm(sector.id, (f) => ({
                        ...f,
                        primary: { ...f.primary, husband: e.target.value },
                      }))
                    }
                  />
                  <input
                    className="border border-slate-300 rounded px-2 py-1"
                    placeholder="1º Sup. Esposa"
                    value={forms[sector.id]?.primary?.wife || ""}
                    onChange={(e) =>
                      updateForm(sector.id, (f) => ({
                        ...f,
                        primary: { ...f.primary, wife: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
@@ -143,82 +184,82 @@ export default function CongregationsPage() {
                    className="border border-slate-300 rounded px-2 py-1"
                    placeholder="2º Sup. Esposo"
                    value={forms[sector.id]?.secondary?.husband || ""}
                    onChange={(e) =>
                      updateForm(sector.id, (f) => ({
                        ...f,
                        secondary: { ...f.secondary, husband: e.target.value },
                      }))
                    }
                  />
                  <input
                    className="border border-slate-300 rounded px-2 py-1"
                    placeholder="2º Sup. Esposa"
                    value={forms[sector.id]?.secondary?.wife || ""}
                    onChange={(e) =>
                      updateForm(sector.id, (f) => ({
                        ...f,
                        secondary: { ...f.secondary, wife: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              {(forms[sector.id]?.responsibles || [{ husband: "", wife: "" }]).map((r, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
                <div key={idx} className="grid grid-cols-2 gap-2">
                  <input
                    className="border border-slate-300 rounded px-2 py-1"
                    placeholder={`Responsável ${idx + 1} Esposo`}
                    value={r.husband}
                    onChange={(e) =>
                      updateForm(sector.id, (f) => {
                        const rs = [...f.responsibles];
                        rs[idx] = { ...rs[idx], husband: e.target.value };
                        return { ...f, responsibles: rs };
                      })
                    }
                  />
                  <input
                    className="border border-slate-300 rounded px-2 py-1"
                    placeholder={`Responsável ${idx + 1} Esposa`}
                    value={r.wife}
                    onChange={(e) =>
                      updateForm(sector.id, (f) => {
                        const rs = [...f.responsibles];
                        rs[idx] = { ...rs[idx], wife: e.target.value };
                        return { ...f, responsibles: rs };
                      })
                    }
                  />
                </div>
              ))}

              <button
                type="button"
                className="text-sm text-blue-600 mb-2"
                className="text-sm text-blue-600"
                onClick={() =>
                  updateForm(sector.id, (f) => ({
                    ...f,
                    responsibles: [...(f.responsibles || []), { husband: "", wife: "" }],
                  }))
                }
              >
                Adicionar responsável
              </button>
              <div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleAddCongregation(sector.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Salvar Congregação
                  Adicionar Congregação
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContent>
  );
}


