import { NextRequest } from 'next/server'
import { z } from 'zod'
import { groq } from '@/lib/ia/groq'
import { iaLogger } from '@/lib/logger'
import { env } from '@/lib/env'
import { rateLimit } from '@/lib/security/rate-limit'
import { getZaiThinkingOptions } from '@/lib/ia/zai-options'
import { montarSystemPromptEspecialista, selecionarPerfilEspecialista } from '@/lib/ia/specialist-agent'
import { createSuccessResponse, createErrorResponse } from '@/middlewares/validation'

export const maxDuration = 60
export const runtime = 'nodejs'

const ChatDocumentoSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(50_000),
  })).min(1).max(100),
  documentContext: z.string().max(500_000).optional(),
})

type ChatRole = 'system' | 'user' | 'assistant'
type ChatMessage = {
  role: ChatRole
  content: string
}

type ZaiCompletionResponse = {
  choices?: Array<{
    finish_reason?: string
    message?: {
      content?: string
    }
  }>
  usage?: {
    completion_tokens_details?: {
      reasoning_tokens?: number
    }
  }
}

type OllamaChatResponse = {
  message?: {
    content?: string
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

function normalizarMensagem(valor: unknown): ChatMessage | null {
  if (!valor || typeof valor !== 'object') return null

  const role = (valor as { role?: unknown }).role
  const content = (valor as { content?: unknown }).content

  if ((role !== 'user' && role !== 'assistant' && role !== 'system') || typeof content !== 'string') {
    return null
  }

  return {
    role,
    content: content.trim(),
  }
}

async function callGroq(messages: ChatMessage[]): Promise<string> {
  const response = await groq.chat.completions.create({
    messages,
    model: env.GROQ_MODEL,
    temperature: 0,
    top_p: 1,
    seed: 42,
    max_tokens: 1500,
  })

  return response.choices?.[0]?.message?.content || 'Nao consegui processar a resposta neural.'
}

async function callZai(messages: ChatMessage[]): Promise<string> {
  const apiKey = env.ZAI_API_KEY || process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('ZAI_API_KEY ausente para fallback')

  const response = await fetch(`${env.ZAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
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

  if (!response.ok) {
    throw new Error(`Erro na API Z.AI (${response.status})`)
  }

  const data = (await response.json()) as ZaiCompletionResponse
  iaLogger.debug(
    {
      provider: 'zai',
      model: env.ZAI_MODEL || 'glm-4.7',
      finish_reason: data.choices?.[0]?.finish_reason,
      reasoning_tokens: data.usage?.completion_tokens_details?.reasoning_tokens,
    },
    '[NEX-CHAT] Chamada Z.AI concluída'
  )
  return data.choices?.[0]?.message?.content || 'Nao consegui processar a resposta neural via fallback.'
}

async function callOllama(messages: ChatMessage[]): Promise<string> {
  const url = `${env.OLLAMA_BASE_URL}/api/chat`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.OLLAMA_MODEL,
      messages,
      stream: false,
      options: {
        temperature: 0,
        top_p: 1,
        seed: 42,
        num_predict: 1500,
        num_ctx: 32768,
      },
    }),
    signal: AbortSignal.timeout(90000),
  })

  if (!response.ok) {
    throw new Error(`Erro na API Ollama (${response.status})`)
  }

  const data = (await response.json()) as OllamaChatResponse
  return data.message?.content || 'Nao consegui processar a resposta neural via Ollama.'
}

async function executarChatComFallback(messages: ChatMessage[]): Promise<string> {
  if (env.AI_PROVIDER === 'ollama') {
    try {
      return await callOllama(messages)
    } catch (error) {
      const err = toError(error)
      iaLogger.error({ error: err.message }, '[NEX-CHAT] Falha fixa no Ollama Local')
      throw err
    }
  }

  if (env.AI_PROVIDER === 'zai') {
    try {
      return await callZai(messages)
    } catch (error) {
      const err = toError(error)
      iaLogger.error({ error: err.message }, '[NEX-CHAT] Falha fixa na ZAI')
      throw err
    }
  }

  try {
    return await callGroq(messages)
  } catch (error) {
    const err = toError(error)
    const errStr = err.message
    const isRateLimit =
      errStr.includes('413') ||
      errStr.includes('rate_limit') ||
      errStr.includes('tokens') ||
      errStr.includes('TPM')

    if (isRateLimit) {
      iaLogger.warn({ error: errStr }, '[NEX-CHAT] Groq limit atingido. Ativando fallback para Z.AI.')
      return callZai(messages)
    }

    throw err
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = rateLimit(req, {
      windowMs: 60 * 1000,
      max: 120,
      keyPrefix: 'rl:chat-documento',
    })

    if (rl.limitExceeded) {
      return createErrorResponse('Muitas requisições. Tente novamente em breve.', 429)
    }

    const rawBody = await req.json()

    const parseResult = ChatDocumentoSchema.safeParse(rawBody)
    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')
      return createErrorResponse(`Dados inválidos: ${errorMessages}`, 400)
    }

    const { messages, documentContext } = parseResult.data

    const mensagensCliente = messages
      .map(normalizarMensagem)
      .filter((m): m is ChatMessage => Boolean(m && m.content.length > 0))

    if (mensagensCliente.length === 0) {
      return createErrorResponse('Nenhuma mensagem valida foi enviada.', 400)
    }

    const hasDocument = Boolean(documentContext && documentContext.trim().length > 0)
    let systemPrompt: string

    if (hasDocument) {
      const safeContext = documentContext!.slice(0, 80000)
      const profile = selecionarPerfilEspecialista({ documento: safeContext })
      const systemPromptBase = montarSystemPromptEspecialista('chat_documento', profile)
      systemPrompt = `${systemPromptBase}
Voce auxilia um engenheiro/auditor somente com base no contexto abaixo.

===== CONTEXTO DO DOCUMENTO =====
${safeContext}
=================================

REGRAS ABSOLUTAS (AJA COMO AUDITOR FORENSE):
1. Sua ÚNICA fonte de verdade é o contexto do documento acima.
2. NUNCA invente, presuma ou deduza informações que não estejam EXPLICITAMENTE escritas.
3. Se a informação solicitada não estiver no documento, declare: "Não há dados sobre isso no documento avaliado."
4. Responda em Português Brasileiro, de forma direta, técnica e estritamente baseada no Lastro Documental.`
    } else {
      systemPrompt = `Você é o NEX, assistente especialista em Segurança e Saúde do Trabalho (SST) e Normas Regulamentadoras (NRs) brasileiras do SGN - Sistema de Gestão Normativa.

MODO LIVRE (sem documento carregado):
1. Responda perguntas gerais sobre NRs, SST, compliance, EPIs, CIPA, PCMSO, PGR e temas correlatos.
2. Use seu conhecimento técnico para orientar, mas deixe claro que são orientações gerais e não substituem análise documental.
3. Se o usuário perguntar algo que exige análise de um documento específico, oriente-o a fazer upload do documento para uma análise precisa.
4. Responda em Português Brasileiro, de forma direta, técnica e acessível.
5. Seja útil e proativo em sugerir próximos passos quando pertinente.`
    }

    const contextualizedMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...mensagensCliente,
    ]

    const reply = await executarChatComFallback(contextualizedMessages)
    const mode = hasDocument ? 'grounded' : 'free'

    return createSuccessResponse({ reply, mode })
  } catch (error) {
    const err = toError(error)
    iaLogger.error({ error: err.message }, '[NEX-CHAT] Falha estrutural')
    return createErrorResponse(`Erro interno ao consultar o assistente: ${err.message}`, 500)
  }
}
