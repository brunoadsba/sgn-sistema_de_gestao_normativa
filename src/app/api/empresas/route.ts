import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

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
      query = query.or(
        `nome.ilike.%${search}%,cnpj.ilike.%${search}%,setor.ilike.%${search}%`
      );
    }

    const { data: empresas, error, count } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: empresas || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      {
        headers: {
          // Cache público para CDNs e SW; mantém dados quentes e baratos
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, cnpj, setor, porte } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { data, error } = await supabase
      .from("empresas")
      .insert([{ nome, cnpj, setor, porte }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Erro ao criar empresa" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
