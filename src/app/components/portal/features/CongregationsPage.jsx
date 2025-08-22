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
  updateDoc,
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
  PencilLine,   // <-- novo
  X as XIcon,    // <-- novo
} from "lucide-react";

// ---------- Helpers ----------
const emptyCongForm = () => ({
  name: "",
  isDefault: false, // compatibilidade
  responsibles: [{ husband: "", wife: "" }],
});

const emptySupForm = () => ({
  primary: { husband: "", wife: "" },
  secondary: { husband: "", wife: "" },
});

function classNames(...s) {
  return s.filter(Boolean).join(" ");
}

// ---------- Main ----------
export default function CongregationsPage() {
  const [sectors, setSectors] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [formsCong, setFormsCong] = useState({}); // sectorId -> form nova congregação
  const [formsSup, setFormsSup] = useState({});  // sectorId -> form supervisores
  const [newSector, setNewSector] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // --- estado de edição de congregações existentes
  // chave = `${sectorId}:${congId}` -> { name, isDefault, responsibles[] }
  const [editMap, setEditMap] = useState({});
  const keyFromIds = (sectorId, congId) => `${sectorId}:${congId}`;

  const loadData = async () => {
    setLoading(true);
    const secQ = query(collection(db, "sectors"));
    const secSnap = await getDocs(secQ);

    // Bootstrap
    if (secSnap.empty) {
      const defaultSectorRef = await addDoc(collection(db, "sectors"), {
        name: "Setor 01",
        isDefault: true,
        supervisors: emptySupForm(),
      });
      await addDoc(
        collection(db, "sectors", defaultSectorRef.id, "congregations"),
        { name: "Matriz", isDefault: true, responsibles: [] }
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

    // Ordena: setor padrão primeiro; depois por nome
    data.sort((a, b) => {
      const da = (a.isDefault ? 0 : 1) - (b.isDefault ? 0 : 1);
      if (da !== 0) return da;
      return (a.name || "").localeCompare(b.name || "");
    });

    setSectors(data);

    // Expande e inicializa forms de supervisores
    const exp = {};
    const sup = {};
    data.forEach((s) => {
      exp[s.id] = true;
      sup[s.id] = {
        primary: {
          husband: s?.supervisors?.primary?.husband || "",
          wife: s?.supervisors?.primary?.wife || "",
        },
        secondary: {
          husband: s?.supervisors?.secondary?.husband || "",
          wife: s?.supervisors?.secondary?.wife || "",
        },
      };
    });
    setExpanded(exp);
    setFormsSup(sup);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---- Forms helpers (novo & supervisores)
  const updateCongForm = (sectorId, updater) => {
    setFormsCong((prev) => {
      const base = prev[sectorId] || emptyCongForm();
      return { ...prev, [sectorId]: updater(base) };
    });
  };

  const updateSupForm = (sectorId, updater) => {
    setFormsSup((prev) => {
      const base = prev[sectorId] || emptySupForm();
      return { ...prev, [sectorId]: updater(base) };
    });
  };

  // ---- Edição inline de congregações (NOVO)
  const startEditCong = (sectorId, cong) => {
    const k = keyFromIds(sectorId, cong.id);
    setEditMap((prev) => ({
      ...prev,
      [k]: {
        name: cong.name || "",
        isDefault: !!cong.isDefault,
        responsibles:
          Array.isArray(cong.responsibles) && cong.responsibles.length > 0
            ? cong.responsibles.map((r) => ({
                husband: r?.husband || "",
                wife: r?.wife || "",
              }))
            : [{ husband: "", wife: "" }],
      },
    }));
  };

  const cancelEditCong = (sectorId, congId) => {
    const k = keyFromIds(sectorId, congId);
    setEditMap((prev) => {
      const copy = { ...prev };
      delete copy[k];
      return copy;
    });
  };

  const updateEditCong = (sectorId, congId, updater) => {
    const k = keyFromIds(sectorId, congId);
    setEditMap((prev) => {
      const base = prev[k] || emptyCongForm();
      return { ...prev, [k]: updater(base) };
    });
  };

  const saveEditCong = async (sectorId, congId) => {
    const k = keyFromIds(sectorId, congId);
    const form = editMap[k];
    if (!form) return;

    const payload = {
      name: (form.name || "").trim(),
      isDefault: !!form.isDefault,
      responsibles: (form.responsibles || [])
        .filter((r) => (r.husband || "").trim() || (r.wife || "").trim())
        .map((r) => ({
          husband: (r.husband || "").trim(),
          wife: (r.wife || "").trim(),
        })),
    };

    await updateDoc(doc(db, "sectors", sectorId, "congregations", congId), payload);
    cancelEditCong(sectorId, congId);
    await loadData();
  };

  // ---- Actions
  const handleAddSector = async (e) => {
    e.preventDefault();
    const name = newSector.trim();
    if (!name) return;
    await addDoc(collection(db, "sectors"), {
      name,
      isDefault: false,
      supervisors: emptySupForm(),
    });
    setNewSector("");
    await loadData();
  };

  const handleSaveSupervisors = async (sectorId) => {
    const f = formsSup[sectorId] || emptySupForm();
    const payload = {
      supervisors: {
        primary: {
          husband: (f.primary?.husband || "").trim(),
          wife: (f.primary?.wife || "").trim(),
        },
        secondary: {
          husband: (f.secondary?.husband || "").trim(),
          wife: (f.secondary?.wife || "").trim(),
        },
      },
    };
    await updateDoc(doc(db, "sectors", sectorId), payload);
    await loadData();
  };

  const handleAddCongregation = async (sectorId) => {
    const form = formsCong[sectorId] || emptyCongForm();
    const name = (form.name || "").trim();
    if (!name) return;

    const payload = {
      name,
      isDefault: !!form.isDefault,
      responsibles: (form.responsibles || [])
        .filter((r) => (r.husband || "").trim() || (r.wife || "").trim())
        .map((r) => ({
          husband: (r.husband || "").trim(),
          wife: (r.wife || "").trim(),
        })),
    };

    await addDoc(collection(db, "sectors", sectorId, "congregations"), payload);
    setFormsCong((prev) => ({ ...prev, [sectorId]: emptyCongForm() }));
    await loadData();
  };

  const handleDeleteCongregation = async (sectorId, congregationId, name) => {
    const ok = window.confirm(`Excluir a congregação “${name}”? Essa ação não pode ser desfeita.`);
    if (!ok) return;
    await deleteDoc(doc(db, "sectors", sectorId, "congregations", congregationId));
    await loadData();
  };

  const handleDeleteSector = async (sector) => {
    const ok = window.confirm(
      `Excluir o setor “${sector.name}” e todas as suas congregações? Essa ação não pode ser desfeita.`
    );
    if (!ok) return;

    const congSnap = await getDocs(collection(db, "sectors", sector.id, "congregations"));
    const deletions = congSnap.docs.map((d) =>
      deleteDoc(doc(db, "sectors", sector.id, "congregations", d.id))
    );
    await Promise.all(deletions);
    await deleteDoc(doc(db, "sectors", sector.id));
    await loadData();
  };

  // ---- Busca
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
      {/* Bloco: Adicionar Setor */}
      <section className="mb-6 rounded-2xl border border-[#0f172b]/20 bg-[#0f172b]/5 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f172b]/10">
              <Layers3 className="h-5 w-5 text-[#0f172b]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Adicionar novo setor</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
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
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172b] md:w-72"
              placeholder="Nome do setor (ex.: Setor 02)"
              value={newSector}
              onChange={(e) => setNewSector(e.target.value)}
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0f172b] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1e293b]"
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
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172b]"
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
              {/* Supervisores do Setor */}
              <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Supervisores do setor</h4>

                {/* Supervisor 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 md:max-w-xl">
                  <input
                    className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
                    placeholder="Fulano"
                    value={formsSup[sector.id]?.primary?.husband || ""}
                    onChange={(e) =>
                      updateSupForm(sector.id, (f) => ({
                        ...f,
                        primary: { ...f.primary, husband: e.target.value },
                      }))
                    }
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 select-none">e</span>
                  <input
                    className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
                    placeholder="Sicrano"
                    value={formsSup[sector.id]?.primary?.wife || ""}
                    onChange={(e) =>
                      updateSupForm(sector.id, (f) => ({
                        ...f,
                        primary: { ...f.primary, wife: e.target.value },
                      }))
                    }
                  />
                </div>

                {/* Supervisor 2 */}
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 md:max-w-xl">
                  <input
                    className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
                    placeholder="Fulano"
                    value={formsSup[sector.id]?.secondary?.husband || ""}
                    onChange={(e) =>
                      updateSupForm(sector.id, (f) => ({
                        ...f,
                        secondary: { ...f.secondary, husband: e.target.value },
                      }))
                    }
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400 select-none">e</span>
                  <input
                    className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
                    placeholder="Sicrano"
                    value={formsSup[sector.id]?.secondary?.wife || ""}
                    onChange={(e) =>
                      updateSupForm(sector.id, (f) => ({
                        ...f,
                        secondary: { ...f.secondary, wife: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => handleSaveSupervisors(sector.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0f172b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1e293b]"
                    title="Salvar supervisores do setor"
                  >
                    <Save className="h-4 w-4" />
                    Salvar supervisores
                  </button>
                </div>

                {(sector.supervisors?.primary?.husband ||
                  sector.supervisors?.primary?.wife ||
                  sector.supervisors?.secondary?.husband ||
                  sector.supervisors?.secondary?.wife) && (
                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Atual:</span>{" "}
                      {[
                        [sector.supervisors?.primary?.husband, sector.supervisors?.primary?.wife]
                          .filter(Boolean)
                          .join(" e "),
                        [sector.supervisors?.secondary?.husband, sector.supervisors?.secondary?.wife]
                          .filter(Boolean)
                          .join(" e "),
                      ]
                        .filter((s) => s)
                        .join(" • ")}
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de congregações */}
              <ul className="space-y-2">
                {sector.congregations?.length ? (
                  sector.congregations.map((c) => {
                    const k = keyFromIds(sector.id, c.id);
                    const isEditing = !!editMap[k];

                    return (
                      <li
                        key={c.id}
                        className="rounded-lg border border-slate-200 bg-white dark:bg-slate-800 px-3 py-2 hover:border-slate-300 dark:border-slate-600"
                      >
                        {!isEditing ? (
                          // --------- VISUALIZAÇÃO ----------
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

                              {Array.isArray(c.responsibles) && c.responsibles.length > 0 && (
                                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                  {c.responsibles
                                    .map((r) => [r?.husband, r?.wife].filter(Boolean).join(" e "))
                                    .join(" • ")}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {Array.isArray(c.responsibles) && c.responsibles.length > 0 && (
                                <div className="flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                  <Users className="h-3.5 w-3.5" />
                                  {c.responsibles.length} responsáveis
                                </div>
                              )}

                              {/* editar */}
                              <button
                                type="button"
                                onClick={() => startEditCong(sector.id, c)}
                                className="inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800"
                                title="Editar congregação"
                              >
                                <PencilLine className="h-4 w-4" />
                              </button>

                              {/* excluir */}
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
                        ) : (
                          // --------- EDIÇÃO ----------
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                              <input
                                className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
                                placeholder="Nome da congregação"
                                value={editMap[k].name}
                                onChange={(e) =>
                                  updateEditCong(sector.id, c.id, (f) => ({
                                    ...f,
                                    name: e.target.value,
                                  }))
                                }
                              />
                              <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#0f172b] focus:ring-[#0f172b]"
                                  checked={!!editMap[k].isDefault}
                                  onChange={(e) =>
                                    updateEditCong(sector.id, c.id, (f) => ({
                                      ...f,
                                      isDefault: e.target.checked,
                                    }))
                                  }
                                />
                                Marcar como padrão do setor
                              </label>
                            </div>

                            {editMap[k].responsibles.map((r, idx) => (
                              <div
                                key={idx}
                                className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] items-center gap-2 md:max-w-3xl"
                              >
                                <input
                                  className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
                                  placeholder={`Responsável ${idx + 1} — Fulano`}
                                  value={r.husband}
                                  onChange={(e) =>
                                    updateEditCong(sector.id, c.id, (f) => {
                                      const rs = [...f.responsibles];
                                      rs[idx] = { ...rs[idx], husband: e.target.value };
                                      return { ...f, responsibles: rs };
                                    })
                                  }
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400 select-none">e</span>
                                <input
                                  className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
                                  placeholder={`Responsável ${idx + 1} — Sicrano`}
                                  value={r.wife}
                                  onChange={(e) =>
                                    updateEditCong(sector.id, c.id, (f) => {
                                      const rs = [...f.responsibles];
                                      rs[idx] = { ...rs[idx], wife: e.target.value };
                                      return { ...f, responsibles: rs };
                                    })
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateEditCong(sector.id, c.id, (f) => {
                                      const rs = [...f.responsibles];
                                      rs.splice(idx, 1);
                                      return {
                                        ...f,
                                        responsibles: rs.length ? rs : [{ husband: "", wife: "" }],
                                      };
                                    })
                                  }
                                  className="inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800"
                                  title="Remover responsável"
                                >
                                  <XIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ))}

                            <div className="flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                className="text-sm font-medium text-[#0f172b] hover:underline"
                                onClick={() =>
                                  updateEditCong(sector.id, c.id, (f) => ({
                                    ...f,
                                    responsibles: [
                                      ...(f.responsibles || []),
                                      { husband: "", wife: "" },
                                    ],
                                  }))
                                }
                              >
                                + Adicionar responsável
                              </button>

                              <div className="ml-auto flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => cancelEditCong(sector.id, c.id)}
                                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800"
                                  title="Cancelar"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => saveEditCong(sector.id, c.id)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-[#0f172b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1e293b]"
                                  title="Salvar alterações"
                                >
                                  <Save className="h-4 w-4" />
                                  Salvar alterações
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })
                ) : (
                  <li className="text-sm text-slate-500 dark:text-slate-400">Nenhuma congregação cadastrada.</li>
                )}
              </ul>

              {/* Formulário de nova congregação (APENAS responsáveis) */}
              <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
                <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Nova congregação em <span className="text-slate-900 dark:text-slate-100">{sector.name}</span>
                </h4>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input
                    className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
                    placeholder="Nome da congregação"
                    value={formsCong[sector.id]?.name || ""}
                    onChange={(e) =>
                      updateCongForm(sector.id, (f) => ({ ...f, name: e.target.value }))
                    }
                  />
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#0f172b] focus:ring-[#0f172b]"
                      checked={formsCong[sector.id]?.isDefault || false}
                      onChange={(e) =>
                        updateCongForm(sector.id, (f) => ({ ...f, isDefault: e.target.checked }))
                      }
                    />
                    Marcar como padrão do setor
                  </label>
                </div>

                {(formsCong[sector.id]?.responsibles || [{ husband: "", wife: "" }]).map(
                  (r, idx) => (
                    <div key={idx} className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2 md:max-w-xl">
                      <input
                        className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
                        placeholder={`Responsável ${idx + 1} — Fulano`}
                        value={r.husband}
                        onChange={(e) =>
                          updateCongForm(sector.id, (f) => {
                            const rs = [...(f.responsibles || [{ husband: "", wife: "" }])];
                            rs[idx] = { ...rs[idx], husband: e.target.value };
                            return { ...f, responsibles: rs };
                          })
                        }
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400 select-none">e</span>
                      <input
                        className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
                        placeholder={`Responsável ${idx + 1} — Sicrano`}
                        value={r.wife}
                        onChange={(e) =>
                          updateCongForm(sector.id, (f) => {
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
                    className="text-sm font-medium text-[#0f172b] hover:underline"
                    onClick={() =>
                      updateCongForm(sector.id, (f) => ({
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
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0f172b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1e293b]"
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
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <header
        className={classNames(
          "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3",
          expanded ? "bg-slate-50 dark:bg-slate-800" : "bg-white dark:bg-slate-800"
        )}
      >
        <button
          onClick={onToggle}
          className="flex min-w-0 items-center gap-3"
          title={expanded ? "Recolher setor" : "Expandir setor"}
        >
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          )}
          <div className="min-w-0 text-left">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                {sector.name}
              </h3>
              {sector.isDefault && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                  <Star className="h-3 w-3" />
                  Padrão
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {count} {count === 1 ? "congregação" : "congregações"}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
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
    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-10 text-center">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Nada encontrado</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Tente limpar o filtro de busca ou adicionar um novo setor/congregação.
      </p>
      <button
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0f172b] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e293b]"
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
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="mb-3 h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-10 rounded bg-slate-100 dark:bg-slate-700" />
            <div className="h-10 rounded bg-slate-100 dark:bg-slate-700" />
            <div className="h-10 rounded bg-slate-100 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
