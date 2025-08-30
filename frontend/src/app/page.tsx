import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

async function getStats() {
  try {
    const res = await fetch("/api/normas/stats", {
      next: { revalidate: 60 }
    });
    return await res.json();
  } catch (error) {
    return { success: false, data: null };
  }
}

async function getNormas() {
  try {
    const res = await fetch("/api/normas?limit=5", {
      next: { revalidate: 60 }
    });
    return await res.json();
  } catch (error) {
    return { success: false, data: [] };
  }
}

export default async function Dashboard() {
  const [stats, normas] = await Promise.all([getStats(), getNormas()]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de monitoramento de normas regulamentadoras
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Normas</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📋</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.data?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Normas monitoradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normas Ativas</CardTitle>
            <div className="h-4 w-4 text-green-600">✅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.data?.ativas || 0}</div>
            <p className="text-xs text-muted-foreground">Em vigor atualmente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normas Revogadas</CardTitle>
            <div className="h-4 w-4 text-red-600">❌</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.data?.revogadas || 0}</div>
            <p className="text-xs text-muted-foreground">Não estão mais em vigor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atualizações</CardTitle>
            <div className="h-4 w-4 text-blue-600">🔄</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.data?.recentes || 0}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Normas Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Normas Recentes</CardTitle>
              <CardDescription>Últimas normas adicionadas ao sistema</CardDescription>
            </div>
            <Badge variant="outline">
              {normas.data?.length || 0} de {stats.data?.total || 0}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {normas.data?.slice(0, 5).map((norma) => (
              <div key={norma.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium">{norma.codigo}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{norma.titulo}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{norma.orgao_publicador}</Badge>
                    {norma.titulo.includes("REVOGADA") ? (
                      <Badge variant="destructive" className="text-xs">Revogada</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-600 text-xs">Ativa</Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(norma.created_at).toLocaleDateString("pt-BR")}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
