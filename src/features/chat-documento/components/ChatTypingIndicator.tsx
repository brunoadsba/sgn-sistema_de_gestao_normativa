'use client'

import { motion } from 'framer-motion'
import { BrainCircuit } from 'lucide-react'

export function ChatTypingIndicator() {
    return (
        <div className="flex gap-4 px-2 py-3 w-full" aria-live="polite">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                <BrainCircuit className="w-5 h-5 text-white/90" />
                <motion.div
                    animate={{ y: ['100%', '-100%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent"
                />
            </div>

            <div className="flex-1 space-y-3 py-1.5 max-w-[85%]">
                <motion.div
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="h-2 bg-gray-200 dark:bg-gray-700/60 rounded-full w-[90%]"
                />
                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                    className="h-2 bg-gray-200 dark:bg-gray-700/50 rounded-full w-full"
                />
                <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.4 }}
                    className="h-2 bg-gray-100 dark:bg-gray-800/60 rounded-full w-[60%]"
                />
            </div>
        </div>
    )
}
