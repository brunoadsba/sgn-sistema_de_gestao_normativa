import { supabase } from '@/lib/supabase'
import { unstable_cache } from 'next/cache'

// Interface para tipagem
interface Norma {
  titulo: string
}

// Cache server-side por 5 minutos
const getCachedStats = unstable_cache(
  async () => {
    // Buscar estatísticas em paralelo
    const [
      { count: total },
      { data: normas }
    ] = await Promise.all([
      supabase.from('normas').select('*', { count: 'exact', head: true }),
      supabase.from('normas').select('titulo')
    ])

    const ativas = (normas as Norma[])?.filter((n: Norma) => !n.titulo.includes('REVOGADA')).length || 0
    const revogadas = (total || 0) - ativas
    
    return {
      total: total || 0,
      ativas,
      revogadas,
      atualizacoes: total || 0
    }
  },
  ['dashboard-stats'],
  { 
    revalidate: 300, // 5 minutos
    tags: ['dashboard'] 
  }
)

export const revalidate = 300 // ISR - 5 minutos

export default async function Dashboard() {
  const stats = await getCachedStats()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Sistema de Gestão Normativa - Dados em tempo real
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-medium">Total de Normas</h3>
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-medium">Normas Ativas</h3>
          <div className="text-2xl font-bold text-green-600">{stats.ativas}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-medium">Normas Revogadas</h3>
          <div className="text-2xl font-bold text-red-600">{stats.revogadas}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-medium">Atualizações</h3>
          <div className="text-2xl font-bold text-blue-600">{stats.atualizacoes}</div>
        </div>
      </div>
    </div>
  )
}
