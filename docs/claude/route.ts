/**
 * app/api/reports/generate/route.ts
 * Endpoint de geração de PDF — Next.js App Router.
 *
 * POST /api/reports/generate
 * Body: ReportData (JSON)
 * Response: PDF binário
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateReportPdf } from '@/services/reportService';
import type { ReportData } from '@/types/report';

export async function POST(req: NextRequest) {
  try {
    const data: ReportData = await req.json();

    // Validação mínima
    if (!data?.meta?.id || !data?.summary) {
      return NextResponse.json(
        { error: 'Payload inválido: meta.id e summary são obrigatórios.' },
        { status: 400 }
      );
    }

    const { buffer, filename, contentType } = await generateReportPdf(data);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[/api/reports/generate] Erro:', error);
    return NextResponse.json(
      { error: 'Falha ao gerar PDF. Tente novamente.' },
      { status: 500 }
    );
  }
}
