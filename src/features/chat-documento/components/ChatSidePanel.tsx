'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ArrowLeft, Shield, Zap, Sparkles } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChatInterface } from './ChatInterface'
import { useChatContext } from '../context/ChatContext'

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ')

function getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
        if (element.getAttribute('aria-hidden') === 'true') return false
        if (element.getAttribute('aria-disabled') === 'true') return true
        return !element.hasAttribute('disabled') && (element.offsetParent !== null || element === document.activeElement)
    })
}

export function ChatSidePanel() {
    const { isOpen, closeChat, documentContext, documentName } = useChatContext()
    const prefersReducedMotion = useReducedMotion()
    const modalRef = useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = useState(false)
    const isGrounded = Boolean(documentContext && documentContext.trim().length > 0)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            closeChat()
            return
        }

        if (e.key !== 'Tab' || !modalRef.current) return
        const focusable = getFocusableElements(modalRef.current)
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
            return
        }

        if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
        }
    }, [closeChat])

    useEffect(() => {
        if (!isOpen) return
        document.body.classList.add('chat-panel-open')

        const isDesktop = window.matchMedia('(min-width: 1024px)').matches
        const prevOverflow = document.body.style.overflow
        if (!isDesktop) {
            document.body.style.overflow = 'hidden'
        }

        const focusInput = window.setTimeout(() => {
            const root = modalRef.current
            if (!root) return

            const textarea = root.querySelector<HTMLTextAreaElement>('textarea[aria-label="Mensagem para o assistente"]')
            if (textarea) {
                textarea.focus()
                return
            }

            const focusable = getFocusableElements(root)
            focusable[0]?.focus()
        }, 40)

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            window.clearTimeout(focusInput)
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = prevOverflow
            document.body.classList.remove('chat-panel-open')
        }
    }, [isOpen, handleKeyDown])

    useEffect(() => {
        if (!isOpen) {
            document.body.classList.remove('chat-panel-open')
        }
    }, [isOpen])

    const springTransition = prefersReducedMotion
        ? { duration: 0 }
        : { type: 'spring' as const, damping: 28, stiffness: 260 }

    const fadeProps = prefersReducedMotion
        ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }

    const portalContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        {...fadeProps}
                        onClick={closeChat}
                        className="fixed inset-0 bg-slate-950 z-[9998]"
                        aria-hidden="true"
                    />

                    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center lg:items-start justify-center lg:justify-end p-0 sm:p-6 lg:p-0 lg:pt-16 pointer-events-none">
                        <motion.div
                            ref={modalRef}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={springTransition}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Assistente NEX"
                            className="w-full h-[100dvh] sm:h-[min(88vh,820px)] lg:h-[calc(100vh-4rem)] sm:max-w-[920px] lg:w-[460px] lg:max-w-none lg:rounded-none bg-gradient-to-b from-slate-100 to-slate-50 dark:from-[#0f131a] dark:to-[#0a0f15] flex flex-col no-print shadow-2xl lg:shadow-xl sm:rounded-3xl lg:border-l sm:border border-white/50 dark:border-white/[0.09] overflow-hidden pointer-events-auto"
                        >
                            {/* Header */}
                            <div className="px-4 sm:px-5 py-3 flex items-center justify-between bg-white/95 dark:bg-[#121822] border-b border-slate-200/70 dark:border-white/[0.07] shrink-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <button
                                        onClick={closeChat}
                                        className="sm:hidden p-1.5 -ml-1 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors text-slate-500 dark:text-slate-300"
                                        aria-label="Voltar"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>

                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sgn-primary-500 to-sgn-primary-700 flex items-center justify-center shrink-0 shadow-md shadow-sgn-primary-900/25">
                                        <Sparkles className="h-4 w-4 text-white" />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                                            NEX
                                        </h3>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`w-1.5 h-1.5 rounded-full ${isGrounded ? 'bg-sgn-success-500' : 'bg-sgn-warning-400'}`} />
                                            {documentName ? (
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-[320px]">
                                                    {documentName}
                                                </p>
                                            ) : (
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    Assistente SST
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/[0.12] bg-white/80 dark:bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-300">
                                        <Sparkles className="h-3 w-3" />
                                        {isGrounded ? 'Grounded' : 'Modo livre'}
                                    </span>
                                    <button
                                        onClick={closeChat}
                                        aria-label="Fechar assistente"
                                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Chat area */}
                            <div className="flex-1 min-h-0 overflow-hidden relative">
                                <ChatInterface />
                            </div>

                            {/* Footer */}
                            <div className="px-4 sm:px-5 py-2.5 bg-white/95 dark:bg-[#121822] border-t border-slate-200/70 dark:border-white/[0.07] flex items-center shrink-0">
                                <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                    {isGrounded ? (
                                        <>
                                            <Shield className="w-3 h-3" />
                                            Respostas baseadas no documento · Esc para fechar
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-3 h-3" />
                                            Modo livre · Esc para fechar
                                        </>
                                    )}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )

    if (!mounted || typeof document === 'undefined') return null

    return createPortal(portalContent, document.body, 'sgn-chat-nex-portal')
}
