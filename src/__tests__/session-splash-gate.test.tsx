import { act, render, screen, waitFor } from '@testing-library/react'
import { SessionSplashGate } from '@/components/loading/SessionSplashGate'

jest.mock('@/components/loading/AppOpeningScreen', () => ({
  AppOpeningScreen: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div data-testid="splash">
      <span>{title}</span>
      <span>{subtitle}</span>
    </div>
  ),
}))

describe('SessionSplashGate', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('deve exibir splash no primeiro acesso e depois conteúdo', async () => {
    render(
      <SessionSplashGate>
        <div data-testid="conteudo">conteudo da aplicacao</div>
      </SessionSplashGate>
    )

    expect(screen.getByTestId('splash')).toBeInTheDocument()
    expect(screen.queryByTestId('conteudo')).not.toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(1200)
    })

    await waitFor(() => {
      expect(screen.getByTestId('conteudo')).toBeInTheDocument()
    })
    expect(window.sessionStorage.getItem('sgn.opening.seen')).toBe('1')
  })

  it('não deve exibir splash quando sessão já foi marcada', () => {
    window.sessionStorage.setItem('sgn.opening.seen', '1')

    render(
      <SessionSplashGate>
        <div data-testid="conteudo">conteudo da aplicacao</div>
      </SessionSplashGate>
    )

    expect(screen.getByTestId('conteudo')).toBeInTheDocument()
    expect(screen.queryByTestId('splash')).not.toBeInTheDocument()
  })
})
