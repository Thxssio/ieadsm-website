import Link from "next/link";

export default function HeroSection({
  backgroundSrc = "/wallpapertest.png",
  backgroundAlt = "Capa do site da Igreja",
  title = "Bem-vindo!",
  subtitle = "Um lugar de fé, esperança e amor. Junte-se à nossa Igreja.",
  primaryCta = { href: "/#location", label: "Planeje sua Visita" },
  secondaryCta = { href: "#", label: "Assista Online" },
  sectionId = "hero",
  className = "",
  // controle do overlay
  overlayClassName = "bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent",
  // deixa espaço para o header (h-24 = 6rem)
  offsetForHeader = true,
}) {
  const topPadding = offsetForHeader
    ? "pt-40 sm:pt-44 lg:pt-52" // empurra conteúdo para baixo do header
    : "pt-28 sm:pt-36 lg:pt-48";

  return (
    <section
      id={sectionId}
      className={`relative bg-slate-900 text-white ${topPadding} pb-28 sm:pb-36 lg:pb-48 ${className}`}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={backgroundSrc}
          alt={backgroundAlt}
          className="w-full h-full object-cover opacity-30"
        />
        <div className={`absolute inset-0 ${overlayClassName}`} />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-stone-300">
          {subtitle}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {primaryCta?.href && primaryCta?.label && (
            <Link
              href={primaryCta.href}
              aria-label={primaryCta.label}
              className="w-full sm:w-auto inline-block bg-[#2a3d57] hover:bg-[#202e42] text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              {primaryCta.label}
            </Link>
          )}

          {secondaryCta?.href && secondaryCta?.label && (
            <Link
              href={secondaryCta.href}
              aria-label={secondaryCta.label}
              className="w-full sm:w-auto inline-block bg-transparent border-2 border-stone-300 hover:bg-stone-50 hover:text-slate-900 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
