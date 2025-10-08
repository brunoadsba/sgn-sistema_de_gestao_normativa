#!/bin/bash
PORT=3001
echo "🔍 Verificando processos na porta $PORT..."
PROCESSES=$(lsof -ti:$PORT 2>/dev/null || true)
if [ ! -z "$PROCESSES" ]; then
  echo "⚠️ Matando processos: $PROCESSES"
  echo $PROCESSES | xargs kill -9 2>/dev/null || true
else
  echo "✅ Porta $PORT livre."
fi
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
echo "✅ Limpeza de porta concluída!"
