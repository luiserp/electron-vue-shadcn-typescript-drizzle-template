import { is } from '@electron-toolkit/utils'
import { createClient, type Client } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { app } from 'electron'
import { join } from 'path'
import * as schema from './schema'

type AppDb = ReturnType<typeof drizzle<typeof schema>>

let client: Client | null = null
let db: AppDb | null = null

function getMigrationsFolder(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'drizzle')
  }
  return join(app.getAppPath(), 'drizzle')
}

function getDatabasePath(): string {
  if (is.dev) {
    return join(app.getAppPath(), 'dev.db')
  }
  return join(app.getPath('userData'), 'data.db')
}

function toFileUrl(dbPath: string): string {
  return `file:${dbPath.replaceAll('\\', '/')}`
}

export async function initDatabase(): Promise<AppDb> {
  if (db) {
    return db
  }

  const dbPath = getDatabasePath()
  client = createClient({ url: toFileUrl(dbPath) })
  db = drizzle(client, { schema })
  await migrate(db, { migrationsFolder: getMigrationsFolder() })
  return db
}

export function getDb(): AppDb {
  if (!db) {
    throw new Error('Database is not initialized')
  }
  return db
}

export function closeDatabase(): void {
  client?.close()
  client = null
  db = null
}
