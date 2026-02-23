import { NextRequest, NextResponse } from 'next/server'
import { groq } from '@/lib/ia/groq'
import { iaLogger } from '@/lib/logger'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { messages, documentContext } = body

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ success: false, error: 'O array de mensagens é obrigatório' }, { status: 400 })
        }

        if (!documentContext) {
            return NextResponse.json({ success: false, error: 'Nenhum contexto de documento fornecido' }, { status: 400 })
        }

        // Preparamos as mensagens para o LLM. 
        // Adicionamos no início o System Prompt com o documento atual anexado como contexto de verdade.
        const systemPrompt = `Você é um Consultor Sênior de Saúde e Segurança do Trabalho (SST) chamado "Consultoria Neural SGN".
Você está interagindo diretamente com um usuário analisando um documento específico dele. 
Responda sempre em Português de forma profissional.
NÃO MENCIONE explicitamente que você é uma IA, ou que está lendo um texto; aja como o especialista que já revisou a matéria.

===== CONTEXTO DO DOCUMENTO =====
${documentContext.slice(0, 100000)} // Limitando o tamanho do documento para n estourar
=================================

Responda baseando-se estritamente no documento fornecido acima. Se a resposta não estiver no documento, avise o usuário explicitamente. Caso o usuário pareça confuso, forneça exemplos que ele poderia extrair do próprio texto.`

        const groqMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ]

        // Invoca LLM (podemos usar llama-3.3-70b-versatile, que é o mestre atual)
        const response = await groq.chat.completions.create({
            messages: groqMessages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3, // Temperatura baixa para respostas baseadas em documento
            max_tokens: 2048
        })

        const reply = response.choices?.[0]?.message?.content || 'Não consegui processar a resposta.'

        return NextResponse.json({
            success: true,
            reply
        })

    } catch (error) {
        iaLogger.error({ error }, 'Erro no chat de documento')
        return NextResponse.json({ success: false, error: 'Erro interno ao processar chat' }, { status: 500 })
    }
}
