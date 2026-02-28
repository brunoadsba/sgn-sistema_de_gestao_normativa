import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import {
  AnaliseConformidadeRequest,
  AnaliseConformidadeResponse,
  ConfidenceSignals,
  RevisaoHumana,
} from '@/types/ia';
import { normalizarGap, toStringArray, toStringValue } from '@/lib/ia/analise-mappers';
import { getMetadata, toNumberValue, toReportStatus } from './jobs';
import { iniciarJobAnalise, finalizarJobAnalise } from './jobs';

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
    reportStatus: import('@/types/ia').ReportStatus;
    confidenceScore: number;
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

function parseRevisaoHumana(value: unknown): RevisaoHumana | null {
  if (!value || typeof value !== 'object') return null;
  const revisao = value as Partial<RevisaoHumana>;
  if (
    (revisao.decisao !== 'aprovado' && revisao.decisao !== 'rejeitado') ||
    typeof revisao.revisor !== 'string' ||
    typeof revisao.justificativa !== 'string' ||
    typeof revisao.createdAt !== 'string'
  ) {
    return null;
  }
  return revisao as RevisaoHumana;
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
    const metadata = getMetadata(item.metadata);

    return {
      analiseId: item.id,
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
      reportStatus: toReportStatus(metadata.reportStatus),
      confidenceScore: toNumberValue(metadata.confidenceScore),
      confidenceClass:
        metadata.confidenceClass === 'confianca_alta' ||
        metadata.confidenceClass === 'confianca_media' ||
        metadata.confidenceClass === 'confianca_baixa'
          ? metadata.confidenceClass
          : 'confianca_baixa',
      ...(metadata.confidenceSignals && typeof metadata.confidenceSignals === 'object'
        ? { confidenceSignals: metadata.confidenceSignals as ConfidenceSignals }
        : {}),
      alertasConfiabilidade: toStringArray(metadata.alertasConfiabilidade),
      ...(typeof metadata.documentHash === 'string' ? { documentHash: metadata.documentHash } : {}),
      revisaoHumana: parseRevisaoHumana(metadata.revisaoHumana),
    } satisfies AnaliseConformidadeResponse;
  });

  const historico = resultados.map((item) => {
    const metadata = getMetadata(item.metadata);
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
      reportStatus: toReportStatus(metadata.reportStatus),
      confidenceScore: toNumberValue(metadata.confidenceScore),
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

  const metadata = getMetadata(item.metadata);

  return {
    analiseId: item.id,
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
    reportStatus: toReportStatus(metadata.reportStatus),
    confidenceScore: toNumberValue(metadata.confidenceScore),
    confidenceClass:
      metadata.confidenceClass === 'confianca_alta' ||
      metadata.confidenceClass === 'confianca_media' ||
      metadata.confidenceClass === 'confianca_baixa'
        ? metadata.confidenceClass
        : 'confianca_baixa',
    ...(metadata.confidenceSignals && typeof metadata.confidenceSignals === 'object'
      ? { confidenceSignals: metadata.confidenceSignals as ConfidenceSignals }
      : {}),
    alertasConfiabilidade: toStringArray(metadata.alertasConfiabilidade),
    ...(typeof metadata.documentHash === 'string' ? { documentHash: metadata.documentHash } : {}),
    revisaoHumana: parseRevisaoHumana(metadata.revisaoHumana),
    jobId: item.jobId ?? undefined,
    nomeArquivo: item.nomeArquivo ?? undefined,
  } as AnaliseConformidadeResponse;
}
