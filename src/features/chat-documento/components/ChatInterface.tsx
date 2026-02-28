'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChatMessageBubble, type Message } from './ChatMessageBubble'
import { ChatTypingIndicator } from './ChatTypingIndicator'
import { ChatSuggestions } from './ChatSuggestions'
import { cn } from '@/lib/utils'

interface ChatInterfaceProps {
    documentContext?: string | null | undefined
}

const WELCOME_GROUNDED: Message = {
    id: 'welcome',
    role: 'assistant',
    content: 'Analisei o documento carregado. Pergunte sobre gaps, conformidade ou recomendações.',
    timestamp: new Date(),
}

const WELCOME_FREE: Message = {
    id: 'welcome',
    role: 'assistant',
    content: 'Posso ajudar com dúvidas sobre **Normas Regulamentadoras**, EPIs, compliance e segurança do trabalho. Para análise documental, faça upload de um arquivo.',
    timestamp: new Date(),
}

export function ChatInterface({ documentContext }: ChatInterfaceProps) {
    const isGrounded = Boolean(documentContext && documentContext.trim().length > 0)
    const [messages, setMessages] = useState<Message[]>([isGrounded ? WELCOME_GROUNDED : WELCOME_FREE])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [showScrollBtn, setShowScrollBtn] = useState(false)
    const prevGroundedRef = useRef(isGrounded)

    const scrollRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const isNearBottomRef = useRef(true)
    const prefersReducedMotion = useReducedMotion()

    useEffect(() => {
        if (prevGroundedRef.current !== isGrounded) {
            prevGroundedRef.current = isGrounded
            setMessages([isGrounded ? WELCOME_GROUNDED : WELCOME_FREE])
            setInput('')
        }
    }, [isGrounded])

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: prefersReducedMotion ? 'instant' : 'smooth',
            })
        }
    }, [prefersReducedMotion])

    const checkNearBottom = useCallback(() => {
        if (!scrollRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
        const nearBottom = scrollHeight - scrollTop - clientHeight < 100
        isNearBottomRef.current = nearBottom
        setShowScrollBtn(!nearBottom)
    }, [])

    useEffect(() => {
        if (isNearBottomRef.current) scrollToBottom()
        else setShowScrollBtn(true)
    }, [messages, isTyping, scrollToBottom])

    useEffect(() => {
        if (!textareaRef.current) return
        textareaRef.current.style.height = '24px'
        const scrollH = textareaRef.current.scrollHeight
        textareaRef.current.style.height = `${Math.min(scrollH, 140)}px`
    }, [input])

    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim()
        if (!trimmed || isTyping) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: trimmed,
            timestamp: new Date(),
        }

        const updatedMessages = [...messages, userMsg]
        setMessages(updatedMessages)
        setInput('')
        setIsTyping(true)
        isNearBottomRef.current = true

        try {
            const res = await fetch('/api/chat-documento', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
                    ...(documentContext ? { documentContext: documentContext.slice(0, 100000) } : {}),
                }),
            })

            const data = await res.json()
            const payload = data.data ?? data
            if (data.success && payload.reply) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: payload.reply,
                    timestamp: new Date(),
                }
                setMessages(prev => [...prev, aiMsg])
            } else {
                throw new Error(data.message || data.error || 'Erro ao comunicar com a IA')
            }
        } catch (error) {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Erro interno ao consultar o assistente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
                timestamp: new Date(),
                isError: true,
            }
            setMessages(prev => [...prev, aiMsg])
        } finally {
            setIsTyping(false)
        }
    }, [documentContext, isTyping, messages])

    const handleRetry = useCallback(() => {
        const lastUserIndex = messages.map(m => m.role).lastIndexOf('user')
        if (lastUserIndex === -1) return

        const lastUserContent = messages[lastUserIndex].content
        const cleaned = messages.filter((_, i) => i <= lastUserIndex).slice(0, -1)

        setMessages(cleaned)
        setTimeout(() => sendMessage(lastUserContent), 50)
    }, [messages, sendMessage])

    const handleSend = () => sendMessage(input)
    const handleSuggestionSelect = (text: string) => sendMessage(text)
    const showSuggestions = messages.length === 1 && !isTyping
    const canSend = input.trim().length > 0 && !isTyping

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div
                ref={scrollRef}
                onScroll={checkNearBottom}
                role="log"
                aria-live="polite"
                className="flex-1 overflow-y-auto px-4 py-5 space-y-5"
            >
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <ChatMessageBubble
                            key={msg.id}
                            message={msg}
                            onRetry={msg.isError ? handleRetry : undefined}
                        />
                    ))}
                </AnimatePresence>

                {isTyping && <ChatTypingIndicator />}

                {showSuggestions && (
                    <ChatSuggestions onSelect={handleSuggestionSelect} isGrounded={isGrounded} />
                )}
            </div>

            {/* Scroll to bottom */}
            {showScrollBtn && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
                    <button
                        onClick={scrollToBottom}
                        className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-md hover:shadow-lg transition-shadow"
                        aria-label="Rolar para o fim"
                    >
                        <ArrowDown className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                </div>
            )}

            {/* Input area */}
            <div className="px-3 pb-3 pt-2 shrink-0">
                <div className="relative bg-white dark:bg-white/[0.04] border border-gray-200/80 dark:border-white/[0.08] rounded-2xl shadow-sm focus-within:border-indigo-300 dark:focus-within:border-indigo-500/40 focus-within:shadow-md transition-all">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                        disabled={isTyping}
                        placeholder={isGrounded ? 'Pergunte sobre o documento...' : 'Pergunte sobre SST e NRs...'}
                        aria-label="Mensagem para o assistente"
                        className={cn(
                            'w-full bg-transparent py-3 pl-4 pr-12 text-sm',
                            'focus:outline-none resize-none',
                            'text-gray-800 dark:text-gray-100',
                            'disabled:opacity-50',
                            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                        )}
                        style={{ minHeight: '24px', maxHeight: '140px' }}
                        rows={1}
                    />

                    <button
                        onClick={handleSend}
                        disabled={!canSend}
                        aria-label="Enviar mensagem"
                        className={cn(
                            'absolute right-2 bottom-2 p-1.5 rounded-lg transition-all',
                            canSend
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-90'
                                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        )}
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
