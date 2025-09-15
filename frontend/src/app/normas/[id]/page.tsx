import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CheckCircle, AlertTriangle } from "lucide-react";
import BotoesSeguranca from "./components/BotoesSeguranca";

// Função necessária para deploy estático
export async function generateStaticParams() {
  // IDs mockados para demonstração
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' }
  ];
}

async function getNorma(id: string) {
  // Dados mockados para demonstração
  const normasMock = [
    {
      id: 1,
      codigo: "NR-01 - Disposições Gerais",
      titulo: "NR-01 - Disposições Gerais",
      orgao_publicador: "MTE",
      created_at: "2025-01-15T00:00:00Z"
    },
    {
      id: 2,
      codigo: "NR-02 - Inspeção Prévia",
      titulo: "NR-02 - Inspeção Prévia",
      orgao_publicador: "MTE",
      created_at: "2025-01-14T00:00:00Z"
    },
    {
      id: 3,
      codigo: "NR-03 - Embargo ou Interdição",
      titulo: "NR-03 - Embargo ou Interdição",
      orgao_publicador: "MTE",
      created_at: "2025-01-13T00:00:00Z"
    },
    {
      id: 4,
      codigo: "NR-04 - Serviços Especializados em Engenharia de Segurança e em Medicina do Trabalho",
      titulo: "NR-04 - Serviços Especializados em Engenharia de Segurança e em Medicina do Trabalho",
      orgao_publicador: "MTE",
      created_at: "2025-01-12T00:00:00Z"
    },
    {
      id: 5,
      codigo: "NR-05 - Comissão Interna de Prevenção de Acidentes",
      titulo: "NR-05 - Comissão Interna de Prevenção de Acidentes",
      orgao_publicador: "MTE",
      created_at: "2025-01-11T00:00:00Z"
    }
  ];

  const norma = normasMock.find(n => n.id.toString() === id);
  
  if (!norma) {
    return { success: false, data: null };
  }

  return { success: true, data: norma };
}

export default async function NormaDetalhes({ 
  params 
}: { 
  params: { id: string } 
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  const result = await getNorma(id);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600">Norma não encontrada</h1>
          <p className="text-muted-foreground mt-2">ID solicitado: {id}</p>
          <Link href="/normas">
            <Button variant="outline" className="mt-4">Voltar para lista</Button>
          </Link>
        </div>
      </div>
    );
  }

  const norma = result.data;
  const isRevogada = norma.titulo.includes("REVOGADA");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/normas">
            <Button variant="outline">← Voltar para lista</Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold text-gray-900">{norma.codigo.split(' - ')[0]}</h1>
                    {isRevogada ? (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Revogada
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Em Vigor
                      </Badge>
                    )}
                  </div>
                </div>
                
                <h2 className="text-xl text-gray-700 mb-6 leading-relaxed">
                  {norma.titulo}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-base mb-2">Órgão Responsável</h3>
                  <p className="text-muted-foreground">{norma.orgao_publicador}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-2">Status Legal</h3>
                  <p className="text-muted-foreground">
                    {isRevogada ? "Norma revogada - sem validade legal" : "Norma ativa e em vigor"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-base mb-2">Adicionada ao Sistema</h3>
                  <p className="text-muted-foreground">
                    {new Date(norma.created_at).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "long", 
                      year: "numeric"
                    })}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-2">Categoria de Segurança</h3>
                  <p className="text-muted-foreground">
                    {norma.titulo.includes("SEGURANÇA") ? "Segurança do Trabalho" :
                     norma.titulo.includes("SAÚDE") ? "Saúde Ocupacional" :
                     norma.titulo.includes("EQUIPAMENTO") ? "Equipamentos de Proteção Individual" :
                     norma.titulo.includes("CONSTRUÇÃO") ? "Segurança na Construção Civil" :
                     norma.titulo.includes("RURAL") ? "Segurança no Trabalho Rural" :
                     "Disposições Gerais de Segurança"}
                  </p>
                </div>
              </div>
            </div>

            {isRevogada && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Norma Revogada - Atenção Profissional
                </h4>
                <p className="text-red-700 text-sm">
                  Esta norma regulamentadora foi <strong>revogada</strong> e não possui mais validade legal. 
                  Para conformidade com a legislação de segurança do trabalho, consulte a legislação atual 
                  para verificar a norma que a substituiu. <strong>Não utilize para implementação.</strong>
                </p>
              </div>
            )}

            <BotoesSeguranca norma={norma} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
