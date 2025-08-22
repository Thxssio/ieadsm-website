"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { db, storage } from "@/lib/firebase/client";
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
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  XCircle,
  Image as ImageIcon,
  Users as UsersIcon,
  CalendarClock,
  Pencil,
  Trash2,
} from "lucide-react";
import PageContent from "@/components/portal/ui/PageContent";
import ConfirmationModal from "@/components/portal/ui/ConfirmationModal";
import { useHasRole } from "@/hooks/useClaims";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

/* Converte/Redimensiona imagem para WEBP (no navegador) */
async function fileToWebp(file, opts = {}) {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = opts;
  const blobUrl = URL.createObjectURL(file);

  const loadImg = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const toWebpFromCanvas = (canvas) =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (!b) return reject(new Error("Falha ao gerar WEBP"));
          resolve(
            new File([b], file.name.replace(/\.\w+$/, ".webp"), {
              type: "image/webp",
            })
          );
        },
        "image/webp",
        quality
      );
    });

  try {
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(file);
      const ratio = Math.min(
        maxWidth / bitmap.width,
        maxHeight / bitmap.height,
        1
      );
      const w = Math.round(bitmap.width * ratio);
      const h = Math.round(bitmap.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0, w, h);
      const webpFile = await toWebpFromCanvas(canvas);
      URL.revokeObjectURL(blobUrl);
      return webpFile;
    }

    const imgEl = await loadImg(blobUrl);
    const ratio = Math.min(
      maxWidth / imgEl.naturalWidth,
      maxHeight / imgEl.naturalHeight,
      1
    );
    const w = Math.round(imgEl.naturalWidth * ratio);
    const h = Math.round(imgEl.naturalHeight * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgEl, 0, 0, w, h);
    const webpFile = await toWebpFromCanvas(canvas);
    URL.revokeObjectURL(blobUrl);
    return webpFile;
  } catch (e) {
    console.error(e);
    URL.revokeObjectURL(blobUrl);
    throw e;
  }
}

