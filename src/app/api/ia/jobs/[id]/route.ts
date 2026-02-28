import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { createSuccessResponse, createErrorResponse } from '@/middlewares/validation';
import { rateLimit } from '@/lib/security/rate-limit';
import { createRequestLogger } from '@/lib/logger';
import { IdParamSchema } from '@/schemas';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const log = createRequestLogger(request, 'api.jobs');
    try {
        const rawParams = await params;
        const parsed = IdParamSchema.safeParse(rawParams);
        if (!parsed.success) {
            return createErrorResponse('ID invalido', 400);
        }
        const { id: jobId } = parsed.data;

        // 1. Rate Limiting (Hardening)
        const rl = rateLimit(request, {
            windowMs: 60 * 1000,
            max: 60, // 60 requisições por minuto por IP para polling
            keyPrefix: 'rl:jobs'
        });

        if (rl.limitExceeded) {
            return createErrorResponse('Muitas requisições. Tente novamente em breve.', 429);
        }

        // 2. Buscar Job e Validar Sessão
        const cookieStore = await cookies();
        const currentSession = cookieStore.get('sgn_session')?.value;

        const job = await db.query.analiseJobs.findFirst({
            where: eq(schema.analiseJobs.id, jobId),
            with: {
                documento: true,
            },
        });

        if (!job) {
            return createErrorResponse('Job não encontrado', 404);
        }

        // Validação de Propriedade (Session Match)
        if (job.sessionId && job.sessionId !== currentSession) {
            return createErrorResponse('Acesso negado ao status deste job', 403);
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
        log.error({ error }, 'Erro ao buscar job');
        return createErrorResponse('Erro interno ao buscar job', 500);
    }
}
