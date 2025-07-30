import { MapPin, Phone } from "lucide-react";

export default function LocationSection({
  address,
  phone,
  // se não passar apiKey por props, pega do .env (exposta no client)
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
  title = "Visite-nos",
  subtitle = "Adoraríamos que você se juntasse a nós em um de nossos cultos.",
  sectionId = "location",
  heightClass = "h-96 lg:h-full min-h-[400px]",
  placeQuery, // opcional: sobrescreve a busca do mapa
}) {
  const query = placeQuery || address || "Santa Maria, RS";
  const mapSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(query)}`
    : `https://www.google.com/maps?q=${encodeURIComponent(query)}`;

  return (
    <section id={sectionId} className="py-20 sm:py-28 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">{title}</h2>
            <p className="mt-4 text-xl text-stone-600">{subtitle}</p>

            <div className="mt-8 space-y-6 border-l-4 border-[#2a3d57] pl-6">
              {address && (
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-[#2a3d57] mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-stone-900">Endereço</h3>
                    <p className="mt-1 text-base text-stone-600">{address}</p>
                  </div>
                </div>
              )}

              {phone && (
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-[#2a3d57] mt-1 flex-shrink-0" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-stone-900">Telefone</h3>
                    <p className="mt-1 text-base text-stone-600">{phone}</p>
                  </div>
                </div>
              )}
            </div>

            {!apiKey && (
              <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                Dica: defina <code>NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> no arquivo <code>.env.local</code> e restrinja a
                chave ao seu domínio para usar o embed da API.
              </p>
            )}
          </div>

          <div className={`mt-10 lg:mt-0 ${heightClass}`}>
            <iframe
              title="Mapa IEADSM"
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              className="rounded-2xl shadow-xl"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <noscript>
              <p className="mt-2 text-sm text-stone-500">
                Para ver o mapa, habilite JavaScript ou{" "}
                <a className="underline" href={`https://www.google.com/maps?q=${encodeURIComponent(query)}`}>
                  abra o mapa diretamente
                </a>.
              </p>
            </noscript>
          </div>
        </div>
      </div>
    </section>
  );
}
