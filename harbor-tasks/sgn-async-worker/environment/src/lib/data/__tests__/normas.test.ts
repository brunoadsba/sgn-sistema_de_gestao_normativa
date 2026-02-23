import { getNormas, getNormaById, getNormasByIds, searchNormas, getNormasStats } from '../normas';

describe('Data Helpers: Normas Regulamentadoras', () => {
    it('deve retornar array com 38 itens na chamada getNormas()', () => {
        const normas = getNormas();
        expect(Array.isArray(normas)).toBe(true);
        expect(normas.length).toBe(38);
    });

    it('deve retornar objeto com campos obrigatórios ao buscar getNormaById("1")', () => {
        const norma = getNormaById('1');
        expect(norma).toBeDefined();
        expect(norma).toHaveProperty('id', '1');
        expect(norma).toHaveProperty('codigo', 'NR-1');
        expect(norma).toHaveProperty('titulo', 'Disposições Gerais e Gerenciamento de Riscos Ocupacionais');
        expect(norma).toHaveProperty('status', 'ativa');
        expect(norma).toHaveProperty('urlOficial');
    });

    it('deve retornar undefined ao buscar getNormaById("inexistente")', () => {
        const norma = getNormaById('inexistente');
        expect(norma).toBeUndefined();
    });

    it('deve retornar resultados ao buscar por "segurança" no searchNormas()', () => {
        const resultados = searchNormas('segurança');
        expect(Array.isArray(resultados)).toBe(true);
        // There are multiple NRs with "segurança" (like NR-4, 10, 12, etc)
        expect(resultados.length).toBeGreaterThan(0);
        expect(resultados.some(n => n.titulo.toLowerCase().includes('segurança'))).toBe(true);
    });

    it('deve retornar array vazio ao buscar searchNormas("xyzabc123")', () => {
        const resultados = searchNormas('xyzabc123');
        expect(Array.isArray(resultados)).toBe(true);
        expect(resultados.length).toBe(0);
    });

    it('deve retornar estatísticas corretas em getNormasStats()', () => {
        const stats = getNormasStats();
        expect(stats).toBeDefined();
        expect(stats.total).toBe(38);
        expect(stats.ativas).toBe(36); // NR-2 and NR-27 are revoked
        expect(stats.revogadas).toBe(2);
        expect(stats.categorias).toBeDefined();
        expect(Object.keys(stats.categorias).length).toBeGreaterThan(0);
    });

    it('deve retornar array filtrado em getNormasByIds(["1", "2"])', () => {
        const normas = getNormasByIds(['1', '2']);
        expect(normas.length).toBe(2);
        expect(normas.map(n => n.id)).toEqual(expect.arrayContaining(['1', '2']));
    });
});
