<template>
  <Toast />
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
    <div class="flex flex-col md:flex-row gap-2">
      <div class="flex flex-col gap-2">
        <label class="block text-sm font-medium text-gray-700">Buscar por nombre</label>
        <InputText
          v-model="search"
          placeholder="Buscar por nombre"
          class="border !px-4 !py-2 rounded w-full md:w-64 !border-gray-300 !focus:outline !focus:outline-[#f54b20] !focus:border-[#f54b20]"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="block text-sm font-medium text-gray-700">Estado de Deuda</label>
        <Dropdown
          v-model="filtroDeuda"
          :options="opcionesDeuda"
          optionLabel="label"
          optionValue="value"
          placeholder="Filtrar por deuda"
          class="filter-deuda w-full md:w-64 !text-sm !px-4 !py-2 border !border-gray-300 rounded !leading-[0.5rem] !focus:outline-none !focus:ring-1 !focus:ring-[#f54b20] !focus:border-[#f54b20]"
        />
      </div>
    </div>

    <button @click="showOptions = true" class="bg-[#f54b20] text-white px-4 py-2 rounded-md hover:bg-white hover:text-[#f54b20] border-[1px] border-[#f54b20]">
      + Nuevo Alumno
    </button>
  </div>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-xl font-bold mb-4">Listado de Alumnos</h2>

    <ApplicationLoader v-if="loading" />

    <table v-else class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[#f54b20] uppercase tracking-wider">Nombre</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">DNI</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Ingreso</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado Deuda</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ficha Médica</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="alumno in alumnosFiltrados" :key="alumno.id">
          <td class="px-4 py-2 text-slate-700 text-sm font-normal">{{ alumno.nombre }}</td>
          <td class="px-4 py-2 text-slate-700 text-sm font-normal">{{ alumno.dni }}</td>
          <td class="px-4 py-2 text-slate-700 text-sm font-normal">{{ alumno.telefono }}</td>
          <td class="px-4 py-2 text-slate-700 text-sm font-normal">{{ alumno.email }}</td>
          <td class="px-4 py-2 text-slate-700 text-sm font-normal">{{ formatFecha(alumno.fecha_ingreso) }}</td>
          <td class="px-4 py-2 text-sm font-normal">
            <span
              :class="[
                'inline-flex items-center px-4 py-1.5 rounded-md text-xs font-semibold',
                alumno.tiene_deuda
                  ? 'bg-red-100 text-red-600'
                  : 'bg-green-100 text-green-600'
              ]"
            >
              {{ alumno.tiene_deuda ? 'Con deuda' : 'Sin deuda' }}
            </span>
          </td>
          <td class="px-4 py-2 text-center">
            <FileText :class="[alumno.ficha_medica ? 'text-orange-500 cursor-pointer' : 'text-gray-300 disabled']" class="w-5 h-5 mx-auto" @click="viewFichaMedica(alumno.ficha_medica)"/>
          </td>
          <td class="px-4 py-2 flex gap-2 justify-center">
            <button class="text-blue-600 hover:text-blue-800">
              <Pencil class="w-4 h-4" />
            </button>
            <button class="text-red-600 hover:text-red-800">
              <Trash class="w-4 h-4" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <Dialog v-model:visible="showOptions" header="Nuevo Alumno" :modal="true" :style="{ width: '400px' }">
      <div class="flex flex-col gap-4">
        <button class="w-full border-[1px] px-4 py-3 rounded border-[#f54b20] !bg-white !text-[#f54b20] hover:!bg-[#f54b20] hover:!text-white !font-sans" @click="abrirManual">
          Crear usuario manual
        </button>
        <button class="w-full border-[1px] px-4 py-3 rounded border-1 border-[#f54b20] !bg-white !text-[#f54b20] hover:!bg-[#f54b20] hover:!text-white !font-sans">
          Importar usuarios
        </button> 
      </div>
    </Dialog>

    <Dialog v-model:visible="showForm" header="Registrar nuevo alumno" :modal="true" :style="{ width: '40vw' }">
      <form @submit.prevent="submitAlumno" class="flex flex-col gap-4">
        <div class="grid grid-cols-1 gap-2">
          <label>Nombre</label>
          <InputText v-model="form.nombre" class="input-sm" required />

          <label>Email</label>
          <InputText v-model="form.email" class="input-sm" type="email" required />

          <label>Teléfono</label>
          <InputText v-model="form.telefono" class="input-sm" type="tel" required />

          <label>DNI</label>
          <InputText v-model="form.dni" class="input-sm" required />

          <label>Fecha de ingreso</label>
          <Calendar v-model="form.fecha_ingreso" class="w-full input-treinux" dateFormat="dd/mm/yy" showIcon required />

          <label>Ficha médica</label>
          <input type="file" accept="application/pdf" @change="handleFileUpload" class="mb-2 w-full" />
        </div>

        <div class="flex justify-end gap-2 mt-4 w-full">
          <button class="w-max-content border-[1px] px-4 py-2 rounded border-1 border-[#f54b20] !bg-white !text-[#f54b20] hover:!bg-[#f54b20] hover:!text-white !font-sans" @click="showForm = false">
            Cancelar
          </button>
          <button type="submit" class="w-max-content border-[1px] px-4 py-2 rounded border-1 border-[#f54b20] !bg-[#f54b20] !text-white hover:!bg-white hover:!text-[#f54b20] !font-sans">
            Crear usuario
          </button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { FileText, Pencil, Trash } from 'lucide-vue-next'
