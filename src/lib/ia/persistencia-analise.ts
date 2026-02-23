import { and, asc, desc, eq, inArray, like, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia';
import { log } from '@/lib/logger';
import { extrairNormaId, normalizarGap, toStringArray, toStringValue } from '@/lib/ia/analise-mappers';

export type AnaliseListagem = {
  analises: AnaliseConformidadeResponse[];
  historico: {
    id: string;
    nomeDocumento: string;
    tipoDocumento: string;
    score: number;
    nivelRisco: AnaliseConformidadeResponse['nivelRisco'];
    timestamp: string;
    tempoProcessamento: number;
    modeloUsado: string;
  }[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
    temProxima: boolean;
    temAnterior: boolean;
  };
};

export type PeriodoHistorico = 'today' | '7d' | '30d';
export type OrdenacaoHistorico = 'data_desc' | 'data_asc' | 'score_desc' | 'score_asc';

export async function iniciarJobAnalise(
  entrada: { nomeArquivo: string; tipoDocumento: string; normasAplicaveis: string[] },
  initialStatus: string = 'extracting',
  sessionId?: string
): Promise<{ documentoId: string; jobId: string }> {
  const { id: documentoId } = await db
    .insert(schema.documentos)
    .values({
      nomeArquivo: entrada.nomeArquivo,
      tipoDocumento: entrada.tipoDocumento,
      metadados: { origem: 'api-ia-analisar-conformidade' },
    })
    .returning({ id: schema.documentos.id })
    .get();

  const { id: jobId } = await db
    .insert(schema.analiseJobs)
    .values({
      documentoId,
      normaIds: entrada.normasAplicaveis,
      status: initialStatus,
      progresso: 0,
      tipoAnalise: 'completa',
      sessionId: sessionId || null,
      startedAt: new Date().toISOString(),
    })
    .returning({ id: schema.analiseJobs.id })
    .get();

  return { documentoId, jobId };
}

export async function atualizarProgressoJob(
  jobId: string,
  status: string,
  progresso: number,
  erroDetalhes?: string
): Promise<void> {
  await db
    .update(schema.analiseJobs)
    .set({
      status,
      progresso,
      erroDetalhes: erroDetalhes || null,
    })
    .where(eq(schema.analiseJobs.id, jobId));
}

export async function finalizarJobAnalise(
  jobId: string,
  documentoId: string,
  entrada: AnaliseConformidadeRequest,
  resultado: AnaliseConformidadeResponse
): Promise<void> {
  await db.transaction(async (tx) => {
    // Atualizar conteúdo extraído se disponível
    if (entrada.documento) {
      await tx
        .update(schema.documentos)
        .set({ conteudoExtraido: entrada.documento })
        .where(eq(schema.documentos.id, documentoId));
    }

    // Criar Resultado
    const resultadoInserido = await tx
      .insert(schema.analiseResultados)
      .values({
        jobId,
        documentoId,
        scoreGeral: Math.round(resultado.score),
        nivelRisco: resultado.nivelRisco,
        statusGeral: resultado.score >= 80 ? 'conforme' : resultado.score >= 60 ? 'parcial_conforme' : 'nao_conforme',
        metadata: {
          resumo: resultado.resumo,
          nomeArquivo: entrada.tipoDocumento, // fallback
          tipoDocumento: entrada.tipoDocumento,
          estrategiaProcessamento: entrada.estrategiaProcessamento ?? 'completo',
          chunkMetadados: entrada.chunkMetadados ?? [],
          pontosPositivos: resultado.pontosPositivos,
          pontosAtencao: resultado.pontosAtencao,
          proximosPassos: resultado.proximosPassos,
          modeloUsado: resultado.modeloUsado,
          tempoProcessamento: resultado.tempoProcessamento,
          timestamp: resultado.timestamp,
          metadadosProcessamento: resultado.metadadosProcessamento ?? null,
          evidenciasUtilizadas: resultado.gaps.flatMap((gap) => gap.evidencias ?? []),
          contextoBaseConhecimento: entrada.contextoBaseConhecimento ?? null,
        },
      })
      .returning({ id: schema.analiseResultados.id })
      .get();

    const analiseResultadoId = resultadoInserido.id;

    if (resultado.gaps.length > 0) {
      await tx.insert(schema.conformidadeGaps).values(
        resultado.gaps.map((gap) => ({
          analiseResultadoId,
          normaId: extrairNormaId(gap.normasRelacionadas),
          severidade: gap.severidade,
          categoria: gap.categoria,
          descricao: gap.descricao,
          recomendacao: gap.recomendacao,
          prazoSugerido: gap.prazo,
          impacto: gap.impacto,
          citacaoDocumento: gap.citacaoDocumento,
          paginaDocumento: gap.paginaDocumento,
          linhaDocumento: gap.linhaDocumento,
        }))
      );
    }

    // Finalizar Job
    await tx
      .update(schema.analiseJobs)
      .set({
        status: 'completed',
        progresso: 100,
        completedAt: new Date().toISOString(),
      })
      .where(eq(schema.analiseJobs.id, jobId));
  });

  log.info({ jobId, documentoId }, 'Job de análise finalizado com sucesso');
}

export async function persistirAnaliseConformidade(
  entrada: AnaliseConformidadeRequest,
  resultado: AnaliseConformidadeResponse
): Promise<void> {
  const { documentoId, jobId } = await iniciarJobAnalise({
    nomeArquivo: `analise-ia-${Date.now()}.txt`,
    tipoDocumento: entrada.tipoDocumento,
    normasAplicaveis: entrada.normasAplicaveis ?? [],
  });

  await finalizarJobAnalise(jobId, documentoId, entrada, resultado);
}

export async function listarAnalisesConformidade(
  pagina: number,
  limite: number,
  periodo: PeriodoHistorico = '30d',
  ordenacao: OrdenacaoHistorico = 'data_desc',
  buscaDocumento = ''
): Promise<AnaliseListagem> {
  const offset = (pagina - 1) * limite;
  const whereClause = buildWhereClause(periodo, buscaDocumento);
  const orderByClause = buildOrderByClause(ordenacao)

  const [countResult, resultados] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.analiseResultados)
      .leftJoin(schema.documentos, eq(schema.analiseResultados.documentoId, schema.documentos.id))
      .where(whereClause),
    db
      .select({
        id: schema.analiseResultados.id,
        scoreGeral: schema.analiseResultados.scoreGeral,
        nivelRisco: schema.analiseResultados.nivelRisco,
        metadata: schema.analiseResultados.metadata,
        createdAt: schema.analiseResultados.createdAt,
        nomeArquivo: schema.documentos.nomeArquivo,
        tipoDocumento: schema.documentos.tipoDocumento,
      })
      .from(schema.analiseResultados)
      .leftJoin(schema.documentos, eq(schema.analiseResultados.documentoId, schema.documentos.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limite)
      .offset(offset),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const resultadoIds = resultados.map((item) => item.id)
  const gapsRaw =
    resultadoIds.length > 0
      ? await db
        .select()
        .from(schema.conformidadeGaps)
        .where(inArray(schema.conformidadeGaps.analiseResultadoId, resultadoIds))
      : []

  const gapsPorResultado = new Map<string, typeof gapsRaw>()
  for (const gap of gapsRaw) {
    const lista = gapsPorResultado.get(gap.analiseResultadoId) ?? []
    lista.push(gap)
    gapsPorResultado.set(gap.analiseResultadoId, lista)
  }

  const analises = resultados.map((item) => {
    const metadata = (item.metadata ?? {}) as Record<string, unknown>;

    return {
      score: item.scoreGeral ?? 0,
      nivelRisco: (item.nivelRisco as AnaliseConformidadeResponse['nivelRisco']) ?? 'medio',
      gaps: (gapsPorResultado.get(item.id) ?? []).map(normalizarGap),
      resumo: toStringValue(metadata.resumo),
      pontosPositivos: toStringArray(metadata.pontosPositivos),
      pontosAtencao: toStringArray(metadata.pontosAtencao),
      proximosPassos: toStringArray(metadata.proximosPassos),
      timestamp: toStringValue(metadata.timestamp, item.createdAt),
      modeloUsado: toStringValue(metadata.modeloUsado, 'desconhecido'),
      tempoProcessamento:
        typeof metadata.tempoProcessamento === 'number' ? metadata.tempoProcessamento : 0,
    } satisfies AnaliseConformidadeResponse;
  });

  const historico = resultados.map((item) => {
    const metadata = (item.metadata ?? {}) as Record<string, unknown>;
    const nomeDocumento = toStringValue(
      item.nomeArquivo ?? toStringValue(metadata.nomeArquivo),
      `analise-${item.id.slice(0, 8)}.txt`
    );
    const tipoDocumento = item.tipoDocumento ?? toStringValue(metadata.tipoDocumento, 'OUTRO');

    return {
      id: item.id,
      nomeDocumento,
      tipoDocumento,
      score: item.scoreGeral ?? 0,
      nivelRisco: (item.nivelRisco as AnaliseConformidadeResponse['nivelRisco']) ?? 'medio',
      timestamp: toStringValue(metadata.timestamp, item.createdAt),
      tempoProcessamento:
        typeof metadata.tempoProcessamento === 'number' ? metadata.tempoProcessamento : 0,
      modeloUsado: toStringValue(metadata.modeloUsado, 'desconhecido'),
    };
  });

  return {
    analises,
    historico,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: total === 0 ? 0 : Math.ceil(total / limite),
      temProxima: pagina * limite < total,
      temAnterior: pagina > 1,
    },
  };
}

