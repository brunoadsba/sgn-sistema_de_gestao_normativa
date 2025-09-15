'use client'

import { use } from 'react'

export default function TestePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: empresaId } = use(params)
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Página de Teste</h1>
      <div className="bg-green-100 p-4 rounded-lg">
        <p className="text-green-800">✅ Página funcionando!</p>
        <p className="text-sm text-green-600">Empresa ID: {empresaId}</p>
      </div>
      
      <div className="mt-4 bg-blue-100 p-4 rounded-lg">
        <p className="text-blue-800">🔍 Testando API de Alertas...</p>
        <button 
          onClick={async () => {
            try {
              const response = await fetch(`/api/alertas?empresa_id=${empresaId}`)
              const data = await response.json()
              console.log('Alertas:', data)
              alert(`Alertas encontrados: ${data.data?.length || 0}`)
            } catch (error) {
              console.error('Erro:', error)
              alert('Erro ao buscar alertas')
            }
          }}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Testar API
        </button>
      </div>
    </div>
  )
}
