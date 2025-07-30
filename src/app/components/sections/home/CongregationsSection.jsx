export default function CongregationsSection({
  mapUrl = "https://www.google.com/maps/d/u/0/embed?mid=1rURiewtiWetlNdZPz8IziCAUJVFF35Q&ehbc=2E312F",
  heightClass = "h-96 md:h-[600px]",
}) {
  return (
    <section id="congregacoes" className="py-20 sm:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">
          Nossas Congregações
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-stone-600">
          Explore o mapa de nossas congregações e encontre uma igreja perto de você.
        </p>

        <div className="mt-12 rounded-2xl shadow-xl overflow-hidden">
          <iframe
            title="Mapa de Congregações IEADSM"
            src={mapUrl}
            className={`w-full ${heightClass}`}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <noscript>
          <p className="mt-4 text-sm text-stone-500">
            Para ver o mapa, habilite JavaScript ou{" "}
            <a href={mapUrl} className="underline">abra o mapa diretamente</a>.
          </p>
        </noscript>
      </div>
    </section>
  );
}