export async function buscarAnalisePorId(id: string): Promise<AnaliseConformidadeResponse | null> {
  const item = await db
    .select({
      id: schema.analiseResultados.id,
      jobId: schema.analiseResultados.jobId,
      scoreGeral: schema.analiseResultados.scoreGeral,
      nivelRisco: schema.analiseResultados.nivelRisco,
      metadata: schema.analiseResultados.metadata,
      createdAt: schema.analiseResultados.createdAt,
      nomeArquivo: schema.documentos.nomeArquivo,
      tipoDocumento: schema.documentos.tipoDocumento,
    })
    .from(schema.analiseResultados)
    .leftJoin(schema.documentos, eq(schema.analiseResultados.documentoId, schema.documentos.id))
    .where(eq(schema.analiseResultados.id, id))
    .get();

  if (!item) return null;

  const gaps = await db
    .select()
    .from(schema.conformidadeGaps)
    .where(eq(schema.conformidadeGaps.analiseResultadoId, id));

  const metadata = (item.metadata ?? {}) as Record<string, unknown>;

  return {
    score: item.scoreGeral ?? 0,
    nivelRisco: (item.nivelRisco as AnaliseConformidadeResponse['nivelRisco']) ?? 'medio',
    gaps: gaps.map(normalizarGap),
    resumo: toStringValue(metadata.resumo),
    pontosPositivos: toStringArray(metadata.pontosPositivos),
    pontosAtencao: toStringArray(metadata.pontosAtencao),
    proximosPassos: toStringArray(metadata.proximosPassos),
    timestamp: toStringValue(metadata.timestamp, item.createdAt),
    modeloUsado: toStringValue(metadata.modeloUsado, 'desconhecido'),
    tempoProcessamento: typeof metadata.tempoProcessamento === 'number' ? metadata.tempoProcessamento : 0,
    jobId: item.jobId ?? undefined,
    nomeArquivo: item.nomeArquivo ?? undefined,
  } as AnaliseConformidadeResponse;
}

