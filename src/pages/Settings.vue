<template>
  <div class="bg-white rounded-md p-6">
    <ApplicationLoader v-if="isSaving" />
    <div v-else>
      <h2 class="text-xl font-bold mb-6">Perfil del gimnasio</h2>

      <div class="grid grid-cols-1 gap-6">
        <!-- Imagen de perfil -->
        <div class="flex items-center gap-4">
          <img
            :src="imageUrl || defaultImage"
            alt="Imagen del gimnasio"
            class="w-20 h-20 rounded-full object-cover border"
          />
          <div class="flex flex-col gap-2">
            <label for="image-upload" class="flex gap-2 px-3 py-1.5 border text-sm rounded-md bg-white text-gray-700 cursor-pointer border-gray-300 hover:bg-gray-50 w-max">
              <Icon icon="tabler:upload" class="h-4 w-4"/> Cambiar imagen de perfil
            </label>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              @change="handleImageUpload"
              class="hidden"
            />
            <p class="text-xs text-gray-400">La imagen debe tener una resolución mínima de 640x640 px.</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nombre</label>
          <InputText
            v-model="form.nombre"
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
          <label class="block text-sm font-medium text-gray-700">Dirección</label>
          <InputText
            v-model="form.direccion"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#f54b20] focus:ring-[#f54b20] text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Ciudad</label>
          <InputText
            v-model="form.ciudad"
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
import defaultImage from '@/assets/images/sin-imagen.jpg'
import { Icon } from '@iconify/vue'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import ApplicationLoader from '@/components/ui/ApplicationLoader.vue'

const store = useStore()
const currentGimnasio = computed(() => store.getters.getCurrentGimnasio)
const isSaving = ref(false)

const form = ref({
  nombre: currentGimnasio.value?.nombre || '',
  direccion: currentGimnasio.value?.direccion || '',
  telefono: currentGimnasio.value?.telefono || '',
  ciudad: currentGimnasio.value?.ciudad || '',
})

const toast = useToast()
const imageUrl = ref(currentGimnasio.value?.imagen || '')

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const filename = `${Date.now()}_${file.name}`
  const path = `gimnasios/${filename}`

  const { error: uploadError } = await supabase.storage
    .from('gimnasios')
    .upload(path, file)

  if (uploadError) {
    console.error('Error al subir la imagen del gimnasio:', uploadError)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo subir la imagen del gimnasio.',
      life: 4000
    })
    return
  }

  const { error: updateError } = await supabase
    .from('gimnasios')
    .update({ imagen: path })
    .eq('id', currentGimnasio.value.id)

  if (updateError) {
    console.error('Error al guardar la imagen en la base de datos:', updateError)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'La imagen se subió pero no se pudo guardar en el gimnasio.',
      life: 4000
    })
    return
  }

  store.dispatch('setCurrentGimnasio', {
    ...currentGimnasio.value,
    imagen: path
  })

  const { data, error: signedUrlError } = await supabase.storage
    .from('gimnasios')
    .createSignedUrl(path, 60 * 60)

  imageUrl.value = signedUrlError || !data?.signedUrl ? path : data.signedUrl

  toast.add({
    severity: 'success',
    summary: 'Imagen actualizada',
    detail: 'La imagen del gimnasio se actualizó correctamente.',
    life: 3000
  })
}

const guardarDatos = async () => {
  isSaving.value = true

  const { error } = await supabase
    .from('gimnasios')
    .update({ 
      nombre: form.value.nombre,
      direccion: form.value.direccion,
      telefono: form.value.telefono,
      ciudad: form.value.ciudad
    })
    .eq('id', currentGimnasio.value.id)

  isSaving.value = false

  if (error) {
    alert('Error al guardar los datos')
    return
  }
  
  store.dispatch('setCurrentGimnasio', {
    ...currentGimnasio.value,
    nombre: form.value.nombre,
    direccion: form.value.direccion,
    telefono: form.value.telefono,
    ciudad: form.value.ciudad
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

  if (currentGimnasio.value?.imagen) {
    const { data } = await supabase.storage
      .from('gimnasios')
      .createSignedUrl(currentGimnasio.value.imagen, 3600)

    if (data?.signedUrl) {
      imageUrl.value = data.signedUrl
      isSaving.value = false
    }
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
