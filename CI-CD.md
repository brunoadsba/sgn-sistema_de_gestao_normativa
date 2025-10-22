# SGN - CI/CD Pipeline Guide

Este guia explica como usar o pipeline de CI/CD do Sistema de Gestão Normativa (SGN) com GitHub Actions.

## 🚀 Visão Geral

O SGN possui um pipeline completo de CI/CD que inclui:

- **CI Pipeline**: Testes automatizados, qualidade de código, build e segurança
- **Deploy Pipeline**: Deploy automático para staging e produção
- **Release Pipeline**: Criação automática de releases
- **Test Suite**: Testes unitários, de integração e de performance

## 📋 Workflows Disponíveis

### 1. CI Pipeline (`ci.yml`)

**Triggers**: Push para `main`/`develop`, Pull Requests

**Jobs**:
- ✅ **Code Quality**: ESLint, TypeScript, Prettier, Security Audit
- ✅ **Unit Tests**: Jest com coverage
- ✅ **Build Check**: Verificação de build
- ✅ **Docker Build**: Teste de containerização
- ✅ **Security Scan**: Trivy vulnerability scanner
- ✅ **Performance Test**: Lighthouse CI
- ✅ **Integration Tests**: Testes de API
- ✅ **Summary**: Resumo dos resultados

### 2. Deploy Pipeline (`deploy.yml`)

**Triggers**: Push para `main`, Manual dispatch

**Jobs**:
- ✅ **Pre-deploy Checks**: Validações antes do deploy
- ✅ **Deploy Staging**: Deploy automático para staging
- ✅ **Deploy Production**: Deploy para produção (manual)
- ✅ **Post-deploy Tests**: Testes após deploy
- ✅ **Rollback**: Rollback automático em caso de falha

### 3. Release Pipeline (`release.yml`)

**Triggers**: Tags `v*`, Manual dispatch

**Jobs**:
- ✅ **Pre-release Checks**: Validações antes do release
- ✅ **Create Release**: Criação automática no GitHub
- ✅ **Build Artifacts**: Docker images e builds
- ✅ **Deploy Staging**: Deploy da release para staging
- ✅ **Deploy Production**: Deploy para produção (releases estáveis)
- ✅ **Post-release Tasks**: Notificações e documentação

### 4. Test Suite (`test.yml`)

**Triggers**: Push, PR, Schedule (diário)

**Jobs**:
- ✅ **Unit Tests**: Testes unitários com matriz de versões Node.js
- ✅ **API Tests**: Testes de integração das APIs
- ✅ **Component Tests**: Testes de componentes React
- ✅ **Load Tests**: Testes de carga com Artillery
- ✅ **Test Summary**: Resumo dos resultados

## 🛠️ Configuração

### 1. Secrets Necessários

Configure os seguintes secrets no GitHub:

```bash
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Supabase (Staging)
STAGING_SUPABASE_URL=https://your-staging.supabase.co
STAGING_SUPABASE_ANON_KEY=your-staging-anon-key
STAGING_SUPABASE_SERVICE_KEY=your-staging-service-key

# Supabase (Production)
PROD_SUPABASE_URL=https://your-prod.supabase.co
PROD_SUPABASE_ANON_KEY=your-prod-anon-key
PROD_SUPABASE_SERVICE_KEY=your-prod-service-key

# GROQ AI
STAGING_GROQ_API_KEY=your-staging-groq-key
PROD_GROQ_API_KEY=your-prod-groq-key

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/your-webhook
```

### 2. Environments

Configure os seguintes environments no GitHub:

- **staging**: Deploy automático para staging
- **production**: Deploy para produção (com aprovação)

### 3. Branch Protection

Configure branch protection para `main`:

- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes to main branch

## 🚀 Uso

### Comandos Disponíveis

```bash
# Testes locais
npm run ci:test

# Executar CI completo
npm run ci:run

# Deploy para staging
npm run ci:deploy staging

# Deploy para produção
npm run ci:deploy production

# Criar release
npm run ci:release v1.0.0

# Verificar status
npm run ci:status

# Ver logs
npm run ci:logs <run-id>

# Limpar workflows antigos
npm run ci:cleanup
```

### Script de CI/CD

Use o script `scripts/ci-cd.sh` para gerenciar o pipeline:

