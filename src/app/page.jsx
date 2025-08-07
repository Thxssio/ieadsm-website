// src/app/page.jsx
import { Suspense } from "react";
import HomeClient from "./HomeClient";

import { db } from "./lib/firebase/client";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export const metadata = {
  title: "Início | IEADSM",
  description: "Igreja Evangélica Assembleia de Deus de Santa Maria/RS",
};

export const revalidate = 60;

export default async function Page() {
  const snap = await getDocs(
    query(collection(db, "ministries"), orderBy("name"))
  );
  const ministries = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return (
    <Suspense fallback={null}>
      {/* Componente cliente que usa useSearchParams(), useState etc. */}
      <HomeClient ministries={ministries} />
    </Suspense>
  );
}
