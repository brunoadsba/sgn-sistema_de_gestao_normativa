export const RISCO_CONFIG = {
  baixo: {
    color: 'bg-green-500',
    label: 'Baixo',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  medio: {
    color: 'bg-yellow-500',
    label: 'Médio',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
  },
  alto: {
    color: 'bg-orange-500',
    label: 'Alto',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    text: 'text-orange-600 dark:text-orange-400',
  },
  critico: {
    color: 'bg-red-500',
    label: 'Crítico',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-600 dark:text-red-400',
  },
} as const

/** Alias para compatibilidade com ResultadoAnalise (bg, border, text, label) */
export const CONFIG_RISCO = {
  baixo: { bg: RISCO_CONFIG.baixo.bg, border: RISCO_CONFIG.baixo.border, text: RISCO_CONFIG.baixo.text, label: 'Risco Baixo' },
  medio: { bg: RISCO_CONFIG.medio.bg, border: RISCO_CONFIG.medio.border, text: RISCO_CONFIG.medio.text, label: 'Risco Médio' },
  alto: { bg: RISCO_CONFIG.alto.bg, border: RISCO_CONFIG.alto.border, text: RISCO_CONFIG.alto.text, label: 'Risco Alto' },
  critico: { bg: RISCO_CONFIG.critico.bg, border: RISCO_CONFIG.critico.border, text: RISCO_CONFIG.critico.text, label: 'Risco Crítico' },
} as const

export function getRiscoColor(risco: string): string {
  return RISCO_CONFIG[risco as keyof typeof RISCO_CONFIG]?.color ?? 'bg-gray-500'
}
