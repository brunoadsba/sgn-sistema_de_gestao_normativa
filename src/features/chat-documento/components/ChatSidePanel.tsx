'use client'

import { MessageSquare, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatInterface } from './ChatInterface'

interface ChatSidePanelProps {
    isOpen: boolean
    onClose: () => void
    documentContext?: string | null
}

export function ChatSidePanel({ isOpen, onClose, documentContext }: ChatSidePanelProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-[90] lg:hidden"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white dark:bg-gray-950 shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.5)] z-[100] border-l border-gray-100 dark:border-white/10 flex flex-col no-print"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/40">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-gray-100">Consultoria Neural</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Interação em Tempo Real • Fonte Única</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden relative">
                            <ChatInterface documentContext={documentContext} />
                        </div>

                        {/* Stats/Footer */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Agente Conectado
                            </span>
                            <span>Model: Llama 3.3 70B</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
