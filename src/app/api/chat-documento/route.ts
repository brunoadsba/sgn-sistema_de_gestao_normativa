import { NextRequest } from 'next/server'
import { z } from 'zod'
import { groq } from '@/lib/ia/groq'
import { iaLogger } from '@/lib/logger'
import { env } from '@/lib/env'
import { rateLimit } from '@/lib/security/rate-limit'
import { getZaiThinkingOptions } from '@/lib/ia/zai-options'
import { montarSystemPromptEspecialista, selecionarPerfilEspecialista } from '@/lib/ia/specialist-agent'
import { createErrorResponse } from '@/middlewares/validation'
import { buildSystemPrompt, normalizarMensagem } from './prompt-builder'
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions'

export const maxDuration = 60
export const runtime = 'nodejs'

const SSE_DONE = 'data: [DONE]\n\n'

const ChatDocumentoSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(50_000),
  })).min(1).max(100),
  documentContext: z.string().max(500_000).optional(),
})

type ChatMessage = ChatCompletionMessageParam

function sseChunk(text: string): string {
  return `data: ${JSON.stringify({ text })}\n\n`
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

/** Streaming nativo via Groq SDK */
async function streamGroq(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder()
  const groqStream = await groq.chat.completions.create({
    messages,
    model: env.GROQ_MODEL,
    temperature: 0,
    top_p: 1,
    seed: 42,
    max_tokens: 1500,
    stream: true,
  })

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of groqStream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) controller.enqueue(encoder.encode(sseChunk(text)))
        }
        controller.enqueue(encoder.encode(SSE_DONE))
      } catch {
        controller.enqueue(encoder.encode(sseChunk('[Erro durante streaming]')))
        controller.enqueue(encoder.encode(SSE_DONE))
      } finally {
        controller.close()
      }
    },
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Z.AI e Ollama: resposta completa emitida como stream único */
async function streamFallback(messages: ChatMessage[]): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder()
  let reply: string

  if (env.AI_PROVIDER === 'ollama') {
    const res = await fetch(`${env.OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.OLLAMA_MODEL,
        messages,
        stream: false,
        options: { temperature: 0, top_p: 1, seed: 42, num_predict: 1500, num_ctx: 32768 },
      }),
      signal: AbortSignal.timeout(90_000),
    })
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`)
    const data = (await res.json()) as { message?: { content?: string } }
    reply = data.message?.content ?? 'Sem resposta do Ollama.'
  } else {
    const apiKey = env.ZAI_API_KEY || env.OPENAI_API_KEY
    if (!apiKey) throw new Error('ZAI_API_KEY ausente')

    const maxAttempts = Math.max(2, env.ZAI_RETRY_ATTEMPTS)
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = await fetch(`${env.ZAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: env.ZAI_MODEL || 'glm-4.7',
          messages,
          temperature: 0,
          top_p: 1,
          max_tokens: 1500,
          ...getZaiThinkingOptions(),
        }),
        signal: AbortSignal.timeout(env.ZAI_TIMEOUT_MS),
      })

      if (res.ok) {
        const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
        reply = data.choices?.[0]?.message?.content ?? 'Sem resposta do Z.AI.'
        lastError = null
        break
      }

      if (res.status === 429 && attempt < maxAttempts - 1) {
        const delay = Math.min(env.ZAI_RETRY_BASE_MS * (2 ** attempt), env.ZAI_RETRY_MAX_MS)
        iaLogger.warn({ attempt: attempt + 1, delay }, '[NEX-CHAT] Z.AI 429 — retry com backoff')
        await sleep(delay)
        lastError = new Error(
          'Limite de requisições da API Z.AI atingido. Aguarde alguns minutos e tente novamente.'
        )
        continue
      }

      lastError = new Error(
        res.status === 429
          ? 'Limite de requisições da API Z.AI atingido. Aguarde alguns minutos e tente novamente.'
          : `Z.AI HTTP ${res.status}`
      )
      break
    }

    if (lastError) throw lastError
  }

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(sseChunk(reply)))
      controller.enqueue(encoder.encode(SSE_DONE))
      controller.close()
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(req, { windowMs: 60 * 1000, max: 120, keyPrefix: 'rl:chat-documento' })
    if (rl.limitExceeded) {
      return createErrorResponse('Muitas requisições. Tente novamente em breve.', 429)
    }

    const parseResult = ChatDocumentoSchema.safeParse(await req.json())
    if (!parseResult.success) {
      const erros = parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
      return createErrorResponse(`Dados inválidos: ${erros}`, 400)
    }

    const { messages, documentContext } = parseResult.data

    const mensagensCliente = messages
      .map(normalizarMensagem)
      .filter((m): m is ChatMessage => Boolean(m && (m.content as string).length > 0))

    if (mensagensCliente.length === 0) {
      return createErrorResponse('Nenhuma mensagem válida foi enviada.', 400)
    }

    const hasDocument = Boolean(documentContext?.trim())
    const profile = selecionarPerfilEspecialista({ documento: documentContext ?? '' })
    const systemPromptBase = montarSystemPromptEspecialista('chat_documento', profile)
    const systemPrompt = buildSystemPrompt(hasDocument, documentContext, systemPromptBase)

    const contextualizedMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...mensagensCliente,
    ]

    const sseHeaders = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    }

    if (env.AI_PROVIDER === 'ollama') {
      const stream = await streamFallback(contextualizedMessages)
      return new Response(stream, { headers: sseHeaders })
    }

    if (env.AI_PROVIDER === 'zai') {
      try {
        const stream = await streamFallback(contextualizedMessages)
        return new Response(stream, { headers: sseHeaders })
      } catch (zaiErr) {
        iaLogger.warn({ error: toError(zaiErr).message }, '[NEX-CHAT] Z.AI falhou — fallback Groq')
        try {
          const stream = await streamGroq(contextualizedMessages)
          return new Response(stream, { headers: sseHeaders })
        } catch {
          throw zaiErr
        }
      }
    }

    // groq ou default: Groq primeiro, Z.AI como fallback, Groq como fallback do fallback
    let groqErr: Error | null = null
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const stream = await streamGroq(contextualizedMessages)
        return new Response(stream, { headers: sseHeaders })
      } catch (err) {
        groqErr = toError(err)
        if (attempt === 0) {
          iaLogger.warn({ error: groqErr.message }, '[NEX-CHAT] Groq falhou — retry')
          await sleep(1500)
          continue
        }
        iaLogger.warn({ error: groqErr.message }, '[NEX-CHAT] Groq falhou — fallback Z.AI')
        break
      }
    }

    try {
      const stream = await streamFallback(contextualizedMessages)
      return new Response(stream, { headers: sseHeaders })
    } catch (zaiErr) {
      iaLogger.warn({ error: toError(zaiErr).message }, '[NEX-CHAT] Z.AI falhou — fallback Groq')
      try {
        const stream = await streamGroq(contextualizedMessages)
        return new Response(stream, { headers: sseHeaders })
      } catch {
        throw zaiErr
      }
    }
  } catch (error) {
    const err = toError(error)
    iaLogger.error({ error: err.message }, '[NEX-CHAT] Falha estrutural')
    const isRateLimit = err.message.includes('429') || err.message.includes('Limite de requisições')
    return createErrorResponse(
      err.message,
      isRateLimit ? 429 : 500
    )
  }
}
