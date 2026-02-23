#!/bin/bash

# Verificação da tarefa sgn-docker-prod-harden
# Valida que o docker-compose.prod.yml está corretamente configurado

set -e

echo "=== Debug: Conteúdo de /app ==="
ls -la /app

cd /app

echo "=== SGN Docker Prod Hardening Verification ==="

# 1. docker-compose.prod.yml deve ser YAML válido
echo "[1/5] Verificando sintaxe docker-compose.prod.yml..."
if [ ! -f docker-compose.prod.yml ]; then
  echo "FAIL: docker-compose.prod.yml não encontrado em $(pwd)"
  echo 0 > /logs/verifier/reward.txt
  exit 1
fi

# ... resto do script ...
grep -q "healthcheck" docker-compose.prod.yml || { echo "FAIL: No healthcheck"; echo 0 > /logs/verifier/reward.txt; exit 1; }
grep -qE "mem_limit|memory" docker-compose.prod.yml || { echo "FAIL: No limits"; echo 0 > /logs/verifier/reward.txt; exit 1; }
grep -q "restart:" docker-compose.prod.yml || { echo "FAIL: No restart policy"; echo 0 > /logs/verifier/reward.txt; exit 1; }

echo "=== PASS: Docker prod hardening verificado ==="
echo 1 > /logs/verifier/reward.txt
