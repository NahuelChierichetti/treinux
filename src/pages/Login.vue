<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div class="w-full max-w-md bg-white p-8 rounded shadow-md">
          <img :src="logoTreinuxBlack" class="w-full h-16 mx-2 mb-12" />

          <ApplicationLoader v-if="isLoading" />
  
          <form @submit.prevent="login" v-else>
          <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input v-model="email" type="email" required class="input" />
          </div>
  
          <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700">Contraseña</label>
              <input v-model="password" type="password" required class="input" />
          </div>

          <div class="flex justify-center py-4">
              <button @click="lostPassword" class="text-sm text-gray-500 hover:underline">¿Olvidaste tu contraseña?</button>
          </div>
          <button type="submit" class="btn-treinux w-full" :disabled="isLoading">Iniciar Sesión</button>
          </form>
      </div>
  </div>
</template>
  
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import { useStore } from 'vuex'
import ApplicationLoader from '../components/ui/ApplicationLoader.vue'

import logoTreinuxBlack from './../assets/images/logo-treinux-1.svg'

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const router = useRouter()
const store = useStore()

const login = async () => {
  isLoading.value = true
  try {
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (loginError) throw loginError

    const user = sessionData.user
    if (!user) throw new Error('No se pudo obtener el usuario.')

    // Buscar al usuario en la tabla 'usuarios' usando su ID
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single()

    if (usuarioError) throw usuarioError

    store.dispatch('setUser', {
      uid: user.id,
      ...usuarioData
    })

    localStorage.setItem('treinux_user', JSON.stringify({
      uid: user.id,
      ...usuarioData
    }))

    const { data: gimnasioActual, error: gimnasioError } = await supabase
      .from('gimnasios')
      .select('*')
      .eq('id', usuarioData.gym_id)
      .single()

    if (gimnasioError) throw gimnasioError

    store.dispatch('setCurrentGimnasio', gimnasioActual)

    router.push('/members')
  } catch (error) {
    console.error(error)
    alert('Credenciales inválidas o error en el inicio de sesión.')
  } finally {
    isLoading.value = false
  }
}

const lostPassword = () => {
  router.push('/recuperar-contrasena')
}
</script>

<style>
.input {
  @apply mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-[#f54b20] focus:border-[#f54b20];
}
.btn-treinux {
  @apply bg-[#f54b20] text-white px-4 py-2 rounded-md hover:bg-[#f96243] transition focus:outline-[#f54b20] focus:border-[#f54b20];
}
.btn-treinux-alt {
  @apply !bg-white text-[#f54b20] hover:!text-white !border-[1px] !border-[#f54b20] px-4 py-2 rounded-md bg-[#f54b20] hover:!bg-[#f96243] transition focus:outline-[#f54b20] focus:border-[#f54b20];
}
.p-inputtext:enabled:focus {
  @apply !shadow-none;
}
.p-dropdown:not(.p-disabled).p-focus{
  @apply !shadow-none;
}
.p-dialog .p-dialog-header .p-dialog-header-icon:focus{
  @apply !shadow-none;
}
</style>
  