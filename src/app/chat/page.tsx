'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChatInterface } from '@/features/chat-documento/components/ChatInterface'
import { X, ArrowLeft, Sparkles } from 'lucide-react'

const NEX_POPUP_NAME = 'sgn-nex-assistente'

export default function ChatPage() {
    const [isPopup, setIsPopup] = useState(false)

    useEffect(() => {
        setIsPopup(typeof window !== 'undefined' && (window.opener != null || window.name === NEX_POPUP_NAME))
    }, [])

    return (
        <div className="flex flex-col min-h-screen h-dvh bg-gradient-to-b from-slate-100 to-slate-50 dark:from-[#0f131a] dark:to-[#0a0f15]">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200/70 dark:border-white/[0.07] bg-white/95 dark:bg-[#121822] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sgn-primary-500 to-sgn-primary-700 flex items-center justify-center shadow-md shadow-sgn-primary-900/25">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        Assistente NEX
                    </span>
                </div>
                {isPopup ? (
                    <button
                        onClick={() => window.close()}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors text-slate-500 dark:text-slate-400"
                        aria-label="Fechar janela"
                    >
                        <X className="w-5 h-5" />
                    </button>
                ) : (
                    <Link
                        href="/"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-lg transition-colors text-slate-500 dark:text-slate-400 flex items-center gap-1"
                        aria-label="Voltar"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                )}
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
                <ChatInterface />
            </div>
        </div>
    )
}
