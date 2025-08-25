"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import PageContent from "@/components/portal/ui/PageContent";
import { db } from "@/lib/firebase/client";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { maskCPF } from "@/lib/utils/cpf";
import {
  Users,
  Search,
  UserCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Fingerprint,
  SortAsc,
  SortDesc,
  X,
  Filter,
  Grid3X3,
  Rows,
} from "lucide-react";

/* ===================== Helpers ===================== */
const getInitials = (name = "") => {
  const n = String(name || "?").trim();
  if (!n) return "?";
  const parts = n.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "?";
};

const stringToHsl = (str) => {
  let hash = 0;
  for (let i = 0; i < String(str).length; i++)
    hash = String(str).charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h} 70% 40%)`;
};

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent";

/* ===================== UI Bits ===================== */
const Stat = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 p-3 shadow-sm">
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900/5">
      <Icon className="h-5 w-5 text-slate-700" />
    </div>
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-800">{value}</div>
    </div>
  </div>
);

const Chip = ({ children, onClear }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">
    {children}
    {onClear && (
      <button
        onClick={onClear}
        className="rounded p-0.5 text-slate-500 hover:bg-slate-100"
        aria-label="Limpar"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}
  </span>
);

const SkeletonCard = () => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${shimmer}`}>
    <div className="mb-4 h-6 w-48 rounded bg-slate-200/70" />
    <div className="mb-2 h-4 w-72 rounded bg-slate-200/70" />
    <div className="mb-2 h-4 w-60 rounded bg-slate-200/70" />
    <div className="mt-4 flex flex-wrap gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-8 w-24 rounded-full bg-slate-200/70" />
      ))}
    </div>
  </div>
);

