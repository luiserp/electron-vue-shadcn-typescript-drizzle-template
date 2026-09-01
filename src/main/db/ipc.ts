import { eq } from 'drizzle-orm'
import { ipcMain } from 'electron'
import { getDb } from './index'
import { settings } from './schema'

export function registerDatabaseIpc(): void {
  ipcMain.handle('db:get-setting', async (_event, key: string): Promise<string | null> => {
    const row = await getDb().select().from(settings).where(eq(settings.key, key)).get()
    return row?.value ?? null
  })

  ipcMain.handle('db:set-setting', async (_event, key: string, value: string): Promise<void> => {
    await getDb()
      .insert(settings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() }
      })
  })
}
