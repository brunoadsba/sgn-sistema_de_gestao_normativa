import crypto from 'crypto'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'

type CacheEntry = {
  requestHash: string
  response: AnaliseConformidadeResponse
  createdAt: number
}

const CACHE_TTL_MS = 1000 * 60 * 60
const idempotencyCache = new Map<string, CacheEntry>()

function hashRequestBody(body: AnaliseConformidadeRequest): string {
  const normalized = JSON.stringify({
    documento: body.documento,
    tipoDocumento: body.tipoDocumento,
    normasAplicaveis: body.normasAplicaveis ?? [],
  })
  return crypto.createHash('sha256').update(normalized).digest('hex')
}

function cleanExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of idempotencyCache.entries()) {
    if (now - entry.createdAt > CACHE_TTL_MS) {
      idempotencyCache.delete(key)
    }
  }
}

export function getIdempotentResponse(
  idempotencyKey: string,
  body: AnaliseConformidadeRequest
): AnaliseConformidadeResponse | null {
  cleanExpiredEntries()
  const existing = idempotencyCache.get(idempotencyKey)
  if (!existing) return null

  const bodyHash = hashRequestBody(body)
  if (existing.requestHash !== bodyHash) {
    throw new Error('Idempotency-Key já utilizada com payload diferente')
  }

  return existing.response
}

export function saveIdempotentResponse(
  idempotencyKey: string,
  body: AnaliseConformidadeRequest,
  response: AnaliseConformidadeResponse
) {
  idempotencyCache.set(idempotencyKey, {
    requestHash: hashRequestBody(body),
    response,
    createdAt: Date.now(),
  })
}
