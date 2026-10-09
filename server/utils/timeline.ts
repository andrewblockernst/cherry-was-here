import { and, asc, count, desc, eq, inArray, isNotNull, sql } from 'drizzle-orm'
import { z } from 'zod'
import { countries, eras, moments } from '../db/schema'
import type { Db } from './db'
import { serializePublicUser, type UserRow } from './accounts'
import { fail, isUniqueViolation, parse, type Result } from './validation'

type EraRow = typeof eras.$inferSelect
type MomentRow = typeof moments.$inferSelect

export const serializeEra = (e: EraRow) => ({
  id: e.id, title: e.title, slug: e.slug, start_year: e.startYear, end_year: e.endYear,
  color: e.color, emoji: e.emoji, order_index: e.orderIndex,
})
export const serializeMoment = (m: MomentRow) => ({
  id: m.id, title: m.title, body: m.body, date: m.date, location: m.location,
  country_code: m.countryCode, visibility: m.visibility, latitude: m.latitude,
  longitude: m.longitude, photo_url: m.photoUrl, era_id: m.eraId, color: m.color,
})

const blank = "can't be blank"
const required = z.string({ error: blank }).trim().min(1, blank)
const optionalText = z.string().nullable().optional()
const touch = { updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))` }

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'must be a hex color like #be123c').nullable().optional()

const eraSchema = z.object({
  title: required,
  slug: required.optional(),
  start_year: z.number({ error: blank }).int('must be an integer'),
  end_year: z.number().int('must be an integer').nullable().optional(),
  color,
  emoji: optionalText,
  order_index: z.number().int('must be an integer').nullable().optional(),
})

const momentSchema = z.object({
  title: required,
  body: optionalText,
  date: z.string({ error: blank }).regex(/^\d{4}-\d{2}-\d{2}$/, 'is invalid')
    .refine(d => !Number.isNaN(Date.parse(d)), 'is invalid'),
  location: optionalText,
  era_id: z.number().int().nullable().optional(),
  country_code: z.string().length(2, 'should be 2 character(s)').transform(c => c.toUpperCase()).nullable().optional(),
  visibility: z.enum(['public', 'private'], { error: 'is invalid' }).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  photo_url: optionalText,
  color,
})

/** Drops undefined keys so a PATCH only touches the provided fields. */
const defined = <T extends object>(o: T) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>

// ── Eras ────────────────────────────────────────────────────────────────

const eraOrder = [asc(eras.orderIndex), asc(eras.startYear)]

export async function listEras(db: Db, userId: number) {
  return db.select().from(eras).where(eq(eras.userId, userId)).orderBy(...eraOrder)
}

function eraValues(v: Partial<z.output<typeof eraSchema>>) {
  const { start_year, end_year, order_index, ...rest } = v
  return defined({ ...rest, startYear: start_year, endYear: end_year, orderIndex: order_index })
}

const yearsError = (start?: number | null, end?: number | null) =>
  start != null && end != null && end < start ? fail('end_year', 'must be greater than or equal to start year') : null

const slugify = (title: string) =>
  title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/, '') || 'era'

async function uniqueSlug(db: Db, userId: number, title: string) {
  const taken = new Set((await db.select({ slug: eras.slug }).from(eras).where(eq(eras.userId, userId))).map(r => r.slug))
  const base = slugify(title)
  let slug = base
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`
  return slug
}

async function nextOrderIndex(db: Db, userId: number) {
  const [row] = await db.select({ max: sql<number | null>`max(${eras.orderIndex})` }).from(eras).where(eq(eras.userId, userId))
  return row?.max == null ? 0 : row.max + 1
}

export async function createEra(db: Db, userId: number, input: unknown): Promise<Result<EraRow>> {
  const parsed = parse(eraSchema, input)
  if (!parsed.ok) return parsed
  const bad = yearsError(parsed.value.start_year, parsed.value.end_year)
  if (bad) return bad
  const slug = parsed.value.slug ?? await uniqueSlug(db, userId, parsed.value.title)
  const order_index = parsed.value.order_index ?? await nextOrderIndex(db, userId)
  try {
    const [era] = await db.insert(eras).values({ ...eraValues({ ...parsed.value, slug, order_index }), userId } as typeof eras.$inferInsert).returning()
    return { ok: true, value: era! }
  } catch (e) {
    if (isUniqueViolation(e)) return fail('slug', 'has already been taken')
    throw e
  }
}

