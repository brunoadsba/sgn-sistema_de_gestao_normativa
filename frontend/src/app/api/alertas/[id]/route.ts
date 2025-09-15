import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID do alerta é obrigatório" },
        { status: 400 }
      );
    }

    const { data: alerta, error } = await supabase
      .from("alertas_conformidade")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Alerta não encontrado" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!alerta) {
      return NextResponse.json(
        { error: "Alerta não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: alerta
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );

  } catch (error) {
    console.error('Erro ao buscar alerta:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID do alerta é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se alerta existe
    const { data: alertaExistente, error: checkError } = await supabase
      .from("alertas_conformidade")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !alertaExistente) {
      return NextResponse.json(
        { error: "Alerta não encontrado" },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {};

    // Campos que podem ser atualizados
    if (body.titulo !== undefined) updateData.titulo = body.titulo;
    if (body.descricao !== undefined) updateData.descricao = body.descricao;
    if (body.acao_requerida !== undefined) updateData.acao_requerida = body.acao_requerida;
    if (body.prazo !== undefined) updateData.prazo = body.prazo ? new Date(body.prazo).toISOString() : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    // Validar status se fornecido
    if (body.status) {
      const statusValidos = ['ativo', 'resolvido', 'ignorado'];
      if (!statusValidos.includes(body.status)) {
        return NextResponse.json(
          { error: `Status inválido. Valores aceitos: ${statusValidos.join(', ')}` },
          { status: 400 }
        );
      }

      // Se marcando como resolvido, adicionar timestamp
      if (body.status === 'resolvido') {
        updateData.resolved_at = new Date().toISOString();
      } else if (body.status === 'ativo') {
        updateData.resolved_at = null;
      }
    }

    // Atualizar alerta
    const { data: alertaAtualizado, error } = await supabase
      .from("alertas_conformidade")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Erro ao atualizar alerta" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: alertaAtualizado
      }
    );

  } catch (error) {
    console.error('Erro ao atualizar alerta:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID do alerta é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se alerta existe
    const { data: alertaExistente, error: checkError } = await supabase
      .from("alertas_conformidade")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !alertaExistente) {
      return NextResponse.json(
        { error: "Alerta não encontrado" },
        { status: 404 }
      );
    }

    // Deletar alerta
    const { error } = await supabase
      .from("alertas_conformidade")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Erro ao deletar alerta" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Alerta deletado com sucesso"
      }
    );

  } catch (error) {
    console.error('Erro ao deletar alerta:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
