import type { z } from 'zod'

export type Errors = Record<string, string[]>
export type Result<T> = { ok: true, value: T } | { ok: false, errors: Errors }

export const fail = (field: string, message: string): Result<never> => ({ ok: false, errors: { [field]: [message] } })

/** Validates `input` with a zod schema, mapping issues to `{ field: [messages] }`. */
export function parse<S extends z.ZodType>(schema: S, input: unknown): Result<z.output<S>> {
  const r = schema.safeParse(input ?? {})
  if (r.success) return { ok: true, value: r.data }
  const errors: Errors = {}
  for (const issue of r.error.issues) (errors[String(issue.path[0] ?? 'base')] ??= []).push(issue.message)
  return { ok: false, errors }
}

/** Drizzle wraps driver errors, so walk the `cause` chain looking for a UNIQUE violation. */
export function isUniqueViolation(e: unknown): boolean {
  for (let cur: any = e; cur; cur = cur.cause) {
    if (String(cur.code ?? '').startsWith('SQLITE_CONSTRAINT') && String(cur.message).includes('UNIQUE')) return true
  }
  return false
}
