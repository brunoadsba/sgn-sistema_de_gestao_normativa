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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4">
            {suggestions.map((text) => (
                <button
                    key={text}
                    onClick={() => onSelect(text)}
                    className="group inline-flex w-full items-start justify-between gap-3 text-left px-4 py-3.5 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0f1520] border border-slate-200/90 dark:border-white/[0.12] rounded-xl shadow-sm hover:border-sgn-primary-300 dark:hover:border-sgn-primary-500/45 hover:bg-sgn-primary-50/70 dark:hover:bg-sgn-primary-500/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sgn-primary-300/70 dark:focus-visible:ring-sgn-primary-500/60 transition-all"
                >
                    <span className="flex-1 min-w-0">{text}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-300 dark:text-slate-500 group-hover:text-sgn-primary-500 transition-colors" />
                </button>
            ))}
        </div>
    )
}
