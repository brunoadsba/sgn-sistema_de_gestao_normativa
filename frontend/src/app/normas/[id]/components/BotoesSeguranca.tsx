"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { FileText, CheckCircle, Shield, HardHat } from "lucide-react";

interface BotoesSegurancaProps {
  norma: any;
}

export default function BotoesSeguranca({ norma }: BotoesSegurancaProps) {
  const { toast } = useToast();
  const [exportando, setExportando] = useState(false);
  const [compartilhando, setCompartilhando] = useState(false);

  const gerarRelatorioPDF = () => {
    const isRevogada = norma.titulo.includes("REVOGADA");
    const categoria = norma.titulo.includes("SEGURANÇA") ? "Segurança do Trabalho" :
                    norma.titulo.includes("SAÚDE") ? "Saúde Ocupacional" :
                    norma.titulo.includes("EQUIPAMENTO") ? "Equipamentos de Proteção Individual" :
                    norma.titulo.includes("CONSTRUÇÃO") ? "Segurança na Construção Civil" :
                    norma.titulo.includes("RURAL") ? "Segurança no Trabalho Rural" :
                    "Disposições Gerais de Segurança";

    let aplicabilidade = "";
    let observacoesTecnicas = "";
    let nivelCriticidade = "MÉDIO";
    
    const numeroNR = norma.codigo.match(/NR-(\\d+)/)?.[1];
    
    switch(numeroNR) {
      case "1":
        aplicabilidade = "Aplicável a todas as empresas e empregadores que admitam trabalhadores";
        observacoesTecnicas = "Fundamental para PPRA e PCMSO. Base para todas as demais NRs.";
        break;
      case "6":
        aplicabilidade = "Empresas que utilizam equipamentos de proteção individual";
        observacoesTecnicas = "Obrigatório CA dos EPIs. Treinamento e fiscalização necessários.";
        break;
      case "12":
        aplicabilidade = "Indústrias e empresas que operam máquinas e equipamentos";
        observacoesTecnicas = "Dispositivos de segurança obrigatórios. Manutenção preventiva essencial.";
        nivelCriticidade = "ALTO";
        break;
      case "18":
        aplicabilidade = "Construção civil, obras de edificação, demolição e reparo";
        observacoesTecnicas = "PCMAT obrigatório para obras com 20+ trabalhadores. DDS diário.";
        nivelCriticidade = "ALTO";
        break;
      case "35":
        aplicabilidade = "Atividades e serviços envolvendo altura superior a 2 metros";
        observacoesTecnicas = "Análise de Risco obrigatória. Sistema de ancoragem certificado.";
        nivelCriticidade = "ALTO";
        break;
      default:
        aplicabilidade = "Conforme especificações técnicas da norma";
        observacoesTecnicas = "Consulte o texto integral para requisitos específicos.";
    }

    // Gerar HTML estruturado para impressão/PDF
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Técnico - ${norma.codigo}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            color: #64748b;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            border-left: 4px solid #2563eb;
            padding-left: 10px;
            margin-bottom: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            padding: 10px;
            background-color: #f8fafc;
            border-radius: 8px;
        }
        .info-label {
            font-weight: bold;
            color: #475569;
            margin-bottom: 5px;
        }
        .status-ativo {
            color: #16a34a;
            font-weight: bold;
        }
        .status-revogado {
            color: #dc2626;
            font-weight: bold;
        }
        .alert-box {
            background-color: ${isRevogada ? "#fef2f2" : "#f0f9ff"};
            border: 2px solid ${isRevogada ? "#dc2626" : "#2563eb"};
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .alert-title {
            font-weight: bold;
            color: ${isRevogada ? "#dc2626" : "#1e40af"};
            margin-bottom: 8px;
        }
        .recommendations {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
        }
        .recommendations ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        .footer {
            border-top: 2px solid #e2e8f0;
            padding-top: 20px;
            margin-top: 40px;
            text-align: center;
            color: #64748b;
            font-size: 12px;
        }
        .criticidade-alto {
            color: #dc2626;
            font-weight: bold;
        }
        .criticidade-medio {
            color: #ea580c;
            font-weight: bold;
        }
        @media print {
            body { margin: 20px; }
            .header { page-break-after: avoid; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">RELATÓRIO TÉCNICO DE SEGURANÇA DO TRABALHO</div>
        <div class="subtitle">Sistema de Gestão Normativa (SGN)</div>
    </div>

    <div class="section">
        <div class="section-title">📋 IDENTIFICAÇÃO DA NORMA</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Código</div>
                <div>${norma.codigo}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Status Legal</div>
                <div class="${isRevogada ? "status-revogado" : "status-ativo"}">
                    ${isRevogada ? "⚠️ REVOGADA - SEM VALIDADE LEGAL" : "✅ VIGENTE"}
                </div>
            </div>
        </div>
        <div class="info-item">
            <div class="info-label">Título</div>
            <div>${norma.titulo}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">🏛️ DADOS REGULAMENTARES</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Órgão Expedidor</div>
                <div>${norma.orgao_publicador}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Categoria</div>
                <div>${categoria}</div>
            </div>
        </div>
        <div class="info-item">
            <div class="info-label">Data de Inclusão no Sistema</div>
            <div>${new Date(norma.created_at).toLocaleDateString("pt-BR")}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">🎯 ANÁLISE TÉCNICA</div>
        <div class="info-item">
            <div class="info-label">Aplicabilidade</div>
            <div>${aplicabilidade}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Observações Técnicas</div>
            <div>${observacoesTecnicas}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">📊 AVALIAÇÃO DE RISCO</div>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Nível de Criticidade</div>
                <div class="${nivelCriticidade === "ALTO" ? "criticidade-alto" : "criticidade-medio"}">
                    ${nivelCriticidade}
                </div>
            </div>
            <div class="info-item">
                <div class="info-label">Área de Atuação</div>
                <div>${categoria}</div>
            </div>
        </div>
        <div class="info-item">
            <div class="info-label">Fiscalização</div>
            <div>Sujeita à autuação pelo Ministério do Trabalho e Emprego</div>
        </div>
    </div>

    ${isRevogada ? `
    <div class="alert-box">
        <div class="alert-title">🚨 ALERTA REGULAMENTÁRIO</div>
        <p>Esta norma foi REVOGADA e não possui mais validade legal. É necessário verificar a norma substituta ou regulamentação atual. <strong>USO APENAS PARA CONSULTA HISTÓRICA.</strong></p>
    </div>
    ` : `
    <div class="alert-box">
        <div class="alert-title">✅ CONFORMIDADE LEGAL</div>
        <p>Esta norma está em vigor e deve ser cumprida conforme determina a legislação trabalhista brasileira.</p>
    </div>
    `}

    <div class="section">
        <div class="section-title">📝 RECOMENDAÇÕES PROFISSIONAIS</div>
        <div class="recommendations">
            <ol>
                <li>Consulte o texto integral da norma no site oficial do Ministério do Trabalho</li>
                <li>Implemente os requisitos conforme cronograma estabelecido</li>
                <li>Documente todas as ações de adequação</li>
                <li>Mantenha treinamentos atualizados</li>
                <li>Realize auditorias internas periódicas</li>
                <li>Monitore atualizações regulamentares</li>
            </ol>
        </div>
    </div>

    <div class="footer">
        <p><strong>Relatório gerado em:</strong> ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
        <p><strong>Responsável Técnico:</strong> Engenheiro/Técnico de Segurança do Trabalho</p>
        <p><strong>Fonte:</strong> Sistema de Gestão Normativa (SGN)</p>
        <p><strong>URL de referência:</strong> ${typeof window !== "undefined" ? window.location.href : ""}</p>
        <br>
        <p><em>IMPORTANTE: Este relatório é uma ferramenta de apoio técnico. Consulte sempre o texto oficial da norma para implementação.</em></p>
    </div>
</body>
</html>`;

    return htmlContent;
  };

  const handleExportarRelatorio = async () => {
    setExportando(true);
    try {
      const htmlContent = gerarRelatorioPDF();
      
      // Criar nova janela para impressão/PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Aguardar carregamento e abrir dialog de impressão
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      }

      toast({
        title: "Relatório Técnico Gerado",
        description: "Use Ctrl+P ou Cmd+P para salvar como PDF na janela que se abriu.",
      });
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Não foi possível gerar o relatório técnico.",
        variant: "destructive",
      });
    } finally {
      setExportando(false);
    }
  };

  const handleCompartilharTecnico = async () => {
    setCompartilhando(true);
    try {
      const isRevogada = norma.titulo.includes("REVOGADA");
      const statusIcon = isRevogada ? "⚠️" : "✅";
      const statusText = isRevogada ? "REVOGADA" : "VIGENTE";

      const textoTecnico = `🛡️ NORMA REGULAMENTADORA DE SEGURANÇA DO TRABALHO

📋 ${norma.codigo} - ${norma.titulo}

🏛️ Órgão: ${norma.orgao_publicador}
📊 Status: ${statusIcon} ${statusText}
📅 Sistema SGN: ${new Date(norma.created_at).toLocaleDateString("pt-BR")}

${isRevogada ? 
"⚠️ ATENÇÃO: Esta norma foi revogada e não possui validade legal. Verificar norma substituta." :
"✅ Esta norma está em vigor e deve ser observada para conformidade legal."
}

🔗 Consulte detalhes: ${typeof window !== "undefined" ? window.location.href : ""}

#SegurançaDoTrabalho #NR #Conformidade #SST
───────────────────────────────
📱 Compartilhado via SGN - Sistema de Gestão Normativa`;

      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `${norma.codigo} - Norma de Segurança do Trabalho`,
          text: textoTecnico,
          url: window.location.href,
        });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(textoTecnico);
        toast({
          title: "Informações Copiadas",
          description: "Dados técnicos da norma copiados para área de transferência.",
        });
      }
    } catch (error) {
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          toast({
            title: "URL Copiada",
            description: "Link da norma copiado para compartilhamento.",
          });
        }
      } catch {
        toast({
          title: "Erro no Compartilhamento",
          description: "Não foi possível compartilhar. Copie a URL manualmente.",
          variant: "destructive",
        });
      }
    } finally {
      setCompartilhando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 pt-4 border-t">
        <Button 
          variant="outline" 
          className="flex-1 transition-all hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
          onClick={handleExportarRelatorio}
          disabled={exportando}
        >
          {exportando ? (
            <>
              <FileText className="h-4 w-4 animate-pulse" />
              Gerando Relatório...
            </>
          ) : (
            <>
              <HardHat className="h-4 w-4" />
              Relatório Técnico
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          className="flex-1 transition-all hover:bg-green-50 hover:border-green-300 hover:text-green-700"
          onClick={handleCompartilharTecnico}
          disabled={compartilhando}
        >
          {compartilhando ? (
            <>
              <CheckCircle className="h-4 w-4 animate-pulse" />
              Compartilhando...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Compartilhar SST
            </>
          )}
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border">
        <p className="font-medium mb-1">💡 Para Profissionais de Segurança:</p>
        <p>• <strong>Relatório Técnico</strong>: Gera relatório profissional em PDF para documentação oficial</p>
        <p>• <strong>Compartilhar SST</strong>: Formato específico para equipes de segurança do trabalho</p>
      </div>
    </div>
  );
}
