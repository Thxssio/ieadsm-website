// src/app/portal/features/UserFichaPDF.jsx
"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as PDFImage,
  pdf,
} from "@react-pdf/renderer";

/* ============================================================
   Identidade visual / Cores
   ============================================================ */
const COLOR_PRIMARY = "#2a3d57";
const COLOR_TEXT = "#1f2937";
const COLOR_MUTED = "#6b7280";
const COLOR_BORDER = "#e5e7eb";

/* Dimensões NATIVAS do SVG da logo */
const LOGO_NATIVE_W = 1640;
const LOGO_NATIVE_H = 924;
const LOGO_RATIO = LOGO_NATIVE_H / LOGO_NATIVE_W; // ≈ 0.5634

/* ============================================================
   Estilos
   ============================================================ */
const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, color: COLOR_TEXT, fontFamily: "Helvetica" },

  // Barra superior (logo + data)
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: `1 solid ${COLOR_BORDER}`,
  },
  // A logo recebe width/height via inline (respeitando proporção)
  logo: { objectFit: "contain" },
  churchSub: { fontSize: 9, color: COLOR_MUTED, textAlign: "right" },

  // Header
  header: { marginBottom: 16, padding: 10, borderRadius: 8, border: `1 solid ${COLOR_BORDER}` },
  headerRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 56, height: 56, borderRadius: 8, objectFit: "cover",
    border: `1 solid ${COLOR_BORDER}`, marginRight: 12,
  },
  titleWrap: { flexGrow: 1 },
  title: { fontSize: 14, fontWeight: 700 },
  subtitle: { fontSize: 10, color: COLOR_MUTED, marginTop: 2 },
  idInterno: { fontSize: 9, color: COLOR_MUTED, marginTop: 2 },

  section: { marginTop: 10, padding: 10, borderRadius: 8, border: `1 solid ${COLOR_BORDER}` },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLOR_PRIMARY, marginRight: 6 },
  sectionTitle: { fontSize: 12, fontWeight: 700, color: COLOR_PRIMARY },

  grid: { flexDirection: "row", flexWrap: "wrap" },
  col: { width: "48%", marginRight: "4%", marginBottom: 8 },
  colLastInRow: { marginRight: 0 },
  label: { fontSize: 8, color: COLOR_MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
  value: { fontSize: 11, marginTop: 2 },

  rowItem: {
    padding: 6, borderRadius: 6, border: `1 solid ${COLOR_BORDER}`, marginTop: 4,
    flexDirection: "row", justifyContent: "space-between",
  },

  pageFooter: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    fontSize: 9,
    color: COLOR_MUTED,
    textAlign: "center",
  },
});

/* ============================================================
   Componentes auxiliares
   ============================================================ */
