import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parâmetros básicos
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100); // máximo 100
    const search = searchParams.get("search") || "";
    const orgao = searchParams.get("orgao") || "";
    
    // Parâmetros avançados
    const status = searchParams.get("status") || ""; // ativa, revogada, todas
    const categoria = searchParams.get("categoria") || "";
    const nr = searchParams.get("nr") || ""; // números específicos: 1,2,3
    const data_inicio = searchParams.get("data_inicio") || "";
    const data_fim = searchParams.get("data_fim") || "";
    const updated_after = searchParams.get("updated_after") || "";
    
    // Ordenação
    const sort = searchParams.get("sort") || "created_at";
    const order = searchParams.get("order") || "desc";
    
    const offset = (page - 1) * limit;

    let query = supabase
      .from("normas")
      .select("*", { count: "exact" });

    // Busca por texto
    if (search) {
      query = query.or(`codigo.ilike.%${search}%,titulo.ilike.%${search}%`);
    }

    // Filtro por órgão
    if (orgao) {
      query = query.eq("orgao_publicador", orgao);
    }

    // Filtro por status (ativa/revogada)
    if (status === "ativa") {
      query = query.not("titulo", "ilike", "%REVOGADA%");
    } else if (status === "revogada") {
      query = query.ilike("titulo", "%REVOGADA%");
    }

    // Filtro por categoria
    if (categoria === "seguranca") {
      query = query.ilike("titulo", "%SEGURANÇA%");
    } else if (categoria === "saude") {
      query = query.ilike("titulo", "%SAÚDE%");
    } else if (categoria === "construcao") {
      query = query.ilike("titulo", "%CONSTRUÇÃO%");
    }

    // Filtro por números de NR específicos
    if (nr) {
      const nrs = nr.split(",").map(n => n.trim());
      const orConditions = nrs.map(n => `codigo.ilike.NR-${n} -%`).join(",");
      query = query.or(orConditions);
    }

    // Filtros de data
    if (data_inicio) {
      query = query.gte("created_at", data_inicio);
    }
    if (data_fim) {
      query = query.lte("created_at", data_fim + "T23:59:59");
    }
    if (updated_after) {
      query = query.gte("data_atualizacao", updated_after);
    }

    // Ordenação
    const validSorts = ["created_at", "titulo", "codigo", "data_atualizacao"];
    const validOrders = ["asc", "desc"];
    
    const finalSort = validSorts.includes(sort) ? sort : "created_at";
    const finalOrder = validOrders.includes(order) ? { ascending: order === "asc" } : { ascending: false };

    const { data: normas, error, count } = await query
      .order(finalSort, finalOrder)
      .range(offset, offset + limit - 1);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ 
      success: true,
      data: normas,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      filters: {
        search,
        orgao,
        status,
        categoria,
        nr,
        data_inicio,
        data_fim,
        updated_after,
        sort: finalSort,
        order: order
      }
    });
  } catch (error) {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
