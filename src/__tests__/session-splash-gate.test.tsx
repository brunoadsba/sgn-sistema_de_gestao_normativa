import { act, fireEvent, render, screen } from '@testing-library/react'
import { SessionSplashGate } from '@/components/loading/SessionSplashGate'

jest.mock('@/components/loading/AppOpeningScreen', () => ({
  AppOpeningScreen: ({
    title,
    subtitle,
    onContinue,
    actionLabel,
  }: {
    title: string
    subtitle: string
    onContinue: () => void
    actionLabel: string
  }) => (
    <div data-testid="splash">
      <span>{title}</span>
      <span>{subtitle}</span>
      <button onClick={onContinue} type="button">
        {actionLabel}
      </button>
    </div>
  ),
}))

describe('SessionSplashGate', () => {
  beforeEach(() => {
    window.localStorage.clear()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('deve manter splash até clique explícito e depois liberar conteúdo', () => {
    render(
      <SessionSplashGate>
        <div data-testid="conteudo">conteudo da aplicacao</div>
      </SessionSplashGate>
    )

    expect(screen.getByTestId('splash')).toBeInTheDocument()
    expect(screen.queryByTestId('conteudo')).not.toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(screen.getByTestId('splash')).toBeInTheDocument()
    expect(screen.queryByTestId('conteudo')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Acessar Plataforma' }))

    expect(screen.getByTestId('conteudo')).toBeInTheDocument()
    expect(window.localStorage.getItem('sgn.opening.seen.device')).toBe('1')
  })

  it('não deve exibir splash quando dispositivo já foi marcado', () => {
    window.localStorage.setItem('sgn.opening.seen.device', '1')

    render(
      <SessionSplashGate>
        <div data-testid="conteudo">conteudo da aplicacao</div>
      </SessionSplashGate>
    )

    expect(screen.getByTestId('conteudo')).toBeInTheDocument()
    expect(screen.queryByTestId('splash')).not.toBeInTheDocument()
  })
})
