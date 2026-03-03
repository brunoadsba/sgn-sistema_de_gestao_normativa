import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions'

type ChatMessage = ChatCompletionMessageParam

function buildGroundedPrompt(safeContext: string, systemPromptBase: string): string {
    return `${systemPromptBase}
Voce auxilia um engenheiro/auditor somente com base no contexto abaixo.

===== CONTEXTO DO DOCUMENTO =====
${safeContext}
=================================

REGRAS ABSOLUTAS (AJA COMO AUDITOR FORENSE):
1. Sua ÚNICA fonte de verdade é o contexto do documento acima.
2. NUNCA invente, presuma ou deduza informações que não estejam EXPLICITAMENTE escritas.
3. Se a informação solicitada não estiver no documento, declare: "Não há dados sobre isso no documento avaliado."
4. Responda em Português Brasileiro, de forma direta, técnica e estritamente baseada no Lastro Documental.`
}

const FREE_PROMPT = `Você é o NEX, assistente especialista em Segurança e Saúde do Trabalho (SST) e Normas Regulamentadoras (NRs) brasileiras do SGN - Sistema de Gestão Normativa.

MODO LIVRE (sem documento carregado):
1. Responda perguntas gerais sobre NRs, SST, compliance, EPIs, CIPA, PCMSO, PGR e temas correlatos.
2. Use seu conhecimento técnico para orientar, mas deixe claro que são orientações gerais e não substituem análise documental.
3. Se o usuário perguntar algo que exige análise de um documento específico, oriente-o a fazer upload do documento para uma análise precisa.
4. Responda em Português Brasileiro, de forma direta, técnica e acessível.
5. Seja útil e proativo em sugerir próximos passos quando pertinente.`

export function buildSystemPrompt(
    hasDocument: boolean,
    documentContext: string | undefined,
    systemPromptBase: string,
): string {
    if (!hasDocument || !documentContext) return FREE_PROMPT
    const safeContext = documentContext.slice(0, 80000)
    return buildGroundedPrompt(safeContext, systemPromptBase)
}

export function normalizarMensagem(valor: unknown): ChatMessage | null {
    if (!valor || typeof valor !== 'object') return null
    const role = (valor as { role?: unknown }).role
    const content = (valor as { content?: unknown }).content
    if ((role !== 'user' && role !== 'assistant' && role !== 'system') || typeof content !== 'string') {
        return null
    }
    return { role, content: content.trim() }
}
