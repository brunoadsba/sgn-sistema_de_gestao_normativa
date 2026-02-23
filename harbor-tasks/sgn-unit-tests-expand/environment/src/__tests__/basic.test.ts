// Teste simples para verificar se o Jest está funcionando
describe('SGN - Testes Básicos', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const text = 'SGN Sistema de Gestão Normativa';
    expect(text).toContain('SGN');
    expect(text.length).toBeGreaterThan(10);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    expect(result).toBe('success');
  });
});
