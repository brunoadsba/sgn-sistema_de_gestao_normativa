# POP - Uso do SGN para Analise de Conformidade SST

> Atualizado em: 2026-02-24

## 1. Objetivo

Padronizar a execucao de analises SST no SGN, garantindo rastreabilidade e priorizacao das acoes corretivas.

## 2. Escopo

Aplicar em todo documento novo ou revisado de SST (`PGR`, `PCMSO`, `LTCAT` e correlatos).

## 3. Responsabilidades

1. Executor: Tecnico(a) de SST.
2. Revisor: Coordenacao/Responsavel SST.
3. Aprovador: Gestao da area.

## 4. Pre-requisitos

1. SGN acessivel.
2. Arquivo em `PDF`, `DOCX` ou `TXT` ate 100MB.
3. NRs aplicaveis previamente definidas.
4. Documento na versao vigente.

## 5. Procedimento operacional

1. Acessar a tela principal de analise no SGN.
2. Fazer upload do documento na coluna `Fontes`.
3. Selecionar NRs aplicaveis na coluna `Estudio`.
4. Opcional: consultar o NEX na coluna `Chat` para duvidas antes da analise.
5. Acionar `Analisar com IA`.
6. Acompanhar o progresso no stepper/polling ate conclusao.
7. Validar resultado tecnico:
   - score geral
   - gaps com severidade e classificacao GUT
   - prazo sugerido
   - plano 5W2H (quando disponivel)
8. Se necessario, abrir o drawer do NEX para aprofundar orientacoes de remediacao.
9. Classificar prioridade e abrir plano de acao.
10. Reprocessar documento apos correcao para medir evolucao.

## 6. Criterios de decisao

1. Gaps criticos: acao imediata no mesmo dia.
2. Gaps altos: tratar com prazo curto formal.
3. Queda de score: obrigatorio revisar causa-raiz.
4. Falta de informacao no documento: solicitar complemento e reprocessar.

## 7. Evidencias obrigatorias

1. Nome e versao do documento.
2. Data/hora da analise.
3. NRs selecionadas.
4. Resultado (score e gaps).
5. Exportacao do historico (CSV ou JSON).
6. Plano de acao aprovado com responsavel e prazo.

## 8. Frequencia recomendada

1. A cada mudanca documental.
2. Revisao semanal de status.
3. Consolidacao mensal de evolucao.

## 9. Gate GO/NO-GO

### GO

1. Base normativa carregada e consistente.
2. Qualidade tecnica verde (`lint`, `build`, `test:e2e`).
3. Resultado com rastreabilidade de evidencias.
4. Plano para gaps criticos e altos definido.

### NO-GO

1. Norma essencial ausente para o contexto da analise.
2. Falha em gate tecnico critico.
3. Resultado sem rastreabilidade suficiente para decisao.

## 10. Observacao

O SGN apoia a decisao tecnica, mas a responsabilidade final permanece com o profissional de SST.
