'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const NEX_POPUP_NAME = 'sgn-nex-assistente'
const NEX_POPUP_FEATURES = 'width=480,height=800,scrollbars=yes,resizable=yes'

function openNexPopup() {
    if (typeof window === 'undefined') return
    const url = '/chat'
    const win = window.open(url, NEX_POPUP_NAME, NEX_POPUP_FEATURES)
    if (win) win.focus()
}

interface ChatContextType {
    openChat: () => void

    documentContext: string | null | undefined
    setDocumentContext: (context: string | null | undefined) => void

    documentName: string | undefined
    setDocumentName: (name: string | undefined) => void

    contextoTela: string
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [documentContext, setDocumentContext] = useState<string | null | undefined>(null)
    const [documentName, setDocumentName] = useState<string | undefined>(undefined)
    const pathname = usePathname()

    const contextoTela = pathname === '/'
        ? 'Análise de Documento'
        : pathname.startsWith('/normas')
            ? 'Catálogo de Normas'
            : pathname.startsWith('/nr6')
                ? 'Análise NR-6'
            : pathname === '/chat'
                ? 'Chat NEX'
                : 'SGN'

    const openChat = useCallback(openNexPopup, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                openNexPopup()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <ChatContext.Provider
            value={{
                openChat,
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
