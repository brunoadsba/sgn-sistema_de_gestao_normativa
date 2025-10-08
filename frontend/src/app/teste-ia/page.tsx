'use client'

import { useState } from 'react'
import { AnaliseConformidade } from '@/components/ia/AnaliseConformidade'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, FileText, Zap } from 'lucide-react'

export default function TesteIAPage() {
  const [documento, setDocumento] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [resultado, setResultado] = useState(null)

  // Documento de exemplo
  const documentoExemplo = `
PROGRAMA DE GERENCIAMENTO DE RISCOS - PGR

1. IDENTIFICAÇÃO DA EMPRESA
- Razão Social: Indústrias BR Ltda
- CNPJ: 12.345.678/0001-90
- Endereço: Rua Industrial, 123, Salvador-BA
- Atividade: Fabricação de produtos químicos

2. OBJETIVO
O presente programa tem por objetivo estabelecer medidas de prevenção e controle dos riscos ocupacionais existentes no ambiente de trabalho.

3. IDENTIFICAÇÃO DOS RISCOS
3.1 Riscos Físicos
- Ruído: Níveis acima de 85 dB(A) em algumas áreas
- Calor: Temperaturas elevadas no setor de produção
- Vibração: Equipamentos com vibração excessiva

3.2 Riscos Químicos
- Produtos químicos: Exposição a solventes e ácidos
- Poeiras: Geração de poeiras em processos de moagem
- Fumos: Liberação de fumos metálicos

3.3 Riscos Biológicos
- Contaminação: Possível contaminação por microorganismos
- Vetores: Presença de insetos e roedores

4. MEDIDAS DE CONTROLE
4.1 Medidas Administrativas
- Treinamento de funcionários
- Rotatividade de pessoal
- Limitação de tempo de exposição

4.2 Medidas de Proteção Coletiva
- Ventilação local exaustora
- Enclausuramento de processos
- Sinalização de segurança

4.3 Medidas de Proteção Individual
- Fornecimento de EPIs
- Treinamento para uso correto
- Manutenção e substituição

5. MONITORAMENTO
- Medições ambientais trimestrais
- Exames médicos periódicos
- Avaliação da eficácia das medidas

6. CRONOGRAMA
- Implementação: 30 dias
- Primeira avaliação: 90 dias
- Revisão anual: 12 meses

7. RESPONSÁVEIS
- Coordenador: Eng. João Silva
- Técnico de Segurança: Maria Santos
- Médico do Trabalho: Dr. Pedro Costa
  `

  const tiposDocumento = [
    { value: 'PPRA', label: 'PPRA - Programa de Prevenção de Riscos Ambientais' },
    { value: 'PCMSO', label: 'PCMSO - Programa de Controle Médico de Saúde Ocupacional' },
    { value: 'LTCAT', label: 'LTCAT - Laudo Técnico das Condições Ambientais do Trabalho' },
    { value: 'ASO', label: 'ASO - Atestado de Saúde Ocupacional' },
    { value: 'CAT', label: 'CAT - Comunicação de Acidente de Trabalho' },
    { value: 'PPP', label: 'PPP - Perfil Profissiográfico Previdenciário' },
    { value: 'NR-12', label: 'NR-12 - Segurança no Trabalho em Máquinas e Equipamentos' },
    { value: 'NR-35', label: 'NR-35 - Trabalho em Altura' },
    { value: 'NR-33', label: 'NR-33 - Espaços Confinados' },
    { value: 'Outro', label: 'Outro Documento SST' }
  ]

  const handleAnaliseCompleta = (resultado: any) => {
    setResultado(resultado)
    console.log('Análise concluída:', resultado)
  }

  const carregarExemplo = () => {
    setDocumento(documentoExemplo)
    setTipoDocumento('PPRA')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Teste de IA para Análise de Conformidade
              </h1>
              <p className="text-gray-600">
                Demonstração da integração com GROQ + Llama 3.1
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <Zap className="h-4 w-4" />
              <span>GROQ API</span>
            </span>
            <span className="flex items-center space-x-1">
              <Brain className="h-4 w-4" />
              <span>Llama 3.1 70B</span>
            </span>
            <span className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Análise SST</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Entrada */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Configuração da Análise</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Documento
                  </label>
                  <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de documento" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposDocumento.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conteúdo do Documento
                  </label>
                  <Textarea
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="Cole aqui o conteúdo do documento para análise..."
                    className="min-h-[300px]"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={carregarExemplo}
                    variant="outline"
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Carregar Exemplo
                  </Button>
                  <Button 
                    onClick={() => {
                      setDocumento('')
                      setTipoDocumento('')
                      setResultado(null)
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Instruções */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-medium text-blue-900 mb-2">
                  📋 Como usar:
                </h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Selecione o tipo de documento</li>
                  <li>2. Cole o conteúdo ou use o exemplo</li>
                  <li>3. Clique em "Iniciar Análise"</li>
                  <li>4. Aguarde o processamento (2-5 segundos)</li>
                  <li>5. Veja os resultados detalhados</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Resultado */}
          <div>
            <AnaliseConformidade
              empresaId="teste-123"
              documento={documento}
              tipoDocumento={tipoDocumento}
              onAnaliseCompleta={handleAnaliseCompleta}
            />
          </div>
        </div>

        {/* Informações Técnicas */}
        <Card className="mt-8 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">Informações Técnicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">GROQ API</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• 14.400 requests/dia gratuitos</li>
                  <li>• Velocidade: ~2-5 segundos</li>
                  <li>• Modelo: Llama 3.1 70B</li>
                  <li>• Especializado em SST</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Análise</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Score de conformidade 0-100</li>
                  <li>• Identificação de gaps</li>
                  <li>• Classificação de severidade</li>
                  <li>• Recomendações práticas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Normas</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• NR-1: Disposições Gerais</li>
                  <li>• NR-6: EPIs</li>
                  <li>• NR-7: PCMSO</li>
                  <li>• NR-9: PPRA</li>
                  <li>• NR-12: Máquinas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
