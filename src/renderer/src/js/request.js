import axios from 'axios'
import router from '../router'
import { ElMessage } from 'element-plus'

let server = axios.create({
  baseURL: 'http://119.23.244.10:9999'
})

// let server = axios.create({
//   baseURL: 'http://localhost:8080',
//   timeout: 1000
// })

export default server

server.interceptors.request.use(
  (config) => {
    let token = window.store.ipcRenderer.get('token')
    if (token) {
      config.headers['Authentication'] = 'Barer ' + token
    }
    return config
  },
  (error) => {
    console.log(error)
    Promise.reject(error)
  }
)

server.interceptors.response.use(
  function (response) {
    if (response.data.code === 403 || response.data.code === 301) {
      window.store.ipcRenderer.del('token')
      router.push({
        path: '/login'
      })

      ElMessage(response.data.message)
    }
    return response
  },
  function (error) {
    if (error.response.data.code === 403) {
      window.store.ipcRenderer.del('token')
      router.push({
        path: '/login'
      })
    }
    console.log(error)
    return Promise.reject(error)
  }
)
