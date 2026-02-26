# POP - Uso do SGN para Analise de Conformidade SST

> Atualizado em: 2026-02-26

## 1. Objetivo

Padronizar a execucao de analises SST no SGN com rastreabilidade e priorizacao de acao.

## 2. Escopo

Aplica-se a documentos SST (`PGR`, `PCMSO`, `LTCAT` e correlatos) em ambiente local.

## 3. Responsabilidades

1. Executor: Tecnico(a) SST.
2. Revisor: Coordenacao SST.
3. Aprovador: Gestao da area.

## 4. Pre-requisitos

1. SGN operacional em `http://localhost:3001`.
2. Documento em `PDF`, `DOCX` ou `TXT`.
3. NRs aplicaveis definidas.
4. Versao vigente do documento de origem.

## 5. Procedimento Operacional

1. Acessar a pagina principal de analise.
2. Carregar documento na etapa `Documento Fonte`.
3. Selecionar NRs na etapa `Configuracao de Auditoria`.
4. Opcional: abrir `CONSULTAR NEX` para exploracao contextual.
5. Executar `Analisar com IA`.
6. Aguardar retorno do processamento.
7. Validar resultado:
   - score
   - gaps por severidade
   - recomendacoes
   - proximos passos
8. Registrar evidencias e abrir plano de acao.
9. Reprocessar apos correcao para medir evolucao.

## 6. Criterios de Decisao

1. Gap critico: acao imediata.
2. Gap alto: acao de curto prazo com responsavel.
3. Queda de score: revisao obrigatoria de causa-raiz.
4. Falta de evidencias no documento: solicitar complemento e reprocessar.

## 7. Evidencias Obrigatorias

1. Nome do arquivo e versao documental.
2. Data/hora da analise.
3. NRs selecionadas.
4. Resultado (score e gaps).
5. Exportacao em CSV/JSON quando aplicavel.
6. Responsavel e prazo da acao corretiva.

## 8. Gate GO/NO-GO

### GO

1. Base normativa consistente para o caso.
2. Resultado com rastreabilidade suficiente para decisao.
3. Plano de acao definido para gaps criticos/altos.

### NO-GO

1. Norma essencial ausente para o contexto.
2. Resultado inconclusivo ou sem lastro minimo.
3. Instabilidade operacional que comprometa a confiabilidade da analise.

## 9. Observacao

O SGN apoia decisao tecnica. A responsabilidade final permanece com o profissional de SST.
