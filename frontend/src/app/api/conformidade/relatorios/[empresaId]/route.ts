import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Relatórios sempre fresh

export async function GET(
  request: Request,
  { params }: { params: Promise<{ empresaId: string }> }
) {
  try {
    const { empresaId } = await params;
    const { searchParams } = new URL(request.url);
    
    const tipo = searchParams.get("tipo") || "executivo"; // executivo, detalhado, gaps, compliance
    const formato = searchParams.get("formato") || "json"; // json, csv, pdf
    const periodo = searchParams.get("periodo") || "90"; // dias
    const incluirGraficos = searchParams.get("incluir_graficos") === "true";
    const normasIds = searchParams.get("normas_ids"); // filtro opcional
    const severidade = searchParams.get("severidade"); // filtro gaps

    if (!empresaId) {
      return Response.json({ 
        success: false, 
        error: "ID da empresa é obrigatório" 
      }, { status: 400 });
    }

    // Verificar empresa
    const { data: empresa, error: empresaError } = await supabase
      .from("empresas")
      .select("*")
      .eq("id", empresaId)
      .eq("ativo", true)
      .single();

    if (empresaError || !empresa) {
      return Response.json({ 
        success: false, 
        error: "Empresa não encontrada ou inativa" 
      }, { status: 404 });
    }

    // Data de filtro
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));
    const dataInicioISO = dataInicio.toISOString();

    let relatorio: any = {};

    switch (tipo) {
      case "executivo":
        relatorio = await gerarRelatorioExecutivo(empresaId, empresa, dataInicioISO, normasIds);
        break;
      
      case "detalhado":
        relatorio = await gerarRelatorioDetalhado(empresaId, empresa, dataInicioISO, normasIds);
        break;
      
      case "gaps":
        relatorio = await gerarRelatorioGaps(empresaId, empresa, dataInicioISO, severidade, normasIds);
        break;
      
      case "compliance":
        relatorio = await gerarRelatorioCompliance(empresaId, empresa, dataInicioISO, normasIds);
        break;
      
      default:
        return Response.json({ 
          success: false, 
          error: "Tipo de relatório inválido" 
        }, { status: 400 });
    }

    if (!relatorio.success) {
      return Response.json(relatorio, { status: 500 });
    }

    // Adicionar gráficos se solicitado
    if (incluirGraficos) {
      relatorio.data.graficos = await gerarDadosGraficos(empresaId, dataInicioISO);
    }

    // Formatar resposta baseado no formato solicitado
    if (formato === "csv") {
      return gerarCSV(relatorio.data, tipo);
    } else if (formato === "pdf") {
      return gerarPDF(relatorio.data, tipo, empresa);
    }

    return Response.json(relatorio);

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return Response.json({ 
      success: false, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
}

// POST para gerar relatórios customizados
export async function POST(
  request: Request,
  { params }: { params: Promise<{ empresaId: string }> }
) {
  try {
    const { empresaId } = await params;
    const body = await request.json();
    
    const {
      nome_relatorio,
      descricao,
      configuracao,
      agendamento,
      destinatarios
    } = body;

    if (!nome_relatorio || !configuracao) {
      return Response.json({ 
        success: false, 
        error: "nome_relatorio e configuracao são obrigatórios" 
      }, { status: 400 });
    }

    // Aqui seria implementada a lógica para salvar configurações de relatórios customizados
    // Por agora, retornamos um mock da funcionalidade

    const relatorioCustomizado = {
      id: `custom_${Date.now()}`,
      empresa_id: empresaId,
      nome: nome_relatorio,
      descricao: descricao || "",
      configuracao,
      agendamento: agendamento || null,
      destinatarios: destinatarios || [],
      criado_em: new Date().toISOString(),
      ativo: true
    };

    return Response.json({
      success: true,
      data: relatorioCustomizado,
      message: "Relatório customizado criado com sucesso"
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar relatório customizado:', error);
    return Response.json({ 
      success: false, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
}

// FUNÇÕES DE GERAÇÃO DE RELATÓRIOS

async function gerarRelatorioExecutivo(empresaId: string, empresa: any, dataInicio: string, normasIds?: string | null) {
  try {
    // Buscar dados consolidados
    const [resultados, gaps, jobs] = await Promise.all([
      // Resultados de análises
      supabase
        .from("analise_resultados")
        .select("*")
        .eq("empresa_id", empresaId)
        .gte("created_at", dataInicio)
        .order("created_at", { ascending: false }),

      // Gaps críticos
      supabase
        .from("conformidade_gaps")
        .select(`
          *,
          normas(codigo, titulo),
          analise_resultados!inner(empresa_id)
        `)
        .eq("analise_resultados.empresa_id", empresaId)
        .gte("created_at", dataInicio)
        .order("severidade", { ascending: false }),

      // Jobs de análise
      supabase
        .from("analise_jobs")
        .select("*")
        .eq("empresa_id", empresaId)
        .gte("created_at", dataInicio)
    ]);

    const scoreGeral = resultados.data?.length ? 
      Math.round(resultados.data.reduce((acc, r) => acc + (r.score_geral || 0), 0) / resultados.data.length) : 0;

    const gapsCriticos = gaps.data?.filter(g => g.severidade === 'critica' && !g.resolvido) || [];
    const riscoGeral = scoreGeral >= 80 ? 'baixo' : scoreGeral >= 60 ? 'medio' : scoreGeral >= 40 ? 'alto' : 'critico';

    return {
      success: true,
      data: {
        tipo: "executivo",
        empresa,
        periodo: {
          inicio: dataInicio,
          fim: new Date().toISOString(),
          dias: Math.ceil((Date.now() - new Date(dataInicio).getTime()) / (1000 * 60 * 60 * 24))
        },
        resumo: {
          score_geral: scoreGeral,
          nivel_risco: riscoGeral,
          total_analises: resultados.data?.length || 0,
          gaps_criticos: gapsCriticos.length,
          taxa_conformidade: scoreGeral
        },
        principais_achados: {
          gaps_criticos: gapsCriticos.slice(0, 10),
          normas_maior_risco: await getNormasMaiorRisco(empresaId, dataInicio),
          recomendacoes_prioritarias: gerarRecomendacoesPrioritarias(gapsCriticos)
        },
        tendencias: {
          evolucao_score: resultados.data?.slice(0, 10).map(r => ({
            data: r.created_at,
            score: r.score_geral
          })) || []
        },
        gerado_em: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Erro no relatório executivo:', error);
    return { success: false, error: "Erro ao gerar relatório executivo" };
  }
}

async function gerarRelatorioDetalhado(empresaId: string, empresa: any, dataInicio: string, normasIds?: string | null) {
  try {
    let normasFilter = "";
    if (normasIds) {
      normasFilter = normasIds.split(',').map(id => id.trim()).join(',');
    }

    // Dados completos
    const [resultados, gaps, documentos, jobs] = await Promise.all([
      supabase
        .from("analise_resultados")
        .select("*")
        .eq("empresa_id", empresaId)
        .gte("created_at", dataInicio),

      supabase
        .from("conformidade_gaps")
        .select(`
          *,
          normas(id, codigo, titulo),
          analise_resultados!inner(empresa_id)
        `)
        .eq("analise_resultados.empresa_id", empresaId)
        .gte("created_at", dataInicio),

      supabase
        .from("documentos_empresa")
        .select("*")
        .eq("empresa_id", empresaId),

      supabase
        .from("analise_jobs")
        .select(`
          *,
          documentos_empresa(nome_arquivo, tipo_documento)
        `)
        .eq("empresa_id", empresaId)
        .gte("created_at", dataInicio)
    ]);

    return {
      success: true,
      data: {
        tipo: "detalhado",
        empresa,
        periodo: { inicio: dataInicio, fim: new Date().toISOString() },
        analises_realizadas: resultados.data || [],
        gaps_identificados: gaps.data || [],
        documentos_analisados: documentos.data || [],
        historico_processamento: jobs.data || [],
        estatisticas_detalhadas: calcularEstatisticasDetalhadas(resultados.data, gaps.data, jobs.data),
        gerado_em: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Erro no relatório detalhado:', error);
    return { success: false, error: "Erro ao gerar relatório detalhado" };
  }
}

async function gerarRelatorioGaps(empresaId: string, empresa: any, dataInicio: string, severidade?: string | null, normasIds?: string | null) {
  try {
    let query = supabase
      .from("conformidade_gaps")
      .select(`
        *,
        normas(id, codigo, titulo),
        analise_resultados!inner(
          empresa_id,
          score_geral,
          created_at,
          documentos_empresa(nome_arquivo, tipo_documento)
        )
      `)
      .eq("analise_resultados.empresa_id", empresaId)
      .gte("created_at", dataInicio)
      .order("severidade", { ascending: false })
      .order("created_at", { ascending: false });

    if (severidade) {
      query = query.eq("severidade", severidade);
    }

    const { data: gaps, error } = await query;

    if (error) throw error;

    // Agrupar gaps por severidade e categoria
    const gapsPorSeveridade = gaps?.reduce((acc: any, gap) => {
      acc[gap.severidade] = acc[gap.severidade] || [];
      acc[gap.severidade].push(gap);
      return acc;
    }, {}) || {};

    const gapsPorCategoria = gaps?.reduce((acc: any, gap) => {
      const categoria = gap.categoria || 'Sem categoria';
      acc[categoria] = acc[categoria] || [];
      acc[categoria].push(gap);
      return acc;
    }, {}) || {};

    return {
      success: true,
      data: {
        tipo: "gaps",
        empresa,
        filtros: { severidade, periodo_inicio: dataInicio },
        resumo: {
          total_gaps: gaps?.length || 0,
          gaps_resolvidos: gaps?.filter(g => g.resolvido).length || 0,
          gaps_pendentes: gaps?.filter(g => !g.resolvido).length || 0,
          por_severidade: Object.keys(gapsPorSeveridade).map(sev => ({
            severidade: sev,
            total: gapsPorSeveridade[sev].length,
            resolvidos: gapsPorSeveridade[sev].filter((g: any) => g.resolvido).length
          }))
        },
        gaps_detalhados: gaps || [],
        agrupamentos: {
          por_severidade: gapsPorSeveridade,
          por_categoria: gapsPorCategoria
        },
        plano_acao_sugerido: gerarPlanoAcaoGaps(gaps || []),
        gerado_em: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Erro no relatório de gaps:', error);
    return { success: false, error: "Erro ao gerar relatório de gaps" };
  }
}

async function gerarRelatorioCompliance(empresaId: string, empresa: any, dataInicio: string, normasIds?: string | null) {
  try {
    // Dados para compliance
    const [resultados, normasAnalisadas] = await Promise.all([
      supabase
        .from("analise_resultados")
        .select("*")
        .eq("empresa_id", empresaId)
        .gte("created_at", dataInicio),

      supabase
        .from("normas")
        .select("id, codigo, titulo, orgao_publicador")
        .order("codigo")
    ]);

    const scoresPorNorma = await calcularScoresPorNorma(empresaId, dataInicio);
    const statusCompliance = calcularStatusCompliance(resultados.data || []);

    return {
      success: true,
      data: {
        tipo: "compliance",
        empresa,
        periodo: { inicio: dataInicio, fim: new Date().toISOString() },
        status_geral: statusCompliance,
        normas_analisadas: scoresPorNorma,
        certificacoes: {
          iso_45001: avaliarISO45001(scoresPorNorma),
          nr_compliance: avaliarNRCompliance(scoresPorNorma)
        },
        recomendacoes_compliance: gerarRecomendacoesCompliance(scoresPorNorma),
        proximas_acoes: gerarProximasAcoes(empresa, scoresPorNorma),
        gerado_em: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Erro no relatório de compliance:', error);
    return { success: false, error: "Erro ao gerar relatório de compliance" };
  }
}

// FUNÇÕES UTILITÁRIAS

async function getNormasMaiorRisco(empresaId: string, dataInicio: string) {
  // Implementar lógica para identificar normas com maior risco
  return [];
}

function gerarRecomendacoesPrioritarias(gapsCriticos: any[]) {
  return gapsCriticos.slice(0, 5).map(gap => ({
    descricao: gap.descricao,
    recomendacao: gap.recomendacao,
    prazo: gap.prazo_sugerido,
    impacto: gap.impacto
  }));
}

function calcularEstatisticasDetalhadas(resultados: any[], gaps: any[], jobs: any[]) {
  return {
    media_score: resultados.length ? resultados.reduce((acc, r) => acc + r.score_geral, 0) / resultados.length : 0,
    total_gaps_por_severidade: gaps.reduce((acc: any, gap) => {
      acc[gap.severidade] = (acc[gap.severidade] || 0) + 1;
      return acc;
    }, {}),
    tempo_medio_processamento: jobs.length ? 
      jobs.filter(j => j.completed_at && j.started_at)
           .reduce((acc, j) => acc + (new Date(j.completed_at).getTime() - new Date(j.started_at).getTime()), 0) / jobs.length / 1000
      : 0
  };
}

function gerarPlanoAcaoGaps(gaps: any[]) {
  const gapsCriticos = gaps.filter(g => g.severidade === 'critica' && !g.resolvido);
  return {
    acoes_imediatas: gapsCriticos.slice(0, 5).map(gap => ({
      gap_id: gap.id,
      acao: gap.recomendacao,
      prazo: "30 dias",
      prioridade: "crítica"
    })),
    total_acoes: gapsCriticos.length
  };
}

async function calcularScoresPorNorma(empresaId: string, dataInicio: string) {
  // Implementar cálculo de scores por norma
  return [];
}

function calcularStatusCompliance(resultados: any[]) {
  const scoreGeral = resultados.length ? 
    resultados.reduce((acc, r) => acc + r.score_geral, 0) / resultados.length : 0;
  
  if (scoreGeral >= 90) return "Excelente";
  if (scoreGeral >= 80) return "Bom";
  if (scoreGeral >= 70) return "Satisfatório";
  if (scoreGeral >= 60) return "Necessita Melhorias";
  return "Crítico";
}

function avaliarISO45001(scoresPorNorma: any[]) {
  return { elegivel: false, score_necessario: 85, score_atual: 0 };
}

function avaliarNRCompliance(scoresPorNorma: any[]) {
  return { percentual_conformidade: 0, normas_conformes: 0, total_normas: 0 };
}

function gerarRecomendacoesCompliance(scoresPorNorma: any[]) {
  return [];
}

function gerarProximasAcoes(empresa: any, scoresPorNorma: any[]) {
  return [];
}

async function gerarDadosGraficos(empresaId: string, dataInicio: string) {
  // Implementar geração de dados para gráficos
  return {
    evolucao_score: [],
    distribuicao_gaps: [],
    compliance_por_norma: []
  };
}

function gerarCSV(data: any, tipo: string) {
  // Implementar geração de CSV
  const csv = "CSV não implementado ainda";
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="relatorio_${tipo}_${Date.now()}.csv"`
    }
  });
}

function gerarPDF(data: any, tipo: string, empresa: any) {
  // Implementar geração de PDF
  return Response.json({ 
    success: false, 
    error: "Geração de PDF não implementada ainda" 
  }, { status: 501 });
}
