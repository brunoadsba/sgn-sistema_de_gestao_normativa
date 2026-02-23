type RetryOptions = {
  retries?: number
  baseDelayMs?: number
  timeoutMs?: number
}

const DEFAULT_RETRIES = 3
const DEFAULT_BASE_DELAY_MS = 400
const DEFAULT_TIMEOUT_MS = 45000

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status <= 599)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createTimeoutSignal(timeoutMs: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  return { signal: controller.signal, timeout }
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: RetryOptions = {}
): Promise<Response> {
  const retries = options.retries ?? DEFAULT_RETRIES
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  let lastError: unknown

  for (let attempt = 0; attempt < retries; attempt++) {
    const { signal, timeout } = createTimeoutSignal(timeoutMs)

    try {
      const requestInit: RequestInit = {
        ...init,
        signal,
      }
      const response = await fetch(input, requestInit)
      clearTimeout(timeout)

      if (!isRetryableStatus(response.status)) {
        return response
      }

      lastError = new Error(`Status retryável recebido: ${response.status}`)
    } catch (error) {
      clearTimeout(timeout)
      lastError = error
    }

    if (attempt < retries - 1) {
      const backoff = baseDelayMs * (2 ** attempt) + Math.floor(Math.random() * 200)
      await delay(backoff)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Falha de rede após tentativas de retry')
}
