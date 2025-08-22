import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-slate-700 dark:text-slate-300 text-center p-4">
      <div className="text-[#2a3d57]">
        <Lock size={48} strokeWidth={1.5} />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-slate-700 dark:text-slate-300">Acesso Negado</h1>
      <p className="mt-2 text-slate-700 dark:text-slate-300">Sem permissão para acessar esta área.</p>
      <p className="mt-4">
        <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          ← Voltar para o início
        </Link>
      </p>
    </div>
  );
}