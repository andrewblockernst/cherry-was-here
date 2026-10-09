export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  if (!(await deleteEra(useDb(), user.id, idParam(event)))) {
    return reply(event, 404, 'not found')
  }
  return { ok: true }
})
