<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div class="w-full max-w-xl bg-white shadow-md rounded-md p-8">
        <!-- Paso 1: Datos del gimnasio -->
        <div v-if="step === 1">
            <img :src="logoTreinuxBlack" class="w-full h-16 mx-2 mb-12" />
            <h2 class="text-lg font-semibold mb-4 text-gray-700">Datos del Gimnasio</h2>
  
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Nombre del Gimnasio</label>
            <input v-model="form.nombreGimnasio" type="text" class="input" />
          </div>
  
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Dirección</label>
            <input v-model="form.direccion" type="text" class="input" />
          </div>
  
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Ciudad</label>
            <input v-model="form.ciudad" type="text" class="input" />
          </div>
  
          <button @click="step = 2" class="btn-treinux w-full mt-4">
            Siguiente
          </button>
        </div>
  
        <!-- Paso 2: Datos del dueño -->
        <div v-else-if="step === 2">
            <img :src="logoTreinuxBlack" class="w-full h-16 mx-2 mb-12" />
            <h2 class="text-lg font-semibold mb-4 text-gray-700">Datos del responsable a cargo</h2>
  
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input v-model="form.nombreCompleto" type="text" class="input" />
          </div>
  
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Teléfono</label>
            <input v-model="form.telefono" type="tel" class="input" />
          </div>
  
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input v-model="form.email" type="email" class="input" />
          </div>
  
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Contraseña</label>
            <input v-model="form.contrasena" type="password" class="input" />
          </div>
  
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Rol</label>
            <input type="text" value="Dueño" disabled class="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm p-2 text-gray-500" />
          </div>
  
          <div class="flex justify-between mt-6 gap-4">
            <button @click="step = 1" class="btn-treinux-alt w-full">
              Atrás
            </button>
            <button @click="submitForm" class="btn-treinux w-full">
              Registrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { supabase } from '@/supabase'

import logoTreinuxBlack from './../assets/images/logo-treinux-1.svg'

const router = useRouter()
const store = useStore()
  
  const step = ref(1)
  
  const form = ref({
    nombreGimnasio: '',
    direccion: '',
    ciudad: '',
    nombreCompleto: '',
    telefono: '',
    email: '',
    contrasena: '',
  })
  
const submitForm = async () => {
  try {
    // 1. Crear usuario en Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.contrasena
    })

    if (signUpError) throw signUpError

    const user = signUpData.user
    if (!user) throw new Error('No se pudo obtener el usuario.')

    // 2. Insertar en la tabla usuarios (con el mismo id que Auth)
    const { error: usuarioError } = await supabase
      .from('usuarios')
      .insert([{
        id: user.id,
        nombre: form.value.nombreCompleto,
        email: form.value.email,
        telefono: form.value.telefono,
        rol: 'dueño'
      }])

    if (usuarioError) throw usuarioError

    // 3. Insertar gimnasio vinculado al usuario
    const { data: gimnasioData, error: gimnasioError } = await supabase
      .from('gimnasios')
      .insert([{
        nombre: form.value.nombreGimnasio,
        direccion: form.value.direccion,
        ciudad: form.value.ciudad,
        email: form.value.email,
        telefono: form.value.telefono,
        usuario_creador: user.id
      }])
      .select()

    if (gimnasioError) throw gimnasioError

    const gimnasio = gimnasioData[0]

    // 4. Guardar en Vuex y redirigir
    store.dispatch('setUser', {
      uid: user.id,
      nombreCompleto: form.value.nombreCompleto,
      email: form.value.email,
      telefono: form.value.telefono,
      rol: 'dueño',
      gimnasioId: gimnasio.id,
      gimnasioNombre: form.value.nombreGimnasio
    })

    alert('¡Registro exitoso! 🎉')
    router.push('/alumnos')

  } catch (error) {
    console.error('Error durante el registro:', error)
    alert('Ocurrió un error: ' + error.message)
  }
}
</script>
  