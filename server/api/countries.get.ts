import { asc } from 'drizzle-orm'
import { countries } from '../db/schema'

export default defineEventHandler(async () => {
  const rows = await useDb().select().from(countries).orderBy(asc(countries.name))
  return { countries: rows.map(c => ({ iso2: c.iso2, iso3: c.iso3, name: c.name, name_es: c.nameEs, region: c.region })) }
})
