export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const result = await createEra(useDb(), user.id, await readBody(event))
  return respond(event, result.ok ? { ok: true, value: serializeEra(result.value) } : result, 201)
})
