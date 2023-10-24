import axios from 'axios'
import router from '../router'
import { ElMessage } from 'element-plus'
import net_status from './status_code'

let server = axios.create({
  baseURL: 'http://119.23.244.10:8080'
})

// let server = axios.create({
//   baseURL: 'http://192.168.1.100:8080'
// })

// let server = axios.create({
//   baseURL: 'http://localhost:8080'
//   // timeout: 1000
// })

export default server

server.interceptors.request.use(
  (config) => {
    let token = window.store.get('token')
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
    console.log('lanjie', response)
    if (
      response.data.code === net_status.token_expired ||
      response.data.code === net_status.token_required
    ) {
      window.store.del('token')
      router.push({
        path: '/login'
      })

      ElMessage(response.data.message)
    }
    return response
  },
  (error) => {
    console.log(error)
  }
)
