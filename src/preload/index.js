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

  add(key, value) {
    let list = store.get(key)
    if (list) {
      list.push(value)
      store.set(key, list)
    } else {
      store.set(key, [value])
    }
  },

  remove(key, value) {
    let list = store.get(key)
    console.log(list, value)
    if (list) {
      let index = store.findIndex(list, value)
      console.log(index)
      if (index >= 0) {
        list.splice(index, 1)
        store.set(key, list)
      }
    }
  },

  findIndex(list, value) {
    for (let i = 0; i < list.length; ++i) {
      if (store.areObjectsEqual(list[i], value)) {
        return i
      }
    }
    return -1
  },

  areObjectsEqual(objA, objB) {
    for (const key in objA) {
      if (objA[key] !== objB[key]) {
        return false
      }
    }
    return true
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
  },

  /**
   *
   * @param {string} fullpath
   * @returns {ArrayBuffer}
   */
  getFile: (fullpath, filename, lastModified) => {
    let data = ipcRenderer.sendSync('fs-read', fullpath)
    if (data) {
      return new File([data], filename, {
        lastModified: lastModified,
        path: fullpath
      })
    }
    return void 0
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
