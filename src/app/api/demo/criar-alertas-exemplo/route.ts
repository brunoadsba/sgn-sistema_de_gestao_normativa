import { db } from "@/lib/db";
import { schema } from "@/lib/db";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Endpoint de demo desabilitado em produção' }, { status: 403 });
  }

  try {
    // Buscar empresas existentes
    const empresas = await db.select({ id: schema.empresas.id, nome: schema.empresas.nome })
      .from(schema.empresas).limit(3);

    if (empresas.length === 0) {
      return NextResponse.json({ error: 'Nenhuma empresa encontrada' }, { status: 404 });
    }

    const alertasExemplo = [
      {
        empresaId: empresas[0].id,
        tipo: 'risco',
        severidade: 'alta',
        titulo: 'NR-35: Trabalho em Altura - Treinamento Vencido',
        descricao: 'Funcionários da equipe de construção não possuem treinamento atualizado em trabalho em altura.',
        acaoRequerida: 'Agendar treinamento de reciclagem NR-35 para toda equipe',
        prazo: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: 'ativo',
        metadata: { norma: 'NR-35', categoria: 'treinamento' },
      },
      {
        empresaId: empresas[0].id,
        tipo: 'oportunidade',
        severidade: 'media',
        titulo: 'NR-18: Implementar Sistema de Gestão de Segurança',
        descricao: 'Oportunidade de implementar sistema digital para gestão de segurança conforme NR-18.',
        acaoRequerida: 'Avaliar e implementar sistema de gestão digital de segurança',
        prazo: new Date(Date.now() + 30 * 86400000).toISOString(),
        status: 'ativo',
        metadata: { norma: 'NR-18', categoria: 'sistema' },
      },
      {
        empresaId: empresas[1]?.id || empresas[0].id,
        tipo: 'prazo',
        severidade: 'critica',
        titulo: 'NR-17: Análise Ergonômica Pendente',
        descricao: 'Análise ergonômica dos postos de trabalho deve ser realizada até o final do mês.',
        acaoRequerida: 'Contratar especialista em ergonomia para análise completa',
        prazo: new Date(Date.now() + 3 * 86400000).toISOString(),
        status: 'ativo',
        metadata: { norma: 'NR-17', categoria: 'analise' },
      },
      {
        empresaId: empresas[1]?.id || empresas[0].id,
        tipo: 'conformidade',
        severidade: 'baixa',
        titulo: 'NR-10: Atualização de Documentação',
        descricao: 'Documentação de instalações elétricas precisa ser atualizada.',
        acaoRequerida: 'Atualizar documentação técnica das instalações elétricas',
        prazo: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: 'ativo',
        metadata: { norma: 'NR-10', categoria: 'documentacao' },
      },
      {
        empresaId: empresas[2]?.id || empresas[0].id,
        tipo: 'risco',
        severidade: 'alta',
        titulo: 'NR-12: Máquinas sem Proteção Adequada',
        descricao: 'Identificadas máquinas industriais sem dispositivos de proteção conforme NR-12.',
        acaoRequerida: 'Instalar dispositivos de proteção em todas as máquinas identificadas',
        prazo: new Date(Date.now() + 5 * 86400000).toISOString(),
        status: 'ativo',
        metadata: { norma: 'NR-12', categoria: 'protecao_maquinas' },
      },
      {
        empresaId: empresas[2]?.id || empresas[0].id,
        tipo: 'oportunidade',
        severidade: 'media',
        titulo: 'NR-15: Implementar Monitoramento de Ruído',
        descricao: 'Oportunidade de implementar sistema de monitoramento contínuo de ruído.',
        acaoRequerida: 'Adquirir e instalar sistema de monitoramento de ruído',
        prazo: new Date(Date.now() + 21 * 86400000).toISOString(),
        status: 'ativo',
        metadata: { norma: 'NR-15', categoria: 'monitoramento' },
      },
    ];

    const alertasCriados = await db.insert(schema.alertasConformidade).values(alertasExemplo).returning();

    return NextResponse.json({
      success: true,
      message: `${alertasCriados.length} alertas de exemplo criados com sucesso`,
      alertas: alertasCriados,
      empresas: empresas.map(e => ({ id: e.id, nome: e.nome })),
    });

  } catch (error) {
    console.error('Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
