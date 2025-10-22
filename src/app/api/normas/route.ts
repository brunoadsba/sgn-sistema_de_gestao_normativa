import { supabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export const revalidate = 60;

// Função principal ultra-simplificada para debug
async function getNormasHandler(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Iniciando API de normas');
    
    // Teste básico do Supabase
    const { data, error } = await supabase
      .from("normas")
      .select("id, codigo, titulo")
      .limit(3);

    console.log('🔍 DEBUG: Resultado Supabase:', { data: data?.length, error: error?.message });

    if (error) {
      console.error('❌ DEBUG: Erro Supabase:', error);
      return NextResponse.json(
        { 
          success: false,
          error: "Erro no banco de dados",
          details: error.message,
          timestamp: new Date().toISOString()
        }, 
        { status: 500 }
      );
    }

    console.log('✅ DEBUG: Sucesso, retornando dados');
    
    return NextResponse.json({
      success: true,
      data: data,
      meta: {
        timestamp: new Date().toISOString(),
        count: data?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ DEBUG: Erro geral:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

// Exportar função simplificada
export const GET = getNormasHandler;
