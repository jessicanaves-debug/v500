import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain");
  if (!domain) return NextResponse.json({ error: "domain required" }, { status: 400 });

  // Tenta Clearbit primeiro, depois fallback para favicon do Google
  const sources = [
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url, { cache: "force-cache" } as RequestInit);
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") || "image/png";
      // Clearbit retorna 200 mesmo quando não encontra (retorna imagem placeholder)
      // Verificar se tem tamanho mínimo
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength < 500) continue; // placeholder muito pequena = não encontrou
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: "Logo não encontrada" }, { status: 404 });
}
