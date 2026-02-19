import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Search, Filter, Download, RefreshCw } from "lucide-react"
import Link from "next/link"
import { getNormas as getNormasData, NormaLocal } from "@/lib/data/normas"

function NormasList({ normas }: { normas: NormaLocal[] }) {
  if (!normas || normas.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma norma encontrada.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {normas.map((norma) => (
        <Card key={norma.id} className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {norma.codigo}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {norma.titulo}
                </CardDescription>
              </div>
              <Badge
                variant={norma.status === 'ativa' ? 'default' : 'destructive'}
                className="ml-4 shrink-0"
              >
                {norma.status === 'ativa' ? 'Ativa' : 'Revogada'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="font-medium">Categoria:</span> {norma.categoria}
              </div>
              <Link href={`/normas/${norma.id}`}>
                <Button size="sm" variant="outline">
                  <FileText className="w-4 h-4 mr-1" />
                  Ver Detalhes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function NormasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const busca = (params.search as string | undefined) || ''

  const todasNormas = getNormasData()
  const normas = busca
    ? todasNormas.filter(
        (n) =>
          n.codigo.toLowerCase().includes(busca.toLowerCase()) ||
          n.titulo.toLowerCase().includes(busca.toLowerCase())
      )
    : todasNormas

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Normas Regulamentadoras
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  Sistema de Gestão Normativa - Base de dados atualizada
                </p>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <FileText className="w-4 h-4 mr-1" />
                    {normas.length} normas ativas
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Atualizado em tempo real
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Busca */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center text-xl">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Buscar por código, título ou descrição..."
                    className="w-full h-12 text-lg"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-6">
                    <Search className="w-5 h-5 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Normas */}
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            }
          >
            <NormasList normas={normas} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
