// app/midia/FacebookEmbeds.jsx
"use client";
import { useEffect, useRef, useCallback } from "react";
import Script from "next/script";

const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID || "766585979212640";

export default function FacebookEmbeds() {
  const wrapRef = useRef(null);

  const resize = useCallback(() => {
    // ajuste conforme a altura do seu header/spacing
    const headerOffset = 120;
    const h = Math.max(500, window.innerHeight - headerOffset);
    const node = wrapRef.current?.querySelector(".fb-page");
    if (node) {
      node.setAttribute("data-height", String(h));
      // reprocessa o XFBML para aplicar a nova altura
      if (window.FB?.XFBML?.parse) window.FB.XFBML.parse(wrapRef.current);
    }
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  return (
    <>
      <div id="fb-root" />
      <Script
        src={`https://connect.facebook.net/pt_BR/sdk.js#xfbml=1&version=v23.0&appId=${FB_APP_ID}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
        onLoad={() => setTimeout(resize, 300)}
      />

      <div ref={wrapRef} className="mx-auto w-full max-w-[980px] px-2">
        <div
          className="fb-page"
          data-href="https://www.facebook.com/adsantamariars"
          data-tabs="timeline"                 // pode usar "timeline,events,messages"
          data-hide-cover="false"
          data-show-facepile="true"
          data-adapt-container-width="true"    // largura 100% do contêiner
          // data-height é setado dinamicamente no efeito acima
        />
      </div>

      <p className="mt-4 text-center">
        <a href="https://www.facebook.com/adsantamariars" target="_blank" rel="noopener noreferrer" className="underline">
          Abrir no Facebook
        </a>
      </p>
    </>
  );
}
