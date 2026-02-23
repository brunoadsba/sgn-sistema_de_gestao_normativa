import { NextRequest, NextResponse } from 'next/server'
import { groq } from '@/lib/ia/groq'
import { iaLogger } from '@/lib/logger'
import { env } from '@/lib/env'

export const maxDuration = 60 // Permite até 60s em Vercel Pro/Hobby Serverless
export const runtime = 'nodejs'

async function callGroq(messages: any[]) {
    const response = await groq.chat.completions.create({
        messages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2, // Temperatura ideal para RAG Estrito
        max_tokens: 1500
    })
    return response.choices?.[0]?.message?.content || 'Não consegui processar a resposta neural.'
}

async function callZai(messages: any[]) {
    const apiKey = env.ZAI_API_KEY || process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('ZAI_API_KEY ausente para fallback')

    const response = await fetch(`${env.ZAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: env.ZAI_MODEL || 'glm-4.7',
            messages,
            temperature: 0.2,
            max_tokens: 1500,
        }),
        signal: AbortSignal.timeout(45000)
    })

    if (!response.ok) {
        throw new Error(`Erro na API Z.AI (${response.status})`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'Não consegui processar a resposta neural via Fallback.'
}

async function callOllama(messages: any[]) {
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
                num_ctx: 32768, // Expanded RAG window definition for Ollama Local
            }
        }),
        signal: AbortSignal.timeout(90000)
    })

    if (!response.ok) {
        throw new Error(`Erro na API Ollama (${response.status})`)
    }
    const data = await response.json()
    return data.message?.content || 'Não consegui processar a resposta neural via Ollama.'
}

async function executarChatComFallback(messages: any[]): Promise<string> {
    // 1. Ollama (Se o cliente explicitamente configurar como ambiente offline)
    if (env.AI_PROVIDER === 'ollama') {
        try {
            return await callOllama(messages)
        } catch (error: any) {
            iaLogger.error({ error: error.message }, '[NEX-CHAT] Falha fixa no Ollama Local')
            throw error
        }
    }

    // 2. ZAI (Se o cliente configurou primariamente)
    if (env.AI_PROVIDER === 'zai') {
        try {
            return await callZai(messages)
        } catch (error: any) {
            iaLogger.error({ error: error.message }, '[NEX-CHAT] Falha fixa na ZAI')
            throw error
        }
    }

    // 3. GROQ (Primary Default) com Fallback Inteligente para ZAI (Rate Limits)
    try {
        return await callGroq(messages)
    } catch (error: any) {
        const errStr = error?.message || String(error)
        const isRateLimit = errStr.includes('413') || errStr.includes('rate_limit') || errStr.includes('tokens') || errStr.includes('TPM')

        if (isRateLimit) {
            iaLogger.warn({ error: errStr }, '[NEX-CHAT] Groq limit atingido. Ativando Fallback para Z.AI (GLM)...')
            return await callZai(messages)
        }
        throw error
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { messages, documentContext } = body

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ success: false, error: 'O array de mensagens é obrigatório' }, { status: 400 })
        }

        if (!documentContext) {
            return NextResponse.json({ success: false, error: 'O assistente NEX exige o contexto em escopo para operar.' }, { status: 400 })
        }

        // Limitando o tamanho dinamicamente para não estourar a janela do LLM
        const safeContext = documentContext.slice(0, 80000)

        const systemPrompt = `Você é NEX, o Especialista Neural de Saúde e Segurança do Trabalho (SST) da plataforma SGN.
Você está interagindo DIRETAMENTE com um engenheiro ou auditor, auxiliando-o a sanar dúvidas baseadas no SEGUINTE DOCUMENTO EXTRAÍDO:

===== CONTEXTO DO DOCUMENTO EXCLUSIVO =====
${safeContext}
===========================================

REGRAS ESTABELECIDAS:
1. Responda baseando-se ESTRITAMENTE no documento acima.
2. Se a informação não constar neste documento, diga: "Segundo o escopo atual que estou avaliando, não há dados precisos sobre..." e oriente a procurar na NR aplicável.
3. Não invente ou presuma informações sobre funcionários, métricas, locais ou riscos que não estão textualmente escritos.
4. Responda em Português Brasileiro (pt-BR) de forma objetiva, direta e elegante.`

        const contextualizedMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ]

        const reply = await executarChatComFallback(contextualizedMessages)

        return NextResponse.json({
            success: true,
            reply
        })

    } catch (error) {
        iaLogger.error({ error }, '[NEX-CHAT] Falha Estrutural Crítica')
        return NextResponse.json({
            success: false,
            error: 'Erro interno ao consultar o oráculo neural: ' + (error instanceof Error ? error.message : 'Falha desconhecida.')
        }, { status: 500 })
    }
}
