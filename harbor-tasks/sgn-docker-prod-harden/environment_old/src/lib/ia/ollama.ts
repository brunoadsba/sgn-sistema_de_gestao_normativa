import { env } from '@/lib/env'
import { iaLogger } from '@/lib/logger'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { z } from 'zod'

// Limite máximo de caracteres para documentos enviados à IA
const MAX_DOCUMENT_LENGTH = 500000

const EvidenciaNormativaSchema = z.object({
    chunkId: z.string(),
    normaCodigo: z.string(),
    secao: z.string(),
    conteudo: z.string(),
    score: z.number().min(0),
    fonte: z.literal('local'),
})

const AnaliseConformidadeResponseSchema = z.object({
    score: z.number().min(0).max(100),
    nivelRisco: z.string().transform((v) => {
        const lower = (v || 'baixo').toLowerCase().replace(/[áàâãä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i').replace(/[óòôõö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/ç/g, 'c');
        if (lower === 'critico' || lower === 'critica' || lower === 'alto' || lower === 'alta' || lower === 'medio' || lower === 'media' || lower === 'baixo' || lower === 'baixa') {
            if (lower === 'critico' || lower === 'critica') return 'critico';
            if (lower === 'alto' || lower === 'alta') return 'alto';
            if (lower === 'medio' || lower === 'media') return 'medio';
            return 'baixo';
        }
        return 'baixo'; // fallback para 'inexistente' ou outros termos
    }),
    gaps: z.array(
        z.object({
            id: z.string().default('gap_indefinido'),
            descricao: z.string().default('Sem descrição detalhada'),
            severidade: z.string().transform((v) => {
                const lower = (v || 'media').toLowerCase().replace(/[áàâãä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i').replace(/[óòôõö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/ç/g, 'c');
                if (lower === 'critica' || lower === 'critico') return 'critica';
                if (lower === 'media') return 'media';
                if (lower === 'alta') return 'alta';
                if (lower === 'baixa') return 'baixa';
                return 'media'; // fallback
            }),
            categoria: z.string().default('Geral'),
            recomendacao: z.string().default('Nenhuma recomendação fornecida'),
            prazo: z.string().optional().default('Não informado'),
            impacto: z.string().optional(),
            normasRelacionadas: z.array(z.string()).optional(),
            evidencias: z.array(EvidenciaNormativaSchema).default([]),
        })
    ).default([]),
    resumo: z.string().default('Análise concluída sem resumo detalhado.'),
    pontosPositivos: z.array(z.string()).default([]),
    pontosAtencao: z.array(z.string()).default([]),
    proximosPassos: z.array(z.string()).default([]),
})

function sanitizeInput(input: string): string {
    return input
        .slice(0, MAX_DOCUMENT_LENGTH)
        .replace(/```/g, '')
        .trim()
}

export async function analisarConformidadeOllama(
    request: AnaliseConformidadeRequest
): Promise<AnaliseConformidadeResponse> {
    try {
        const prompt = gerarPromptAnalise(request)
        const response = await executarOllama(prompt)
        return parsearRespostaAnalise(response)
    } catch (error) {
        iaLogger.error(
            { error: error instanceof Error ? error.message : 'Erro desconhecido' },
            'Erro na análise de conformidade via Ollama'
        )
        throw new Error(`Falha na análise Ollama: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
}

async function executarOllama(prompt: string): Promise<string> {
    const url = `${env.OLLAMA_BASE_URL}/api/chat`

    const payload = {
        model: env.OLLAMA_MODEL,
        messages: [
            {
                role: 'system',
                content: 'Você é um especialista em SST (Segurança e Saúde no Trabalho) e análise de conformidade com normas regulamentadoras brasileiras. Responda estritamente em JSON.',
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        stream: false,
        options: {
            temperature: 0.1,
            num_ctx: 16384 // Aumentando o contexto para documentos SST
        }
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ollama Error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data.message.content
}

function gerarPromptAnalise(request: AnaliseConformidadeRequest): string {
    const documentoSanitizado = sanitizeInput(request.documento)
    const tipoSanitizado = sanitizeInput(request.tipoDocumento)
    const evidenciasSanitizadas = (request.evidenciasNormativas ?? []).map((e) => ({
        chunkId: e.chunkId,
        normaCodigo: e.normaCodigo,
        secao: e.secao,
        conteudo: sanitizeInput(e.conteudo).slice(0, 1000),
        score: e.score,
        fonte: e.fonte,
    }))

    return `
ANÁLISE DE CONFORMIDADE SST - DOCUMENTO: ${tipoSanitizado}

DOCUMENTO PARA ANÁLISE:
${documentoSanitizado}

NORMAS APLICÁVEIS: ${request.normasAplicaveis?.join(', ') || 'NRs gerais'}

EVIDÊNCIAS NORMATIVAS LOCAIS (USE SOMENTE ESSAS COMO FONTE):
${JSON.stringify(evidenciasSanitizadas)}

INSTRUÇÕES:
1. Analise o documento APENAS com base nas evidências normativas locais fornecidas.
2. Identifique gaps de conformidade.
3. Se não houver gaps, o array "gaps" deve estar vazio.
4. MANDATÓRIO: Para cada gap, referencie o "chunkId" exato da evidência no campo "evidencias".
5. Responda APENAS com um objeto JSON válido, sem texto explicativo.

FORMATO:
{
  "score": 0 a 100,
  "nivelRisco": "baixo" | "medio" | "alto" | "critico",
  "gaps": [
    {
      "id": "gap_N",
      "descricao": "...",
      "severidade": "baixa" | "media" | "alta" | "critica",
      "categoria": "...",
      "recomendacao": "...",
      "prazo": "...",
      "evidencias": [ ... COPIE DO JSON DE EVIDENCIAS ... ]
    }
  ],
  "resumo": "...",
  "pontosPositivos": [],
  "pontosAtencao": [],
  "proximosPassos": []
}
`
}

function parsearRespostaAnalise(response: string): AnaliseConformidadeResponse {
    try {
        console.log(`\n[DEBUG] OLLAMA RESPONSE START >>>\n${response}\n<<< OLLAMA RESPONSE END`)
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('JSON não encontrado')

        const parsed = JSON.parse(jsonMatch[0])
        return AnaliseConformidadeResponseSchema.parse(parsed) as AnaliseConformidadeResponse
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error(`[DEBUG] Zod Ollama Error:`, JSON.stringify(error.issues, null, 2))
        }
        throw error
    }
}
