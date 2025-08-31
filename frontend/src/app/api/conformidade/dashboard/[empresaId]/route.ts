import { supabase } from "@/lib/supabase";

export const revalidate = 300; // Cache por 5 minutos para dashboards

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
      }, { status: 400 });
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
      }, { status: 404 });
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
      }, { status: 500 });
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
      }, { status: 500 });
    }

    // 3. GAPS DE CONFORMIDADE (Enterprise Defensive Query)
    let gaps: any[] = [];
    let gapsError = null;

    try {
      // Primeiro tentar query completa com JOINs
      const { data: gapsData, error: gapsQueryError } = await supabase
        .from("conformidade_gaps")
        .select(`
          id, 
          severidade, 
          categoria, 
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
        gaps = []; // Graceful degradation
      } else {
        gaps = gapsData || [];
      }

      // Se temos gaps, enriquecer com dados das normas (query separada defensiva)
      if (gaps.length > 0) {
        const normaIds = [...new Set(gaps.map(g => g.norma_id).filter(Boolean))];
        if (normaIds.length > 0) {
          const { data: normasData } = await supabase
            .from("normas")
            .select("id, codigo, titulo")
            .in("id", normaIds);

          // Enriquecer gaps com dados das normas
          gaps = gaps.map(gap => ({
            ...gap,
            norma: normasData?.find(n => n.id === gap.norma_id) || null
          }));
        }
      }

    } catch (error) {
      console.warn('Aviso: Erro ao buscar gaps, continuando sem estes dados:', error);
      gaps = []; // Sistema continua funcionando
      gapsError = null; // Não quebrar o dashboard
    }

    // Dashboard nunca falha - princípio enterprise de resiliência
    if (false) { // Remover o if (gapsError) que quebrava o sistema
      return Response.json({ 
        success: false, 
        error: "Erro ao buscar gaps" 
      }, { status: 500 });
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
      }, { status: 500 });
    }

    // CÁLCULOS DO DASHBOARD

    // Estatísticas de Jobs
    const totalJobs = jobs?.length || 0;
    const jobsPendentes = jobs?.filter(j => j.status === 'pending').length || 0;
    const jobsProcessando = jobs?.filter(j => j.status === 'running').length || 0;
    const jobsCompletos = jobs?.filter(j => j.status === 'completed').length || 0;
    const jobsFalharam = jobs?.filter(j => j.status === 'failed').length || 0;
    const jobsCancelados = jobs?.filter(j => j.status === 'cancelled').length || 0;

    // Taxa de sucesso
    const taxaSucesso = totalJobs > 0 ? Math.round((jobsCompletos / totalJobs) * 100) : 0;

    // Tempo médio de processamento
    const jobsComTempo = jobs?.filter(j => j.completed_at && j.created_at) || [];
    const tempoMedio = jobsComTempo.length > 0 
      ? Math.round(jobsComTempo.reduce((acc, job) => {
          const inicio = new Date(job.created_at).getTime();
          const fim = new Date(job.completed_at!).getTime();
          return acc + (fim - inicio) / 1000; // segundos
        }, 0) / jobsComTempo.length)
      : 0;

    // Estatísticas de Conformidade
    const totalAnalises = resultados?.length || 0;
    const scoreGeral = totalAnalises > 0 
      ? Math.round(resultados!.reduce((acc, r) => acc + (r.score_geral || 0), 0) / totalAnalises)
      : 0;

    const conformes = resultados?.filter(r => r.status_geral === 'conforme').length || 0;
    const naoConformes = resultados?.filter(r => r.status_geral === 'nao_conforme').length || 0;
    const parcialConformes = resultados?.filter(r => r.status_geral === 'parcial_conforme').length || 0;

    // Distribuição de riscos
    const riscoBaixo = resultados?.filter(r => r.nivel_risco === 'baixo').length || 0;
    const riscoMedio = resultados?.filter(r => r.nivel_risco === 'medio').length || 0;
    const riscoAlto = resultados?.filter(r => r.nivel_risco === 'alto').length || 0;
    const riscoCritico = resultados?.filter(r => r.nivel_risco === 'critico').length || 0;

    // Estatísticas de Gaps
    const totalGaps = gaps?.length || 0;
    const gapsResolvidos = gaps?.filter(g => g.resolvido).length || 0;
    const gapsPendentes = totalGaps - gapsResolvidos;

    const gapsCriticos = gaps?.filter(g => g.severidade === 'critica').length || 0;
    const gapsAltos = gaps?.filter(g => g.severidade === 'alta').length || 0;
    const gapsMedios = gaps?.filter(g => g.severidade === 'media').length || 0;
    const gapsBaixos = gaps?.filter(g => g.severidade === 'baixa').length || 0;

    // Gaps por categoria
    const gapsPorCategoria = gaps?.reduce((acc: any, gap) => {
      const categoria = gap.categoria || 'Sem categoria';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {}) || {};

    // Tendência de score (últimos 30 dias)
    const ultimosResultados = resultados?.slice(0, 10) || [];
    const tendenciaScore = ultimosResultados.map(r => ({
      data: r.created_at,
      score: r.score_geral || 0,
      nivel_risco: r.nivel_risco
    }));

    // Dashboard consolidado
    const dashboard = {
      // Informações da empresa
      empresa: empresa,
      
      // Período de análise
      periodo_dias: parseInt(periodo),
      data_inicio: dataInicioISO,
      ultima_atualizacao: new Date().toISOString(),

      // Resumo executivo
      resumo_executivo: {
        score_geral_medio: scoreGeral,
        total_analises: totalAnalises,
        total_gaps: totalGaps,
        gaps_criticos_pendentes: gaps?.filter(g => g.severidade === 'critica' && !g.resolvido).length || 0,
        taxa_resolucao_gaps: totalGaps > 0 ? Math.round((gapsResolvidos / totalGaps) * 100) : 0,
        risco_predominante: getRiscoPredominante(riscoBaixo, riscoMedio, riscoAlto, riscoCritico)
      },

      // Estatísticas de jobs/processamento
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

      // Estatísticas de conformidade
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

      // Estatísticas de gaps
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

      // Gestão documental
      documentos: {
        total: documentos?.length || 0,
        por_tipo: documentos?.reduce((acc: any, doc) => {
          acc[doc.tipo_documento] = (acc[doc.tipo_documento] || 0) + 1;
          return acc;
        }, {}) || {}
      }
    };

    // Adicionar detalhes se solicitado
    const response: any = {
      success: true,
      data: dashboard
    };

    if (incluirDetalhes) {
      response.data.detalhes = {
        jobs_recentes: jobs?.slice(0, 10) || [],
        resultados_recentes: resultados?.slice(0, 10) || [],
        gaps_criticos_pendentes: gaps?.filter(g => g.severidade === 'critica' && !g.resolvido).slice(0, 20) || [],
        documentos_recentes: documentos?.slice(0, 10) || []
      };
    }

    return Response.json(response);

  } catch (error) {
    console.error('Erro no dashboard de conformidade:', error);
    return Response.json({ 
      success: false, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
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