/** Returns null when the era does not exist or belongs to someone else. */
export async function updateEra(db: Db, userId: number, id: number, input: unknown): Promise<Result<EraRow> | null> {
  const parsed = parse(eraSchema.partial(), input)
  if (!parsed.ok) return parsed
  if (parsed.value.start_year !== undefined || parsed.value.end_year !== undefined) {
    const [cur] = await db.select().from(eras).where(and(eq(eras.id, id), eq(eras.userId, userId)))
    if (!cur) return null
    const bad = yearsError(parsed.value.start_year ?? cur.startYear, parsed.value.end_year === undefined ? cur.endYear : parsed.value.end_year)
    if (bad) return bad
  }
  try {
    const [era] = await db.update(eras).set({ ...eraValues(parsed.value), ...touch })
      .where(and(eq(eras.id, id), eq(eras.userId, userId))).returning()
    return era ? { ok: true, value: era } : null
  } catch (e) {
    if (isUniqueViolation(e)) return fail('slug', 'has already been taken')
    throw e
  }
}

export async function deleteEra(db: Db, userId: number, id: number) {
  const rows = await db.delete(eras).where(and(eq(eras.id, id), eq(eras.userId, userId))).returning({ id: eras.id })
  return rows.length > 0
}

// ── Moments ─────────────────────────────────────────────────────────────

export async function listMoments(db: Db, userId: number) {
  return (await db.select().from(moments).where(eq(moments.userId, userId)).orderBy(desc(moments.date))).map(serializeMoment)
}

function momentValues(v: Partial<z.output<typeof momentSchema>>) {
  const { era_id, country_code, photo_url, ...rest } = v
  return defined({ ...rest, eraId: era_id, countryCode: country_code, photoUrl: photo_url })
}

/** Checks the referenced era (must be the user's own) and country exist. */
async function checkReferences(db: Db, userId: number, v: { eraId?: number | null, countryCode?: string | null }) {
  if (v.eraId != null) {
    const [era] = await db.select({ id: eras.id }).from(eras).where(and(eq(eras.id, v.eraId), eq(eras.userId, userId)))
    if (!era) return fail('era_id', 'does not exist')
  }
  if (v.countryCode != null) {
    const [c] = await db.select({ iso2: countries.iso2 }).from(countries).where(eq(countries.iso2, v.countryCode))
    if (!c) return fail('country_code', 'does not exist')
  }
  return null
}

export async function createMoment(db: Db, userId: number, input: unknown): Promise<Result<ReturnType<typeof serializeMoment>>> {
  const parsed = parse(momentSchema, input)
  if (!parsed.ok) return parsed
  const values = momentValues(parsed.value)
  const bad = await checkReferences(db, userId, values)
  if (bad) return bad
  const [m] = await db.insert(moments).values({ ...values, userId } as typeof moments.$inferInsert).returning()
  return { ok: true, value: serializeMoment(m!) }
}

export async function updateMoment(db: Db, userId: number, id: number, input: unknown): Promise<Result<ReturnType<typeof serializeMoment>> | null> {
  const parsed = parse(momentSchema.partial(), input)
  if (!parsed.ok) return parsed
  const values = momentValues(parsed.value)
  const [own] = await db.select({ id: moments.id }).from(moments).where(and(eq(moments.id, id), eq(moments.userId, userId)))
  if (!own) return null
  const bad = await checkReferences(db, userId, values)
  if (bad) return bad
  const [m] = await db.update(moments).set({ ...values, ...touch }).where(eq(moments.id, id)).returning()
  return { ok: true, value: serializeMoment(m!) }
}

export async function deleteMoment(db: Db, userId: number, id: number) {
  const rows = await db.delete(moments).where(and(eq(moments.id, id), eq(moments.userId, userId))).returning({ id: moments.id })
  return rows.length > 0
}

/** country_code -> moment count; `publicOnly` restricts to public moments. */
export async function countryCounts(db: Db, userId: number, { publicOnly = false } = {}) {
  const rows = await db.select({ code: moments.countryCode, n: count() }).from(moments)
    .where(and(eq(moments.userId, userId), isNotNull(moments.countryCode), publicOnly ? eq(moments.visibility, 'public') : undefined))
    .groupBy(moments.countryCode)
  return Object.fromEntries(rows.map(r => [r.code!, r.n])) as Record<string, number>
}

/** Public profile payload: public user fields, eras with public moments, public country counts. */
export async function publicProfile(db: Db, user: UserRow) {
  const eraRows = await db.select().from(eras).where(eq(eras.userId, user.id)).orderBy(...eraOrder)
  const momentRows = eraRows.length
    ? await db.select().from(moments)
        .where(and(inArray(moments.eraId, eraRows.map(e => e.id)), eq(moments.visibility, 'public')))
        .orderBy(asc(moments.date))
    : []
  return {
    user: serializePublicUser(user),
    eras: eraRows.map(e => ({ ...serializeEra(e), moments: momentRows.filter(m => m.eraId === e.id).map(serializeMoment) })),
    country_counts: await countryCounts(db, user.id, { publicOnly: true }),
  }
}
