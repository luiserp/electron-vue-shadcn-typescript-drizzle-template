import { is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { log } from './logger'

export function initAutoUpdater(): void {
  if (is.dev) {
    log.info('Auto-update skipped in development')
    return
  }

  autoUpdater.logger = log
  autoUpdater.autoDownload = false
  autoUpdater.checkForUpdates().catch((error) => {
    log.warn('Update check failed', error)
  })
}
