/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 1. Custom API banayein (SQLite aur Sync ke liye)
const api = {
  dbRun: (query: string, params: any[]) => ipcRenderer.invoke('db:run', query, params),
  dbQuery: (query: string, params: any[]) => ipcRenderer.invoke('db:query', query, params),
  addToSyncQueue: (table: string, action: string, payload: any) => 
    ipcRenderer.invoke('db:addToSyncQueue', table, action, payload),
  getPendingAuthDeepLink: (): Promise<string | null> =>
    ipcRenderer.invoke('auth:get-pending-deep-link'),
  onAuthDeepLink: (callback: (url: string) => void): (() => void) => {
    const handler = (_event: unknown, url: string): void => callback(url)
    ipcRenderer.on('auth:deep-link', handler)
    return () => ipcRenderer.removeListener('auth:deep-link', handler)
  },
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api) // Yeh hamara custom API hai
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.electronAPI = api
}