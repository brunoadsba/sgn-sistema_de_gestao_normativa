-- Tabela para Sistema de Alertas de Conformidade
-- Criada em: 15 de setembro de 2025
-- Objetivo: Gerenciar alertas de conformidade por empresa
-- Banco: PostgreSQL (Supabase)

CREATE TABLE IF NOT EXISTS alertas_conformidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados do alerta
  tipo TEXT NOT NULL CHECK (tipo IN ('oportunidade', 'risco', 'prazo', 'conformidade')),
  severidade TEXT NOT NULL CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  acao_requerida TEXT NOT NULL,
  
  -- Metadados
  prazo TIMESTAMPTZ NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'resolvido', 'ignorado')),
  
  -- Referências opcionais (sem FK para evitar erros de dependência)
  norma_id BIGINT NULL,
  documento_id UUID NULL,
  analise_id UUID NULL,
  
  -- Timestamps (PostgreSQL/Supabase padrão)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ NULL,
  
  -- Metadados adicionais (JSONB nativo do PostgreSQL)
  metadata JSONB DEFAULT '{}'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_alertas_empresa_id ON alertas_conformidade(empresa_id);
CREATE INDEX IF NOT EXISTS idx_alertas_status ON alertas_conformidade(status);
CREATE INDEX IF NOT EXISTS idx_alertas_severidade ON alertas_conformidade(severidade);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas_conformidade(tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_prazo ON alertas_conformidade(prazo) WHERE prazo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alertas_created_at ON alertas_conformidade(created_at DESC);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_alertas_empresa_status ON alertas_conformidade(empresa_id, status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_alertas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_alertas_updated_at
  BEFORE UPDATE ON alertas_conformidade
  FOR EACH ROW
  EXECUTE FUNCTION update_alertas_updated_at();

-- RLS (Row Level Security) - Supabase padrão
ALTER TABLE alertas_conformidade ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura anônima (desenvolvimento)
-- Em produção, ajustar para autenticação adequada
CREATE POLICY "Permitir leitura anônima de alertas" ON alertas_conformidade
  FOR SELECT USING (true);

-- Política para permitir inserção anônima (desenvolvimento)
CREATE POLICY "Permitir inserção anônima de alertas" ON alertas_conformidade
  FOR INSERT WITH CHECK (true);

-- Política para permitir atualização anônima (desenvolvimento)
CREATE POLICY "Permitir atualização anônima de alertas" ON alertas_conformidade
  FOR UPDATE USING (true);

-- Política para permitir exclusão anônima (desenvolvimento)
CREATE POLICY "Permitir exclusão anônima de alertas" ON alertas_conformidade
  FOR DELETE USING (true);

-- Comentários para documentação
COMMENT ON TABLE alertas_conformidade IS 'Sistema de alertas de conformidade por empresa';
COMMENT ON COLUMN alertas_conformidade.tipo IS 'Tipo do alerta: oportunidade, risco, prazo, conformidade';
COMMENT ON COLUMN alertas_conformidade.severidade IS 'Severidade: baixa, media, alta, critica';
COMMENT ON COLUMN alertas_conformidade.status IS 'Status: ativo, resolvido, ignorado';
COMMENT ON COLUMN alertas_conformidade.prazo IS 'Prazo para resolução do alerta (opcional)';
COMMENT ON COLUMN alertas_conformidade.metadata IS 'Metadados adicionais em formato JSON';
COMMENT ON COLUMN alertas_conformidade.norma_id IS 'ID da norma relacionada (referência manual)';
COMMENT ON COLUMN alertas_conformidade.documento_id IS 'ID do documento relacionado (referência manual)';
COMMENT ON COLUMN alertas_conformidade.analise_id IS 'ID da análise relacionada (referência manual)';
