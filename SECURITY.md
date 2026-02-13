# SGN - Guia de Segurança

## Objetivo

Documentar os controles de segurança existentes, limites atuais e próximos passos de hardening.

## Controles implementados

1. Validação de entrada com Zod nas rotas principais
2. Sanitização de input para prompts de IA (`sanitizeInput` em `groq.ts` e `analisador-nr6.ts`)
3. Headers de segurança configurados no app (`next.config.js`)
4. Logging estruturado com Pino
5. Tratamento padronizado de respostas de erro/sucesso nas APIs
6. Variáveis de ambiente validadas com Zod (`src/lib/env.ts`)

## Modelo de segurança

Aplicação single-user, executada localmente. Sem autenticação (acesso restrito à máquina local). Única comunicação externa é com a API do GROQ para análise de IA.

## Riscos atuais conhecidos

1. APIs sem autenticação (aceitável para uso local single-user)
2. Sem monitoramento centralizado (Sentry ausente)
3. Sem rate limiting (removido junto com Redis — desnecessário para uso local)

## Recomendações para produção

Se o projeto evoluir para multi-user ou deploy público:

1. Implementar autenticação (NextAuth ou similar)
2. Adicionar rate limiting em `/api/ia/*`
3. Integrar observabilidade de erros (Sentry)
4. Configurar HTTPS
5. Implementar CORS restritivo

## Variáveis de ambiente

```bash
NODE_ENV=development|production
GROQ_API_KEY=                     # Obrigatória
DATABASE_PATH=./data/sgn.db       # Opcional (default: ./data/sgn.db)
```

## Checklist rápido

1. Confirmar `GROQ_API_KEY` somente em `.env.local` (nunca versionado)
2. Confirmar que não há secrets versionados (`git grep -i "api_key\|password\|secret"`)
3. Executar validação de tipagem: `npx tsc --noEmit`

## Histórico recente

- Supabase e N8N removidos do fluxo principal
- Redis removido (desnecessário para single-user local)
- Banco local SQLite com Drizzle em operação
- Feature de empresas removida (app single-user)
- Persistência da análise IA implementada com registro de jobs/resultados/gaps
