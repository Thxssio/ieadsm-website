"use client";

import { useEffect, useState } from "react";
import PageContent from "@/components/portal/ui/PageContent";
import { db } from "@/lib/firebase/client";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export default function FamiliesPage() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const famSnap = await getDocs(collection(db, "families"));
        const data = [];
        for (const f of famSnap.docs) {
          const membersSnap = await getDocs(collection(db, "families", f.id, "members"));
          const members = [];
          for (const m of membersSnap.docs) {
            const uSnap = await getDoc(doc(db, "users", m.id));
            members.push({ id: m.id, ...uSnap.data() });
          }
          data.push({ id: f.id, ...f.data(), members });
        }
        setFamilies(data);
      } catch (e) {
        console.error("Erro ao carregar famílias:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <PageContent title="Famílias">Carregando...</PageContent>;
  }

  return (
    <PageContent title="Famílias">
      {families.length === 0 ? (
        <p className="text-slate-700">Nenhuma família encontrada.</p>
      ) : (
        <div className="space-y-6">
          {families.map((fam) => (
            <div key={fam.id} className="border border-slate-200 rounded-lg p-4">
              <h2 className="font-semibold text-slate-800 mb-2">Família {fam.id}</h2>
              {fam.responsibleCpf && (
                <p className="text-sm text-slate-600 mb-2">
                  Responsável: {fam.responsibleCpf}
                </p>
              )}
              <ul className="pl-4 border-l-2 border-slate-200">
                {fam.members.map((m) => (
                  <li key={m.id} className="mb-1">
                    {m.displayName || m.name || m.id}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </PageContent>
  );
}

