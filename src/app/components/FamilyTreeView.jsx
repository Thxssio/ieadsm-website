"use client";

import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

export default function FamilyTreeView() {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    let cy;

    async function init() {
      try {
        const res = await fetch("/api/family-tree");
        const data = await res.json();

        cy = cytoscape({
          container: containerRef.current,
          elements: data.elements || [],
          layout: { name: "breadthfirst", directed: true, padding: 10 },
          style: [
            {
              selector: "node",
              style: {
                label: "data(label)",
                "text-valign": "center",
                "text-halign": "center",
                "background-color": "#2563eb",
                color: "#fff",
                "font-size": 12,
                width: "label",
                height: "label",
                padding: "6px",
                shape: "round-rectangle",
              },
            },
            {
              selector: "edge",
              style: {
                width: 2,
                "line-color": "#94a3b8",
                "target-arrow-color": "#94a3b8",
                "target-arrow-shape": "triangle",
                "curve-style": "bezier",
              },
            },
          ],
          userZoomingEnabled: true,
          wheelSensitivity: 0.2,
        });

        cyRef.current = cy;

        // Expansão/colapso simples dos ramos ao clicar no nó
        cy.on("tap", "node", (evt) => {
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

          cy.layout({ name: "breadthfirst", directed: true, padding: 10 }).run();
        });
      } catch (err) {
        console.error("Erro ao carregar dados da árvore de família:", err);
      }
    }

    init();

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-[600px]" />;
}

