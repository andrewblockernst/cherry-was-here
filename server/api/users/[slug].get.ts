export default defineEventHandler(async (event) => {
  const db = useDb()
  const user = await getUserBySlug(db, getRouterParam(event, 'slug') ?? '')
  if (!user) return reply(event, 404, 'not found')
  return publicProfile(db, user)
})
