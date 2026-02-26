# Plano de Melhoria UX/UI do Relatorio PDF (Impressao Padrao Industria)

> Atualizado em: 2026-02-25  
> Contexto: operacao local-only e single-user
> Status: historico de implementacao (consultar `docs/operations/checklist-validacao-impressao-relatorio-pdf.md` para operacao atual)

## 1. Objetivo

Elevar a qualidade visual e a confiabilidade de impressao do relatorio tecnico (Salvar como PDF) para um padrao corporativo, com layout previsivel em A4 e leitura executiva.

## 2. Diagnostico do estado atual

1. O relatorio tecnico de analise usa `window.print()` no componente de resultado:
   - `src/features/analise/components/ResultadoAnalise.tsx`
2. O endpoint `src/app/api/export/route.ts` nao gera PDF da analise; ele exporta dados de normas em JSON/CSV.
3. A aplicacao depende de classes como `no-print`, `avoid-break` e `print:*`, mas nao existe folha de estilo de impressao dedicada em `src/app/globals.css`.
4. Header global sticky e elementos de UI interativa podem vazar para impressao sem controle fino.
5. Nao existem testes automatizados focados no layout de impressao/PDF.

## 3. Diretriz arquitetural (decisao para este projeto)

Manter abordagem **browser print-first** (sem servico remoto de renderizacao PDF), pois:

1. O projeto e local-only/single-user.
2. Evita complexidade operacional desnecessaria (Puppeteer/headless service).
3. Mantem baixo custo de manutencao e alta previsibilidade local.

## 4. Escopo de implementacao

### Frente A - Template de impressao dedicado

1. Criar uma versao de relatorio orientada a impressao (clean, sem elementos de app shell).
2. Estrutura minima do documento:
   - Capa tecnica (titulo, empresa quando disponivel, jobId, data/hora, documento analisado)
   - Resumo executivo (score, nivel de risco, veredito)
   - Matriz de gaps (ordenada por severidade/classificacao GUT)
   - Plano de acao (5W2H)
   - Rodape tecnico (rastreabilidade e disclaimer)
3. Padronizar hierarquia tipografica para impressao:
   - Titulo 20-24pt
   - Secao 12-14pt
   - Corpo 10-11pt
   - Metadado 8-9pt

Arquivos alvo:
1. `src/features/analise/components/ResultadoAnalise.tsx`
2. `src/features/analise/components/*` (componentes auxiliares de impressao)

### Frente B - Sistema CSS de impressao (A4 corporativo)

1. Adicionar `@media print` em `src/app/globals.css` com regras explicitas:
   - `@page { size: A4 portrait; margin: 12mm; }`
   - classes utilitarias `.no-print`, `.only-print`, `.avoid-break`, `.page-break-before`
   - neutralizacao de fundos pesados, blur, sombras e animacoes
2. Forcar contraste de impressao:
   - texto principal em preto/cinza escuro
   - uso de cor apenas em tags criticas
3. Definir grid e espacos fixos para evitar cortes em secoes grandes.

Arquivos alvo:
1. `src/app/globals.css`
2. `tailwind.config.ts` (opcional, se adotarmos variante `print` custom via `screens.print`)

### Frente C - Fluxo UX de geracao do PDF

1. Ajustar CTA para fluxo em 2 passos:
   - "Visualizar para impressao"
   - "Imprimir / Salvar PDF"
2. Exibir orientacao curta antes da impressao:
   - Papel A4
   - Margens padrao
   - Escala 100%
   - Ativar/desativar "graficos de fundo" conforme perfil visual adotado
3. Garantir que o usuario nao imprima overlays/chat/nav.

Arquivos alvo:
1. `src/features/analise/components/ResultadoAnalise.tsx`
2. `src/features/chat-documento/components/*` (blindagem de overlays em print)
3. `src/app/layout.tsx` (controle de elementos globais no print)

### Frente D - Qualidade e validacao (padrao industria)

1. Criar checklist de qualidade de impressao:
   - sem truncar secoes
   - sem sobreposicao de elementos
   - pagina inicial com identificacao completa
   - legibilidade em P&B
2. Adicionar testes:
   - unitarios para formatadores de texto/metadados do relatorio
   - E2E smoke: abrir tela de relatorio e validar elementos-chave print-safe
3. Incluir procedimento de validacao manual com Chrome/Edge em Linux local.

Arquivos alvo:
1. `e2e/api.spec.ts` (ou nova suite `e2e/relatorio-print.spec.ts`)
2. `src/__tests__/*` (formatadores e mapeadores de relatorio)

