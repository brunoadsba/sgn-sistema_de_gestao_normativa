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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">

        {/* Navegação */}
        <div className="mb-6">
          <Link href="/normas">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para normas
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">

            {/* Cabeçalho da norma */}
            <div className={`p-6 border-b ${isRevogada ? 'bg-red-50' : 'bg-blue-50'}`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{norma.codigo}</h1>
                {isRevogada ? (
                  <Badge variant="destructive" className="flex items-center gap-1 shrink-0">
                    <AlertTriangle className="h-3 w-3" />
                    Revogada
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 shrink-0">
                    <CheckCircle className="h-3 w-3" />
                    Em vigor
                  </Badge>
                )}
              </div>
              <p className="text-gray-700 text-base leading-relaxed">{norma.titulo}</p>
            </div>

            <div className="p-6 space-y-6">

              {/* Alerta de revogação */}
              {isRevogada && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-1 flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Norma revogada — sem validade legal
                  </h4>
                  <p className="text-red-700 text-sm">
                    Esta NR não possui mais efeito jurídico. Consulte a legislação vigente
                    para verificar a norma que a substituiu. Não utilize como referência para implementação.
                  </p>
                </div>
              )}

              {/* Informações principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Categoria</p>
                  <p className="text-gray-800 font-medium">{norma.categoria}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Órgão expedidor</p>
                  <p className="text-gray-800">Ministério do Trabalho e Emprego</p>
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Escopo e aplicabilidade</p>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{norma.descricao}</p>
              </div>

              {/* Palavras-chave */}
              {norma.palavrasChave.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Termos relacionados</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {norma.palavrasChave.map((palavra) => (
                      <span
                        key={palavra}
                        className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200"
                      >
                        {palavra}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links oficiais */}
              <div className="pt-2 border-t space-y-3">
                <a
                  href={norma.urlOficial}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Acessar texto oficial no site do MTE
                </a>

                {norma.urlAnexos && norma.urlAnexos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Anexos</p>
                    <ul className="space-y-1.5">
                      {norma.urlAnexos.map((anexo) => (
                        <li key={anexo.url + anexo.label}>
                          <a
                            href={anexo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                            {anexo.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <BotoesSeguranca norma={{ codigo: norma.codigo, titulo: norma.titulo, status: norma.status }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
