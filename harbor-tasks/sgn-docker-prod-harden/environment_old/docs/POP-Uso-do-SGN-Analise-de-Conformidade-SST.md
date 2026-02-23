# POP - Uso do SGN para Analise de Conformidade SST

## 1) Objetivo

1. Padronizar o uso do SGN para analise de documentos de SST.
2. Garantir registro, rastreabilidade e priorizacao das acoes corretivas.

## 2) Quando aplicar

1. Sempre que houver documento novo ou revisado (PGR, PCMSO, LTCAT e similares).
2. Em revisoes periodicas (semanal/mensal) de conformidade.

## 3) Responsaveis

1. Executor: Tecnico em Seguranca do Trabalho.
2. Revisor: Coordenador/Responsavel SST (quando aplicavel).
3. Aprovador do plano de acao: Gestao da area.

## 4) Pre-requisitos

1. Confirmar acesso ao sistema SGN.
2. Ter o documento em `PDF`, `DOCX` ou `TXT` (ate 100MB).
3. Saber quais NRs se aplicam ao documento.
4. Verificar se o documento esta na versao mais recente.

## 5) Procedimento operacional (passo a passo)

1. Acessar o SGN na pagina `Analise de Conformidade` ou localizar uma NR no Catálogo e clicar em `Analisar documento com esta NR`.
2. Fazer upload do documento.
3. Selecionar as NRs aplicaveis.
4. Clicar em `Analisar Conformidade com IA`.
5. Aguardar finalizacao da analise.
6. Ler o resultado completo:
   1. score geral;
   2. gaps identificados;
   3. severidade dos gaps;
   4. proximos passos sugeridos.
7. Classificar prioridades:
   1. Critico/Alto: acao imediata;
   2. Medio: programar em curto prazo;
   3. Baixo: incluir em melhoria continua.
8. Registrar plano de acao interno com responsavel e prazo por gap.
9. Exportar historico em CSV para arquivo de evidencia.
10. Reanalisar apos correcoes para validar evolucao.

## 6) Criterios de decisao

1. Se houver gaps criticos, abrir acao corretiva no mesmo dia.
2. Se houver gaps altos, tratar com prazo curto definido.
3. Se score cair em relacao a analise anterior, revisar causa antes de encerrar.
4. Se faltar informacao no documento, solicitar complemento e reprocessar.

## 7) Evidencias obrigatorias

1. Documento analisado (nome e versao).
2. Data/hora da analise.
3. NRs selecionadas.
4. Resultado (score + gaps).
5. CSV exportado do historico.
6. Plano de acao com responsavel e prazo.

## 8) Checklist rapido de execucao

1. Documento correto e atualizado.
2. NRs corretas selecionadas.
3. Analise concluida sem erro.
4. Gaps criticos/altos tratados.
5. Evidencias salvas (CSV + plano de acao).
6. Reanalise programada.

## 9) Frequencia recomendada

1. Analise em toda atualizacao de documento.
2. Revisao consolidada semanal.
3. Fechamento mensal com comparacao de evolucao.

## 10) Observacao importante

1. O SGN apoia a decisao tecnica; a validacao final e do profissional de SST.
2. Em caso de duvida tecnica ou regulatoria, usar tambem a fonte oficial da NR.

## 11) Checklist operacional portuario (CODEBA - Ilheus)

1. Para operacoes no cais e area portuaria, incluir sempre `NR-29`.
2. Quando houver atividade aquaviaria, incluir sempre `NR-30`.
3. Incluir NRs correlatas conforme o tipo de fiscalizacao:
   1. EPI: `NR-6`
   2. Instalacoes eletricas: `NR-10`
   3. Maquinas/equipamentos: `NR-12`
   4. Ergonomia: `NR-17`
   5. Trabalho em altura: `NR-35`
   6. Espaco confinado: `NR-33`
   7. Inflamaveis/combustiveis: `NR-20`
4. Confirmar se o documento analisado descreve:
   1. area/operacao portuaria inspecionada;
   2. riscos principais;
   3. medidas de controle existentes;
   4. responsavel tecnico e data de revisao.
5. Se o documento nao trouxer contexto operacional minimo, classificar como dado insuficiente e solicitar complemento.

## 12) Gate de prontidao (GO/NO-GO)

### GO

1. Base local completa com `NR-1` a `NR-38` em `data/normas`.
2. `KB_STRICT_MODE=true` ativo no ambiente de operacao.
3. Validacoes tecnicas verdes (`lint`, `build`, `test:e2e`).
4. Analise real concluida com Recall >= 0.90 no Harbor Scorecard e rastreabilidade de evidencias normativas.
5. Plano de acao definido para gaps criticos/altos.

### NO-GO

1. Falta de qualquer norma essencial no repositorio local.
2. Modo estrito desativado no ambiente produtivo.
3. Falha em qualquer gate tecnico critico.
4. Resultado sem condicoes de rastreabilidade para decisao fiscal.
