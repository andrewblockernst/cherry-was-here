export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return respond(event, await createMoment(useDb(), user.id, await readBody(event)), 201)
})
