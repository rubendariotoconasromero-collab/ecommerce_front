import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
// 1. Primero cargamos Bootstrap 5
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

// 2. LUEGO cargamos nuestro Sistema de Diseño (pisará a Bootstrap)
import './assets/styles.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')