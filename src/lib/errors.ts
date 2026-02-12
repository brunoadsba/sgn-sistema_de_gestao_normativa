import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { isProduction } from '@/lib/env';

export interface ApiError {
  success: false;
  error: string;
  message: string;
  code?: string | undefined;
  details?: unknown | undefined;
  timestamp: string;
  requestId?: string | undefined;
}

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Limite de requisições excedido', retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Handler centralizado para erros em rotas de API
 */
export function handleApiError(error: unknown, requestId?: string): NextResponse<ApiError> {
  // Erros conhecidos da aplicação
  if (error instanceof AppError) {
    logError(error, {
      context: 'api-error',
      statusCode: error.statusCode,
      code: error.code,
      requestId,
    });

    const response: ApiError = {
      success: false,
      error: error.code || 'APP_ERROR',
      message: error.message,
      code: error.code,
      details: isProduction ? undefined : error.details,
      timestamp: new Date().toISOString(),
      requestId,
    };

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Erros de validação do Zod
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ path: string[]; message: string }> };
    const message = zodError.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    
    logError(new Error(message), {
      context: 'validation-error',
      requestId,
    });

    const response: ApiError = {
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Erro de validação',
      code: 'VALIDATION_ERROR',
      details: isProduction ? undefined : zodError.issues,
      timestamp: new Date().toISOString(),
      requestId,
    };

    return NextResponse.json(response, { status: 400 });
  }

  // Erros desconhecidos
  const unknownError = error instanceof Error ? error : new Error('Erro desconhecido');
  logError(unknownError, {
    context: 'unknown-error',
    requestId,
  });

  const response: ApiError = {
    success: false,
    error: 'INTERNAL_ERROR',
    message: isProduction 
      ? 'Erro interno do servidor' 
      : unknownError.message,
    code: 'INTERNAL_ERROR',
    details: isProduction ? undefined : {
      stack: unknownError.stack,
      name: unknownError.name,
    },
    timestamp: new Date().toISOString(),
    requestId,
  };

  return NextResponse.json(response, { status: 500 });
}

/**
 * Wrapper para rotas de API com tratamento de erro automático
 */
export function withErrorHandler<T extends (...args: unknown[]) => Promise<Response>>(
  handler: T
): T {
  return (async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Extrair requestId se disponível
      const request = args[0];
      let requestId: string | undefined;
      
      if (request && typeof request === 'object' && 'headers' in request) {
        const req = request as { headers: { get: (key: string) => string | null } };
        requestId = req.headers.get('x-correlation-id') ?? 
                    req.headers.get('x-request-id') ?? 
                    undefined;
      }
      
      return handleApiError(error, requestId);
    }
  }) as T;
}

/**
 * Criar resposta de sucesso padronizada
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: Record<string, unknown>
): NextResponse<{ success: true; data: T; timestamp: string; meta?: Record<string, unknown> }> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      ...(meta && { meta }),
    },
    { status }
  );
}

