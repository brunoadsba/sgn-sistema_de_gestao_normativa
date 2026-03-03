'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowUp, ArrowDown, Trash2, Loader2 } from 'lucide-react'
import { AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChatMessageBubble, type Message } from './ChatMessageBubble'
import { ChatTypingIndicator, type TypingPhase } from './ChatTypingIndicator'
import { ChatSuggestions } from './ChatSuggestions'
import { cn } from '@/lib/utils'
import { useChatContext } from '../context/ChatContext'
import { loadChatHistory, saveChatHistory, clearChatHistory } from '../lib/chat-storage'
import { updateLastAssistantMessage } from '../lib/chat-utils'

const getWelcomeGrounded = (documentName?: string): Message => ({
    id: 'welcome',
    role: 'assistant',
    content: documentName
        ? `Identifiquei que você carregou o documento **${documentName}**. Quer que eu verifique gaps de conformidade ou sugira recomendações?`
        : 'Analisei o documento carregado. Pergunte sobre gaps, conformidade ou recomendações.',
    timestamp: new Date(),
})

const getWelcomeFree = (contextoTela?: string): Message => ({
    id: 'welcome',
    role: 'assistant',
    content: contextoTela === 'Catálogo de Normas'
        ? 'Estou pronto para tirar dúvidas sobre as **Normas Regulamentadoras**. Você pode me perguntar sobre itens específicos, penalidades ou histórico de alterações.'
        : 'Posso ajudar com dúvidas sobre **Normas Regulamentadoras**, EPIs, compliance e segurança do trabalho. Para análise documental, faça upload de um arquivo.',
    timestamp: new Date(),
})

