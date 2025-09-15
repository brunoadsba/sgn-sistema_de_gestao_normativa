import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const revalidate = 60;

// Tipos para alertas de conformidade
type AlertaConformidade = {
  id: string;
  empresa_id: string;
  tipo: 'oportunidade' | 'risco' | 'prazo' | 'conformidade';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  titulo: string;
  descricao: string;
  acao_requerida: string;
  prazo: string | null;
  status: 'ativo' | 'resolvido' | 'ignorado';
  norma_id: string | null;
  documento_id: string | null;
  analise_id: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  metadata: Record<string, any>;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const empresaId = searchParams.get("empresa_id");
    const status = searchParams.get("status");
    const severidade = searchParams.get("severidade");
    const tipo = searchParams.get("tipo");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("alertas_conformidade")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Filtros opcionais
    if (empresaId) {
      query = query.eq("empresa_id", empresaId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (severidade) {
      query = query.eq("severidade", severidade);
    }

    if (tipo) {
      query = query.eq("tipo", tipo);
    }

    const { data: alertas, error, count } = await query.range(
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
        data: alertas || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );

  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      empresa_id,
      tipo,
      severidade,
      titulo,
      descricao,
      acao_requerida,
      prazo,
      norma_id,
      documento_id,
      analise_id,
      metadata
    } = body;

    // Validações básicas
    if (!empresa_id || !tipo || !severidade || !titulo || !descricao || !acao_requerida) {
      return NextResponse.json(
        { error: "Campos obrigatórios: empresa_id, tipo, severidade, titulo, descricao, acao_requerida" },
        { status: 400 }
      );
    }

    // Validar valores enum
    const tiposValidos = ['oportunidade', 'risco', 'prazo', 'conformidade'];
    const severidadesValidas = ['baixa', 'media', 'alta', 'critica'];

    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: `Tipo inválido. Valores aceitos: ${tiposValidos.join(', ')}` },
        { status: 400 }
      );
    }

    if (!severidadesValidas.includes(severidade)) {
      return NextResponse.json(
        { error: `Severidade inválida. Valores aceitos: ${severidadesValidas.join(', ')}` },
        { status: 400 }
      );
    }

    // Verificar se empresa existe
    const { data: empresa, error: empresaError } = await supabase
      .from("empresas")
      .select("id")
      .eq("id", empresa_id)
      .eq("ativo", true)
      .single();

    if (empresaError || !empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada ou inativa" },
        { status: 404 }
      );
    }

    // Criar alerta
    const { data: novoAlerta, error } = await supabase
      .from("alertas_conformidade")
      .insert([{
        empresa_id,
        tipo,
        severidade,
        titulo,
        descricao,
        acao_requerida,
        prazo: prazo ? new Date(prazo).toISOString() : null,
        norma_id: norma_id || null,
        documento_id: documento_id || null,
        analise_id: analise_id || null,
        metadata: metadata || {}
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Erro ao criar alerta" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: novoAlerta
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao criar alerta:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
