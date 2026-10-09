import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'turso',
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:./data/lavidaesuna.db',
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  },
})
