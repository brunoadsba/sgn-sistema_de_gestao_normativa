'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Brain, BookOpen, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQueryState } from 'nuqs'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useChatContext } from '@/features/chat-documento/context/ChatContext'
import { MessageCircle } from 'lucide-react'

export function GlobalNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const { openChat } = useChatContext()

    const [mostrarHistorico, setMostrarHistorico] = useQueryState('hist_vis', {
        defaultValue: 'false',
        shallow: true,
    })

    const isAnalisePage = pathname === '/'

    const menuItems = [
        {
            label: 'Analisar',
            href: '/',
            icon: Brain,
            active: pathname === '/',
        },
        {
            label: 'Normas',
            href: '/normas',
            icon: BookOpen,
            active: pathname?.startsWith('/normas'),
        },
    ]

    const toggleHistory = () => {
        setMostrarHistorico(mostrarHistorico === 'true' ? 'false' : 'true')
        setIsOpen(false)
    }

    const linkClasses = (active: boolean) =>
        cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            active
                ? 'text-sgn-primary-600 dark:text-sgn-primary-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
        )

    return (
        <>
            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
                {menuItems.map((item) => (
                    <Link key={item.href} href={item.href} className={linkClasses(item.active)}>
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}

                {isAnalisePage && (
                    <button onClick={toggleHistory} className={linkClasses(mostrarHistorico === 'true')}>
                        <History className="h-4 w-4" />
                        Historico
                    </button>
                )}

                <button
                    onClick={openChat}
                    className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow"
                >
                    <MessageCircle className="h-4 w-4" />
                    Assistente NEX
                </button>
            </nav>

            {/* Mobile hamburger */}
            <div className="relative lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-10 w-10 rounded-lg lg:hidden"
                    aria-label="Menu de navegacao"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-2 space-y-1">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                            item.active
                                                ? 'bg-sgn-primary-50 dark:bg-sgn-primary-900/30 text-sgn-primary-600 dark:text-sgn-primary-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.label}
                                    </Link>
                                ))}

                                {isAnalisePage && (
                                    <button
                                        onClick={toggleHistory}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                            mostrarHistorico === 'true'
                                                ? 'bg-sgn-primary-50 dark:bg-sgn-primary-900/30 text-sgn-primary-600 dark:text-sgn-primary-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        )}
                                    >
                                        <History className="h-4 w-4" />
                                        {mostrarHistorico === 'true' ? 'Ocultar Historico' : 'Ver Historico'}
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        openChat();
                                        setIsOpen(false);
                                    }}
                                    className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                    Assistente NEX
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
