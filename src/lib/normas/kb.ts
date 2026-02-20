import fs from 'fs'
import path from 'path'
import { env } from '@/lib/env'
import { EvidenciaNormativa } from '@/types/ia'
import { getNormas } from '@/lib/data/normas'

type ChunkNormativo = {
  chunkId: string
  normaCodigo: string
  secao: string
  conteudo: string
}

type ResultadoRecuperacao = {
  evidencias: EvidenciaNormativa[]
  contexto: {
    versaoBase: string
    totalChunks: number
    fonte: 'local'
  }
}

const KB_DIR = path.join(process.cwd(), 'data', 'normas')
const CHUNK_SIZE = 1400
const CHUNK_OVERLAP = 200

function sanitizeCode(code: string): string {
  return code.toLowerCase().replace(/[^a-z0-9-]/g, '')
}

function scoreChunkAgainstDocument(chunk: string, documento: string): number {
  const doc = documento.toLowerCase()
  const tokens = chunk
    .toLowerCase()
    .split(/\W+/)
    .filter((token) => token.length > 3)
    .slice(0, 80)

  if (tokens.length === 0) return 0
  const hits = tokens.filter((token) => doc.includes(token)).length
  return Number((hits / tokens.length).toFixed(4))
}

function chunkText(normaCodigo: string, content: string): ChunkNormativo[] {
  const normalized = content.replace(/\r\n/g, '\n').trim()
  const chunks: ChunkNormativo[] = []

  let cursor = 0
  let index = 1
  while (cursor < normalized.length) {
    const end = Math.min(cursor + CHUNK_SIZE, normalized.length)
    const raw = normalized.slice(cursor, end).trim()
    if (raw.length > 80) {
      chunks.push({
        chunkId: `${sanitizeCode(normaCodigo)}:chunk-${String(index).padStart(4, '0')}`,
        normaCodigo,
        secao: `bloco-${index}`,
        conteudo: raw,
      })
      index += 1
    }
    if (end >= normalized.length) break
    cursor = Math.max(0, end - CHUNK_OVERLAP)
  }

  return chunks
}

function readLocalNormaText(normaCodigo: string): string | null {
  const normalizedCode = sanitizeCode(normaCodigo)
  const candidates = [
    `${normalizedCode}.txt`,
    `${normalizedCode}.md`,
    `${normalizedCode}.markdown`,
  ]

  for (const fileName of candidates) {
    const fullPath = path.join(KB_DIR, fileName)
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf8')
    }
  }

  return null
}

function getFallbackFromCatalog(normaCodigo: string): string {
  const norma = getNormas().find((item) => item.codigo.toLowerCase() === normaCodigo.toLowerCase())
  if (!norma) return ''
  return [
    `Código: ${norma.codigo}`,
    `Título: ${norma.titulo}`,
    `Descrição: ${norma.descricao}`,
    `Palavras-chave: ${norma.palavrasChave.join(', ')}`,
  ].join('\n')
}

function buildKnowledgeVersion(totalChunks: number): string {
  return `local-kb-${new Date().toISOString().slice(0, 10)}-${totalChunks}`
}

export async function recuperarEvidenciasNormativas(
  normasAplicaveis: string[],
  documento: string,
  limit = 12
): Promise<ResultadoRecuperacao> {
  const codigos = normasAplicaveis.length > 0 ? normasAplicaveis : ['NR-1']
  const allChunks: ChunkNormativo[] = []
  const missingNormas: string[] = []

  for (const codigo of codigos) {
    const localText = readLocalNormaText(codigo)
    const sourceText = localText ?? getFallbackFromCatalog(codigo)

    if (!sourceText) {
      missingNormas.push(codigo)
      continue
    }

    const chunks = chunkText(codigo, sourceText)
    allChunks.push(...chunks)
  }

  if (env.KB_STRICT_MODE === 'true' && missingNormas.length > 0) {
    throw new Error(
      `Base normativa local incompleta para: ${missingNormas.join(', ')}. Adicione arquivos em data/normas/*.txt`
    )
  }

  const ranked = allChunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunkAgainstDocument(chunk.conteudo, documento),
    }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  const evidencias: EvidenciaNormativa[] = ranked.map((chunk) => ({
    chunkId: chunk.chunkId,
    normaCodigo: chunk.normaCodigo,
    secao: chunk.secao,
    conteudo: chunk.conteudo,
    score: chunk.score,
    fonte: 'local',
  }))

  return {
    evidencias,
    contexto: {
      versaoBase: buildKnowledgeVersion(allChunks.length),
      totalChunks: allChunks.length,
      fonte: 'local',
    },
  }
}
