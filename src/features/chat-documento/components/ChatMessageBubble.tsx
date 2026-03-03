'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, AlertTriangle, RotateCcw } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '../lib/chat-utils'

export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    isError?: boolean
}

interface ChatMessageBubbleProps {
    message: Message
    onRetry?: (() => void) | undefined
}

export function ChatMessageBubble({ message, onRetry }: ChatMessageBubbleProps) {
    const [copied, setCopied] = useState(false)
    const [hovered, setHovered] = useState(false)
    const prefersReducedMotion = useReducedMotion()

    const isUser = message.role === 'user'
    const isError = message.isError

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            setCopied(false)
        }
    }

    // Atualiza o timestamp a cada 30 s para que "agora" vire "há 1 minuto" etc.
    const [, setTick] = useState(0)
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 30_000)
        return () => clearInterval(id)
    }, [])

    const timeLabel = formatRelativeTime(message.timestamp)

    const motionProps = prefersReducedMotion
        ? {}
        : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.15 } }

    if (isUser) {
        return (
            <motion.div {...motionProps} className="flex flex-col items-end gap-0.5">
                <div className="max-w-[88%] sm:max-w-[78%] px-5 py-3.5 bg-gradient-to-b from-sgn-primary-600 to-sgn-primary-700 text-white rounded-2xl rounded-br-md text-sm leading-relaxed shadow-sm">
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 pr-1 select-none">
                    {timeLabel}
                </span>
            </motion.div>
        )
    }

    return (
        <motion.div
            {...motionProps}
            className="group flex px-1 sm:px-2"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="flex-1 min-w-0">
                <div className={cn(
                    'text-sm leading-relaxed rounded-2xl border px-5 py-4 shadow-[0_1px_0_0_rgba(15,23,42,0.03)]',
                    isError
                        ? 'bg-sgn-danger-50 dark:bg-sgn-danger-950/30 border-sgn-danger-200/80 dark:border-sgn-danger-800/40 text-sgn-danger-700 dark:text-sgn-danger-300'
                        : 'bg-white/80 dark:bg-[#121822] border-slate-200/80 dark:border-white/[0.10] text-slate-800 dark:text-slate-200'
                )}>
                    {isError && (
                        <div className="flex items-center gap-2 mb-1.5 text-sgn-danger-500 dark:text-sgn-danger-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Erro na análise</span>
                        </div>
                    )}

                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-li:leading-relaxed prose-headings:my-2 prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-pre:my-2 prose-pre:bg-slate-900 prose-pre:dark:bg-slate-950 prose-code:text-xs prose-code:bg-slate-100 prose-code:dark:bg-white/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-strong:text-slate-900 prose-strong:dark:text-white">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Actions toolbar — visível ao hover */}
                <div className={cn(
                    'flex items-center gap-1 mt-2 transition-opacity duration-150 opacity-100 md:opacity-0',
                    hovered ? 'md:opacity-100' : 'md:opacity-0'
                )}>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 select-none mr-1">
                        {timeLabel}
                    </span>

                    {!isError && (
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors flex items-center gap-1.5"
                            aria-label="Copiar resposta"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-sgn-success-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    )}

                    {isError && onRetry && (
                        <button
                            onClick={onRetry}
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-sgn-danger-500 hover:bg-sgn-danger-50 dark:hover:bg-sgn-danger-950/30 transition-colors border border-transparent hover:border-sgn-danger-200/50"
                            aria-label="Tentar novamente"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Tentar novamente
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
