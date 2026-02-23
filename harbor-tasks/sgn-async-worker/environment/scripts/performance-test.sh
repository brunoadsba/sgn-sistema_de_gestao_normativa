#!/bin/bash

# Script para testar performance do SGN
# Uso: ./scripts/performance-test.sh [url] [concurrent_users] [duration]

set -e

# Configurações padrão
BASE_URL=${1:-"http://localhost:3001"}
CONCURRENT_USERS=${2:-10}
DURATION=${3:-60}
TEST_NAME="sgn-performance-test"

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

# Função para verificar se o servidor está rodando
check_server() {
    print_message $BLUE "🔍 Verificando se o servidor está rodando..."
    
    if curl -s -f "$BASE_URL/api/health" > /dev/null; then
        print_message $GREEN "✅ Servidor está rodando em $BASE_URL"
        return 0
    else
        print_message $RED "❌ Servidor não está rodando em $BASE_URL"
        return 1
    fi
}

# Função para instalar Artillery se não estiver instalado
install_artillery() {
    if ! command -v artillery &> /dev/null; then
        print_message $YELLOW "📦 Instalando Artillery..."
        npm install -g artillery
    else
        print_message $GREEN "✅ Artillery já está instalado"
    fi
}

# Função para criar configuração do Artillery
create_artillery_config() {
    print_message $BLUE "📝 Criando configuração do Artillery..."
    
    cat > artillery-config.yml << EOF
config:
  target: '$BASE_URL'
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: $DURATION
      arrivalRate: $CONCURRENT_USERS
      name: "Load test"
    - duration: 30
      arrivalRate: $CONCURRENT_USERS
      name: "Sustained load"
  defaults:
    headers:
      User-Agent: "SGN-Performance-Test/1.0"
      Accept: "application/json"
  plugins:
    metrics-by-endpoint:
      useOnlyRequestNames: true

scenarios:
  - name: "Health Check"
    weight: 20
    flow:
      - get:
          url: "/api/health"
          capture:
            - json: "\$.status"
              as: "health_status"
          expect:
            - statusCode: 200
            - hasProperty: "status"

  - name: "Normas List"
    weight: 40
    flow:
      - get:
          url: "/api/normas"
          qs:
            page: 1
            limit: 10
          capture:
            - json: "\$.data"
              as: "normas_data"
          expect:
            - statusCode: 200
            - hasProperty: "data"

  - name: "Normas Stats"
    weight: 20
    flow:
      - get:
          url: "/api/normas/stats"
          capture:
            - json: "\$.data"
              as: "stats_data"
          expect:
            - statusCode: 200
            - hasProperty: "data"

  - name: "Cache Stats"
    weight: 10
    flow:
      - get:
          url: "/api/cache/stats"
          expect:
            - statusCode: 200

  - name: "IA Analysis (POST)"
    weight: 10
    flow:
      - post:
          url: "/api/ia/analisar-conformidade"
          json:
            empresaId: "test-empresa-{{ \$randomString() }}"
            documentoBase: "Documento de teste para análise de conformidade"
            normasAplicaveis: ["NR-6", "NR-12"]
            tipoAnalise: "completa"
          expect:
            - statusCode: 200
EOF

    print_message $GREEN "✅ Configuração do Artillery criada"
}

# Função para executar teste de performance
run_performance_test() {
    print_message $BLUE "🚀 Iniciando teste de performance..."
    print_message $YELLOW "📊 Configuração:"
    print_message $YELLOW "   - URL: $BASE_URL"
    print_message $YELLOW "   - Usuários concorrentes: $CONCURRENT_USERS"
    print_message $YELLOW "   - Duração: ${DURATION}s"
    
    # Executar teste
    artillery run artillery-config.yml --output performance-results.json
    
    print_message $GREEN "✅ Teste de performance concluído"
}