```bash
# Executar testes locais
./scripts/ci-cd.sh test

# Executar CI completo
./scripts/ci-cd.sh ci

# Deploy para staging
./scripts/ci-cd.sh deploy staging

# Deploy para produção
./scripts/ci-cd.sh deploy production

# Criar release
./scripts/ci-cd.sh release v1.0.0

# Verificar status
./scripts/ci-cd.sh status

# Ver logs de um workflow
./scripts/ci-cd.sh logs 1234567890

# Limpar workflows antigos
./scripts/ci-cd.sh cleanup
```

## 📊 Métricas e Qualidade

### Coverage Requirements

- **Unit Tests**: 80%+ coverage
- **API Tests**: 100% endpoints testados
- **Component Tests**: Componentes críticos testados

### Performance Requirements

- **Lighthouse Performance**: 80+ score
- **Lighthouse Accessibility**: 90+ score
- **Lighthouse Best Practices**: 80+ score
- **Lighthouse SEO**: 80+ score
- **Response Time**: < 2s para APIs críticas

### Security Requirements

- **Vulnerability Scan**: Sem vulnerabilidades críticas
- **Dependency Audit**: Sem dependências vulneráveis
- **Security Headers**: Headers de segurança configurados

## 🔍 Monitoramento

### Status dos Workflows

Acesse o status dos workflows em:
- GitHub Actions: `https://github.com/your-org/sgn/actions`
- Status Page: `https://status.sgn.com`

### Notificações

- **Slack**: Notificações automáticas para canais configurados
- **Email**: Notificações para falhas críticas
- **GitHub Issues**: Issues automáticas para falhas de deploy

### Logs e Debugging

```bash
# Ver logs de um workflow específico
gh run view <run-id> --log

# Ver logs de todos os jobs
gh run view <run-id> --log-failed

# Download de artifacts
gh run download <run-id>
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Build Falhando

```bash
# Verificar logs do build
gh run view <run-id> --log

# Executar build localmente
npm run build

# Verificar dependências
npm audit
```

#### 2. Testes Falhando

```bash
# Executar testes localmente
npm run test:ci

# Verificar coverage
npm run test:coverage

# Executar testes específicos
npm test -- --testNamePattern="specific test"
```

#### 3. Deploy Falhando

```bash
# Verificar logs do deploy
gh run view <run-id> --log

# Verificar health check
curl -f https://your-app.vercel.app/api/health

# Verificar variáveis de ambiente
gh secret list
```

#### 4. Performance Issues

```bash
# Executar Lighthouse localmente
npx lighthouse http://localhost:3001 --output json

# Verificar métricas
curl -s http://localhost:3001/api/health | jq .performance
```

### Rollback

Em caso de falha crítica:

```bash
# Rollback automático (via workflow)
gh workflow run rollback.yml

# Rollback manual
gh run rerun <failed-run-id>
```

## 📈 Otimizações

### Cache

- **Node Modules**: Cache automático via `actions/setup-node`
- **Docker Layers**: Cache via `docker/build-push-action`
- **Build Artifacts**: Cache via `actions/cache`

### Performance

- **Parallel Jobs**: Jobs executados em paralelo quando possível
- **Matrix Strategy**: Testes em múltiplas versões do Node.js
- **Conditional Execution**: Jobs executados apenas quando necessário

### Segurança

- **Secrets**: Secrets gerenciados via GitHub Secrets
- **Permissions**: Permissões mínimas necessárias
- **Dependencies**: Dependências verificadas e atualizadas

## 🔄 Manutenção

### Limpeza Regular

```bash
# Limpar workflows antigos
npm run ci:cleanup

# Limpar artifacts antigos
gh run list --limit 100 | grep -E "completed|cancelled" | head -20 | while read line; do
  run_id=$(echo $line | awk '{print $7}')
  gh run delete $run_id --confirm
done
```

### Atualizações

- **Actions**: Atualizar actions regularmente
- **Dependencies**: Manter dependências atualizadas
- **Node.js**: Atualizar versão do Node.js periodicamente

### Monitoramento

- **Uptime**: Monitorar uptime dos workflows
- **Performance**: Monitorar tempo de execução
- **Costs**: Monitorar custos dos runners

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git/vercel-for-github)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Codecov](https://docs.codecov.com/)
- [Trivy Security Scanner](https://trivy.dev/)

## 🤝 Suporte

Para problemas específicos do CI/CD:

1. Verifique os logs: `gh run view <run-id> --log`
2. Consulte este guia
3. Abra uma issue no repositório
4. Entre em contato com a equipe de DevOps
