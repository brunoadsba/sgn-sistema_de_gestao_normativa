#!/bin/bash

# Script de inicialização segura para desenvolvimento
# Verifica porta, dependências e inicializa o servidor

echo "🚀 Iniciando SGN em modo desenvolvimento..."

# 1. Verificar se a porta 3001 está livre
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Porta 3001 está em uso. Executando limpeza..."
    ./scripts/cleanup.sh
    sleep 2
fi

# 2. Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# 3. Verificar se .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚠️ Arquivo .env.local não encontrado!"
    echo "📋 Copie .env.example para .env.local e configure as variáveis"
    exit 1
fi

# 4. Verificar integridade das dependências críticas
echo "🔍 Verificando dependências críticas..."
npm ls next drizzle-orm groq-sdk >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚠️ Dependências críticas corrompidas. Reinstalando..."
    npm install
fi

# 5. Iniciar servidor de desenvolvimento
echo "🌟 Iniciando servidor Next.js..."
npm run dev
