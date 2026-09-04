import { is } from '@electron-toolkit/utils'
import log from 'electron-log/main'

export function initLogger(): void {
  log.initialize()
  log.transports.file.level = 'info'
  log.transports.console.level = is.dev ? 'debug' : 'info'
  Object.assign(console, log.functions)
  log.info('Logger initialized')
}

export { log }
