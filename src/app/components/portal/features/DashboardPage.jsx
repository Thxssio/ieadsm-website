import React from 'react';
import PageContent from '../ui/PageContent';

export default function DashboardPage({ user }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <PageContent title="Dashboard">
      <p className="text-lg text-slate-700">
        {getGreeting()}, <span className="font-semibold">{user.displayName}</span>.
      </p>
      <p className="mt-2 text-slate-500">
        Este é o seu painel de controle. Use o menu para navegar entre as diferentes seções do portal.
      </p>
    </PageContent>
  );
}