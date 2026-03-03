'use client'

import { useState, useRef, useEffect, useCallback, useMemo, type ChangeEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowUp, ArrowDown, Trash2, Loader2, Paperclip, Bot, AudioLines, ChevronDown } from 'lucide-react'
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

type ChatComposerControlState = 'enabled' | 'disabled-coming-soon'

interface ChatComposerAction {
    id: 'attach' | 'model' | 'voice'
    label: string
    icon: LucideIcon
    state: ChatComposerControlState
    trailingIcon?: LucideIcon
}

const COMPOSER_ACTIONS: ChatComposerAction[] = [
    { id: 'attach', label: 'Anexar', icon: Paperclip, state: 'enabled' },
    { id: 'model', label: 'Modelo padrão', icon: Bot, state: 'disabled-coming-soon', trailingIcon: ChevronDown },
    { id: 'voice', label: 'Voz', icon: AudioLines, state: 'disabled-coming-soon' },
]

export function ChatInterface() {
    const { documentContext, documentName, contextoTela, setDocumentContext, setDocumentName } = useChatContext()
    const [forceFreeMode, setForceFreeMode] = useState(false)
    const [isExtractingContext, setIsExtractingContext] = useState(false)
    const hasDocumentContext = Boolean(documentContext && documentContext.trim().length > 0)
    const isGrounded = hasDocumentContext && !forceFreeMode

    const welcomeMsg = useMemo(
        () => (isGrounded ? getWelcomeGrounded(documentName) : getWelcomeFree(contextoTela)),
        [contextoTela, documentName, isGrounded],
    )

    const [messages, setMessages] = useState<Message[]>([welcomeMsg])
    const [input, setInput] = useState('')
    const [chatStatus, setChatStatus] = useState<'idle' | TypingPhase>('idle')
    const [showScrollBtn, setShowScrollBtn] = useState(false)
    const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const STORAGE_KEY = `sgn-chat-history-${isGrounded ? 'grounded' : 'free'}`

    const scrollRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const isNearBottomRef = useRef(true)
    const prefersReducedMotion = useReducedMotion()

    useEffect(() => {
        const saved = loadChatHistory(STORAGE_KEY)
        setMessages(saved.length > 0 ? saved : [welcomeMsg])
        setInput('')
        setChatStatus('idle')
        isNearBottomRef.current = true
        if (thinkingTimerRef.current) {
            clearTimeout(thinkingTimerRef.current)
            thinkingTimerRef.current = null
        }
    }, [STORAGE_KEY, welcomeMsg])

    useEffect(() => {
        if (messages.length > 0) {
            saveChatHistory(STORAGE_KEY, messages)
        }
    }, [messages, STORAGE_KEY])

    useEffect(() => () => {
        if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current)
    }, [])

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
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
        textareaRef.current.style.height = '48px'
        const scrollH = textareaRef.current.scrollHeight
        textareaRef.current.style.height = `${Math.min(scrollH, 140)}px`
    }, [input])

    const handleAttachFile = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return

        setIsExtractingContext(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/extrair-texto', {
                method: 'POST',
                body: formData,
            })

            const payload = await res.json() as {
                success?: boolean
                message?: string
                data?: { texto?: string; nomeArquivo?: string }
                details?: string
            }

            if (!res.ok || !payload?.success || !payload.data?.texto) {
                throw new Error(payload?.details || payload?.message || `Erro HTTP ${res.status}`)
            }

            setDocumentContext(payload.data.texto)
            setDocumentName(payload.data.nomeArquivo || file.name)
            setForceFreeMode(false)
            setInput('')
        } catch (error) {
            const aiMsg: Message = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: `Falha ao anexar documento no chat: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
                timestamp: new Date(),
                isError: true,
            }
            setMessages(prev => [...prev, aiMsg])
        } finally {
            setIsExtractingContext(false)
        }
    }, [setDocumentContext, setDocumentName])

    const handleComposerAction = useCallback((actionId: ChatComposerAction['id'], isDisabled: boolean) => {
        if (isDisabled) return
        if (actionId === 'attach') {
            fileInputRef.current?.click()
        }
    }, [])

    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim()
        if (!trimmed || chatStatus !== 'idle' || isExtractingContext) return

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

            if (!res.ok) {
                const errPayload = await res.json().catch(() => ({})) as { error?: string; details?: string }
                const msg = errPayload?.error || errPayload?.details || `Erro HTTP ${res.status}`
                throw new Error(msg)
            }

            if (!res.body) {
                throw new Error('Resposta sem corpo do servidor')
            }

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let sseBuffer = ''
            let partial = ''
            let receivedToken = false
            let streamDone = false

            while (!streamDone) {
                const { done, value } = await reader.read()
                if (done) break

                sseBuffer += decoder.decode(value, { stream: true })
                const lines = sseBuffer.split('\n')
                sseBuffer = lines.pop() ?? ''

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue
                    const payload = line.slice(6).trim()
                    if (payload === '[DONE]') {
                        streamDone = true
                        break
                    }
                    try {
                        const { text: token } = JSON.parse(payload) as { text: string }
                        if (!token) continue

                        if (!receivedToken) {
                            receivedToken = true
                            if (thinkingTimerRef.current) {
                                clearTimeout(thinkingTimerRef.current)
                                thinkingTimerRef.current = null
                            }
                            setChatStatus('writing')
                        }

                        partial += token
                        setMessages(prev => updateLastAssistantMessage(prev, partial))
                        if (isNearBottomRef.current) scrollToBottom()
                    } catch {
                        // chunk malformado: ignora
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
            if (thinkingTimerRef.current) {
                clearTimeout(thinkingTimerRef.current)
                thinkingTimerRef.current = null
            }
            setChatStatus('idle')
        }

    }, [documentContext, chatStatus, isExtractingContext, messages, scrollToBottom])

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
            setChatStatus('idle')
            textareaRef.current?.focus()
        }
    }

    const handleSend = () => {
        if (isExtractingContext) return
        sendMessage(input)
    }
    const handleSuggestionSelect = (text: string) => sendMessage(text)
    const isProcessing = chatStatus !== 'idle'
    const isBusy = isProcessing || isExtractingContext
    const showSuggestions = messages.length === 1 && !isBusy
    const canSend = input.trim().length > 0 && !isBusy
    const canToggleMode = hasDocumentContext
    const renderedMessages = showSuggestions
        ? messages.filter((msg) => msg.id !== 'welcome')
        : messages

    return (
        <div className="flex flex-col h-full min-h-0 overflow-hidden relative bg-gradient-to-b from-white/50 to-slate-100/70 dark:from-[#0d1117] dark:to-[#0a0f15]">
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleAttachFile}
            />

            {/* Header / Clear Actions */}
            {messages.length > 1 && (
                <div className="absolute top-3 right-4 z-10">
                    <button
                        onClick={handleClearChat}
                        className="p-1.5 text-slate-400 hover:text-sgn-danger-500 hover:bg-sgn-danger-50 dark:hover:bg-sgn-danger-950/20 rounded-lg transition-colors"
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
                className="flex-1 min-h-0 h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 sm:px-6 py-5 pb-8 space-y-5 mt-1 chat-messages-scroll"
            >
                {showSuggestions && (
                        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/70 dark:border-white/[0.12] bg-white/80 dark:bg-[#121822] px-4 py-4 sm:px-5 sm:py-5 shadow-sm">
                        <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-sgn-primary-600 dark:text-sgn-primary-300 mb-3">
                            NEX pronto para ajudar
                        </p>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                            {isGrounded ? 'Análise guiada pelo documento carregado' : 'Consultoria rápida em SST e NRs'}
                        </h4>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {isGrounded
                                ? 'Faça perguntas objetivas para identificar gaps, obrigações não atendidas e ações prioritárias.'
                                : 'Use os atalhos abaixo para iniciar. Posso explicar normas, responsabilidades e boas práticas operacionais.'}
                        </p>
                        <ChatSuggestions onSelect={handleSuggestionSelect} />
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {renderedMessages.map((msg) => (
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
            </div>

            {/* Scroll to bottom */}
            {showScrollBtn && (
                <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-10">
                    <button
                        onClick={scrollToBottom}
                        className="p-1.5 bg-white/95 dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.1] rounded-full shadow-md hover:shadow-lg transition-shadow"
                        aria-label="Rolar para o fim"
                    >
                        <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                </div>
            )}

            {/* Input area */}
            <div className="px-3 sm:px-4 pb-3 pt-2 shrink-0 border-t border-slate-200/70 dark:border-white/[0.08] bg-white/75 dark:bg-[#0f1520]">
                <div className="relative bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-white/[0.09] rounded-2xl shadow-sm focus-within:border-sgn-primary-300 dark:focus-within:border-sgn-primary-500/40 focus-within:shadow-md transition-all">
                    <textarea
                        ref={textareaRef}
                        autoFocus
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSend()
                            }
                        }}
                        disabled={isBusy}
                        placeholder={isGrounded ? 'Pergunte sobre o documento...' : 'Pergunte sobre SST e NRs...'}
                        aria-label="Mensagem para o assistente"
                        className={cn(
                            'w-full bg-transparent py-3 px-4 text-sm',
                            'focus:outline-none resize-none',
                            'text-slate-800 dark:text-slate-100',
                            'disabled:opacity-50',
                            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                        )}
                        style={{ minHeight: '48px', maxHeight: '140px' }}
                        rows={1}
                    />

                    <div className="flex items-center justify-between gap-2 px-3.5 pb-3 pt-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {COMPOSER_ACTIONS.map((action) => {
                                const Icon = action.icon
                                const TrailingIcon = action.trailingIcon
                                const isDisabled = action.state !== 'enabled'
                                const actionLabel = isDisabled ? `${action.label} (em breve)` : action.label

                                return (
                                    <button
                                        key={action.id}
                                        type="button"
                                        data-testid={`chat-action-${action.id}`}
                                        aria-disabled={isDisabled}
                                        title={actionLabel}
                                        onClick={() => handleComposerAction(action.id, isDisabled)}
                                        className={cn(
                                            'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                                            isDisabled
                                                ? 'cursor-not-allowed border-slate-200/90 dark:border-white/[0.09] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/[0.02]'
                                                : 'border-slate-300 text-slate-700 hover:bg-slate-100',
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        <span>{action.label}</span>
                                        {TrailingIcon ? <TrailingIcon className="h-3 w-3 opacity-80" /> : null}
                                    </button>
                                )
                            })}
                            <button
                                type="button"
                                data-testid="chat-action-mode"
                                aria-pressed={forceFreeMode}
                                disabled={!canToggleMode}
                                title={canToggleMode ? 'Alternar entre modo grounded e modo livre' : 'Modo livre disponível após anexar documento'}
                                onClick={() => {
                                    if (!canToggleMode) return
                                    setForceFreeMode(prev => !prev)
                                }}
                                className={cn(
                                    'inline-flex items-center gap-1.5 text-xs font-medium select-none rounded-full px-2.5 py-1 border transition-colors',
                                    !canToggleMode
                                        ? 'cursor-not-allowed border-slate-200/90 dark:border-white/[0.09] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/[0.02]'
                                        : isGrounded
                                            ? 'text-sgn-primary-600 dark:text-sgn-primary-300 border-sgn-primary-200 dark:border-sgn-primary-800/70 bg-sgn-primary-50/70 dark:bg-sgn-primary-900/20 hover:bg-sgn-primary-100/70 dark:hover:bg-sgn-primary-900/35'
                                            : 'text-slate-500 dark:text-slate-300 border-slate-200 dark:border-white/[0.1] bg-slate-100/60 dark:bg-white/[0.02] hover:bg-slate-200/70 dark:hover:bg-white/[0.07]'
                                )}
                            >
                                <span className={cn(
                                    'w-1.5 h-1.5 rounded-full inline-block',
                                    isGrounded ? 'bg-sgn-primary-500 dark:bg-sgn-primary-300' : 'bg-slate-400 dark:bg-slate-500'
                                )} />
                                {isGrounded
                                    ? `Grounded${documentName ? ` · ${documentName.slice(0, 24)}${documentName.length > 24 ? '…' : ''}` : ''}`
                                    : 'Modo livre'}
                            </button>
                        </div>

                        {isBusy && (
                            <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500">
                                {isExtractingContext ? 'Extraindo documento...' : 'NEX processando...'}
                            </span>
                        )}

                        <button
                            onClick={handleSend}
                            disabled={!canSend}
                            aria-label={isProcessing ? 'Processando...' : 'Enviar mensagem'}
                            className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                                canSend
                                    ? 'bg-sgn-primary-600 text-white hover:bg-sgn-primary-700 shadow-sm active:scale-[0.98]'
                                    : 'bg-slate-100 dark:bg-white/[0.06] text-slate-300 dark:text-slate-600 cursor-not-allowed'
                            )}
                        >
                            {isProcessing
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <ArrowUp className="w-4 h-4" />}
                            <span>Enviar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
