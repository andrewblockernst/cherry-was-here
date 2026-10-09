export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return { eras: (await listEras(useDb(), user.id)).map(serializeEra) }
})
