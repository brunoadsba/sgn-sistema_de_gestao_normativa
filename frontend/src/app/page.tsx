import { supabase } from '@/lib/supabase'
import { unstable_cache } from 'next/cache'
import { Suspense } from 'react'

// 🔧 REMOVIDO: Edge Runtime (problemático em dev)
// export const runtime = 'edge'

interface Norma {
  titulo: string
}

interface StatsCardProps {
  title: string
  value: number
  color: string
}

// 🚀 COMPONENT OTIMIZADO (mantém melhorias visuais)
function StatsCard({ title, value, color }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="font-medium text-gray-600">{title}</h3>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

// 🚀 CACHE OTIMIZADO (mantém performance)
const getCachedStats = unstable_cache(
  async () => {
    // Buscar estatísticas em paralelo (otimização mantida)
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
    revalidate: 300,
    tags: ['dashboard'] 
  }
)

// 🚀 LOADING OTIMIZADO (mantém UX)
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  )
}

// 🚀 STATS COMPONENT ASSÍNCRONO (mantém Streaming)
async function StatsSection() {
  const stats = await getCachedStats()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard title="Total de Normas" value={stats.total} color="text-blue-600" />
      <StatsCard title="Normas Ativas" value={stats.ativas} color="text-green-600" />
      <StatsCard title="Normas Revogadas" value={stats.revogadas} color="text-red-600" />
      <StatsCard title="Atualizações" value={stats.atualizacoes} color="text-blue-600" />
    </div>
  )
}

export const revalidate = 300

// 🚀 PÁGINA COM STREAMING (sem Edge Runtime)
export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Sistema de Gestão Normativa - Dados em tempo real
        </p>
      </div>
      
      {/* 🚀 STREAMING SSR (mantém benefício) */}
      <Suspense fallback={<StatsLoading />}>
        <StatsSection />
      </Suspense>
    </div>
  )
}
