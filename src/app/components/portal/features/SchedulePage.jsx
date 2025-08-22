"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import PageContent from "@/components/portal/ui/PageContent";
import {
  Hand,
  Users,
  BookOpen,
  Star,
  BookMarked,
  Radio,
  CalendarDays,
  Trash2 as TrashIcon,
  Plus,
  Search,
  Edit3,
  X,
  Info,
} from "lucide-react";

/* ===================== Constantes / Helpers ===================== */
const weekDays = [
  { label: "Domingo", value: "1" },
  { label: "Segunda-feira", value: "2" },
  { label: "Terça-feira", value: "3" },
  { label: "Quarta-feira", value: "4" },
  { label: "Quinta-feira", value: "5" },
  { label: "Sexta-feira", value: "6" },
  { label: "Sábado", value: "7" },
];

const iconOptions = [
  { value: "worship", label: "Culto/Evento Padrão" },
  { value: "prayer", label: "Oração" },
  { value: "study", label: "Ensino" },
  { value: "ebd", label: "EBD" },
  { value: "youth", label: "Jovens/Adolescentes" },
  { value: "broadcast", label: "Programa/Transmissão" },
  { value: "victory", label: "Vitória/Campanha" },
];

const iconMap = {
  prayer: <Hand className="size-5" />,
  study: <BookOpen className="size-5" />,
  youth: <Users className="size-5" />,
  broadcast: <Radio className="size-5" />,
  worship: <CalendarDays className="size-5" />,
  victory: <Star className="size-5" />,
  ebd: <BookMarked className="size-5" />,
};

const getDayLabel = (value) =>
  (weekDays.find((d) => d.value === String(value)) || {}).label || "";

/* ===================== UI Primitivos ===================== */
function Badge({ children, className = "" }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium " +
        "border-slate-200 bg-slate-50 text-slate-700 " +
        className
      }
    >
      {children}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-12 w-full animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-8 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
      >
        <div className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white shadow-lg">
          <Info className="size-4" />
          <span className="text-sm">{message}</span>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-white/10 focus:outline-none"
          >
            <X className="size-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ConfirmDialog({ open, title, description, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Modal de Formulário ===================== */
