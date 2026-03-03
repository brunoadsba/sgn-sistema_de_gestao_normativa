import type { Message } from '../components/ChatMessageBubble'

const TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 dias em milissegundos

interface StorageEnvelope {
    savedAt: number
    messages: Message[]
}

function isExpired(savedAt: number): boolean {
    return Date.now() - savedAt > TTL_MS
}

export function loadChatHistory(storageKey: string): Message[] {
    try {
        const raw = window.localStorage.getItem(storageKey)
        if (!raw) return []

        const envelope: StorageEnvelope = JSON.parse(raw)

        if (isExpired(envelope.savedAt)) {
            window.localStorage.removeItem(storageKey)
            return []
        }

        return envelope.messages.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
        }))
    } catch {
        return []
    }
}

export function saveChatHistory(storageKey: string, messages: Message[]): void {
    try {
        const envelope: StorageEnvelope = {
            savedAt: Date.now(),
            messages,
        }
        window.localStorage.setItem(storageKey, JSON.stringify(envelope))
    } catch {
        // quota excedida ou modo privado — falha silenciosa
    }
}

export function clearChatHistory(storageKey: string): void {
    try {
        window.localStorage.removeItem(storageKey)
    } catch {
        // falha silenciosa
    }
}

/** Retorna a data de expiração do histórico salvo, ou null se não existir. */
export function getChatHistoryExpiry(storageKey: string): Date | null {
    try {
        const raw = window.localStorage.getItem(storageKey)
        if (!raw) return null

        const envelope: StorageEnvelope = JSON.parse(raw)
        return new Date(envelope.savedAt + TTL_MS)
    } catch {
        return null
    }
}
