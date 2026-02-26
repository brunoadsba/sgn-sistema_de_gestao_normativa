import { schema } from '@/lib/db';
import { GapConformidade } from '@/types/ia';

export function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function extrairNormaId(normasRelacionadas?: string[]): number | null {
  if (!normasRelacionadas || normasRelacionadas.length === 0) {
    return null;
  }

  const match = normasRelacionadas[0]?.match(/\d+/);
  if (!match) return null;

  const parsed = Number.parseInt(match[0], 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function normalizarGap(raw: typeof schema.conformidadeGaps.$inferSelect): GapConformidade {
  return {
    id: raw.id,
    descricao: raw.descricao,
    severidade: raw.severidade as GapConformidade['severidade'],
    categoria: raw.categoria ?? 'Geral',
    recomendacao: raw.recomendacao ?? 'Sem recomendação',
    prazo: raw.prazoSugerido ?? 'Não definido',
    ...(typeof raw.probabilidade === 'number' ? { probabilidade: raw.probabilidade } : {}),
    ...(typeof raw.pontuacaoGut === 'number' ? { pontuacaoGut: raw.pontuacaoGut } : {}),
    ...(raw.classificacao ? { classificacao: raw.classificacao } : {}),
    ...(typeof raw.prazoDias === 'number' ? { prazoDias: raw.prazoDias } : {}),
    ...(raw.impacto ? { impacto: raw.impacto } : {}),
    ...(raw.normaId ? { normasRelacionadas: [`NR-${raw.normaId}`] } : {}),
    ...(raw.citacaoDocumento ? { citacaoDocumento: raw.citacaoDocumento } : {}),
    ...(raw.paginaDocumento ? { paginaDocumento: raw.paginaDocumento } : {}),
    ...(raw.linhaDocumento ? { linhaDocumento: raw.linhaDocumento } : {}),
  };
}
