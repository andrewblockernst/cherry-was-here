import { DatabaseSync } from 'node:sqlite'
import { count, sql } from 'drizzle-orm'
import { countries, eras, moments, users } from '../server/db/schema'
import type { Db } from '../server/utils/db'

type Row = Record<string, any>

/** One-shot copy of the Phoenix dev database (opened read-only) into the new one, preserving ids. */
export async function importPhoenix(db: Db, sourcePath: string) {
  const [existing] = await db.select({ n: count() }).from(users)
  if (existing!.n > 0) throw new Error('Target database is not empty (users exist); refusing to import')

  const src = new DatabaseSync(sourcePath, { readOnly: true })
  const all = (table: string) => src.prepare(`SELECT * FROM ${table}`).all() as Row[]
  const ts = (r: Row) => ({ insertedAt: r.inserted_at, updatedAt: r.updated_at })

  try {
    const rows = {
      users: all('users').map(r => ({
        id: r.id, email: r.email, hashedPassword: r.hashed_password, slug: r.slug,
        name: r.name, bio: r.bio, avatarUrl: r.avatar_url, ...ts(r),
      })),
      countries: all('countries').map(r => ({
        iso2: r.iso2, iso3: r.iso3, name: r.name, nameEs: r.name_es, region: r.region,
      })),
      eras: all('eras').map(r => ({
        id: r.id, userId: r.user_id, title: r.title, slug: r.slug, startYear: r.start_year,
        endYear: r.end_year, color: r.color, emoji: r.emoji, orderIndex: r.order_index, ...ts(r),
      })),
      moments: all('moments').map(r => ({
        id: r.id, userId: r.user_id, eraId: r.era_id, title: r.title, body: r.body, date: r.date,
        location: r.location, countryCode: r.country_code, visibility: r.visibility,
        latitude: r.latitude, longitude: r.longitude, photoUrl: r.photo_url, ...ts(r),
      })),
    }

    await db.transaction(async (tx) => {
      if (rows.countries.length) {
        await tx.insert(countries).values(rows.countries)
          .onConflictDoUpdate({ target: countries.iso2, set: { name: sql`excluded.name` } })
      }
      if (rows.users.length) await tx.insert(users).values(rows.users)
      if (rows.eras.length) await tx.insert(eras).values(rows.eras)
      if (rows.moments.length) await tx.insert(moments).values(rows.moments as any)
    })
    return Object.fromEntries(Object.entries(rows).map(([k, v]) => [k, v.length]))
  } finally {
    src.close()
  }
}

if (process.argv[1]?.endsWith('import-phoenix.ts')) {
  const { useDb } = await import('../server/utils/db')
  const counts = await importPhoenix(useDb(), process.argv[2] ?? 'backend/andrews_timeline_dev.db')
  console.log('imported', counts)
}
