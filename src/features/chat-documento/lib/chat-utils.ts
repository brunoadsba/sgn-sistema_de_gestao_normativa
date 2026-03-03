import type { Message } from '../components/ChatMessageBubble'

/**
 * Substitui o conteúdo da última mensagem do assistente na lista,
 * ou adiciona uma nova se ainda não existir.
 * Usado durante o streaming para atualizar o texto token a token.
 */
export function updateLastAssistantMessage(
    messages: Message[],
    content: string,
): Message[] {
    const last = messages[messages.length - 1]

    if (last && last.role === 'assistant' && !last.isError) {
        return [
            ...messages.slice(0, -1),
            { ...last, content },
        ]
    }

    return [
        ...messages,
        {
            id: Date.now().toString(),
            role: 'assistant',
            content,
            timestamp: new Date(),
        },
    ]
}

const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

/**
 * Formata uma data como tempo relativo ao momento atual.
 * ex: "agora", "há 2 minutos", "há 1 hora"
 */
export function formatRelativeTime(date: Date): string {
    const diffMs = date.getTime() - Date.now()
    const diffSec = Math.round(diffMs / 1000)
    const diffMin = Math.round(diffSec / 60)
    const diffHour = Math.round(diffMin / 60)

    if (Math.abs(diffSec) < 30) return 'agora'
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour')
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

