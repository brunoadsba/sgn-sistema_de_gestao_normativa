import { NextRequest } from 'next/server';

/**
 * Padrão Indústria: Rate Limiter In-Memory (Sliding Window)
 * Ideal para projetos single-node/local onde Redis não é obrigatório.
 */

interface RateLimitEntry {
    requests: number[];
    suspendedUntil: number | null;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

export interface RateLimitOptions {
    windowMs: number;
    max: number;
    keyPrefix?: string;
}

/**
 * Implementa limite de requisições por IP ou identificador.
 * @returns { limitExceeded: boolean, remaining: number, reset: number }
 */
export function rateLimit(req: NextRequest, options: RateLimitOptions) {
    const { windowMs, max, keyPrefix = 'rl' } = options;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    if (!stores.has(keyPrefix)) {
        stores.set(keyPrefix, new Map());
    }

    const store = stores.get(keyPrefix)!;
    let entry = store.get(key);

    if (!entry) {
        entry = { requests: [], suspendedUntil: null };
        store.set(key, entry);
    }

    // Verificar se está suspenso
    if (entry.suspendedUntil && entry.suspendedUntil > now) {
        return {
            limitExceeded: true,
            remaining: 0,
            reset: entry.suspendedUntil,
        };
    }

    // Filtrar requisições fora da janela atual
    entry.requests = entry.requests.filter((timestamp) => timestamp > now - windowMs);

    if (entry.requests.length >= max) {
        // Aplicar suspensão temporária (penalidade)
        entry.suspendedUntil = now + windowMs;
        return {
            limitExceeded: true,
            remaining: 0,
            reset: entry.suspendedUntil,
        };
    }

    // Adicionar nova requisição
    entry.requests.push(now);

    return {
        limitExceeded: false,
        remaining: max - entry.requests.length,
        reset: now + windowMs,
    };
}
