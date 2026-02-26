# 5S da Documentacao SGN

> Atualizado em: 2026-02-26
> Responsavel: Engenharia SGN

## Objetivo

Aplicar 5S na base documental para reduzir drift entre codigo e docs e manter operacao confiavel.

## Escopo

- `README.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `docs/architecture/**`
- `docs/operations/**`
- `docs/governance/**`
- `docs/memory.md`

## Matriz 5S

| Senso | Objetivo | Acao aplicada nesta rodada |
|---|---|---|
| Seiri (Utilizacao) | Separar ativo x legado | Reforco de uso de `docs/archive/` e classificacao canonica |
| Seiton (Organizacao) | Lugar certo para cada documento | Indice `docs/README.md` reorganizado por dominios |
| Seiso (Limpeza) | Remover inconsistencias | Alinhamento de versao/status/comandos com estado real do repo |
| Seiketsu (Padronizacao) | Regras comuns | Template minimo e DoD documental em `docs/governance/documentacao.md` |
| Shitsuke (Disciplina) | Sustentacao continua | Revisao mensal obrigatoria e gatilhos de atualizacao por PR |

## Checklist Operacional 5S

1. Validar se todo endpoint citado existe em `src/app/api`.
2. Validar se todo comando citado existe em `package.json`.
3. Validar se status de qualidade possui data absoluta.
4. Validar consistencia entre README, memory e changelog.
5. Mover conteudo descontinuado para `docs/archive/`.

## Cadencia

1. Revisao rapida por PR: obrigatoria.
2. Revisao completa 5S: mensal.
3. Auditoria extraordinaria: apos refatoracao estrutural.

## Indicadores de Saude Documental

1. Numero de inconsistencias abertas (meta: 0).
2. Tempo medio para atualizar docs apos mudanca tecnica (meta: mesmo PR).
3. Percentual de PRs com atualizacao documental quando aplicavel (meta: 100%).
