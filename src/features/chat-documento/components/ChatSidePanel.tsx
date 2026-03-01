'use client'

import { useEffect, useCallback } from 'react'
import { X, ArrowLeft, Shield, Zap } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChatInterface } from './ChatInterface'
import { useChatContext } from '../context/ChatContext'

export function ChatSidePanel() {
    const { isOpen, closeChat, documentContext, documentName } = useChatContext()
    const prefersReducedMotion = useReducedMotion()
    const isGrounded = Boolean(documentContext && documentContext.trim().length > 0)

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') closeChat()
    }, [closeChat])

    useEffect(() => {
        if (!isOpen) return
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, handleKeyDown])

    const springTransition = prefersReducedMotion
        ? { duration: 0 }
        : { type: 'spring' as const, damping: 28, stiffness: 260 }

    const fadeProps = prefersReducedMotion
        ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            {...fadeProps}
                            onClick={closeChat}
                            className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[2px] z-sgn-overlay sm:hidden block"
                            aria-hidden="true"
                        />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={springTransition}
                            role="dialog"
                            aria-label="Assistente NEX"
                            className="fixed top-[3.5rem] sm:top-[4rem] right-0 bottom-0 w-full sm:w-[460px] bg-gray-50 dark:bg-[#0a0a0f] z-sgn-tooltip flex flex-col no-print shadow-2xl border-l border-gray-200/60 dark:border-white/[0.06]"
                        >
                            {/* Header */}
                            <div className="px-4 py-3 flex items-center justify-between bg-white dark:bg-[#111118] border-b border-gray-200/60 dark:border-white/[0.06] shrink-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <button
                                        onClick={closeChat}
                                        className="sm:hidden p-1.5 -ml-1 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                                        aria-label="Voltar"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>

                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                                        <span className="text-white text-xs font-bold">N</span>
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                                            NEX
                                        </h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${isGrounded ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                                            {documentName ? (
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-[280px]">
                                                    {documentName}
                                                </p>
                                            ) : (
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    Assistente SST
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={closeChat}
                                    aria-label="Fechar assistente"
                                    className="hidden sm:flex p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Chat area */}
                            <div className="flex-1 overflow-hidden relative">
                                <ChatInterface />
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2 bg-white dark:bg-[#111118] border-t border-gray-200/60 dark:border-white/[0.06] flex items-center justify-between shrink-0">
                                <span className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
                                    {isGrounded ? (
                                        <>
                                            <Shield className="w-3 h-3" />
                                            Respostas baseadas no documento
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-3 h-3" />
                                            Modo livre
                                        </>
                                    )}
                                </span>
                                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                    Esc para fechar
                                </span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </>
    )
}
