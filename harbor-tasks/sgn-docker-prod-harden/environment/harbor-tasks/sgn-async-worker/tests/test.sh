#!/bin/bash

# Verificação da tarefa sgn-async-worker
# Valida que o worker assíncrono foi implementado corretamente

set -e

cd /app

echo "=== SGN Async Worker Verification ==="

# 1. Build deve passar
echo "[1/4] Verificando build..."
npx next build 2>&1 | tail -5
if [ $? -ne 0 ]; then
  echo "FAIL: Build falhou"
  echo 0 > /logs/verifier/reward.txt
  exit 1
fi

# 2. Lint deve passar
echo "[2/4] Verificando lint..."
npx eslint . --max-warnings 0 2>&1 | tail -3
if [ $? -ne 0 ]; then
  echo "FAIL: Lint falhou"
  echo 0 > /logs/verifier/reward.txt
  exit 1
fi

# 3. Verificar que o endpoint de jobs existe
echo "[3/4] Verificando rota de jobs..."
if ! find src/app/api/ia/jobs -name "route.ts" 2>/dev/null | grep -q "."; then
  echo "FAIL: Rota /api/ia/jobs/[id] não encontrada"
  echo 0 > /logs/verifier/reward.txt
  exit 1
fi

# 4. Verificar que o endpoint de análise retorna jobId
echo "[4/4] Verificando retorno de jobId no endpoint de análise..."
if ! grep -r "jobId" src/app/api/ia/analisar-conformidade/route.ts 2>/dev/null | grep -q "."; then
  echo "FAIL: Endpoint de análise não retorna jobId"
  echo 0 > /logs/verifier/reward.txt
  exit 1
fi

echo "=== PASS: Todas as verificações passaram ==="
echo 1 > /logs/verifier/reward.txt
