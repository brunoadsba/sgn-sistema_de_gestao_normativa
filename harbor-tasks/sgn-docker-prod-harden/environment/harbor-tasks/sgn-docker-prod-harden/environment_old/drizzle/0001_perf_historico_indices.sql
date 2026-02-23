CREATE INDEX IF NOT EXISTS idx_analise_resultados_created_at
  ON analise_resultados(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analise_resultados_score_geral
  ON analise_resultados(score_geral DESC);

CREATE INDEX IF NOT EXISTS idx_conformidade_gaps_analise_resultado_id
  ON conformidade_gaps(analise_resultado_id);
