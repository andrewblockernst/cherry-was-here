export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const db = useDb()
  return { moments: await listMoments(db, user.id), country_counts: await countryCounts(db, user.id) }
})
