/**
 * Formata data/hora em ISO para string pt-BR (America/Sao_Paulo)
 */
export function formatarDataHoraBrasilia(isoDate: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(isoDate))
}

/**
 * Formata Date para string pt-BR (America/Sao_Paulo)
 */
export function formatarDataHora(data: Date): string {
  const dataParte = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data)
  const horaParte = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(data)
  return `${dataParte} ${horaParte}`
}
