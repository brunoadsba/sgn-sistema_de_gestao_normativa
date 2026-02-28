import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateReportPdf } from '@/services/reportService'
import { rateLimit } from '@/lib/security/rate-limit'
import { createErrorResponse } from '@/middlewares/validation'
import { createRequestLogger } from '@/lib/logger'
import type { ReportData } from '@/types/report'

export const runtime = 'nodejs'

const ReportPayloadSchema = z.object({
  meta: z.object({
    id: z.string().min(1),
    analyst: z.string().min(1),
    createdAt: z.string().min(1),
    version: z.string().min(1),
    sessionId: z.string().min(1),
    scope: z.enum(['valid', 'out_of_scope']),
  }),
  summary: z.object({
    score: z.number(),
    riskLevel: z.enum(['Baixo', 'Médio', 'Alto', 'Crítico']),
    totalGaps: z.number(),
    legalStatus: z.string().min(1),
    confidenceScore: z.number(),
    confidenceClass: z.enum(['confianca_alta', 'confianca_media', 'confianca_baixa']),
    documentTitle: z.string().min(1),
    documentType: z.string().min(1),
    analysisScope: z.array(z.string()),
    strengths: z.array(z.string()),
    attentionPoints: z.array(z.string()),
    scopeWarning: z.string().optional(),
  }),
  governance: z.object({
    reportStatus: z.enum(['pre_laudo_pendente', 'laudo_aprovado', 'laudo_rejeitado']),
    confidenceScore: z.number(),
    confidenceClass: z.enum(['confianca_alta', 'confianca_media', 'confianca_baixa']),
    alertasConfiabilidade: z.array(z.string()),
    revisaoHumana: z
      .object({
        decisao: z.enum(['aprovado', 'rejeitado']),
        revisor: z.string(),
        justificativa: z.string(),
        createdAt: z.string(),
      })
      .nullable()
      .optional(),
  }),
  gaps: z.array(
    z.object({
      id: z.string().min(1),
      severity: z.enum(['Baixa', 'Média', 'Alta', 'Crítica']),
      category: z.string().min(1),
      description: z.string().min(1),
      recommendation: z.string().min(1),
      status: z.enum(['Aberto', 'Em andamento', 'Resolvido']),
      norm: z.string().optional(),
    })
  ),
  actions: z.array(
    z.object({
      id: z.string().min(1),
      description: z.string().min(1),
      responsible: z.string().optional(),
      deadline: z.string().optional(),
      priority: z.enum(['Alta', 'Média', 'Baixa']),
    })
  ),
})

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, { windowMs: 60_000, max: 10, keyPrefix: 'rl:reports' });
    if (rl.limitExceeded) {
      return createErrorResponse("Limite de requisições excedido", 429);
    }

    const rawPayload = await request.json()
    const parsed = ReportPayloadSchema.safeParse(rawPayload)

    if (!parsed.success) {
      return createErrorResponse('Payload inválido para geração de PDF', 400, parsed.error.issues)
    }

    const { buffer, filename, contentType } = await generateReportPdf(parsed.data as ReportData)

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const logger = createRequestLogger(request, 'api.reports')
    logger.error({ error }, 'Falha ao gerar PDF')
    return createErrorResponse('Falha ao gerar PDF', 500)
  }
}
