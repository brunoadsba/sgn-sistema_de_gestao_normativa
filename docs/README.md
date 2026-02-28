# Documentacao SGN

Este diretorio concentra a documentacao oficial do projeto.

## Snapshot

- Atualizado em: `2026-02-28`
- Versao documental: `2.3.0`
- Modelo operacional: `local-only`, single-user
- Pipeline oficial: `ci` em `.github/workflows/ci.yml`
- Politica atual: sem deploy remoto oficial
- Gate legal ativo: relatorio em `pre_laudo_pendente` com revisão humana obrigatória.
- PDF técnico em modo híbrido (`dom` + `react-pdf` via `NEXT_PUBLIC_PDF_ENGINE`).

## Estrutura Oficial

| Dominio | Caminho | Finalidade |
|---|---|---|
| Arquitetura | `docs/architecture/arquitetura-tecnica.md` | Componentes, fluxos, limites e debitos tecnicos |
| Operacao | `docs/operations/` | Runbooks, POPs, checklists operacionais |
| Referencia | `docs/reference/` | Contratos e mapeamentos funcionais |
| Governanca | `docs/governance/` | Padrao documental, 5S e ciclo de manutencao |
| Memoria | `docs/memory.md` | Estado operacional consolidado e historico resumido |
| Arquivo | `docs/archive/` | Conteudo legado e historico descontinuado |

## Conjunto Canonico Minimo

1. `README.md`
2. `CHANGELOG.md`
3. `docs/architecture/arquitetura-tecnica.md`
4. `docs/operations/operacao-local.md`
5. `docs/operations/pop-analise-conformidade-sst.md`
6. `docs/governance/documentacao.md`
7. `docs/governance/5s-documentacao.md`
8. `docs/memory.md`
9. `SECURITY.md`
10. `CONTRIBUTING.md`

## Regras 5S de Documentacao

1. **Seiri (Utilizacao)**: separar conteudo ativo de legado e mover descontinuados para `docs/archive/`.
2. **Seiton (Organizacao)**: manter cada documento no dominio correto (`architecture`, `operations`, etc).
3. **Seiso (Limpeza)**: remover inconsistencias de versao, status e comandos.
4. **Seiketsu (Padronizacao)**: usar template e secoes obrigatorias definidos em `docs/governance/documentacao.md`.
5. **Shitsuke (Disciplina)**: revisar docs em todo PR com impacto de fluxo, API, schema, env ou seguranca.

## Leitura Recomendada por Perfil

1. Desenvolvimento
   - `docs/architecture/arquitetura-tecnica.md`
   - `CONTRIBUTING.md`
2. Operacao local
   - `README.md`
   - `docs/operations/operacao-local.md`
   - `docs/operations/pop-analise-conformidade-sst.md`
3. Continuidade de contexto
   - `docs/memory.md`
4. Governanca documental
   - `docs/governance/documentacao.md`
   - `docs/governance/5s-documentacao.md`

## Compatibilidade de Links Legados

Arquivos abaixo sao ponteiros historicos e nao fonte canonica:

- `docs/Guia-Vercel.md`
- `docs/operations/deploy-vercel.md`
- `docs/POP-Uso-do-SGN-Analise-de-Conformidade-SST.md`
- `docs/Prompt-Extracao-Estruturada-SGN.md`
- `docs/Plano-Studio-Minimalista.md`
- `docs/sql/README.md`
- `docs/sql/arquitetura.md`
