#!/bin/bash

# Script para build e deploy do SGN com Docker
# Uso: ./scripts/docker-deploy.sh [environment]

set -e

ENVIRONMENT=${1:-development}
PROJECT_NAME="sgn-sistema-gestao-normativa"

echo "🐳 Iniciando deploy do SGN com Docker..."
echo "📋 Ambiente: $ENVIRONMENT"

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verificar se docker-compose está disponível
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose não encontrado. Instalando..."
    # Instalar docker-compose se não estiver disponível
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env a partir do .env.example..."
    cp .env.example .env
    echo "⚠️  Por favor, configure as variáveis de ambiente no arquivo .env"
fi

# Função para build da aplicação
build_app() {
    echo "🔨 Fazendo build da aplicação..."
    docker-compose build --no-cache sgn-app
}

# Função para iniciar serviços
start_services() {
    echo "🚀 Iniciando serviços..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    echo "⏳ Aguardando serviços ficarem prontos..."
    sleep 30
    
    # Verificar saúde dos serviços
    echo "🏥 Verificando saúde dos serviços..."
    
    # Verificar SGN App
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ SGN App está saudável"
    else
        echo "❌ SGN App não está respondendo"
        docker-compose logs sgn-app
        exit 1
    fi
    
    # Verificar Redis
    if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis está saudável"
    else
        echo "❌ Redis não está respondendo"
        exit 1
    fi
}

# Função para parar serviços
stop_services() {
    echo "🛑 Parando serviços..."
    docker-compose down
}

# Função para limpar volumes e imagens
cleanup() {
    echo "🧹 Limpando volumes e imagens antigas..."
    docker-compose down -v
    docker system prune -f
    docker image prune -f
}

# Função para mostrar logs
show_logs() {
    echo "📋 Mostrando logs dos serviços..."
    docker-compose logs -f
}

# Função para mostrar status
show_status() {
    echo "📊 Status dos serviços:"
    docker-compose ps
}

# Menu principal
case "${2:-start}" in
    "build")
        build_app
        ;;
    "start")
        build_app
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        start_services
        ;;
    "cleanup")
        cleanup
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "shell")
        echo "🐚 Abrindo shell no container da aplicação..."
        docker-compose exec sgn-app sh
        ;;
    *)
        echo "Uso: $0 [environment] [command]"
        echo ""
        echo "Comandos disponíveis:"
        echo "  build    - Faz build da aplicação"
        echo "  start    - Inicia todos os serviços (padrão)"
        echo "  stop     - Para todos os serviços"
        echo "  restart  - Reinicia todos os serviços"
        echo "  cleanup  - Remove volumes e imagens antigas"
        echo "  logs     - Mostra logs em tempo real"
        echo "  status   - Mostra status dos serviços"
        echo "  shell    - Abre shell no container da aplicação"
        echo ""
        echo "Ambientes disponíveis:"
        echo "  development (padrão)"
        echo "  production"
        exit 1
        ;;
esac

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Aplicação disponível em: http://localhost:3001"
echo "📊 Monitoramento disponível em: http://localhost:3000 (Grafana)"
echo "🔍 Métricas disponíveis em: http://localhost:9090 (Prometheus)"
