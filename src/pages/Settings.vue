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

      <!-- ACTIVIDADES -->
      <div class="mt-10">
        <h3 class="text-lg font-semibold mb-4">Actividades</h3>

        <div class="flex flex-wrap gap-4 mb-6">
          <div 
            v-for="actividad in actividades" 
            :key="actividad.id"
            class="flex items-center gap-3 border rounded-md px-4 py-2 shadow-sm"
          >
            <div 
              class="w-6 h-6 rounded-full"
              :class="colorBgClasses[actividad.color]"
            ></div>
            <span class="text-sm font-medium">{{ actividad.nombre }}</span>
            <button 
              class="ml-2 text-red-500 text-xs"
              @click="eliminarActividad(actividad.id)"
            >
              Eliminar
            </button>
          </div>
        </div>

        <button 
          class="btn-treinux"
          @click="showDialogNuevaActividad = true"
        >
          Agregar Actividad
        </button>
      </div>
    </div>

    <!-- DIALOG NUEVA ACTIVIDAD -->
    <Dialog v-model:visible="showDialogNuevaActividad" header="Nueva Actividad" modal class="w-[400px]">
      <div class="flex flex-col gap-4">
        <div>
          <label class="block mb-2">Nombre de la actividad</label>
          <InputText v-model="nuevaActividad.nombre" class="w-full" />
        </div>

        <div>
          <label class="block mb-2">Color</label>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="color in coloresDisponibles"
              :key="color.value"
              class="w-10 h-10 rounded-full border-2 cursor-pointer transition"
              :class="[
                colorBgClasses[color.value],
                nuevaActividad.color === color.value ? 'border-black' : 'border-transparent'
              ]"
              @click="nuevaActividad.color = color.value"
            ></div>
          </div>
        </div>

        <div class="flex justify-between gap-2 mt-4">
          <button class="p-button-secondary btn-cancelar" @click="showDialogNuevaActividad = false">Cancelar</button>
          <button class="p-button-primary btn-treinux" :disabled="!nuevaActividad.nombre || !nuevaActividad.color" @click="guardarNuevaActividad">Aplicar filtros</button>
        </div>
      </div>
    </Dialog>

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
import Dialog from 'primevue/dialog'

const store = useStore()
const currentGimnasio = computed(() => store.getters.getCurrentGimnasio)
const isSaving = ref(false)
const toast = useToast()

// FORMULARIO PRINCIPAL
const form = ref({
  nombre: currentGimnasio.value?.nombre || '',
  direccion: currentGimnasio.value?.direccion || '',
  telefono: currentGimnasio.value?.telefono || '',
  ciudad: currentGimnasio.value?.ciudad || '',
})
const imageUrl = ref(currentGimnasio.value?.imagen || '')

// ACTIVIDADES
const actividades = ref([])
const showDialogNuevaActividad = ref(false)
const nuevaActividad = ref({
  nombre: '',
  color: null
})

const coloresDisponibles = [
  { label: 'Gris', value: 'gray' },
  { label: 'Marrón', value: 'brown' },
  { label: 'Naranja', value: 'orange' },
  { label: 'Amarillo', value: 'yellow' },
  { label: 'Verde', value: 'green' },
  { label: 'Azul', value: 'blue' },
  { label: 'Morado', value: 'purple' },
  { label: 'Rosa', value: 'pink' },
  { label: 'Rojo', value: 'red' }
]

const colorBgClasses = {
  gray: 'bg-gray-400',
  brown: 'bg-amber-700',
  orange: 'bg-orange-400',
  yellow: 'bg-yellow-400',
  green: 'bg-green-400',
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
  pink: 'bg-pink-400',
  red: 'bg-red-400'
}

const fetchActividades = async () => {
  const { data, error } = await supabase
    .from('actividades')
    .select('*')
    .eq('gym_id', currentGimnasio.value.id)

  if (!error) actividades.value = data
}

const guardarNuevaActividad = async () => {
  const { error } = await supabase
    .from('actividades')
    .insert({
      nombre: nuevaActividad.value.nombre,
      color: nuevaActividad.value.color,
      gym_id: currentGimnasio.value.id
    })

  if (!error) {
    nuevaActividad.value = { nombre: '', color: null }
    showDialogNuevaActividad.value = false
    fetchActividades()
  }
}

const eliminarActividad = async (idActividad) => {
  const { error } = await supabase
    .from('actividades')
    .delete()
    .eq('id', idActividad)

  if (!error) {
    fetchActividades()
  }
}

// GUARDAR PERFIL DEL GIMNASIO
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

// SUBIDA DE IMAGEN
const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const filename = `${Date.now()}_${file.name}`
  const path = `gimnasios/${filename}`

  const { error: uploadError } = await supabase.storage
    .from('gimnasios')
    .upload(path, file)

  if (uploadError) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir la imagen.' })
    return
  }

  const { error: updateError } = await supabase
    .from('gimnasios')
    .update({ imagen: path })
    .eq('id', currentGimnasio.value.id)

  if (updateError) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'La imagen se subió pero no se pudo guardar.' })
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

onMounted(async () => {
  isSaving.value = true

  if (currentGimnasio.value?.imagen) {
    const { data } = await supabase.storage
      .from('gimnasios')
      .createSignedUrl(currentGimnasio.value.imagen, 3600)

    if (data?.signedUrl) {
      imageUrl.value = data.signedUrl
    }
  }

  await fetchActividades()

  isSaving.value = false
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
