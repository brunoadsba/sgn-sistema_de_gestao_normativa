#!/bin/bash

# Script de limpeza completa para SGN
# Resolve conflitos de porta, cache corrompido e dependências

echo "🧹 Iniciando limpeza completa do SGN..."

# 1. Parar todos os processos Node.js
echo "📦 Parando processos Node.js..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "n8n start" 2>/dev/null || true

# 2. Matar processos na porta 3001
echo "🔌 Liberando porta 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# 3. Limpar cache do npm
echo "🗑️ Limpando cache do npm..."
npm cache clean --force

# 4. Remover node_modules e package-lock.json
echo "📁 Removendo dependências..."
rm -rf node_modules
rm -rf package-lock.json

# 5. Limpar cache do Next.js
echo "⚡ Limpando cache do Next.js..."
rm -rf .next

# 6. Limpar logs antigos
echo "📝 Limpando logs..."
rm -rf logs/* 2>/dev/null || true

echo "✅ Limpeza completa finalizada!"
echo "🚀 Execute 'npm install' para reinstalar dependências"
