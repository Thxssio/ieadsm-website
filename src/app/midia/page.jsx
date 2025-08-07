import FacebookEmbeds from "./FacebookEmbeds";

export const metadata = {
  title: "Mídia | IEADSM",
  description:
    "Publicações públicas da nossa página no Facebook incorporadas no site da IEADSM.",
  alternates: { canonical: "https://adsantamariars.com.br/midia" },
  openGraph: {
    type: "website",
    url: "https://adsantamariars.com.br/midia",
    title: "Mídia | IEADSM",
    description:
      "Publicações públicas da nossa página no Facebook incorporadas no site da IEADSM.",
    images: [{ url: "/og.jpg" }], // ou sua churchInfo.ogImageUrl
  },
};

export default function MidiaPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Mídia</h1>
      <p className="mt-4 text-stone-700">
        Conteúdos públicos do nosso perfil oficial no Facebook.
      </p>

      {/* Carrega SDK + embeds no client */}
      <FacebookEmbeds />
    </section>
  );
}