function ScheduleFormModal({ isOpen, onClose, onSave, currentItem }) {
  const initialFormState = useMemo(
    () => ({
      dayOfWeek: "1",
      time: "",
      title: "",
      description: "",
      icon: "worship",
    }),
    []
  );
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (currentItem) setFormData(currentItem);
    else setFormData(initialFormState);
  }, [currentItem, initialFormState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Máscara simples HH:MM
    if (name === "time") {
      const onlyDigits = value.replace(/[^\d]/g, "").slice(0, 4);
      const hh = onlyDigits.slice(0, 2);
      const mm = onlyDigits.slice(2, 4);
      const masked = [hh, mm].filter(Boolean).join(":");
      setFormData((p) => ({ ...p, time: masked }));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-xl font-bold text-slate-900">
            {currentItem?.id ? "Editar Horário" : "Adicionar Horário"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Dia da semana</span>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
                required
              >
                {weekDays.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Tipo / Ícone</span>
              <select
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
                required
              >
                <option value="" disabled>
                  Selecione
                </option>
                {iconOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Horário</span>
              <input
                type="text"
                name="time"
                inputMode="numeric"
                value={formData.time}
                onChange={handleChange}
                placeholder="19:45"
                pattern="\d{2}:\d{2}"
                title="Use HH:MM (24h)"
                maxLength={5}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">Nome</span>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nome do culto/evento"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
                required
              />
            </label>

            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">
                Descrição (opcional)
              </span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Breve descrição"
                className="resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
              />
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#2a3d57] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#223349]"
            >
              Salvar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ===================== Seção por Dia ===================== */
function DaySection({ dayValue, items, onEdit, onDelete }) {
  if (!items?.length) return null;

  return (
    <section className="space-y-3">
      <div className="sticky top-0 z-10 -mx-4 bg-gradient-to-b from-white/80 to-white/40 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-xl">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {getDayLabel(dayValue)}
        </h4>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                {iconMap[item.icon] || <CalendarDays className="size-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="truncate text-base font-semibold text-slate-900">
                    {item.title}
                  </h5>
                  <Badge>{item.time}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  {item.description || "—"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => onEdit(item)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Edit3 className="size-4" />
                Editar
              </button>
              <button
                onClick={() => onDelete(item)}
                className="rounded-xl p-2 text-rose-600 hover:bg-rose-50"
                title="Excluir"
              >
                <TrashIcon className="size-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ===================== Página Principal ===================== */
export default function SchedulePage() {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  // Filtros / busca
  const [qText, setQText] = useState("");
  const [qDay, setQDay] = useState("all");

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const scheduleCollection = collection(db, "schedule");
      const q = query(
        scheduleCollection,
        orderBy("dayOfWeek"),
        orderBy("time")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setScheduleItems(list);
    } catch (e) {
      console.error("Erro ao buscar programação:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleOpenModal = (item = null) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setCurrentItem(null);
    setIsModalOpen(false);
  };

  const handleSave = async (formData) => {
    try {
      if (formData.id) {
        await updateDoc(doc(db, "schedule", formData.id), formData);
        setToast("Horário atualizado!");
      } else {
        await addDoc(collection(db, "schedule"), formData);
        setToast("Horário adicionado!");
      }
      handleCloseModal();
      fetchSchedule();
    } catch (e) {
      console.error("Erro ao salvar:", e);
      setToast("Falha ao salvar. Tente novamente.");
    }
  };

  const handleDeleteClick = (item) => setConfirmTarget(item);
  const handleCancelDelete = () => setConfirmTarget(null);
  const handleConfirmDelete = async () => {
    const itemId = confirmTarget?.id;
    if (!itemId) return;
    try {
      await deleteDoc(doc(db, "schedule", itemId));
      setToast("Horário excluído!");
      fetchSchedule();
    } catch (e) {
      console.error("Erro ao excluir:", e);
      setToast("Falha ao excluir. Tente novamente.");
    } finally {
      setConfirmTarget(null);
    }
  };

  // Agrupamento por dia + filtros
  const filtered = useMemo(() => {
    const text = qText.trim().toLowerCase();
    return scheduleItems.filter((it) => {
      const passDay = qDay === "all" || String(it.dayOfWeek) === qDay;
      const passText =
        !text ||
        [it.title, it.description, getDayLabel(it.dayOfWeek), it.time]
          .filter(Boolean)
          .some((s) => String(s).toLowerCase().includes(text));
      return passDay && passText;
    });
  }, [scheduleItems, qText, qDay]);

  const grouped = useMemo(() => {
    const g = {};
    for (const d of weekDays) g[d.value] = [];
    for (const it of filtered) {
      const key = String(it.dayOfWeek);
      if (!g[key]) g[key] = [];
      g[key].push(it);
    }
    return g;
  }, [filtered]);

  return (
    <PageContent title="Gerenciar Programação Semanal">
      {/* Barra de Ações */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="Buscar por nome, descrição, dia ou horário…"
              className="w-full rounded-xl border border-slate-300 bg-white px-9 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={qDay}
              onChange={(e) => setQDay(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2a3d57] sm:w-56"
            >
              <option value="all">Todos os dias</option>
              {weekDays.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            {qText || qDay !== "all" ? (
              <button
                onClick={() => {
                  setQText("");
                  setQDay("all");
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Limpar filtros
              </button>
            ) : null}
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2a3d57] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#223349]"
        >
          <Plus className="size-4" />
          Adicionar Horário
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-white text-slate-400 shadow">
            <CalendarDays className="size-6" />
          </div>
          <h4 className="text-lg font-semibold text-slate-800">
            Nada por aqui…
          </h4>
          <p className="mt-1 max-w-md text-sm text-slate-600">
            Cadastre o primeiro horário ou ajuste os filtros de busca.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2a3d57] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#223349]"
          >
            <Plus className="size-4" />
            Novo horário
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {weekDays.map((d) => (
            <DaySection
              key={d.value}
              dayValue={d.value}
              items={grouped[d.value]}
              onEdit={handleOpenModal}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Modais */}
      <ScheduleFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        currentItem={currentItem}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        title="Excluir horário?"
        description={`Tem certeza que deseja excluir "${confirmTarget?.title}" de ${getDayLabel(
          confirmTarget?.dayOfWeek
        )} às ${confirmTarget?.time}? Essa ação não poderá ser desfeita.`}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast */}
      <Toast message={toast} onClose={() => setToast("")} />
    </PageContent>
  );
}
