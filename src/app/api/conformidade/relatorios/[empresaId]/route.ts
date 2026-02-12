import { db } from "@/lib/db";
import { schema } from "@/lib/db";
import { eq, and, gte, desc } from "drizzle-orm";
import { getNormasByIds } from "@/lib/data/normas";

export const revalidate = 0;

type ResultadoRow = { id: string; scoreGeral: number | null; nivelRisco: string | null; statusGeral: string | null; createdAt: string };
type GapRow = { id: string; severidade: string; resolvido: boolean; createdAt: string; descricao: string; recomendacao: string | null; prazoSugerido: string | null; impacto: string | null; categoria: string | null; normaId: number | null };
type JobRow = { id: string; createdAt: string; startedAt: string | null; completedAt: string | null };
type EmpresaRow = { id: string; nome: string; cnpj: string | null; setor: string | null; porte: string | null; ativo: boolean };

export async function GET(
  request: Request,
  { params }: { params: Promise<{ empresaId: string }> }
) {
  try {
    const { empresaId } = await params;
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo") || "executivo";
    const formato = searchParams.get("formato") || "json";
    const periodo = searchParams.get("periodo") || "90";
    const incluirGraficos = searchParams.get("incluir_graficos") === "true";
    const severidade = searchParams.get("severidade");

    if (!empresaId) {
      return Response.json({ success: false, error: "ID da empresa é obrigatório" }, { status: 400 });
    }

    const empresaResult = await db.select().from(schema.empresas)
      .where(and(eq(schema.empresas.id, empresaId), eq(schema.empresas.ativo, true)))
      .limit(1);

    if (empresaResult.length === 0) {
      return Response.json({ success: false, error: "Empresa não encontrada ou inativa" }, { status: 404 });
    }
    const empresa = empresaResult[0] as EmpresaRow;

    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));
    const dataInicioISO = dataInicio.toISOString();

    let relatorio: { success: boolean; data?: unknown; error?: string } = { success: false };

    switch (tipo) {
      case "executivo":
        relatorio = await gerarRelatorioExecutivo(empresaId, empresa, dataInicioISO);
        break;
      case "detalhado":
        relatorio = await gerarRelatorioDetalhado(empresaId, empresa, dataInicioISO);
        break;
      case "gaps":
        relatorio = await gerarRelatorioGaps(empresaId, empresa, dataInicioISO, severidade);
        break;
      case "compliance":
        relatorio = await gerarRelatorioCompliance(empresaId, empresa, dataInicioISO);
        break;
      default:
        return Response.json({ success: false, error: "Tipo de relatório inválido" }, { status: 400 });
    }

    if (!relatorio.success) {
      return Response.json(relatorio, { status: 500 });
    }

    if (incluirGraficos && relatorio.data && typeof relatorio.data === 'object') {
      (relatorio.data as Record<string, unknown>)['graficos'] = { evolucao_score: [], distribuicao_gaps: [], compliance_por_norma: [] };
    }

    if (formato === "csv") {
      return new Response("CSV não implementado ainda", {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="relatorio_${tipo}_${Date.now()}.csv"` },
      });
    }
    if (formato === "pdf") {
      return Response.json({ success: false, error: "Geração de PDF não implementada ainda" }, { status: 501 });
    }

    return Response.json(relatorio);

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return Response.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ empresaId: string }> }
) {
  try {
    const { empresaId } = await params;
    const body = await request.json();
    const { nome_relatorio, descricao, configuracao, agendamento, destinatarios } = body;

    if (!nome_relatorio || !configuracao) {
      return Response.json({ success: false, error: "nome_relatorio e configuracao são obrigatórios" }, { status: 400 });
    }

    return Response.json({
      success: true,
      data: {
        id: `custom_${Date.now()}`,
        empresa_id: empresaId,
        nome: nome_relatorio,
        descricao: descricao || "",
        configuracao,
        agendamento: agendamento || null,
        destinatarios: destinatarios || [],
        criado_em: new Date().toISOString(),
        ativo: true,
      },
      message: "Relatório customizado criado com sucesso",
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar relatório customizado:', error);
    return Response.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

// ====== FUNÇÕES DE GERAÇÃO ======

async function gerarRelatorioExecutivo(empresaId: string, empresa: EmpresaRow, dataInicio: string) {
  try {
    const [resultados, gapsData] = await Promise.all([
      db.select().from(schema.analiseResultados)
        .where(and(eq(schema.analiseResultados.empresaId, empresaId), gte(schema.analiseResultados.createdAt, dataInicio)))
        .orderBy(desc(schema.analiseResultados.createdAt)),
      db.select().from(schema.conformidadeGaps)
        .where(gte(schema.conformidadeGaps.createdAt, dataInicio))
        .orderBy(desc(schema.conformidadeGaps.createdAt)),
    ]);

    const rows = resultados as ResultadoRow[];
    const gaps = gapsData as GapRow[];

    const scoreGeral = rows.length
      ? Math.round(rows.reduce((acc, r) => acc + (r.scoreGeral || 0), 0) / rows.length)
      : 0;

    const gapsCriticos = gaps.filter(g => g.severidade === 'critica' && !g.resolvido);

    return {
      success: true,
      data: {
        tipo: "executivo",
        empresa,
        periodo: { inicio: dataInicio, fim: new Date().toISOString(), dias: Math.ceil((Date.now() - new Date(dataInicio).getTime()) / (86400000)) },
        resumo: {
          score_geral: scoreGeral,
          nivel_risco: scoreGeral >= 80 ? 'baixo' : scoreGeral >= 60 ? 'medio' : scoreGeral >= 40 ? 'alto' : 'critico',
          total_analises: rows.length,
          gaps_criticos: gapsCriticos.length,
          taxa_conformidade: scoreGeral,
        },
        principais_achados: {
          gaps_criticos: gapsCriticos.slice(0, 10),
          normas_maior_risco: [],
          recomendacoes_prioritarias: gapsCriticos.slice(0, 5).map(gap => ({
            descricao: gap.descricao, recomendacao: gap.recomendacao, prazo: gap.prazoSugerido, impacto: gap.impacto,
          })),
        },
        tendencias: {
          evolucao_score: rows.slice(0, 10).map(r => ({ data: r.createdAt, score: r.scoreGeral || 0 })),
        },
        gerado_em: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Erro no relatório executivo:', error);
    return { success: false, error: "Erro ao gerar relatório executivo" };
  }
}

async function gerarRelatorioDetalhado(empresaId: string, empresa: EmpresaRow, dataInicio: string) {
  try {
    const [resultados, gapsData, documentos, jobs] = await Promise.all([
      db.select().from(schema.analiseResultados)
        .where(and(eq(schema.analiseResultados.empresaId, empresaId), gte(schema.analiseResultados.createdAt, dataInicio))),
      db.select().from(schema.conformidadeGaps).where(gte(schema.conformidadeGaps.createdAt, dataInicio)),
      db.select().from(schema.documentosEmpresa).where(eq(schema.documentosEmpresa.empresaId, empresaId)),
      db.select().from(schema.analiseJobs)
        .where(and(eq(schema.analiseJobs.empresaId, empresaId), gte(schema.analiseJobs.createdAt, dataInicio))),
    ]);

    const rows = resultados as ResultadoRow[];
    const gaps = gapsData as GapRow[];
    const jobRows = jobs as JobRow[];

    return {
      success: true,
      data: {
        tipo: "detalhado",
        empresa,
        periodo: { inicio: dataInicio, fim: new Date().toISOString() },
        analises_realizadas: resultados,
        gaps_identificados: gapsData,
        documentos_analisados: documentos,
        historico_processamento: jobs,
        estatisticas_detalhadas: calcularEstatisticasDetalhadas(rows, gaps, jobRows),
        gerado_em: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Erro no relatório detalhado:', error);
    return { success: false, error: "Erro ao gerar relatório detalhado" };
  }
}

async function gerarRelatorioGaps(_empresaId: string, empresa: EmpresaRow, dataInicio: string, severidade?: string | null) {
  try {
    const gapsData = await db.select().from(schema.conformidadeGaps)
      .where(gte(schema.conformidadeGaps.createdAt, dataInicio))
      .orderBy(desc(schema.conformidadeGaps.createdAt));

    let gaps = gapsData as GapRow[];
    if (severidade) {
      gaps = gaps.filter(g => g.severidade === severidade);
    }

    // Enriquecer com normas locais
    const normaIds = [...new Set(gaps.map(g => g.normaId).filter(Boolean))] as number[];
    const normasMap = normaIds.length > 0
      ? Object.fromEntries(getNormasByIds(normaIds).map(n => [n.id, n]))
      : {};

    const enrichedGaps = gaps.map(g => ({ ...g, norma: g.normaId ? normasMap[g.normaId] || null : null }));

    const gapsPorSeveridade = enrichedGaps.reduce<Record<string, typeof enrichedGaps>>((acc, gap) => {
      (acc[gap.severidade] = acc[gap.severidade] || []).push(gap);
      return acc;
    }, {});

    return {
      success: true,
      data: {
        tipo: "gaps",
        empresa,
        filtros: { severidade, periodo_inicio: dataInicio },
        resumo: {
          total_gaps: enrichedGaps.length,
          gaps_resolvidos: enrichedGaps.filter(g => g.resolvido).length,
          gaps_pendentes: enrichedGaps.filter(g => !g.resolvido).length,
          por_severidade: Object.keys(gapsPorSeveridade).map(sev => ({
            severidade: sev, total: gapsPorSeveridade[sev].length, resolvidos: gapsPorSeveridade[sev].filter(g => g.resolvido).length,
          })),
        },
        gaps_detalhados: enrichedGaps,
        plano_acao_sugerido: {
          acoes_imediatas: enrichedGaps.filter(g => g.severidade === 'critica' && !g.resolvido).slice(0, 5).map(gap => ({
            gap_id: gap.id, acao: gap.recomendacao || 'Avaliar e implementar correção', prazo: "30 dias", prioridade: "crítica",
          })),
          total_acoes: enrichedGaps.filter(g => g.severidade === 'critica' && !g.resolvido).length,
        },
        gerado_em: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Erro no relatório de gaps:', error);
    return { success: false, error: "Erro ao gerar relatório de gaps" };
  }
}

async function gerarRelatorioCompliance(empresaId: string, empresa: EmpresaRow, dataInicio: string) {
  try {
    const resultados = await db.select().from(schema.analiseResultados)
      .where(and(eq(schema.analiseResultados.empresaId, empresaId), gte(schema.analiseResultados.createdAt, dataInicio)));

    const rows = resultados as ResultadoRow[];
    const scoreGeral = rows.length
      ? rows.reduce((acc, r) => acc + (r.scoreGeral || 0), 0) / rows.length
      : 0;

    const statusCompliance = scoreGeral >= 90 ? "Excelente" : scoreGeral >= 80 ? "Bom" : scoreGeral >= 70 ? "Satisfatório" : scoreGeral >= 60 ? "Necessita Melhorias" : "Crítico";

    return {
      success: true,
      data: {
        tipo: "compliance",
        empresa,
        periodo: { inicio: dataInicio, fim: new Date().toISOString() },
        status_geral: statusCompliance,
        normas_analisadas: [],
        certificacoes: {
          iso_45001: { elegivel: false, score_necessario: 85, score_atual: 0 },
          nr_compliance: { percentual_conformidade: 0, normas_conformes: 0, total_normas: 0 },
        },
        recomendacoes_compliance: [],
        proximas_acoes: [],
        gerado_em: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Erro no relatório de compliance:', error);
    return { success: false, error: "Erro ao gerar relatório de compliance" };
  }
}

function calcularEstatisticasDetalhadas(resultados: ResultadoRow[], gaps: GapRow[], jobs: JobRow[]) {
  const media_score = resultados.length
    ? resultados.reduce((acc, r) => acc + (r.scoreGeral || 0), 0) / resultados.length
    : 0;

  const total_gaps_por_severidade = gaps.reduce<Record<string, number>>((acc, gap) => {
    acc[gap.severidade] = (acc[gap.severidade] || 0) + 1;
    return acc;
  }, {});

  const finishedJobs = jobs.filter(j => j.completedAt && j.startedAt);
  const tempo_medio_processamento = finishedJobs.length
    ? finishedJobs.reduce((acc, j) => acc + (new Date(j.completedAt!).getTime() - new Date(j.startedAt!).getTime()), 0) / finishedJobs.length / 1000
    : 0;

  return { media_score, total_gaps_por_severidade, tempo_medio_processamento };
}
