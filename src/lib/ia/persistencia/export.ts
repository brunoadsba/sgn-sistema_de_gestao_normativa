import { like, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { listarAnalisesConformidade, type PeriodoHistorico, type OrdenacaoHistorico } from './consultas';

function escapeCsvCell(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

function formatarBrasilia(isoDate: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(isoDate));
}

export async function exportarHistoricoCsv(
  periodo: PeriodoHistorico = '30d',
  ordenacao: OrdenacaoHistorico = 'data_desc',
  buscaDocumento = ''
): Promise<string> {
  const data = await listarAnalisesConformidade(1, 1000, periodo, ordenacao, buscaDocumento);

  const header = [
    'id',
    'nomeDocumento',
    'tipoDocumento',
    'score',
    'confidenceScore',
    'reportStatus',
    'nivelRisco',
    'tempoProcessamentoMs',
    'modeloUsado',
    'dataHoraBrasilia',
  ];

  const rows = data.historico.map((item) => [
    escapeCsvCell(item.id),
    escapeCsvCell(item.nomeDocumento),
    escapeCsvCell(item.tipoDocumento),
    String(item.score),
    String(item.confidenceScore),
    escapeCsvCell(item.reportStatus),
    escapeCsvCell(item.nivelRisco),
    String(item.tempoProcessamento),
    escapeCsvCell(item.modeloUsado),
    escapeCsvCell(formatarBrasilia(item.timestamp)),
  ]);

  return [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export async function limparHistoricoAnalises(): Promise<{
  analisesRemovidas: number
  jobsRemovidos: number
  documentosRemovidos: number
  gapsRemovidos: number
  revisoesRemovidas: number
}> {
  const [analisesCount, jobsCount, documentosCount, gapsCount, revisoesCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(schema.analiseResultados),
    db.select({ count: sql<number>`count(*)` }).from(schema.analiseJobs),
    db.select({ count: sql<number>`count(*)` }).from(schema.documentos).where(like(schema.documentos.nomeArquivo, 'analise-ia-%')),
    db.select({ count: sql<number>`count(*)` }).from(schema.conformidadeGaps),
    db.select({ count: sql<number>`count(*)` }).from(schema.analiseRevisoes),
  ])

  await db.transaction(async (tx) => {
    await tx.delete(schema.analiseRevisoes)
    await tx.delete(schema.conformidadeGaps)
    await tx.delete(schema.analiseResultados)
    await tx.delete(schema.analiseJobs)
    await tx.delete(schema.documentos).where(like(schema.documentos.nomeArquivo, 'analise-ia-%'))
  })

  return {
    analisesRemovidas: Number(analisesCount[0]?.count ?? 0),
    jobsRemovidos: Number(jobsCount[0]?.count ?? 0),
    documentosRemovidos: Number(documentosCount[0]?.count ?? 0),
    gapsRemovidos: Number(gapsCount[0]?.count ?? 0),
    revisoesRemovidas: Number(revisoesCount[0]?.count ?? 0),
  }
}
