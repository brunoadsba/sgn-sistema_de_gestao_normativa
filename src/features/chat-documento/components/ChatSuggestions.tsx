'use client'

import { ArrowUpRight } from 'lucide-react'

import { useChatContext } from '../context/ChatContext'

export function ChatSuggestions({ onSelect }: { onSelect: (text: string) => void }) {
    const { documentContext, documentName, contextoTela } = useChatContext()
    const isGrounded = Boolean(documentContext && documentContext.trim().length > 0)

    let suggestions: string[] = []

    if (isGrounded) {
        suggestions = [
            'Quais gaps críticos foram identificados?',
            `Resuma as não conformidades de ${documentName || 'este documento'}`,
            'Quais NRs não estão sendo atendidas?',
            'Sugira um plano de ação detalhado',
        ]
    } else if (contextoTela === 'Catálogo de Normas') {
        suggestions = [
            'Qual a diferença entre NR-1 e NR-9?',
            'Quais NRs tratam de trabalho em altura?',
            'Liste as normas mais autuadas',
            'Como funciona a hierarquia de normas SST?'
        ]
    } else if (contextoTela === 'Análise NR-6') {
        suggestions = [
            'O que é C.A de EPI?',
            'Como validar a entrega de EPIs?',
            'Quais EPIs são obrigatórios para ruído?',
            'Responsabilidades do empregador na NR-6'
        ]
    } else {
        suggestions = [
            'O que é o PGR e quando é obrigatório?',
            'Quais EPIs são exigidos pela NR-6?',
            'Diferença entre NR-1 e NR-9',
            'O que a CIPA faz conforme NR-5?',
        ]
    }

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
