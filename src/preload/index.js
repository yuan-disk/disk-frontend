import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
const { Buffer } = require('buffer')
// Custom APIs for renderer
const api = {}

const store = {
  set: (key, value) => {
    ipcRenderer.send('store-set', key, value)
  },

  get(key) {
    const resp = ipcRenderer.sendSync('store-get', key)
    return resp
  },

  del: (key) => {
    ipcRenderer.send('store-del', key)
  }
}

const fs = {
  /**
   *
   * @param {string} filename
   * @param {ArrayBuffer} ArrayBuffer
   */
  write: (filename, buffer) => {
    ipcRenderer.send('fs-write', filename, Buffer.from(buffer))
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('store', store)
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('fs', fs)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  window.store = store
  window.fs = fs
}
