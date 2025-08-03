"use client";

import { useEffect, useState, useRef } from "react";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
    {/* Contêiner da imagem com proporção 4:5 */}
    <div className="bg-gray-200 aspect-[4/5] w-full rounded-md mb-4"></div>
    {/* Esqueleto do texto */}
    <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
    <div className="bg-gray-200 h-4 rounded w-full mb-1"></div>
    <div className="bg-gray-200 h-4 rounded w-5/6 mb-4"></div>
    <div className="bg-gray-200 h-5 rounded w-1/3"></div>
  </div>
);

export default function FacebookFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const sliderSettings = {
    dots: true,           // Mostra os pontos de navegação
    infinite: true,       // Ativa o loop infinito, essencial para autoplay contínuo
    speed: 500,           // Velocidade da transição em milissegundos
    slidesToShow: 3,      // Mostra 3 slides em telas grandes
    slidesToScroll: 1,    // Rola 1 slide por vez
    autoplay: true,       // Ativa a rolagem automática
    autoplaySpeed: 3000,  // Intervalo de 5 segundos entre os slides
    cssEase: "linear",    // Suaviza a transição do autoplay
    responsive: [         // Configurações para diferentes tamanhos de tela
      {
        breakpoint: 1024, // Telas médias (tablets)
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,  
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  useEffect(() => {
    // URL do feed RSS. Substitua se necessário.
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

        {/* Componente Slider renderiza o carrossel */}
        <Slider {...sliderSettings}>
          {loading
            ? // Se estiver carregando, mostra 3 esqueletos de card
              [...Array(3)].map((_, index) => (
                <div key={index} className="p-3">
                  <SkeletonCard />
                </div>
              ))
            : // Quando os dados chegarem, mapeia e mostra os posts
              posts.map((post) => (
                <div key={post.guid} className="p-3 h-full">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full group transition-transform duration-300 hover:scale-105">
                    {/* Contêiner da Imagem com proporção fixa */}
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gray-100 overflow-hidden"
                      style={{ aspectRatio: '4 / 5' }} // Força a proporção 4:5
                    >
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" // object-cover evita distorção
                        loading="lazy"
                      />
                    </a>
                    {/* Conteúdo do Card */}
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
                </div>
              ))}
        </Slider>

        {/* Mensagem exibida se não houver posts após o carregamento */}
        {!loading && posts.length === 0 && (
          <p className="text-center text-gray-600 mt-8">
            Nenhuma notícia encontrada no momento.
          </p>
        )}
      </div>
    </section>
  );
}