"use client";

import { useEffect, useState } from "react";

export default function FacebookFeed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const rssUrl = "https://rss.app/feeds/jf32bozp3A2fGrEu.xml";
    const apiUrl = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rssUrl);

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          const filtered = data.items.filter((post) => {
            const normalizedTitle = post.title?.trim().toLowerCase().replace(/\s+/g, " ");
            return normalizedTitle !== "ad santa maria rs posted";
          });
          setPosts(filtered.slice(0, 10));
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar o feed do Facebook:", err);
      });
  }, []);

  return (
    <section id="facebook-feed" className="px-4 py-10 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Últimos Posts no Facebook
      </h2>

      {posts.length === 0 && (
        <p className="text-center text-gray-500">Carregando posts...</p>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {posts.map((post, index) => (
          <div
            key={index}
            className="min-w-[300px] max-w-sm flex-shrink-0 bg-white p-4 rounded-lg shadow hover:shadow-md transition duration-300"
          >
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              {post.title || "Post sem título"}
            </h3>
            <div
              className="text-sm text-gray-700 mb-3"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Ver no Facebook →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