function Field({ label, children, full = false, last = false }) {
  return (
    <View style={[styles.col, full && { width: "100%", marginRight: 0 }, last && styles.colLastInRow]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{children || "—"}</Text>
    </View>
  );
}

/* ============================================================
   Documento PDF
   ============================================================ */
export function UserFichaPDF({ data, maskCPF, photoSrc, logoSrc, logoWidth = 56 }) {
  const filhos = Array.isArray(data?.filhos) ? data.filhos : [];
  const dateStr = new Date().toLocaleDateString("pt-BR");

  // Calcula a altura respeitando o tamanho nativo do SVG (1640x924)
  const logoHeight = Math.round(logoWidth * LOGO_RATIO); // mantém proporção

  return (
    <Document title={`Ficha - ${data?.name || "Usuário"}`}>
      <Page size="A4" style={styles.page} wrap>
        {/* Topbar com logo proporcional e data */}
        <View style={styles.topbar} fixed>
          {logoSrc ? (
            <PDFImage
              src={logoSrc}
              style={[styles.logo, { width: logoWidth, height: logoHeight }]}
            />
          ) : (
            <View style={{ width: logoWidth, height: logoHeight, backgroundColor: "#f3f4f6" }} />
          )}
          <Text style={styles.churchSub}>Gerado em {dateStr}</Text>
        </View>

        {/* Header */}
        <View style={styles.header} wrap={false}>
          <View style={styles.headerRow}>
            {photoSrc ? (
              <PDFImage src={photoSrc} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: "#f3f4f6" }]} />
            )}
            <View style={styles.titleWrap}>
              <Text style={styles.title}>{data?.name || "—"}</Text>
              <Text style={styles.subtitle}>{data?.email || "—"}</Text>
              <Text style={styles.idInterno}>ID Interno: {data?.idInterno || "—"}</Text>
            </View>
          </View>
        </View>

        {/* Contato & Identificação */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.bullet} />
            <Text style={styles.sectionTitle}>Contato & Identificação</Text>
          </View>
          <View style={styles.grid}>
            <Field label="E-mail">{data?.email}</Field>
            <Field label="Telefone" last>{data?.telefone || "—"}</Field>
            <Field label="Celular">{data?.celular || "—"}</Field>
            <Field label="CPF" last>{data?.cpf ? maskCPF(data.cpf) : "—"}</Field>
            <Field label="RG">{data?.rg}</Field>
            <Field label="Título de Eleitor" last>{data?.tituloEleitor}</Field>
          </View>
        </View>

        {/* Endereço */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.bullet} />
            <Text style={styles.sectionTitle}>Endereço</Text>
          </View>
          <View style={styles.grid}>
            <Field label="Endereço" full>
              {(data?.endereco || "") +
                (data?.numero ? `, ${data.numero}` : "") +
                (data?.complemento ? ` ${data.complemento}` : "")}
            </Field>
            <Field label="Bairro">{data?.bairro}</Field>
            <Field label="Cidade/UF" last>
              {(data?.cidade || "") + (data?.uf ? ` - ${data?.uf}` : "")}
            </Field>
            <Field label="CEP">{data?.cep}</Field>
          </View>
        </View>

        {/* Dados Pessoais */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.bullet} />
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          </View>
          <View style={styles.grid}>
            <Field label="Sexo">{data?.sexo}</Field>
            <Field label="Nascimento" last>{data?.dataNascimento}</Field>
            <Field label="Nacionalidade">{data?.nacionalidade}</Field>
            <Field label="Profissão" last>{data?.profissao}</Field>
            <Field label="Grau de Instrução">{data?.grauInstrucao}</Field>
            <Field label="Naturalidade" last>{data?.naturalidade}</Field>
          </View>
        </View>

        {/* Filiação */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.bullet} />
            <Text style={styles.sectionTitle}>Filiação</Text>
          </View>
          <View style={styles.grid}>
            <Field label="Pai">
              {(data?.pai || "—") + (data?.cpfPai ? ` (${maskCPF(data.cpfPai)})` : "")}
            </Field>
            <Field label="Mãe" last>
              {(data?.mae || "—") + (data?.cpfMae ? ` (${maskCPF(data.cpfMae)})` : "")}
            </Field>
            <Field label="Órfão?" full>{data?.isOrphan ? "Sim" : "Não"}</Field>
          </View>
        </View>

        {/* Estado civil / Cônjuge */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.bullet} />
            <Text style={styles.sectionTitle}>Estado Civil / Cônjuge</Text>
          </View>
          <View style={styles.grid}>
            <Field label="Estado civil">{data?.estadoCivil}</Field>
            <Field label="Data casamento" last>{data?.dtCasamento}</Field>
            <Field label="Cônjuge">{data?.nomeConjuge}</Field>
            <Field label="CPF Cônjuge" last>{data?.cpfConjuge ? maskCPF(data.cpfConjuge) : "—"}</Field>
            <Field label="Profissão cônjuge">{data?.profissaoConjuge}</Field>
            <Field label="Nascimento cônjuge" last>{data?.dataNascimentoConjuge}</Field>
          </View>
        </View>

        {/* Filhos */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.bullet} />
            <Text style={styles.sectionTitle}>Filhos</Text>
          </View>
          {filhos.length ? (
            <View>
              {filhos.map((f, i) => (
                <View key={i} style={styles.rowItem}>
                  <Text>{f?.name || "—"}</Text>
                  <Text style={{ color: COLOR_MUTED }}>{f?.cpf ? maskCPF(f.cpf) : "—"}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ color: COLOR_MUTED }}>Sem filhos cadastrados.</Text>
          )}
        </View>

        {/* Informações da Igreja */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.bullet} />
            <Text style={styles.sectionTitle}>Informações da Igreja</Text>
          </View>
          <View style={styles.grid}>
            <Field label="Tipo de Registro">{data?.registroTipo}</Field>
            <Field label="Setor" last>{data?.setor}</Field>
            <Field label="Congregação">{data?.congregacao}</Field>
            <Field label="Origem" last>{data?.origem}</Field>
            <Field label="Informações adicionais" full>{data?.informacoes}</Field>
            <Field label="Data de conversão">{data?.dataConversao}</Field>
            <Field label="Batizado com o Espírito Santo?">
              {data?.batizadoEspiritoSanto ? "Sim" : "Não"}
            </Field>
            <Field label="Data do batismo no Espírito Santo" last>
              {data?.dataBatismoEspiritoSanto}
            </Field>
          </View>
        </View>

        {/* Batismo / Recebimento */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.bullet} />
            <Text style={styles.sectionTitle}>Batismo / Recebimento</Text>
          </View>
          <View style={styles.grid}>
            <Field label="Local do batismo">{data?.localBatismo}</Field>
            <Field label="Data do batismo" last>{data?.dataBatismo}</Field>
            <Field label="Recebimento">{data?.recebimento}</Field>
            <Field label="Data do recebimento" last>{data?.dataRecebimento}</Field>
          </View>
        </View>

        {/* LGPD */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.bullet} />
            <Text style={styles.sectionTitle}>LGPD</Text>
          </View>
          <View style={styles.grid}>
            <Field label="Autorização para tratamento de dados">
              {data?.autorizacao ? "Autorizado" : "Não autorizado"}
            </Field>
            <Field label="Family ID" last>{data?.familyId}</Field>
          </View>
        </View>

        {/* Rodapé */}
        <Text
          style={styles.pageFooter}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}

