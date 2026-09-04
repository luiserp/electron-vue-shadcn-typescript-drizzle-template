import { dialog } from 'electron'
import { log } from './logger'

function toMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message
  }
  return String(error)
}

export function registerErrorHandlers(): void {
  process.on('uncaughtException', (error) => {
    log.error('Uncaught exception', error)
    dialog.showErrorBox('Unhandled error', toMessage(error))
  })

  process.on('unhandledRejection', (reason) => {
    log.error('Unhandled promise rejection', reason)
    dialog.showErrorBox('Unhandled promise rejection', toMessage(reason))
  })
}
