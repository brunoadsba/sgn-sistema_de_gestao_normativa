# Contribuição

## Regras de branch

1. Trabalhar em branch de feature, nunca direto na `master`
2. Nome sugerido:
   - `feat/<tema>`
   - `fix/<tema>`
   - `docs/<tema>`
3. Para evolução relevante, avaliar criação de nova branch antes de alterar código

## Padrão de commits

Usar commits semânticos no formato:

```text
tipo(feature): descrição concisa
```

Exemplos:

- `feat(ia): persistir resultados de conformidade no sqlite`
- `fix(api): corrigir paginação de listagem de análises`
- `docs(memory): atualizar estado pós-migração`

## Checklist antes de abrir PR

1. Executar validação de tipagem:
   ```bash
   npx tsc --noEmit
   ```
2. Executar testes aplicáveis:
   ```bash
   npm test
   ```
3. Atualizar documentação afetada:
   - `README.md`
   - `docs/memory.md`
   - `docs/sql/arquitetura.md`
   - `SECURITY.md` (se houver impacto de segurança)
4. Garantir ausência de secrets em arquivos versionados

## Convenções de código

1. TypeScript strict mode
2. Zod para validação de inputs
3. Respostas de API com estrutura consistente (`success`, `data`, `error`)
4. Logs via `@/lib/logger`
5. Evitar duplicação de código (DRY)
