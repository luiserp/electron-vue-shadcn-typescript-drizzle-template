import { eq } from 'drizzle-orm'
import { BrowserWindow, app, dialog, ipcMain, shell } from 'electron'
import { getDb } from './db'
import { settings } from './db/schema'
import {
  IpcChannels,
  appInfoSchema,
  openDialogInputSchema,
  openDialogResultSchema,
  parseIpc,
  saveDialogInputSchema,
  saveDialogResultSchema,
  setSettingInputSchema
} from '../shared/ipc'
import { z } from 'zod'

function windowFromEvent(event: Electron.IpcMainInvokeEvent | Electron.IpcMainEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender)
}

export function registerIpc(): void {
  ipcMain.on(IpcChannels.windowMinimize, (event) => {
    windowFromEvent(event)?.minimize()
  })

  ipcMain.on(IpcChannels.windowMaximize, (event) => {
    const win = windowFromEvent(event)
    if (!win) return
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  })

  ipcMain.on(IpcChannels.windowClose, (event) => {
    windowFromEvent(event)?.close()
  })

  ipcMain.handle(IpcChannels.windowIsMaximized, (event) => {
    return windowFromEvent(event)?.isMaximized() ?? false
  })

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

  ipcMain.handle(IpcChannels.dialogOpen, async (event, raw: unknown) => {
    const input = parseIpc(openDialogInputSchema, raw)
    const win = windowFromEvent(event)
    const result = win
      ? await dialog.showOpenDialog(win, {
          title: input?.title,
          defaultPath: input?.defaultPath,
          filters: input?.filters,
          properties: input?.properties ?? ['openFile']
        })
      : await dialog.showOpenDialog({
          title: input?.title,
          defaultPath: input?.defaultPath,
          filters: input?.filters,
          properties: input?.properties ?? ['openFile']
        })

    return parseIpc(openDialogResultSchema, {
      canceled: result.canceled,
      filePaths: result.filePaths
    })
  })

  ipcMain.handle(IpcChannels.dialogSave, async (event, raw: unknown) => {
    const input = parseIpc(saveDialogInputSchema, raw)
    const win = windowFromEvent(event)
    const result = win
      ? await dialog.showSaveDialog(win, {
          title: input?.title,
          defaultPath: input?.defaultPath,
          filters: input?.filters
        })
      : await dialog.showSaveDialog({
          title: input?.title,
          defaultPath: input?.defaultPath,
          filters: input?.filters
        })

    return parseIpc(saveDialogResultSchema, {
      canceled: result.canceled,
      filePath: result.filePath
    })
  })

  ipcMain.handle(IpcChannels.shellOpenPath, async (_event, raw: unknown) => {
    const filePath = parseIpc(z.string().min(1), raw)
    return shell.openPath(filePath)
  })

  ipcMain.handle(IpcChannels.appGetInfo, () => {
    return parseIpc(appInfoSchema, {
      name: app.getName(),
      version: app.getVersion(),
      isPackaged: app.isPackaged,
      userDataPath: app.getPath('userData')
    })
  })
}
