export type IaErrorClass =
  | 'rate_limit'
  | 'timeout'
  | 'network'
  | 'provider_5xx'
  | 'auth'
  | 'provider_4xx'
  | 'invalid_json'
  | 'schema_validation'
  | 'forced_fallback'
  | 'unknown'

function normalizeMessage(error: unknown): string {
  if (!(error instanceof Error)) return ''
  return error.message.toLowerCase()
}

function inferStatusCode(message: string): number | null {
  const candidates = message.match(/\b(4\d{2}|5\d{2})\b/g)
  if (!candidates || candidates.length === 0) return null
  const code = Number(candidates[0])
  return Number.isNaN(code) ? null : code
}

export function classifyProviderError(error: unknown): IaErrorClass {
  const message = normalizeMessage(error)
  const status = inferStatusCode(message)

  if (message.includes('force_zai') || message.includes('force fallback')) {
    return 'forced_fallback'
  }

  if (
    message.includes('413') ||
    message.includes('429') ||
    message.includes('rate limit') ||
    message.includes('rate_limit') ||
    message.includes('tpm') ||
    message.includes('tokens')
  ) {
    return 'rate_limit'
  }

  if (
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('aborted due to timeout') ||
    message.includes('aborterror')
  ) {
    return 'timeout'
  }

  if (
    message.includes('network') ||
    message.includes('econnreset') ||
    message.includes('enotfound') ||
    message.includes('eai_again') ||
    message.includes('fetch failed')
  ) {
    return 'network'
  }

  if (status !== null && status >= 500) return 'provider_5xx'
  if (status === 401 || status === 403) return 'auth'
  if (status !== null && status >= 400) return 'provider_4xx'

  if (message.includes('json') && (message.includes('parse') || message.includes('unexpected'))) {
    return 'invalid_json'
  }

  if (message.includes('zod') || message.includes('schema')) {
    return 'schema_validation'
  }

  return 'unknown'
}

export function shouldFallbackToZaiFromGroq(error: unknown): boolean {
  const classification = classifyProviderError(error)
  return (
    classification === 'rate_limit' ||
    classification === 'timeout' ||
    classification === 'network' ||
    classification === 'provider_5xx' ||
    classification === 'forced_fallback'
  )
}

export function shouldRetryProviderError(classification: IaErrorClass): boolean {
  return (
    classification === 'rate_limit' ||
    classification === 'timeout' ||
    classification === 'network' ||
    classification === 'provider_5xx'
  )
}
