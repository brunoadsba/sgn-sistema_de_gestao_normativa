"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { FileText, Share2 } from "lucide-react"

interface NormaResumida {
  codigo: string
  titulo: string
  status: 'ativa' | 'revogada'
}

interface BotoesSegurancaProps {
  norma: NormaResumida
}

export default function BotoesSeguranca({ norma }: BotoesSegurancaProps) {
  const { toast } = useToast()
  const [exportando, setExportando] = useState(false)
  const [compartilhando, setCompartilhando] = useState(false)

  const isRevogada = norma.status === 'revogada'

  const gerarRelatorioHTML = (): string => {
    const dataAtual = new Date().toLocaleDateString("pt-BR")
    const horaAtual = new Date().toLocaleTimeString("pt-BR")
    const statusTexto = isRevogada ? "REVOGADA — SEM VALIDADE LEGAL" : "VIGENTE"
    const statusCor = isRevogada ? "#dc2626" : "#16a34a"

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório Técnico — ${norma.codigo}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
    h1 { color: #1e40af; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
    .campo { background: #f8fafc; padding: 12px; border-radius: 6px; }
    .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 4px; }
    .status { font-weight: bold; color: ${statusCor}; }
    .alerta { border: 1px solid ${isRevogada ? '#dc2626' : '#2563eb'}; background: ${isRevogada ? '#fef2f2' : '#eff6ff'}; padding: 16px; border-radius: 6px; margin: 24px 0; }
    .footer { border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 16px; font-size: 11px; color: #64748b; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <h1>Relatório Técnico — ${norma.codigo}</h1>
  <div class="meta">
    <div class="campo">
      <div class="label">Código</div>
      <div>${norma.codigo}</div>
    </div>
    <div class="campo">
      <div class="label">Status legal</div>
      <div class="status">${statusTexto}</div>
    </div>
    <div class="campo" style="grid-column: span 2">
      <div class="label">Título</div>
      <div>${norma.titulo}</div>
    </div>
    <div class="campo">
      <div class="label">Órgão expedidor</div>
      <div>Ministério do Trabalho e Emprego</div>
    </div>
    <div class="campo">
      <div class="label">Relatório gerado em</div>
      <div>${dataAtual} às ${horaAtual}</div>
    </div>
  </div>
  <div class="alerta">
    ${isRevogada
      ? `<strong>⚠ Norma revogada.</strong> Esta NR não possui mais efeito jurídico. Consulte a legislação vigente antes de qualquer implementação.`
      : `<strong>✓ Norma em vigor.</strong> Esta NR está ativa e seu cumprimento é obrigatório conforme a legislação trabalhista brasileira.`
    }
  </div>
  <p><strong>Fonte oficial:</strong> Ministério do Trabalho e Emprego — <a href="https://www.gov.br/trabalho-e-emprego">gov.br/trabalho-e-emprego</a></p>
  <div class="footer">
    Gerado pelo SGN — Sistema de Gestão Normativa. Este documento é uma referência de apoio técnico; consulte sempre o texto oficial da norma.
  </div>
</body>
</html>`
  }

  const handleExportar = async () => {
    setExportando(true)
    try {
      const html = gerarRelatorioHTML()
      const janela = window.open("", "_blank")
      if (janela) {
        janela.document.write(html)
        janela.document.close()
        setTimeout(() => { janela.focus(); janela.print() }, 400)
      }
      toast({ title: "Relatório aberto", description: "Use Ctrl+P para salvar como PDF." })
    } catch {
      toast({ title: "Erro ao gerar relatório", variant: "destructive" })
    } finally {
      setExportando(false)
    }
  }

  const handleCompartilhar = async () => {
    setCompartilhando(true)
    const texto = `${norma.codigo} — ${norma.titulo}\nStatus: ${isRevogada ? "Revogada" : "Em vigor"}\nFonte: SGN — Sistema de Gestão Normativa`
    try {
      if (navigator.share) {
        await navigator.share({ title: norma.codigo, text: texto, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(`${texto}\n${window.location.href}`)
        toast({ title: "Copiado para área de transferência" })
      }
    } catch {
      toast({ title: "Não foi possível compartilhar", variant: "destructive" })
    } finally {
      setCompartilhando(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
      <Button
        variant="outline"
        className="w-full sm:flex-1 gap-2"
        onClick={handleExportar}
        disabled={exportando}
      >
        <FileText className="h-4 w-4" />
        {exportando ? "Gerando..." : "Exportar PDF"}
      </Button>
      <Button
        variant="outline"
        className="w-full sm:flex-1 gap-2"
        onClick={handleCompartilhar}
        disabled={compartilhando}
      >
        <Share2 className="h-4 w-4" />
        {compartilhando ? "Aguarde..." : "Compartilhar"}
      </Button>
    </div>
  )
}
