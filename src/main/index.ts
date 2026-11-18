/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Database from 'better-sqlite3' // 👈 SQLite Import kiya

let db: Database.Database
let mainWindow: BrowserWindow | null = null
let pendingAuthDeepLink: string | null = null

const isPasswordResetDeepLink = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    return (
      parsedUrl.protocol === 'zakhira:' &&
      (parsedUrl.hostname === 'reset-password' || parsedUrl.pathname === '/reset-password')
    )
  } catch {
    return false
  }
}

const dispatchAuthDeepLink = (url: string): void => {
  if (!isPasswordResetDeepLink(url)) return

  const window = mainWindow
  if (window && !window.isDestroyed() && !window.webContents.isLoading()) {
    if (window.isMinimized()) window.restore()
    window.show()
    window.focus()
    window.webContents.send('auth:deep-link', url)
    return
  }

  pendingAuthDeepLink = url
}

app.on('open-url', (event, url) => {
  event.preventDefault()
  dispatchAuthDeepLink(url)
})

function initDatabase() {
  // Database file user ke computer mein save hogi
  const dbPath = join(app.getPath('userData'), 'zakhira_offline.db')
  db = new Database(dbPath)

  // Tables create karein (Customers aur Sync Queue)
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      business_id TEXT,
      name TEXT,
      company TEXT,
      email TEXT,
      phone TEXT,
      phone_alt TEXT,
      address TEXT,
      city TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT,
      action TEXT, 
      payload TEXT, 
      created_at TEXT
    );
  `)
}

function setupIpcHandlers() {
  ipcMain.handle('auth:get-pending-deep-link', () => {
    const url = pendingAuthDeepLink
    pendingAuthDeepLink = null
    return url
  })

  // 1. Data Save/Update/Delete karne ke liye
  ipcMain.handle('db:run', (_, query, params) => {
    try {
      const values = Array.isArray(params) ? params : params == null ? [] : [params]
      return db.prepare(query).run(...values)
    } catch (error) {
      console.error('DB Run Error:', error)
      throw error
    }
  })

  // 2. Data Read karne ke liye
  ipcMain.handle('db:query', (_, query, params) => {
    try {
      const values = Array.isArray(params) ? params : params == null ? [] : [params]
      return db.prepare(query).all(...values)
    } catch (error) {
      console.error('DB Query Error:', error)
      throw error
    }
  })

  // 3. Sync Queue mein daalne ke liye
  ipcMain.handle('db:addToSyncQueue', (_, table, action, payload) => {
    try {
      const stmt = db.prepare(
        `INSERT INTO sync_queue (table_name, action, payload, created_at) VALUES (?, ?, ?, ?)`
      )
      return stmt.run(table, action, JSON.stringify(payload), new Date().toISOString())
    } catch (error) {
      console.error('Sync Queue Error:', error)
      throw error
    }
  })
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow = window

  window.on('closed', () => {
    if (mainWindow === window) mainWindow = null
  })

  window.on('ready-to-show', () => {
    window.show()
  })

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.setAsDefaultProtocolClient('zakhira')

  const initialAuthDeepLink = process.argv.find(isPasswordResetDeepLink)
  if (initialAuthDeepLink) pendingAuthDeepLink = initialAuthDeepLink

  app.on('second-instance', (_event, commandLine) => {
    const authDeepLink = commandLine.find(isPasswordResetDeepLink)
    if (authDeepLink) dispatchAuthDeepLink(authDeepLink)
    else {
      const window = mainWindow
      if (window && !window.isDestroyed()) {
        if (window.isMinimized()) window.restore()
        window.show()
        window.focus()
      }
    }
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 👈 App start hote hi Database aur IPC setup karein
  initDatabase()
  setupIpcHandlers()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})