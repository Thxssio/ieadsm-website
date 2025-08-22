"use client";

import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useSiteContent } from "@/hooks/useSiteContent";

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-md animate-pulse">
    <div className="bg-gray-200 dark:bg-gray-600 aspect-[4/5] w-full rounded-md mb-4" />
    <div className="bg-gray-200 dark:bg-gray-600 h-6 rounded w-3/4 mb-2" />
    <div className="bg-gray-200 dark:bg-gray-600 h-4 rounded w-full mb-1" />
    <div className="bg-gray-200 dark:bg-gray-600 h-4 rounded w-5/6 mb-4" />
    <div className="bg-gray-200 dark:bg-gray-600 h-5 rounded w-1/3" />
  </div>
);

// extrai primeira imagem da descrição RSS
const extractImageUrl = (htmlString) => {
  const doc = new DOMParser().parseFromString(htmlString, "text/html");
  const imgTag = doc.querySelector("img");
  return imgTag ? imgTag.src : null;
};

export default function FacebookFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { content } = useSiteContent();

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "linear",
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  useEffect(() => {
    async function load() {
      try {
        // 1) Tenta via Graph API (server route)
        const apiRes = await fetch("/api/facebook/posts", { cache: "no-store" });

        // 204 == sem token/ID -> fallback
        if (apiRes.status === 204) throw new Error("No server token, fallback");

        const apiJson = await apiRes.json();
        if (!apiRes.ok || !apiJson?.posts?.length) throw new Error("API error");

        // normaliza para o mesmo formato do carrossel
        const normalized = apiJson.posts.map((p) => ({
          guid: p.id,
          title: p.title,
          link: p.link,
          pubDate: p.pubDate,
          imageUrl: p.imageUrl,
        }));

        setPosts(normalized);
      } catch {
        const rssUrl = content.rssLink?.trim();
        if (!rssUrl) {
          console.warn("RSS feed URL not configured");
          setPosts([]);
          return;
        }
        const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
          rssUrl
        )}`;

        try {
          const res = await fetch(url);
          const data = await res.json();

          if (data.items) {
            const processed = data.items
              .filter((post) => {
                const normalizedTitle = post.title
                  ?.trim()
                  .toLowerCase()
                  .replace(/\s+/g, " ");
                return normalizedTitle !== "ad santa maria rs posted";
              })
              .map((post) => ({
                guid: post.guid,
                title: post.title || "Post sem título",
                link: post.link,
                pubDate: post.pubDate,
                imageUrl: extractImageUrl(post.description),
              }));

            setPosts(processed.slice(0, 6));
          }
        } catch (err) {
          console.error("Erro no fallback RSS:", err);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [content.rssLink]);

  const formatDate = (s) =>
    new Date(s).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <section id="facebook-feed" className="bg-gray-50 dark:bg-slate-800 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
          Nossas Últimas Notícias
        </h2>

        <Slider {...sliderSettings}>
          {loading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="p-3">
                  <SkeletonCard />
                </div>
              ))
            : posts.map((post) => (
                <div key={post.guid} className="p-3 h-full">
                  <div className="bg-white dark:bg-slate-700 rounded-lg shadow-lg overflow-hidden flex flex-col h-full group transition-transform duration-300 hover:scale-105">
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gray-100 dark:bg-gray-700 overflow-hidden"
                      style={{ aspectRatio: "4 / 5" }}
                    >
                      <img
                        src={post.imageUrl || "/default-img.png"}
                        alt={post.title || "Post sem título"}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/default-img.png";
                        }}
                      />
                    </a>

                    <div className="p-5 flex flex-col flex-grow">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {formatDate(post.pubDate)}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex-grow">
                        {post.title || "Post sem título"}
                      </h3>
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-sm mt-auto"
                      >
                        Ver no Facebook →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
        </Slider>

        {!loading && posts.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-400 mt-8">
            Nenhuma notícia encontrada no momento.
          </p>
        )}
      </div>
    </section>
  );
}
