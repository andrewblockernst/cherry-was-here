/** Turns a `$fetch` failure into one readable line (`{ error }` or `{ errors: { field: [msg] } }`). */
export function apiError(e: unknown): string {
  // h3's own errors send `error: true`, so only trust `error` when it is our string.
  const data = (e as { data?: { error?: unknown, errors?: Record<string, string[]>, message?: string, statusMessage?: string } }).data
  if (typeof data?.error === 'string') return data.error
  if (data?.errors) return Object.entries(data.errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join('; ')
  return data?.message || data?.statusMessage || (e instanceof Error ? e.message : 'Error')
}
