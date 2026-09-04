import { eq } from 'drizzle-orm'
import { app, ipcMain } from 'electron'
import { getDb } from './db'
import { settings } from './db/schema'
import {
  IpcChannels,
  appInfoSchema, parseIpc, setSettingInputSchema
} from '../shared/ipc'
import { z } from 'zod'
import { exampleLocalDependency } from '@template/example-local-dependency'
import { registerWindowIpc } from './window/ipc'
import { registerDialogIpc } from './dialog/ipc'

export function registerIpc(): void {

  // Register window IPC
  registerWindowIpc();

  // Register dialog IPC  
  registerDialogIpc();

  // Register database IPC
  ipcMain.handle(IpcChannels.dbGetSetting, async (_event, raw: unknown) => {
    const key = parseIpc(z.string().min(1), raw)
    const row = await getDb().select().from(settings).where(eq(settings.key, key)).get()
    return row?.value ?? null
  })

  ipcMain.handle(IpcChannels.dbSetSetting, async (_event, raw: unknown) => {
    const { key, value } = parseIpc(setSettingInputSchema, raw)
    await getDb()
      .insert(settings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() }
      })
  })

  // Register app IPC
  ipcMain.handle(IpcChannels.appGetInfo, () => {
    return parseIpc(appInfoSchema, {
      name: app.getName(),
      version: app.getVersion(),
      isPackaged: app.isPackaged,
      userDataPath: app.getPath('userData')
    })
  })

  // Register Test Local Dependency IPC
  ipcMain.handle(IpcChannels.appTestLocalDependency, () => {
    return exampleLocalDependency();
  })
}
