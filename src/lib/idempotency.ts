import crypto from 'crypto'
import { eq, lt } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { AnaliseConformidadeRequest } from '@/types/ia'

type MemoryEntry = {
  requestHash: string
  response: unknown
  createdAtMs: number
}

const CACHE_TTL_MS = 1000 * 60 * 60
const CLEANUP_INTERVAL_MS = 1000 * 60 * 5

const memoryFallback = new Map<string, MemoryEntry>()
let memoryMode = process.env.NODE_ENV === 'test'
let lastCleanupAt = 0
let schemaEnsured = process.env.NODE_ENV === 'test'

export class IdempotencyConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IdempotencyConflictError'
  }
}

function hashRequestBody(body: AnaliseConformidadeRequest): string {
  const normalized = JSON.stringify({
    documento: body.documento,
    tipoDocumento: body.tipoDocumento,
    normasAplicaveis: body.normasAplicaveis ?? [],
  })
  return crypto.createHash('sha256').update(normalized).digest('hex')
}

function isMissingTableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return /no such table/i.test(error.message) && /idempotency_cache/i.test(error.message)
}

async function ensureDbSchema() {
  if (memoryMode || schemaEnsured) return

  try {
    await db.$client.execute(`
      CREATE TABLE IF NOT EXISTS idempotency_cache (
        key TEXT PRIMARY KEY NOT NULL,
        request_hash TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at_ms INTEGER NOT NULL
      );
    `)
    await db.$client.execute(`
      CREATE INDEX IF NOT EXISTS idx_idempotency_cache_created_at_ms
      ON idempotency_cache(created_at_ms);
    `)
    schemaEnsured = true
  } catch {
    // Se não conseguir criar schema em runtime, entra em modo memória para não quebrar o fluxo.
    memoryMode = true
  }
}

function cleanMemoryExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of memoryFallback.entries()) {
    if (now - entry.createdAtMs > CACHE_TTL_MS) {
      memoryFallback.delete(key)
    }
  }
}

async function maybeCleanDbExpiredEntries() {
  const now = Date.now()
  if (memoryMode || now - lastCleanupAt < CLEANUP_INTERVAL_MS) return
  lastCleanupAt = now

  try {
    await db
      .delete(schema.idempotencyCache)
      .where(lt(schema.idempotencyCache.createdAtMs, now - CACHE_TTL_MS))
  } catch (error) {
    if (isMissingTableError(error)) {
      memoryMode = true
      return
    }
    throw error
  }
}

function getFromMemory(
  idempotencyKey: string,
  requestHash: string
): unknown | null {
  cleanMemoryExpiredEntries()
  const entry = memoryFallback.get(idempotencyKey)
  if (!entry) return null

  if (entry.requestHash !== requestHash) {
    throw new IdempotencyConflictError('Idempotency-Key já utilizada com payload diferente')
  }

  return entry.response
}

function saveInMemory(
  idempotencyKey: string,
  requestHash: string,
  response: unknown
) {
  const existing = memoryFallback.get(idempotencyKey)
  if (existing && existing.requestHash !== requestHash) {
    throw new IdempotencyConflictError('Idempotency-Key já utilizada com payload diferente')
  }

  memoryFallback.set(idempotencyKey, {
    requestHash,
    response,
    createdAtMs: Date.now(),
  })
}

export async function getIdempotentResponse(
  idempotencyKey: string,
  body: AnaliseConformidadeRequest
): Promise<unknown | null> {
  const requestHash = hashRequestBody(body)

  await ensureDbSchema()

  if (memoryMode) {
    return getFromMemory(idempotencyKey, requestHash)
  }

  await maybeCleanDbExpiredEntries()

  try {
    const existing = await db.query.idempotencyCache.findFirst({
      where: eq(schema.idempotencyCache.key, idempotencyKey),
    })

    if (!existing) return null

    if (existing.requestHash !== requestHash) {
      throw new IdempotencyConflictError('Idempotency-Key já utilizada com payload diferente')
    }

    return existing.response
  } catch (error) {
    if (isMissingTableError(error)) {
      memoryMode = true
      return getFromMemory(idempotencyKey, requestHash)
    }
    throw error
  }
}

export async function saveIdempotentResponse(
  idempotencyKey: string,
  body: AnaliseConformidadeRequest,
  response: unknown
): Promise<void> {
  const requestHash = hashRequestBody(body)

  await ensureDbSchema()

  if (memoryMode) {
    saveInMemory(idempotencyKey, requestHash, response)
    return
  }

  await maybeCleanDbExpiredEntries()

  try {
    const existing = await db.query.idempotencyCache.findFirst({
      where: eq(schema.idempotencyCache.key, idempotencyKey),
    })

    if (existing && existing.requestHash !== requestHash) {
      throw new IdempotencyConflictError('Idempotency-Key já utilizada com payload diferente')
    }

    await db
      .insert(schema.idempotencyCache)
      .values({
        key: idempotencyKey,
        requestHash,
        response,
        createdAtMs: Date.now(),
      })
      .onConflictDoUpdate({
        target: schema.idempotencyCache.key,
        set: {
          requestHash,
          response,
          createdAtMs: Date.now(),
        },
      })
  } catch (error) {
    if (isMissingTableError(error)) {
      memoryMode = true
      saveInMemory(idempotencyKey, requestHash, response)
      return
    }
    throw error
  }
}
