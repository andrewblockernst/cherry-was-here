export default defineEventHandler(async (event) => {
  const body = await readBody(event) ?? {}
  if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    return reply(event, 400, 'missing email/password')
  }
  const result = await registerUser(useDb(), body)
  if (result.ok) await setUserSession(event, { user: { id: result.value.id } })
  return respond(event, result.ok ? { ok: true, value: { user: serializeUser(result.value) } } : result, 201)
})
