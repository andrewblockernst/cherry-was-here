import bcrypt from 'bcryptjs'
import { and, count, countDistinct, desc, eq, isNotNull, max, sql } from 'drizzle-orm'
import { z } from 'zod'
import { moments, users } from '../db/schema'
import type { Db } from './db'
import { fail, isUniqueViolation, parse, type Result } from './validation'

export type UserRow = typeof users.$inferSelect

const BCRYPT_COST = 12
// Used to burn the same time when the email is unknown (timing parity).
const DUMMY_HASH = bcrypt.hashSync('cherry-dummy', BCRYPT_COST)

const byEmail = (email: string) => sql`${users.email} = ${email} COLLATE NOCASE`

export const serializeUser = (u: UserRow) => ({
  id: u.id, email: u.email, slug: u.slug, name: u.name, bio: u.bio, avatar_url: u.avatarUrl,
})
export const serializePublicUser = (u: UserRow) => ({
  slug: u.slug, name: u.name, bio: u.bio, avatar_url: u.avatarUrl,
})

export async function getUserById(db: Db, id: number) {
  return (await db.select().from(users).where(eq(users.id, id)).limit(1))[0] ?? null
}

export async function getUserBySlug(db: Db, slug: string) {
  return (await db.select().from(users).where(eq(users.slug, slug)).limit(1))[0] ?? null
}

export async function authenticate(db: Db, email: string, password: string) {
  const user = (await db.select().from(users).where(byEmail(email)).limit(1))[0]
  const valid = await bcrypt.compare(password, user?.hashedPassword ?? DUMMY_HASH)
  return user && user.hashedPassword && valid ? user : null
}

const registerSchema = z.object({
  email: z.string({ error: "can't be blank" }).trim().min(1, "can't be blank")
    .max(160, 'should be at most 160 character(s)')
    .regex(/^[^@,;\s]+@[^@,;\s]+$/, 'must have the @ sign and no spaces'),
  password: z.string({ error: "can't be blank" })
    .min(12, 'should be at least 12 character(s)')
    .refine(p => Buffer.byteLength(p) <= 72, 'should be at most 72 byte(s)'),
})


async function defaultSlug(db: Db, email: string) {
  const local = email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
  const base = local || 'user'
  for (let n = 1; ; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`
    if (!(await getUserBySlug(db, candidate))) return candidate
  }
}

export async function registerUser(db: Db, input: unknown): Promise<Result<UserRow>> {
  const parsed = parse(registerSchema, input)
  if (!parsed.ok) return parsed
  const { email, password } = parsed.value
  if ((await db.select({ id: users.id }).from(users).where(byEmail(email)).limit(1)).length) {
    return fail('email', 'has already been taken')
  }
  try {
    const [user] = await db.insert(users).values({
      email,
      hashedPassword: await bcrypt.hash(password, BCRYPT_COST),
      slug: await defaultSlug(db, email),
    }).returning()
    return { ok: true, value: user! }
  } catch (e) {
    if (isUniqueViolation(e)) return fail('email', 'has already been taken')
    throw e
  }
}

const nullableText = z.string().nullable().optional()
const profileSchema = z.object({
  slug: z.string().min(2, 'should be at least 2 character(s)').max(40, 'should be at most 40 character(s)')
    .regex(/^[a-z0-9-]+$/, 'only lowercase letters, numbers and hyphens').optional(),
  name: nullableText,
  bio: nullableText,
  avatar_url: nullableText,
})

export async function updateProfile(db: Db, userId: number, input: unknown): Promise<Result<UserRow>> {
  const parsed = parse(profileSchema, input)
  if (!parsed.ok) return parsed
  const { slug, name, bio, avatar_url } = parsed.value
  try {
    const [user] = await db.update(users).set({
      ...(slug !== undefined && { slug }),
      ...(name !== undefined && { name }),
      ...(bio !== undefined && { bio }),
      ...(avatar_url !== undefined && { avatarUrl: avatar_url }),
      updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`,
    }).where(eq(users.id, userId)).returning()
    return { ok: true, value: user! }
  } catch (e) {
    if (isUniqueViolation(e)) return fail('slug', 'has already been taken')
    throw e
  }
}

/** Users with a slug and at least one public moment, newest activity first. */
export async function listPublicUsers(db: Db, { limit, offset }: { limit: number, offset: number }) {
  const rows = await db.select({
    user: users,
    country_count: countDistinct(moments.countryCode),
    moment_count: count(moments.id),
    last_moment_at: max(moments.date),
  }).from(users)
    .innerJoin(moments, eq(moments.userId, users.id))
    .where(and(eq(moments.visibility, 'public'), isNotNull(users.slug)))
    .groupBy(users.id)
    .orderBy(desc(max(moments.date)))
    .limit(limit).offset(offset)
  return rows.map(({ user, ...stats }) => ({ ...serializePublicUser(user), ...stats }))
}
