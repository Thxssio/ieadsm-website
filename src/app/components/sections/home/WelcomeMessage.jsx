export default function WelcomeMessage({
  title = "Um Lugar para Pertencer",
  verse = "“Portanto, vocês já não são estrangeiros nem forasteiros, mas concidadãos dos santos e membros da família de Deus.”",
  reference = "Efésios 2:19 (NVI)",
  className = "",
}) {
  return (
    <section className={`bg-white py-20 ${className}`}>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
          {title}
        </h1>

        <blockquote className="mt-6">
          <p className="text-lg md:text-xl leading-relaxed text-stone-600">
            {verse}
          </p>
          <footer className="mt-4 text-sm text-stone-500">— {reference}</footer>
        </blockquote>
      </div>
    </section>
  );
}
