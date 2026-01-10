// main.js
// import './assets/main.css'





// main.js
import './index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import socketService from './services/socket'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')

// 🚀 DEV MODE SOCKET INIT (AUTH BYPASSED)
if (import.meta.env.DEV) {
  console.log('⚠️ DEV MODE: initializing socket without auth')
  socketService.connect(null)
}






// import './index.css'
// import { createApp } from 'vue'
// import { createPinia } from 'pinia'
// import App from './App.vue'

// // Import stores
// import { useAuthStore } from './stores/auth'

// const app = createApp(App)
// const pinia = createPinia()

// app.use(pinia)

// // Wait for pinia to be ready, then initialize auth
// app.mount('#app')

// // Initialize auth store after app is mounted
// setTimeout(() => {
//   const authStore = useAuthStore()
  
//   // Initialize auth from localStorage/sessionStorage
//   authStore.initializeFromStorage()
  
//   // The auth store should handle socket initialization
//   // when the user is authenticated
// }, 0)