'use client'

import { useState } from 'react'
import { MessageSquare, X, Minus, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatInterface } from './ChatInterface'

interface ChatFloatingBubbleProps {
    documentContext?: string | null
}

export function ChatFloatingBubble({ documentContext }: ChatFloatingBubbleProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay para focus */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Container do Chat */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 0, x: '-50%', transformOrigin: 'center center' }}
                            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
                            exit={{ opacity: 0, scale: 0.9, y: '-50%', x: '-50%' }}
                            className="fixed top-1/2 left-1/2 w-[95vw] sm:w-[85vw] md:w-[80vw] h-[90vh] sm:h-[85vh] md:h-[80vh] bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] dark:shadow-indigo-500/10 border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col z-[100]"
                        >
                            {/* Header Premium */}
                            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between border-b border-white/10 shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white/20 rounded-2xl shadow-inner backdrop-blur-md">
                                        <MessageSquare className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-tight leading-tight">Consultoria Neural</h4>
                                        <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest mt-0.5">Chat com Documento</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-hidden relative">
                                <ChatInterface documentContext={documentContext} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="fixed bottom-6 right-6 z-[100] no-print">

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform outline-none focus:outline-none ${isOpen ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl' : 'bg-transparent text-white hover:scale-110 hover:shadow-indigo-500/30'
                        }`}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                className="flex items-center justify-center w-full h-full text-white"
                            >
                                <Minus className="w-8 h-8" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                className="flex items-center justify-center w-full h-full bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full"
                            >
                                <Bot className="w-8 h-8 text-white" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </>
    )
}
