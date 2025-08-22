"use client";

import React, { useMemo } from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image as PDFImage,
  StyleSheet,
  Svg,
  Rect,
  pdf,
} from "@react-pdf/renderer";
import { maskCPF } from "@/lib/utils/cpf";
import { churchInfo } from "@/lib/churchInfo";

/* Helpers */
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

async function sha256Hex(text) {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const enc = new TextEncoder().encode(text);
    const buf = await window.crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h >>> 0, 0x01000193) >>> 0;
  }
  return ("00000000" + h.toString(16)).slice(-8);
}

function BarcodeVisualPDF({ value, height = 50, width = 220 }) {
  const bars = useMemo(() => {
    const text = String(value ?? "000000");
    let hash = 0x811c9dc5 >>> 0;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash >>> 0, 0x01000193) >>> 0;
    }
    let x = hash >>> 0;
    const rand = () => {
      x ^= x << 13; x >>>= 0;
      x ^= x >>> 17; x >>>= 0;
      x ^= x << 5; x >>>= 0;
      return x >>> 0;
    };
    const out = [];
    let pos = 0;
    while (pos < width - 2) {
      const w = 2 + (rand() % 4);
      out.push({ x: pos, w });
      pos += w + 2;
    }
    return out;
  }, [value, width]);

  return (
    <Svg height={height} width={width}>
      {bars.map((b, i) => (
        <Rect key={i} x={b.x} y={0} width={b.w} height={height} fill="#000" />
      ))}
    </Svg>
  );
}

const MM = 72 / 25.4;
const CARD_W = 85.6 * MM; // largura real em mm
const CARD_H = 53.98 * MM; // altura real em mm

const styles = StyleSheet.create({
  page: { width: CARD_W, height: CARD_H, fontFamily: "Helvetica", color: "#0f172a" },
  card: { flexDirection: "column", border: "1 solid #d1d5db", borderRadius: 4, overflow: "hidden" },
  header: { backgroundColor: "#afd0de", paddingVertical: 6, alignItems: "center" },
  headerText: { fontSize: 14, fontWeight: 700, color: "#36435a" },
  body: { flexGrow: 1, padding: 12, justifyContent: "space-between" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 8, color: "#1f2937" },
  data: { fontSize: 11, fontWeight: 700 },
  dividerThick: { borderTop: "4 solid #36435a", marginHorizontal: -12 },
  dividerThin: { borderTop: "1 solid #d1d5db", marginHorizontal: -12 },
  photo: { width: 105, height: 130, border: "1 solid #36435a" },
  logo: { width: 60, height: 60 },
  backHeader: { backgroundColor: "#afd0de", padding: 8 },
  smallText: { fontSize: 8 },
  sign: { marginTop: 40, borderTop: "1 solid #0f172a", alignItems: "center", paddingTop: 4 },
  barcodeText: { fontSize: 12, fontWeight: 700, textAlign: "center", marginTop: 6 },
});

