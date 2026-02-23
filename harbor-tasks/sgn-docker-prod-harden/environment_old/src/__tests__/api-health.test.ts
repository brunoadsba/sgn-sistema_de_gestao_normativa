/**
 * @jest-environment node
 */
import { GET } from '@/app/api/health/route';
import { isDatabaseReady } from '@/lib/db';


// Mock dependencies
jest.mock('@/lib/db', () => ({
    isDatabaseReady: jest.fn(),
}));

jest.mock('@/lib/env', () => ({
    env: {
        NODE_ENV: 'test',
        GROQ_API_KEY: 'fake_key',
    },
}));

// Mock global fetch
const originalFetch = global.fetch;

describe('GET /api/health', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    it('deve retornar status 200 e JSON valido quando servicos estiverem ok', async () => {
        (isDatabaseReady as jest.Mock).mockReturnValue(true);
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
        });

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('ok');
        expect(data.services.database).toBe('ok');
        expect(data.services.api).toBe('ok');
        expect(data.services.llm).toBe('ok');
        expect(typeof data.timestamp).toBe('string');
        expect(typeof data.performance.duration).toBe('string');
    });

    it('deve retornar status 503 e database error quando BD falhar', async () => {
        (isDatabaseReady as jest.Mock).mockReturnValue(false);
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({}),
        });

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.status).toBe('error');
        expect(data.services.database).toBe('error');
        expect(data.services.api).toBe('ok');
        expect(data.services.llm).toBe('ok');
    });

    it('deve retornar llm error quando API do GROQ falhar, mas manter status geral 200 se DB ok', async () => {
        (isDatabaseReady as jest.Mock).mockReturnValue(true);
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('ok');
        expect(data.services.database).toBe('ok');
        expect(data.services.llm).toBe('error');
    });

    it('deve tratar excecao global retornando status 503 e api error', async () => {
        (isDatabaseReady as jest.Mock).mockImplementationOnce(() => {
            throw new Error('Unexpected catastrophe');
        });

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.status).toBe('error');
        expect(data.services.api).toBe('error');
        expect(data.error).toBe('Unexpected catastrophe');
    });
});
