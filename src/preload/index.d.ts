import { ElectronAPI } from '@electron-toolkit/preload'
import type { AppApi } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: AppApi
  }
}
