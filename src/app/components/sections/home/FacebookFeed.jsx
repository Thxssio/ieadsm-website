"use client";

import { useEffect, useState } from "react";

// Componente para o "esqueleto" de carregamento com a proporção correta
const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
    {/* ANOTAÇÃO: Alterado para manter a proporção 4:5 */}
    <div className="bg-gray-200 aspect-[4/5] w-full rounded-md mb-4"></div>
    <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
    <div className="bg-gray-200 h-4 rounded w-full mb-1"></div>
    <div className="bg-gray-200 h-4 rounded w-5/6 mb-4"></div>
    <div className="bg-gray-200 h-5 rounded w-1/3"></div>
  </div>
);

export default function FacebookFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rssUrl = "https://rss.app/feeds/jf32bozp3A2fGrEu.xml";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          const filtered = data.items.filter((post) => {
            const normalizedTitle = post.title?.trim().toLowerCase().replace(/\s+/g, " ");
            return normalizedTitle !== "ad santa maria rs posted";
          });
          setPosts(filtered.slice(0, 6));
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar o feed do Facebook:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <section id="facebook-feed" className="bg-gray-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Nossas Últimas Notícias
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, index) => <SkeletonCard key={index} />)
          ) : (
            posts.map((post) => (
              <div
                key={post.guid} // Usar post.guid é mais seguro que o index
                className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transition-transform duration-300 hover:scale-105"
              >
                {/* ANOTAÇÃO: Container da imagem com a proporção 4:5 */}
                <a href={post.link} target="_blank" rel="noopener noreferrer" className="block aspect-[4/5] w-full bg-gray-100">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover" // A imagem ocupa todo o container
                    loading="lazy"
                  />
                </a>
                
                <div className="p-5 flex flex-col flex-grow">
                  <p className="text-xs text-gray-500 mb-2">
                    {formatDate(post.pubDate)}
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex-grow">
                    {post.title || "Post sem título"}
                  </h3>

                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm mt-auto"
                  >
                    Ver no Facebook →
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
        
        {!loading && posts.length === 0 && (
          <p className="text-center text-gray-600 mt-8">
            Nenhum post encontrado no momento.
          </p>
        )}
      </div>
    </section>
  );
}