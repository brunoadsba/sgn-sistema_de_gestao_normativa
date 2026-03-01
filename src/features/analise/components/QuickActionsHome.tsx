'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { FileText, Plus, Book, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatarDataHoraBrasilia } from '@/lib/formatters'
import { fetchWithRetry } from '@/lib/fetch-with-retry'
import type { HistoricoAnalise } from '../hooks/useHistorico'

export function QuickActionsHome() {
    const [ultimaAnalise, setUltimaAnalise] = useState<HistoricoAnalise | null>(null)
    const [carregando, setCarregando] = useState(true)

    useEffect(() => {
        async function fetchUltimaAnalise() {
            try {
                const res = await fetchWithRetry('/api/ia/analisar-conformidade?limite=1&pagina=1&periodo=30d&ordenacao=data_desc')
                const data = await res.json()
                if (data.success && data.data?.historico?.length > 0) {
                    setUltimaAnalise(data.data.historico[0])
                }
            } catch (err) {
                console.error('Falha ao buscar última análise:', err)
            } finally {
                setCarregando(false)
            }
        }
        fetchUltimaAnalise()
    }, [])

    if (carregando) return null

    // Só exibe se houver histórico para não mostrar "Nova Análise" repetitivo para novos usuários
    if (!ultimaAnalise) return null

    return (
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sgn-primary-500" />
                Continuar de onde parou
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                    className="group border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:bg-sgn-primary-50 dark:hover:bg-sgn-primary-900/10 hover:border-sgn-primary-300 dark:hover:border-sgn-primary-500/50 cursor-pointer overflow-hidden shadow-sm"
                    onClick={() => window.location.href = `/?hist_vis=true`} // Redirecionar para histórico
                >
                    <div className="p-4 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl group-hover:bg-sgn-primary-100 dark:group-hover:bg-sgn-primary-900/30">
                                <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-sgn-primary-600 dark:group-hover:text-sgn-primary-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 font-medium mb-1">Última Análise</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate" title={ultimaAnalise.nomeDocumento}>
                                    {ultimaAnalise.nomeDocumento}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">{formatarDataHoraBrasilia(ultimaAnalise.timestamp)}</span>
                            <span className="text-sgn-primary-600 dark:text-sgn-primary-400 font-semibold group-hover:translate-x-1 transition-transform">Ver Histórico →</span>
                        </div>
                    </div>
                </Card>

                <Card
                    className="group border border-gray-200 p-4 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/80 cursor-pointer shadow-sm relative overflow-hidden"
                    onClick={() => {
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                    }}
                >
                    {/* Ripple/Gradient Effect */}
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />

                    <div className="flex flex-col h-full justify-center items-center gap-3 relative z-10 text-center">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100">Nova Análise</p>
                            <p className="text-xs text-gray-500 hidden sm:block">Carregar documento</p>
                        </div>
                    </div>
                </Card>

                <Link href="/normas" passHref className="block">
                    <Card className="group h-full border border-gray-200 p-4 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 cursor-pointer shadow-sm">
                        <div className="flex flex-col h-full justify-center items-center gap-3 text-center">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full group-hover:scale-110 group-hover:rotate-12 transition-transform">
                                <Book className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-gray-100">Catálogo de Normas</p>
                                <p className="text-xs text-gray-500 hidden sm:block">Consultar NR diretamente</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
