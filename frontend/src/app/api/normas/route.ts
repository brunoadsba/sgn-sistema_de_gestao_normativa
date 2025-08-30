import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const offset = (page - 1) * limit;

    let query = supabase
      .from("normas")
      .select("*", { count: "exact" });

    // Filtrar apenas registros válidos (que começam com NR-)
    query = query.like("codigo", "NR-%");

    // Busca por texto
    if (search) {
      query = query.or(`codigo.ilike.%${search}%,titulo.ilike.%${search}%`);
    }

    // Filtro por status
    if (status === "ativa") {
      query = query.not("titulo", "ilike", "%REVOGADA%");
    } else if (status === "revogada") {
      query = query.ilike("titulo", "%REVOGADA%");
    }

    const { data: normas, error, count } = await query
      .order("created_at", { ascending: false }) // Ordenar por data de criação (mais recente primeiro)
      .range(offset, offset + limit - 1);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Ordenar numericamente pelo número da NR no frontend
    const normasOrdenadas = normas?.sort((a, b) => {
      const numA = parseInt(a.codigo.match(/NR-(\d+)/)?.[1] || "0");
      const numB = parseInt(b.codigo.match(/NR-(\d+)/)?.[1] || "0");
      return numA - numB;
    }) || [];

    return Response.json({ 
      success: true,
      data: normasOrdenadas,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      filters: { search, status }
    });
  } catch (error) {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
