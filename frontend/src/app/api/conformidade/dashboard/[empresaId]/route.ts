import { supabase } from "@/lib/supabase";

export const revalidate = 300; // Cache por 5 minutos para dashboards

type JobRow = {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  completed_at: string | null;
  progresso: number | null;
  tipo_analise?: string | null;
};

type ResultadoRow = {
  id: string;
  score_geral?: number | null;
  nivel_risco?: 'baixo' | 'medio' | 'alto' | 'critico' | null;
  status_geral?: 'conforme' | 'nao_conforme' | 'parcial_conforme' | null;
  created_at: string;
  metadata?: unknown;
};

type DocumentoRow = {
  id: string;
  nome_arquivo: string;
  tipo_documento: string;
  created_at: string;
};

type NormaRef = { id: string; codigo: string; titulo: string };

type GapRow = {
  id: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  resolvido: boolean;
  created_at: string;
  data_resolucao: string | null;
  prazo_sugerido: string | null;
  analise_resultado_id: string;
  norma_id: string | null;
  categoria?: string | null;
  norma?: NormaRef | null;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ empresaId: string }> }
) {
  try {
    const { empresaId } = await params;
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "30"; // dias
    const incluirDetalhes = searchParams.get("incluir_detalhes") === "true";

    if (!empresaId) {
      return Response.json({ 
        success: false, 
        error: "ID da empresa é obrigatório" 
      }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    // Verificar se empresa existe
    const { data: empresa, error: empresaError } = await supabase
      .from("empresas")
      .select("id, nome, cnpj, setor, porte, ativo")
      .eq("id", empresaId)
      .eq("ativo", true)
      .single();

    if (empresaError || !empresa) {
      return Response.json({ 
        success: false, 
        error: "Empresa não encontrada ou inativa" 
      }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    // Data de início para filtros
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));
    const dataInicioISO = dataInicio.toISOString();

    // 1. ESTATÍSTICAS DE JOBS
    const { data: jobs, error: jobsError } = await supabase
      .from("analise_jobs")
      .select("id, status, created_at, completed_at, progresso, tipo_analise")
      .eq("empresa_id", empresaId)
      .gte("created_at", dataInicioISO)
      .order("created_at", { ascending: false });

    if (jobsError) {
      return Response.json({ 
        success: false, 
        error: "Erro ao buscar jobs" 
      }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    // 2. ESTATÍSTICAS DE RESULTADOS
    const { data: resultados, error: resultadosError } = await supabase
      .from("analise_resultados")
      .select("id, score_geral, nivel_risco, status_geral, created_at, metadata")
      .eq("empresa_id", empresaId)
      .gte("created_at", dataInicioISO)
      .order("created_at", { ascending: false });

    if (resultadosError) {
      return Response.json({ 
        success: false, 
        error: "Erro ao buscar resultados" 
      }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    // 3. GAPS DE CONFORMIDADE (Enterprise Defensive Query)
    let gaps: GapRow[] = [];

    try {
      const { data: gapsData, error: gapsQueryError } = await supabase
        .from("conformidade_gaps")
        .select(`
          id, 
          severidade, 
          resolvido, 
          created_at,
          data_resolucao,
          prazo_sugerido,
          analise_resultado_id,
          norma_id
        `)
        .gte("created_at", dataInicioISO)
        .order("severidade", { ascending: false })
        .order("created_at", { ascending: false });

      if (gapsQueryError) {
        console.warn('Aviso: Gaps query failed, continuando sem dados de gaps:', gapsQueryError);
        gaps = [];
      } else {
        gaps = (gapsData || []) as GapRow[];
      }

      // Enriquecer com dados das normas (defensivo)
      if (gaps.length > 0) {
        const normaIds = [...new Set(gaps.map(g => g.norma_id).filter((v): v is string => Boolean(v)))];
        if (normaIds.length > 0) {
          const { data: normasData } = await supabase
            .from("normas")
            .select("id, codigo, titulo")
            .in("id", normaIds);

          const normas = (normasData || []) as NormaRef[];
          gaps = gaps.map(gap => ({
            ...gap,
            norma: gap.norma_id ? normas.find(n => n.id === gap.norma_id) || null : null
          }));
        }
      }

    } catch (err) {
      console.warn('Aviso: Erro ao buscar gaps, continuando sem estes dados:', err);
      gaps = [];
    }

    // 4. DOCUMENTOS DA EMPRESA
    const { data: documentos, error: documentosError } = await supabase
      .from("documentos_empresa")
      .select("id, nome_arquivo, tipo_documento, created_at")
      .eq("empresa_id", empresaId)
      .order("created_at", { ascending: false });

    if (documentosError) {
      return Response.json({ 
        success: false, 
        error: "Erro ao buscar documentos" 
      }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }

    // CÁLCULOS DO DASHBOARD

    const jobsRows = (jobs || []) as JobRow[];
    const resultadosRows = (resultados || []) as ResultadoRow[];
    const documentosRows = (documentos || []) as DocumentoRow[];

    // Estatísticas de Jobs
    const totalJobs = jobsRows.length;
    const jobsPendentes = jobsRows.filter(j => j.status === 'pending').length;
    const jobsProcessando = jobsRows.filter(j => j.status === 'running').length;
    const jobsCompletos = jobsRows.filter(j => j.status === 'completed').length;
    const jobsFalharam = jobsRows.filter(j => j.status === 'failed').length;
    const jobsCancelados = jobsRows.filter(j => j.status === 'cancelled').length;

    const taxaSucesso = totalJobs > 0 ? Math.round((jobsCompletos / totalJobs) * 100) : 0;

    const jobsComTempo = jobsRows.filter(j => j.completed_at && j.created_at);
    const tempoMedio = jobsComTempo.length > 0 
      ? Math.round(jobsComTempo.reduce((acc, job) => {
          const inicio = new Date(job.created_at).getTime();
          const fim = new Date(job.completed_at as string).getTime();
          return acc + (fim - inicio) / 1000;
        }, 0) / jobsComTempo.length)
      : 0;

    // Estatísticas de Conformidade
    const totalAnalises = resultadosRows.length;
    const scoreGeral = totalAnalises > 0 
      ? Math.round(resultadosRows.reduce((acc, r) => acc + (r.score_geral || 0), 0) / totalAnalises)
      : 0;

    const conformes = resultadosRows.filter(r => r.status_geral === 'conforme').length;
    const naoConformes = resultadosRows.filter(r => r.status_geral === 'nao_conforme').length;
    const parcialConformes = resultadosRows.filter(r => r.status_geral === 'parcial_conforme').length;

    const riscoBaixo = resultadosRows.filter(r => r.nivel_risco === 'baixo').length;
    const riscoMedio = resultadosRows.filter(r => r.nivel_risco === 'medio').length;
    const riscoAlto = resultadosRows.filter(r => r.nivel_risco === 'alto').length;
    const riscoCritico = resultadosRows.filter(r => r.nivel_risco === 'critico').length;

    // Estatísticas de Gaps
    const totalGaps = gaps.length;
    const gapsResolvidos = gaps.filter(g => g.resolvido).length;
    const gapsPendentes = totalGaps - gapsResolvidos;

    const gapsCriticos = gaps.filter(g => g.severidade === 'critica').length;
    const gapsAltos = gaps.filter(g => g.severidade === 'alta').length;
    const gapsMedios = gaps.filter(g => g.severidade === 'media').length;
    const gapsBaixos = gaps.filter(g => g.severidade === 'baixa').length;

    const gapsPorCategoria: Record<string, number> = gaps.reduce((acc, gap) => {
      const categoria = gap.categoria || 'Sem categoria';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const ultimosResultados = resultadosRows.slice(0, 10);
    const tendenciaScore = ultimosResultados.map(r => ({
      data: r.created_at,
      score: r.score_geral || 0,
      nivel_risco: r.nivel_risco
    }));

    const documentosPorTipo: Record<string, number> = documentosRows.reduce((acc, doc) => {
      acc[doc.tipo_documento] = (acc[doc.tipo_documento] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Dashboard consolidado
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
        risco_predominante: getRiscoPredominante(riscoBaixo, riscoMedio, riscoAlto, riscoCritico)
      },

      processamento: {
        total_jobs: totalJobs,
        jobs_pendentes: jobsPendentes,
        jobs_processando: jobsProcessando,
        jobs_completos: jobsCompletos,
        jobs_falharam: jobsFalharam,
        jobs_cancelados: jobsCancelados,
        taxa_sucesso_percentual: taxaSucesso,
        tempo_medio_processamento_segundos: tempoMedio,
        tempo_medio_formatado: formatarTempo(tempoMedio)
      },

      conformidade: {
        total_analises: totalAnalises,
        score_medio: scoreGeral,
        distribuicao_status: {
          conforme: conformes,
          nao_conforme: naoConformes,
          parcial_conforme: parcialConformes
        },
        distribuicao_risco: {
          baixo: riscoBaixo,
          medio: riscoMedio,
          alto: riscoAlto,
          critico: riscoCritico
        },
        tendencia_score: tendenciaScore
      },

      gaps: {
        total: totalGaps,
        resolvidos: gapsResolvidos,
        pendentes: gapsPendentes,
        taxa_resolucao_percentual: totalGaps > 0 ? Math.round((gapsResolvidos / totalGaps) * 100) : 0,
        distribuicao_severidade: {
          critica: gapsCriticos,
          alta: gapsAltos,
          media: gapsMedios,
          baixa: gapsBaixos
        },
        por_categoria: gapsPorCategoria
      },

      documentos: {
        total: documentosRows.length,
        por_tipo: documentosPorTipo
      }
    };

    const payload = {
      success: true as const,
      data: {
        ...dashboard,
        ...(incluirDetalhes
          ? {
              detalhes: {
                jobs_recentes: jobsRows.slice(0, 10),
                resultados_recentes: resultadosRows.slice(0, 10),
                gaps_criticos_pendentes: gaps.filter(g => g.severidade === 'critica' && !g.resolvido).slice(0, 20),
                documentos_recentes: documentosRows.slice(0, 10)
              }
            }
          : {})
      }
    };

    return Response.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" }
    });

  } catch (error) {
    console.error('Erro no dashboard de conformidade:', error);
    return Response.json({ 
      success: false, 
      error: "Erro interno do servidor" 
    }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

// Funções utilitárias
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

  if (horas > 0) {
    return `${horas}h ${minutos}m`;
  } else if (minutos > 0) {
    return `${minutos}m ${segs}s`;
  } else {
    return `${segs}s`;
  }
}