import { NextRequest, NextResponse } from 'next/server'
import { groq } from '@/lib/ia/groq'
import { iaLogger } from '@/lib/logger'
import { env } from '@/lib/env'
import { rateLimit } from '@/lib/security/rate-limit'
import { getZaiThinkingOptions } from '@/lib/ia/zai-options'
import { montarSystemPromptEspecialista, selecionarPerfilEspecialista } from '@/lib/ia/specialist-agent'

export const maxDuration = 60
export const runtime = 'nodejs'

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
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
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
      temperature: 0.2,
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
        temperature: 0.2,
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
      return NextResponse.json(
        { success: false, error: 'Muitas requisições. Tente novamente em breve.' },
        { status: 429 }
      )
    }

    const body = (await req.json()) as {
      messages?: unknown
      documentContext?: unknown
    }

    if (!Array.isArray(body.messages)) {
      return NextResponse.json({ success: false, error: 'O array de mensagens e obrigatorio' }, { status: 400 })
    }

    if (typeof body.documentContext !== 'string' || body.documentContext.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'O assistente NEX exige contexto do documento em escopo.' },
        { status: 400 }
      )
    }

    const mensagensCliente = body.messages
      .map(normalizarMensagem)
      .filter((m): m is ChatMessage => Boolean(m && m.content.length > 0))

    if (mensagensCliente.length === 0) {
      return NextResponse.json({ success: false, error: 'Nenhuma mensagem valida foi enviada.' }, { status: 400 })
    }

    if (mensagensCliente.some((m) => m.role === 'system')) {
      return NextResponse.json(
        { success: false, error: 'Mensagens com role=system nao sao permitidas na entrada do cliente.' },
        { status: 400 }
      )
    }

    const safeContext = body.documentContext.slice(0, 80000)

    const profile = selecionarPerfilEspecialista({ documento: safeContext })
    const systemPromptBase = montarSystemPromptEspecialista('chat_documento', profile)
    const systemPrompt = `${systemPromptBase}
Voce auxilia um engenheiro/auditor somente com base no contexto abaixo.

===== CONTEXTO DO DOCUMENTO =====
${safeContext}
=================================

REGRAS:
1. Responda estritamente com base no documento.
2. Se faltar dado no contexto, diga explicitamente que nao ha dados precisos no escopo atual.
3. Nao invente informacoes.
4. Responda em Portugues Brasileiro objetivo.`

    const contextualizedMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...mensagensCliente,
    ]

    const reply = await executarChatComFallback(contextualizedMessages)

    return NextResponse.json({ success: true, reply })
  } catch (error) {
    const err = toError(error)
    iaLogger.error({ error: err.message }, '[NEX-CHAT] Falha estrutural')
    return NextResponse.json(
      {
        success: false,
        error: `Erro interno ao consultar o assistente: ${err.message}`,
      },
      { status: 500 }
    )
  }
}
