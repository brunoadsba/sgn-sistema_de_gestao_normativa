import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Relatórios sempre fresh

type EmpresaRow = {
  id: string;
  nome: string;
  cnpj?: string | null;
  setor?: string | null;
  porte?: string | null;
  ativo?: boolean | null;
};

type ResultadoRow = {
  id: string;
  score_geral?: number | null;
  nivel_risco?: 'baixo' | 'medio' | 'alto' | 'critico' | null;
  status_geral?: 'conforme' | 'nao_conforme' | 'parcial_conforme' | null;
  created_at: string;
};

type DocRow = {
  id: string;
  nome_arquivo: string;
  tipo_documento: string;
  created_at: string;
};

type GapRow = {
  id: string;
  severidade: 'critica' | 'alta' | 'media' | 'baixa';
  resolvido: boolean;
  created_at: string;
  descricao?: string | null;
  recomendacao?: string | null;
  prazo_sugerido?: string | null;
  impacto?: string | null;
  categoria?: string | null;
};

type JobRow = {
  id: string;
  created_at: string;
  started_at?: string | null;
  completed_at?: string | null;
};

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
    const severidade = searchParams.get("severidade"); // filtro gaps

    if (!empresaId) {
      return Response.json({ 
        success: false, 
        error: "ID da empresa é obrigatório" 
      }, { status: 400 });
    }

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

    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));
    const dataInicioISO = dataInicio.toISOString();

    let relatorio: { success: boolean; data?: unknown; error?: string } = { success: false };

    switch (tipo) {
      case "executivo":
        relatorio = await gerarRelatorioExecutivo(empresaId, empresa as EmpresaRow, dataInicioISO);
        break;
      
      case "detalhado":
        relatorio = await gerarRelatorioDetalhado(empresaId, empresa as EmpresaRow, dataInicioISO);
        break;
      
      case "gaps":
        relatorio = await gerarRelatorioGaps(empresaId, empresa as EmpresaRow, dataInicioISO, severidade);
        break;
      
      case "compliance":
        relatorio = await gerarRelatorioCompliance(empresaId, empresa as EmpresaRow, dataInicioISO);
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

    if (incluirGraficos && relatorio.data && typeof relatorio.data === 'object') {
      (relatorio.data as Record<string, unknown>)['graficos'] = await gerarDadosGraficos();
    }

    if (formato === "csv") {
      return gerarCSV(relatorio.data, tipo);
    } else if (formato === "pdf") {
      return gerarPDF();
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

// ====== FUNÇÕES DE GERAÇÃO ======

async function gerarRelatorioExecutivo(empresaId: string, empresa: EmpresaRow, dataInicio: string) {
  try {
    const [resultados, gaps] = await Promise.all([
      supabase
        .from("analise_resultados")
        .select("*")
        .eq("empresa_id", empresaId)
        .gte("created_at", dataInicio)
        .order("created_at", { ascending: false }),

      supabase
        .from("conformidade_gaps")
        .select(`
          id, severidade, resolvido, created_at, prazo_sugerido, impacto, descricao, recomendacao,
          normas(codigo, titulo),
          analise_resultados!inner(empresa_id)
        `)
        .eq("analise_resultados.empresa_id", empresaId)
        .gte("created_at", dataInicio)
        .order("severidade", { ascending: false })
    ]);

    const resultadosRows = (resultados.data || []) as ResultadoRow[];
    const gapsRows = (gaps.data || []) as GapRow[];
    // Remover variável não usada: const jobsRows = (jobs.data || []) as JobRow[];

    const scoreGeral = resultadosRows.length
      ? Math.round(resultadosRows.reduce((acc, r) => acc + (r.score_geral || 0), 0) / resultadosRows.length)
      : 0;

    const gapsCriticos = gapsRows.filter(g => g.severidade === 'critica' && !g.resolvido);
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
          total_analises: resultadosRows.length,
          gaps_criticos: gapsCriticos.length,
          taxa_conformidade: scoreGeral
        },
        principais_achados: {
          gaps_criticos: gapsCriticos.slice(0, 10),
          normas_maior_risco: await getNormasMaiorRisco(),
          recomendacoes_prioritarias: gerarRecomendacoesPrioritarias(gapsCriticos)
        },
        tendencias: {
          evolucao_score: resultadosRows.slice(0, 10).map(r => ({
            data: r.created_at,
            score: r.score_geral || 0
          }))
        },
        gerado_em: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Erro no relatório executivo:', error);
    return { success: false, error: "Erro ao gerar relatório executivo" };
  }
}

async function gerarRelatorioDetalhado(empresaId: string, empresa: EmpresaRow, dataInicio: string) {
  try {
    const [resultados, gaps, documentos, jobs] = await Promise.all([
      supabase
        .from("analise_resultados")
        .select("*")
        .eq("empresa_id", empresaId)
        .gte("created_at", dataInicio),

      supabase
        .from("conformidade_gaps")
        .select(`
          id, severidade, resolvido, created_at, prazo_sugerido, impacto, descricao, recomendacao,
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
        .select(`*,
          documentos_empresa(nome_arquivo, tipo_documento)
        `)
        .eq("empresa_id", empresaId)
        .gte("created_at", dataInicio)
    ]);

    const resultadosRows = (resultados.data || []) as ResultadoRow[];
    const gapsRows = (gaps.data || []) as GapRow[];
    const documentosRows = (documentos.data || []) as DocRow[];
    // Remover variável não usada: const jobsRows = (jobs.data || []) as JobRow[];

    return {
      success: true,
      data: {
        tipo: "detalhado",
        empresa,
        periodo: { inicio: dataInicio, fim: new Date().toISOString() },
        analises_realizadas: resultadosRows,
        gaps_identificados: gapsRows,
        documentos_analisados: documentosRows,
        historico_processamento: jobs.data || [],
        estatisticas_detalhadas: calcularEstatisticasDetalhadas(resultadosRows, gapsRows, jobs.data || []),
        gerado_em: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Erro no relatório detalhado:', error);
    return { success: false, error: "Erro ao gerar relatório detalhado" };
  }
}

async function gerarRelatorioGaps(empresaId: string, empresa: EmpresaRow, dataInicio: string, severidade?: string | null) {
  try {
    let query = supabase
      .from("conformidade_gaps")
      .select(`
        id, severidade, resolvido, created_at, prazo_sugerido, impacto, descricao, recomendacao, categoria,
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

    const gapsRows = (gaps || []) as GapRow[];

    const gapsPorSeveridade = gapsRows.reduce<Record<string, GapRow[]>>((acc, gap) => {
      (acc[gap.severidade] = acc[gap.severidade] || []).push(gap);
      return acc;
    }, {});

    const gapsPorCategoria = gapsRows.reduce<Record<string, GapRow[]>>((acc, gap) => {
      const categoria = gap.categoria || 'Sem categoria';
      (acc[categoria] = acc[categoria] || []).push(gap);
      return acc;
    }, {});

    return {
      success: true,
      data: {
        tipo: "gaps",
        empresa,
        filtros: { severidade, periodo_inicio: dataInicio },
        resumo: {
          total_gaps: gapsRows.length,
          gaps_resolvidos: gapsRows.filter(g => g.resolvido).length,
          gaps_pendentes: gapsRows.filter(g => !g.resolvido).length,
          por_severidade: Object.keys(gapsPorSeveridade).map(sev => ({
            severidade: sev,
            total: gapsPorSeveridade[sev].length,
            resolvidos: gapsPorSeveridade[sev].filter(g => g.resolvido).length
          }))
        },
        gaps_detalhados: gapsRows,
        agrupamentos: {
          por_severidade: gapsPorSeveridade,
          por_categoria: gapsPorCategoria
        },
        plano_acao_sugerido: gerarPlanoAcaoGaps(gapsRows),
        gerado_em: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Erro no relatório de gaps:', error);
    return { success: false, error: "Erro ao gerar relatório de gaps" };
  }
}

async function gerarRelatorioCompliance(empresaId: string, empresa: EmpresaRow, dataInicio: string) {
  try {
    const [resultados] = await Promise.all([
      supabase
        .from("analise_resultados")
        .select("*")
        .eq("empresa_id", empresaId)
        .gte("created_at", dataInicio)
    ]);

    const resultadosRows = (resultados.data || []) as ResultadoRow[];
    const scoresPorNorma = await calcularScoresPorNorma();
    const statusCompliance = calcularStatusCompliance(resultadosRows);

    return {
      success: true,
      data: {
        tipo: "compliance",
        empresa,
        periodo: { inicio: dataInicio, fim: new Date().toISOString() },
        status_geral: statusCompliance,
        normas_analisadas: scoresPorNorma,
        certificacoes: {
          iso_45001: avaliarISO45001(),
          nr_compliance: avaliarNRCompliance()
        },
        recomendacoes_compliance: gerarRecomendacoesCompliance(),
        proximas_acoes: gerarProximasAcoes(),
        gerado_em: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Erro no relatório de compliance:', error);
    return { success: false, error: "Erro ao gerar relatório de compliance" };
  }
}

// ====== UTILITÁRIOS ======

async function getNormasMaiorRisco() {
  return [];
}

function gerarRecomendacoesPrioritarias(gapsCriticos: GapRow[]) {
  return gapsCriticos.slice(0, 5).map(gap => ({
    descricao: gap.descricao,
    recomendacao: gap.recomendacao,
    prazo: gap.prazo_sugerido,
    impacto: gap.impacto
  }));
}

function calcularEstatisticasDetalhadas(resultados: ResultadoRow[], gaps: GapRow[], jobs: JobRow[]) {
  const media_score = resultados.length
    ? resultados.reduce((acc, r) => acc + (r.score_geral || 0), 0) / resultados.length
    : 0;

  const total_gaps_por_severidade = gaps.reduce<Record<string, number>>((acc, gap) => {
    acc[gap.severidade] = (acc[gap.severidade] || 0) + 1;
    return acc;
  }, {});

  const tempo_medio_processamento = jobs.length
    ? jobs
        .filter(j => j.completed_at && j.started_at)
        .reduce((acc, j) => acc + (new Date(j.completed_at as string).getTime() - new Date(j.started_at as string).getTime()), 0) /
      jobs.length /
      1000
    : 0;

  return { media_score, total_gaps_por_severidade, tempo_medio_processamento };
}

function gerarPlanoAcaoGaps(gaps: GapRow[]) {
  const gapsCriticos = gaps.filter(g => g.severidade === 'critica' && !g.resolvido);
  return {
    acoes_imediatas: gapsCriticos.slice(0, 5).map(gap => ({
      gap_id: gap.id,
      acao: gap.recomendacao || 'Avaliar e implementar correção',
      prazo: "30 dias",
      prioridade: "crítica"
    })),
    total_acoes: gapsCriticos.length
  };
}

async function calcularScoresPorNorma() {
  return [] as unknown[];
}

function calcularStatusCompliance(resultados: ResultadoRow[]): string {
  const scoreGeral = resultados.length
    ? resultados.reduce((acc, r) => acc + (r.score_geral || 0), 0) / resultados.length
    : 0;
  
  if (scoreGeral >= 90) return "Excelente";
  if (scoreGeral >= 80) return "Bom";
  if (scoreGeral >= 70) return "Satisfatório";
  if (scoreGeral >= 60) return "Necessita Melhorias";
  return "Crítico";
}

function avaliarISO45001() {
  return { elegivel: false, score_necessario: 85, score_atual: 0 };
}

function avaliarNRCompliance() {
  return { percentual_conformidade: 0, normas_conformes: 0, total_normas: 0 };
}

function gerarRecomendacoesCompliance() {
  return [] as unknown[];
}

function gerarProximasAcoes() {
  return [] as unknown[];
}

async function gerarDadosGraficos() {
  return {
    evolucao_score: [] as unknown[],
    distribuicao_gaps: [] as unknown[],
    compliance_por_norma: [] as unknown[]
  };
}

function gerarCSV(data: unknown, tipo: string) {
  const csv = "CSV não implementado ainda";
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="relatorio_${tipo}_${Date.now()}.csv"`
    }
  });
}

function gerarPDF() {
  return Response.json({ 
    success: false, 
    error: "Geração de PDF não implementada ainda" 
  }, { status: 501 });
}
