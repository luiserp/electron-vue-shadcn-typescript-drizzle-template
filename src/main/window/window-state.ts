import { app, BrowserWindow, screen } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { log } from '../electron/logger'

export type WindowState = {
  x?: number
  y?: number
  width: number
  height: number
  isMaximized: boolean
}

const defaults: WindowState = {
  width: 1280,
  height: 720,
  isMaximized: false
}

function statePath(): string {
  return join(app.getPath('userData'), 'window-state.json')
}

function isOnScreen(state: WindowState): boolean {
  if (state.x == null || state.y == null) {
    return true
  }

  return screen.getAllDisplays().some((display) => {
    const { x, y, width, height } = display.workArea
    return (
      state.x! < x + width &&
      state.x! + 80 > x &&
      state.y! < y + height &&
      state.y! + 80 > y
    )
  })
}

export function loadWindowState(): WindowState {
  try {
    const parsed = JSON.parse(readFileSync(statePath(), 'utf8')) as Partial<WindowState>
    const state: WindowState = {
      width: typeof parsed.width === 'number' ? parsed.width : defaults.width,
      height: typeof parsed.height === 'number' ? parsed.height : defaults.height,
      isMaximized: Boolean(parsed.isMaximized),
      x: typeof parsed.x === 'number' ? parsed.x : undefined,
      y: typeof parsed.y === 'number' ? parsed.y : undefined
    }

    if (!isOnScreen(state)) {
      delete state.x
      delete state.y
    }

    return state
  } catch {
    return { ...defaults }
  }
}

export function trackWindowState(win: BrowserWindow): void {
  let timer: ReturnType<typeof setTimeout> | undefined

  const save = (): void => {
    if (win.isDestroyed()) {
      return
    }

    const bounds = win.getNormalBounds()
    const state: WindowState = {
      ...bounds,
      isMaximized: win.isMaximized()
    }

    try {
      writeFileSync(statePath(), JSON.stringify(state))
    } catch (error) {
      log.warn('Failed to save window state', error)
    }
  }

  const scheduleSave = (): void => {
    clearTimeout(timer)
    timer = setTimeout(save, 300)
  }

  win.on('resize', scheduleSave)
  win.on('move', scheduleSave)
  win.on('maximize', scheduleSave)
  win.on('unmaximize', scheduleSave)
  win.on('close', save)
}
