import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

// Middleware para validação de dados de entrada
export function validateRequest<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => 
        `${issue.path.join('.')}: ${issue.message}`
      ).join(', ');
      return { success: false, error: `Dados inválidos: ${errorMessages}` };
    }
    return { success: false, error: 'Erro de validação desconhecido' };
  }
}

// Middleware para validação de query parameters
export function validateQueryParams<T>(
  schema: ZodSchema<T>,
  request: NextRequest
): { success: true; data: T } | { success: false; error: string } {
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());
  
  return validateRequest(schema, queryParams);
}

// Middleware para validação de body da requisição
export async function validateRequestBody<T>(
  schema: ZodSchema<T>,
  request: NextRequest
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    return validateRequest(schema, body);
  } catch (error) {
    return { success: false, error: 'Body da requisição inválido ou ausente' };
  }
}

// Função para criar resposta de erro padronizada
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Função para criar resposta de sucesso padronizada
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Wrapper para APIs com validação automática
export function withValidation<TBody, TQuery>(
  bodySchema?: ZodSchema<TBody>,
  querySchema?: ZodSchema<TQuery>
) {
  return function (
    handler: (
      request: NextRequest,
      validatedBody?: TBody,
      validatedQuery?: TQuery
    ) => Promise<NextResponse>
  ) {
    return async (request: NextRequest): Promise<NextResponse> => {
      try {
        // Validar query parameters se fornecido
        let validatedQuery: TQuery | undefined;
        if (querySchema) {
          const queryValidation = validateQueryParams(querySchema, request);
          if (!queryValidation.success) {
            return createErrorResponse(queryValidation.error, 400);
          }
          validatedQuery = queryValidation.data;
        }

        // Validar body se fornecido
        let validatedBody: TBody | undefined;
        if (bodySchema) {
          const bodyValidation = await validateRequestBody(bodySchema, request);
          if (!bodyValidation.success) {
            return createErrorResponse(bodyValidation.error, 400);
          }
          validatedBody = bodyValidation.data;
        }

        // Executar handler com dados validados
        return await handler(request, validatedBody, validatedQuery);
      } catch (error) {
        console.error('Erro no middleware de validação:', error);
        return createErrorResponse(
          'Erro interno do servidor',
          500,
          error instanceof Error ? error.message : 'Erro desconhecido'
        );
      }
    };
  };
}
