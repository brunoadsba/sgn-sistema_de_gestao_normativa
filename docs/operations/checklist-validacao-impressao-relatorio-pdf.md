# Checklist de Validacao Manual — Impressao do Relatorio PDF

> Atualizado em: 2026-02-26  
> Escopo: operacao local-only/single-user

## 1. Pre-requisitos

1. Aplicacao em execucao local (`npm run dev`).
2. Documento de teste carregado e analise concluida.
3. Resultado exibido em `ResultadoAnalise`.

## 2. Navegadores-alvo

1. Google Chrome (desktop)
2. Microsoft Edge (desktop)

## 3. Configuracao recomendada no dialogo de impressao

1. Destino: Salvar como PDF
2. Papel: A4
3. Escala: 100%
4. Margens: Padrao
5. Graficos de fundo: desligado (ligar apenas se auditoria exigir identidade visual)

## 4. Passos de validacao

1. Clicar em `Visualizar para Impressao`.
2. Confirmar exibição da barra de preview com orientacoes.
3. Confirmar que o layout A4 fica centralizado e legivel na tela.
4. Confirmar que header global, chat, botoes e canvas de fundo nao aparecem no preview.
5. Clicar em `Imprimir / Salvar PDF` (engine `dom`) ou `Gerar PDF` (quando `NEXT_PUBLIC_PDF_ENGINE=react-pdf`).
6. Salvar PDF e abrir o arquivo gerado.
7. Confirmar que o arquivo segue o padrão `Relatório_SGN_dd-mm-yyyy_HH-MM` (horário de Brasília) e que o corpo do PDF não exibe “ID do Job”.
8. Validar secoes obrigatorias:
   - Titulo e metadados de rastreabilidade
   - Resumo executivo
   - Matriz de gaps
   - Plano de acao
   - Rodape tecnico
   - No relatório da UI, confirmar colunas da matriz: `Severidade`, `Categoria`, `Norma`, `Status`, `Descrição`, `Recomendação`.
   - Confirmar badges de severidade e status com cores semânticas.
   - Confirmar ausência de hifenização automática indevida de termos técnicos na matriz.
   - Garantir que o cabeçalho “Matriz de Gaps” permanece na mesma página que a tabela de gaps e logo acima das informações relacionadas.
   - Conferir que os blocos “Pontos Fortes” e “Pontos de Atenção” utilizam os nomes esperados e aparecem próximos às listas ou descrições que os seguem.
   - Verificar que o resumo não traz a frase “Análise consolidada de 2 blocos do documento.” nem “Pontos-Chave”.
9. Confirmar legibilidade em preto e branco.
10. Repetir no segundo navegador alvo.

## 5. Criterios de aprovacao

1. Nenhuma secao obrigatoria ausente.
2. Sem sobreposicao de texto ou truncamento grave.
3. Sem elementos de interface interativa no PDF final.
4. Quebras de pagina coerentes para leitura executiva.

## 6. Registro de execucao

| Data | Navegador | Versao | Resultado | Observacoes |
|---|---|---|---|---|
| 2026-02-26 | Chrome | 143.0.7499.192 | Aprovado | Checklist executado com fluxo completo de preview/impressao; evidencias em `test-results/print-validation-chrome.json` e `test-results/print-preview-chrome.png`. |
| 2026-02-26 | Edge | - | Pendente (bloqueado) | Microsoft Edge nao disponivel neste ambiente local de validacao. |
