<template>
  <div class="flex flex-col gap-6">
    <!-- <div class="flex w-full justify-end">
      <Button 
        @click="showDialogNuevaActividad = true" 
        class="btn-treinux"
        label="Nueva Actividad"
        icon="pi pi-plus"
        iconPos="left"
      />
    </div> -->
    <div class="flex w-full bg-white rounded-md">
      <div class="flex flex-wrap w-full gap-6 p-6 rounded-md items-center">
        <div
          v-for="actividad in actividades"
          :key="actividad.id"
          class="border rounded-md shadow py-2 px-4 cursor-pointer"
          :class="[
            'border rounded-md shadow py-2 px-4 cursor-pointer',
            actividadSeleccionada === actividad.id 
              ? colorClasses[actividad.color]
              : `border-${actividad.color}-500 text-slate-700`
          ]"
          @click="() => seleccionarActividad(actividad.id)"
        >
          {{ actividad.nombre }}
        </div>
      </div>
    </div>
  
    <div class="flex w-full justify-end">
      <Button 
        @click="showOptions = true" 
        class="btn-treinux"
        label="Nueva Clase"
        icon="pi pi-plus"
        iconPos="left"
      />
    </div>
    <div class="flex w-full bg-white rounded-md">
      <div class="grid grid-cols-7 w-full gap-4 p-6">
        <div
          v-for="(clasesDelDia, dia) in clasesPorDia"
          :key="dia"
          class="col-span-1 h-[70vh] bg-gray-100 text-slate-700 rounded-md shadow p-2"
        >
          <p class="mb-3 capitalize">{{ dia }}</p>
          <div class="flex flex-col gap-2">
            <div
              v-for="clase in clasesDelDia"
              :key="clase.id"
              class="flex flex-col gap-2 bg-orange-400 text-white py-4 px-2 rounded-md shadow"
            >
              <div class="flex flex-col gap-2 text-sm font-semibold">
                <div class="flex gap-1">
                  <Icon icon="tabler:clock-check" class="h-4 w-4 text-white" />
                  <p class="text-xs">{{ clase.hora_inicio.slice(0, 5) }}</p>
                </div>
                <div class="flex gap-1">
                  <Icon icon="tabler:clock-cancel" class="h-4 w-4 text-white" />
                  <p class="text-xs">{{ clase.hora_fin.slice(0, 5) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-1 text-sm">
                <Icon icon="tabler:user" class="w-4 h-4" />
                <span>{{ clase.profesor?.nombre }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

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
            :class="[colorBgClasses[color.value], nuevaActividad.color === color.value ? 'border-black' : 'border-transparent']"
            @click="nuevaActividad.color = color.value"
          ></div>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <Button label="Cancelar" class="p-button-secondary" @click="showDialogNuevaActividad = false" />
        <Button 
          label="Guardar" 
          class="p-button-success"
          :disabled="!nuevaActividad.nombre || !nuevaActividad.color"
          @click="guardarNuevaActividad"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { useStore } from 'vuex'
import { Icon } from '@iconify/vue'

const store = useStore()
const isActivityActive = ref(true)
const actividades = ref([])
const actividadSeleccionada = ref(null)
const clases = ref([])
const showDialogNuevaActividad = ref(false)

const currentGimnasio = computed(() => store.getters.getCurrentGimnasio)
const currentGymId = computed(() => currentGimnasio.value?.id)
const user = computed(() => store.getters.getUser)

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

const colorClasses = {
  gray: 'bg-gray-400 text-white border-gray-500',
  brown: 'bg-amber-700 text-white border-amber-700',
  orange: 'bg-orange-400 text-white border-orange-500',
  yellow: 'bg-yellow-400 text-white border-yellow-500',
  green: 'bg-green-400 text-white border-green-500',
  blue: 'bg-blue-400 text-white border-blue-500',
  purple: 'bg-purple-400 text-white border-purple-500',
  pink: 'bg-pink-400 text-white border-pink-500',
  red: 'bg-red-400 text-white border-red-500',
}

const clasesPorDia = computed(() => {
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  return dias.reduce((acc, dia) => {
    acc[dia] = clases.value.filter(clase => clase.dia_semana === dia)
    return acc
  }, {})
})

const fetchActividades = async () => {
  const { data, error } = await supabase
    .from('actividades')
    .select('*')
    .eq('gym_id', currentGymId.value)

  if (!error) actividades.value = data
}

const fetchClases = async () => {
  const { data, error } = await supabase
    .from('clases')
    .select(`
      *,
      profesor:usuarios (
        id,
        nombre,
        email
      )
    `)
    .eq('actividad_id', actividadSeleccionada.value)
    .eq('gym_id', currentGymId.value)

  if (!error) clases.value = data
}

const seleccionarActividad = (idActividad) => {
  actividadSeleccionada.value = idActividad
  fetchClases()
}

const guardarNuevaActividad = async () => {
  const { data, error } = await supabase
    .from('actividades')
    .insert({
      nombre: nuevaActividad.value.nombre,
      color: nuevaActividad.value.color,
      gym_id: currentGymId.value
    })

  if (!error) {
    showDialogNuevaActividad.value = false
    nuevaActividad.value = { nombre: '', color: null }
    fetchActividades()
  }
}

onMounted(() => {
  fetchActividades()
})
</script>