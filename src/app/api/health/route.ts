import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('Health check iniciado', { url: request.url });

    // Verificar conexão com o banco de dados Supabase
    const { data, error } = await supabase
      .from('normas')
      .select('id')
      .limit(1);

    if (error) {
      logger.error('Health check falhou: erro no banco de dados', { error });
      return Response.json(
        { 
          status: 'error', 
          message: 'API não está saudável - erro no banco de dados',
          details: error.message,
          timestamp: new Date().toISOString()
        }, 
        { status: 503 }
      );
    }

    // Verificar se conseguiu conectar e fazer query
    if (!data) {
      logger.error('Health check falhou: sem dados do banco');
      return Response.json(
        { 
          status: 'error', 
          message: 'API não está saudável - sem dados do banco',
          timestamp: new Date().toISOString()
        }, 
        { status: 503 }
      );
    }

    logger.info('Health check bem-sucedido');
    return Response.json({
      status: 'ok',
      message: 'API está saudável',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
        api: 'ok'
      }
    });

  } catch (error) {
    logger.error('Health check falhou: erro interno', { error });
    return Response.json(
      { 
        status: 'error', 
        message: 'API não está saudável - erro interno',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    );
  }
}
