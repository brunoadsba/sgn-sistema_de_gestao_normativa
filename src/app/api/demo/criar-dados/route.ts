import { db } from "@/lib/db";
import { schema } from "@/lib/db";

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ success: false, error: 'Endpoint de demo desabilitado em produção' }, { status: 403 });
  }

  try {
    // 1. Buscar empresa existente
    const empresas = await db.select({ id: schema.empresas.id, nome: schema.empresas.nome })
      .from(schema.empresas).limit(1);

    if (empresas.length === 0) {
      return Response.json({ success: false, error: 'Nenhuma empresa encontrada' }, { status: 404 });
    }
    const empresa = empresas[0];

    // 2. Criar documentos
    const docsInserted = await db.insert(schema.documentosEmpresa).values([
      { empresaId: empresa.id, nomeArquivo: 'PGR_ConstrutoraBR_2025.pdf', tipoDocumento: 'manual', urlStorage: 'demo/pgr_construtora_2025.pdf', metadados: { tamanho: '2.8MB', paginas: 52, versao: '2025.1', tipo_original: 'PGR' } },
      { empresaId: empresa.id, nomeArquivo: 'PCMSO_ConstrutoraBR_2025.pdf', tipoDocumento: 'procedimento', urlStorage: 'demo/pcms_construtora_2025.pdf', metadados: { tamanho: '1.9MB', paginas: 38, versao: '2025.1', tipo_original: 'PCMSO' } },
      { empresaId: empresa.id, nomeArquivo: 'LTCAT_ConstrutoraBR_2025.pdf', tipoDocumento: 'politica', urlStorage: 'demo/ltcat_construtora_2025.pdf', metadados: { tamanho: '3.1MB', paginas: 61, versao: '2025.1', tipo_original: 'LTCAT' } },
    ]).returning();

    // 3. Criar jobs
    const jobsInserted = await db.insert(schema.analiseJobs).values([
      { empresaId: empresa.id, documentoId: docsInserted[0].id, normaIds: ['NR-18', 'NR-35', 'NR-12'], status: 'completed', tipoAnalise: 'completa', priority: 5, progresso: 100, completedAt: new Date().toISOString() },
      { empresaId: empresa.id, documentoId: docsInserted[1].id, normaIds: ['NR-7', 'NR-35'], status: 'completed', tipoAnalise: 'completa', priority: 5, progresso: 100, completedAt: new Date().toISOString() },
      { empresaId: empresa.id, documentoId: docsInserted[2].id, normaIds: ['NR-15', 'NR-9'], status: 'running', tipoAnalise: 'completa', priority: 3, progresso: 75 },
    ]).returning();

    // 4. Criar resultados
    const resultadosInserted = await db.insert(schema.analiseResultados).values([
      { empresaId: empresa.id, jobId: jobsInserted[0].id, scoreGeral: 78, nivelRisco: 'medio', statusGeral: 'parcial_conforme', metadata: { normas_analisadas: ['NR-18', 'NR-35', 'NR-12'] } },
      { empresaId: empresa.id, jobId: jobsInserted[1].id, scoreGeral: 88, nivelRisco: 'baixo', statusGeral: 'conforme', metadata: { normas_analisadas: ['NR-7', 'NR-35'] } },
    ]).returning();

    // 5. Criar gaps
    const gapsInserted = await db.insert(schema.conformidadeGaps).values([
      { analiseResultadoId: resultadosInserted[0].id, normaId: 65, severidade: 'critica', resolvido: false, descricao: 'Treinamento de trabalho em altura vencido para 12 funcionários', prazoSugerido: '30_dias' },
      { analiseResultadoId: resultadosInserted[0].id, normaId: 61, severidade: 'alta', resolvido: false, descricao: 'Sinalização de segurança incompleta em 3 canteiros', prazoSugerido: '90_dias' },
      { analiseResultadoId: resultadosInserted[1].id, normaId: 62, severidade: 'baixa', resolvido: true, descricao: 'Atualização de exames médicos em andamento', prazoSugerido: '30_dias' },
    ]).returning();

    return Response.json({
      success: true,
      message: 'Dados de exemplo criados com sucesso!',
      data: {
        empresa: empresa.nome,
        documentos: docsInserted.length,
        jobs: jobsInserted.length,
        resultados: resultadosInserted.length,
        gaps: gapsInserted.length,
        dashboard_url: `/empresas/${empresa.id}/conformidade`,
      },
    });

  } catch (error) {
    console.error('Erro geral:', error);
    return Response.json({ success: false, error: 'Erro interno: ' + (error as Error).message }, { status: 500 });
  }
}
