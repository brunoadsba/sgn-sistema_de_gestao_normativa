import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    console.log('🚀 Criando dados de exemplo...');

    // 1. Buscar uma empresa existente
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id, nome')
      .limit(1);

    if (empresasError || !empresas || empresas.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Nenhuma empresa encontrada' 
      }, { status: 404 });
    }

    const empresa = empresas[0];
    console.log(`📊 Criando dados para empresa: ${empresa.nome}`);

    // 2. Criar documentos de exemplo
    const documentos = [
      {
        empresa_id: empresa.id,
        nome_arquivo: 'PGR_ConstrutoraBR_2025.pdf',
        tipo_documento: 'manual', // Valores permitidos: manual, procedimento, treinamento, politica
        url_storage: 'demo/pgr_construtora_2025.pdf',
        metadados: { 
          tamanho: '2.8MB', 
          paginas: 52,
          versao: '2025.1',
          data_emissao: '2025-01-15',
          tipo_original: 'PGR'
        },
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        empresa_id: empresa.id,
        nome_arquivo: 'PCMSO_ConstrutoraBR_2025.pdf',
        tipo_documento: 'procedimento', // Valores permitidos: manual, procedimento, treinamento, politica
        url_storage: 'demo/pcms_construtora_2025.pdf',
        metadados: { 
          tamanho: '1.9MB', 
          paginas: 38,
          versao: '2025.1',
          data_emissao: '2025-01-10',
          tipo_original: 'PCMSO'
        },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        empresa_id: empresa.id,
        nome_arquivo: 'LTCAT_ConstrutoraBR_2025.pdf',
        tipo_documento: 'politica', // Valores permitidos: manual, procedimento, treinamento, politica
        url_storage: 'demo/ltcat_construtora_2025.pdf',
        metadados: { 
          tamanho: '3.1MB', 
          paginas: 61,
          versao: '2025.1',
          data_emissao: '2025-01-08',
          tipo_original: 'LTCAT'
        },
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { data: documentosInseridos, error: docsError } = await supabase
      .from('documentos_empresa')
      .insert(documentos)
      .select();

    if (docsError) {
      console.error('❌ Erro ao inserir documentos:', docsError);
      return Response.json({ 
        success: false, 
        error: 'Erro ao inserir documentos: ' + docsError.message 
      }, { status: 500 });
    }

    console.log(`✅ ${documentosInseridos.length} documentos criados`);

    // 3. Criar jobs de análise
    const jobs = [
      {
        empresa_id: empresa.id,
        documento_id: documentosInseridos[0].id,
        norma_ids: ['NR-18', 'NR-35', 'NR-12'], // JSONB array obrigatório
        status: 'completed',
        tipo_analise: 'completa',
        priority: 5,
        progresso: 100,
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
      },
      {
        empresa_id: empresa.id,
        documento_id: documentosInseridos[1].id,
        norma_ids: ['NR-7', 'NR-35'], // JSONB array obrigatório
        status: 'completed',
        tipo_analise: 'completa',
        priority: 5,
        progresso: 100,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString()
      },
      {
        empresa_id: empresa.id,
        documento_id: documentosInseridos[2].id,
        norma_ids: ['NR-15', 'NR-9'], // JSONB array obrigatório
        status: 'processing', // Valores permitidos: pending, processing, completed, failed, cancelled
        tipo_analise: 'completa',
        priority: 3,
        progresso: 75,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { data: jobsInseridos, error: jobsError } = await supabase
      .from('analise_jobs')
      .insert(jobs)
      .select();

    if (jobsError) {
      console.error('❌ Erro ao inserir jobs:', jobsError);
      return Response.json({ 
        success: false, 
        error: 'Erro ao inserir jobs: ' + jobsError.message 
      }, { status: 500 });
    }

    console.log(`✅ ${jobsInseridos.length} jobs criados`);

    // 4. Criar resultados de análise
    const resultados = [
      {
        empresa_id: empresa.id,
        job_id: jobsInseridos[0].id, // Corrigido: job_id (não analise_job_id)
        score_geral: 78,
        nivel_risco: 'medio',
        status_geral: 'parcial_conforme',
        metadata: {
          normas_analisadas: ['NR-18', 'NR-35', 'NR-12'],
          conformidade: {
            'NR-18': { score: 85, status: 'conforme' },
            'NR-35': { score: 70, status: 'parcial_conforme' },
            'NR-12': { score: 80, status: 'conforme' }
          },
          documento: 'PGR_ConstrutoraBR_2025.pdf'
        },
        created_at: jobsInseridos[0].completed_at
      },
      {
        empresa_id: empresa.id,
        job_id: jobsInseridos[1].id, // Corrigido: job_id (não analise_job_id)
        score_geral: 88,
        nivel_risco: 'baixo',
        status_geral: 'conforme',
        metadata: {
          normas_analisadas: ['NR-7', 'NR-35'],
          conformidade: {
            'NR-7': { score: 92, status: 'conforme' },
            'NR-35': { score: 84, status: 'conforme' }
          },
          documento: 'PCMSO_ConstrutoraBR_2025.pdf'
        },
        created_at: jobsInseridos[1].completed_at
      }
    ];

    const { data: resultadosInseridos, error: resultadosError } = await supabase
      .from('analise_resultados')
      .insert(resultados)
      .select();

    if (resultadosError) {
      console.error('❌ Erro ao inserir resultados:', resultadosError);
      return Response.json({ 
        success: false, 
        error: 'Erro ao inserir resultados: ' + resultadosError.message 
      }, { status: 500 });
    }

    console.log(`✅ ${resultadosInseridos.length} resultados criados`);

    // 5. Criar gaps de conformidade
    const gaps = [
      {
        analise_resultado_id: resultadosInseridos[0].id,
        norma_id: 65, // NR-10 - SEGURANÇA EM INSTALAÇÕES E SERVIÇOS EM ELETRICIDADE
        severidade: 'critica', // Valores permitidos: critica, importante, menor
        resolvido: false,
        descricao: 'Treinamento de trabalho em altura vencido para 12 funcionários', // obrigatório
        prazo_sugerido: '30_dias', // Valores permitidos: imediato, 30_dias, 90_dias, 180_dias
        created_at: resultadosInseridos[0].created_at
      },
      {
        analise_resultado_id: resultadosInseridos[0].id,
        norma_id: 61, // NR-6 - EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL - EPI
        severidade: 'importante', // Valores permitidos: critica, importante, menor
        resolvido: false,
        descricao: 'Sinalização de segurança incompleta em 3 canteiros', // obrigatório
        prazo_sugerido: '90_dias', // Valores permitidos: imediato, 30_dias, 90_dias, 180_dias
        created_at: resultadosInseridos[0].created_at
      },
      {
        analise_resultado_id: resultadosInseridos[1].id,
        norma_id: 62, // NR-7 - PROGRAMA DE CONTROLE MÉDICO DE SAÚDE OCUPACIONAL
        severidade: 'menor', // Valores permitidos: critica, importante, menor
        resolvido: true,
        descricao: 'Atualização de exames médicos em andamento', // obrigatório
        prazo_sugerido: '30_dias', // Valores permitidos: imediato, 30_dias, 90_dias, 180_dias
        created_at: resultadosInseridos[1].created_at
      }
    ];

    const { data: gapsInseridos, error: gapsError } = await supabase
      .from('conformidade_gaps')
      .insert(gaps)
      .select();

    if (gapsError) {
      console.error('❌ Erro ao inserir gaps:', gapsError);
      return Response.json({ 
        success: false, 
        error: 'Erro ao inserir gaps: ' + gapsError.message 
      }, { status: 500 });
    }

    console.log(`✅ ${gapsInseridos.length} gaps criados`);

    return Response.json({
      success: true,
      message: 'Dados de exemplo criados com sucesso!',
      data: {
        empresa: empresa.nome,
        documentos: documentosInseridos.length,
        jobs: jobsInseridos.length,
        resultados: resultadosInseridos.length,
        gaps: gapsInseridos.length,
        dashboard_url: `/empresas/${empresa.id}/conformidade`
      }
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return Response.json({ 
      success: false, 
      error: 'Erro interno: ' + (error as Error).message 
    }, { status: 500 });
  }
}
