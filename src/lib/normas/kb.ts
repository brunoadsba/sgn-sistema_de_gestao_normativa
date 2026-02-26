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
    missingNormas?: string[]
  }
}

const KB_DIR = path.join(process.cwd(), 'data', 'normas')
const CHUNK_SIZE = 1400
const CHUNK_OVERLAP = 200
const normaFileCache = new Map<string, { mtimeMs: number; content: string }>()

function sanitizeCode(code: string): string {
  const sanitized = code.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (sanitized.startsWith('nr') && sanitized.length > 2) {
    const num = parseInt(sanitized.substring(2), 10)
    return `nr-${num}`
  }
  // Se for apenas número, trata como NR
  if (/^\d+$/.test(sanitized)) {
    return `nr-${parseInt(sanitized, 10)}`
  }
  return sanitized
}

function scoreChunkAgainstDocument(chunk: string, documento: string): number {
  const doc = documento.toLowerCase().replace(/[^\w\s]/g, ' ')
  const chunkLower = chunk.toLowerCase()

  const tokensChunk = chunkLower
    .split(/\W+/)
    .filter((token) => token.length > 3)
    .slice(0, 200)

  if (tokensChunk.length === 0) return 0

  // Métrica 1: Proporção de tokens do chunk no documento (Recall)
  const hitsProporcional = tokensChunk.filter((token) => doc.includes(token)).length
  const scoreProporcional = hitsProporcional / tokensChunk.length

  // Métrica 2: Hits absolutos de palavras do documento no chunk (Precision/Boost)
  // Extraímos tokens únicos do documento que são relevantes (ignorando stopwords comuns)
  const stopwords = new Set(['este', 'esta', 'esse', 'essa', 'isso', 'aquilo', 'como', 'para', 'mais', 'pode', 'deve', 'sera', 'pelo', 'pela', 'sobre', 'entre', 'quando', 'onde', 'quem', 'qual', 'quais'])
  const tokensDoc = new Set(
    doc.split(/\W+/)
      .filter(t => t.length > 3 && !stopwords.has(t))
  )

  let hitsAbsolutos = 0
  for (const t of tokensDoc) {
    if (chunkLower.includes(t)) hitsAbsolutos++
  }

  // Combinamos: a proporção ajuda em docs longos, os hits absolutos ajudam em docs curtos (sintéticos)
  // Reduzimos o peso do bônus para 0.05 para não dominar a proporção
  const scoreFinal = Math.min(1, Number((scoreProporcional + (hitsAbsolutos * 0.05)).toFixed(4)))
  return scoreFinal
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
      const stats = fs.statSync(fullPath)
      const cached = normaFileCache.get(fullPath)

      if (cached && cached.mtimeMs === stats.mtimeMs) {
        return cached.content
      }

      const content = fs.readFileSync(fullPath, 'utf8')
      normaFileCache.set(fullPath, { mtimeMs: stats.mtimeMs, content })
      return content
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
    console.log(`[DEBUG] KB: Lendo norma ${codigo}, texto local encontrado: ${!!localText}`)
    const sourceText = localText ?? getFallbackFromCatalog(codigo)

    if (!sourceText) {
      missingNormas.push(codigo)
      continue
    }

    const chunks = chunkText(codigo, sourceText)
    allChunks.push(...chunks)
    console.log(`[DEBUG] KB: Adicionados ${chunks.length} chunks para ${codigo}. Total agora: ${allChunks.length}`)
  }

  if (env.KB_STRICT_MODE === 'true' && missingNormas.length > 0) {
    throw new Error(
      `Base normativa local incompleta para: ${missingNormas.join(', ')}. Adicione arquivos em data/normas/*.txt`
    )
  }

  const ranked = allChunks
    .map((chunk) => {
      const doc = documento ? documento.replace(/\s+/g, ' ').trim() : ''
      const score = doc.length > 0 ? scoreChunkAgainstDocument(chunk.conteudo, doc) : 0
      return {
        ...chunk,
        score
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  console.log(`[DEBUG] KB: Ranqueamento concluído. Chunks final: ${ranked.length}`)

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
      ...(missingNormas.length > 0 ? { missingNormas } : {}),
    },
  }
}
