import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getNormaById } from "@/lib/data/normas"
import { CheckCircle, AlertTriangle, ExternalLink, Tag, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import BotoesSeguranca from "./components/BotoesSeguranca"

export default async function NormaDetalhes({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const norma = getNormaById(id)

  if (!norma) {
    notFound()
  }

  const isRevogada = norma.status === 'revogada'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-3xl">

        {/* Navegação */}
        <div className="mb-6">
          <Link href="/normas">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para normas
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden border-white/40 dark:border-gray-700/40 shadow-2xl shadow-blue-900/5 dark:shadow-black/30 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl">
          <CardContent className="p-0">

            {/* Cabeçalho da norma */}
            <div className={`p-6 sm:p-8 md:p-12 border-b border-gray-100 dark:border-gray-700/50 ${isRevogada ? 'bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-gray-900/50' : 'bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20'}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-4">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-gray-100 drop-shadow-sm">{norma.codigo}</h1>
                {isRevogada ? (
                  <Badge variant="destructive" className="flex items-center gap-2 shrink-0 px-4 py-1.5 text-sm font-bold shadow-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Revogada
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-2 shrink-0 px-4 py-1.5 text-sm font-bold shadow-sm hover:bg-green-200">
                    <CheckCircle className="h-4 w-4" />
                    Em vigor
                  </Badge>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-xl font-medium leading-relaxed max-w-3xl">{norma.titulo}</p>
            </div>

            <div className="p-6 sm:p-8 md:p-12 space-y-8 sm:space-y-10">

              {/* Alerta de revogação */}
              {isRevogada && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Norma revogada — sem validade legal
                  </h4>
                  <p className="text-red-700 text-base leading-relaxed">
                    Esta NR não possui mais efeito jurídico. Consulte a legislação vigente
                    para verificar a norma que a substituiu. Não utilize como referência para implementação.
                  </p>
                </div>
              )}

              {/* Informações principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                <div className="space-y-2 bg-gray-50/50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Categoria
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">{norma.categoria}</p>
                </div>
                <div className="space-y-2 bg-gray-50/50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Órgão expedidor
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg">Ministério do Trabalho e Emprego</p>
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Escopo e aplicabilidade</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg">{norma.descricao}</p>
              </div>

              {/* Palavras-chave */}
              {norma.palavrasChave.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Tag className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Termos relacionados</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {norma.palavrasChave.map((palavra) => (
                      <span
                        key={palavra}
                        className="px-4 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-default"
                      >
                        {palavra}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links oficiais */}
              <div className="pt-8 border-t border-gray-100 dark:border-gray-700/50 space-y-6">
                <a
                  href={norma.urlOficial}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 p-4 w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40"
                >
                  <ExternalLink className="h-5 w-5" />
                  Acessar texto oficial no site do MTE
                </a>

                {norma.urlAnexos && norma.urlAnexos.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Anexos Disponíveis</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {norma.urlAnexos.map((anexo) => (
                        <li key={anexo.url + anexo.label}>
                          <a
                            href={anexo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-900/70 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-300"
                          >
                            <div className="p-1.5 bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 rounded-md transition-colors">
                              <ExternalLink className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300" />
                            </div>
                            <span className="truncate">{anexo.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <div className="pt-8 border-t border-gray-100">
                <BotoesSeguranca norma={{ codigo: norma.codigo, titulo: norma.titulo, status: norma.status }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
