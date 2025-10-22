import { NextRequest, NextResponse } from 'next/server';
import { 
  getCacheStats, 
  clearAllCache, 
  invalidateCacheByTag, 
  invalidateCacheByPattern 
} from '@/middlewares/cache';
import { createSuccessResponse, createErrorResponse } from '@/middlewares/validation';
import { apiLogger, logAudit } from '@/lib/logger';
import { getCorrelationId, addCorrelationIdToResponse, createLogContext } from '@/lib/logger/correlation';

// GET /api/cache/stats - Obter estatísticas do cache
export async function GET(request: NextRequest) {
  const correlationId = getCorrelationId(request);
  const logContext = createLogContext(request);

  try {
    apiLogger.info({
      ...logContext,
      event: 'cache_stats_request',
    }, 'Solicitação de estatísticas do cache');

    const stats = await getCacheStats();
    
    logAudit('cache_stats_viewed', undefined, logContext);
    
    const successResponse = createSuccessResponse(
      stats,
      "Estatísticas do cache obtidas com sucesso",
      200
    );

    return addCorrelationIdToResponse(successResponse, correlationId);

  } catch (error) {
    apiLogger.error({
      ...logContext,
      event: 'cache_stats_error',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, 'Erro ao obter estatísticas do cache');

    const errorResponse = createErrorResponse(
      "Erro ao obter estatísticas do cache",
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    );

    return addCorrelationIdToResponse(errorResponse, correlationId);
  }
}

// DELETE /api/cache - Limpar cache
export async function DELETE(request: NextRequest) {
  const correlationId = getCorrelationId(request);
  const logContext = createLogContext(request);

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const tag = url.searchParams.get('tag');
    const pattern = url.searchParams.get('pattern');

    apiLogger.info({
      ...logContext,
      event: 'cache_clear_request',
      action,
      tag,
      pattern,
    }, 'Solicitação de limpeza do cache');

    let result: any = {};

    switch (action) {
      case 'all':
        await clearAllCache();
        result = { message: 'Todo o cache foi limpo', action: 'all' };
        break;
        
      case 'tag':
        if (!tag) {
          return createErrorResponse("Tag é obrigatória para ação 'tag'", 400);
        }
        await invalidateCacheByTag(tag);
        result = { message: `Cache da tag '${tag}' foi limpo`, action: 'tag', tag };
        break;
        
      case 'pattern':
        if (!pattern) {
          return createErrorResponse("Pattern é obrigatório para ação 'pattern'", 400);
        }
        await invalidateCacheByPattern(pattern);
        result = { message: `Cache do padrão '${pattern}' foi limpo`, action: 'pattern', pattern };
        break;
        
      default:
        return createErrorResponse("Ação inválida. Use: 'all', 'tag' ou 'pattern'", 400);
    }

    logAudit('cache_cleared', undefined, {
      ...logContext,
      action,
      tag,
      pattern,
    });
    
    const successResponse = createSuccessResponse(
      result,
      "Cache limpo com sucesso",
      200
    );

    return addCorrelationIdToResponse(successResponse, correlationId);

  } catch (error) {
    apiLogger.error({
      ...logContext,
      event: 'cache_clear_error',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, 'Erro ao limpar cache');

    const errorResponse = createErrorResponse(
      "Erro ao limpar cache",
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    );

    return addCorrelationIdToResponse(errorResponse, correlationId);
  }
}

// POST /api/cache/invalidate - Invalidar cache específico
export async function POST(request: NextRequest) {
  const correlationId = getCorrelationId(request);
  const logContext = createLogContext(request);

  try {
    const body = await request.json();
    const { type, value } = body;

    if (!type || !value) {
      return createErrorResponse("Tipo e valor são obrigatórios", 400);
    }

    apiLogger.info({
      ...logContext,
      event: 'cache_invalidate_request',
      type,
      value,
    }, 'Solicitação de invalidação de cache');

    let result: any = {};

    switch (type) {
      case 'tag':
        await invalidateCacheByTag(value);
        result = { message: `Cache da tag '${value}' foi invalidado`, type, value };
        break;
        
      case 'pattern':
        await invalidateCacheByPattern(value);
        result = { message: `Cache do padrão '${value}' foi invalidado`, type, value };
        break;
        
      default:
        return createErrorResponse("Tipo inválido. Use: 'tag' ou 'pattern'", 400);
    }

    logAudit('cache_invalidated', undefined, {
      ...logContext,
      type,
      value,
    });
    
    const successResponse = createSuccessResponse(
      result,
      "Cache invalidado com sucesso",
      200
    );

    return addCorrelationIdToResponse(successResponse, correlationId);

  } catch (error) {
    apiLogger.error({
      ...logContext,
      event: 'cache_invalidate_error',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, 'Erro ao invalidar cache');

    const errorResponse = createErrorResponse(
      "Erro ao invalidar cache",
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    );

    return addCorrelationIdToResponse(errorResponse, correlationId);
  }
}
