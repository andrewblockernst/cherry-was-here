export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  if (!(await deleteMoment(useDb(), user.id, idParam(event)))) {
    return reply(event, 404, 'not found')
  }
  return { ok: true }
})