/* ------------------------------------------------------------------ */
/* Modal de Formulário (upload + preview + barra de progresso)        */
/* ------------------------------------------------------------------ */
const MinistryFormModal = ({
  isOpen,
  onClose,
  onSave,
  currentItem,
  isSaving,
  uploadProgress,
  canManage,
}) => {
  const initialFormState = useMemo(
    () => ({
      id: undefined,
      name: "",
      description: "",
      imageURL: "",
      imagePath: "",
      icon: "Users",
      schedule: "",
      team: [{ role: "", names: [""] }],
    }),
    [],
  );

  const iconOptions = [
    { value: "Users", label: "Pessoas / Grupo (Users)" },
    { value: "Smile", label: "Sorriso (Smile)" },
    { value: "Handshake", label: "Aperto de Mão / Social (Handshake)" },
    { value: "Stethoscope", label: "Cuidado / Capelania (Stethoscope)" },
    { value: "Megaphone", label: "Comunicação (Megaphone)" },
    { value: "UserCheck", label: "Discipulado (UserCheck)" },
    { value: "BookMarked", label: "Ensino / EBD (BookMarked)" },
    { value: "Speaker", label: "Evangelismo (Speaker)" },
    { value: "Heart", label: "Família (Heart)" },
    { value: "Globe2", label: "Missões (Globe2)" },
    { value: "Music", label: "Música (Music)" },
    { value: "Radio", label: "Rádio (Radio)" },
    { value: "Circle", label: "Padrão (Círculo)" },
  ];

  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  /* Tema: inputs e foco em #2a3d57 */
  const inputStyle =
    "block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2a3d57] sm:text-sm";

  useEffect(() => {
    if (currentItem) {
      const teamArray =
        currentItem.team && Object.keys(currentItem.team).length > 0
          ? Object.entries(currentItem.team).map(([role, names]) => ({
              role,
              names: names && names.length > 0 ? names : [""],
            }))
          : [{ role: "", names: [""] }];

      setFormData({
        id: currentItem.id,
        name: currentItem.name || "",
        description: currentItem.description || "",
        imageURL: currentItem.imageURL || "",
        imagePath: currentItem.imagePath || "",
        icon: currentItem.icon || "Users",
        schedule: currentItem.schedule || "",
        team: teamArray.length ? teamArray : [{ role: "", names: [""] }],
      });
      setImageFile(null);
      setPreview(currentItem.imageURL || null);
    } else {
      setFormData(initialFormState);
      setImageFile(null);
      setPreview(null);
    }
  }, [currentItem, initialFormState]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleChange = (groupIndex, e) => {
    const newTeam = [...formData.team];
    newTeam[groupIndex].role = e.target.value;
    setFormData((prev) => ({ ...prev, team: newTeam }));
  };

  const handleNameChange = (groupIndex, nameIndex, e) => {
    const newTeam = [...formData.team];
    newTeam[groupIndex].names[nameIndex] = e.target.value;
    setFormData((prev) => ({ ...prev, team: newTeam }));
  };

  const addNameInput = (groupIndex) => {
    const newTeam = [...formData.team];
    newTeam[groupIndex].names.push("");
    setFormData((prev) => ({ ...prev, team: newTeam }));
  };

  const removeNameInput = (groupIndex, nameIndex) => {
    const newTeam = [...formData.team];
    if (newTeam[groupIndex].names.length > 1) {
      newTeam[groupIndex].names.splice(nameIndex, 1);
      setFormData((prev) => ({ ...prev, team: newTeam }));
    }
  };

  const addRoleGroup = () => {
    setFormData((prev) => ({
      ...prev,
      team: [...prev.team, { role: "", names: [""] }],
    }));
  };

  const removeRoleGroup = (groupIndex) => {
    if (formData.team.length > 1) {
      const newTeam = formData.team.filter((_, i) => i !== groupIndex);
      setFormData((prev) => ({ ...prev, team: newTeam }));
    }
  };

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview((old) => {
        if (old && typeof old === "string" && old.startsWith("blob:")) {
          URL.revokeObjectURL(old);
        }
        return url;
      });
    } else {
      setPreview(formData.imageURL || null);
    }
  };

  useEffect(
    () => () => {
      if (preview && typeof preview === "string" && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    },
    [preview]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canManage) {
      alert("Sem permissão para salvar.");
      return;
    }
    const teamMap = formData.team.reduce((acc, group) => {
      const role = group.role.trim();
      const validNames = group.names.map((name) => name.trim()).filter(Boolean);
      if (role && validNames.length > 0) {
        acc[role] = validNames;
      }
      return acc;
    }, {});
    onSave({ ...formData, team: teamMap, imageFile });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        className="relative bg-white p-6 sm:p-8 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 grid place-items-center rounded-lg bg-[#2a3d57]/10 text-[#2a3d57]">
            <UsersIcon size={18} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800">
            {formData.id ? "Editar Ministério" : "Novo Ministério"}
          </h3>
        </div>

        {isSaving && (
          <div className="absolute left-0 right-0 top-0">
            <div className="h-1 bg-slate-200">
              <div
                className="h-1 bg-[#2a3d57] transition-all"
                style={{ width: `${uploadProgress ?? 0}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome do Ministério
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputStyle}
                required
                disabled={!canManage}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Dias e horários
              </label>
              <input
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                placeholder="Ex: Sábados, às 19h"
                className={inputStyle}
                disabled={!canManage}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={cx(inputStyle, "min-h-[96px]")}
              rows={4}
              required
              disabled={!canManage}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ícone
              </label>
              <select
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className={inputStyle}
                required
                disabled={!canManage}
              >
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Imagem de capa (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={!canManage}
                className="block w-full text-sm text-slate-700
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border file:border-slate-300
                           file:text-sm file:font-medium
                           file:bg-white file:text-slate-700
                           hover:file:bg-slate-50"
              />
              {preview && (
                <div className="mt-2">
                  <img
                    src={preview}
                    alt="Prévia"
                    className="h-28 w-auto rounded-lg border object-cover bg-slate-50"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 grid place-items-center rounded-lg bg-[#2a3d57]/10 text-[#2a3d57]">
                <CalendarClock size={16} />
              </div>
              <h4 className="text-base font-semibold text-slate-800">Equipe</h4>
            </div>

            <div className="space-y-4">
              {formData.team.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="bg-white p-3 rounded-lg border border-slate-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-grow">
                      <label className="text-xs font-medium text-slate-600 ml-1">
                        Função
                      </label>
                      <input
                        name="role"
                        value={group.role}
                        onChange={(e) => handleRoleChange(groupIndex, e)}
                        placeholder="Ex: Coordenadores"
                        className={cx(inputStyle, "font-medium")}
                        disabled={!canManage}
                      />
                    </div>
                    {formData.team.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoleGroup(groupIndex)}
                        className="text-slate-400 hover:text-red-600 transition-colors mt-1"
                        title="Remover função"
                        disabled={!canManage}
                      >
                        <XCircle size={20} />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    <label className="text-xs font-medium text-slate-600 ml-1">
                      Membros
                    </label>
                    {group.names.map((name, nameIndex) => (
                      <div key={nameIndex} className="flex items-center gap-2">
                        <input
                          name="name"
                          value={name}
                          onChange={(e) =>
                            handleNameChange(groupIndex, nameIndex, e)
                          }
                          placeholder="Nome completo do membro"
                          className={cx(inputStyle, "flex-1")}
                          disabled={!canManage}
                        />
                        <button
                          type="button"
                          onClick={() => removeNameInput(groupIndex, nameIndex)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remover membro"
                          disabled={!canManage || group.names.length <= 1}
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addNameInput(groupIndex)}
                    className="mt-3 text-xs text-[#2a3d57] font-semibold hover:text-[#264254] flex items-center gap-1"
                    disabled={!canManage}
                  >
                    <PlusCircle size={14} /> Adicionar membro nesta função
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRoleGroup}
              className="mt-4 text-sm text-[#2a3d57] font-semibold hover:text-[#264254] flex items-center gap-1"
              disabled={!canManage}
            >
              <PlusCircle size={16} /> Adicionar nova função
            </button>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2a3d57] text-white font-semibold rounded-lg hover:bg-[#264254] transition-colors disabled:opacity-60"
              disabled={isSaving || !canManage}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */
export default function MinistriesPage() {
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const [itemToDelete, setItemToDelete] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const { allowed: canManage, loading: roleLoading } = useHasRole([
    "admin",
    "pastor",
    "supervisor_departamento",
    "supervisor_setor",
    "ministro",
  ]);

  const fetchMinistries = useCallback(async () => {
    setLoading(true);
    const q = query(collection(db, "ministries"), orderBy("name"));
    const snapshot = await getDocs(q);
    setMinistries(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMinistries();
  }, [fetchMinistries]);

  const handleOpenModal = (item = null) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsSaving(false);
    setUploadProgress(null);
    setIsModalOpen(false);
  };

  async function uploadCover(file, docId) {
    setIsSaving(true);
    setUploadProgress(0);

    const compressed = await fileToWebp(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.82,
    });

    const path = `ministries/${docId}/cover_${Date.now()}.webp`;
    const storageRef = ref(storage, path);

    const task = uploadBytesResumable(storageRef, compressed, {
      contentType: "image/webp",
    });

    await new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        (snap) => {
          const p = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setUploadProgress(p);
        },
        (err) => reject(err),
        () => resolve()
      );
    });

    const url = await getDownloadURL(task.snapshot.ref);

    setIsSaving(false);
    setUploadProgress(null);

    return { url, path };
  }

  async function deleteByPath(imagePath) {
    if (!imagePath) return;
    try {
      const r = ref(storage, imagePath);
      await deleteObject(r);
    } catch {
      // ignora erros de remoção
    }
  }

  const handleSave = async (data) => {
    if (!canManage) {
      alert("Sem permissão para salvar.");
      return;
    }
    try {
      const { id, imageFile, imageURL, imagePath, ...rest } = data;

      if (id) {
        await updateDoc(doc(db, "ministries", id), {
          ...rest,
          imageURL,
          imagePath,
        });

        if (imageFile) {
          const { url, path } = await uploadCover(imageFile, id);
          await updateDoc(doc(db, "ministries", id), {
            imageURL: url,
            imagePath: path,
          });
          await deleteByPath(imagePath);
        }
      } else {
        const docRef = await addDoc(collection(db, "ministries"), {
          ...rest,
          imageURL: "",
          imagePath: "",
        });

        if (imageFile) {
          const { url, path } = await uploadCover(imageFile, docRef.id);
          await updateDoc(doc(db, "ministries", docRef.id), {
            imageURL: url,
            imagePath: path,
          });
        }
      }

      await fetchMinistries();
      handleCloseModal();
    } catch (err) {
      console.error("Erro ao salvar ministério:", err);
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    if (!canManage) {
      alert("Sem permissão para excluir.");
      return;
    }
    await deleteByPath(itemToDelete.imagePath);
    await deleteDoc(doc(db, "ministries", itemToDelete.id));
    await fetchMinistries();
    setItemToDelete(null);
  };

  return (
    <PageContent
      title="Gerenciar Ministérios"
      subtitle="Cadastre, edite e organize os ministérios da igreja."
    >
      {/* Ação primária */}
      <div className="mb-6 flex justify-end">
        {!roleLoading && canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2a3d57] text-white font-semibold rounded-lg hover:bg-[#264254] active:scale-[.99]"
          >
            <PlusCircle size={18} />
            Adicionar Ministério
          </button>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-slate-700">Carregando...</p>
      ) : ministries.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          <p>Nenhum ministério cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {ministries.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-sm transition-shadow"
              >
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                  {item.imageURL ? (
                    <img
                      src={item.imageURL}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-slate-400 text-sm">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={16} />
                        Sem imagem
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-slate-900 text-lg leading-tight">
                  {item.name}
                </h3>

                {item.schedule && (
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <CalendarClock size={14} className="text-slate-400" />
                    {item.schedule}
                  </p>
                )}

                <p className="text-sm text-slate-600 line-clamp-2 mt-2">
                  {item.description}
                </p>

                {!roleLoading && canManage && (
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modais */}
      <MinistryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        currentItem={currentItem}
        isSaving={isSaving}
        uploadProgress={uploadProgress}
        canManage={!roleLoading && canManage}
      />

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
      >
        <p>
          Tem certeza que deseja remover o ministério{" "}
          <strong>{itemToDelete?.name}</strong>?
        </p>
      </ConfirmationModal>
    </PageContent>
  );
}

