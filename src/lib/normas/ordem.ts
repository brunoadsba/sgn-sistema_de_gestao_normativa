function extrairNumeroNr(codigo: string): number | null {
  const match = codigo.trim().match(/\bNR[-\s]*(\d+)\b/i)
  if (!match) return null
  const numero = Number.parseInt(match[1], 10)
  return Number.isNaN(numero) ? null : numero
}

export function normalizarCodigoNr(codigo: string): string {
  const numero = extrairNumeroNr(codigo)
  if (numero === null) return codigo.trim().toUpperCase()
  return `NR-${numero}`
}

export function ordenarCodigosNr(codigos: string[]): string[] {
  const unicosNormalizados = Array.from(
    new Set(codigos.map((codigo) => normalizarCodigoNr(codigo)))
  )

  return unicosNormalizados.sort((a, b) => {
    const numA = extrairNumeroNr(a)
    const numB = extrairNumeroNr(b)

    if (numA !== null && numB !== null) return numA - numB
    if (numA !== null) return -1
    if (numB !== null) return 1
    return a.localeCompare(b, 'pt-BR')
  })
}