function CardFront({
  id,
  role,
  issuedAt,
  name,
  memberSince,
  photoSrc,
  logoSrc,
}) {
  const title = isMinisterRole(role)
    ? "CREDENCIAL DE MINISTRO"
    : "CREDENCIAL DE MEMBRO";
  return (
    <View style={styles.card} wrap={false}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.row}>
          {photoSrc ? (
            <PDFImage src={photoSrc} style={styles.photo} />
          ) : (
            <View style={[styles.photo, { backgroundColor: "#f9fafb" }]} />
          )}
          {logoSrc ? (
            <PDFImage src={logoSrc} style={styles.logo} />
          ) : (
            <View style={[styles.logo, { backgroundColor: "#f3f4f6" }]} />
          )}
        </View>
        <View style={styles.dividerThick} />
        <View style={[styles.row, { marginTop: 6 }]}>
          <View>
            <Text style={styles.label}>ID</Text>
            <Text style={styles.data}>{id}</Text>
          </View>
          <View>
            <Text style={styles.label}>Cargo</Text>
            <Text style={styles.data}>{role}</Text>
          </View>
          <View>
            <Text style={styles.label}>Expedida em</Text>
            <Text style={styles.data}>{fmtDateish(issuedAt)}</Text>
          </View>
        </View>
        <View style={styles.dividerThin} />
        <View style={[styles.row, { alignItems: "flex-end" }]}>
          <View>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.data}>{name}</Text>
          </View>
          <View>
            <Text style={styles.label}>Membro desde</Text>
            <Text style={styles.data}>{fmtDateish(memberSince)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function CardBack({
  parents,
  birthDate,
  maritalStatus,
  cpf,
  rg,
  signerName,
  signerRole,
  addressLine,
  codePayload,
}) {
  const addressText = stringifyAddressLine(addressLine);
  return (
    <View style={styles.card} wrap={false}>
      <View style={styles.backHeader}>
        <View style={styles.row}>
          <View>
            <Text style={styles.smallText}>Filiação</Text>
            {parents?.father && <Text style={styles.smallText}>{parents.father}</Text>}
            {parents?.mother && <Text style={styles.smallText}>{parents.mother}</Text>}
            {!parents?.father && !parents?.mother && (
              <Text style={[styles.smallText, { color: "#6b7280" }]}>—</Text>
            )}
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={styles.smallText}>Nascido em</Text>
            <Text style={styles.smallText}>{fmtDateish(birthDate)}</Text>
          </View>
        </View>
        <View style={[styles.row, { marginTop: 4 }]}>
          <View>
            <Text style={styles.smallText}>Estado Civil</Text>
            <Text style={styles.smallText}>{maritalStatus || "—"}</Text>
          </View>
          <View>
            <Text style={styles.smallText}>CPF</Text>
            <Text style={styles.smallText}>{cpf || "—"}</Text>
          </View>
          <View>
            <Text style={styles.smallText}>RG</Text>
            <Text style={styles.smallText}>{rg || "—"}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.body, { alignItems: "center", justifyContent: "flex-end" }]}>
        <View style={{ width: 160, marginBottom: 12 }}>
          <View style={styles.sign}>
            <Text style={{ fontSize: 12, fontWeight: 700 }}>{signerName}</Text>
            <Text style={{ fontSize: 10, color: "#374151" }}>{signerRole}</Text>
          </View>
        </View>
        {addressText ? (
          <Text style={[styles.smallText, { textAlign: "center", marginBottom: 6 }]}>{addressText}</Text>
        ) : null}
        <Text style={styles.barcodeText}>{String(codePayload)}</Text>
        <BarcodeVisualPDF value={codePayload} height={50} width={220} />
      </View>
    </View>
  );
}

export function MemberCardPDF(props) {
  return (
    <Document title={`Carteirinha - ${props.name || "Membro"}`}>
      <Page size={{ width: CARD_W, height: CARD_H }} style={styles.page}>
        <CardFront {...props} />
      </Page>
      <Page size={{ width: CARD_W, height: CARD_H }} style={styles.page}>
        <CardBack {...props} />
      </Page>
    </Document>
  );
}

async function toPngDataUrl(url) {
  try {
    if (!url) return null;
    const res = await fetch(url);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

async function generateBarcodePayload({ id, barcodeSalt = "IEADSM-2025", barcodeValue }) {
  if (barcodeValue) return String(barcodeValue);
  const hex = await sha256Hex(`${barcodeSalt}|${id}`);
  const base36 = BigInt("0x" + hex.slice(0, 14)).toString(36).toUpperCase().padStart(10, "0");
  const suffix = String(id).toString().slice(-4).padStart(4, "0");
  return `${base36}${suffix}`;
}

export async function downloadMemberCardPDF({ data, logoUrl, barcodeSalt = "IEADSM-2025" }) {
  const [photoSrc, logoSrc, codePayload] = await Promise.all([
    toPngDataUrl(data?.photoURL),
    toPngDataUrl(logoUrl),
    generateBarcodePayload({ id: data?.idInterno || data?.id, barcodeSalt }),
  ]);

  const blob = await pdf(
    <MemberCardPDF
      id={data?.idInterno || data?.id}
      role={data?.role || "Membro"}
      issuedAt={new Date()}
      name={data?.name || ""}
      memberSince={data?.memberSince || data?.dataBatismo}
      photoSrc={photoSrc}
      logoSrc={logoSrc}
      parents={{ father: data?.pai, mother: data?.mae }}
      birthDate={data?.dataNascimento}
      maritalStatus={data?.estadoCivil}
      cpf={data?.cpf ? maskCPF(data.cpf) : ""}
      rg={data?.rg}
      signerName="Pr. Moisés Adriano Lamberty"
      signerRole="Pastor Presidente"
      addressLine={churchInfo.address}
      codePayload={codePayload}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Carteirinha - ${data?.name || "Usuario"}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

