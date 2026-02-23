'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Brain, BookOpen, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQueryState } from 'nuqs'
import { usePathname } from 'next/navigation'

export function GlobalNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    // Controle do Histórico via URL (compatível com AnaliseCliente)
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
            active: pathname === '/normas',
        },
    ]

    const toggleHistory = () => {
        setMostrarHistorico(mostrarHistorico === 'true' ? 'false' : 'true')
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-2 space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${item.active
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }
                  `}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            ))}

                            {isAnalisePage && (
                                <button
                                    onClick={toggleHistory}
                                    className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${mostrarHistorico === 'true'
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }
                  `}
                                >
                                    <History className="h-4 w-4" />
                                    {mostrarHistorico === 'true' ? 'Ocultar Histórico' : 'Ver Histórico'}
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
