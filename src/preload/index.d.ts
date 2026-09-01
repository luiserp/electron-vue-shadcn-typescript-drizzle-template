import { ElectronAPI } from '@electron-toolkit/preload'
import type { AppInfo, OpenDialogInput, OpenDialogResult, SaveDialogInput, SaveDialogResult } from '../shared/ipc'

export interface AppInfoApi {
  getInfo: () => Promise<AppInfo>
}

export interface DatabaseApi {
  getSetting: (key: string) => Promise<string | null>
  setSetting: (key: string, value: string) => Promise<void>
}

export interface DialogApi {
  open: (options?: OpenDialogInput) => Promise<OpenDialogResult>
  save: (options?: SaveDialogInput) => Promise<SaveDialogResult>
}

export interface ShellApi {
  openPath: (filePath: string) => Promise<string>
}

export interface WindowControls {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  onMaximizedChange: (callback: (maximized: boolean) => void) => () => void
}

export interface AppApi {
  app: AppInfoApi
  db: DatabaseApi
  dialog: DialogApi
  shell: ShellApi
  window: WindowControls
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: AppApi
  }
}
