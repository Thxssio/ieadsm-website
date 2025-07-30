"use client";

import dynamic from "next/dynamic";

const PdfFlipbook = dynamic(() => import("./PdfFlipbook"), {
  ssr: false,
  loading: () => <div className="text-center py-10">Carregando agenda…</div>,
});

export default function EventsViewer({ pdfUrl }) {
  return (
    <PdfFlipbook
      fileUrl={pdfUrl}
      singlePageBreakpoint={768}
      // bottomGapPx={32}
    />
  );
}