import ApplicationLoader from '../components/ui/ApplicationLoader.vue'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'
import { supabase } from '@/supabase'
import { useStore } from 'vuex'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const store = useStore()
const alumnos = ref([])
const loading = ref(true)
const search = ref('')
const filtroDeuda = ref(null)
const showOptions = ref(false)
const showForm = ref(false)

const opcionesDeuda = [
  { label: 'Todos', value: null },
  { label: 'Con deuda', value: true },
  { label: 'Sin deuda', value: false }
]

const currentGimnasio = computed(() => store.getters.getCurrentGimnasio)

const formatFecha = (fecha) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const alumnosFiltrados = computed(() => {
  return alumnos.value.filter(alumno => {
    const coincideNombre = alumno.nombre.toLowerCase().includes(search.value.toLowerCase())
    const coincideDeuda =
      filtroDeuda.value === null || alumno.tiene_deuda === filtroDeuda.value

    return coincideNombre && coincideDeuda
  })
})

const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  dni: '',
  fecha_ingreso: null,
  ficha_medica: '',
  tiene_deuda: null,
})

const abrirManual = () => {
  showOptions.value = false
  showForm.value = true
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const filename = `${Date.now()}_${file.name}`
  const path = `fichas/${filename}`

  const { error } = await supabase.storage
    .from('fichasmedicas')
   .upload(path, file)

  if (error) {
    console.error('Error al subir la ficha médica:', error)
    alert('No se pudo subir la ficha médica.')
    return
  }

  form.value.ficha_medica = path
}

const submitAlumno = async () => {
  if (!form.value.nombre || !form.value.email || !form.value.telefono || !form.value.dni || !form.value.fecha_ingreso ) {
    alert('Por favor completa todos los campos obligatorios.')
    return
  }

  try {
    const { error } = await supabase
      .from('usuarios')
      .insert([{
        nombre: form.value.nombre,
        email: form.value.email,
        telefono: form.value.telefono,
        dni: form.value.dni,
        fecha_ingreso: form.value.fecha_ingreso,
        ficha_medica: form.value.ficha_medica,
        tiene_deuda: false,
        rol: 'alumno',
        gym_id: currentGimnasio.value.id
      }])

    if (error) throw error

    toast.add({
      severity: 'success',
      summary: 'Alumno registrado',
      detail: 'El alumno fue creado exitosamente.',
      life: 3000
    })
    showForm.value = false
    loadAlumnos()
  } catch (error) {
    console.error('Error al registrar alumno:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo registrar el alumno.',
      life: 4000
    })
  }
}

const loadAlumnos = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('rol', 'alumno')
      .eq('gym_id', currentGimnasio.value.id)

    if (error) throw error
    alumnos.value = data
  } catch (error) {
    console.error('Error al traer alumnos:', error)
  } finally {
    loading.value = false
  }
}

const viewFichaMedica = async (path) => {
  if (!path) {
    return
  }

  const { data, error } = await supabase.storage
    .from('fichasmedicas')
    .createSignedUrl(path, 60 * 60)

  if (error || !data?.signedUrl) {
    console.error('Error al generar la URL firmada:', error || data)
    return
  }

  window.open(data.signedUrl, '_blank')
}

onMounted(loadAlumnos)
</script>
<style scoped>
.input-treinux{
  font-size: 0.875rem;
}

.p-inputtext:enabled:hover{
  border-color: #f54b20 !important;
}

.input-treinux:hover {
  border-color: #f54b20 !important;
}

.input-treinux:focus {
  outline: none;
  border-color: #f54b20 !important;
  box-shadow: 0 0 0 1px #f54b20 !important;
}

.input-sm {
  font-size: 0.875rem;
  padding: 0.75rem 0.75rem;
  height: 2.65rem;
  width: 100%;
  border: 1px solid #ced4da;
  border-radius: 3px;
}

.input-sm:hover {
  border-color: #f54b20 !important;
}

.input-sm:focus {
  outline: none;
  border-color: #f54b20 !important;
  box-shadow: 0 0 0 1px #f54b20 !important;
}

</style>