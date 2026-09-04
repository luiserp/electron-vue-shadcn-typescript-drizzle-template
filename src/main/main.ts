import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { BrowserWindow, app, shell } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { APP_ID, APP_NAME } from '../shared/constants'
import { IpcChannels } from '../shared/ipc'
import { closeDatabase, initDatabase } from './db'
import { registerErrorHandlers } from './electron/errors'
import { registerIpc } from './ipc'
import { initLogger, log } from './electron/logger'
import { initAutoUpdater } from './electron/updater'
import { loadWindowState, trackWindowState } from './window/window-state'

initLogger()
registerErrorHandlers()

let mainWindow: BrowserWindow | null = null

function focusMainWindow(): void {
  if (!mainWindow) {
    return
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore()
  }
  mainWindow.show()
  mainWindow.focus()
}

function createWindow(): void {
  const state = loadWindowState()

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 800,
    minHeight: 500,
    show: false,
    frame: false,
    title: APP_NAME,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (state.isMaximized) {
    mainWindow.maximize()
  }

  trackWindowState(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  const sendMaximized = (): void => {
    if (!mainWindow) return
    mainWindow.webContents.send(IpcChannels.windowMaximizedChanged, mainWindow.isMaximized())
  }
  mainWindow.on('maximize', sendMaximized)
  mainWindow.on('unmaximize', sendMaximized)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    focusMainWindow()
  })

  app.whenReady().then(async () => {
    
    // Set the app user model id and name
    electronApp.setAppUserModelId(APP_ID)
    app.setName(APP_NAME)

    // Initialize the database
    try {
      await initDatabase()
    } catch (error) {
      log.error('Failed to initialize database', error)
      throw error
    }

    // Register the IPC channels
    registerIpc()

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // Create the main window
    createWindow()

    // Initialize the auto updater
    initAutoUpdater()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
}

// Close the database when the app is quitting
app.on('before-quit', () => {
  closeDatabase()
})

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
