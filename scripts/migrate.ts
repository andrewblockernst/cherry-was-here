import { migrate } from 'drizzle-orm/libsql/migrator'
import { useDb } from '../server/utils/db'

await migrate(useDb(), { migrationsFolder: 'server/db/migrations' })
console.log('migrations applied')
