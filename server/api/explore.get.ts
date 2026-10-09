const int = (v: unknown, fallback: number, min: number, max: number) => {
  const n = Number.parseInt(String(v), 10)
  return Number.isNaN(n) ? fallback : Math.min(Math.max(n, min), max)
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  return { users: await listPublicUsers(useDb(), { limit: int(q.limit, 30, 1, 100), offset: int(q.offset, 0, 0, Number.MAX_SAFE_INTEGER) }) }
})
