import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { count } from 'drizzle-orm'
import { countries, eras, moments, users } from '../server/db/schema'
import { seedCountries } from '../server/db/seed'
import { importPhoenix } from '../scripts/import-phoenix'
import { testDb } from './helpers'

function phoenixFixture() {
  const path = join(mkdtempSync(join(tmpdir(), 'phx-')), 'phx.db')
  const src = new DatabaseSync(path)
  src.exec(`
    CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, hashed_password TEXT, slug TEXT, name TEXT, bio TEXT, avatar_url TEXT, inserted_at TEXT, updated_at TEXT);
    CREATE TABLE countries (iso2 TEXT PRIMARY KEY, iso3 TEXT, name TEXT, name_es TEXT, region TEXT);
    CREATE TABLE eras (id INTEGER PRIMARY KEY, user_id INT, title TEXT, slug TEXT, start_year INT, end_year INT, color TEXT, emoji TEXT, order_index INT, inserted_at TEXT, updated_at TEXT);
    CREATE TABLE moments (id INTEGER PRIMARY KEY, user_id INT, era_id INT, title TEXT, body TEXT, date TEXT, location TEXT, country_code TEXT, visibility TEXT, latitude REAL, longitude REAL, photo_url TEXT, inserted_at TEXT, updated_at TEXT);
    INSERT INTO users VALUES (7, 'a@x.io', '$2b$12$hash', 'a', 'A', NULL, NULL, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');
    INSERT INTO countries VALUES ('AR', 'ARG', 'Argentina', 'Argentina', 'South America');
    INSERT INTO eras VALUES (3, 7, 'School', 'school', 2000, 2010, '#fff', NULL, 1, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');
    INSERT INTO moments VALUES (9, 7, 3, 'Trip', NULL, '2005-03-07', 'Salta', 'AR', 'public', -24.7, -65.4, NULL, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');
  `)
  src.close()
  return path
}

describe('seedCountries', () => {
  it('is idempotent', async () => {
    const db = await testDb()
    await seedCountries(db)
    await seedCountries(db)
    const [row] = await db.select({ n: count() }).from(countries)
    expect(row!.n).toBe(64)
  })
})

describe('importPhoenix', () => {
  it('copies rows preserving ids and password hashes', async () => {
    const db = await testDb()
    await importPhoenix(db, phoenixFixture())
    const [u] = await db.select().from(users)
    expect(u).toMatchObject({ id: 7, hashedPassword: '$2b$12$hash', slug: 'a' })
    expect((await db.select().from(eras))[0]).toMatchObject({ id: 3, userId: 7 })
    expect((await db.select().from(moments))[0]).toMatchObject({ id: 9, eraId: 3, countryCode: 'AR' })
  })

  it('refuses a non-empty target', async () => {
    const db = await testDb()
    const path = phoenixFixture()
    await importPhoenix(db, path)
    await expect(importPhoenix(db, path)).rejects.toThrow(/not empty/)
  })
})
