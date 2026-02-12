import { NextRequest } from 'next/server';
import { getSecurityConfig, validateSecurityConfig } from '@/middlewares/security';
import { getRateLimitStats, resetRateLimit } from '@/middlewares/rate-limit';
import { createSuccessResponse, createErrorResponse } from '@/middlewares/validation';
import { apiLogger, logAudit, logSecurity } from '@/lib/logger';
import { getCorrelationId, addCorrelationIdToResponse, createLogContext } from '@/lib/logger/correlation';

// GET /api/security/config - Obter configuração de segurança
export async function GET(request: NextRequest) {
  const correlationId = getCorrelationId(request);
  const logContext = createLogContext(request);

  try {
    apiLogger.info({
      ...logContext,
      event: 'security_config_request',
    }, 'Solicitação de configuração de segurança');

    const config = getSecurityConfig();
    const validation = validateSecurityConfig();
    
    logAudit('security_config_viewed', undefined, logContext);
    
    const successResponse = createSuccessResponse(
      {
        config,
        validation,
        timestamp: new Date().toISOString(),
      },
      "Configuração de segurança obtida com sucesso",
      200
    );

    return addCorrelationIdToResponse(successResponse, correlationId);

  } catch (error) {
    apiLogger.error({
      ...logContext,
      event: 'security_config_error',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, 'Erro ao obter configuração de segurança');

    const errorResponse = createErrorResponse(
      "Erro ao obter configuração de segurança",
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    );

    return addCorrelationIdToResponse(errorResponse, correlationId);
  }
}

// POST /api/security/rate-limit/reset - Resetar rate limit
export async function POST(request: NextRequest) {
  const correlationId = getCorrelationId(request);
  const logContext = createLogContext(request);

  try {
    const body = await request.json();
    const { ip, prefix } = body;

    if (!ip) {
      return createErrorResponse("IP é obrigatório", 400);
    }

    apiLogger.info({
      ...logContext,
      event: 'rate_limit_reset_request',
      ip,
      prefix,
    }, 'Solicitação de reset de rate limit');

    await resetRateLimit(ip, prefix || 'rate_limit');
    
    logSecurity('rate_limit_reset', 'medium', {
      ...logContext,
      ip,
      prefix,
    });
    
    const successResponse = createSuccessResponse(
      {
        ip,
        prefix: prefix || 'rate_limit',
        resetAt: new Date().toISOString(),
      },
      "Rate limit resetado com sucesso",
      200
    );

    return addCorrelationIdToResponse(successResponse, correlationId);

  } catch (error) {
    apiLogger.error({
      ...logContext,
      event: 'rate_limit_reset_error',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, 'Erro ao resetar rate limit');

    const errorResponse = createErrorResponse(
      "Erro ao resetar rate limit",
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    );

    return addCorrelationIdToResponse(errorResponse, correlationId);
  }
}

// GET /api/security/stats - Obter estatísticas de segurança
export async function GET_STATS(request: NextRequest) {
  const correlationId = getCorrelationId(request);
  const logContext = createLogContext(request);

  try {
    apiLogger.info({
      ...logContext,
      event: 'security_stats_request',
    }, 'Solicitação de estatísticas de segurança');

    const rateLimitStats = await getRateLimitStats();
    const securityConfig = getSecurityConfig();
    
    const stats = {
      rateLimit: rateLimitStats,
      security: {
        environment: securityConfig.environment,
        corsOrigins: securityConfig.cors.origin.length,
        cspDirectives: Object.keys(securityConfig.csp).length,
        securityHeaders: Object.keys(securityConfig.securityHeaders).length,
      },
      timestamp: new Date().toISOString(),
    };
    
    logAudit('security_stats_viewed', undefined, logContext);
    
    const successResponse = createSuccessResponse(
      stats,
      "Estatísticas de segurança obtidas com sucesso",
      200
    );

    return addCorrelationIdToResponse(successResponse, correlationId);

  } catch (error) {
    apiLogger.error({
      ...logContext,
      event: 'security_stats_error',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, 'Erro ao obter estatísticas de segurança');

    const errorResponse = createErrorResponse(
      "Erro ao obter estatísticas de segurança",
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    );

    return addCorrelationIdToResponse(errorResponse, correlationId);
  }
}

// POST /api/security/test - Testar configurações de segurança
export async function POST_TEST(request: NextRequest) {
  const correlationId = getCorrelationId(request);
  const logContext = createLogContext(request);

  try {
    const body = await request.json();
    const { testType } = body;

    apiLogger.info({
      ...logContext,
      event: 'security_test_request',
      testType,
    }, 'Solicitação de teste de segurança');

    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {},
    };

    // Teste de CORS
    if (!testType || testType === 'cors') {
      const corsTest = {
        allowedOrigins: getSecurityConfig().cors.origin.length,
        methods: getSecurityConfig().cors.methods.length,
        headers: getSecurityConfig().cors.allowedHeaders.length,
        credentials: getSecurityConfig().cors.credentials,
      };
      results.tests.cors = corsTest;
    }

    // Teste de CSP
    if (!testType || testType === 'csp') {
      const cspTest = {
        directives: Object.keys(getSecurityConfig().csp).length,
        hasDefaultSrc: 'default-src' in getSecurityConfig().csp,
        hasScriptSrc: 'script-src' in getSecurityConfig().csp,
        hasStyleSrc: 'style-src' in getSecurityConfig().csp,
      };
      results.tests.csp = cspTest;
    }

    // Teste de Rate Limiting
    if (!testType || testType === 'rateLimit') {
      const rateLimitTest = await getRateLimitStats();
      results.tests.rateLimit = rateLimitTest;
    }

    // Teste de Headers de Segurança
    if (!testType || testType === 'headers') {
      const headersTest = {
        totalHeaders: Object.keys(getSecurityConfig().securityHeaders).length,
        hasFrameOptions: 'X-Frame-Options' in getSecurityConfig().securityHeaders,
        hasContentTypeOptions: 'X-Content-Type-Options' in getSecurityConfig().securityHeaders,
        hasXssProtection: 'X-XSS-Protection' in getSecurityConfig().securityHeaders,
      };
      results.tests.headers = headersTest;
    }

    // Validação geral
    const validation = validateSecurityConfig();
    results.validation = validation;
    
    logAudit('security_test_executed', undefined, {
      ...logContext,
      testType,
      results,
    });
    
    const successResponse = createSuccessResponse(
      results,
      "Teste de segurança executado com sucesso",
      200
    );

    return addCorrelationIdToResponse(successResponse, correlationId);

  } catch (error) {
    apiLogger.error({
      ...logContext,
      event: 'security_test_error',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, 'Erro ao executar teste de segurança');

    const errorResponse = createErrorResponse(
      "Erro ao executar teste de segurança",
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    );

    return addCorrelationIdToResponse(errorResponse, correlationId);
  }
}

// Função para rotear requests baseado no path
export async function handleSecurityRequest(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  if (path.endsWith('/config')) {
    return GET(request);
  } else if (path.endsWith('/stats')) {
    return GET_STATS(request);
  } else if (path.endsWith('/test')) {
    return POST_TEST(request);
  } else if (path.endsWith('/rate-limit/reset')) {
    return POST(request);
  } else {
    return createErrorResponse("Endpoint não encontrado", 404);
  }
}
