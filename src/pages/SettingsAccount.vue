<template>
    <div class="bg-white rounded-md p-6">
      <ApplicationLoader v-if="isSaving" />
      <div v-else>
        <h2 class="text-xl font-bold mb-6">Perfil del usuario</h2>
  
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre</label>
            <InputText
              v-model="form.nombre"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#f54b20] focus:ring-[#f54b20] text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Rol</label>
            <InputText
              v-model="form.rol"
              disabled
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#f54b20] focus:ring-[#f54b20] text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <InputText
              v-model="form.email"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#f54b20] focus:ring-[#f54b20] text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Teléfono</label>
            <InputText
              v-model="form.telefono"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#f54b20] focus:ring-[#f54b20] text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">DNI</label>
            <InputText
              v-model="form.dni"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#f54b20] focus:ring-[#f54b20] text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Perfil creado</label>
            <InputText
              v-model="form.fecha_ingreso"
              disabled
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#f54b20] focus:ring-[#f54b20] text-sm"
            />
          </div>
        </div>
  
        <div class="mt-6">
          <button
            @click="guardarDatos"
            class="btn-treinux"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { supabase } from '@/supabase'
  import { useStore } from 'vuex'
  import InputText from 'primevue/inputtext'
  import { useToast } from 'primevue/usetoast'
  import ApplicationLoader from '@/components/ui/ApplicationLoader.vue'
  import dayjs from 'dayjs'

  const store = useStore()
  const user = computed(() => store.getters.getUser)
  const isSaving = ref(false)

  const form = ref({
    nombre: user.value?.nombre || '',
    rol: user.value?.rol || '',
    email: user.value?.email || '',
    telefono: user.value?.telefono || '',
    dni: user.value?.dni || '',
    fecha_ingreso: dayjs(user.value?.fecha_ingreso).format('DD-MM-YYYY HH:mm') || '',
  })
  
  const toast = useToast()
  
  const guardarDatos = async () => {
    isSaving.value = true
  
    const { error } = await supabase
      .from('usuarios')
      .update({ 
        nombre: form.value.nombre,
        email: form.value.email,
        telefono: form.value.telefono,
        dni: form.value.dni
      })
      .eq('id', user.value.id)
  
    isSaving.value = false
  
    if (error) {
      alert('Error al guardar los datos')
      return
    }
    
    store.dispatch('setUser', {
      ...user.value,
      nombre: form.value.nombre,
      email: form.value.email,
      telefono: form.value.telefono,
      dni: form.value.dni
    })
  
    toast.add({
      severity:'success',
      summary: 'Datos actualizados',
      detail: 'Los datos del gimnasio se actualizó correctamente.',
      life: 3000
    })
  }
  
  onMounted(async () => {
    isSaving.value = true
  
    // if (currentGimnasio.value?.imagen) {
    //   const { data } = await supabase.storage
    //     .from('gimnasios')
    //     .createSignedUrl(currentGimnasio.value.imagen, 3600)
  
    //   if (data?.signedUrl) {
    //     imageUrl.value = data.signedUrl
    //     isSaving.value = false
    //   }
    // }

    if (user.value?.fecha_ingreso) {
        form.value.nombre = user.value.nombre
        form.value.rol = user.value.rol == 'superadmin' ? 'Dueño' : 'Profesor'
        form.value.email = user.value.email
        form.value.telefono = user.value.telefono
        form.value.dni = user.value.dni
        form.value.fecha_ingreso = dayjs(user.value?.fecha_ingreso).format('DD-MM-YYYY HH:mm')
        isSaving.value = false
    }
  })
  </script>
  
  <style scoped>
  .btn-treinux {
    padding: 0.5rem 1rem;
    border: 1px solid #f54b20;
    color: #fff;
    background-color: #f54b20;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
  }
  </style>
  