import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import {
  IpcChannels,
  type OpenDialogInput,
  type OpenDialogResult,
  type SaveDialogInput,
  type SaveDialogResult
} from '../shared/ipc'

const api = {
  app: {
    getInfo: (): Promise<{
      name: string
      version: string
      isPackaged: boolean
      userDataPath: string
    }> => ipcRenderer.invoke(IpcChannels.appGetInfo),
    testLocalDependency: (): Promise<string> => ipcRenderer.invoke(IpcChannels.appTestLocalDependency)
  },
  db: {
    getSetting: (key: string): Promise<string | null> =>
      ipcRenderer.invoke(IpcChannels.dbGetSetting, key),
    setSetting: (key: string, value: string): Promise<void> =>
      ipcRenderer.invoke(IpcChannels.dbSetSetting, { key, value })
  },
  dialog: {
    open: (options?: OpenDialogInput): Promise<OpenDialogResult> =>
      ipcRenderer.invoke(IpcChannels.dialogOpen, options),
    save: (options?: SaveDialogInput): Promise<SaveDialogResult> =>
      ipcRenderer.invoke(IpcChannels.dialogSave, options)
  },
  shell: {
    openPath: (filePath: string): Promise<string> =>
      ipcRenderer.invoke(IpcChannels.shellOpenPath, filePath)
  },
  window: {
    minimize: (): void => ipcRenderer.send(IpcChannels.windowMinimize),
    maximize: (): void => ipcRenderer.send(IpcChannels.windowMaximize),
    close: (): void => ipcRenderer.send(IpcChannels.windowClose),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke(IpcChannels.windowIsMaximized),
    onMaximizedChange: (callback: (maximized: boolean) => void): (() => void) => {
      const listener = (_event: unknown, maximized: boolean): void => callback(maximized)
      ipcRenderer.on(IpcChannels.windowMaximizedChanged, listener)
      return () => {
        ipcRenderer.removeListener(IpcChannels.windowMaximizedChanged, listener)
      }
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