/* ============================================================
   Utilitários
   ============================================================ */
function absolutize(urlLike) {
  if (!urlLike) return null;
  try {
    return /^https?:\/\//i.test(urlLike)
      ? urlLike
      : new URL(urlLike, window.location.origin).href;
  } catch {
    return urlLike;
  }
}

async function toPngDataUrl(url) {
  const abs = absolutize(url);
  if (!abs) return null;

  try {
    const res = await fetch(abs, { mode: "cors", credentials: "omit", cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} ao buscar ${abs}`);
    const blob = await res.blob();

    const type = (blob.type || "").toLowerCase();
    const looksSvg = type.includes("svg") || /\.svg($|\?)/i.test(abs);

    // PNG/JPEG direto
    if (!looksSvg && (type.includes("png") || type.includes("jpeg") || type.includes("jpg"))) {
      const buf = await blob.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      return `data:${type || "image/png"};base64,${b64}`;
    }

    // SVG -> PNG mantendo proporção nativa
    if (looksSvg) {
      const svgText = await blob.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(svgText, "image/svg+xml");
      const svgEl = xml.documentElement;

      // Garante width/height no SVG
      svgEl.setAttribute("width", String(LOGO_NATIVE_W));
      svgEl.setAttribute("height", String(LOGO_NATIVE_H));

      const serialized = new XMLSerializer().serializeToString(svgEl);
      const fixedBlob = new Blob([serialized], { type: "image/svg+xml" });
      const urlObj = URL.createObjectURL(fixedBlob);

      const img = await new Promise((resolve, reject) => {
        const i = new window.Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = urlObj;
      });

      const canvas = document.createElement("canvas");
      canvas.width = LOGO_NATIVE_W;
      canvas.height = LOGO_NATIVE_H;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, LOGO_NATIVE_W, LOGO_NATIVE_H);

      URL.revokeObjectURL(urlObj);
      return canvas.toDataURL("image/png", 0.95);
    }

    // Outros formatos (ex.: WEBP) -> canvas
    try {
      const bmp = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      canvas.getContext("2d").drawImage(bmp, 0, 0);
      return canvas.toDataURL("image/png", 0.92);
    } catch {
      const objUrl = URL.createObjectURL(blob);
      const img = await new Promise((resolve, reject) => {
        const i = new window.Image();
        i.crossOrigin = "anonymous";
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = objUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      URL.revokeObjectURL(objUrl);
      return canvas.toDataURL("image/png", 0.92);
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

/* ============================================================
   Gera e baixa o PDF
   ============================================================ */
export async function downloadUserFichaPDF({ data, maskCPF, logoUrl, logoWidth = 56 }) {
  const [photoSrc, logoSrc] = await Promise.all([
    toPngDataUrl(data?.photoURL),
    toPngDataUrl(logoUrl),
  ]);

  const blob = await pdf(
    <UserFichaPDF
      data={data}
      maskCPF={maskCPF}
      photoSrc={photoSrc}
      logoSrc={logoSrc}
      logoWidth={logoWidth}
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Ficha - ${data?.name || "Usuario"}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
