'use client'

import { ArrowUpRight } from 'lucide-react'

const SUGGESTIONS_GROUNDED = [
    'Quais gaps críticos foram identificados?',
    'Resuma as não conformidades',
    'Quais NRs não estão sendo atendidas?',
    'Sugira um plano de ação',
]

const SUGGESTIONS_FREE = [
    'O que é o PGR e quando é obrigatório?',
    'Quais EPIs são exigidos pela NR-6?',
    'Diferença entre NR-1 e NR-9',
    'O que a CIPA faz conforme NR-5?',
]

interface ChatSuggestionsProps {
    onSelect: (text: string) => void
    isGrounded?: boolean
}

export function ChatSuggestions({ onSelect, isGrounded = false }: ChatSuggestionsProps) {
    const suggestions = isGrounded ? SUGGESTIONS_GROUNDED : SUGGESTIONS_FREE

    return (
        <div className="grid grid-cols-2 gap-2 pt-4">
            {suggestions.map((text) => (
                <button
                    key={text}
                    onClick={() => onSelect(text)}
                    className="group text-left px-3 py-2.5 text-[13px] leading-snug text-gray-600 dark:text-gray-400 bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/[0.06] transition-all"
                >
                    <div className="flex items-start justify-between gap-2">
                        <span>{text}</span>
                        <ArrowUpRight className="w-3 h-3 mt-0.5 shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors" />
                    </div>
                </button>
            ))}
        </div>
    )
}
