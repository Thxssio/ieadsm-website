"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import PageContent from "@/components/portal/ui/PageContent";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Star,
  Users,
  Layers3,
  Save,
  Trash2,
} from "lucide-react";

// ---------- Helpers ----------
const emptyCongForm = () => ({
  name: "",
  isDefault: false,
  primary: { husband: "", wife: "" }, // mantemos o schema; só mudam os rótulos na UI
  secondary: { husband: "", wife: "" },
  responsibles: [{ husband: "", wife: "" }],
});

function classNames(...s) {
  return s.filter(Boolean).join(" ");
}

// ---------- Main ----------
export default function CongregationsPage() {
  const [sectors, setSectors] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [forms, setForms] = useState({});
  const [newSector, setNewSector] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const secQ = query(collection(db, "sectors"));
    const secSnap = await getDocs(secQ);

    if (secSnap.empty) {
      const defaultSectorRef = await addDoc(collection(db, "sectors"), {
        name: "Setor 01",
        isDefault: true,
      });
      await addDoc(
        collection(db, "sectors", defaultSectorRef.id, "congregations"),
        { name: "Matriz", isDefault: true }
      );
      setLoading(false);
      return loadData();
    }

    const data = [];
    for (const s of secSnap.docs) {
      const congQ = query(
        collection(db, "sectors", s.id, "congregations"),
        orderBy("name")
      );
      const congSnap = await getDocs(congQ);
      data.push({
        id: s.id,
        ...s.data(),
        congregations: congSnap.docs.map((c) => ({ id: c.id, ...c.data() })),
      });
    }

    // Padrão primeiro; depois por nome
    data.sort((a, b) => {
      const da = (a.isDefault ? 0 : 1) - (b.isDefault ? 0 : 1);
      if (da !== 0) return da;
      return (a.name || "").localeCompare(b.name || "");
    });

    setSectors(data);
    const exp = {};
    data.forEach((s) => (exp[s.id] = true));
    setExpanded(exp);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateForm = (sectorId, updater) => {
    setForms((prev) => {
      const base = prev[sectorId] || emptyCongForm();
      return { ...prev, [sectorId]: updater(base) };
    });
  };

  const handleAddSector = async (e) => {
    e.preventDefault();
    const name = newSector.trim();
    if (!name) return;
    await addDoc(collection(db, "sectors"), { name, isDefault: false });
    setNewSector("");
    await loadData();
  };

  const handleAddCongregation = async (sectorId) => {
    const form = forms[sectorId] || emptyCongForm();
    const name = (form.name || "").trim();
    if (!name) return;

    const payload = {
      name,
      isDefault: !!form.isDefault,
      supervisors: {
        primary: {
          husband: (form.primary?.husband || "").trim(),
          wife: (form.primary?.wife || "").trim(),
        },
        secondary: {
          husband: (form.secondary?.husband || "").trim(),
          wife: (form.secondary?.wife || "").trim(),
        },
      },
      responsibles: (form.responsibles || [])
        .filter((r) => (r.husband || "").trim() || (r.wife || "").trim())
        .map((r) => ({
          husband: (r.husband || "").trim(),
          wife: (r.wife || "").trim(),
        })),
    };

    await addDoc(collection(db, "sectors", sectorId, "congregations"), payload);
    setForms((prev) => ({ ...prev, [sectorId]: emptyCongForm() }));
    await loadData();
  };

  const handleDeleteCongregation = async (sectorId, congregationId, name) => {
    const ok = window.confirm(`Excluir a congregação “${name}”? Essa ação não pode ser desfeita.`);
    if (!ok) return;
    await deleteDoc(doc(db, "sectors", sectorId, "congregations", congregationId));
    await loadData();
  };

  // Excluir setor (apaga as congregações da subcoleção e depois o doc do setor).
  // OBS: se houver outras subcoleções, implemente deleção recursiva via Cloud Function/Admin.
  const handleDeleteSector = async (sector) => {
    const ok = window.confirm(
      `Excluir o setor “${sector.name}” e todas as suas congregações? Essa ação não pode ser desfeita.`
    );
    if (!ok) return;

    // Apaga todas as congregações conhecidas
    const congSnap = await getDocs(collection(db, "sectors", sector.id, "congregations"));
    const deletions = congSnap.docs.map((d) =>
      deleteDoc(doc(db, "sectors", sector.id, "congregations", d.id))
    );
    await Promise.all(deletions);

    // Apaga o setor
    await deleteDoc(doc(db, "sectors", sector.id));

    await loadData();
  };

  const filteredSectors = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sectors;
    return sectors
      .map((s) => ({
        ...s,
        congregations: (s.congregations || []).filter((c) =>
          (c.name || "").toLowerCase().includes(term)
        ),
      }))
      .filter(
        (s) =>
          s.congregations.length > 0 || (s.name || "").toLowerCase().includes(term)
      );
  }, [sectors, search]);

  return (
    <PageContent title="Congregações">
      {/* Bloco visível e destacado para ADICIONAR SETOR */}
      <section className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100">
              <Layers3 className="h-5 w-5 text-sky-700" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Adicionar novo setor
              </h3>
              <p className="text-sm text-slate-600">
                Crie um setor e cadastre suas congregações logo abaixo.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddSector} className="flex w-full gap-2 md:w-auto">
            <label htmlFor="novo-setor" className="sr-only">
              Nome do novo setor
            </label>
            <input
              id="novo-setor"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 md:w-72"
              placeholder="Nome do setor (ex.: Setor 02)"
              value={newSector}
              onChange={(e) => setNewSector(e.target.value)}
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
              title="Adicionar setor"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </form>
        </div>
      </section>

      {/* Barra de busca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Buscar por setor ou congregação…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <SkeletonSectors />
      ) : filteredSectors.length === 0 ? (
        <EmptyState onReset={() => setSearch("")} />
      ) : (
        <div className="space-y-4">
          {filteredSectors.map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              expanded={!!expanded[sector.id]}
              onToggle={() =>
                setExpanded((prev) => ({ ...prev, [sector.id]: !prev[sector.id] }))
              }
              onDelete={() => handleDeleteSector(sector)}
            >
              {/* Lista de congregações */}
              <ul className="space-y-2">
                {sector.congregations?.length ? (
                  sector.congregations.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-slate-300"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">{c.name}</span>
                            {c.isDefault && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                <Star className="h-3 w-3" />
                                Padrão
                              </span>
                            )}
                          </div>
                          <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                            {c.supervisors?.primary?.husband && (
                              <div>
                                Sup. 1: {c.supervisors.primary.husband}
                                {c.supervisors.primary.wife
                                  ? ` & ${c.supervisors.primary.wife}`
                                  : ""}
                              </div>
                            )}
                            {c.supervisors?.secondary?.husband && (
                              <div>
                                Sup. 2: {c.supervisors.secondary.husband}
                                {c.supervisors.secondary.wife
                                  ? ` & ${c.supervisors.secondary.wife}`
                                  : ""}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {Array.isArray(c.responsibles) && c.responsibles.length > 0 && (
                            <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 whitespace-nowrap">
                              <Users className="h-3.5 w-3.5" />
                              {c.responsibles.length} responsáveis
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteCongregation(sector.id, c.id, c.name)
                            }
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                            title="Excluir congregação"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">Nenhuma congregação cadastrada.</li>
                )}
              </ul>

              {/* Formulário de nova congregação */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-700">
                  Nova congregação em <span className="text-slate-900">{sector.name}</span>
                </h4>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Nome da congregação"
                    value={forms[sector.id]?.name || ""}
                    onChange={(e) =>
                      updateForm(sector.id, (f) => ({ ...f, name: e.target.value }))
                    }
                  />

                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600"
                      checked={forms[sector.id]?.isDefault || false}
                      onChange={(e) =>
                        updateForm(sector.id, (f) => ({ ...f, isDefault: e.target.checked }))
                      }
                    />
                    Marcar como padrão do setor
                  </label>

                  {/* Supervisores - rótulos neutros */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Supervisor 1 — Nome A"
                      value={forms[sector.id]?.primary?.husband || ""}
                      onChange={(e) =>
                        updateForm(sector.id, (f) => ({
                          ...f,
                          primary: { ...f.primary, husband: e.target.value },
                        }))
                      }
                    />
                    <input
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Supervisor 1 — Nome B"
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
                    <input
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Supervisor 2 — Nome A"
                      value={forms[sector.id]?.secondary?.husband || ""}
                      onChange={(e) =>
                        updateForm(sector.id, (f) => ({
                          ...f,
                          secondary: { ...f.secondary, husband: e.target.value },
                        }))
                      }
                    />
                    <input
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Supervisor 2 — Nome B"
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

                {(forms[sector.id]?.responsibles || [{ husband: "", wife: "" }]).map(
                  (r, idx) => (
                    <div key={idx} className="mt-2 grid grid-cols-2 gap-2">
                      <input
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        placeholder={`Responsável ${idx + 1} — Nome A`}
                        value={r.husband}
                        onChange={(e) =>
                          updateForm(sector.id, (f) => {
                            const rs = [...(f.responsibles || [{ husband: "", wife: "" }])];
                            rs[idx] = { ...rs[idx], husband: e.target.value };
                            return { ...f, responsibles: rs };
                          })
                        }
                      />
                      <input
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        placeholder={`Responsável ${idx + 1} — Nome B`}
                        value={r.wife}
                        onChange={(e) =>
                          updateForm(sector.id, (f) => {
                            const rs = [...(f.responsibles || [{ husband: "", wife: "" }])];
                            rs[idx] = { ...rs[idx], wife: e.target.value };
                            return { ...f, responsibles: rs };
                          })
                        }
                      />
                    </div>
                  )
                )}

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="text-sm font-medium text-sky-700 hover:underline"
                    onClick={() =>
                      updateForm(sector.id, (f) => ({
                        ...f,
                        responsibles: [...(f.responsibles || []), { husband: "", wife: "" }],
                      }))
                    }
                  >
                    + Adicionar responsável
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddCongregation(sector.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
                    title="Salvar congregação"
                  >
                    <Save className="h-4 w-4" />
                    Salvar congregação
                  </button>
                </div>
              </div>
            </SectorCard>
          ))}
        </div>
      )}
    </PageContent>
  );
}

