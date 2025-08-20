"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';
import { auth, db } from '@/lib/firebase/client';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { maskCPF } from '@/lib/utils/cpf'; // Importa a máscara de CPF

// --- Ícones ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const MinistryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M16 12c-2 2-5 2-7 0c-2-2 0-5 2-7c2-2 5-2 7 0c2 2 0 5-2 7Z"/></svg>;
const ChurchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2"/><path d="M14 22v-4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v4"/><path d="M18 22V5l-6-3-6 3v17"/><path d="M12 7v5"/><path d="M10 9H8"/><path d="M16 9h-2"/></svg>;
const ContentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h4"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

// --- Componentes de UI ---
const PageContent = ({ title, children }) => (<div className="p-6 sm:p-8"><h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">{title}</h1><div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">{children}</div></div>);
const AccessDeniedPage = () => (<div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-4"><div className="text-[#2a3d57]"><LockIcon /></div><h1 className="mt-6 text-3xl font-bold text-slate-800">Acesso Negado</h1><p className="mt-2 text-slate-600">Sem permissão, contacte um administrador.</p></div>);

// --- Componente para Gerenciar Usuários ---
function UserManagementPage({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);

  const availableRoles = ['admin', 'pastor', 'supervisor_departamento', 'supervisor_setor', 'membro', null];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() 
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setMessage('Falha ao carregar usuários.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setMessage('');
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { role: newRole });
      setMessage('Função atualizada com sucesso!');
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Erro ao atualizar função:", error);
      setMessage('Falha ao atualizar a função.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!userToDelete || userToDelete.id !== userId) return;
    
    setMessage('');
    try {
      await deleteDoc(doc(db, 'users', userId));
      setMessage(`Usuário ${userToDelete.name} removido do portal. Lembre-se de excluí-lo da Autenticação no Firebase Console.`);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setUserToDelete(null);
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      setMessage('Falha ao excluir usuário.');
    }
  };

  if (loading) {
    return <PageContent title="Gerenciar Usuários"><p>Carregando usuários...</p></PageContent>;
  }

  return (
    <PageContent title="Gerenciar Funções de Usuários">
      {message && <p className="mb-4 text-sm text-green-600 bg-green-100 p-2 rounded-md">{message}</p>}
      <div className="overflow-x-auto">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Membros Cadastrados</h3>
        <p className="text-sm text-slate-500 mb-4">Novos usuários devem ser criados através da página pública de <a href="/registrar" className="text-blue-600 underline">cadastro</a>.</p>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CPF</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Função</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map(user => {
              const isCurrentUser = currentUser && user.id === currentUser.uid;
              return (
                <tr key={user.id} className={isCurrentUser ? 'bg-slate-100' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.cpf ? maskCPF(user.cpf) : 'Não informado'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <select 
                      value={user.role || ''} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value === '' ? null : e.target.value)}
                      disabled={isCurrentUser}
                      className="block w-full rounded-md border-slate-300 shadow-sm focus:border-[#2a3d57] focus:ring-[#2a3d57] sm:text-sm disabled:bg-slate-200 disabled:cursor-not-allowed"
                      title={isCurrentUser ? "Você não pode alterar sua própria função." : "Alterar função"}
                    >
                      <option value="">Sem Função</option>
                      {availableRoles.filter(r => r !== null).map(role => (
                        <option key={role} value={role} className="capitalize">{role.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setUserToDelete(user)}
                      disabled={isCurrentUser}
                      className="text-red-600 hover:text-red-900 disabled:text-slate-400 disabled:cursor-not-allowed"
                      title={isCurrentUser ? "Você não pode se excluir." : "Excluir usuário"}
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800">Confirmar Exclusão</h3>
            <p className="mt-2 text-sm text-slate-600">
              Tem certeza que deseja remover <strong>{userToDelete.name}</strong> do portal? Esta ação removerá suas permissões.
            </p>
            <p className="mt-2 text-xs text-red-600">
              Lembrete: Para excluir completamente o login, você ainda precisará removê-lo da aba <strong>Authentication</strong> no Firebase Console.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setUserToDelete(null)} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300">Cancelar</button>
              <button onClick={() => handleDeleteUser(userToDelete.id)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
    </PageContent>
  );
}

// --- Componente do Portal ---
function AdminPortalView({ user, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard');
  const NavItem = ({ icon, label, active, onClick }) => (<button onClick={onClick} className={`w-full flex items-center px-4 py-2.5 text-sm transition-all duration-200 rounded-lg ${active ? 'bg-[#2a3d57] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}><div className="mr-3">{icon}</div><span className="font-semibold">{label}</span></button>);
  
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <PageContent title="Dashboard"><p className="text-slate-700">Bem-vindo, {user.displayName}.</p></PageContent>;
      case 'users': return <UserManagementPage currentUser={user} />;
      case 'ministries': return <PageContent title="Ministérios"><p>Página para gerenciar os ministérios da igreja (em construção).</p></PageContent>;
      default: return <PageContent title={activePage}><p>Página em construção.</p></PageContent>;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-4">
        <div className="p-4 text-center border-b border-slate-200 mb-4"><h2 className="text-xl font-bold text-[#2a3d57]">Portal IEADSM</h2><p className="text-sm text-slate-500 mt-1 capitalize">{user.displayName || "Usuário"}</p></div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={<HomeIcon />} label="Dashboard" active={activePage === 'dashboard'} onClick={() => setActivePage('dashboard')} />
          <NavItem icon={<UsersIcon />} label="Usuários" active={activePage === 'users'} onClick={() => setActivePage('users')} />
          <NavItem icon={<MinistryIcon />} label="Ministérios" active={activePage === 'ministries'} onClick={() => setActivePage('ministries')} />
          <NavItem icon={<ChurchIcon />} label="Congregações" active={activePage === 'congregations'} onClick={() => setActivePage('congregations')} />
          <NavItem icon={<ContentIcon />} label="Conteúdo do Site" active={activePage === 'siteContent'} onClick={() => setActivePage('siteContent')} />
          <NavItem icon={<CalendarIcon />} label="Eventos" active={activePage === 'events'} onClick={() => setActivePage('events')} />
          <NavItem icon={<SettingsIcon />} label="Programação" active={activePage === 'schedule'} onClick={() => setActivePage('schedule')} />
        </nav>
        <div className="pt-4 border-t border-slate-200"><NavItem icon={<LogoutIcon />} label="Sair" onClick={onLogout} /></div>
      </aside>
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>
    </div>
  );
}

// --- Componente Principal (Client Component) ---
export default function PortalClient() {
  const { user, role, profileComplete, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Aguarda o carregamento terminar

    if (!user) {
      router.push("/login"); // Se não há usuário, vai para o login
      return;
    }

    // Se o usuário está logado, mas o perfil está incompleto, força o preenchimento
    if (user && !profileComplete) {
      router.push("/CompleteRegistration");
    }
  }, [user, profileComplete, isLoading, router]);

  if (isLoading || !user || !profileComplete) {
    // Mostra "Carregando..." enquanto a verificação inicial acontece ou enquanto redireciona
    return <div className="flex items-center justify-center min-h-screen"><p>Carregando...</p></div>;
  }

  const handleLogout = async () => {
    await auth.signOut();
  };

  // Lógica de acesso baseada na função (role)
  if (role === 'admin' || role === 'supervisor_departamento' || role === 'supervisor_setor') {
    return <AdminPortalView user={user} onLogout={handleLogout} />;
  } else {
    return <AccessDeniedPage />;
  }
}
