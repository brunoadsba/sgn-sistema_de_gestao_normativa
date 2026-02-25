# Documentacao SGN

Este diretorio centraliza a documentacao oficial do projeto SGN com estrutura de padrao industria.

## Estado atual (fonte unica)

- Atualizado em: `2026-02-25`
- Modelo operacional: `local-only`, single-user
- CI ativo: workflow `ci` em `.github/workflows/ci.yml`
- Deploy/release: descontinuados (sem workflow ativo)

## Estrutura oficial

| Area | Caminho | Objetivo |
|---|---|---|
| Arquitetura | `docs/architecture/arquitetura-tecnica.md` | Visao tecnica, componentes, fluxos e decisoes arquiteturais |
| Operacao | `docs/operations/` | Runbooks e procedimentos operacionais |
| Referencia | `docs/reference/` | Guias de especificacao funcional e prompt tecnico |
| Governanca | `docs/governance/documentacao.md` | Politica de escrita, manutencao e ciclo de revisao |
| Harbor | `docs/harbor/` | Operacao e historico de execucoes Harbor |
| Historico vivo | `docs/memory.md` | Contexto acumulado de sessoes e estado do projeto |
| Arquivo | `docs/archive/` | Materiais historicos, analises antigas e legados |

## Leitura por perfil

1. Desenvolvimento
   - Comece por `docs/architecture/arquitetura-tecnica.md`
   - Siga para `CONTRIBUTING.md`
2. Operacao local/execucao
   - Consulte `README.md`
   - Consulte `docs/operations/pop-analise-conformidade-sst.md`
3. Operacao local e infraestrutura
   - Consulte `docs/operations/operacao-local.md`
   - Consulte `SECURITY.md`
4. Continuidade e handoff de IA
   - Consulte `docs/memory.md`

## Regras de organizacao

1. Todo novo documento deve entrar em uma das areas oficiais acima.
2. Nao criar documentos soltos na raiz de `docs/` sem justificativa.
3. Documento substituido deve ir para `docs/archive/` e manter ponteiro no caminho antigo quando necessario.
4. Mudancas arquiteturais, operacionais ou de seguranca exigem atualizacao da documentacao correspondente no mesmo PR.
5. `docs/memory.md` continua sendo a memoria operacional, nao substitui documentacao normativa.

## Conjunto minimo para versao local

- `README.md` atualizado
- `docs/architecture/arquitetura-tecnica.md` atualizado
- `docs/operations/operacao-local.md` atualizado (quando houver impacto operacional)
- `docs/operations/pop-analise-conformidade-sst.md` atualizado (quando houver impacto no fluxo do usuario)
- `SECURITY.md` atualizado (quando houver impacto de risco/controles)
- `CHANGELOG.md` atualizado
