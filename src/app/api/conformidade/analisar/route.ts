import { db } from "@/lib/db";
import { schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { getNormasByIds } from "@/lib/data/normas";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { empresa_id, documento_id, norma_ids, priority = 5, tipo_analise = 'completa' } = body;

    if (!empresa_id || !documento_id || !Array.isArray(norma_ids) || norma_ids.length === 0) {
      return Response.json(
        { success: false, error: "empresa_id, documento_id e norma_ids são obrigatórios" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const empresaResult = await db
      .select({ id: schema.empresas.id, nome: schema.empresas.nome })
      .from(schema.empresas)
      .where(and(eq(schema.empresas.id, empresa_id), eq(schema.empresas.ativo, true)))
      .limit(1);

    if (empresaResult.length === 0) {
      return Response.json(
        { success: false, error: "Empresa não encontrada ou inativa" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }
    const empresa = empresaResult[0];

    const documentoResult = await db
      .select({
        id: schema.documentosEmpresa.id,
        nomeArquivo: schema.documentosEmpresa.nomeArquivo,
        tipoDocumento: schema.documentosEmpresa.tipoDocumento,
        metadados: schema.documentosEmpresa.metadados,
      })
      .from(schema.documentosEmpresa)
      .where(and(
        eq(schema.documentosEmpresa.id, documento_id),
        eq(schema.documentosEmpresa.empresaId, empresa_id)
      ))
      .limit(1);

    if (documentoResult.length === 0) {
      return Response.json(
        { success: false, error: "Documento não encontrado ou não pertence à empresa" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }
    const documento = documentoResult[0];

    // Buscar normas dos dados locais
    const normas = getNormasByIds(norma_ids);
    if (normas.length !== norma_ids.length) {
      return Response.json(
        { success: false, error: "Uma ou mais normas não foram encontradas" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const inserted = await db
      .insert(schema.analiseJobs)
      .values({
        empresaId: empresa_id,
        documentoId: documento_id,
        status: 'pending',
        priority: Math.max(1, Math.min(10, priority)),
        tipoAnalise: tipo_analise,
        normaIds: norma_ids,
        parametros: {
          norma_ids,
          total_normas: normas.length,
          documento_nome: documento.nomeArquivo,
          normas_codigos: normas.map(n => n.codigo),
          empresa_nome: empresa.nome,
          timestamp_criacao: new Date().toISOString(),
        },
        progresso: 0,
      })
      .returning();

    const job = inserted[0];

    return Response.json(
      {
        success: true,
        data: {
          job_id: job.id,
          status: job.status,
          message: `Análise de conformidade iniciada para ${normas.length} normas`,
          empresa: empresa.nome,
          documento: documento.nomeArquivo,
          normas_analisadas: normas.length,
          estimated_completion: "5-15 minutos",
          created_at: job.createdAt,
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );

  } catch (error) {
    console.error('Erro interno na API de análise:', error);
    return Response.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const empresa_id = searchParams.get("empresa_id");
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    if (!empresa_id) {
      return Response.json(
        { success: false, error: "empresa_id é obrigatório" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const conditions = [eq(schema.analiseJobs.empresaId, empresa_id)];
    if (status) {
      conditions.push(eq(schema.analiseJobs.status, status));
    }

    const jobs = await db
      .select()
      .from(schema.analiseJobs)
      .where(and(...conditions))
      .orderBy(schema.analiseJobs.createdAt)
      .limit(limit);

    return Response.json(
      { success: true, data: jobs, total: jobs.length },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );

  } catch (error) {
    console.error('Erro ao listar jobs:', error);
    return Response.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
