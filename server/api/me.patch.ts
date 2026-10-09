export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const result = await updateProfile(useDb(), user.id, await readBody(event))
  return respond(event, result.ok ? { ok: true, value: serializeUser(result.value) } : result)
})
