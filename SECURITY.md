# SGN - Guia de Segurança

## Objetivo

Documentar os controles de segurança existentes, limites atuais e próximos passos de hardening.

## Controles implementados

1. Validação de entrada com Zod nas rotas principais
2. Sanitização de input para prompts de IA
3. Headers de segurança configurados no app
4. Logging estruturado com Pino
5. Bloqueio de endpoints de demo em produção
6. Tratamento padronizado de respostas de erro/sucesso em parte das APIs

## Middleware de rate limiting

- Implementado em `src/middlewares/rate-limit.ts`
- Configurações existentes para categorias de endpoint
- Limitação atual: ainda não aplicado de forma consistente em todas as rotas públicas

## Riscos atuais conhecidos

1. APIs sem autenticação/autorização
2. Rate limit não aplicado em toda superfície pública
3. Sem monitoramento centralizado (Sentry ausente)

## Recomendações prioritárias

1. Aplicar `rateLimitMiddlewares` em:
   - `/api/ia/*`
   - `/api/empresas`
   - `/api/alertas`
2. Definir camada mínima de autenticação para APIs sensíveis
3. Integrar observabilidade de erros (Sentry)
4. Formalizar testes automatizados de segurança no CI

## Variáveis de ambiente relacionadas

```bash
NODE_ENV=development|production
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Checklist rápido de validação de segurança

1. Confirmar `GROQ_API_KEY` somente em `.env.local`/secrets
2. Confirmar que não há secrets versionados
3. Confirmar inexistência de arquivos legados como `.env-n8n`
4. Rotacionar imediatamente credenciais que já tenham sido expostas em ambiente local
5. Executar:
   ```bash
   npm run security:test
   ```
6. Revisar logs de erro da API após testes

## Histórico recente

- Supabase e N8N removidos do fluxo principal
- Banco local SQLite com Drizzle em operação
- Persistência da análise IA implementada com registro de jobs/resultados/gaps