/* ===================== Main ===================== */
export default function FamiliesPage() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [qText, setQText] = useState("");
  const [minMembers, setMinMembers] = useState(0);
  const [sort, setSort] = useState("name-asc"); // "name-asc" | "name-desc" | "size-asc" | "size-desc"
  const [openIds, setOpenIds] = useState(() => new Set());
  const [view, setView] = useState("grid"); // "grid" | "list"

  const toggleOpen = useCallback((id) => {
    setOpenIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const famSnap = await getDocs(query(collection(db, "families")));
        const familiesData = await Promise.all(
          famSnap.docs.map(async (fDoc) => {
            const membersSnap = await getDocs(collection(db, "families", fDoc.id, "members"));
            const members = await Promise.all(
              membersSnap.docs.map(async (m) => {
                const uRef = doc(db, "users", m.id);
                const uSnap = await getDoc(uRef);
                return {
                  id: m.id,
                  ...(uSnap.exists() ? uSnap.data() : {}),
                  _rawMember: m.data?.(),
                };
              })
            );
            return { id: fDoc.id, ...fDoc.data(), members };
          })
        );
        setFamilies(familiesData);
      } catch (e) {
        console.error("Erro ao carregar famílias:", e);
        setError("Não foi possível carregar as famílias agora. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const norm = (s) => String(s || "").toLowerCase();
    let list = families.filter((f) => {
      const alvo = [f.name, f.familyName, f.id, f.responsibleCpf, f.responsibleName]
        .concat(f.members?.map((m) => m.displayName || m.name || m.id) || [])
        .map(norm)
        .join(" ");
      const okText = norm(alvo).includes(norm(qText));
      const okMin = (f.members?.length || 0) >= Number(minMembers || 0);
      return okText && okMin;
    });

    const cmp =
      {
        "name-asc": (a, b) =>
          norm(a.familyName || a.name || a.id).localeCompare(norm(b.familyName || b.name || b.id)),
        "name-desc": (a, b) =>
          -norm(a.familyName || a.name || a.id).localeCompare(norm(b.familyName || b.name || b.id)),
        "size-asc": (a, b) => (a.members?.length || 0) - (b.members?.length || 0),
        "size-desc": (a, b) => (b.members?.length || 0) - (a.members?.length || 0),
      }[sort] || ((a, b) => 0);

    return [...list].sort(cmp);
  }, [families, qText, minMembers, sort]);

  const totals = useMemo(() => {
    const totalFamilies = families.length;
    const totalPeople = families.reduce((acc, f) => acc + (f.members?.length || 0), 0);
    const avg = totalFamilies ? Math.round((totalPeople / totalFamilies) * 10) / 10 : 0;
    return { totalFamilies, totalPeople, avg };
  }, [families]);

  const hasActiveFilters = !!qText || Number(minMembers) > 0 || sort !== "name-asc";

  return (
    <PageContent
      title={
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-slate-700" />
          <span>Famílias</span>
        </div>
      }
      description="Visualize e navegue pelas famílias cadastradas. Pesquise, ordene e expanda para ver os membros."
    >
      {/* Top Stats */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Famílias" value={totals.totalFamilies} icon={Users} />
        <Stat label="Pessoas" value={totals.totalPeople} icon={UserCircle2} />
        <Stat label="Média por família" value={totals.avg} icon={Fingerprint} />
        {/* View Toggle */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 p-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="h-4 w-4" />
            Exibição
          </div>
          <div className="inline-flex overflow-hidden rounded-xl border border-slate-200">
            <button
              onClick={() => setView("grid")}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm ${view === "grid" ? "bg-slate-900/5 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
              aria-pressed={view === "grid"}
            >
              <Grid3X3 className="h-4 w-4" /> Grade
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm ${view === "list" ? "bg-slate-900/5 text-slate-900" : "text-slate-600 hover:bg-slate-50"}`}
              aria-pressed={view === "list"}
            >
              <Rows className="h-4 w-4" /> Lista
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 bg-gradient-to-b from-white/90 to-white/60 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:border-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="Buscar por nome, CPF ou membro…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-slate-600">Mín. membros</label>
            <input
              type="number"
              min={0}
              value={minMembers}
              onChange={(e) => setMinMembers(e.target.value)}
              className="h-9 w-24 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Ordenar</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="name-asc">Nome (A → Z)</option>
                <option value="name-desc">Nome (Z → A)</option>
                <option value="size-asc">Tamanho (menor)</option>
                <option value="size-desc">Tamanho (maior)</option>
              </select>
              {`${sort}`.includes("asc") ? (
                <SortAsc className="h-4 w-4 text-slate-500" />
              ) : (
                <SortDesc className="h-4 w-4 text-slate-500" />
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setQText("");
                  setMinMembers(0);
                  setSort("name-asc");
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Chips de filtros ativos */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {!!qText && <Chip onClear={() => setQText("")}>Busca: “{qText}”</Chip>}
            {Number(minMembers) > 0 && (
              <Chip onClear={() => setMinMembers(0)}>Mín. membros: {minMembers}</Chip>
            )}
            {sort !== "name-asc" && (
              <Chip onClear={() => setSort("name-asc")}>
                Ordenação: {sort.replace("-", " ").toUpperCase()}
              </Chip>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800"
          >
            <AlertTriangle className="h-5 w-5" />
            <div className="text-sm">{error}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading ? (
        <div className={`grid gap-4 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : view === "grid" ? (
        <motion.div
          layout
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {filtered.map((fam) => (
            <FamilyCard
              key={fam.id}
              fam={fam}
              open={openIds.has(fam.id)}
              onToggle={() => toggleOpen(fam.id)}
              qText={qText}
            />
          ))}
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((fam) => (
            <FamilyRow
              key={fam.id}
              fam={fam}
              open={openIds.has(fam.id)}
              onToggle={() => toggleOpen(fam.id)}
              qText={qText}
            />
          ))}
        </div>
      )}
    </PageContent>
  );
}

/* ===================== Subcomponents ===================== */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"
    >
      <div className="mb-2 text-4xl">👨‍👩‍👧‍👦</div>
      <div className="text-lg font-semibold text-slate-800">Nenhuma família encontrada</div>
      <div className="text-sm text-slate-600">Ajuste os filtros ou tente outra busca.</div>
    </motion.div>
  );
}

