import { searchNormas } from "@/lib/data/normas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    if (!q || q.length < 2) {
      return Response.json({ 
        error: "Query deve ter pelo menos 2 caracteres" 
      }, { status: 400 });
    }

    const normas = searchNormas(q, limit);

    // Calcular score de relevância
    const results = normas.map(norma => {
      let score = 0;
      const query = q.toLowerCase();
      const codigo = norma.codigo.toLowerCase();
      const titulo = norma.titulo.toLowerCase();

      if (codigo.includes(query)) score += 10;
      if (titulo.includes(query)) score += 5;
      if (codigo.startsWith(query)) score += 15;
      if (titulo.startsWith(query)) score += 8;
      if (!titulo.includes("revogada")) score += 2;

      return { ...norma, relevance_score: score };
    }).sort((a, b) => b.relevance_score - a.relevance_score);

    return Response.json({
      success: true,
      query: q,
      results,
      total_found: results.length,
    });

  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
