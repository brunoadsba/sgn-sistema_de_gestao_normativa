import { createHash } from 'crypto'
import { ChunkDocumentoMetadata } from '@/types/ia'

export type ChunkDocumento = ChunkDocumentoMetadata & {
  conteudo: string
}

type ChunkingOptions = {
  chunkSize: number
  overlapSize: number
  minChunkSize: number
}

const DEFAULT_OPTIONS: ChunkingOptions = {
  chunkSize: 350_000,
  overlapSize: 40_000,
  minChunkSize: 5_000,
}

function normalizarDocumento(documento: string): string {
  return documento.replace(/\r\n/g, '\n').trim()
}

function encontrarQuebraNatural(texto: string, inicio: number, fimProposto: number): number {
  if (fimProposto >= texto.length) return texto.length

  const janela = 60_000
  const limiteInferior = Math.max(inicio + 1, fimProposto - janela)
  const trecho = texto.slice(limiteInferior, fimProposto)

  const ultimasQuebras = [
    trecho.lastIndexOf('\n\n'),
    trecho.lastIndexOf('\n'),
    trecho.lastIndexOf('. '),
    trecho.lastIndexOf('; '),
  ]
    .filter((idx) => idx >= 0)
    .sort((a, b) => b - a)

  if (ultimasQuebras.length === 0) {
    return fimProposto
  }

  return limiteInferior + ultimasQuebras[0] + 1
}

function criarChunkId(conteudo: string, indice: number): string {
  const hash = createHash('sha1').update(conteudo).digest('hex').slice(0, 12)
  return `doc-chunk-${String(indice).padStart(3, '0')}-${hash}`
}

export function dividirDocumentoEmChunks(
  documento: string,
  customOptions: Partial<ChunkingOptions> = {}
): ChunkDocumento[] {
  const options = { ...DEFAULT_OPTIONS, ...customOptions }
  const texto = normalizarDocumento(documento)

  if (!texto) return []

  if (texto.length <= options.chunkSize) {
    const chunkId = criarChunkId(texto, 1)
    return [
      {
        chunkId,
        indice: 1,
        totalChunks: 1,
        inicioOffset: 0,
        fimOffset: texto.length,
        tamanhoCaracteres: texto.length,
        conteudo: texto,
      },
    ]
  }

  const chunksBrutos: Omit<ChunkDocumento, 'totalChunks'>[] = []
  let cursor = 0
  let indice = 1

  while (cursor < texto.length) {
    const fimProposto = Math.min(cursor + options.chunkSize, texto.length)
    const fimNatural = encontrarQuebraNatural(texto, cursor, fimProposto)
    const fim = Math.max(cursor + options.minChunkSize, fimNatural)
    const conteudo = texto.slice(cursor, fim).trim()

    if (conteudo.length > 0) {
      chunksBrutos.push({
        chunkId: criarChunkId(conteudo, indice),
        indice,
        inicioOffset: cursor,
        fimOffset: fim,
        tamanhoCaracteres: conteudo.length,
        conteudo,
      })
      indice += 1
    }

    if (fim >= texto.length) break
    // Protege contra loops infinitos: garante que o cursor sempre avance pelo menos 1 posição
    cursor = Math.max(cursor + 1, fim - options.overlapSize)
  }

  const totalChunks = chunksBrutos.length
  return chunksBrutos.map((chunk) => ({ ...chunk, totalChunks }))
}
