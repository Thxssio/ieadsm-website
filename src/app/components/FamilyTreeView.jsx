"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

/**
 * FamilyTreeView (design aprimorado)
 * - Toolbar com zoom, fit, re-layout e colapsar/expandir tudo
 * - Busca por nome/label com highlight
 * - Tema claro/escuro automático (respeita prefers-color-scheme) + classes Tailwind
 * - Layout principal breadthfirst (com fallback para dagre, se extensão disponível)
 * - Estilo de nós por gênero/flag (gender: 'M'|'F'|'U'; alive: boolean; root: boolean)
 * - Animações suaves, bordas arredondadas, sombras e estados de seleção/hover
 * - Responsivo e com resize handler
 */

export default function FamilyTreeView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [layoutName, setLayoutName] = useState<string>("breadthfirst");

  // -------- Helpers --------
  const fetchData = useCallback(async () => {
    const res = await fetch("/api/family-tree");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data?.elements ?? [];
  }, []);

  const loadCytoscape = useCallback(async () => {
    const cytoscape = (await import("cytoscape")).default;
    // Tentativa opcional de carregar o dagre p/ hierarquia mais estável
    try {
      const dagre = (await import("cytoscape-dagre")).default;
      dagre(cytoscape);
    } catch (_) {}
    // Panzoom opcional (se disponível)
    try {
      const panzoom = (await import("cytoscape-panzoom")).default;
      panzoom(cytoscape);
    } catch (_) {}
    return cytoscape;
  }, []);

  const makeLayout = useCallback(
    (name: string) => {
      if (name === "dagre") {
        return { name: "dagre", rankDir: "TB", nodeSep: 30, rankSep: 60, edgeSep: 10, fit: true, padding: 20, animate: true } as any;
      }
      if (name === "cose") {
        return { name: "cose", fit: true, padding: 30, animate: true } as any;
      }
      // default breadthfirst
      return { name: "breadthfirst", directed: true, padding: 20, animate: true, spacingFactor: 1.2 } as any;
    },
    []
  );

  const baseStyles = useMemo(() => {
    // Paleta tailwind-ish
    const male = "#2563eb"; // blue-600
    const female = "#db2777"; // pink-600
    const unknown = "#4b5563"; // gray-600
    const root = "#16a34a"; // green-600
    const edge = "#94a3b8"; // slate-400

    return [
      {
        selector: "node",
        style: {
          label: "data(label)",
          "text-valign": "center",
          "text-halign": "center",
          "font-size": 12,
          color: "#fff",
          "text-wrap": "wrap",
          "text-max-width": 120,
          shape: "round-rectangle",
          width: "label",
          height: "label",
          padding: "8px 10px",
          "border-width": 2,
          "border-color": "#0f172a33", // slate-950/20
          "background-color": unknown,
          "shadow-blur": 8,
          "shadow-color": "#00000040",
          "shadow-opacity": 0.6,
          "shadow-offset-x": 0,
          "shadow-offset-y": 2,
          transitionProperty: "background-color, line-color, target-arrow-color, width, height",
          transitionDuration: "200ms",
        },
      },
      { selector: "node[gender = 'M']", style: { "background-color": male } },
      { selector: "node[gender = 'F']", style: { "background-color": female } },
      { selector: "node[root = 'true']", style: { "background-color": root, "border-color": "#16a34a", "border-width": 3 } },
      { selector: "node[alive = 'false']", style: { "background-opacity": 0.55, "border-style": "dashed" } },
      { selector: "node:selected", style: { "border-color": "#f59e0b", "border-width": 4 } },
      { selector: "node.hover", style: { "border-color": "#38bdf8", "border-width": 4 } },

      {
        selector: "edge",
        style: {
          width: 2,
          "line-color": edge,
          "target-arrow-color": edge,
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          opacity: 0.9,
        },
      },
      { selector: "edge:selected", style: { "line-color": "#f59e0b", "target-arrow-color": "#f59e0b", width: 3 } },
      // Destaque de busca
      { selector: ".search-hit", style: { "background-color": "#f59e0b", color: "#111827" } },
    ];
  }, []);

  // -------- Init --------
  useEffect(() => {
    let cy: any;
    let destroyed = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [elements, cytoscape] = await Promise.all([fetchData(), loadCytoscape()]);
        if (destroyed) return;

        cy = cytoscape({
          container: containerRef.current,
          elements,
          style: baseStyles as any,
          layout: makeLayout(layoutName),
          wheelSensitivity: 0.2,
          selectionType: "single",
          userZoomingEnabled: true,
          pixelRatio: 1,
        });

        cyRef.current = cy;

        // Hover visual
        cy.on("mouseover", "node", (e: any) => e.target.addClass("hover"));
        cy.on("mouseout", "node", (e: any) => e.target.removeClass("hover"));

        // Tap p/ colapsar ramo
        cy.on("tap", "node", (evt: any) => {
          const node = evt.target;
          const collapsed = node.data("collapsed");
          const descendants = node.successors();
          if (!collapsed) {
            descendants.hide();
            node.data("collapsed", true);
          } else {
            descendants.show();
            node.data("collapsed", false);
          }
          cy.layout(makeLayout(layoutName)).run();
        });

        // Resize handler
        const onResize = () => {
          if (!cy) return;
          cy.resize();
        };
        window.addEventListener("resize", onResize);

        setLoading(false);

        return () => {
          window.removeEventListener("resize", onResize);
        };
      } catch (err: any) {
        console.error("Erro ao inicializar FamilyTreeView:", err);
        setError(err?.message ?? "Erro desconhecido");
        setLoading(false);
      }
    })();

    return () => {
      destroyed = true;
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [baseStyles, fetchData, loadCytoscape, makeLayout, layoutName]);

  // -------- Actions --------
  const doFit = useCallback(() => cyRef.current?.fit(undefined, 30), []);
  const doCenter = useCallback(() => cyRef.current?.center(), []);
  const doRelayout = useCallback(() => cyRef.current?.layout(makeLayout(layoutName)).run(), [layoutName, makeLayout]);
  const collapseAll = useCallback(() => {
    const cy = cyRef.current; if (!cy) return;
    cy.nodes().forEach((n: any) => {
      if (n.data("root") === "true") return;
      n.successors().hide();
      n.data("collapsed", true);
    });
    cy.layout(makeLayout(layoutName)).run();
  }, [makeLayout, layoutName]);
  const expandAll = useCallback(() => {
    const cy = cyRef.current; if (!cy) return;
    cy.elements().show();
    cy.nodes().forEach((n: any) => n.data("collapsed", false));
    cy.layout(makeLayout(layoutName)).run();
  }, [makeLayout, layoutName]);

  // Busca simples por label (case-insensitive)
  useEffect(() => {
    const cy = cyRef.current; if (!cy) return;
    cy.nodes().removeClass("search-hit");
    const q = query.trim().toLowerCase();
    if (!q) return;
    cy.nodes().forEach((n: any) => {
      const label = String(n.data("label") ?? "").toLowerCase();
      if (label.includes(q)) n.addClass("search-hit");
    });
  }, [query]);

  // -------- UI --------
  return (
    <div className="w-full h-[640px] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur p-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <button onClick={doFit} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm">Fit</button>
          <button onClick={doCenter} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm">Centralizar</button>
          <button onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.15)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm">Zoom +</button>
          <button onClick={() => cyRef.current?.zoom(cyRef.current.zoom() / 1.15)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm">Zoom −</button>
          <button onClick={doRelayout} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm">Re‑layout</button>
        </div>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50/70 dark:hover:bg-emerald-900/40 text-sm">Expandir tudo</button>
          <button onClick={collapseAll} className="px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-50/70 dark:hover:bg-amber-900/40 text-sm">Colapsar tudo</button>
        </div>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-slate-400">Layout</label>
          <select
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            className="px-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <option value="breadthfirst">breadthfirst</option>
            <option value="dagre">dagre (se instalado)</option>
            <option value="cose">cose</option>
          </select>
        </div>
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome…"
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 min-w-[220px]"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">destaque em laranja</span>
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded bg-[#16a34a]" /> raiz</span>
          <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded bg-[#2563eb]" /> M</span>
          <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded bg-[#db2777]" /> F</span>
          <span className="inline-flex items-center gap-1"><i className="inline-block w-3 h-3 rounded bg-[#4b5563]" /> indeterminado</span>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="mt-3 w-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" />

      {/* Loading & Error overlays */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-4 py-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 shadow-md text-sm">Carregando árvore…</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-4 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 shadow-md text-sm text-rose-700 dark:text-rose-200">
            Erro ao carregar: {error}
          </div>
        </div>
      )}
    </div>
  );
}
