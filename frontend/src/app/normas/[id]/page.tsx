import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getNorma(id: string) {
  try {
    const res = await fetch(`http://localhost:3001/api/normas/${id}`, {
      cache: "no-store"
    });
    return await res.json();
  } catch (error) {
    return { success: false, data: null };
  }
}

export default async function NormaDetalhes({ params }: { params: { id: string } }) {
  const result = await getNorma(params.id);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600">Norma não encontrada</h1>
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
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{norma.codigo}</CardTitle>
                <CardDescription className="text-lg mt-2 leading-relaxed">
                  {norma.titulo}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {isRevogada ? (
                  <Badge variant="destructive" className="text-sm">Revogada</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-600 text-sm">Em Vigor</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-base mb-2">Órgão Responsável</h3>
                  <p className="text-muted-foreground">{norma.orgao_publicador}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-base mb-2">Status</h3>
                  <p className="text-muted-foreground">
                    {isRevogada ? "Esta norma foi revogada e não está mais em vigor" : "Norma ativa e em vigor"}
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
                  <h3 className="font-semibold text-base mb-2">Categoria Principal</h3>
                  <p className="text-muted-foreground">
                    {norma.titulo.includes("SEGURANÇA") ? "Segurança do Trabalho" :
                     norma.titulo.includes("SAÚDE") ? "Saúde Ocupacional" :
                     norma.titulo.includes("EQUIPAMENTO") ? "Equipamentos de Proteção" :
                     "Disposições Gerais"}
                  </p>
                </div>
              </div>
            </div>

            {isRevogada && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Norma Revogada</h4>
                <p className="text-red-700 text-sm">
                  Esta norma regulamentadora foi revogada e não possui mais validade legal. 
                  Consulte a legislação atual para verificar a norma que a substituiu.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1">
                📋 Exportar Detalhes
              </Button>
              <Button variant="outline" className="flex-1">
                📤 Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
