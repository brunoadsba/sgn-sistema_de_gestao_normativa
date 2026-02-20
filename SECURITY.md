# SGN - Security

## Escopo

Este documento descreve o estado de segurança atual do SGN, riscos aceitos no modo single-user local e requisitos mínimos para evolução para ambiente público.

## Modelo de Ameaça Atual

- Aplicação local, single-user, sem autenticação.
- Superfícies de entrada principais: upload de arquivos, payloads de API, variáveis de ambiente.
- Comunicação externa: apenas API da GROQ para processamento de IA.

## Controles Implementados

1. Validação de entrada com Zod em rotas críticas.
2. Sanitização de texto para prompts de IA (`sanitizeInput`).
3. Headers de segurança definidos em `next.config.js`.
4. Logging estruturado com Pino.
5. Estrutura padronizada de retorno de erro/sucesso nas APIs.
6. Validação de variáveis de ambiente em `src/lib/env.ts`.
7. Armazenamento local com SQLite (sem credenciais remotas de banco).
8. Observabilidade com Sentry (server, edge e client).
9. Error boundaries globais e por rota para captura de falhas de renderização.
10. Retry com timeout e idempotência em rotas críticas de análise IA.

## Riscos Conhecidos (Estado Atual)

1. APIs sem autenticação/autorização (aceito para uso local).
2. Ausência de rate limiting específico para rotas de IA.
3. Dependência de serviço externo GROQ para etapa crítica de análise.
4. Uso de SQLite local limita cenários multiusuário e alta concorrência.

## Requisitos de Hardening para Deploy Público

1. Implementar autenticação e autorização por usuário/tenant.
2. Implementar rate limiting em `/api/ia/*`, `/api/extrair-texto` e endpoints de alto custo.
3. Adotar monitoramento e rastreamento de erro (Sentry ou equivalente).
4. Forçar HTTPS com HSTS e políticas de CORS restritivas.
5. Definir política de retenção e criptografia para uploads e banco.
6. Implementar trilha de auditoria para ações críticas.

## Gestão de Secrets

1. Segredos apenas em `.env.local`/cofre de ambiente.
2. Proibido versionar tokens/chaves.
3. Rotacionar `GROQ_API_KEY` em caso de vazamento.

Variáveis principais:

```bash
NODE_ENV=development|production
GROQ_API_KEY=                     # Obrigatória
DATABASE_PATH=./data/sgn.db       # Opcional (default: ./data/sgn.db)
PORT=3001                         # Opcional
LOG_LEVEL=info                    # Opcional
```

## Checklist Operacional de Segurança

1. Verificar ausência de segredos no repositório:
   ```bash
   git grep -i "api_key\|password\|secret\|token"
   ```
2. Validar tipagem e build:
   ```bash
   npx tsc --noEmit
   npm run build
   ```
3. Executar testes E2E:
   ```bash
   npm run test:e2e
   ```
4. Revisar alterações de API e schema antes de merge.

## Política de Divulgação de Vulnerabilidades

1. Não abrir vulnerabilidade crítica em issue pública.
2. Registrar impacto, vetor, severidade e evidência técnica.
3. Corrigir em branch isolada e publicar patch com changelog.
