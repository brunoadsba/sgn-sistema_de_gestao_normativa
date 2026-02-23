#!/bin/bash

# Verificação da tarefa sgn-unit-tests-expand
# Valida que a cobertura de testes foi ampliada

set -e

cd /app

echo "=== SGN Unit Tests Expansion Verification ==="

# 1. Testes devem passar
echo "[1/3] Rodando testes unitários..."
npx jest --ci --coverage --watchAll=false 2>&1 | tail -20
if [ $? -ne 0 ]; then
  echo "FAIL: Testes falharam"
  echo 0 > /logs/verifier/reward.txt
  exit 1
fi

# 2. Build deve passar
echo "[2/3] Verificando build..."
npx next build 2>&1 | tail -5
if [ $? -ne 0 ]; then
  echo "FAIL: Build falhou"
  echo 0 > /logs/verifier/reward.txt
  exit 1
fi

# 3. Verificar que novos arquivos de teste existem
echo "[3/3] Verificando novos arquivos de teste..."
TEST_COUNT=$(find src -name "*.test.ts" -o -name "*.test.tsx" | wc -l)
if [ "$TEST_COUNT" -lt 8 ]; then
  echo "FAIL: Esperado >= 8 arquivos de teste, encontrado $TEST_COUNT"
  echo 0 > /logs/verifier/reward.txt
  exit 1
fi

echo "=== PASS: $TEST_COUNT arquivos de teste encontrados ==="
echo 1 > /logs/verifier/reward.txt
