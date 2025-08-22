"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { churchInfo } from "@/lib/churchInfo";

/* ===================== Helpers ===================== */

function fmtDateish(value) {
  try {
    if (!value) return "—";
    if (typeof value === "string") {
      if (/^0001-01-01/.test(value)) return "—";
      return value;
    }
    if (typeof value === "number") return String(value);
    if (value instanceof Date) {
      const y = value.getFullYear();
      if (y < 1900) return "—";
      return new Intl.DateTimeFormat("pt-BR").format(value);
    }
    if (typeof value === "object" && typeof value.seconds === "number") {
      const d = new Date(value.seconds * 1000);
      const y = d.getFullYear();
      if (y < 1900) return "—";
      return new Intl.DateTimeFormat("pt-BR").format(d);
    }
    return String(value);
  } catch {
    return "—";
  }
}

function normalize(s = "") {
  return String(s).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}
function isMinisterRole(role) {
  const r = normalize(role);
  return r.includes("pastor") || r.includes("diacon") || r.includes("presb");
}

// stringifica addressLine aceitando string ou objeto {street, number, ...}
function stringifyAddressLine(addr) {
  if (!addr) return "";
  if (typeof addr === "string") return addr.trim();
  if (typeof addr === "object") {
    const p = [];
    if (addr.street) p.push(addr.street);
    if (addr.number) p.push(addr.number);
    const left = p.length ? p.join(", ") : "";
    const right = [
      addr.neighborhood,
      addr.city && addr.state ? `${addr.city} - ${addr.state}` : addr.city || "",
    ]
      .filter(Boolean)
      .join(" • ");
    const zip = addr.zip ? `CEP ${addr.zip}` : "";
    return [left, right, zip].filter(Boolean).join(" • ");
  }
  return String(addr);
}

// SHA-256 → hex (browser only). Fallback: FNV-1a 32
async function sha256Hex(text) {
  try {
    if (typeof window !== "undefined" && window.crypto?.subtle) {
      const enc = new TextEncoder().encode(text);
      const buf = await window.crypto.subtle.digest("SHA-256", enc);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {}
  // fallback FNV-1a 32
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h >>> 0, 0x01000193) >>> 0;
  }
  return ("00000000" + h.toString(16)).slice(-8);
}

/* =============== Barcode components ================= */

// decorativo (determinístico, não escaneável)
function BarcodeVisual({ value, height = 50, width = 220, className = "" }) {
  const bars = useMemo(() => {
    const text = String(value ?? "000000");
    // semente FNV-1a
    let hash = 0x811c9dc5 >>> 0;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash >>> 0, 0x01000193) >>> 0;
    }
    let x = hash >>> 0;
    const rand = () => {
      x ^= x << 13; x >>>= 0;
      x ^= x >>> 17; x >>>= 0;
      x ^= x << 5;  x >>>= 0;
      return x >>> 0;
    };
    const out = [];
    let pos = 0;
    while (pos < width - 2) {
      const w = 2 + (rand() % 4); // 2..5
      out.push({ x: pos, w });
      pos += w + 2;
    }
    return out;
  }, [value, width]);

  return (
    <svg height={height} width={width} className={`mx-auto ${className}`} aria-label="barcode-decorativo">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={height} style={{ fill: "black" }} />
      ))}
    </svg>
  );
}

// escaneável (Code128) via jsbarcode – carregado no cliente
function BarcodeCode128({ value, height = 50, width = 220, className = "" }) {
  const svgRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const JsBarcode = (await import("jsbarcode")).default;
        if (!mounted || !svgRef.current) return;
        JsBarcode(svgRef.current, String(value ?? ""), {
          format: "CODE128",
          height,
          width: Math.max(1, Math.floor(width / 220)), // aproximação da largura total
          displayValue: false,
          margin: 0,
        });
      } catch {
        // se falhar, deixa o visual
        if (svgRef.current) {
          const placeholder = document.createElementNS("http://www.w3.org/2000/svg", "text");
          placeholder.setAttribute("x", "0");
          placeholder.setAttribute("y", String(height / 2));
          placeholder.textContent = "barcode";
          svgRef.current.appendChild(placeholder);
        }
      }
    })();
    return () => { mounted = false; };
  }, [value, height, width]);

  return <svg ref={svgRef} height={height} width={width} className={`mx-auto ${className}`} aria-label="barcode-code128" />;
}