# Função para gerar relatório
generate_report() {
    print_message $BLUE "📊 Gerando relatório de performance..."
    
    # Executar relatório
    artillery report performance-results.json --output performance-report.html
    
    print_message $GREEN "✅ Relatório gerado: performance-report.html"
}

# Função para mostrar resumo dos resultados
show_summary() {
    print_message $BLUE "📈 Resumo dos resultados:"
    
    if [ -f "performance-results.json" ]; then
        # Extrair métricas principais
        local total_requests=$(jq '.aggregate.counters."http.requests" // 0' performance-results.json)
        local successful_requests=$(jq '.aggregate.counters."http.responses" // 0' performance-results.json)
        local failed_requests=$(jq '.aggregate.counters."http.request_rate" // 0' performance-results.json)
        local avg_response_time=$(jq '.aggregate.summaries."http.response_time".mean // 0' performance-results.json)
        local p95_response_time=$(jq '.aggregate.summaries."http.response_time".p95 // 0' performance-results.json)
        
        print_message $GREEN "   - Total de requests: $total_requests"
        print_message $GREEN "   - Requests bem-sucedidos: $successful_requests"
        print_message $YELLOW "   - Tempo médio de resposta: ${avg_response_time}ms"
        print_message $YELLOW "   - P95 tempo de resposta: ${p95_response_time}ms"
        
        # Verificar se performance está dentro dos limites
        if (( $(echo "$avg_response_time < 2000" | bc -l) )); then
            print_message $GREEN "✅ Performance dentro dos limites aceitáveis"
        else
            print_message $RED "⚠️  Performance abaixo do esperado (média > 2s)"
        fi
    else
        print_message $RED "❌ Arquivo de resultados não encontrado"
    fi
}

# Função para limpar arquivos temporários
cleanup() {
    print_message $BLUE "🧹 Limpando arquivos temporários..."
    rm -f artillery-config.yml
    print_message $GREEN "✅ Limpeza concluída"
}

# Função para mostrar ajuda
show_help() {
    print_message $BLUE "🚀 SGN Performance Test Script"
    echo ""
    echo "Uso: $0 [url] [concurrent_users] [duration]"
    echo ""
    echo "Parâmetros:"
    echo "  url              - URL base do servidor (padrão: http://localhost:3001)"
    echo "  concurrent_users - Número de usuários concorrentes (padrão: 10)"
    echo "  duration         - Duração do teste em segundos (padrão: 60)"
    echo ""
    echo "Exemplos:"
    echo "  $0                                    # Teste padrão"
    echo "  $0 http://localhost:3001 20 120     # 20 usuários por 2 minutos"
    echo "  $0 https://sgn.vercel.app 50 300    # 50 usuários por 5 minutos"
    echo ""
    echo "Requisitos:"
    echo "  - Artillery (será instalado automaticamente)"
    echo "  - jq (para análise de resultados)"
    echo "  - bc (para cálculos)"
}

# Função principal
main() {
    # Verificar se é pedido de ajuda
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        show_help
        exit 0
    fi
    
    print_message $BLUE "🚀 Iniciando teste de performance do SGN"
    echo ""
    
    # Verificar dependências
    if ! command -v jq &> /dev/null; then
        print_message $RED "❌ jq não está instalado. Instale com: sudo apt install jq"
        exit 1
    fi
    
    if ! command -v bc &> /dev/null; then
        print_message $RED "❌ bc não está instalado. Instale com: sudo apt install bc"
        exit 1
    fi
    
    # Executar etapas
    check_server || exit 1
    install_artillery
    create_artillery_config
    run_performance_test
    generate_report
    show_summary
    
    print_message $GREEN "🎉 Teste de performance concluído com sucesso!"
    print_message $BLUE "📄 Relatório detalhado: performance-report.html"
    print_message $BLUE "📊 Dados brutos: performance-results.json"
    
    # Limpeza opcional
    read -p "Deseja limpar arquivos temporários? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cleanup
    fi
}

# Executar função principal
main "$@"
