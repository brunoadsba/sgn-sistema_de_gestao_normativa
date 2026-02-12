import { db } from "@/lib/db";
import { schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID do alerta é obrigatório" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(schema.alertasConformidade)
      .where(eq(schema.alertasConformidade.id, id))
      .limit(1);

    const alerta = result[0];

    if (!alerta) {
      return NextResponse.json({ error: "Alerta não encontrado" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data: alerta },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );

  } catch (error) {
    console.error('Erro ao buscar alerta:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
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
      return NextResponse.json({ error: "ID do alerta é obrigatório" }, { status: 400 });
    }

    // Verificar se alerta existe
    const existing = await db
      .select({ id: schema.alertasConformidade.id })
      .from(schema.alertasConformidade)
      .where(eq(schema.alertasConformidade.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Alerta não encontrado" }, { status: 404 });
    }

    // Preparar dados para atualização
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.titulo !== undefined) updateData.titulo = body.titulo;
    if (body.descricao !== undefined) updateData.descricao = body.descricao;
    if (body.acao_requerida !== undefined) updateData.acaoRequerida = body.acao_requerida;
    if (body.prazo !== undefined) updateData.prazo = body.prazo ? new Date(body.prazo).toISOString() : null;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    if (body.status) {
      const statusValidos = ['ativo', 'resolvido', 'ignorado'];
      if (!statusValidos.includes(body.status)) {
        return NextResponse.json(
          { error: `Status inválido. Valores aceitos: ${statusValidos.join(', ')}` },
          { status: 400 }
        );
      }

      updateData.status = body.status;

      if (body.status === 'resolvido') {
        updateData.resolvedAt = new Date().toISOString();
      } else if (body.status === 'ativo') {
        updateData.resolvedAt = null;
      }
    }

    const updated = await db
      .update(schema.alertasConformidade)
      .set(updateData)
      .where(eq(schema.alertasConformidade.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updated[0] });

  } catch (error) {
    console.error('Erro ao atualizar alerta:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID do alerta é obrigatório" }, { status: 400 });
    }

    // Verificar se alerta existe
    const existing = await db
      .select({ id: schema.alertasConformidade.id })
      .from(schema.alertasConformidade)
      .where(eq(schema.alertasConformidade.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: "Alerta não encontrado" }, { status: 404 });
    }

    await db
      .delete(schema.alertasConformidade)
      .where(eq(schema.alertasConformidade.id, id));

    return NextResponse.json({ success: true, message: "Alerta deletado com sucesso" });

  } catch (error) {
    console.error('Erro ao deletar alerta:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
