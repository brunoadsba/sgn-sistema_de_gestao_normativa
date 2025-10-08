// src/middlewares/errorHandler.ts
import { NextRequest, NextResponse } from 'next/server';
import { ApiError, InternalServerError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (err: unknown, req: NextRequest) => {
  let error: ApiError;

  // Se o erro não for uma instância de ApiError, trate-o como um erro interno do servidor
  if (!(err instanceof ApiError)) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
    const errorStack = err instanceof Error ? err.stack : '';
    error = new InternalServerError(errorMessage, errorStack);
  } else {
    error = err;
  }

  // Logar o erro completo para depuração
  logger.error({
    statusCode: error.statusCode,
    message: error.message,
    stack: error.stack,
    path: req.url,
    method: req.method,
    // Adicione mais contexto conforme necessário (ex: userId, correlationId)
  }, `Erro na API: ${error.message}`);

  // Enviar resposta padronizada para o cliente
  return NextResponse.json({
    status: 'error',
    message: error.message,
    // Em produção, evite enviar o stack trace para o cliente por segurança
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  }, { status: error.statusCode });
};

// Para Next.js API Routes, você pode usar este wrapper
export const withErrorHandler = (handler: (req: NextRequest) => Promise<NextResponse>) => {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      return errorHandler(error, req);
    }
  };
};
