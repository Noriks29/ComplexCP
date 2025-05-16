import { createApp } from 'vue'
import App from './App.vue'
import AlertToastPlugin from '@/components/alert'

const app = createApp(App)
app.use(AlertToastPlugin)
app.mount('#app')

