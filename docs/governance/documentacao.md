# Governanca de Documentacao

## Objetivo

Definir padrao minimo de qualidade e manutencao para a documentacao do SGN.

## Principios

1. Fonte unica da verdade por assunto.
2. Clareza operacional acima de volume de texto.
3. Documento executavel: deve orientar acao real, nao apenas descrever.
4. Atualizacao junto com a mudanca de codigo/infra.
5. Contexto operacional vigente: SGN local-only (sem deploy remoto).

## Tipos de documento

| Tipo | Conteudo esperado | Exemplo |
|---|---|---|
| Arquitetura | Componentes, fluxos, limites, decisoes tecnicas | `docs/architecture/arquitetura-tecnica.md` |
| Operacao | Procedimentos, checklists, runbooks, troubleshooting | `docs/operations/operacao-local.md` |
| Referencia | Especificacoes, mapeamentos e contratos | `docs/reference/prompt-extracao-estruturada-sgn.md` |
| Historico | Evolucao cronologica e contexto de sessao | `docs/memory.md` |
| Arquivo | Conteudo descontinuado ou legado | `docs/archive/` |

## Padrao de escrita

1. Titulo direto e escopo explicito.
2. Data de atualizacao quando relevante.
3. Secoes obrigatorias para runbook:
   - objetivo
   - pre-requisitos
   - passo a passo
   - validacao
   - rollback (quando aplicavel)
   - troubleshooting
4. Evitar termos ambiguos como "talvez", "aproximado" sem faixa numerica.
5. Referenciar caminhos reais do repositorio.

## Gatilhos obrigatorios de atualizacao

Atualize documentacao quando houver alteracao em:

1. Fluxo principal de analise
2. APIs publicas internas (`src/app/api/*`)
3. Modelo de dados (Drizzle schema/migration)
4. Variaveis de ambiente
5. Processo operacional local, backup ou restore
6. Controles de seguranca

## Checklist de PR (documentacao)

1. Links internos validos.
2. Comandos presentes e coerentes com `package.json`.
3. Limites operacionais atualizados (upload, timeout, tamanho de documento).
4. Sem duplicacao de regra em arquivos concorrentes.
5. Conteudo descontinuado movido para `docs/archive/`.
