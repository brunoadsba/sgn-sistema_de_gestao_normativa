import { db } from "@/lib/db";
import { schema } from "@/lib/db";
import { eq, and, gte, desc } from "drizzle-orm";
import { getNormasByIds } from "@/lib/data/normas";

export const revalidate = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ empresaId: string }> }
) {
  const startTime = Date.now();

  try {
    const { empresaId } = await params;
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "30";
    const incluirDetalhes = searchParams.get("incluir_detalhes") === "true";

    if (!empresaId) {
      return Response.json({ success: false, error: "ID da empresa é obrigatório" }, { status: 400 });
    }

    // Verificar empresa
    const empresaResult = await db
      .select()
      .from(schema.empresas)
      .where(and(eq(schema.empresas.id, empresaId), eq(schema.empresas.ativo, true)))
      .limit(1);

    if (empresaResult.length === 0) {
      return Response.json({ success: false, error: "Empresa não encontrada ou inativa" }, { status: 404 });
    }
    const empresa = empresaResult[0];

    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));
    const dataInicioISO = dataInicio.toISOString();

    // Queries paralelas
    const [jobs, resultados, documentos, alertasData] = await Promise.all([
      db.select().from(schema.analiseJobs)
        .where(and(eq(schema.analiseJobs.empresaId, empresaId), gte(schema.analiseJobs.createdAt, dataInicioISO)))
        .orderBy(desc(schema.analiseJobs.createdAt)),
      db.select().from(schema.analiseResultados)
        .where(and(eq(schema.analiseResultados.empresaId, empresaId), gte(schema.analiseResultados.createdAt, dataInicioISO)))
        .orderBy(desc(schema.analiseResultados.createdAt)),
      db.select().from(schema.documentosEmpresa)
        .where(eq(schema.documentosEmpresa.empresaId, empresaId))
        .orderBy(desc(schema.documentosEmpresa.createdAt)),
      db.select().from(schema.alertasConformidade)
        .where(eq(schema.alertasConformidade.empresaId, empresaId)),
    ]);

    // Buscar gaps de conformidade
    let gaps: Array<{ id: string; severidade: string; resolvido: boolean; createdAt: string; categoria: string | null; normaId: number | null; norma?: unknown }> = [];
    try {
      const gapsData = await db.select().from(schema.conformidadeGaps)
        .where(gte(schema.conformidadeGaps.createdAt, dataInicioISO))
        .orderBy(desc(schema.conformidadeGaps.createdAt));

      if (gapsData.length > 0) {
        const normaIds = [...new Set(gapsData.map(g => g.normaId).filter(Boolean))] as number[];
        const normasMap = normaIds.length > 0
          ? Object.fromEntries(getNormasByIds(normaIds).map(n => [n.id, n]))
          : {};

        gaps = gapsData.map(gap => ({
          ...gap,
          norma: gap.normaId ? normasMap[gap.normaId] || null : null,
        }));
      }
    } catch (err) {
      console.warn('Aviso: Erro ao buscar gaps:', err);
    }

    // Estatísticas de Jobs
    const totalJobs = jobs.length;
    const jobsCompletos = jobs.filter(j => j.status === 'completed').length;
    const taxaSucesso = totalJobs > 0 ? Math.round((jobsCompletos / totalJobs) * 100) : 0;

    const jobsComTempo = jobs.filter(j => j.completedAt && j.createdAt);
    const tempoMedio = jobsComTempo.length > 0
      ? Math.round(jobsComTempo.reduce((acc, job) => {
          return acc + (new Date(job.completedAt as string).getTime() - new Date(job.createdAt).getTime()) / 1000;
        }, 0) / jobsComTempo.length)
      : 0;

    // Estatísticas de Conformidade
    const totalAnalises = resultados.length;
    const scoreGeral = totalAnalises > 0
      ? Math.round(resultados.reduce((acc, r) => acc + (r.scoreGeral || 0), 0) / totalAnalises)
      : 0;

    // Gaps (usar alertas como fonte principal quando disponível)
    let totalGaps = gaps.length;
    let gapsResolvidos = gaps.filter(g => g.resolvido).length;
    let gapsPendentes = totalGaps - gapsResolvidos;
    let gapsCriticos = gaps.filter(g => g.severidade === 'critica').length;
    let gapsAltos = gaps.filter(g => g.severidade === 'alta').length;
    let gapsMedios = gaps.filter(g => g.severidade === 'media').length;
    let gapsBaixos = gaps.filter(g => g.severidade === 'baixa').length;

    if (alertasData.length > 0) {
      totalGaps = alertasData.length;
      gapsResolvidos = alertasData.filter(a => a.status === 'resolvido').length;
      gapsPendentes = alertasData.filter(a => a.status === 'ativo').length;
      gapsCriticos = alertasData.filter(a => a.severidade === 'critica').length;
      gapsAltos = alertasData.filter(a => a.severidade === 'alta').length;
      gapsMedios = alertasData.filter(a => a.severidade === 'media').length;
      gapsBaixos = alertasData.filter(a => a.severidade === 'baixa').length;
    }

    const riscoBaixo = resultados.filter(r => r.nivelRisco === 'baixo').length;
    const riscoMedio = resultados.filter(r => r.nivelRisco === 'medio').length;
    const riscoAlto = resultados.filter(r => r.nivelRisco === 'alto').length;
    const riscoCritico = resultados.filter(r => r.nivelRisco === 'critico').length;

    const documentosPorTipo = documentos.reduce<Record<string, number>>((acc, doc) => {
      const tipo = doc.tipoDocumento || 'outro';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    const dashboard = {
      empresa,
      periodo_dias: parseInt(periodo),
      data_inicio: dataInicioISO,
      ultima_atualizacao: new Date().toISOString(),
      resumo_executivo: {
        score_geral_medio: scoreGeral,
        total_analises: totalAnalises,
        total_gaps: totalGaps,
        gaps_criticos_pendentes: gaps.filter(g => g.severidade === 'critica' && !g.resolvido).length,
        taxa_resolucao_gaps: totalGaps > 0 ? Math.round((gapsResolvidos / totalGaps) * 100) : 0,
        risco_predominante: getRiscoPredominante(riscoBaixo, riscoMedio, riscoAlto, riscoCritico),
      },
      processamento: {
        total_jobs: totalJobs,
        jobs_pendentes: jobs.filter(j => j.status === 'pending').length,
        jobs_processando: jobs.filter(j => j.status === 'running').length,
        jobs_completos: jobsCompletos,
        jobs_falharam: jobs.filter(j => j.status === 'failed').length,
        jobs_cancelados: jobs.filter(j => j.status === 'cancelled').length,
        taxa_sucesso_percentual: taxaSucesso,
        tempo_medio_processamento_segundos: tempoMedio,
        tempo_medio_formatado: formatarTempo(tempoMedio),
      },
      conformidade: {
        total_analises: totalAnalises,
        score_medio: scoreGeral,
        distribuicao_status: {
          conforme: resultados.filter(r => r.statusGeral === 'conforme').length,
          nao_conforme: resultados.filter(r => r.statusGeral === 'nao_conforme').length,
          parcial_conforme: resultados.filter(r => r.statusGeral === 'parcial_conforme').length,
        },
        distribuicao_risco: { baixo: riscoBaixo, medio: riscoMedio, alto: riscoAlto, critico: riscoCritico },
        tendencia_score: resultados.slice(0, 10).map(r => ({
          data: r.createdAt,
          score: r.scoreGeral || 0,
          nivel_risco: r.nivelRisco,
        })),
      },
      gaps: {
        total: totalGaps,
        resolvidos: gapsResolvidos,
        pendentes: gapsPendentes,
        taxa_resolucao_percentual: totalGaps > 0 ? Math.round((gapsResolvidos / totalGaps) * 100) : 0,
        distribuicao_severidade: { critica: gapsCriticos, alta: gapsAltos, media: gapsMedios, baixa: gapsBaixos },
        por_categoria: gaps.reduce<Record<string, number>>((acc, gap) => {
          const cat = gap.categoria || 'Sem categoria';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {}),
      },
      documentos: { total: documentos.length, por_tipo: documentosPorTipo },
    };

    const payload = {
      success: true as const,
      data: {
        ...dashboard,
        ...(incluirDetalhes ? {
          detalhes: {
            jobs_recentes: jobs.slice(0, 10),
            resultados_recentes: resultados.slice(0, 10),
            gaps_criticos_pendentes: gaps.filter(g => g.severidade === 'critica' && !g.resolvido).slice(0, 20),
            documentos_recentes: documentos.slice(0, 10),
          },
        } : {}),
      },
    };

    const responseTime = Date.now() - startTime;

    return Response.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Response-Time": `${responseTime}ms`,
      },
    });

  } catch (error) {
    console.error('Erro no dashboard de conformidade:', error);
    return Response.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

function getRiscoPredominante(baixo: number, medio: number, alto: number, critico: number): string {
  const riscos = { baixo, medio, alto, critico };
  const maiorRisco = Object.entries(riscos).reduce((a, b) => a[1] > b[1] ? a : b);
  return maiorRisco[0];
}

function formatarTempo(segundos: number): string {
  if (segundos === 0) return "0s";
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = segundos % 60;
  if (horas > 0) return `${horas}h ${minutos}m`;
  if (minutos > 0) return `${minutos}m ${segs}s`;
  return `${segs}s`;
}
