const MAX_DOCUMENT_LENGTH = 500_000

/**
 * Sanitiza input do usuário antes de enviar à IA.
 * Remove tentativas de prompt injection, HTML, scripts e limita tamanho.
 */
export function sanitizeInput(input: string, maxLength = MAX_DOCUMENT_LENGTH): string {
  return input
    .slice(0, maxLength)
    .replace(/```/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\{%[\s\S]*?%\}/g, '')
    .replace(/\{\{[\s\S]*?\}\}/g, '')
    .replace(/\bsystem\b:/gi, '')
    .replace(/\brole\b:\s*["']?(system|assistant)["']?/gi, '')
    .replace(/\bignore\b.*\binstructions?\b/gi, '[removido]')
    .replace(/\bforget\b.*\bprevious\b/gi, '[removido]')
    .trim()
}
