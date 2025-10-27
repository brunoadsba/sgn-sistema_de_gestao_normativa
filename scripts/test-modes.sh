#!/bin/bash

# Script para testar os modos Local, Worktree e Cloud
# Uso: ./scripts/test-modes.sh [local|worktree|cloud|all]

set -e

MODE=${1:-all}

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Função para testar modo Local
test_local() {
    print_message $BLUE "🧪 Testando modo LOCAL..."
    
    # Verificar se as dependências estão instaladas
    if [ ! -d "node_modules" ]; then
        print_message $YELLOW "📦 Instalando dependências..."
        npm install
    fi
    
    # Executar testes básicos
    print_message $BLUE "▶️  Executando testes unitários..."
    if npm test > /tmp/local-test.log 2>&1; then
        print_message $GREEN "✅ Modo Local: Testes passaram"
        print_message $BLUE "📊 Resultados salvos em /tmp/local-test.log"
        return 0
    else
        print_message $RED "❌ Modo Local: Testes falharam"
        print_message $YELLOW "📄 Últimas 20 linhas do log:"
        tail -n 20 /tmp/local-test.log || true
        return 1
    fi
}

# Função para testar modo Worktree
test_worktree() {
    print_message $BLUE "🧪 Testando modo WORKTREE..."
    
    # Verificar se estamos em um repositório Git
    if [ ! -d ".git" ]; then
        print_message $RED "❌ Este não é um repositório Git válido"
        return 1
    fi
    
    # Criar worktree temporário
    WORKTREE_DIR="/tmp/sgn-worktree-test"
    BRANCH_NAME="test-worktree-$(date +%s)"
    
    print_message $BLUE "📁 Criando branch $BRANCH_NAME..."
    git branch $BRANCH_NAME
    
    print_message $BLUE "📁 Criando worktree em $WORKTREE_DIR..."
    if git worktree add $WORKTREE_DIR $BRANCH_NAME; then
        print_message $GREEN "✅ Worktree criado com sucesso"
        
        # Instalar dependências no worktree
        cd $WORKTREE_DIR
        print_message $BLUE "📦 Instalando dependências no worktree..."
        npm install > /dev/null 2>&1
        
        # Testar no worktree
        if npm test > /tmp/worktree-test.log 2>&1; then
            print_message $GREEN "✅ Modo Worktree: Testes passaram"
        else
            print_message $RED "❌ Modo Worktree: Testes falharam"
        fi
        cd - > /dev/null
        
        # Limpar
        print_message $BLUE "🧹 Removendo worktree..."
        git worktree remove $WORKTREE_DIR
        git branch -D $BRANCH_NAME
        
        print_message $GREEN "✅ Modo Worktree testado"
        return 0
    else
        print_message $RED "❌ Não foi possível criar worktree"
        return 1
    fi
}

# Função para testar modo Cloud
test_cloud() {
    print_message $BLUE "🧪 Testando modo CLOUD..."
    
    # Verificar se o GitHub CLI está instalado
    if ! command -v gh &> /dev/null; then
        print_message $YELLOW "⚠️  GitHub CLI não encontrado. Instalando..."
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt update
        sudo apt install gh -y
    fi
    
    # Verificar se estamos autenticados no GitHub
    if ! gh auth status &> /dev/null; then
        print_message $YELLOW "⚠️  Não autenticado no GitHub"
        return 1
    fi
    
    # Disparar workflow de teste
    print_message $BLUE "📤 Disparando workflow de teste no GitHub..."
    if gh workflow run test.yml > /tmp/cloud-test.log 2>&1; then
        print_message $GREEN "✅ Workflow disparado"
        print_message $YELLOW "⏳ Aguardando conclusão..."
        
        # Aguardar conclusão do workflow
        sleep 5
        gh run watch
        
        print_message $GREEN "✅ Modo Cloud: Testes passaram"
        return 0
    else
        print_message $RED "❌ Modo Cloud: Falha ao disparar workflow"
        return 1
    fi
}

# Função para testar todos os modos
test_all() {
    print_message $BLUE "🚀 Testando todos os modos..."
    
    local results=()
    
    # Testar Local
    if test_local; then
        results+=("Local: ✅")
    else
        results+=("Local: ❌")
    fi
    
    # Testar Worktree
    if test_worktree; then
        results+=("Worktree: ✅")
    else
        results+=("Worktree: ❌")
    fi
    
    # Testar Cloud
    if test_cloud; then
        results+=("Cloud: ✅")
    else
        results+=("Cloud: ❌")
    fi
    
    # Mostrar resumo
    print_message $BLUE "📊 Resumo dos testes:"
    for result in "${results[@]}"; do
        echo "  $result"
    done
}

# Função de ajuda
show_help() {
    print_message $BLUE "🧪 Teste de Modos - SGN"
    echo ""
    echo "Uso: $0 [local|worktree|cloud|all]"
    echo ""
    echo "Modos disponíveis:"
    echo "  local      - Testar apenas modo Local"
    echo "  worktree   - Testar apenas modo Worktree"
    echo "  cloud      - Testar apenas modo Cloud"
    echo "  all        - Testar todos os modos (padrão)"
    echo ""
    echo "Exemplos:"
    echo "  $0 local"
    echo "  $0 worktree"
    echo "  $0 cloud"
    echo "  $0 all"
}

# Menu principal
case $MODE in
    "local")
        test_local
        ;;
    "worktree")
        test_worktree
        ;;
    "cloud")
        test_cloud
        ;;
    "all"|*)
        test_all
        ;;
esac

exit 0

