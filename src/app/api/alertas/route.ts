import { db } from "@/lib/db";
import { schema } from "@/lib/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const revalidate = 60;

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

    const conditions = [];

    if (empresaId) conditions.push(eq(schema.alertasConformidade.empresaId, empresaId));
    if (status) conditions.push(eq(schema.alertasConformidade.status, status));
    if (severidade) conditions.push(eq(schema.alertasConformidade.severidade, severidade));
    if (tipo) conditions.push(eq(schema.alertasConformidade.tipo, tipo));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [alertas, countResult] = await Promise.all([
      db
        .select()
        .from(schema.alertasConformidade)
        .where(whereClause)
        .orderBy(desc(schema.alertasConformidade.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.alertasConformidade)
        .where(whereClause),
    ]);

    const count = countResult[0]?.count ?? 0;

    return NextResponse.json(
      {
        success: true,
        data: alertas,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
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
      metadata,
    } = body;

    if (!empresa_id || !tipo || !severidade || !titulo || !descricao || !acao_requerida) {
      return NextResponse.json(
        { error: "Campos obrigatórios: empresa_id, tipo, severidade, titulo, descricao, acao_requerida" },
        { status: 400 }
      );
    }

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
    const empresaResult = await db
      .select({ id: schema.empresas.id })
      .from(schema.empresas)
      .where(and(eq(schema.empresas.id, empresa_id), eq(schema.empresas.ativo, true)))
      .limit(1);

    if (empresaResult.length === 0) {
      return NextResponse.json(
        { error: "Empresa não encontrada ou inativa" },
        { status: 404 }
      );
    }

    const inserted = await db
      .insert(schema.alertasConformidade)
      .values({
        empresaId: empresa_id,
        tipo,
        severidade,
        titulo,
        descricao,
        acaoRequerida: acao_requerida,
        prazo: prazo ? new Date(prazo).toISOString() : null,
        normaId: norma_id || null,
        documentoId: documento_id || null,
        analiseId: analise_id || null,
        metadata: metadata || {},
      })
      .returning();

    return NextResponse.json(
      { success: true, data: inserted[0] },
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