function FamilyCard({ fam, open, onToggle, qText }) {
  const title = fam.familyName || fam.name || `Família ${fam.id}`;
  const memberCount = fam.members?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      // card é um grupo isolado
      className="group/card relative overflow-visible rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      {/* Accent arredondado */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 rounded-t-2xl bg-gradient-to-b from-slate-900/[0.04] to-transparent opacity-0 transition group-hover/card:opacity-100" />

      <div className="mb-4 flex items-start gap-3">
        <div
          className="grid h-12 w-12 select-none place-items-center rounded-xl text-white"
          style={{ background: stringToHsl(title) }}
          title={title}
        >
          {getInitials(title)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-slate-800">
            {highlight(title, qText)}
          </div>

          {memberCount > 0 && (
            <div className="mt-1 flex -space-x-2">
              {fam.members.slice(0, 5).map((m) => {
                const avatar = m.photoURL || m.photoUrl;
                return avatar ? (
                  <img
                    key={m.id}
                    src={avatar}
                    alt={m.displayName || m.name || m.id}
                    className="h-6 w-6 rounded-full object-cover ring-2 ring-white"
                    title={m.displayName || m.name || m.id}
                  />
                ) : (
                  <span
                    key={m.id}
                    className="grid h-6 w-6 select-none place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-white"
                    style={{ background: stringToHsl(m.displayName || m.name || m.id) }}
                    title={m.displayName || m.name || m.id}
                  >
                    {getInitials(m.displayName || m.name || m.id)}
                  </span>
                );
              })}
              {memberCount > 5 && (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700 ring-2 ring-white">
                  +{memberCount - 5}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          {open ? (
            <>
              <ChevronUp className="h-4 w-4" /> Recolher
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" /> Ver membros
            </>
          )}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <Badge>{memberCount} membro{memberCount === 1 ? "" : "s"}</Badge>
        {fam.responsibleCpf && <Badge>CPF: {maskCPF(String(fam.responsibleCpf))}</Badge>}
        {fam.responsibleName && <Badge>Responsável: {highlight(fam.responsibleName, qText)}</Badge>}
        {fam.createdAt && <Badge>Criada em {formatMaybeDate(fam.createdAt)}</Badge>}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="members"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="border-t border-slate-200 pt-4"
          >
            {memberCount === 0 ? (
              <div className="text-sm text-slate-600">Nenhum membro vinculado.</div>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {fam.members.map((m) => {
                  const avatar = m.photoURL || m.photoUrl;
                  return (
                    <li
                      key={m.id}
                      // grupo do item
                      className="group/member relative flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800"
                    >
                      {/* Avatar com foto se existir */}
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={m.displayName || m.name || m.id}
                          className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-300"
                        />
                      ) : (
                        <span
                          className="grid h-7 w-7 select-none place-items-center rounded-full text-xs font-semibold text-white"
                          style={{ background: stringToHsl(m.displayName || m.name || m.id) }}
                        >
                          {getInitials(m.displayName || m.name || m.id)}
                        </span>
                      )}

                      <span className="max-w-[22ch] truncate">
                        {highlight(m.displayName || m.name || m.id, qText)}
                      </span>

                      {/* Tooltip controlado pelo hover do item */}
                      <div
                        className="
                          absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2
                          rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-xl
                          opacity-0 translate-y-1 scale-95 pointer-events-none
                          group-hover/member:opacity-100 group-hover/member:translate-y-0 group-hover/member:scale-100 group-hover/member:pointer-events-auto
                          transition-all duration-150
                          after:content-[''] after:absolute after:-top-2 after:left-1/2 after:-translate-x-1/2
                          after:border-8 after:border-transparent after:border-b-white
                        "
                      >
                        {avatar && (
                          <img
                            src={avatar}
                            alt={m.displayName || m.name || m.id}
                            className="mx-auto mb-2 h-16 w-16 rounded-full object-cover"
                          />
                        )}
                        <div className="text-center font-semibold text-slate-800 break-words">
                          {m.displayName || m.name || m.id}
                        </div>
                        {m.email && <div className="truncate text-center">{m.email}</div>}
                        {m.cpf && <div className="text-center">CPF: {maskCPF(m.cpf)}</div>}
                        {m.birthDate && (
                          <div className="text-center">Idade: {calcAge(m.birthDate)} anos</div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FamilyRow({ fam, open, onToggle, qText }) {
  const title = fam.familyName || fam.name || `Família ${fam.id}`;
  const memberCount = fam.members?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-visible"
    >
      <div className="flex items-start gap-3">
        <div
          className="grid h-10 w-10 select-none place-items-center rounded-lg text-white"
          style={{ background: stringToHsl(title) }}
        >
          {getInitials(title)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-base font-semibold text-slate-800">
              {highlight(title, qText)}
            </h4>
            <Badge>{memberCount} membro{memberCount === 1 ? "" : "s"}</Badge>
            {fam.responsibleName && <Badge>Resp.: {highlight(fam.responsibleName, qText)}</Badge>}
            {fam.responsibleCpf && <Badge>CPF: {maskCPF(String(fam.responsibleCpf))}</Badge>}
            {fam.createdAt && <Badge>{formatMaybeDate(fam.createdAt)}</Badge>}
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="members-row"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3"
              >
                {memberCount === 0 ? (
                  <div className="text-sm text-slate-600">Nenhum membro vinculado.</div>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {fam.members.map((m) => {
                      const avatar = m.photoURL || m.photoUrl;
                      return (
                        <li
                          key={m.id}
                          className="group/member relative flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800"
                        >
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={m.displayName || m.name || m.id}
                              className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-300"
                            />
                          ) : (
                            <span
                              className="grid h-7 w-7 select-none place-items-center rounded-full text-xs font-semibold text-white"
                              style={{ background: stringToHsl(m.displayName || m.name || m.id) }}
                            >
                              {getInitials(m.displayName || m.name || m.id)}
                            </span>
                          )}

                          <span className="max-w-[28ch] truncate">
                            {highlight(m.displayName || m.name || m.id, qText)}
                          </span>

                          <div
                            className="
                              absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2
                              rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-xl
                              opacity-0 translate-y-1 scale-95 pointer-events-none
                              group-hover/member:opacity-100 group-hover/member:translate-y-0 group-hover/member:scale-100 group-hover/member:pointer-events-auto
                              transition-all duration-150
                              after:content-[''] after:absolute after:-top-2 after:left-1/2 after:-translate-x-1/2
                              after:border-8 after:border-transparent after:border-b-white
                            "
                          >
                            {avatar && (
                              <img
                                src={avatar}
                                alt={m.displayName || m.name || m.id}
                                className="mx-auto mb-2 h-16 w-16 rounded-full object-cover"
                              />
                            )}
                            <div className="text-center font-semibold text-slate-800 break-words">
                              {m.displayName || m.name || m.id}
                            </div>
                            {m.email && <div className="truncate text-center">{m.email}</div>}
                            {m.cpf && <div className="text-center">CPF: {maskCPF(m.cpf)}</div>}
                            {m.birthDate && (
                              <div className="text-center">Idade: {calcAge(m.birthDate)} anos</div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onToggle}
          className="ml-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          {open ? (
            <>
              <ChevronUp className="h-4 w-4" /> Recolher
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" /> Ver membros
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* ===================== Small UI ===================== */
function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

/* ===================== Utils ===================== */
function formatMaybeDate(val) {
  try {
    if (val?.toDate) return new Intl.DateTimeFormat("pt-BR").format(val.toDate());
    const d = new Date(val);
    if (!isNaN(d)) return new Intl.DateTimeFormat("pt-BR").format(d);
  } catch {}
  return "—";
}

/** Destaque simples do termo buscado usando <mark>. */
function highlight(text, query) {
  if (!query) return text;
  try {
    const parts = String(text).split(new RegExp(`(${escapeRegExp(query)})`, "ig"));
    return (
      <>
        {parts.map((p, i) =>
          p.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="rounded bg-yellow-200/60 px-0.5">
              {p}
            </mark>
          ) : (
            <React.Fragment key={i}>{p}</React.Fragment>
          )
        )}
      </>
    );
  } catch {
    return text;
  }
}
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Calcula idade a partir de Date, ISO string ou Timestamp do Firestore */
function calcAge(birth) {
  try {
    const d = birth?.toDate ? birth.toDate() : new Date(birth);
    if (isNaN(d)) return "—";
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  } catch {
    return "—";
  }
}
