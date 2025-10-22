# SGN - Docker Deployment Guide

Este guia explica como executar o Sistema de Gestão Normativa (SGN) usando Docker e Docker Compose.

## 🐳 Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- 4GB RAM disponível
- 10GB espaço em disco

## 🚀 Início Rápido

### 1. Clone e Configure

```bash
git clone <repository-url>
cd sgn
cp docker.env.example .env
```

### 2. Configure Variáveis de Ambiente

Edite o arquivo `.env` com suas configurações:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GROQ AI
GROQ_API_KEY=your-groq-api-key

# N8N
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/sgn
```

### 3. Execute o Deploy

```bash
# Desenvolvimento
npm run docker:start

# Produção
npm run docker:prod
```

## 📋 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run docker:build` | Faz build da aplicação |
| `npm run docker:start` | Inicia todos os serviços |
| `npm run docker:stop` | Para todos os serviços |
| `npm run docker:restart` | Reinicia todos os serviços |
| `npm run docker:logs` | Mostra logs em tempo real |
| `npm run docker:status` | Mostra status dos serviços |
| `npm run docker:shell` | Abre shell no container |
| `npm run docker:cleanup` | Remove volumes e imagens antigas |
| `npm run docker:prod` | Deploy em produção |

## 🏗️ Arquitetura

### Serviços Incluídos

- **sgn-app**: Aplicação Next.js principal
- **redis**: Cache e rate limiting
- **nginx**: Reverse proxy e load balancer
- **prometheus**: Métricas e monitoramento
- **grafana**: Dashboards e visualização

### Portas Expostas

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| SGN App | 3001 | Aplicação principal |
| Nginx | 80, 443 | Proxy reverso |
| Redis | 6379 | Cache |
| Prometheus | 9090 | Métricas |
| Grafana | 3000 | Dashboards |

## 🔧 Configuração Avançada

### Docker Compose Profiles

```bash
# Apenas aplicação e Redis
docker-compose --profile minimal up -d

# Com monitoramento completo
docker-compose --profile monitoring up -d

# Produção com SSL
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Variáveis de Ambiente

#### Configuração Básica
- `NODE_ENV`: Ambiente (development/production)
- `PORT`: Porta da aplicação (padrão: 3001)
- `LOG_LEVEL`: Nível de log (debug/info/warn/error)

#### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço

#### GROQ AI
- `GROQ_API_KEY`: Chave da API GROQ

#### Redis
- `REDIS_URL`: URL de conexão Redis

### Volumes Persistentes

```yaml
volumes:
  redis_data:     # Dados do Redis
  prometheus_data: # Métricas Prometheus
  grafana_data:   # Configurações Grafana
  logs:           # Logs da aplicação
```

## 🔍 Monitoramento

### Health Checks

```bash
# Verificar saúde da aplicação
curl http://localhost:3001/api/health

# Verificar Redis
docker-compose exec redis redis-cli ping

# Verificar Prometheus
curl http://localhost:9090/-/healthy
```

### Logs

```bash
# Logs de todos os serviços
npm run docker:logs

# Logs específicos
docker-compose logs sgn-app
docker-compose logs redis
docker-compose logs nginx
```

### Métricas

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)

## 🛠️ Desenvolvimento

### Debugging

```bash
# Acessar container da aplicação
npm run docker:shell

# Ver logs em tempo real
docker-compose logs -f sgn-app

# Reiniciar apenas a aplicação
docker-compose restart sgn-app
```

### Hot Reload (Desenvolvimento)

Para desenvolvimento com hot reload, use o modo de desenvolvimento:

```bash
# Modo desenvolvimento com volumes
docker-compose -f docker-compose.dev.yml up -d
```

## 🚀 Produção

### Deploy em Produção

1. **Configure SSL**:
   ```bash
   # Coloque certificados em docker/ssl/
   cp cert.pem docker/ssl/cert.pem
   cp key.pem docker/ssl/key.pem
   ```

2. **Configure Domínio**:
   ```bash
   # Atualize nginx.conf com seu domínio
   sed -i 's/localhost/your-domain.com/g' docker/nginx.conf
   ```

3. **Deploy**:
   ```bash
   npm run docker:prod
   ```

### Otimizações de Produção

- **Recursos**: Limites de CPU e memória configurados
- **Restart Policy**: `always` para alta disponibilidade
- **Health Checks**: Verificação automática de saúde
- **Security Headers**: Headers de segurança configurados
- **Rate Limiting**: Proteção contra abuso

## 🔒 Segurança

### Headers de Segurança

- `X-Frame-Options`: SAMEORIGIN
- `X-Content-Type-Options`: nosniff
- `X-XSS-Protection`: 1; mode=block
- `Referrer-Policy`: strict-origin-when-cross-origin

### Rate Limiting

- **API**: 10 requests/second
- **Geral**: 30 requests/second
- **Burst**: Configurável por endpoint

### Network Isolation

- Rede isolada para comunicação entre serviços
- Apenas portas necessárias expostas
- Comunicação interna via nomes de serviço

## 📊 Performance

### Otimizações Incluídas

- **Multi-stage build**: Imagem otimizada
- **Alpine Linux**: Imagem mínima
- **Gzip compression**: Compressão automática
- **Static file caching**: Cache de assets
- **Redis caching**: Cache de dados
- **Connection pooling**: Pool de conexões

### Métricas de Performance

- **Build time**: ~5 minutos
- **Startup time**: ~30 segundos
- **Memory usage**: ~512MB (app) + ~256MB (Redis)
- **CPU usage**: ~0.5 cores (app) + ~0.25 cores (Redis)

## 🐛 Troubleshooting

### Problemas Comuns

#### Porta já em uso
```bash
# Verificar processos usando a porta
lsof -i :3001
# Parar serviços Docker
npm run docker:stop
```

#### Erro de permissão
```bash
# Dar permissão aos scripts
chmod +x scripts/*.sh
```

#### Container não inicia
```bash
# Verificar logs
docker-compose logs sgn-app
# Verificar configuração
docker-compose config
```

#### Redis não conecta
```bash
# Verificar Redis
docker-compose exec redis redis-cli ping
# Reiniciar Redis
docker-compose restart redis
```

### Limpeza

```bash
# Limpar tudo
npm run docker:cleanup

# Limpar apenas volumes
docker-compose down -v

# Limpar imagens antigas
docker image prune -f
```

## 📚 Recursos Adicionais

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [Nginx Configuration](https://nginx.org/en/docs/)

## 🤝 Suporte

Para problemas específicos do SGN:

1. Verifique os logs: `npm run docker:logs`
2. Consulte este guia
3. Abra uma issue no repositório
4. Entre em contato com a equipe de desenvolvimento
