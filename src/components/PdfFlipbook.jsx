"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });
const Document     = dynamic(() => import("react-pdf").then(m => m.Document), { ssr: false });
const PDFPage      = dynamic(() => import("react-pdf").then(m => m.Page),     { ssr: false });

export default function PdfFlipbook({
  fileUrl,
  bottomGapPx = 32,          // espaço extra para rodapé do site (se houver)
  singlePageBreakpoint = 768 // ≤ px => 1 página; > px => 2 páginas
}) {
  const [pdfReady, setPdfReady] = useState(false);
  const [numPages, setNumPages] = useState(0);

  // Flipbook
  const [page, setPage] = useState(1); // 1-based
  const [totalPage, setTotalPage] = useState(0);
  const apiRef  = useRef(null);

  // Layout
  const wrapRef = useRef(null);
  const rafRef  = useRef(0);
  const base = useMemo(() => ({ w: 600 }), []);
  const [ratio, setRatio] = useState(1.4142); // A4 ~ 1.4142
  const [pvw, setPvw] = useState(base.w);                     // width de 1 pág
  const [pvh, setPvh] = useState(Math.round(base.w * ratio)); // height de 1 pág
  const initialSingle =
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${singlePageBreakpoint}px)`).matches
      : true;
  const [usePortrait, setUsePortrait] = useState(initialSingle);
  const [layoutReady, setLayoutReady] = useState(false);

  // Busca
  const pdfjsRef = useRef(null);
  const pageTextsRef = useRef([]); // textos por página (lowercase)
  const [indexReady, setIndexReady] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [matches, setMatches] = useState([]);
  const [matchIdx, setMatchIdx] = useState(0);

  // Worker local do PDF.js
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { pdfjs } = await import("react-pdf");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"; // copie para /public
      pdfjsRef.current = pdfjs;
      if (mounted) setPdfReady(true);
    })();
    return () => { mounted = false; };
  }, []);

  // ResizeObserver: calcula tamanho do livro para caber no wrapRef
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const calc = () => {
      const wrapW = el.clientWidth;
      const wrapH = el.clientHeight;

      const singlePage =
        typeof window !== "undefined"
          ? window.matchMedia(`(max-width: ${singlePageBreakpoint}px)`).matches
          : wrapW < singlePageBreakpoint;

      const pageBaseW = base.w;
      const pageBaseH = Math.round(base.w * ratio);

      let newW, newH;

      if (singlePage) {
        const s = Math.min(wrapW / pageBaseW, wrapH / pageBaseH);
        let w = Math.max(280, Math.round(pageBaseW * s));
        let h = Math.max(360, Math.round(pageBaseH * s));
        if (h <= w) h = w + 24; // força retrato
        newW = w; newH = h;
      } else {
        const bookBaseW = pageBaseW * 2;
        const bookBaseH = pageBaseH;
        const s = Math.min(wrapW / bookBaseW, wrapH / bookBaseH);
        newW = Math.max(280, Math.round(pageBaseW * s));
        newH = Math.max(360, Math.round(pageBaseH * s));
      }

      setUsePortrait(prev => (prev !== singlePage ? singlePage : prev));
      setPvw(prev => (prev !== newW ? newW : prev));
      setPvh(prev => (prev !== newH ? newH : prev));
    };

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(calc);
    });

    ro.observe(el);
    calc();
    setLayoutReady(true);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [base.w, ratio, singlePageBreakpoint]);

  // Proporção real do PDF na 1ª página
  const handleFirstPageLoaded = (pdfPage) => {
    try {
      const v = pdfPage.getViewport({ scale: 1 });
      const r = v.height / v.width;
      if (Number.isFinite(r) && Math.abs(r - ratio) > 0.001) setRatio(r);
    } catch {}
  };

  // Indexação (pode ser chamada pelo botão Buscar)
  const buildIndex = async () => {
    if (!pdfReady || !pdfjsRef.current || !numPages) return false;
    setIndexing(true);
    setIndexReady(false);
    setIndexProgress(0);
    try {
      const pdf = await pdfjsRef.current.getDocument(fileUrl).promise;
      const texts = [];
      for (let i = 1; i <= numPages; i++) {
        const p = await pdf.getPage(i);
        const tc = await p.getTextContent();
        const txt = tc.items.map(it => it.str).join(" ").toLowerCase();
        texts.push(txt);
        setIndexProgress(Math.round((i / numPages) * 100));
      }
      pageTextsRef.current = texts;
      setIndexReady(true);
      return true;
    } catch (err) {
      console.error("Index error:", err);
      pageTextsRef.current = [];
      setIndexReady(false);
      return false;
    } finally {
      setIndexing(false);
    }
  };

  // Auto‑index quando carrega (ok no desktop)
  useEffect(() => {
    if (pdfReady && numPages) {
      buildIndex();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfReady, numPages, fileUrl]);

  // Navegação
  const gotoPage = (p) => {
    const total = totalPage || numPages || 1;
    const idx = Math.min(Math.max(0, (p || 1) - 1), total - 1);
    apiRef.current?.flip(idx);
  };
  const next = () => apiRef.current?.flipNext();
  const prev = () => apiRef.current?.flipPrev();

  // Entrada "Ir para página"
  const [pageInput, setPageInput] = useState("1");
  useEffect(() => setPageInput(String(page)), [page]);
  const handleGo = () => {
    const n = parseInt(pageInput, 10);
    if (!Number.isFinite(n)) return;
    gotoPage(n);
  };

  // Busca (funciona mesmo se o índice ainda não estiver pronto)
  const runSearch = async () => {
    const term = (searchTerm || "").trim().toLowerCase();
    if (!term) return;
    if (!indexReady) {
      const ok = await buildIndex();
      if (!ok) return;
    }
    const found = pageTextsRef.current
      .map((t, i) => (t && t.includes(term) ? i : -1))
      .filter((i) => i >= 0);
    setMatches(found);
    setMatchIdx(0);
    if (found.length) gotoPage(found[0] + 1);
  };
  const nextMatch = () => {
    if (!matches.length) return;
    const i = (matchIdx + 1) % matches.length;
    setMatchIdx(i);
    gotoPage(matches[i] + 1);
  };
  const prevMatch = () => {
    if (!matches.length) return;
    const i = (matchIdx - 1 + matches.length) % matches.length;
    setMatchIdx(i);
    gotoPage(matches[i] + 1);
  };

  // estilos (controles abaixo do livro)
  const controlsWrap = "mt-4 mx-auto w-full max-w-4xl";
  const controls =
    "flex flex-wrap items-center justify-center gap-3 p-2 md:p-3 rounded-2xl bg-white ring-1 ring-stone-200 shadow";
  const btn =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-stone-900 text-sm md:text-base font-medium ring-1 ring-stone-300 shadow-sm hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-40 disabled:cursor-not-allowed";
  const btnPrimary =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-sm md:text-base font-semibold shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-40";
  const input =
    "px-3 py-2 rounded-xl bg-white text-stone-900 text-sm md:text-base ring-1 ring-stone-300 shadow-sm text-center w-20 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500";
  const inputWide =
    "px-3 py-2 rounded-xl bg-white text-stone-900 text-sm md:text-base ring-1 ring-stone-300 shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sky-500 w-full md:w-64";

  // Altura do componente ocupa a janela menos o rodapé do site (se houver)
  const containerHeight = `calc(100dvh - ${bottomGapPx}px)`;

  return (
    <div className="w-full mx-auto flex flex-col" style={{ height: containerHeight }}>
      {/* Livro: ocupa o espaço disponível acima dos controles */}
      <div ref={wrapRef} className="flex-1 flex items-center justify-center overflow-hidden">
        {pdfReady && (
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(e) => console.error("PDF error:", e)}
            loading={
              <div className="grid place-items-center rounded-2xl border-4 border-white shadow-2xl bg-white/70 w-[min(100%,64rem)] h-[70vh]">
                <span className="text-stone-700">Carregando PDF…</span>
              </div>
            }
          >
            {layoutReady && numPages > 0 && (
              <HTMLFlipBook
                key={`flip-${numPages}-${usePortrait ? "p" : "l"}`}
                width={pvw}
                height={pvh}
                size="fixed"
                usePortrait={usePortrait}
                drawShadow
                minWidth={200}
                minHeight={260}
                maxWidth={1600}
                maxHeight={2000}
                showCover={false}
                mobileScrollSupport
                className="rounded-2xl border-4 border-white shadow-2xl bg-white"
                style={{ backgroundColor: "white" }}
                onInit={(e) => {
                  const pf = e.object;
                  apiRef.current = pf;
                  setTotalPage(pf.getPageCount());
                  setPage(pf.getCurrentPageIndex() + 1);
                }}
                onFlip={(e) => setPage(e.data + 1)}
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <div key={`p-${i + 1}`} style={{ width: "100%", height: "100%" }}>
                    <div style={{ width: "100%", height: "100%" }}>
                      <PDFPage
                        pageNumber={i + 1}
                        width={pvw}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading=""
                        {...(i === 0 ? { onLoadSuccess: handleFirstPageLoaded } : {})}
                      />
                    </div>
                  </div>
                ))}
              </HTMLFlipBook>
            )}
          </Document>
        )}
      </div>

      {/* Controles abaixo do livro */}
      <div className={controlsWrap}>
        <div className={controls}>
          <button type="button" onClick={prev} className={btn}>◀︎ Anterior</button>

          <div className="flex items-center gap-2">
            <input
              className={input}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGo()}
              aria-label="Ir para página"
              inputMode="numeric"
            />
            <span className="text-sm md:text-base text-stone-700">
              / {totalPage || numPages || "…"}
            </span>
            <button type="button" onClick={handleGo} className={btnPrimary}>Ir</button>
          </div>

          <button type="button" onClick={next} className={btn}>Próxima ▶︎</button>

          {/* Download */}
          <a href={fileUrl} download className={btn} aria-label="Baixar PDF">
            ⬇︎ Baixar PDF
          </a>

          {/* quebra de linha no mobile */}
          <div className="w-full h-0 basis-full md:hidden" />

          {/* Busca (form para Enter funcionar no celular) */}
          <form
            onSubmit={(e) => { e.preventDefault(); runSearch(); }}
            className="flex w-full md:w-auto items-center gap-2"
          >
            <input
              className={inputWide}
              placeholder={indexing ? `Indexando… ${indexProgress}%` : "Buscar texto..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar no PDF"
            />
            <button type="submit" className={btnPrimary}>
              {indexing ? "Aguarde…" : "Buscar"}
            </button>
            <button type="button" onClick={prevMatch} className={btn} disabled={!matches.length || indexing}>‹</button>
            <span className="text-sm md:text-base text-stone-900 w-20 text-center">
              {matches.length ? `${matchIdx + 1} de ${matches.length}` : "0 de 0"}
            </span>
            <button type="button" onClick={nextMatch} className={btn} disabled={!matches.length || indexing}>›</button>
          </form>
        </div>
      </div>

      {/* margem para não colidir com rodapé do site */}
      <div style={{ height: bottomGapPx }} />
    </div>
  );
}
