import { createApp } from 'vue'
import translate from './views/index/translate.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.component('translate', translate)

app.use(router)
app.use(ElementPlus)
app.mount('#app')