export function ChatInterface() {
    const { documentContext, documentName, contextoTela } = useChatContext()
    const isGrounded = Boolean(documentContext && documentContext.trim().length > 0)

    // Calcula as mensagens dinâmicas
    const welcomeMsg = isGrounded ? getWelcomeGrounded(documentName) : getWelcomeFree(contextoTela)

    const [messages, setMessages] = useState<Message[]>([welcomeMsg])
    const [input, setInput] = useState('')
    const [chatStatus, setChatStatus] = useState<'idle' | TypingPhase>('idle')
    const [showScrollBtn, setShowScrollBtn] = useState(false)
    const prevGroundedRef = useRef(isGrounded)
    const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const prevContextoRef = useRef(contextoTela)
    const STORAGE_KEY = `sgn-chat-history-${isGrounded ? 'grounded' : 'free'}`

    // Carregar histórico inicial do localStorage com TTL de 30 dias
    useEffect(() => {
        const saved = loadChatHistory(STORAGE_KEY)
        if (saved.length > 0) {
            setMessages(saved)
        }
    }, [STORAGE_KEY])

    // Salvar histórico no localStorage (envelope com TTL = 30 dias)
    useEffect(() => {
        if (messages.length > 0) {
            saveChatHistory(STORAGE_KEY, messages)
        }
    }, [messages, STORAGE_KEY])

    const scrollRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const isNearBottomRef = useRef(true)
    const prefersReducedMotion = useReducedMotion()

    useEffect(() => {
        if (prevGroundedRef.current !== isGrounded || prevContextoRef.current !== contextoTela) {
            prevGroundedRef.current = isGrounded
            prevContextoRef.current = contextoTela
            setMessages([isGrounded ? getWelcomeGrounded(documentName) : getWelcomeFree(contextoTela)])
            setInput('')
        }
    }, [isGrounded, contextoTela, documentName])

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
    }, [messages, chatStatus, scrollToBottom])

    useEffect(() => {
        if (!textareaRef.current) return
        textareaRef.current.style.height = '24px'
        const scrollH = textareaRef.current.scrollHeight
        textareaRef.current.style.height = `${Math.min(scrollH, 140)}px`
    }, [input])

    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim()
        if (!trimmed || chatStatus !== 'idle') return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: trimmed,
            timestamp: new Date(),
        }

        const updatedMessages = [...messages, userMsg]
        setMessages(updatedMessages)
        setInput('')
        setChatStatus('thinking')
        isNearBottomRef.current = true

        // Após 1,2 s sem primeiro token, muda para 'writing'
        thinkingTimerRef.current = setTimeout(() => setChatStatus('writing'), 1200)

        try {
            const res = await fetch('/api/chat-documento', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
                    ...(documentContext ? { documentContext: documentContext.slice(0, 100000) } : {}),
                }),
            })

            if (!res.ok || !res.body) {
                throw new Error(`Erro HTTP ${res.status}`)
            }

            // Primeiro token chegou — cancela o timer de thinking
            if (thinkingTimerRef.current) {
                clearTimeout(thinkingTimerRef.current)
                thinkingTimerRef.current = null
            }
            setChatStatus('writing')

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let sseBuffer = ''
            let partial = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                sseBuffer += decoder.decode(value, { stream: true })
                const lines = sseBuffer.split('\n')
                sseBuffer = lines.pop() ?? ''

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue
                    const payload = line.slice(6).trim()
                    if (payload === '[DONE]') break
                    try {
                        const { text: token } = JSON.parse(payload) as { text: string }
                        partial += token
                        setMessages(prev => updateLastAssistantMessage(prev, partial))
                        if (isNearBottomRef.current) scrollToBottom()
                    } catch {
                        // chunk malformado — ignora
                    }
                }
            }

            if (!partial) {
                throw new Error('Resposta vazia recebida do assistente')
            }
        } catch (error) {
            if (thinkingTimerRef.current) {
                clearTimeout(thinkingTimerRef.current)
                thinkingTimerRef.current = null
            }
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Erro interno ao consultar o assistente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
                timestamp: new Date(),
                isError: true,
            }
            setMessages(prev => [...prev, aiMsg])
        } finally {
            setChatStatus('idle')
        }

    }, [documentContext, chatStatus, messages, scrollToBottom])

    const handleRetry = useCallback(() => {
        if (chatStatus !== 'idle') return
        const lastUserIndex = messages.map(m => m.role).lastIndexOf('user')
        if (lastUserIndex === -1) return

        const lastUserContent = messages[lastUserIndex].content
        const cleaned = messages.filter((_, i) => i <= lastUserIndex).slice(0, -1)

        setMessages(cleaned)
        setTimeout(() => sendMessage(lastUserContent), 50)
    }, [chatStatus, messages, sendMessage])

    const handleClearChat = () => {
        if (confirm('Tem certeza que deseja apagar o histórico dessa conversa?')) {
            clearChatHistory(STORAGE_KEY)
            setMessages([welcomeMsg])
            setInput('')
        }
    }

    const handleSend = () => sendMessage(input)
    const handleSuggestionSelect = (text: string) => sendMessage(text)
    const isProcessing = chatStatus !== 'idle'
    const showSuggestions = messages.length === 1 && !isProcessing
    const canSend = input.trim().length > 0 && !isProcessing

    return (
        <div className="flex flex-col h-full min-h-0 relative">
            {/* Header / Clear Actions */}
            {messages.length > 1 && (
                <div className="absolute top-2 right-4 z-10">
                    <button
                        onClick={handleClearChat}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                        title="Limpar histórico da conversa"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Messages */}
            <div
                ref={scrollRef}
                onScroll={checkNearBottom}
                role="log"
                aria-live="polite"
                className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-5 mt-4"
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

                {isProcessing && (
                    <ChatTypingIndicator phase={chatStatus as TypingPhase} />
                )}

                {showSuggestions && (
                    <ChatSuggestions onSelect={handleSuggestionSelect} />
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
                        disabled={isProcessing}
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

                    {/* Badge de modo */}
                    <div className="flex items-center px-4 pb-2 pt-0">
                        <span className={cn(
                            'inline-flex items-center gap-1 text-[11px] font-medium select-none',
                            isGrounded
                                ? 'text-indigo-500 dark:text-indigo-400'
                                : 'text-gray-400 dark:text-gray-600'
                        )}>
                            <span className={cn(
                                'w-1.5 h-1.5 rounded-full inline-block',
                                isGrounded ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-gray-400 dark:bg-gray-600'
                            )} />
                            {isGrounded
                                ? `Grounded${documentName ? ` · ${documentName.slice(0, 30)}${documentName.length > 30 ? '…' : ''}` : ''}`
                                : 'Modo livre'}
                        </span>
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!canSend}
                        aria-label={isProcessing ? 'Processando...' : 'Enviar mensagem'}
                        className={cn(
                            'absolute right-2 bottom-8 p-1.5 rounded-lg transition-all',
                            canSend
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-90'
                                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        )}
                    >
                        {isProcessing
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <ArrowUp className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    )
}
