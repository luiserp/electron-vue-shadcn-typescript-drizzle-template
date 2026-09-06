import { BrowserWindow, dialog, ipcMain, shell } from "electron"
import { IpcChannels } from "../../../shared/ipc"
import { parseIpc } from "../../../shared/ipc"
import { openDialogInputSchema, openDialogResultSchema, saveDialogInputSchema, saveDialogResultSchema } from "../../../shared/ipc"
import { z } from "zod"

function windowFromEvent(event: Electron.IpcMainInvokeEvent | Electron.IpcMainEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender)
}

export function registerDialogIpc(): void {

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
}