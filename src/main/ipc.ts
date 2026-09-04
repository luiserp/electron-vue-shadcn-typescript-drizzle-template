import { app, ipcMain } from 'electron'
import {
  IpcChannels,
  appInfoSchema, parseIpc
} from '../shared/ipc'
import { exampleLocalDependency } from '@template/example-local-dependency'
import { registerWindowIpc } from './window/ipc'
import { registerDialogIpc } from './dialog/ipc'

export function registerIpc(): void {

  // Register window IPC
  registerWindowIpc();

  // Register dialog IPC  
  registerDialogIpc();

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
