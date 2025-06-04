import { createApp } from 'vue'
import App from './App.vue'
import AlertToastPlugin from '@/components/alert'
import LoadProcessPlugin from './js/load'

const app = createApp(App)
app.use(AlertToastPlugin)
app.use(LoadProcessPlugin)
app.mount('#app')

