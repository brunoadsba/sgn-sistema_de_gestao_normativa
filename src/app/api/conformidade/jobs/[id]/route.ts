import { db } from "@/lib/db";
import { schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { getNormasByIds } from "@/lib/data/normas";

export const revalidate = 0;

type GapLite = {
  severidade: 'critica' | 'alta' | 'media' | 'baixa';
  resolvido: boolean;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    if (!jobId) {
      return Response.json({ success: false, error: "ID do job é obrigatório" }, { status: 400 });
    }

    // Buscar job
    const jobResult = await db
      .select()
      .from(schema.analiseJobs)
      .where(eq(schema.analiseJobs.id, jobId))
      .limit(1);

    const job = jobResult[0];
    if (!job) {
      return Response.json({ success: false, error: "Job não encontrado" }, { status: 404 });
    }

    // Buscar empresa
    const empresaResult = await db
      .select()
      .from(schema.empresas)
      .where(eq(schema.empresas.id, job.empresaId))
      .limit(1);

    // Buscar documento
    const documentoResult = await db
      .select()
      .from(schema.documentosEmpresa)
      .where(eq(schema.documentosEmpresa.id, job.documentoId))
      .limit(1);

    // Buscar resultado e gaps se job completo
    let analiseResultado: unknown = null;
    let gaps: GapLite[] = [];

    if (job.status === 'completed') {
      const resultadoResult = await db
        .select()
        .from(schema.analiseResultados)
        .where(eq(schema.analiseResultados.jobId, jobId))
        .limit(1);

      if (resultadoResult[0]) {
        analiseResultado = resultadoResult[0];

        const gapsData = await db
          .select()
          .from(schema.conformidadeGaps)
          .where(eq(schema.conformidadeGaps.analiseResultadoId, resultadoResult[0].id))
          .orderBy(desc(schema.conformidadeGaps.createdAt));

        // Enriquecer gaps com dados de normas locais
        const normaIds = [...new Set(gapsData.map(g => g.normaId).filter(Boolean))];
        const normasMap = normaIds.length > 0
          ? Object.fromEntries(getNormasByIds(normaIds as number[]).map(n => [n.id, n]))
          : {};

        gaps = gapsData.map(g => ({
          ...g,
          normas: g.normaId ? normasMap[g.normaId] || null : null,
        })) as unknown as GapLite[];
      }
    }

    const tempoDecorrido = job.startedAt
      ? Math.floor((Date.now() - new Date(job.startedAt).getTime()) / 1000)
      : null;

    const tempoTotal = job.completedAt && job.startedAt
      ? Math.floor((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 1000)
      : null;

    const parametros = job.parametros as Record<string, unknown> | null;
    const normasInfo = (parametros?.normas_codigos as string[]) || [];
    const totalNormas = (parametros?.total_normas as number) || 0;

    return Response.json({
      success: true,
      data: {
        job: {
          id: job.id,
          status: job.status,
          priority: job.priority,
          tipo_analise: job.tipoAnalise,
          progresso: job.progresso,
          erro_detalhes: job.erroDetalhes,
          created_at: job.createdAt,
          started_at: job.startedAt,
          completed_at: job.completedAt,
          tempo_decorrido_segundos: tempoDecorrido,
          tempo_total_segundos: tempoTotal,
          tempo_decorrido_formatado: tempoDecorrido ? formatarTempo(tempoDecorrido) : null,
          tempo_total_formatado: tempoTotal ? formatarTempo(tempoTotal) : null,
          total_normas: totalNormas,
          normas_codigos: normasInfo,
        },
        empresa: empresaResult[0] || null,
        documento: documentoResult[0] || null,
        resultado: analiseResultado,
        gaps,
        estatisticas_gaps: gaps.length > 0 ? {
          total: gaps.length,
          critica: gaps.filter(g => g.severidade === 'critica').length,
          alta: gaps.filter(g => g.severidade === 'alta').length,
          media: gaps.filter(g => g.severidade === 'media').length,
          baixa: gaps.filter(g => g.severidade === 'baixa').length,
          resolvidos: gaps.filter(g => g.resolvido === true).length,
          pendentes: gaps.filter(g => g.resolvido === false).length,
        } : null,
      },
    });

  } catch (error) {
    console.error('Erro ao consultar job:', error);
    return Response.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const body = await request.json();
    const { status, progresso, erro_detalhes, resultado } = body;

    if (!jobId) {
      return Response.json({ success: false, error: "ID do job é obrigatório" }, { status: 400 });
    }

    const statusPermitidos = ['pending', 'running', 'completed', 'failed', 'cancelled'] as const;
    if (status && !statusPermitidos.includes(status)) {
      return Response.json({ success: false, error: "Status inválido" }, { status: 400 });
    }

    if (progresso !== undefined && (progresso < 0 || progresso > 100)) {
      return Response.json({ success: false, error: "Progresso deve estar entre 0 e 100" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) updateData.status = status;
    if (progresso !== undefined) updateData.progresso = progresso;
    if (erro_detalhes) updateData.erroDetalhes = erro_detalhes;

    if (status === 'running') {
      updateData.startedAt = new Date().toISOString();
    }
    if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date().toISOString();
      updateData.progresso = status === 'completed' ? 100 : (updateData.progresso ?? 0);
    }

    const updated = await db
      .update(schema.analiseJobs)
      .set(updateData)
      .where(eq(schema.analiseJobs.id, jobId))
      .returning();

    const jobAtualizado = updated[0];

    if (status === 'completed' && resultado && jobAtualizado) {
      try {
        await db
          .insert(schema.analiseResultados)
          .values({
            jobId,
            empresaId: jobAtualizado.empresaId,
            documentoId: jobAtualizado.documentoId,
            ...resultado,
          });
      } catch (err) {
        console.error('Erro ao salvar resultado:', err);
      }
    }

    return Response.json({
      success: true,
      data: jobAtualizado,
      message: "Job atualizado com sucesso",
    });

  } catch (error) {
    console.error('Erro ao atualizar job:', error);
    return Response.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    if (!jobId) {
      return Response.json({ success: false, error: "ID do job é obrigatório" }, { status: 400 });
    }

    const jobResult = await db
      .select({ id: schema.analiseJobs.id, status: schema.analiseJobs.status })
      .from(schema.analiseJobs)
      .where(eq(schema.analiseJobs.id, jobId))
      .limit(1);

    if (jobResult.length === 0) {
      return Response.json({ success: false, error: "Job não encontrado" }, { status: 404 });
    }

    if (jobResult[0].status === 'completed') {
      return Response.json({ success: false, error: "Não é possível cancelar job já concluído" }, { status: 400 });
    }

    const cancelled = await db
      .update(schema.analiseJobs)
      .set({
        status: 'cancelled',
        completedAt: new Date().toISOString(),
        erroDetalhes: 'Cancelado pelo usuário',
      })
      .where(eq(schema.analiseJobs.id, jobId))
      .returning();

    return Response.json({
      success: true,
      data: cancelled[0],
      message: "Job cancelado com sucesso",
    });

  } catch (error) {
    console.error('Erro ao cancelar job:', error);
    return Response.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

function formatarTempo(segundos: number): string {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = segundos % 60;

  if (horas > 0) return `${horas}h ${minutos}m ${segs}s`;
  if (minutos > 0) return `${minutos}m ${segs}s`;
  return `${segs}s`;
}
