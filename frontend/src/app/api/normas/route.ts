import { supabase } from "@/lib/supabase";

export const revalidate = 60;

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
      .select("*", { count: "exact" })
      .like("codigo", "NR-%");

    if (search) {
      query = query.or(`codigo.ilike.%${search}%,titulo.ilike.%${search}%`);
    }

    if (status === "ativa") {
      query = query.not("titulo", "ilike", "%REVOGADA%");
    } else if (status === "revogada") {
      query = query.ilike("titulo", "%REVOGADA%");
    }

    const { data: normas, error, count } = await query
      .order("nr_num", { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      data: normas || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      filters: { search, status }
    });
  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
