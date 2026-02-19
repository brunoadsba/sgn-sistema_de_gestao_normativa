'use client'

import { useQueryState } from 'nuqs'
import { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Search, ArrowRight } from "lucide-react"
import Link from "next/link"
import { NormaLocal } from "@/lib/data/normas"

interface ListaNormasDinamicaProps {
    normasIniciais: NormaLocal[]
}

export function ListaNormasDinamica({ normasIniciais }: ListaNormasDinamicaProps) {
    const [buscaURL, setBuscaURL] = useQueryState('search', {
        defaultValue: '',
        shallow: true
    })

    const [textoBusca, setTextoBusca] = useState(buscaURL || '')

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setBuscaURL(textoBusca || null)
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [textoBusca, setBuscaURL])

    const normasFiltradas = useMemo(() => {
        const termo = textoBusca.toLowerCase()
        return termo
            ? normasIniciais.filter(
                (n) =>
                    n.codigo.toLowerCase().includes(termo) ||
                    n.titulo.toLowerCase().includes(termo)
            )
            : normasIniciais
    }, [textoBusca, normasIniciais])

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="relative max-w-3xl mx-auto">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-gray-400" />
                </div>
                <Input
                    placeholder="Digite o código ou palavra-chave (ex: NR-01, EPI, CIPA)..."
                    value={textoBusca}
                    onChange={(e) => setTextoBusca(e.target.value)}
                    className="w-full h-16 pl-14 pr-4 text-lg bg-white/80 dark:bg-gray-900/80 dark:text-gray-100 dark:placeholder:text-gray-500 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 transition-all"
                />
            </div>

            {!normasFiltradas || normasFiltradas.length === 0 ? (
                <div className="text-center py-16 bg-transparent rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Nenhuma norma encontrada</h3>
                    <p className="text-gray-500 dark:text-gray-400">Tente ajustar seus filtros de busca.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {normasFiltradas.map((norma) => (
                        <Card key={norma.id} className="group hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-black/30 transition-all duration-300 border-white/20 dark:border-gray-700/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl flex flex-col h-full hover:-translate-y-1 overflow-hidden">
                            <div className={`h-2 w-full ${norma.status === 'ativa' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}></div>
                            <CardHeader className="pb-4 grow">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <Badge
                                        variant={norma.status === 'ativa' ? 'default' : 'destructive'}
                                        className={`px-3 py-1 font-bold tracking-wide text-xs shadow-sm ${norma.status === 'ativa'
                                            ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
                                            : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                                            }`}
                                    >
                                        {norma.status === 'ativa' ? 'ATIVA' : 'REVOGADA'}
                                    </Badge>
                                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                    {norma.codigo}
                                </CardTitle>
                                <CardDescription className="text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed line-clamp-3">
                                    {norma.titulo}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0 pb-6 border-t border-gray-100/50 dark:border-gray-700/40 mt-auto">
                                <div className="pt-4 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Categoria</span>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{norma.categoria}</span>
                                    </div>
                                    <Link href={`/normas/${norma.id}`} className="inline-flex">
                                        <Button className="rounded-full bg-gray-900 text-white hover:bg-blue-600 hover:scale-105 transition-all shadow-md">
                                            Ver Detalhes
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
