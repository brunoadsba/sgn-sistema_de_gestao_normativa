import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Middleware para adicionar correlation ID
export function addCorrelationId(request: NextRequest): NextRequest {
  const correlationId = request.headers.get('x-correlation-id') || randomUUID();
  
  // Adicionar correlation ID aos headers da requisição
  const newHeaders = new Headers(request.headers);
  newHeaders.set('x-correlation-id', correlationId);
  
  return new NextRequest(request.url, {
    method: request.method,
    headers: newHeaders,
    body: request.body,
  });
}

// Função para extrair correlation ID da requisição
export function getCorrelationId(request: NextRequest): string {
  return request.headers.get('x-correlation-id') || randomUUID();
}

// Função para adicionar correlation ID à resposta
export function addCorrelationIdToResponse(response: NextResponse, correlationId: string): NextResponse {
  response.headers.set('x-correlation-id', correlationId);
  return response;
}

// Função para extrair informações da requisição para logging
export function extractRequestInfo(request: NextRequest) {
  const correlationId = getCorrelationId(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown';
  
  return {
    correlationId,
    userAgent,
    ip,
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString(),
  };
}

// Hook para usar correlation ID em componentes React
export function useCorrelationId(): string {
  // Em componentes client-side, gerar um ID único
  if (typeof window !== 'undefined') {
    return randomUUID();
  }
  
  // Em server components, usar um ID padrão
  return 'server-component';
}

// Função para criar contexto de logging padronizado
export function createLogContext(request: NextRequest, additionalContext?: Record<string, any>) {
  const requestInfo = extractRequestInfo(request);
  
  return {
    ...requestInfo,
    ...additionalContext,
  };
}
