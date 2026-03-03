'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GlobalNav } from '@/components/navigation/GlobalNav'

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isChatPage = pathname === '/chat'

    if (isChatPage) {
        return <>{children}</>
    }

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white/60 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800 shadow-sm">
                <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                            <span className="text-white font-bold tracking-tight">SGN</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-gray-100 tracking-tight hidden md:inline group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Gestão Normativa
                        </span>
                    </Link>

                    <GlobalNav />
                </div>
            </header>

            <main id="app-main-content" className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] relative z-10 py-6 sm:py-10">
                {children}
            </main>
        </>
    )
}
