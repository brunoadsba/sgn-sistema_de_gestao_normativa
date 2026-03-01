'use client'

import { useState } from 'react'
import { Copy, Check, AlertTriangle, RotateCcw, Bot } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

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
        await navigator.clipboard.writeText(message.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const motionProps = prefersReducedMotion
        ? {}
        : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.15 } }

    if (isUser) {
        return (
            <motion.div {...motionProps} className="flex justify-end">
                <div className="max-w-[85%] px-4 py-2.5 bg-indigo-600 text-white rounded-2xl rounded-br-md text-sm leading-relaxed">
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            {...motionProps}
            className="group flex gap-3 px-2"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Bot className="w-5 h-5 text-white/90" />
            </div>

            <div className="flex-1 min-w-0">
                <div className={cn(
                    'text-sm leading-relaxed',
                    isError
                        ? 'p-3 bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 rounded-xl text-red-700 dark:text-red-300'
                        : 'text-gray-800 dark:text-gray-200'
                )}>
                    {isError && (
                        <div className="flex items-center gap-2 mb-1.5 text-red-500 dark:text-red-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Erro na análise</span>
                        </div>
                    )}

                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-p:leading-relaxed prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-pre:my-2 prose-pre:bg-gray-900 prose-pre:dark:bg-gray-800 prose-code:text-xs prose-code:bg-gray-100 prose-code:dark:bg-white/[0.06] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-strong:text-gray-900 prose-strong:dark:text-white">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Actions toolbar */}
                <div className={cn(
                    'flex items-center gap-1 mt-2 transition-opacity duration-150',
                    hovered ? 'opacity-100' : 'opacity-0'
                )}>
                    {!isError && (
                        <button
                            onClick={handleCopy}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors flex items-center gap-1.5"
                            aria-label="Copiar resposta"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    )}

                    {isError && onRetry && (
                        <button
                            onClick={onRetry}
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border border-transparent hover:border-red-200/50"
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
