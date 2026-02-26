import { env } from '@/lib/env'

export function getZaiThinkingOptions(): Record<string, unknown> {
  if (env.ZAI_DISABLE_THINKING !== 'true') {
    return {}
  }

  return {
    // Z.AI/GLM aceita ambos formatos; mantemos os dois para compatibilidade.
    thinking: { type: 'disabled' },
    enable_thinking: false,
  }
}
