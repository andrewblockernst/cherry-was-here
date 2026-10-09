import { sql } from 'drizzle-orm'
import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

const now = sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`
const timestamps = {
  insertedAt: text('inserted_at').notNull().default(now),
  updatedAt: text('updated_at').notNull().default(now),
}

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  hashedPassword: text('hashed_password'),
  slug: text('slug').unique(),
  name: text('name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  ...timestamps,
}, t => [uniqueIndex('users_email_index').on(sql`${t.email} COLLATE NOCASE`)])

export const countries = sqliteTable('countries', {
  iso2: text('iso2', { length: 2 }).primaryKey(),
  iso3: text('iso3', { length: 3 }),
  name: text('name').notNull(),
  nameEs: text('name_es'),
  region: text('region'),
})

export const eras = sqliteTable('eras', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  startYear: integer('start_year').notNull(),
  endYear: integer('end_year'),
  color: text('color'),
  emoji: text('emoji'),
  orderIndex: integer('order_index'),
  ...timestamps,
}, t => [uniqueIndex('eras_user_id_slug_index').on(t.userId, t.slug)])

export const moments = sqliteTable('moments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  eraId: integer('era_id').references(() => eras.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  body: text('body'),
  date: text('date').notNull(),
  location: text('location'),
  countryCode: text('country_code', { length: 2 }).references(() => countries.iso2, { onDelete: 'set null' }),
  visibility: text('visibility', { enum: ['public', 'private'] }).notNull().default('private'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  photoUrl: text('photo_url'),
  color: text('color'),
  ...timestamps,
}, t => [index('moments_user_id_index').on(t.userId), index('moments_visibility_index').on(t.visibility)])
