import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../db/schema'

export type Db = ReturnType<typeof createDb>

export function createDb(url: string, authToken?: string) {
  return drizzle(createClient({ url, authToken: authToken || undefined }), { schema })
}

let shared: Db | undefined

/** Single app-wide client, configured from DATABASE_URL / DATABASE_AUTH_TOKEN. */
export function useDb(): Db {
  shared ??= createDb(process.env.DATABASE_URL ?? 'file:./data/lavidaesuna.db', process.env.DATABASE_AUTH_TOKEN)
  return shared
}
