# Tarefa: Hardening do Docker para Produção

## Contexto

O SGN possui `Dockerfile`, `docker-compose.yml` (dev) e `docker-compose.prod.yml` (produção). O setup de produção precisa de hardening para operação segura e confiável. O projeto usa Next.js 16 standalone output com SQLite persistente.

## Objetivo

Configurar `docker-compose.prod.yml` e `Dockerfile` para operação robusta em produção, com healthcheck, limites de recursos, backup automatizado e segurança.

## Requisitos

1. **Dockerfile**:
   - Multi-stage build otimizado (já existe, revisar)
   - Rodar como usuário não-root (`USER nextjs`)
   - Garantir que `data/` (SQLite + uploads) está no volume

2. **docker-compose.prod.yml**:
   - Healthcheck com `curl http://localhost:3001/api/health` (interval: 30s, timeout: 10s, retries: 3)
   - Limites de memória: `mem_limit: 2g`, `memswap_limit: 2g`
   - Limites de CPU: `cpus: '2.0'`
   - Restart policy: `unless-stopped`
   - Volume nomeado para `./data` (persistência de banco e uploads)
   - Variáveis de ambiente via `.env` file

3. **Backup automatizado**:
   - Script em `scripts/backup-db.sh` (já existe, revisar)
   - Adicionar service `backup` no compose que roda cron diário copiando `data/sgn.db` para `backups/`
   - Retenção de 7 dias (rotação automática)

4. **Segurança**:
   - `read_only: true` no filesystem do container (exceto volumes)
   - Tmpfs para `/tmp`
   - Sem `privileged`
   - Sem portas expostas desnecessárias

## Arquivos relevantes

- `Dockerfile`
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `scripts/backup-db.sh`
- `scripts/docker-deploy.sh`

## Critério de aceite

- `docker compose -f docker-compose.prod.yml config` sem erros
- `docker compose -f docker-compose.prod.yml up --build -d` sobe o serviço
- Healthcheck reporta healthy após startup
- Container roda como non-root
- Volume de dados persiste entre restarts
- Script de backup gera arquivo válido
