import { ElectronAPI } from '@electron-toolkit/preload'

export interface DatabaseApi {
  getSetting: (key: string) => Promise<string | null>
  setSetting: (key: string, value: string) => Promise<void>
}

export interface WindowControls {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  onMaximizedChange: (callback: (maximized: boolean) => void) => () => void
}

export interface AppApi {
  db: DatabaseApi
  window: WindowControls
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: AppApi
  }
}
