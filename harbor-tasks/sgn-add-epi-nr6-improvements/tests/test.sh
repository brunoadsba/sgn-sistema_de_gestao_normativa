#!/bin/bash
set -e
cd /app
echo "=== SGN NR6 Improvements Verification ==="
echo "[1/2] Verificando build..."
npx next build 2>&1 | tail -5
echo "[2/2] Verificando existência de novos componentes..."
if ! find src -name "SelecaoEPI.tsx" 2>/dev/null | grep -q "."; then
  echo "FAIL: Componente SelecaoEPI.tsx não encontrado"
  echo 0 > /logs/verifier/reward.txt
  exit 1
fi
echo "=== PASS ==="
echo 1 > /logs/verifier/reward.txt
