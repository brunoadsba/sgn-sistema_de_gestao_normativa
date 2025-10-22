import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verificar conexão com o banco de dados Supabase
    const { data, error } = await supabase
      .from('normas')
      .select('id')
      .limit(1);

    if (error) {
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

    if (!data) {
      return Response.json(
        { 
          status: 'error', 
          message: 'API não está saudável - sem dados do banco',
          timestamp: new Date().toISOString()
        }, 
        { status: 503 }
      );
    }

    const duration = Date.now() - startTime;
    
    return Response.json({
      status: 'ok',
      message: 'API está saudável',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
        api: 'ok'
      },
      performance: {
        duration: `${duration}ms`
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
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
