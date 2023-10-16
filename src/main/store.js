import { ipcMain } from 'electron'

const Store = require('electron-store')
var store = new Store()

ipcMain.on('setStore', (_, key, value) => {
  store.set(key, value)
})

ipcMain.on('getStore', (_, key) => {
  let value = store.get(key)
  _.returnValue = value || ''
})

ipcMain.on('delStore', (_, key) => {
  store.delete(key)
})
