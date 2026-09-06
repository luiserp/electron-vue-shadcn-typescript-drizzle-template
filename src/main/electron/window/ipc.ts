import { BrowserWindow, ipcMain } from "electron"
import { IpcChannels } from "../../../shared/ipc"

function windowFromEvent(event: Electron.IpcMainInvokeEvent | Electron.IpcMainEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender)
}


export function registerWindowIpc(): void {
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
}
