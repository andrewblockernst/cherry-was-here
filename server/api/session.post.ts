export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event) ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return reply(event, 400, 'missing email/password')
  }
  const user = await authenticate(useDb(), email, password)
  if (!user) return reply(event, 401, 'invalid email or password')
  await setUserSession(event, { user: { id: user.id } })
  return { user: serializeUser(user) }
})
