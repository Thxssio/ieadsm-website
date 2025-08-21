"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase/client";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

import PageContent from "@/components/portal/ui/PageContent";
import ConfirmationModal from "@/components/portal/ui/ConfirmationModal";
import StatusBadge from "@/components/portal/ui/StatusBadge";
import { useHasRole } from "@/hooks/useClaims";
import { maskCPF } from "@/lib/utils/cpf";
import { downloadUserFichaPDF } from "@/components/portal/features/UserFichaPDF";
import { churchInfo } from "@/lib/churchInfo";



import {
  Trash2 as TrashIcon,
  Eye,
  Loader2,
  MailCheck,
  ShieldCheck,
  Phone,
  IdCard,
  Home as HomeIcon,
  Users as UsersIcon,
  HeartHandshake,
  Baby,
  Church,
  BookMarked,
  Image as ImageIcon,
  RotateCcw,
  Printer,
} from "lucide-react";

import { setUserRoleCallable } from "@/lib/firebase/callables/setUserRole";

/* ----------------------------------------------------------- */
/* Helpers                                                     */
/* ----------------------------------------------------------- */
function cx(...xs) { return xs.filter(Boolean).join(" "); }
function Labeled({ label, children }) {
  return (
    <div className="print-avoid-break">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-slate-900">{children || "—"}</div>
    </div>
  );
}
function Section({ icon, title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 print-avoid-break">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 grid place-items-center rounded-lg bg-[#2a3d57]/10 text-[#2a3d57]">
          {icon}
        </div>
        <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}


/* ----------------------------------------------------------- */
/* Modal de visualização da ficha                              */
/* ----------------------------------------------------------- */
function UserFormModal({ open, onClose, userId }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const handleDownload = async () => {
    if (!data) return;
    await downloadUserFichaPDF({ data, maskCPF, logoUrl: churchInfo.logoUrlLight, logoWidth: 120 });
  };

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "users", userId));
      setData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  if (!open) return null;

  const children = Array.isArray(data?.filhos) ? data.filhos : [];


  return (
    <div className="fixed inset-0 z-50">
      {/* Estilos de impressão */}
      <style jsx global>{`
        @page { size: A4; margin: 14mm 14mm 16mm; }
        @media print {
          html, body {
            background: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .print-root {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            width: auto !important;
          }
          .print-body {
            padding: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .print-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Overlay só na tela */}
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm no-print" onClick={onClose} />
      <div className="absolute inset-x-0 top-6 md:top-12 mx-auto max-w-5xl px-3">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden print-root">
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-200 no-print">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 grid place-items-center rounded-lg bg-[#2a3d57]/10 text-[#2a3d57]">
                <Eye size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Ficha do Usuário</h3>
                <p className="text-xs text-slate-500">
                  Visualização somente leitura do cadastro complementar
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 rounded-md border border-slate-300 bg-white hover:bg-slate-50"
                title="Baixar PDF da ficha"
              >
                <Printer size={16} />
                Baixar PDF
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 rounded-md border border-slate-300 bg-white hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 md:p-6 max-h-[80vh] overflow-y-auto print-body">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-600 no-print">
                <Loader2 className="animate-spin mr-2" /> Carregando ficha…
              </div>
            ) : !data ? (
              <div className="text-center py-12 text-slate-600">
                Não encontramos dados para este usuário.
              </div>
            ) : (
              <div className="space-y-5 print:space-y-3">
                {/* Top card */}
                <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 print-avoid-break">
                  <div className="grid grid-cols-[72px_1fr] gap-4 items-center">
                    <div className="h-18 w-18 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 grid place-items-center">
                      {data.photoURL ? (
                        <img
                          src={data.photoURL}
                          alt={data.name || "Usuário"}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <ImageIcon className="text-slate-400" />
                      )}
                    </div>
                    <div className="grid gap-1">
                      <div className="text-lg font-semibold text-slate-900 leading-tight">
                        {data.name || "—"}
                      </div>
                      <div className="text-sm text-slate-600">{data.email || "—"}</div>
                      <div className="text-xs text-slate-500">
                        ID Interno: <span className="font-medium">{data.idInterno || "—"}</span>
                      </div>
                    </div>
                  </div>
                </section>

                <Section icon={<MailCheck size={16} />} title="Contato & Identificação">
                  <Labeled label="E-mail">{data.email}</Labeled>
                  <Labeled label="Telefone">{data.telefone || "—"}</Labeled>
                  <Labeled label="Celular">{data.celular || "—"}</Labeled>
                  <Labeled label="CPF">{data.cpf ? maskCPF(data.cpf) : "—"}</Labeled>
                  <Labeled label="RG">{data.rg}</Labeled>
                  <Labeled label="Título de Eleitor">{data.tituloEleitor}</Labeled>
                </Section>

                <Section icon={<HomeIcon size={16} />} title="Endereço">
                  <Labeled label="Endereço">
                    {data.endereco} {data.numero && `, ${data.numero}`} {data.complemento}
                  </Labeled>
                  <Labeled label="Bairro">{data.bairro}</Labeled>
                  <Labeled label="Cidade/UF">
                    {data.cidade} {data.uf && `- ${data.uf}`}
                  </Labeled>
                  <Labeled label="CEP">{data.cep}</Labeled>
                </Section>

                <Section icon={<IdCard size={16} />} title="Dados Pessoais">
                  <Labeled label="Sexo">{data.sexo}</Labeled>
                  <Labeled label="Nascimento">{data.dataNascimento}</Labeled>
                  <Labeled label="Nacionalidade">{data.nacionalidade}</Labeled>
                  <Labeled label="Profissão">{data.profissao}</Labeled>
                  <Labeled label="Grau de Instrução">{data.grauInstrucao}</Labeled>
                  <Labeled label="Local de Nascimento">{data.localNascimento}</Labeled>
                </Section>

                <Section icon={<UsersIcon size={16} />} title="Filiação">
                  <Labeled label="Pai">
                    {data.pai} {data.cpfPai ? `(${maskCPF(data.cpfPai)})` : ""}
                  </Labeled>
                  <Labeled label="Mãe">
                    {data.mae} {data.cpfMae ? `(${maskCPF(data.cpfMae)})` : ""}
                  </Labeled>
                  <Labeled label="Órfão?">{data.isOrphan ? "Sim" : "Não"}</Labeled>
                  <div />
                </Section>

                <Section icon={<HeartHandshake size={16} />} title="Estado Civil / Cônjuge">
                  <Labeled label="Estado civil">{data.estadoCivil}</Labeled>
                  <Labeled label="Data casamento">{data.dtCasamento}</Labeled>
                  <Labeled label="Cônjuge">{data.nomeConjuge}</Labeled>
                  <Labeled label="CPF Cônjuge">
                    {data.cpfConjuge ? maskCPF(data.cpfConjuge) : "—"}
                  </Labeled>
                  <Labeled label="Profissão cônjuge">{data.profissaoConjuge}</Labeled>
                  <Labeled label="Nascimento cônjuge">{data.dataNascimentoConjuge}</Labeled>
                </Section>

                <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 print-avoid-break">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 grid place-items-center rounded-lg bg-[#2a3d57]/10 text-[#2a3d57]">
                      <Baby size={16} />
                    </div>
                    <h4 className="text-base font-semibold text-slate-800">Filhos</h4>
                  </div>
                  {children.length ? (
                    <div className="grid gap-2">
                      {children.map((f, i) => (
                        <div key={i} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                          <div className="font-medium text-slate-800">{f.name || "—"}</div>
                          <div className="text-sm text-slate-600">{f.cpf ? maskCPF(f.cpf) : "—"}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-600">Sem filhos cadastrados.</div>
                  )}
                </section>

                <Section icon={<Church size={16} />} title="Informações da Igreja">
                  <Labeled label="Tipo de Registro">{data.registroTipo}</Labeled>
                  <Labeled label="Setor">{data.setor}</Labeled>
                  <Labeled label="Congregação">{data.congregacao}</Labeled>
                  <Labeled label="Origem">{data.origem}</Labeled>
                  <Labeled label="Informações adicionais">{data.informacoes}</Labeled>
                  <Labeled label="Data de conversão">{data.dataConversao}</Labeled>
                  <Labeled label="Batizado com o Espírito Santo?">
                    {data.batizadoEspiritoSanto ? "Sim" : "Não"}
                  </Labeled>
                  <Labeled label="Data do batismo no Espírito Santo">
                    {data.dataBatismoEspiritoSanto}
                  </Labeled>
                </Section>

                <Section icon={<BookMarked size={16} />} title="Batismo / Recebimento">
                  <Labeled label="Local do batismo">{data.localBatismo}</Labeled>
                  <Labeled label="Data do batismo">{data.dataBatismo}</Labeled>
                  <Labeled label="Recebimento">{data.recebimento}</Labeled>
                  <Labeled label="Data do recebimento">{data.dataRecebimento}</Labeled>
                </Section>

                <Section icon={<ShieldCheck size={16} />} title="LGPD">
                  <Labeled label="Autorização para tratamento de dados">
                    {data.autorizacao ? "Autorizado" : "Não autorizado"}
                  </Labeled>
                  <Labeled label="Family ID">{data.familyId}</Labeled>
                </Section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- */
/* Página de Gestão de Usuários                                */
/* ----------------------------------------------------------- */
export default function UserManagementPage({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUserId, setViewerUserId] = useState(null);

  const availableRoles = [
    "admin",
    "pastor",
    "supervisor_departamento",
    "supervisor_setor",
    "membro",
    null,
  ];

  const { allowed: canManageRoles, loading: rolesLoading } = useHasRole([
    "admin",
    "pastor",
    "supervisor_departamento",
    "supervisor_setor",
  ]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      usersList.sort((a, b) =>
        (a?.name || "").localeCompare(b?.name || "", "pt-BR", { sensitivity: "base" })
      );
      setUsers(usersList);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setMessage("Falha ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const resetMsgSoon = (ms = 3000) => setTimeout(() => setMessage(""), ms);

  const handleRoleChange = async (userId, newRoleRaw) => {
    setMessage("");
    if (!canManageRoles) {
      setMessage("Você não tem permissão para alterar funções.");
      return resetMsgSoon();
    }
    if (currentUser?.uid === userId) {
      setMessage("Você não pode alterar a própria função.");
      return resetMsgSoon();
    }
    const newRole = newRoleRaw === "" ? null : newRoleRaw;
    const whitelist = new Set(availableRoles);
    if (!whitelist.has(newRole)) {
      setMessage("Função inválida.");
      return resetMsgSoon();
    }
    try {
      const target = users.find((u) => u.id === userId);
      if (!target?.email) {
        setMessage("Usuário sem e-mail cadastrado.");
        return resetMsgSoon();
      }
      await setUserRoleCallable({ email: target.email, role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      try {
        await getAuth().currentUser?.getIdToken(true);
      } catch (err) {
        /* ignore refresh token errors */
      }
      setMessage("Função atualizada com sucesso!");
      resetMsgSoon();
    } catch (error) {
      console.error("Erro ao atualizar função (callable):", error);
      setMessage("Falha ao atualizar a função.");
      resetMsgSoon();
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setMessage("");
    if (!canManageRoles) {
      setMessage("Você não tem permissão para excluir usuários.");
      return resetMsgSoon();
    }
    if (currentUser?.uid === userToDelete.id) {
      setMessage("Você não pode se excluir.");
      return resetMsgSoon();
    }
    try {
      await deleteDoc(doc(db, "users", userToDelete.id));
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setMessage(
        `Usuário ${userToDelete.name} removido. Lembre-se de excluí-lo também na aba Authentication do Firebase Console.`
      );
      setUserToDelete(null);
      resetMsgSoon(5000);
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      setMessage("Falha ao excluir usuário.");
      resetMsgSoon();
    }
  };

  const reopenRegistration = async (userId) => {
    try {
      await setDoc(
        doc(db, "users", userId),
        { profileComplete: false, onboarding: { status: "pending", step: 0, updatedAt: serverTimestamp() } },
        { merge: true }
      );
      setMessage("Cadastro complementar reaberto para este usuário.");
      resetMsgSoon();
    } catch (e) {
      console.error(e);
      setMessage("Não foi possível reabrir o cadastro.");
      resetMsgSoon();
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const name = (u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const cpf = (u.cpf || "").toLowerCase();
    return name.includes(term) || email.includes(term) || cpf.includes(term);
  });

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
  const itemVariants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (loading || rolesLoading) {
    return (
      <PageContent title="Gerenciar Usuários">
        <p className="text-slate-700">Carregando usuários e verificando permissões...</p>
      </PageContent>
    );
  }

  return (
    <PageContent
      title="Gerenciar Usuários"
      subtitle="Pesquise, veja a ficha de cadastro e ajuste funções."
    >
      {message && (
        <div
          className={cx(
            "mb-4 rounded-md px-3 py-2 text-sm border",
            /sucesso|atualizada|reaberto|reaberta|atualizado/i.test(message)
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          )}
        >
          {message}
        </div>
      )}

      {/* Busca */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por nome, e-mail ou CPF..."
          className="w-full max-w-lg px-3 py-2 bg-white border border-slate-300 rounded-lg placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2a3d57]"
        />
      </div>

      <div className="overflow-x-auto">
        {/* Tabela (desktop) */}
        <motion.table
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="min-w-full hidden md:table"
        >
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contato</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Verificado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Função</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredUsers.length ? (
              filteredUsers.map((u) => (
                <motion.tr key={u.id} variants={itemVariants}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{u.name || "—"}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">ID Interno: {u.idInterno || "—"}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <MailCheck size={14} className="text-slate-400" />
                      {u.email || "—"}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Phone size={14} className="text-slate-400" />
                      {u.celular || u.telefone || "—"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {u.cpf ? maskCPF(u.cpf) : "CPF não informado"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge verified={!!u.emailVerified} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                    <select
                      value={u.role ?? ""}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={!canManageRoles || currentUser?.uid === u.id}
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-[#2a3d57] focus:ring-[#2a3d57] sm:text-sm text-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed"
                      title={
                        currentUser?.uid === u.id
                          ? "Sua própria função não pode ser alterada."
                          : !canManageRoles
                          ? "Sem permissão para alterar funções."
                          : "Alterar função"
                      }
                    >
                      <option value="">Sem Função</option>
                      {["admin","pastor","supervisor_departamento","supervisor_setor","membro"].map((role) => (
                        <option key={role} value={role} className="capitalize">
                          {role.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => { setViewerUserId(u.id); setViewerOpen(true); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                        title="Ver ficha de cadastro"
                      >
                        <Eye size={14} /> Ver ficha
                      </button>
                      <button
                        onClick={() => reopenRegistration(u.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-amber-200 text-amber-800 hover:bg-amber-50"
                        title="Reabrir cadastro complementar"
                      >
                        <RotateCcw size={14} /> Reabrir cadastro
                      </button>
                      <button
                        onClick={() => setUserToDelete(u)}
                        disabled={!canManageRoles || currentUser?.uid === u.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:text-slate-400 disabled:border-slate-200"
                        title={
                          currentUser?.uid === u.id
                            ? "Você não pode se excluir."
                            : !canManageRoles
                            ? "Sem permissão para excluir."
                            : "Excluir usuário"
                        }
                      >
                        <TrashIcon size={14} /> Excluir
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-10 text-slate-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </motion.table>

        {/* Lista em cards (mobile) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 md:hidden"
        >
          {filteredUsers.length ? (
            filteredUsers.map((u) => (
              <motion.div key={u.id} variants={itemVariants} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-slate-900 font-semibold">{u.name || "—"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">ID Interno: {u.idInterno || "—"}</div>
                    <div className="mt-2 text-sm text-slate-700 flex items-center gap-2">
                      <MailCheck size={14} className="text-slate-400" /> {u.email || "—"}
                    </div>
                    <div className="text-xs text-slate-500">{u.cpf ? maskCPF(u.cpf) : "CPF não informado"}</div>
                  </div>
                  <StatusBadge verified={!!u.emailVerified} />
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Função</label>
                  <select
                    value={u.role ?? ""}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={!canManageRoles || currentUser?.uid === u.id}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-[#2a3d57] focus:ring-[#2a3d57] sm:text-sm text-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed"
                  >
                    <option value="">Sem Função</option>
                    {["admin","pastor","supervisor_departamento","supervisor_setor","membro"].map((role) => (
                      <option key={role} value={role} className="capitalize">
                        {role.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => { setViewerUserId(u.id); setViewerOpen(true); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <Eye size={14} /> Ver ficha
                  </button>
                  <button
                    onClick={() => reopenRegistration(u.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-amber-200 text-amber-800 hover:bg-amber-50"
                  >
                    <RotateCcw size={14} /> Reabrir cadastro
                  </button>
                  <button
                    onClick={() => setUserToDelete(u)}
                    disabled={!canManageRoles || currentUser?.uid === u.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:text-slate-400 disabled:border-slate-200"
                  >
                    <TrashIcon size={14} /> Excluir
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center py-10 text-slate-500">Nenhum usuário encontrado.</p>
          )}
        </motion.div>
      </div>

      {/* Modais */}
      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDeleteUser}
        title="Confirmar Exclusão"
      >
        <p>
          Tem certeza que deseja remover <strong>{userToDelete?.name}</strong>? Esta ação
          removerá suas permissões.
        </p>
        <p className="mt-2 text-xs text-red-600">
          Lembrete: Para excluir o login, remova-o também na aba <strong>Authentication</strong> do Firebase Console.
        </p>
      </ConfirmationModal>

      <UserFormModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        userId={viewerUserId}
      />
    </PageContent>
  );
}

