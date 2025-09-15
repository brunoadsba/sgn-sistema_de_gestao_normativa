'use client'

import { use, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/loading/LoadingSpinner'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  FileText, 
  Calendar,
  ArrowLeft,
  Edit,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface EmpresaData {
  id: string
  nome: string
  cnpj: string
  setor: string
  porte: string
  ativo: boolean
  created_at: string
  configuracoes: {
    cnae: string
    contato: {
      email: string
      telefone: string
      responsavel_sst: string
    }
    endereco: {
      cep: string
      bairro: string
      cidade: string
      estado: string
      logradouro: string
    }
    segmento: string
    funcionarios: number
  }
}

export default function EmpresaDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/empresas/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Empresa não encontrada')
          }
          throw new Error('Erro ao carregar dados da empresa')
        }

        const result = await response.json()
        
        if (result.success) {
          setEmpresa(result.data)
        } else {
          throw new Error(result.error || 'Erro desconhecido')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEmpresa()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <LoadingSpinner size="lg" label="Carregando detalhes da empresa..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Erro: {error}</p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!empresa) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Empresa não encontrada</p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getPorteVariant = (porte: string) => {
    switch (porte) {
      case 'grande': return 'default'
      case 'medio': return 'secondary'
      case 'pequeno': return 'outline'
      default: return 'secondary'
    }
  }

  const getPorteLabel = (porte: string) => {
    switch (porte) {
      case 'grande': return 'Grande Porte'
      case 'medio': return 'Médio Porte'
      case 'pequeno': return 'Pequeno Porte'
      default: return porte
    }
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold">{empresa.nome}</h1>
              <Badge variant={empresa.ativo ? 'default' : 'secondary'}>
                {empresa.ativo ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {empresa.configuracoes.segmento} • {getPorteLabel(empresa.porte)}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Link href={`/empresas/${empresa.id}/conformidade`}>
              <Button size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Conformidade
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">CNPJ: {empresa.cnpj}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Setor: {empresa.setor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Fundada: {new Date(empresa.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Funcionários: {empresa.configuracoes.funcionarios}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{empresa.configuracoes.contato.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{empresa.configuracoes.contato.telefone}</span>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm">{empresa.configuracoes.contato.responsavel_sst}</span>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <div>{empresa.configuracoes.endereco.logradouro}</div>
                <div>{empresa.configuracoes.endereco.bairro}</div>
                <div>{empresa.configuracoes.endereco.cidade} - {empresa.configuracoes.endereco.estado}</div>
                <div>CEP: {empresa.configuracoes.endereco.cep}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">CNAE</h4>
              <p className="text-sm text-muted-foreground">{empresa.configuracoes.cnae}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Segmento</h4>
              <p className="text-sm text-muted-foreground">{empresa.configuracoes.segmento}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
