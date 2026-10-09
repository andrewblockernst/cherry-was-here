export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const result = await updateEra(useDb(), user.id, idParam(event), await readBody(event))
  return respond(event, result && (result.ok ? { ok: true, value: serializeEra(result.value) } : result))
})
