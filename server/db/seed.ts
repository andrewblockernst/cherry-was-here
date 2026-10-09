import { sql } from 'drizzle-orm'
import type { Db } from '../utils/db'
import { countries } from './schema'
import countryList from './countries.json'

export async function seedCountries(db: Db) {
  await db.insert(countries).values(countryList.map(c => ({
    iso2: c.iso2, iso3: c.iso3, name: c.name, nameEs: c.name_es, region: c.region,
  }))).onConflictDoUpdate({
    target: countries.iso2,
    set: {
      iso3: sql`excluded.iso3`, name: sql`excluded.name`,
      nameEs: sql`excluded.name_es`, region: sql`excluded.region`,
    },
  })
}