// ---------- UI Subcomponents ----------
function SectorCard({ sector, expanded, onToggle, onDelete, children }) {
  const count = sector.congregations?.length || 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header
        className={classNames(
          "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3",
          expanded ? "bg-slate-50" : "bg-white"
        )}
      >
        <button
          onClick={onToggle}
          className="flex min-w-0 items-center gap-3"
          title={expanded ? "Recolher setor" : "Expandir setor"}
        >
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-slate-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-slate-500" />
          )}
          <div className="min-w-0 text-left">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-slate-900">
                {sector.name}
              </h3>
              {sector.isDefault && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                  <Star className="h-3 w-3" />
                  Padrão
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {count} {count === 1 ? "congregação" : "congregações"}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* Botão excluir setor: vermelho sutil */}
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
            title="Excluir setor"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
        </div>
      </header>

      {expanded && <div className="px-4 pb-4">{children}</div>}
    </section>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-base font-semibold text-slate-800">Nada encontrado</h3>
      <p className="mt-1 text-sm text-slate-600">
        Tente limpar o filtro de busca ou adicionar um novo setor/congregação.
      </p>
      <button
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        Limpar busca
      </button>
    </div>
  );
}

function SkeletonSectors() {
  return (
    <div className="space-y-4">
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 h-5 w-1/3 rounded bg-slate-200" />
          <div className="space-y-2">
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
