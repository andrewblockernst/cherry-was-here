import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it } from 'vitest'
import { users, countries } from '../server/db/schema'
import { authenticate, getUserBySlug, listPublicUsers, registerUser } from '../server/utils/accounts'
import {
  countryCounts, createEra, createMoment, deleteEra, deleteMoment, listMoments,
  publicProfile, updateEra, updateMoment,
} from '../server/utils/timeline'
import { testDb } from './helpers'

let db: Awaited<ReturnType<typeof testDb>>
let a: number
let b: number

beforeEach(async () => {
  db = await testDb()
  await db.insert(countries).values([{ iso2: 'AR', name: 'Argentina' }, { iso2: 'ES', name: 'Spain' }])
  const hash = bcrypt.hashSync('correct-horse-battery', 4)
  const rows = await db.insert(users).values([
    { email: 'a@x.io', hashedPassword: hash, slug: 'a' },
    { email: 'b@x.io', hashedPassword: hash, slug: 'b' },
  ]).returning()
  a = rows[0]!.id
  b = rows[1]!.id
})

const ok = <T>(r: { ok: boolean, value?: T }) => {
  expect(r.ok).toBe(true)
  return r.value as T
}

describe('authenticate', () => {
  it('accepts the correct password, case-insensitive email', async () => {
    expect((await authenticate(db, 'A@X.io', 'correct-horse-battery'))?.id).toBe(a)
  })
  it('rejects a wrong password and unknown email', async () => {
    expect(await authenticate(db, 'a@x.io', 'wrong-password-123')).toBeNull()
    expect(await authenticate(db, 'nobody@x.io', 'correct-horse-battery')).toBeNull()
  })
})

describe('registerUser', () => {
  it('creates a user with a slug from the email local part', async () => {
    const u = ok(await registerUser(db, { email: 'New.User@x.io', password: 'a-long-password-1' }))
    expect(u.slug).toBe('new-user')
    expect(u.hashedPassword).not.toBe('a-long-password-1')
  })
  it('rejects a duplicate email (case-insensitive)', async () => {
    const r = await registerUser(db, { email: 'A@X.IO', password: 'a-long-password-1' })
    expect(r).toMatchObject({ ok: false, errors: { email: ['has already been taken'] } })
  })
  it('rejects a short password', async () => {
    const r = await registerUser(db, { email: 'c@x.io', password: 'short' })
    expect(r).toMatchObject({ ok: false, errors: { password: [expect.stringMatching(/at least 12/)] } })
  })
  it('makes colliding slugs unique', async () => {
    const u = ok(await registerUser(db, { email: 'a@other.io', password: 'a-long-password-1' }))
    expect(u.slug).toBe('a-2')
  })
})

describe('privacy', () => {
  beforeEach(async () => {
    const era = ok(await createEra(db, a, { title: 'Era', slug: 'era', start_year: 2000 }))
    await createMoment(db, a, { title: 'pub', date: '2020-01-01', country_code: 'AR', visibility: 'public', era_id: era.id })
    await createMoment(db, a, { title: 'priv', date: '2021-01-01', country_code: 'ES', era_id: era.id })
  })

  it('public profile excludes private moments and country counts', async () => {
    const user = (await getUserBySlug(db, 'a'))!
    const p = await publicProfile(db, user)
    expect(p.eras[0]!.moments.map(m => m.title)).toEqual(['pub'])
    expect(p.country_counts).toEqual({ AR: 1 })
    expect(p.user).not.toHaveProperty('email')
  })
  it('owner sees everything', async () => {
    expect(await listMoments(db, a)).toHaveLength(2)
    expect(await countryCounts(db, a)).toEqual({ AR: 1, ES: 1 })
  })
  it('explore counts only public moments and hides users without any', async () => {
    const rows = await listPublicUsers(db, { limit: 30, offset: 0 })
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ slug: 'a', moment_count: 1, country_count: 1, last_moment_at: '2020-01-01' })
  })
})

describe('ownership', () => {
  it('user A cannot update or delete user B records', async () => {
    const era = ok(await createEra(db, b, { title: 'B era', slug: 'b-era', start_year: 2001 }))
    const m = ok(await createMoment(db, b, { title: 'B moment', date: '2020-01-01' }))
    expect(await updateMoment(db, a, m.id, { title: 'hacked' })).toBeNull()
    expect(await deleteMoment(db, a, m.id)).toBe(false)
    expect(await updateEra(db, a, era.id, { title: 'hacked' })).toBeNull()
    expect(await deleteEra(db, a, era.id)).toBe(false)
    expect((await listMoments(db, b))[0]!.title).toBe('B moment')
  })
  it('rejects attaching a moment to another user\'s era', async () => {
    const era = ok(await createEra(db, b, { title: 'B era', slug: 'b-era', start_year: 2001 }))
    const r = await createMoment(db, a, { title: 'x', date: '2020-01-01', era_id: era.id })
    expect(r).toMatchObject({ ok: false, errors: { era_id: ['does not exist'] } })
  })
  it('deleting an era keeps its moments', async () => {
    const era = ok(await createEra(db, a, { title: 'E', slug: 'e', start_year: 2001 }))
    ok(await createMoment(db, a, { title: 'm', date: '2020-01-01', era_id: era.id }))
    expect(await deleteEra(db, a, era.id)).toBe(true)
    expect((await listMoments(db, a))[0]!.era_id).toBeNull()
  })
})

describe('validation', () => {
  it('moment requires title and valid date, era requires unique slug per user', async () => {
    expect(await createMoment(db, a, { visibility: 'nope' })).toMatchObject({
      ok: false, errors: { title: ["can't be blank"], date: ["can't be blank"], visibility: expect.any(Array) },
    })
    ok(await createEra(db, a, { title: 'E', slug: 'e', start_year: 2001 }))
    expect(await createEra(db, a, { title: 'E2', slug: 'e', start_year: 2002 }))
      .toMatchObject({ ok: false, errors: { slug: ['has already been taken'] } })
    ok(await createEra(db, b, { title: 'E', slug: 'e', start_year: 2001 }))
  })
})
