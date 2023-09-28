import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
const { Buffer } = require('buffer')
// Custom APIs for renderer
const api = {}

const electronHandler = {
  set: (key, value) => {
    ipcRenderer.send('setStore', key, value)
  },

  get(key) {
    const resp = ipcRenderer.sendSync('getStore', key)
    return resp
  },

  del: (key) => {
    ipcRenderer.send('delStore', key)
  }
}

const coreHandler = {
  writeFileByArrayBuffer: (filename, data) => {
    ipcRenderer.send('writeFile', filename, Buffer.from(data))
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('store', electronHandler)
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('core', coreHandler)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
