import { ElectronAPI } from '@electron-toolkit/preload'

type RendererBridgeAPI = {
  dbRun: (query: string, params: unknown[]) => Promise<unknown>
  dbQuery: (query: string, params: unknown[]) => Promise<unknown>
  addToSyncQueue: (table: string, action: string, payload: unknown) => Promise<unknown>
  getPendingAuthDeepLink: () => Promise<string | null>
  onAuthDeepLink: (callback: (url: string) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronAPI: RendererBridgeAPI
  }
}
