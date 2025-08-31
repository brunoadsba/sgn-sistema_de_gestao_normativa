import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let query = supabase
      .from("empresas")
      .select("*", { count: "exact" })
      .eq("ativo", true)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("nome", `%${search}%`);
    }

    const { data: empresas, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      data: empresas || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, cnpj, setor, porte } = body;

    if (!nome) {
      return Response.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("empresas")
      .insert([{ nome, cnpj, setor, porte }])
      .select()
      .single();

    if (error) {
      return Response.json({ error: "Erro ao criar empresa" }, { status: 500 });
    }

    return Response.json({
      success: true,
      data
    }, { status: 201 });

  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
