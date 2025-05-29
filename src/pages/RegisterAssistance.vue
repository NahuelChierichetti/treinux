<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6 text-[#f54b20]">Registro de Asistencia</h1>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Ingresá tu DNI</label>
          <InputText
            v-model="dni"
            placeholder="Ej: 12345678"
            class="w-full border px-4 py-2 rounded-md !border-gray-300 focus:outline focus:outline-[#f54b20]"
          />
        </div>
        <Button
          label="Registrar Asistencia"
          icon="pi pi-check"
          class="btn-treinux w-full"
          :loading="loading"
          @click="registrarAsistencia"
        />
  
        <p v-if="mensaje" :class="mensajeColor" class="text-center text-sm mt-4 font-medium">{{ mensaje }}</p>
      </div>
    </div>
  </template>
  
<script setup>
import { ref } from 'vue'
import { supabase } from '@/supabase'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const dni = ref('')
const mensaje = ref('')
const mensajeColor = ref('')
const loading = ref(false)

const registrarAsistencia = async () => {
    if (!dni.value.trim()) {
        mensaje.value = 'Por favor ingresá un DNI válido.'
        mensajeColor.value = 'text-red-600'
        return
    }

    loading.value = true
    mensaje.value = ''

    try {
        // Buscar usuario por DNI
        const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('dni', dni.value.trim())
        .single()

        if (error || !usuario) {
        mensaje.value = 'Usuario no encontrado. Consultá con recepción.'
        mensajeColor.value = 'text-red-600'
        return
        }

        // Insertar asistencia con estado 'P' (presente)
        const { error: insertError } = await supabase
        .from('asistencias')
        .insert({
            user_id: usuario.id,
            fecha: new Date().toISOString().split('T')[0],
            estado: 'P'
        })

        if (insertError) {
        mensaje.value = 'Hubo un error al registrar la asistencia.'
        mensajeColor.value = 'text-red-600'
        } else {
        mensaje.value = '✅ Asistencia registrada correctamente.'
        mensajeColor.value = 'text-green-600'
        dni.value = ''
        }
    } catch (err) {
        mensaje.value = 'Ocurrió un error inesperado.'
        mensajeColor.value = 'text-red-600'
        console.error(err)
    } finally {
        loading.value = false
    }
}
</script>
  
<style scoped>
.btn-treinux {
    padding: 0.5rem 1rem;
    border: 1px solid #f54b20;
    color: #ffffff;
    background-color: #f54b20;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: background-color 0.2s;
}
.btn-treinux:hover {
    background-color: #e3431c;
}
</style>