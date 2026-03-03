'use client'

import { motion, useReducedMotion } from 'framer-motion'
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
    const prefersReducedMotion = useReducedMotion()
    const { icon: PhaseIcon, label } = PHASE_CONFIG[phase]

    return (
        <div className="flex px-1 sm:px-2 py-3 w-full" aria-live="polite" aria-label={label}>
            <div className="flex items-center gap-1.5 py-1.5">
                <PhaseIcon className="w-3.5 h-3.5 text-sgn-primary-500 dark:text-sgn-primary-400" />
                <span className="text-sm text-slate-500 dark:text-slate-400 select-none">
                    {label}
                </span>
                <EllipsisAnimated reducedMotion={Boolean(prefersReducedMotion)} />
            </div>
        </div>
    )
}

/** Ellipsis animado — 3 pontos que aparecem sequencialmente */
function EllipsisAnimated({ reducedMotion }: { reducedMotion: boolean }) {
    return (
        <span className="flex items-end gap-[2px] h-4 mb-[1px]" aria-hidden>
            {[0, 0.25, 0.5].map((delay, i) => (
                <motion.span
                    key={i}
                    className="w-[3px] h-[3px] rounded-full bg-sgn-primary-400 dark:bg-sgn-primary-500"
                    animate={reducedMotion ? { opacity: 0.7 } : { opacity: [0.2, 1, 0.2], y: [0, -2, 0] }}
                    transition={{
                        repeat: reducedMotion ? 0 : Infinity,
                        duration: reducedMotion ? 0 : 1,
                        delay: reducedMotion ? 0 : delay,
                        ease: 'easeInOut'
                    }}
                />
            ))}
        </span>
    )
}
