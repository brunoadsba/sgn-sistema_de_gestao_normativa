import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logger';

// Middleware para logging automático de requisições
export function withRequestLogging<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T>> => {
    const startTime = Date.now();

    try {
      // Log da requisição recebida
      log.info(`Requisição ${request.method} ${request.url} iniciada`);

      // Executar handler
      const response = await handler(request);
      const duration = Date.now() - startTime;

      // Log da resposta
      log.info(`Requisição ${request.method} ${request.url} concluída em ${duration}ms`);

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log de erro
      log.error({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        duration,
        url: request.url,
        method: request.method,
      }, 'Erro na requisição');

      // Retornar resposta de erro padronizada
      return NextResponse.json(
        {
          success: false,
          error: 'Erro interno do servidor',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  };
}

// Middleware para logging de operações de banco de dados
export function withDatabaseLogging<T>(
  operation: string,
  handler: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  return handler()
    .then((result) => {
      const duration = Date.now() - startTime;
      
      log.info({
        operation,
        duration,
        event: 'database_operation_success',
      }, `Operação de banco ${operation} executada em ${duration}ms`);
      
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      
      log.error({
        operation,
        duration,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        event: 'database_operation_error',
      }, `Erro na operação de banco ${operation}`);
      
      throw error;
    });
}

// Função para log de métricas de negócio
export function logBusinessMetrics(metrics: Record<string, number>, context?: Record<string, any>) {
  Object.entries(metrics).forEach(([metric, value]) => {
    log.info({
      business_metric: metric,
      value,
      timestamp: new Date().toISOString(),
      ...context,
    }, `Métrica de negócio: ${metric} = ${value}`);
  });
}
