'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface ChatContextType {
    isOpen: boolean
    toggleChat: () => void
    openChat: () => void
    closeChat: () => void

    documentContext: string | null | undefined
    setDocumentContext: (context: string | null | undefined) => void

    documentName: string | undefined
    setDocumentName: (name: string | undefined) => void

    contextoTela: string
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [documentContext, setDocumentContext] = useState<string | null | undefined>(null)
    const [documentName, setDocumentName] = useState<string | undefined>(undefined)
    const pathname = usePathname()

    // Determina contexto de tela com base no pathname
    const contextoTela = pathname === '/'
        ? 'Análise de Documento'
        : pathname.startsWith('/normas')
            ? 'Catálogo de Normas'
            : pathname.startsWith('/nr6')
                ? 'Análise NR-6'
                : 'SGN'

    const toggleChat = useCallback(() => setIsOpen(prev => !prev), [])
    const openChat = useCallback(() => setIsOpen(true), [])
    const closeChat = useCallback(() => setIsOpen(false), [])

    // Atalho global Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K (Mac) ou Ctrl+K (Windows)
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                toggleChat()
            }
            if (e.key === 'Escape') {
                closeChat()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [toggleChat, closeChat])

    return (
        <ChatContext.Provider
            value={{
                isOpen,
                toggleChat,
                openChat,
                closeChat,
                documentContext,
                setDocumentContext,
                documentName,
                setDocumentName,
                contextoTela,
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}

export function useChatContext() {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider')
    }
    return context
}
