import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles.css'
import './services/tema'

createApp(App).use(router).mount('#app')
