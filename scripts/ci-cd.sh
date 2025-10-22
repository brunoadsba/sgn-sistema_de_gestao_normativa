#!/bin/bash

# Script para gerenciar CI/CD do SGN
# Uso: ./scripts/ci-cd.sh [command]

set -e

COMMAND=${1:-help}

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

# Função para verificar se estamos em um repositório Git
check_git_repo() {
    if [ ! -d ".git" ]; then
        print_message $RED "❌ Este não é um repositório Git válido"
        exit 1
    fi
}

# Função para verificar se o GitHub CLI está instalado
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_message $YELLOW "⚠️  GitHub CLI não encontrado. Instalando..."
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt update
        sudo apt install gh -y
    fi
}

# Função para verificar se estamos autenticados no GitHub
check_gh_auth() {
    if ! gh auth status &> /dev/null; then
        print_message $YELLOW "⚠️  Não autenticado no GitHub. Fazendo login..."
        gh auth login
    fi
}

# Função para executar testes locais
run_local_tests() {
    print_message $BLUE "🧪 Executando testes locais..."
    
    # Verificar se as dependências estão instaladas
    if [ ! -d "node_modules" ]; then
        print_message $YELLOW "📦 Instalando dependências..."
        npm install
    fi
    
    # Executar linting
    print_message $BLUE "🔍 Executando ESLint..."
    npm run lint
    
    # Executar testes
    print_message $BLUE "🧪 Executando testes unitários..."
    npm run test:ci
    
    # Executar build
    print_message $BLUE "🔨 Executando build..."
    npm run build
    
    print_message $GREEN "✅ Todos os testes locais passaram!"
}

# Função para executar CI completo
run_ci() {
    print_message $BLUE "🚀 Executando pipeline de CI..."
    
    check_git_repo
    check_gh_cli
    check_gh_auth
    
    # Executar testes locais primeiro
    run_local_tests
    
    # Disparar workflow de CI
    print_message $BLUE "📤 Disparando workflow de CI no GitHub..."
    gh workflow run ci.yml
    
    # Aguardar conclusão
    print_message $YELLOW "⏳ Aguardando conclusão do workflow..."
    gh run watch
    
    print_message $GREEN "✅ Pipeline de CI concluído!"
}

# Função para executar deploy
run_deploy() {
    local environment=${1:-staging}
    
    print_message $BLUE "🚀 Executando deploy para $environment..."
    
    check_git_repo
    check_gh_cli
    check_gh_auth
    
    # Verificar se estamos na branch main
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ] && [ "$environment" == "production" ]; then
        print_message $RED "❌ Deploy para produção só pode ser feito da branch main"
        exit 1
    fi
    
    # Disparar workflow de deploy
    print_message $BLUE "📤 Disparando workflow de deploy..."
    gh workflow run deploy.yml -f environment=$environment
    
    # Aguardar conclusão
    print_message $YELLOW "⏳ Aguardando conclusão do deploy..."
    gh run watch
    
    print_message $GREEN "✅ Deploy para $environment concluído!"
}

# Função para criar release
create_release() {
    local version=$1
    
    if [ -z "$version" ]; then
        print_message $RED "❌ Versão é obrigatória. Uso: $0 release v1.0.0"
        exit 1
    fi
    
    print_message $BLUE "📦 Criando release $version..."
    
    check_git_repo
    check_gh_cli
    check_gh_auth
    
    # Verificar se a versão já existe
    if git tag -l | grep -q "^$version$"; then
        print_message $RED "❌ Tag $version já existe"
        exit 1
    fi
    
    # Atualizar package.json
    print_message $BLUE "📝 Atualizando package.json..."
    npm version $version --no-git-tag-version
    
    # Commit das mudanças
    git add package.json
    git commit -m "chore: bump version to $version"
    
    # Criar tag
    git tag -a $version -m "Release $version"
    
    # Push das mudanças
    git push origin main
    git push origin $version
    
    # Disparar workflow de release
    print_message $BLUE "📤 Disparando workflow de release..."
    gh workflow run release.yml
    
    print_message $GREEN "✅ Release $version criada!"
}

# Função para verificar status dos workflows
check_status() {
    print_message $BLUE "📊 Verificando status dos workflows..."
    
    check_gh_cli
    check_gh_auth
    
    # Listar runs recentes
    gh run list --limit 10
    
    # Mostrar status dos workflows
    print_message $BLUE "📈 Status dos workflows:"
    gh workflow list
}

# Função para limpar workflows antigos
cleanup_workflows() {
    print_message $BLUE "🧹 Limpando workflows antigos..."
    
    check_gh_cli
    check_gh_auth
    
    # Deletar runs antigos (mais de 30 dias)
    gh run list --limit 100 | grep -E "completed|cancelled" | head -20 | while read line; do
        run_id=$(echo $line | awk '{print $7}')
        if [ ! -z "$run_id" ]; then
            gh run delete $run_id --confirm
        fi
    done
    
    print_message $GREEN "✅ Limpeza concluída!"
}

# Função para mostrar logs de um workflow
show_logs() {
    local run_id=$1
    
    if [ -z "$run_id" ]; then
        print_message $RED "❌ ID do run é obrigatório. Uso: $0 logs <run-id>"
        exit 1
    fi
    
    check_gh_cli
    check_gh_auth
    
    gh run view $run_id --log
}

# Função de ajuda
show_help() {
    print_message $BLUE "🚀 SGN CI/CD Management Script"
    echo ""
    echo "Uso: $0 [command] [options]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  test                    - Executar testes locais"
    echo "  ci                      - Executar pipeline de CI completo"
    echo "  deploy [environment]    - Deploy para staging ou production"
    echo "  release <version>       - Criar nova release (ex: v1.0.0)"
    echo "  status                  - Verificar status dos workflows"
    echo "  logs <run-id>           - Mostrar logs de um workflow"
    echo "  cleanup                 - Limpar workflows antigos"
    echo "  help                    - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 test"
    echo "  $0 ci"
    echo "  $0 deploy staging"
    echo "  $0 deploy production"
    echo "  $0 release v1.0.0"
    echo "  $0 status"
    echo "  $0 logs 1234567890"
    echo "  $0 cleanup"
}

# Menu principal
case $COMMAND in
    "test")
        run_local_tests
        ;;
    "ci")
        run_ci
        ;;
    "deploy")
        run_deploy $2
        ;;
    "release")
        create_release $2
        ;;
    "status")
        check_status
        ;;
    "logs")
        show_logs $2
        ;;
    "cleanup")
        cleanup_workflows
        ;;
    "help"|*)
        show_help
        ;;
esac
