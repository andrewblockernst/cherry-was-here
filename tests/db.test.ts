import { describe, expect, it } from 'vitest'
import { count } from 'drizzle-orm'
import { countries } from '../server/db/schema'
import { seedCountries } from '../server/db/seed'
import { testDb } from './helpers'

describe('seedCountries', () => {
  it('is idempotent', async () => {
    const db = await testDb()
    await seedCountries(db)
    await seedCountries(db)
    const [row] = await db.select({ n: count() }).from(countries)
    expect(row!.n).toBe(64)
  })
})
