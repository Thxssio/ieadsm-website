"use client";

export default function SummaryCard({ form, photoURL }) {
  const src = photoURL || "/avatar-3x4.png"; // coloque um placeholder em /public/images/

  const items = [
    { k: "ID Interno",   v: form.idInterno }, // novo campo
    { k: "Nome",         v: form.name },
    { k: "CPF",          v: form.cpf },
    { k: "Congregação",  v: form.congregacao },
    { k: "Setor",        v: form.setor },
    { k: "Cidade/UF",    v: [form.cidade, form.uf].filter(Boolean).join(" / ") },
    { k: "Qtde Filhos",  v: form.qtdeFilhos },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Resumo</h3>

        {/* Foto 3x4 miniatura */}
        <div className="relative w-12 h-16 overflow-hidden rounded-md ring-1 ring-slate-200 bg-slate-100">
          <img
            src={src}
            alt="Foto 3x4"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      <ul className="space-y-2">
        {items.map(({ k, v }) => (
          <li key={k} className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{k}</span>
            <span className="text-slate-900 font-medium">{v || "—"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