function buildWhereClause(periodo: PeriodoHistorico, buscaDocumento: string) {
  const conditions = [buildPeriodoWhere(periodo)];
  const busca = buscaDocumento.trim().toLowerCase();

  if (busca.length > 0) {
    conditions.push(sql`lower(coalesce(${schema.documentos.nomeArquivo}, '')) like ${`%${busca}%`}`);
  }

  return and(...conditions);
}

function buildPeriodoWhere(periodo: PeriodoHistorico) {
  switch (periodo) {
    case 'today':
      return sql`${schema.analiseResultados.createdAt} >= datetime('now', 'start of day')`;
    case '7d':
      return sql`${schema.analiseResultados.createdAt} >= datetime('now', '-7 day')`;
    case '30d':
    default:
      return sql`${schema.analiseResultados.createdAt} >= datetime('now', '-30 day')`;
  }
}

function buildOrderByClause(ordenacao: OrdenacaoHistorico) {
  switch (ordenacao) {
    case 'data_asc':
      return asc(schema.analiseResultados.createdAt)
    case 'score_desc':
      return desc(schema.analiseResultados.scoreGeral)
    case 'score_asc':
      return asc(schema.analiseResultados.scoreGeral)
    case 'data_desc':
    default:
      return desc(schema.analiseResultados.createdAt)
  }
}

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
}> {
  const [analisesCount, jobsCount, documentosCount, gapsCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(schema.analiseResultados),
    db.select({ count: sql<number>`count(*)` }).from(schema.analiseJobs),
    db.select({ count: sql<number>`count(*)` }).from(schema.documentos).where(like(schema.documentos.nomeArquivo, 'analise-ia-%')),
    db.select({ count: sql<number>`count(*)` }).from(schema.conformidadeGaps),
  ])

  await db.transaction(async (tx) => {
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
  }
}