/* =================== Componente ===================== */

export default function MemberCard({
  side = "both",
  // Frente
  id = "000000",
  role = "Membro",
  issuedAt = "00/00/0000",
  name = "Nome do Membro",
  memberSince = "",
  photoUrl = "",
  logoUrl = "/icon.svg",
  // Verso
  parents = { father: "", mother: "" },
  birthDate = "",
  maritalStatus = "",
  cpf = "",
  rg = "",
  signerName = "Pr. Moisés Adriano Lamberty",
  signerRole = "Pastor Presidente",
  addressLine = churchInfo.address,
  // Barcode
  barcodeMode = "visual", // "visual" | "code128"
  barcodeSalt = "IEADSM-2025",
  barcodeValue,          // se quiser forçar o que será codificado/scaneado
  className = "",
}) {
  const showFront = side === "front" || side === "both";
  const showBack = side === "back" || side === "both";

  const hasPhoto = Boolean(photoUrl);
  const hasLogo = Boolean(logoUrl);
  const title = isMinisterRole(role) ? "CREDENCIAL DE MINISTRO" : "CREDENCIAL DE MEMBRO";
  const addressText = stringifyAddressLine(addressLine);

  // gera payload único para o código (usa SHA-256 do [salt|id])
  const [codePayload, setCodePayload] = useState(barcodeValue || id);
  useEffect(() => {
    let alive = true;
    (async () => {
      if (barcodeValue) { setCodePayload(String(barcodeValue)); return; }
      const hex = await sha256Hex(`${barcodeSalt}|${id}`);
      // exemplo de payload curto e legível (12 chars base36 do hash + sufixo do id)
      const base36 = BigInt("0x" + hex.slice(0, 14)).toString(36).toUpperCase().padStart(10, "0");
      const suffix = String(id).toString().slice(-4).padStart(4, "0");
      const payload = `${base36}${suffix}`; // 14 chars
      if (alive) setCodePayload(payload);
    })();
    return () => { alive = false; };
  }, [barcodeSalt, id, barcodeValue]);

  return (
    <div className={`cards-wrapper ${className}`}>
      {/* estilos auxiliares para fidelidade visual e forçar texto escuro */}
      <style jsx global>{`
        .card-container {
          width: 550px; /* 85.6mm aprox */
          height: 345px;
          aspect-ratio: 85.6 / 53.98;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
          border-radius: 0.5rem;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background-color: #ffffff;
          border: 1px solid #d1d5db;
          color: #0f172a; /* força base escura */
        }
        .card-container p,
        .card-container span,
        .card-container h1,
        .card-container h2,
        .card-container h3,
        .card-container div { color: inherit; }
        .bg-card-header-blue { background-color: #afd0de; }
        .border-card-divider-thick { border-color: #36435a; }
        .text-card-label { color: #1f2937; font-size: 0.78rem; font-weight: 600; }
        .text-card-data { color: #0f172a; font-size: 1.08rem; font-weight: 700; }
        .text-card-header { color: #36435a; font-weight: 700; }
        .logo-container { width: 60px; height: 60px; }
        .photo-placeholder { width: 105px; height: 130px; border: 1px solid #36435a; background-color: #f9fafb; overflow: hidden; }
        .cards-wrapper { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; padding: 2rem; }
        @media print {
          .cards-wrapper { background: transparent !important; padding: 0 !important; }
        }
      `}</style>

      {showFront && (
        <div className="card-container" id="card-front">
          {/* Cabeçalho */}
          <header className="bg-card-header-blue py-3 text-center">
            <h1 className="text-2xl tracking-wider text-card-header">{title}</h1>
          </header>

          {/* Corpo Principal */}
          <main className="p-5 flex flex-col flex-grow justify-between text-slate-900">
            {/* Seção Superior com Foto e Logo */}
            <div className="flex justify-between items-center mb-4">
              <div className="photo-placeholder">
                {hasPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500 grid place-items-center w-full h-full">Foto</span>
                )}
              </div>
              <div className="logo-container">
                {hasLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">Logo</div>
                )}
              </div>
            </div>

            {/* Divisor (grosso) */}
            <div className="border-t-4 border-card-divider-thick -mx-5" />

            {/* Informações de ID, Cargo e Expedição */}
            <section className="flex justify-between text-left">
              <div>
                <p className="text-card-label">ID</p>
                <p className="text-card-data">{id}</p>
              </div>
              <div>
                <p className="text-card-label">Cargo</p>
                <p className="text-card-data">{role}</p>
              </div>
              <div>
                <p className="text-card-label">Expedida em</p>
                <p className="text-card-data">{fmtDateish(issuedAt)}</p>
              </div>
            </section>

            {/* Divisor (fino) */}
            <div className="border-t border-gray-300 -mx-5" />

            {/* Informações de Nome e Membro */}
            <section className="flex justify-between items-end">
              <div>
                <p className="text-card-label">Nome</p>
                <p className="text-card-data">{name}</p>
              </div>
              <div>
                <p className="text-card-label">Membro desde</p>
                <p className="text-card-data">{fmtDateish(memberSince)}</p>
              </div>
            </section>
          </main>
        </div>
      )}

      {showBack && (
        <div className="card-container" id="card-back">
          {/* Seção Superior de Informações */}
          <section className="bg-card-header-blue p-3 text-slate-900">
            <div className="space-y-2 text-xs font-bold">
              {/* Linha 1: Filiação e Nascido em */}
              <div className="flex justify-between">
                <div>
                  <p className="font-normal">Filiação</p>
                  {parents?.father && <p>{parents.father}</p>}
                  {parents?.mother && <p>{parents.mother}</p>}
                  {!parents?.father && !parents?.mother && <p className="text-[10px] text-gray-700">—</p>}
                </div>
                <div className="text-right">
                  <p className="font-normal">Nascido em</p>
                  <p>{fmtDateish(birthDate)}</p>
                </div>
              </div>

              {/* Linha 2: Documentos */}
              <div className="grid grid-cols-3 gap-x-2">
                <div>
                  <span className="font-normal">Estado Civil</span>
                  <br />
                  {maritalStatus || "—"}
                </div>
                <div>
                  <span className="font-normal">CPF</span>
                  <br />
                  {cpf || "—"}
                </div>
                <div>
                  <span className="font-normal">RG</span>
                  <br />
                  {rg || "—"}
                </div>
              </div>
            </div>
          </section>

          {/* Corpo Principal */}
          <main className="p-4 flex flex-col flex-grow items-center text-center text-slate-900">
            {/* Assinatura */}
            <section className="w-full max-w-xs mt-12">
              <div className="border-t border-gray-800 w-full mb-1" />
              <p className="font-bold text-lg">{signerName}</p>
              <p className="text-sm text-gray-700">{signerRole}</p>
            </section>

            {/* Conteúdo Inferior */}
            <div className="mt-auto mb-2">
              {/* Endereço */}
              {addressText ? (
                <section className="mb-4">
                    <p className="text-xs text-gray-800 dark:text-gray-200">{addressText}</p>
                </section>
              ) : null}

              {/* Código de Barras */}
              <section>
                <p className="font-bold text-lg tracking-widest">{String(codePayload)}</p>
                {barcodeMode === "code128" ? (
                  <BarcodeCode128 value={codePayload} height={50} width={220} />
                ) : (
                  <BarcodeVisual value={codePayload} height={50} width={220} />
                )}
              </section>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
