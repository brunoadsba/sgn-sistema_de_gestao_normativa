import { supabase } from "@/lib/supabase";

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

    // Busca com ranking de relevância
    const { data: normas, error } = await supabase
      .from("normas")
      .select("*")
      .or(`codigo.ilike.%${q}%,titulo.ilike.%${q}%`)
      .limit(limit);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Calcular score de relevância
    const results = normas?.map(norma => {
      let score = 0;
      const query = q.toLowerCase();
      const codigo = norma.codigo.toLowerCase();
      const titulo = norma.titulo.toLowerCase();

      // Pontuação por correspondência exata
      if (codigo.includes(query)) score += 10;
      if (titulo.includes(query)) score += 5;
      
      // Bonificação se começar com a busca
      if (codigo.startsWith(query)) score += 15;
      if (titulo.startsWith(query)) score += 8;

      // Bonificação para normas ativas
      if (!titulo.includes("revogada")) score += 2;

      return { ...norma, relevance_score: score };
    }).sort((a, b) => b.relevance_score - a.relevance_score) || [];

    return Response.json({
      success: true,
      query: q,
      results: results,
      total_found: results.length
    });

  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
