import { PageLoading } from '@/components/loading/LoadingSpinner'

export default function NormaDetalheLoading() {
  return (
    <PageLoading
      title="Carregando detalhes da norma..."
      description="Buscando informações e anexos oficiais"
    />
  )
}
