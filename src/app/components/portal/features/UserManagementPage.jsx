"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { db } from "../../../lib/firebase/client";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { maskCPF } from "../../../lib/utils/cpf";

import PageContent from "../ui/PageContent";
import { useHasRole } from "../../../hooks/useClaims";
import StatusBadge from "../ui/StatusBadge";
import ConfirmationModal from "../ui/ConfirmationModal";
import { Trash2 as TrashIcon } from "lucide-react";

import { setUserRoleCallable } from "../../../lib/firebase/callables/setUserRole";
import { getAuth } from "firebase/auth";

export default function UserManagementPage({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const availableRoles = ["admin", "pastor", "supervisor_departamento", "supervisor_setor", "membro", null];

  const { allowed: canManageRoles, loading: rolesLoading } =
    useHasRole(["admin", "pastor", "supervisor_departamento", "supervisor_setor"]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      usersList.sort((a, b) => (a?.name || "").localeCompare(b?.name || "", "pt-BR", { sensitivity: "base" }));
      setUsers(usersList);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setMessage("Falha ao carregar usuários.");
    }
    setLoading(false);
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
      // Encontrar e-mail do usuário-alvo (a callable precisa de email)
      const target = users.find((u) => u.id === userId);
      if (!target?.email) {
        setMessage("Usuário sem e-mail cadastrado.");
        return resetMsgSoon();
      }

      // Chama a Cloud Function que define as claims e espelha no Firestore
      await setUserRoleCallable({ email: target.email, role: newRole });

      // Atualiza a lista local para refletir imediatamente
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));

      // Garante que quem está logado também atualize o token (não muda claims do alvo agora)
      try {
        await getAuth().currentUser?.getIdToken(true);
      } catch {}

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

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const name = (user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const cpf = user.cpf || "";
    return name.includes(term) || email.includes(term) || (cpf && cpf.includes(searchTerm));
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (loading || rolesLoading) {
    return (
      <PageContent title="Gerenciar Usuários">
        <p>Carregando usuários e verificando permissões...</p>
      </PageContent>
    );
  }

  return (
    <PageContent title="Gerenciar Funções de Usuários">
      {message && (
        <p className="mb-4 text-sm text-green-700 bg-green-100 p-2 rounded-md">
          {message}
        </p>
      )}

      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por nome, e-mail ou CPF..."
          className="w-full max-w-lg p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2a3d57] focus:outline-none"
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
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Contato
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Verificado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Função
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  variants={itemVariants}
                  className={currentUser?.uid === user.id ? "bg-blue-50" : ""}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {user.name || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div>{user.email || "—"}</div>
                    <div className="text-xs">{user.cpf ? maskCPF(user.cpf) : ""}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StatusBadge verified={!!user.emailVerified} />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                    <select
                      value={user.role ?? ""}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={!canManageRoles || currentUser?.uid === user.id}
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-[#2a3d57] focus:ring-[#2a3d57] sm:text-sm disabled:bg-slate-200 disabled:cursor-not-allowed"
                      title={
                        currentUser?.uid === user.id
                          ? "Sua própria função não pode ser alterada."
                          : !canManageRoles
                          ? "Sem permissão para alterar funções."
                          : "Alterar função"
                      }
                    >
                      <option value="">Sem Função</option>
                      {availableRoles
                        .filter((r) => r !== null)
                        .map((role) => (
                          <option key={role} value={role} className="capitalize">
                            {role.replace(/_/g, " ")}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setUserToDelete(user)}
                      disabled={!canManageRoles || currentUser?.uid === user.id}
                      className="text-red-600 hover:text-red-900 disabled:text-slate-400 disabled:cursor-not-allowed"
                      title={
                        currentUser?.uid === user.id
                          ? "Você não pode se excluir."
                          : !canManageRoles
                          ? "Sem permissão para excluir."
                          : "Excluir usuário"
                      }
                    >
                      <TrashIcon size={16} strokeWidth={2} />
                    </button>
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

        {/* Cards (mobile) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-4 md:hidden"
        >
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <motion.div key={user.id} variants={itemVariants}>
                <div
                  className={`p-4 rounded-lg border ${
                    currentUser?.uid === user.id
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800">{user.name || "—"}</p>
                      <p className="text-sm text-slate-600">{user.email || "—"}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {user.cpf ? maskCPF(user.cpf) : "CPF não informado"}
                      </p>
                    </div>
                    <StatusBadge verified={!!user.emailVerified} />
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Função
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role ?? ""}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={!canManageRoles || currentUser?.uid === user.id}
                        className="flex-grow block w-full rounded-md border-slate-300 shadow-sm focus:border-[#2a3d57] focus:ring-[#2a3d57] sm:text-sm disabled:bg-slate-200 disabled:cursor-not-allowed"
                        title={
                          currentUser?.uid === user.id
                            ? "Sua própria função não pode ser alterada."
                            : !canManageRoles
                            ? "Sem permissão para alterar funções."
                            : "Alterar função"
                        }
                      >
                        <option value="">Sem Função</option>
                        {availableRoles
                          .filter((r) => r !== null)
                          .map((role) => (
                            <option key={role} value={role} className="capitalize">
                              {role.replace(/_/g, " ")}
                            </option>
                          ))}
                      </select>

                      <button
                        onClick={() => setUserToDelete(user)}
                        disabled={!canManageRoles || currentUser?.uid === user.id}
                        className="p-2 text-red-600 hover:text-red-900 disabled:text-slate-400 disabled:cursor-not-allowed"
                        title={
                          currentUser?.uid === user.id
                            ? "Você não pode se excluir."
                            : !canManageRoles
                            ? "Sem permissão para excluir."
                            : "Excluir usuário"
                        }
                      >
                        <TrashIcon size={20} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center py-10 text-slate-500">Nenhum usuário encontrado.</p>
          )}
        </motion.div>
      </div>

      <ConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDeleteUser}
        title="Confirmar Exclusão"
      >
        <p>
          Tem certeza que deseja remover <strong>{userToDelete?.name}</strong>? Esta
          ação removerá suas permissões.
        </p>
        <p className="mt-2 text-xs text-red-600">
          Lembrete: Para excluir o login, remova-o da aba <strong>Authentication</strong>{" "}
          no Firebase Console.
        </p>
      </ConfirmationModal>
    </PageContent>
  );
}
