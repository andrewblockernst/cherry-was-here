import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { createDb } from '../server/utils/db'

/** Fresh libSQL file database with all migrations applied. */
export async function testDb() {
  const dir = mkdtempSync(join(tmpdir(), 'lavidaesuna-'))
  const db = createDb(`file:${join(dir, 'test.db')}`)
  await migrate(db, { migrationsFolder: 'server/db/migrations' })
  return db
}
