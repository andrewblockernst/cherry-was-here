/** Turns a `$fetch` failure into one readable line (`{ error }` or `{ errors: { field: [msg] } }`). */
export function apiError(e: unknown): string {
  const data = (e as { data?: { error?: string, errors?: Record<string, string[]>, message?: string } }).data
  if (data?.error) return data.error
  if (data?.errors) return Object.entries(data.errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join('; ')
  return data?.message ?? (e instanceof Error ? e.message : 'Error')
}
