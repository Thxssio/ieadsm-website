// components/Registration/HelpCard.jsx
"use client";

export default function HelpCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-2">Dicas</h3>
      <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
        <li>Use os dados conforme documentos oficiais.</li>
        <li>CPF: apenas números, valide antes de salvar.</li>
        <li>Revise todas as seções antes de enviar.</li>
      </ul>
    </div>
  );
}
