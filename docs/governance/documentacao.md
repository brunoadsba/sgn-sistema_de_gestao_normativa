# Governanca de Documentacao

> Atualizado em: 2026-02-28

## 1. Objetivo

Padronizar a documentacao do SGN para manter consistencia tecnica, rastreabilidade de decisoes e operacao previsivel.

## 2. Principios

1. Fonte unica de verdade por assunto.
2. Documento deve orientar acao executavel.
3. Mudanca de codigo relevante exige mudanca de doc no mesmo PR.
4. Clareza e precisao acima de volume de texto.
5. Conteudo legado deve ser arquivado, nao misturado com o estado atual.

## 3. Classificacao de Documentos

| Tipo | Conteudo esperado | Caminho |
|---|---|---|
| Arquitetura | Componentes, fluxos, limites, debitos | `docs/architecture/` |
| Operacao | Procedimentos, runbooks, checklists | `docs/operations/` |
| Referencia | Contratos e mapeamentos tecnicos | `docs/reference/` |
| Governanca | Regras, templates, auditoria documental | `docs/governance/` |
| Memoria | Estado consolidado e historico resumido | `docs/memory.md` |
| Arquivo | Legado e historico descontinuado | `docs/archive/` |

## 4. Template Minimo por Tipo

### Runbook/POP

1. Objetivo
2. Escopo
3. Pre-requisitos
4. Passo a passo
5. Validacao/Gate
6. Troubleshooting
7. Responsabilidades

### Arquitetura

1. Resumo do sistema
2. Componentes e fluxo
3. Contratos de API/dados
4. Limites operacionais
5. Debito tecnico priorizado

### Seguranca

1. Modelo de ameaca
2. Controles implementados
3. Riscos aceitos
4. Hardening pendente
5. Procedimentos operacionais

## 5. Gatilhos Obrigatorios de Atualizacao

Atualizar docs quando houver alteracao em:

1. `src/app/api/**`
2. `src/lib/db/**` e migrations
3. `src/lib/env.ts` e `.env.example`
4. Fluxo principal de uso (`/`, `/normas`, `/nr6`)
5. Seguranca, logs e observabilidade
6. Scripts operacionais (`scripts/**`, Docker, CI)

## 6. Qualidade de Documentacao (DoD)

1. Sem conflito de versao entre README, memory e changelog.
2. Comandos documentados existem em `package.json`.
3. Endpoint citado existe no codigo.
4. Datas e status sao objetivos (com data absoluta).
5. Links internos resolvem para caminhos reais.

## 7. Ciclo de Revisao

1. Revisao obrigatoria em todo PR com impacto tecnico/operacional.
2. Revisao mensal de consistencia (auditoria 5S).
3. Registro de ajustes em `CHANGELOG.md` e `docs/memory.md`.

## 8. 5S Documental

A execucao detalhada do 5S fica em:

- `docs/governance/5s-documentacao.md`
