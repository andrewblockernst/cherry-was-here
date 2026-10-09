import type { H3Event } from 'h3'
import type { Result } from './validation'

/** Current user from the sealed session cookie; 401 when missing or the user no longer exists. */
export async function requireUser(event: H3Event) {
  const { user } = await requireUserSession(event)
  const row = await getUserById(useDb(), user.id)
  if (!row) {
    await clearUserSession(event)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return row
}

/** `{ error }` body with the given status (the shape the old Phoenix API used). */
export function reply(event: H3Event, status: number, error: string) {
  setResponseStatus(event, status)
  return { error }
}

export const idParam = (event: H3Event) => {
  const id = Number(getRouterParam(event, 'id'))
  return Number.isInteger(id) ? id : -1
}

/** `null` (not found) -> 404, validation failure -> 422 `{ errors }`, otherwise the value. */
export function respond<T>(event: H3Event, result: Result<T> | null, status = 200) {
  if (!result) return reply(event, 404, 'not found')
  if (!result.ok) {
    setResponseStatus(event, 422)
    return { errors: result.errors }
  }
  setResponseStatus(event, status)
  return result.value
}
