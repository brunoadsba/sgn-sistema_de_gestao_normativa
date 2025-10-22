// Setup básico para testes
import { configure } from '@testing-library/react';
import '@testing-library/jest-dom';

// Configurar Testing Library
configure({ testIdAttribute: 'data-testid' });

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Teste básico para evitar erro de "suite must contain at least one test"
describe('Setup', () => {
  it('should configure testing environment', () => {
    expect(true).toBe(true);
  });
});