## 5. Entregaveis esperados

1. Layout de impressao consistente em A4, pronto para auditoria.
2. Relatorio com hierarquia visual executiva e leitura rapida.
3. Eliminacao de ruido visual (chat, botoes, navegaçao, fundo animado) no PDF final.
4. Evidencias de qualidade via testes e checklist operacional.

## 6. Criterios de aceite

1. PDF gerado pelo navegador sai com paginas sem quebra ruim em blocos criticos.
2. Toda secao obrigatoria (capa, resumo, gaps, plano de acao, rodape) aparece no output.
3. Nao ha elementos interativos impressos (`buttons`, chat, header sticky).
4. Impressao em P&B preserva legibilidade e prioridade dos riscos.
5. Validacao local concluida:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npm run test:ci`
   - `npm run test:e2e`

## 7. Plano de execucao (curto prazo)

### Sprint 1 (base visual e tecnica)

1. Implementar folha de estilo de impressao global.
2. Criar utilitarios (`no-print`, `only-print`, `avoid-break`).
3. Refatorar bloco principal do relatorio para estrutura print-first.

### Sprint 2 (acabamento e UX)

1. Ajustar tipografia, espacamento e contraste para padrao corporativo.
2. Criar fluxo "Visualizar para impressao" antes de imprimir.
3. Revisar secao de assinatura/disclaimer e rastreabilidade.

### Sprint 3 (qualidade e fechamento)

1. Cobrir fluxo com E2E smoke.
2. Executar checklist manual de impressao em 2 navegadores locais.
3. Atualizar docs operacionais e changelog.

## 8. Fora de escopo neste ciclo

1. Geracao de PDF server-side com engine dedicada (Puppeteer/Playwright service).
2. Assinatura digital ICP-Brasil.
3. Multi-tenant, multi-idioma e templates por cliente.

## 9. Riscos e mitigacoes

1. **Risco:** divergencia de render entre navegadores.  
   **Mitigacao:** limitar suporte oficial a Chrome/Edge no runbook local e validar ambos.
2. **Risco:** quebra de layout por volume extremo de gaps.  
   **Mitigacao:** regras de pagina e `avoid-break` por card/tabela, alem de resumo paginado.
3. **Risco:** regressao de UX na tela interativa.  
   **Mitigacao:** separar claramente estilos de tela e estilos de impressao.

## 10. Status de execucao (2026-02-26)

1. Sprint 1 concluida.
2. Sprint 2 concluida.
3. Sprint 3 em fechamento.
4. Implementado:
   - folha de estilo global de impressao em `src/app/globals.css` com `@page A4`, utilitarios (`no-print`, `only-print`, `avoid-break`, `page-break-*`) e neutralizacao de efeitos visuais para print;
   - refatoracao do `ResultadoAnalise` com secao dedicada print-first (`only-print`) e isolamento da interface interativa (`no-print`);
   - blindagem de shell visual no print (header global e canvas de fundo marcados como `no-print`).
   - fluxo UX em dois passos: `Visualizar para Impressao` -> `Imprimir / Salvar PDF`;
   - modo de pre-visualizacao A4 em tela com orientacoes operacionais de impressao.
   - resumo sanitizado sem “Análise consolidada…” nem “ID do Job”, nomenclatura “Pontos Fortes”/“Pontos de Atenção” mantida próxima aos parágrafos associados e “Matriz de Gaps” agrupada à tabela subsequente; download padronizado como `Relatório_SGN_dd-mm-yyyy_HH-MM`.
   - checklist operacional de validacao manual em `docs/operations/checklist-validacao-impressao-relatorio-pdf.md`.
   - correcoes no `src/app/globals.css` para modo `print-preview-active` ocultar shell visual (header/canvas) e consolidar utilitarios de impressao (`no-print`, `only-print`, `avoid-break`, `print-keep-with-next`, `@media print` com `@page A4`).
   - validacao técnica em Chrome (v143.0.7499.192) registrada em `test-results/print-validation-chrome.json` e `test-results/print-preview-chrome.png`.
5. Validacao executada:
   - `npx tsc --noEmit` ✅
   - `npm run lint` ✅
   - `npm run test:ci` ✅
   - `npm run test:e2e` ✅
6. Pendente para fechamento integral da Sprint 3:
   - executar checklist manual no Microsoft Edge e registrar evidencias na tabela de execucao.
