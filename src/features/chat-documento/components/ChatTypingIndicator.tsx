'use client'

import { motion } from 'framer-motion'
import { BrainCircuit, PencilLine } from 'lucide-react'

export type TypingPhase = 'thinking' | 'writing'

interface ChatTypingIndicatorProps {
    phase: TypingPhase
}

const PHASE_CONFIG = {
    thinking: {
        icon: BrainCircuit,
        label: 'NEX está analisando o contexto',
    },
    writing: {
        icon: PencilLine,
        label: 'Redigindo resposta',
    },
} as const

export function ChatTypingIndicator({ phase }: ChatTypingIndicatorProps) {
    const { icon: Icon, label } = PHASE_CONFIG[phase]

    return (
        <div className="flex gap-3 px-2 py-3 w-full" aria-live="polite" aria-label={label}>
            {/* Avatar animado */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                <Icon className="w-5 h-5 text-white/90" />
                <motion.div
                    animate={{ y: ['100%', '-100%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
                />
            </div>

            {/* Label verbal + cursor */}
            <div className="flex items-center gap-1.5 py-1.5">
                <span className="text-sm text-gray-500 dark:text-gray-400 select-none">
                    {label}
                </span>
                <EllipsisAnimated />
            </div>
        </div>
    )
}

/** Ellipsis animado — 3 pontos que aparecem sequencialmente */
function EllipsisAnimated() {
    return (
        <span className="flex items-end gap-[2px] h-4 mb-[1px]" aria-hidden>
            {[0, 0.25, 0.5].map((delay, i) => (
                <motion.span
                    key={i}
                    className="w-[3px] h-[3px] rounded-full bg-indigo-400 dark:bg-indigo-500"
                    animate={{ opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
                    transition={{
                        repeat: Infinity,
                        duration: 1,
                        delay,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </span>
    )
}
