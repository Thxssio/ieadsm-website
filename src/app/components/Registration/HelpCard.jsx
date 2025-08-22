// components/Registration/HelpCard.jsx
"use client";

export default function HelpCard() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Dicas</h3>
      <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-5">
        <li>Use os dados conforme documentos oficiais.</li>
        <li>CPF: apenas números, valide antes de salvar.</li>
        <li>Revise todas as seções antes de enviar.</li>
      </ul>
    </div>
  );
}
