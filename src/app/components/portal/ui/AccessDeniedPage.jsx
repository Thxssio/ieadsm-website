import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-4">
      <div className="text-[#2a3d57]">
        <Lock size={48} strokeWidth={1.5} />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-slate-800">Acesso Negado</h1>
      <p className="mt-2 text-slate-600">Sem permissão para acessar esta área.</p>
      <p className="mt-4">
        <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
          ← Voltar para o início
        </Link>
      </p>
    </div>
  );
}