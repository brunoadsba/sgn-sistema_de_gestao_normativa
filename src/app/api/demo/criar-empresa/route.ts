import { db } from "@/lib/db";
import { schema } from "@/lib/db";

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ success: false, error: 'Endpoint de demo desabilitado em produção' }, { status: 403 });
  }

  try {
    // 1. Criar empresa
    const empresaInserted = await db.insert(schema.empresas).values({
      nome: 'Construtora BR',
      cnpj: '98.765.432/0001-10',
      setor: 'Construção Civil',
      porte: 'grande',
      configuracoes: {
        segmento: 'Construção Civil',
        funcionarios: 150,
        cnae: '4110-7/00',
        endereco: { logradouro: 'Av. das Construções, 1234', bairro: 'Centro Empresarial', cidade: 'São Paulo', estado: 'SP', cep: '01234-567' },
        contato: { telefone: '(11) 3456-7890', email: 'compliance@construtorabr.com.br', responsavel_sst: 'João Silva - Engenheiro de Segurança' },
      },
      ativo: true,
    }).returning();

    const empresa = empresaInserted[0];

    // 2. Criar documentos
    const docsInserted = await db.insert(schema.documentosEmpresa).values([
      { empresaId: empresa.id, nomeArquivo: 'PGR_ConstrutoraBR_2025.pdf', tipoDocumento: 'manual', urlStorage: 'empresas/construtora-br/pgr_2025.pdf', metadados: { tamanho: '3.2MB', paginas: 68, versao: '2025.1' } },
      { empresaId: empresa.id, nomeArquivo: 'PCMSO_ConstrutoraBR_2025.pdf', tipoDocumento: 'procedimento', urlStorage: 'empresas/construtora-br/pcms_2025.pdf', metadados: { tamanho: '2.1MB', paginas: 45, versao: '2025.1' } },
      { empresaId: empresa.id, nomeArquivo: 'LTCAT_ConstrutoraBR_2025.pdf', tipoDocumento: 'politica', urlStorage: 'empresas/construtora-br/ltcat_2025.pdf', metadados: { tamanho: '4.5MB', paginas: 89, versao: '2025.1' } },
      { empresaId: empresa.id, nomeArquivo: 'Manual_Seguranca_ConstrutoraBR_2025.pdf', tipoDocumento: 'manual', urlStorage: 'empresas/construtora-br/manual_seguranca_2025.pdf', metadados: { tamanho: '5.8MB', paginas: 124, versao: '2025.2' } },
    ]).returning();

    // 3. Criar jobs
    const jobsInserted = await db.insert(schema.analiseJobs).values([
      { empresaId: empresa.id, documentoId: docsInserted[0].id, normaIds: ['NR-18', 'NR-35', 'NR-12', 'NR-10'], status: 'completed', tipoAnalise: 'completa', priority: 5, progresso: 100, completedAt: new Date().toISOString() },
      { empresaId: empresa.id, documentoId: docsInserted[1].id, normaIds: ['NR-7', 'NR-35', 'NR-15'], status: 'completed', tipoAnalise: 'completa', priority: 5, progresso: 100, completedAt: new Date().toISOString() },
      { empresaId: empresa.id, documentoId: docsInserted[2].id, normaIds: ['NR-15', 'NR-9', 'NR-6'], status: 'running', tipoAnalise: 'completa', priority: 3, progresso: 65 },
      { empresaId: empresa.id, documentoId: docsInserted[3].id, normaIds: ['NR-18', 'NR-35', 'NR-12', 'NR-10', 'NR-6'], status: 'pending', tipoAnalise: 'completa', priority: 2, progresso: 0 },
    ]).returning();

    // 4. Criar resultados
    const resultadosInserted = await db.insert(schema.analiseResultados).values([
      { empresaId: empresa.id, jobId: jobsInserted[0].id, scoreGeral: 82, nivelRisco: 'baixo', statusGeral: 'conforme', metadata: { normas_analisadas: ['NR-18', 'NR-35', 'NR-12', 'NR-10'] } },
      { empresaId: empresa.id, jobId: jobsInserted[1].id, scoreGeral: 91, nivelRisco: 'baixo', statusGeral: 'conforme', metadata: { normas_analisadas: ['NR-7', 'NR-35', 'NR-15'] } },
    ]).returning();

    // 5. Criar gaps
    const gapsInserted = await db.insert(schema.conformidadeGaps).values([
      { analiseResultadoId: resultadosInserted[0].id, normaId: 65, severidade: 'alta', resolvido: false, descricao: 'Instalações elétricas temporárias em canteiro precisam de revisão técnica', prazoSugerido: '30_dias' },
      { analiseResultadoId: resultadosInserted[0].id, normaId: 61, severidade: 'baixa', resolvido: false, descricao: 'Atualizar certificação de alguns EPIs que vencem em 60 dias', prazoSugerido: '90_dias' },
      { analiseResultadoId: resultadosInserted[1].id, normaId: 62, severidade: 'baixa', resolvido: true, descricao: 'Renovação de exames médicos de 5 funcionários em andamento', prazoSugerido: '30_dias' },
    ]).returning();

    return Response.json({
      success: true,
      message: 'Empresa profissional Construtora BR criada com sucesso!',
      data: {
        empresa: { id: empresa.id, nome: empresa.nome, cnpj: empresa.cnpj, setor: empresa.setor, porte: empresa.porte },
        documentos: docsInserted.length,
        jobs: jobsInserted.length,
        resultados: resultadosInserted.length,
        gaps: gapsInserted.length,
        dashboard_url: `/empresas/${empresa.id}/conformidade`,
        empresa_url: `/empresas/${empresa.id}`,
      },
    });

  } catch (error) {
    console.error('Erro geral:', error);
    return Response.json({ success: false, error: 'Erro interno: ' + (error as Error).message }, { status: 500 });
  }
}
