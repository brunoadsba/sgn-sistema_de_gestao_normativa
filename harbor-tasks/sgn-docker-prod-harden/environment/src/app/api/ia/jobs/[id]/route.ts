import { NextRequest } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse } from '@/middlewares/validation';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: jobId } = await params;

        const job = await db.query.analiseJobs.findFirst({
            where: eq(schema.analiseJobs.id, jobId),
            with: {
                documento: true,
            },
        });

        if (!job) {
            return createErrorResponse('Job não encontrado', 404);
        }

        // Buscar resultado se estiver concluído
        let resultado = null;
        if (job.status === 'completed') {
            resultado = await db.query.analiseResultados.findFirst({
                where: eq(schema.analiseResultados.jobId, job.id),
            });
        }

        return createSuccessResponse({
            id: job.id,
            status: job.status,
            progresso: job.progresso,
            erroDetalhes: job.erroDetalhes,
            documento: (job as { documento?: unknown }).documento,
            resultadoId: resultado?.id || null,
            createdAt: job.createdAt,
            startedAt: job.startedAt,
            completedAt: job.completedAt,
        });
    } catch (error) {
        console.error('[API] Erro ao buscar job:', error);
        return createErrorResponse('Erro interno ao buscar job', 500);
    }
}
