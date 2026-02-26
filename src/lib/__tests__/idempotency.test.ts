import {
  getIdempotentResponse,
  saveIdempotentResponse,
  IdempotencyConflictError,
} from '@/lib/idempotency'
import type { AnaliseConformidadeRequest } from '@/types/ia'

function makeBody(overrides: Partial<AnaliseConformidadeRequest> = {}): AnaliseConformidadeRequest {
  return {
    documento: 'conteudo de teste',
    tipoDocumento: 'OUTRO',
    normasAplicaveis: ['NR-1'],
    ...overrides,
  }
}

describe('idempotency cache', () => {
  it('retorna null quando a chave não existe', async () => {
    const result = await getIdempotentResponse('missing-key', makeBody())
    expect(result).toBeNull()
  })

  it('retorna resposta salva para o mesmo payload', async () => {
    const key = `key-${Date.now()}`
    const body = makeBody()
    const response = { jobId: 'job-123', status: 'pending', pollUrl: '/api/ia/jobs/job-123' }

    await saveIdempotentResponse(key, body, response)

    const cached = await getIdempotentResponse(key, body)
    expect(cached).toEqual(response)
  })

  it('lança conflito quando a mesma chave recebe payload diferente', async () => {
    const key = `key-${Date.now()}-conflict`
    await saveIdempotentResponse(key, makeBody({ documento: 'doc-a' }), { jobId: 'job-a' })

    await expect(getIdempotentResponse(key, makeBody({ documento: 'doc-b' }))).rejects.toThrow(
      IdempotencyConflictError
    )
  })
})
