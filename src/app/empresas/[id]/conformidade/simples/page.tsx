'use client'

import { use } from 'react'

export default function ConformidadeSimples({ params }: { params: Promise<{ id: string }> }) {
  const { id: empresaId } = use(params)
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard de Conformidade
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total de Análises</h3>
            <p className="text-3xl font-bold text-blue-600">2</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Índice de Conformidade</h3>
            <p className="text-3xl font-bold text-green-600">87%</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Oportunidades de Melhoria</h3>
            <p className="text-3xl font-bold text-orange-600">6</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Documentos Avaliados</h3>
            <p className="text-3xl font-bold text-purple-600">4</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Oportunidades de Melhoria Identificadas
          </h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
              <h3 className="font-semibold text-red-800">NR-35: Trabalho em Altura - Treinamento Vencido</h3>
              <p className="text-red-700 text-sm">Funcionários da equipe de construção não possuem treinamento atualizado em trabalho em altura.</p>
              <p className="text-red-600 text-xs mt-2">Ação: Agendar treinamento de reciclagem NR-35 para toda equipe</p>
            </div>
            
            <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
              <h3 className="font-semibold text-yellow-800">NR-18: Implementar Sistema de Gestão de Segurança</h3>
              <p className="text-yellow-700 text-sm">Oportunidade de implementar sistema digital para gestão de segurança conforme NR-18.</p>
              <p className="text-yellow-600 text-xs mt-2">Ação: Avaliar e implementar sistema de gestão digital de segurança</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800">✅ Página funcionando corretamente!</p>
          <p className="text-sm text-blue-600">Empresa ID: {empresaId}</p>
        </div>
      </div>
    </div>
  )
}
