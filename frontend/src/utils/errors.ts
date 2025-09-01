// src/utils/errors.ts
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Requisição inválida.', stack = '') {
    super(400, message, true, stack);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Não autorizado.', stack = '') {
    super(401, message, true, stack);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Acesso proibido.', stack = '') {
    super(403, message, true, stack);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Recurso não encontrado.', stack = '') {
    super(404, message, true, stack);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Erro interno do servidor.', stack = '') {
    super(500, message, false, stack); // isOperational = false para erros de programação
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Dados de validação inválidos.', stack = '') {
    super(422, message, true, stack);
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Serviço indisponível.', stack = '') {
    super(503, message, true, stack);
  }
}
