#!/usr/bin/env node

/**
 * Script para criar dados de exemplo realistas para demonstração do SGN
 * Simula uma empresa com dados de conformidade realistas
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (usar as mesmas variáveis do frontend)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kqdilsmgjlgmqcoubpel.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZGlsc21namxnbXFjb3ViYmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUxMjQ4NzMsImV4cCI6MjA0MDcwMDg3M30.8QZqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';

const supabase = createClient(supabaseUrl, supabaseKey);

async function criarDadosExemplo() {
  console.log('🚀 Criando dados de exemplo para demonstração...');

  try {
    // 1. Buscar uma empresa existente
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id, nome')
      .limit(1);

    if (empresasError || !empresas || empresas.length === 0) {
      console.error('❌ Nenhuma empresa encontrada');
      return;
    }

    const empresa = empresas[0];
    console.log(`📊 Criando dados para empresa: ${empresa.nome}`);

    // 2. Criar documentos de exemplo
    const documentos = [
      {
        empresa_id: empresa.id,
        nome_arquivo: 'PPRA_2025.pdf',
        tipo_documento: 'PPRA',
        metadados: { tamanho: '2.5MB', paginas: 45 },
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias atrás
      },
      {
        empresa_id: empresa.id,
        nome_arquivo: 'PCMSO_2025.pdf',
        tipo_documento: 'PCMSO',
        metadados: { tamanho: '1.8MB', paginas: 32 },
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 dias atrás
      },
      {
        empresa_id: empresa.id,
        nome_arquivo: 'LTCAT_2025.pdf',
        tipo_documento: 'LTCAT',
        metadados: { tamanho: '3.2MB', paginas: 58 },
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias atrás
      }
    ];

    const { data: documentosInseridos, error: docsError } = await supabase
      .from('documentos_empresa')
      .insert(documentos)
      .select();

    if (docsError) {
      console.error('❌ Erro ao inserir documentos:', docsError);
      return;
    }

    console.log(`✅ ${documentosInseridos.length} documentos criados`);

    // 3. Criar jobs de análise
    const jobs = [
      {
        empresa_id: empresa.id,
        documento_id: documentosInseridos[0].id,
        status: 'completed',
        tipo_analise: 'completa',
        prioridade: 5,
        progresso: 100,
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString() // 2h depois
      },
      {
        empresa_id: empresa.id,
        documento_id: documentosInseridos[1].id,
        status: 'completed',
        tipo_analise: 'completa',
        prioridade: 5,
        progresso: 100,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000).toISOString() // 1.5h depois
      },
      {
        empresa_id: empresa.id,
        documento_id: documentosInseridos[2].id,
        status: 'running',
        tipo_analise: 'completa',
        prioridade: 3,
        progresso: 65,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { data: jobsInseridos, error: jobsError } = await supabase
      .from('analise_jobs')
      .insert(jobs)
      .select();

    if (jobsError) {
      console.error('❌ Erro ao inserir jobs:', jobsError);
      return;
    }

    console.log(`✅ ${jobsInseridos.length} jobs criados`);

    // 4. Criar resultados de análise
    const resultados = [
      {
        empresa_id: empresa.id,
        analise_job_id: jobsInseridos[0].id,
        score_geral: 75,
        nivel_risco: 'medio',
        status_geral: 'parcial_conforme',
        metadata: {
          normas_analisadas: ['NR-9', 'NR-15', 'NR-18'],
          conformidade: {
            'NR-9': { score: 80, status: 'conforme' },
            'NR-15': { score: 70, status: 'parcial_conforme' },
            'NR-18': { score: 75, status: 'parcial_conforme' }
          }
        },
        created_at: jobsInseridos[0].completed_at
      },
      {
        empresa_id: empresa.id,
        analise_job_id: jobsInseridos[1].id,
        score_geral: 85,
        nivel_risco: 'baixo',
        status_geral: 'conforme',
        metadata: {
          normas_analisadas: ['NR-7', 'NR-35'],
          conformidade: {
            'NR-7': { score: 90, status: 'conforme' },
            'NR-35': { score: 80, status: 'conforme' }
          }
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
      return;
    }

    console.log(`✅ ${resultadosInseridos.length} resultados criados`);

    // 5. Criar gaps de conformidade
    const gaps = [
      {
        analise_resultado_id: resultadosInseridos[0].id,
        norma_id: null, // Será preenchido depois
        severidade: 'alta',
        resolvido: false,
        categoria: 'NR-15',
        descricao: 'Limites de exposição não atualizados conforme nova portaria',
        prazo_sugerido: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        created_at: resultadosInseridos[0].created_at
      },
      {
        analise_resultado_id: resultadosInseridos[0].id,
        norma_id: null,
        severidade: 'media',
        resolvido: false,
        categoria: 'NR-18',
        descricao: 'Sinalização de segurança incompleta em canteiro',
        prazo_sugerido: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias
        created_at: resultadosInseridos[0].created_at
      },
      {
        analise_resultado_id: resultadosInseridos[1].id,
        norma_id: null,
        severidade: 'baixa',
        resolvido: true,
        categoria: 'NR-7',
        descricao: 'Treinamento de primeiros socorros vencido',
        prazo_sugerido: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
        created_at: resultadosInseridos[1].created_at
      }
    ];

    const { data: gapsInseridos, error: gapsError } = await supabase
      .from('conformidade_gaps')
      .insert(gaps)
      .select();

    if (gapsError) {
      console.error('❌ Erro ao inserir gaps:', gapsError);
      return;
    }

    console.log(`✅ ${gapsInseridos.length} gaps criados`);

    console.log('\n🎉 Dados de exemplo criados com sucesso!');
    console.log(`📊 Empresa: ${empresa.nome}`);
    console.log(`📄 Documentos: ${documentosInseridos.length}`);
    console.log(`⚙️  Jobs: ${jobsInseridos.length}`);
    console.log(`📈 Resultados: ${resultadosInseridos.length}`);
    console.log(`⚠️  Gaps: ${gapsInseridos.length}`);
    console.log('\n🌐 Acesse o dashboard em: http://localhost:3001/empresas/' + empresa.id + '/conformidade');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  criarDadosExemplo();
}

module.exports = { criarDadosExemplo };
