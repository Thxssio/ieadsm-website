import { Suspense } from "react";
import HomeClient from "./HomeClient";

export const metadata = {
  title: "Início | IEADSM",
  description: "Igreja Evangélica Assembleia de Deus de Santa Maria/RS",
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
