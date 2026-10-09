export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return respond(event, await updateMoment(useDb(), user.id, idParam(event), await readBody(event)))
})
