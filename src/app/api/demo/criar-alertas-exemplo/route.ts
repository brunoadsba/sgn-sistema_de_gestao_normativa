import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Criando alertas de exemplo...');

    // Buscar IDs das empresas existentes
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id, nome')
      .limit(3);

    if (empresasError) {
      console.error('❌ Erro ao buscar empresas:', empresasError);
      return NextResponse.json(
        { error: 'Erro ao buscar empresas', details: empresasError.message },
        { status: 500 }
      );
    }

    if (!empresas || empresas.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma empresa encontrada' },
        { status: 404 }
      );
    }

    console.log(`📊 Empresas encontradas: ${empresas.length}`);

    // Dados de exemplo para alertas
    const alertasExemplo = [
      // Construtora BR
      {
        empresa_id: empresas[0].id,
        tipo: 'risco',
        severidade: 'alta',
        titulo: 'NR-35: Trabalho em Altura - Treinamento Vencido',
        descricao: 'Funcionários da equipe de construção não possuem treinamento atualizado em trabalho em altura. Prazo venceu há 15 dias.',
        acao_requerida: 'Agendar treinamento de reciclagem NR-35 para toda equipe',
        prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        status: 'ativo',
        metadata: {
          norma: 'NR-35',
          categoria: 'treinamento',
          impacto: 'alto'
        }
      },
      {
        empresa_id: empresas[0].id,
        tipo: 'oportunidade',
        severidade: 'media',
        titulo: 'NR-18: Implementar Sistema de Gestão de Segurança',
        descricao: 'Oportunidade de implementar sistema digital para gestão de segurança conforme NR-18, melhorando controle e rastreabilidade.',
        acao_requerida: 'Avaliar e implementar sistema de gestão digital de segurança',
        prazo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        status: 'ativo',
        metadata: {
          norma: 'NR-18',
          categoria: 'sistema',
          beneficio: 'controle_aprimorado'
        }
      },
      // Tech BR
      {
        empresa_id: empresas[1]?.id || empresas[0].id,
        tipo: 'prazo',
        severidade: 'critica',
        titulo: 'NR-17: Análise Ergonômica Pendente',
        descricao: 'Análise ergonômica dos postos de trabalho deve ser realizada até o final do mês. Prazo crítico!',
        acao_requerida: 'Contratar especialista em ergonomia para análise completa',
        prazo: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
        status: 'ativo',
        metadata: {
          norma: 'NR-17',
          categoria: 'analise',
          urgencia: 'critica'
        }
      },
      {
        empresa_id: empresas[1]?.id || empresas[0].id,
        tipo: 'conformidade',
        severidade: 'baixa',
        titulo: 'NR-10: Atualização de Documentação',
        descricao: 'Documentação de instalações elétricas precisa ser atualizada com as últimas modificações realizadas.',
        acao_requerida: 'Atualizar documentação técnica das instalações elétricas',
        prazo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dias
        status: 'ativo',
        metadata: {
          norma: 'NR-10',
          categoria: 'documentacao',
          prioridade: 'baixa'
        }
      },
      // Indústrias BR
      {
        empresa_id: empresas[2]?.id || empresas[0].id,
        tipo: 'risco',
        severidade: 'alta',
        titulo: 'NR-12: Máquinas sem Proteção Adequada',
        descricao: 'Identificadas máquinas industriais sem dispositivos de proteção conforme NR-12. Risco de acidentes graves.',
        acao_requerida: 'Instalar dispositivos de proteção em todas as máquinas identificadas',
        prazo: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias
        status: 'ativo',
        metadata: {
          norma: 'NR-12',
          categoria: 'protecao_maquinas',
          risco: 'acidente_grave'
        }
      },
      {
        empresa_id: empresas[2]?.id || empresas[0].id,
        tipo: 'oportunidade',
        severidade: 'media',
        titulo: 'NR-15: Implementar Monitoramento de Ruído',
        descricao: 'Oportunidade de implementar sistema de monitoramento contínuo de ruído para melhor controle da exposição dos trabalhadores.',
        acao_requerida: 'Adquirir e instalar sistema de monitoramento de ruído',
        prazo: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 dias
        status: 'ativo',
        metadata: {
          norma: 'NR-15',
          categoria: 'monitoramento',
          beneficio: 'controle_exposicao'
        }
      }
    ];

    // Inserir alertas no banco
    const { data: alertasCriados, error: insertError } = await supabase
      .from('alertas_conformidade')
      .insert(alertasExemplo)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir alertas:', insertError);
      return NextResponse.json(
        { error: 'Erro ao criar alertas', details: insertError.message },
        { status: 500 }
      );
    }

    console.log(`✅ ${alertasCriados?.length || 0} alertas criados com sucesso!`);

    return NextResponse.json({
      success: true,
      message: `${alertasCriados?.length || 0} alertas de exemplo criados com sucesso`,
      alertas: alertasCriados,
      empresas: empresas.map(e => ({ id: e.id, nome: e.nome }))
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}