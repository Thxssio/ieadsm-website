"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import PageContent from "@/components/portal/ui/PageContent";
import { db } from "@/lib/firebase/client";
import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { maskCPF } from "@/lib/utils/cpf";
import {
  Users,
  Search,
  UserCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  Fingerprint,
  SortAsc,
  SortDesc,
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
  for (let i = 0; i < String(str).length; i++) hash = String(str).charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h} 70% 40%)`;
};

const shimmer = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent";

/* ===================== UI Bits ===================== */
const Stat = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/60 p-3 shadow-sm">
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900/5">
      <Icon className="h-5 w-5 text-slate-700" />
    </div>
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-800">{value}</div>
    </div>
  </div>
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
  const [sort, setSort] = useState("name-asc"); // name-asc | name-desc | size-asc | size-desc
  const [openIds, setOpenIds] = useState(() => new Set());

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
        // Order families by a friendly field if it exists; fallback to ID
        const famSnap = await getDocs(query(collection(db, "families")));

        const familiesData = await Promise.all(
          famSnap.docs.map(async (fDoc) => {
            const membersSnap = await getDocs(collection(db, "families", fDoc.id, "members"));
            const members = await Promise.all(
              membersSnap.docs.map(async (m) => {
                const uRef = doc(db, "users", m.id);
                const uSnap = await getDoc(uRef);
                return { id: m.id, ...(uSnap.exists() ? uSnap.data() : {}), _rawMember: m.data?.() };
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

    const cmp = {
      "name-asc": (a, b) => norm(a.familyName || a.name || a.id).localeCompare(norm(b.familyName || b.name || b.id)),
      "name-desc": (a, b) => -cmp["name-asc"](a, b),
      "size-asc": (a, b) => (a.members?.length || 0) - (b.members?.length || 0),
      "size-desc": (a, b) => -cmp["size-asc"](a, b),
    }[sort];

    return [...list].sort(cmp);
  }, [families, qText, minMembers, sort]);

  const totals = useMemo(() => {
    const totalFamilies = families.length;
    const totalPeople = families.reduce((acc, f) => acc + (f.members?.length || 0), 0);
    const avg = totalFamilies ? Math.round((totalPeople / totalFamilies) * 10) / 10 : 0;
    return { totalFamilies, totalPeople, avg };
  }, [families]);

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
      {/* Controls */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Famílias" value={totals.totalFamilies} icon={Users} />
        <Stat label="Pessoas" value={totals.totalPeople} icon={UserCircle2} />
        <Stat label="Média por família" value={totals.avg} icon={Fingerprint} />
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/60 p-3 shadow-sm">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="Buscar por nome, CPF, membro..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-600">Mín. membros</label>
        <input
          type="number"
          min={0}
          value={minMembers}
          onChange={(e) => setMinMembers(e.target.value)}
          className="h-9 w-24 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-slate-600">Ordenar:</span>
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
          {sort.includes("asc") ? <SortAsc className="h-4 w-4 text-slate-500" /> : <SortDesc className="h-4 w-4 text-slate-500" />}
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800"
          >
            <AlertTriangle className="h-5 w-5" />
            <div className="text-sm">{error}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
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
            />
          ))}
        </motion.div>
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

function FamilyCard({ fam, open, onToggle }) {
  const title = fam.familyName || fam.name || `Família ${fam.id}`;
  const memberCount = fam.members?.length || 0;
  const responsible = fam.responsibleName || fam.responsibleCpf;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      {/* Accent */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-slate-900/[0.03] to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="mb-4 flex items-start gap-3">
        <div
          className="grid h-12 w-12 select-none place-items-center rounded-xl text-white"
          style={{ background: stringToHsl(title) }}
          title={title}
        >
          {getInitials(title)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-semibold text-slate-800">{title}</div>
          {responsible && (
            <div className="mt-0.5 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
              <span className="font-medium">Responsável:</span>
              <span className="text-slate-700">{responsible}</span>
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

      <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
          {memberCount} membro{memberCount === 1 ? "" : "s"}
        </span>
        {fam.responsibleCpf && (
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
            CPF: {fam.responsibleCpf}
          </span>
        )}
        {fam.createdAt && (
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
            Criada em {formatMaybeDate(fam.createdAt)}
          </span>
        )}
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
                {fam.members.map((m) => (
                  <li
                    key={m.id}
                    className="group relative flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-800"
                  >
                    <span
                      className="grid h-7 w-7 select-none place-items-center rounded-full text-xs font-semibold text-white"
                      style={{ background: stringToHsl(m.displayName || m.name || m.id) }}
                    >
                      {getInitials(m.displayName || m.name || m.id)}
                    </span>
                    <span className="max-w-[18ch] truncate">
                      {m.displayName || m.name || m.id}
                    </span>
                    <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-64 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-lg group-hover:block">
                      {(m.photoURL || m.photoUrl) && (
                        <img
                          src={m.photoURL || m.photoUrl}
                          alt={m.displayName || m.name || m.id}
                          className="mx-auto mb-2 h-16 w-16 rounded-full object-cover"
                        />
                      )}
                      <div className="font-semibold text-center text-slate-800">
                        {m.displayName || m.name || m.id}
                      </div>
                      {m.email && <div className="truncate text-center">{m.email}</div>}
                      {m.cpf && <div className="text-center">CPF: {maskCPF(m.cpf)}</div>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ===================== Utils ===================== */
function formatMaybeDate(val) {
  try {
    // Supports Firestore Timestamp (has toDate) or ISO string/number
    if (val?.toDate) return new Intl.DateTimeFormat("pt-BR").format(val.toDate());
    const d = new Date(val);
    if (!isNaN(d)) return new Intl.DateTimeFormat("pt-BR").format(d);
  } catch {}
  return "—";
}
