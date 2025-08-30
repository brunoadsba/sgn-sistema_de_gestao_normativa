export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Sistema de Gestão Normativa - Funcionando!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-medium">Total de Normas</h3>
          <div className="text-2xl font-bold text-blue-600">38</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-medium">Normas Ativas</h3>
          <div className="text-2xl font-bold text-green-600">36</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-medium">Normas Revogadas</h3>
          <div className="text-2xl font-bold text-red-600">2</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-medium">Atualizações</h3>
          <div className="text-2xl font-bold text-blue-600">38</div>
        </div>
      </div>
    </div>
  )
}
