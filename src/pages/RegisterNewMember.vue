<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div class="w-full max-w-xl bg-white shadow-md rounded-md p-8">
        <h2 class="text-lg font-semibold mb-6 text-gray-700">Registro de nuevo miembro</h2>
  
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Nombre Completo</label>
          <input v-model="form.nombre" type="text" class="input" />
        </div>
  
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input v-model="form.email" type="email" class="input" disabled />
        </div>
  
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Teléfono</label>
          <input v-model="form.telefono" type="tel" class="input" />
        </div>
  
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">DNI</label>
          <input v-model="form.dni" type="text" class="input" />
        </div>
  
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700">Contraseña</label>
          <input v-model="form.contrasena" type="password" class="input" />
        </div>
  
        <button @click="submitForm" class="btn-treinux w-full mt-4">Registrarme</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { supabase } from '@/supabase'
  import { useToast } from 'primevue/usetoast'
  
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  
  const form = ref({
    nombre: '',
    email: '',
    telefono: '',
    dni: '',
    contrasena: '',
    rol: 'profesor',
    gym_id: '',
    ficha_medica: null,
  })
  
  const invitationId = route.query.id || ''
  
  const handleFileUpload = (e) => {
    form.value.ficha_medica = e.target.files[0]
  }
  
  const loadInvitationData = async () => {
    const { data, error } = await supabase
      .from('invitaciones')
      .select('*')
      .eq('id', invitationId)
      .single()
  
    if (error || !data) {
      toast.add({ severity: 'error', summary: 'Invitación inválida', detail: 'No se encontró la invitación.', life: 3000 })
      router.push('/')
      return
    }
  
    form.value.email = data.email
    form.value.rol = data.rol || 'profesor'
    form.value.gym_id = data.gym_id
  }
  
  const submitForm = async () => {
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: form.value.email,
        password: form.value.contrasena
      })
      if (signUpError) throw signUpError
  
      const user = signUpData.user
      if (!user) throw new Error('No se pudo crear el usuario.')
  
      // 2. Subir ficha médica si fue cargada
      let fichaUrl = null
      if (form.value.ficha_medica) {
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('fichasmedicas')
          .upload(`usuarios/${user.id}/${form.value.ficha_medica.name}`, form.value.ficha_medica)
  
        if (uploadError) throw uploadError
  
        const { data: publicUrl } = supabase
          .storage
          .from('fichasmedicas')
          .getPublicUrl(`usuarios/${user.id}/${form.value.ficha_medica.name}`)
        fichaUrl = publicUrl.publicUrl
      }
  
      // 3. Insertar usuario en tabla
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert([{
          id: user.id,
          nombre: form.value.nombre,
          email: form.value.email,
          telefono: form.value.telefono,
          dni: form.value.dni,
          rol: form.value.rol,
          gym_id: form.value.gym_id,
          fecha_ingreso: new Date().toISOString(),
          tiene_deuda: null,
          ficha_medica: null
        }])
  
      if (insertError) throw insertError
  
      // 4. Marcar invitación como usada
      await supabase.from('invitaciones').delete().eq('id', invitationId)
  
      toast.add({ severity: 'success', summary: 'Registro exitoso', detail: '¡Bienvenido al equipo!', life: 3000 })
      router.push('/login')
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 4000 })
    }
  }
  
  onMounted(() => {
    if (invitationId) {
      loadInvitationData()
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Invitación no válida', life: 3000 })
      router.push('/')
    }
  })
  </script>
  
  <style scoped>
  .input {
    @apply mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm;
  }
  .btn-treinux {
    @apply bg-[#f54b20] text-white font-semibold py-2 px-4 rounded-md;
  }
  </style>
  