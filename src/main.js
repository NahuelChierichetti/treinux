import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import 'primevue/resources/themes/saga-orange/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import './assets/main.css'

import { supabase } from './supabase'

let isInitialized = false

const savedUser = localStorage.getItem('treinux_user')
const savedGimnasio = localStorage.getItem('treinux_gimnasio')

if (savedUser) {
  store.dispatch('setUser', JSON.parse(savedUser))
}
if (savedGimnasio) {
  store.dispatch('setCurrentGimnasio', JSON.parse(savedGimnasio))
}

supabase.auth.getSession().then(async ({ data: { session } }) => {
  const user = session?.user

  if (user && !isInitialized) {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!error && usuario) {
      store.dispatch('setUser', {
        uid: user.id,
        ...usuario
      })
      localStorage.setItem('treinux_user', JSON.stringify({
        uid: user.id,
        ...usuario
      }))

      const gimnasioId = Array.isArray(usuario.gym_id) ? usuario.gym_id[0] : usuario.gym_id

      if (gimnasioId) {
        const { data: gimnasio, error: gymError } = await supabase
          .from('gimnasios')
          .select('*')
          .eq('id', gimnasioId)
          .single()

        if (!gymError && gimnasio) {
          store.dispatch('setCurrentGimnasio', gimnasio)
        }
      }
    }
  }

  if (!isInitialized) {
    const app = createApp(App)
    app.use(router)
    app.use(store)
    app.use(ToastService)
    app.use(PrimeVue)
    app.mount('#app')
    isInitialized = true
  }
})

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    store.dispatch('logout')
    router.push('/login')
  }
})
