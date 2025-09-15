import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    console.log('🏗️ Criando empresa profissional: Construtora BR...');

    // 1. Criar empresa profissional
    const empresa = {
      nome: 'Construtora BR',
      cnpj: '98.765.432/0001-10',
      setor: 'Construção Civil',
      porte: 'grande', // Valores permitidos: pequeno, medio, grande
      configuracoes: {
        segmento: 'Construção Civil',
        funcionarios: 150,
        cnae: '4110-7/00',
        endereco: {
          logradouro: 'Av. das Construções, 1234',
          bairro: 'Centro Empresarial',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567'
        },
        contato: {
          telefone: '(11) 3456-7890',
          email: 'compliance@construtorabr.com.br',
          responsavel_sst: 'João Silva - Engenheiro de Segurança'
        }
      },
      ativo: true
    };

    const { data: empresaInserida, error: empresaError } = await supabase
      .from('empresas')
      .insert(empresa)
      .select()
      .single();

    if (empresaError) {
      console.error('❌ Erro ao criar empresa:', empresaError);
      return Response.json({ 
        success: false, 
        error: 'Erro ao criar empresa: ' + empresaError.message 
      }, { status: 500 });
    }

    console.log(`✅ Empresa criada: ${empresaInserida.nome}`);

    // 2. Criar documentos profissionais
    const documentos = [
      {
        empresa_id: empresaInserida.id,
        nome_arquivo: 'PGR_ConstrutoraBR_2025.pdf',
        tipo_documento: 'manual',
        url_storage: 'empresas/construtora-br/pgr_2025.pdf',
        metadados: { 
          tamanho: '3.2MB', 
          paginas: 68,
          versao: '2025.1',
          data_emissao: '2025-01-15',
          tipo_original: 'PGR',
          responsavel: 'João Silva - Eng. Segurança',
          revisao: 'Anual',
          proxima_revisao: '2026-01-15'
        },
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        empresa_id: empresaInserida.id,
        nome_arquivo: 'PCMSO_ConstrutoraBR_2025.pdf',
        tipo_documento: 'procedimento',
        url_storage: 'empresas/construtora-br/pcms_2025.pdf',
        metadados: { 
          tamanho: '2.1MB', 
          paginas: 45,
          versao: '2025.1',
          data_emissao: '2025-01-10',
          tipo_original: 'PCMSO',
          responsavel: 'Dr. Maria Santos - Médica do Trabalho',
          revisao: 'Anual',
          proxima_revisao: '2026-01-10'
        },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        empresa_id: empresaInserida.id,
        nome_arquivo: 'LTCAT_ConstrutoraBR_2025.pdf',
        tipo_documento: 'politica',
        url_storage: 'empresas/construtora-br/ltcat_2025.pdf',
        metadados: { 
          tamanho: '4.5MB', 
          paginas: 89,
          versao: '2025.1',
          data_emissao: '2025-01-08',
          tipo_original: 'LTCAT',
          responsavel: 'Carlos Oliveira - Eng. Segurança',
          revisao: 'Bianual',
          proxima_revisao: '2027-01-08'
        },
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        empresa_id: empresaInserida.id,
        nome_arquivo: 'Manual_Seguranca_ConstrutoraBR_2025.pdf',
        tipo_documento: 'manual',
        url_storage: 'empresas/construtora-br/manual_seguranca_2025.pdf',
        metadados: { 
          tamanho: '5.8MB', 
          paginas: 124,
          versao: '2025.2',
          data_emissao: '2025-02-01',
          tipo_original: 'Manual de Segurança',
          responsavel: 'Equipe SST',
          revisao: 'Semestral',
          proxima_revisao: '2025-08-01'
        },
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
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

    // 3. Criar jobs de análise profissionais
    const jobs = [
      {
        empresa_id: empresaInserida.id,
        documento_id: documentosInseridos[0].id,
        norma_ids: ['NR-18', 'NR-35', 'NR-12', 'NR-10'], // Normas da construção civil
        status: 'completed',
        tipo_analise: 'completa',
        priority: 5,
        progresso: 100,
        metadata: {
          analista: 'Sistema SGN',
          versao_analise: '1.2.0',
          tempo_processamento: '2h 15min'
        },
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
      },
      {
        empresa_id: empresaInserida.id,
        documento_id: documentosInseridos[1].id,
        norma_ids: ['NR-7', 'NR-35', 'NR-15'], // Normas médicas e de altura
        status: 'completed',
        tipo_analise: 'completa',
        priority: 5,
        progresso: 100,
        metadata: {
          analista: 'Sistema SGN',
          versao_analise: '1.2.0',
          tempo_processamento: '1h 45min'
        },
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString()
      },
      {
        empresa_id: empresaInserida.id,
        documento_id: documentosInseridos[2].id,
        norma_ids: ['NR-15', 'NR-9', 'NR-6'], // Normas de insalubridade e EPI
        status: 'processing',
        tipo_analise: 'completa',
        priority: 3,
        progresso: 65,
        metadata: {
          analista: 'Sistema SGN',
          versao_analise: '1.2.0',
          tempo_estimado: '3h 30min'
        },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        empresa_id: empresaInserida.id,
        documento_id: documentosInseridos[3].id,
        norma_ids: ['NR-18', 'NR-35', 'NR-12', 'NR-10', 'NR-6'], // Múltiplas normas
        status: 'pending',
        tipo_analise: 'completa',
        priority: 2,
        progresso: 0,
        metadata: {
          analista: 'Sistema SGN',
          versao_analise: '1.2.0',
          tempo_estimado: '4h 15min'
        },
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
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

    // 4. Criar resultados de análise profissionais
    const resultados = [
      {
        empresa_id: empresaInserida.id,
        job_id: jobsInseridos[0].id,
        score_geral: 82,
        nivel_risco: 'baixo',
        status_geral: 'conforme',
        metadata: {
          normas_analisadas: ['NR-18', 'NR-35', 'NR-12', 'NR-10'],
          conformidade: {
            'NR-18': { score: 88, status: 'conforme', observacoes: 'Canteiro bem estruturado' },
            'NR-35': { score: 85, status: 'conforme', observacoes: 'Treinamentos em dia' },
            'NR-12': { score: 90, status: 'conforme', observacoes: 'Máquinas certificadas' },
            'NR-10': { score: 75, status: 'parcial_conforme', observacoes: 'Revisar instalações' }
          },
          documento: 'PGR_ConstrutoraBR_2025.pdf',
          analista: 'Sistema SGN v1.2.0',
          data_analise: new Date().toISOString()
        },
        created_at: jobsInseridos[0].completed_at
      },
      {
        empresa_id: empresaInserida.id,
        job_id: jobsInseridos[1].id,
        score_geral: 91,
        nivel_risco: 'baixo',
        status_geral: 'conforme',
        metadata: {
          normas_analisadas: ['NR-7', 'NR-35', 'NR-15'],
          conformidade: {
            'NR-7': { score: 95, status: 'conforme', observacoes: 'Exames atualizados' },
            'NR-35': { score: 88, status: 'conforme', observacoes: 'Certificações válidas' },
            'NR-15': { score: 90, status: 'conforme', observacoes: 'Limites respeitados' }
          },
          documento: 'PCMSO_ConstrutoraBR_2025.pdf',
          analista: 'Sistema SGN v1.2.0',
          data_analise: new Date().toISOString()
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

    // 5. Criar gaps de conformidade profissionais
    const gaps = [
      {
        analise_resultado_id: resultadosInseridos[0].id,
        norma_id: 65, // NR-10 - SEGURANÇA EM INSTALAÇÕES E SERVIÇOS EM ELETRICIDADE
        severidade: 'importante',
        resolvido: false,
        descricao: 'Instalações elétricas temporárias em canteiro precisam de revisão técnica',
        prazo_sugerido: '30_dias',
        created_at: resultadosInseridos[0].created_at
      },
      {
        analise_resultado_id: resultadosInseridos[0].id,
        norma_id: 61, // NR-6 - EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL - EPI
        severidade: 'menor',
        resolvido: false,
        descricao: 'Atualizar certificação de alguns EPIs que vencem em 60 dias',
        prazo_sugerido: '90_dias',
        created_at: resultadosInseridos[0].created_at
      },
      {
        analise_resultado_id: resultadosInseridos[1].id,
        norma_id: 62, // NR-7 - PROGRAMA DE CONTROLE MÉDICO DE SAÚDE OCUPACIONAL
        severidade: 'menor',
        resolvido: true,
        descricao: 'Renovação de exames médicos de 5 funcionários em andamento',
        prazo_sugerido: '30_dias',
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
      message: 'Empresa profissional Construtora BR criada com sucesso!',
      data: {
        empresa: {
          id: empresaInserida.id,
          nome: empresaInserida.nome,
          cnpj: empresaInserida.cnpj,
          setor: empresaInserida.setor,
          porte: empresaInserida.porte
        },
        documentos: documentosInseridos.length,
        jobs: jobsInseridos.length,
        resultados: resultadosInseridos.length,
        gaps: gapsInseridos.length,
        dashboard_url: `/empresas/${empresaInserida.id}/conformidade`,
        empresa_url: `/empresas/${empresaInserida.id}`
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
