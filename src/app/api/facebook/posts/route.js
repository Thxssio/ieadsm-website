import { NextResponse } from "next/server";

export const revalidate = 900; 

export async function GET() {
  const PAGE_ID = process.env.FB_PAGE_ID;
  const TOKEN = process.env.FB_PAGE_TOKEN;

  if (!PAGE_ID || !TOKEN) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const fields = [
      "permalink_url",
      "message",
      "created_time",
      "full_picture",
    ].join(",");

    const url = new URL(`https://graph.facebook.com/v23.0/${PAGE_ID}/posts`);
    url.searchParams.set("fields", fields);
    url.searchParams.set("limit", "6");
    url.searchParams.set("access_token", TOKEN);

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok) {
        console.error("Erro ao buscar posts do Facebook:", data);
      return NextResponse.json(
        { error: true, details: data },
        { status: res.status }
      );
    }

    const posts = (data.data || []).map((p) => ({
      id: p.id,
      title: p.message?.split("\n").at(0) ?? "Publicação",
      message: p.message ?? "",
      link: p.permalink_url,
      pubDate: p.created_time,
      imageUrl: p.full_picture ?? null,
    }));

    return NextResponse.json({ posts });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: true, details: String(e) },
      { status: 500 }
    );
  }
}
