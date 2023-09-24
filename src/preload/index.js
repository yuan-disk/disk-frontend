import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

if (process.contextIsolated) {
  try {
    const electronHandler = {
      ipcRenderer: {
        set: (key, value) => {
          ipcRenderer.send('setStore', key, value)
        },

        get(key) {
          const resp = ipcRenderer.sendSync('getStore', key)
          return resp
        }
      }
    }

    contextBridge.exposeInMainWorld('store', electronHandler)
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
