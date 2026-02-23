import { getNormas } from '@/lib/data/normas'
import AnaliseCliente from '@/features/analise/components/AnaliseCliente'

export default function AnalisePage() {
  const normasCompletas = getNormas()
  const normas = normasCompletas.map(n => ({
    id: n.id,
    codigo: n.codigo,
    titulo: n.titulo,
    categoria: n.categoria
  }))

  return <AnaliseCliente normasIniciais={normas} />
}
