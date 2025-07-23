<template>
  <ApplicationLoader v-if="isLoading" />
  <div v-else class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start">
      <div>
        <h2 class="text-2xl font-bold">{{ actividad?.nombre }}</h2>
        <p class="text-gray-500">{{ actividad?.descripcion ?? '' }}</p>
        <div class="flex items-center gap-1 mt-2 cursor-pointer" @click="returnActivities()">
          <Icon icon="tabler:arrow-left" class="w-4 h-4 text-gray-500" />
          <span class="text-sm font-normal text-gray-500">Volver a Actividades</span>
        </div>
      </div>
      <div class="flex gap-2 mt-4 md:mt-0">
        <button class="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md text-sm font-medium shadow-sm flex items-center gap-2" @click="openFilterDialog">
          <Icon icon="tabler:filter" class="h-4 w-4 text-gray-400" />
          Filtros
        </button>
        <Button label="Nueva Clase" class="btn-treinux" icon="pi pi-plus" @click="abrirNuevaClase()" />
      </div>
    </div>

    <!-- Resumen superior -->
    <div class="flex gap-8 mb-4 border bg-white p-6 rounded-md">
      <div class="flex items-center gap-2 text-sm">
        <i class="pi pi-calendar"></i> {{ clases.length }} clases programadas
      </div>
      <div class="flex items-center gap-2 text-sm">
        <i class="pi pi-users"></i> {{ totalAlumnos }} alumnos inscriptos
      </div>
    </div>

    <!-- Bloque si no hay clases -->
    <div v-if="clases.length === 0" class="flex justify-center items-center border rounded-md p-12 bg-gray-50">
      <div class="flex flex-col items-center gap-4">
        <Icon icon="tabler:calendar-due" class="w-16 h-16 text-gray-400" />
        <h3 class="text-lg font-semibold">No hay clases programadas</h3>
        <p class="text-gray-500 text-sm">Comienza creando tu primera clase para esta actividad</p>
        <Button label="Crear Primera Clase" icon="pi pi-plus" class="p-button-primary btn-treinux" @click="abrirNuevaClase()" />
      </div>
    </div>

    <!-- Listado de clases -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="clase in clasesFiltradas" :key="clase.id" class="bg-white p-6 rounded shadow flex flex-col justify-between hover:translate-y-[-2px] transition duration-300">
        <div>
          <div class="flex justify-between mb-3">
            <div class="font-semibold capitalize">{{ clase.dia_semana }}</div>
            <span
              :class="[
                'text-xs px-2 py-1 rounded',
                (clase.alumnos?.length ?? 0) >= clase.cupo_maximo
                  ? 'bg-red-300 text-red-700'
                  : 'bg-green-300 text-green-700'
              ]"
            >
              {{ (clase.alumnos?.length ?? 0) >= clase.cupo_maximo ? 'Completo' : 'Disponible' }}
            </span>
          </div>
          
          <div class="flex flex-col gap-1 border-b pb-2">
            <div class="text-sm text-gray-600 mb-1 flex gap-1 items-center">
                <Icon icon="tabler:clock-hour-3" class="h-4 w-4"/> {{ clase.hora_inicio }} - {{ clase.hora_fin }}
            </div>
            <div class="text-sm text-gray-600 mb-1 flex gap-1 items-center">
                <Icon icon="tabler:map-pin" class="h-4 w-4"/> {{ clase.sala }}
            </div>
            <div class="text-sm text-gray-600 mb-1 flex gap-1 items-center">
                <Icon icon="tabler:users" class="h-4 w-4"/> {{ (clase.alumnos?.length ?? 0) }}/{{ clase.cupo_maximo }} alumnos 
            </div>
          </div>
          <div class="mt-3">
            <div class="flex text-sm font-medium text-slate-700 gap-2">
              Profesor: <span class="text-sm !text-gray-600 font-normal">{{ clase.profesor?.nombre }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-between gap-4 mt-3">
          <button class="p-button-secondary btn-cancelar w-full" @click="abrirGestionAlumnos(clase)">
            Gestionar alumnos
          </button>
          <button class="px-2 py-1 text-sm text-slate-700" @click="abrirEditarClase(clase)">
            <Icon icon="tabler:edit" class="h-4 w-4" />
          </button>
          <button class="px-2 py-1 text-sm text-red-500">
            <Icon icon="tabler:trash" class="h-4 w-4" />
          </button>
        </div>

        <div class="mt-3">
          <div class="w-full h-2 bg-gray-100 rounded mt-1">
            <div class="h-2 rounded"
                :style="{
                  width: ((clase.alumnos?.length ?? 0) / clase.cupo_maximo * 100) + '%',
                  backgroundColor: actividad?.color || '#f54b20'
                }">
            </div>
          </div>
        </div>

      </div>
    </div>

    <Dialog v-model:visible="showFilterDialog" header="Filtros de búsqueda" modal class="w-full md:w-1/2 mx-2 md:mx-0">
      <div class="flex flex-col gap-4 py-4">
        <div>
          <label class="block text-sm mb-1 font-medium">Días</label>
          <Dropdown v-model="filtroDias" :options="diasSemana" class="w-full" placeholder="Seleccionar días" />
        </div>
        <div>
          <label class="block text-sm mb-1 font-medium">Salas</label>
          <Dropdown v-model="filtroSala" :options="salasDisponibles" class="w-full" placeholder="Seleccionar salas" />
        </div>
        <div>
          <label class="block text-sm mb-1 font-medium">Profesor</label>
          <Dropdown v-model="filtroProfesor" :options="profesoresDisponibles" option-label="nombre" option-value="id" class="w-full" placeholder="Seleccionar profesores" />
        </div>
        <div class="flex gap-4">
          <div class="w-1/2">
            <label class="block text-sm mb-1 font-medium">Desde hora</label>
            <InputText v-model="filtroHoraInicio" type="time" class="w-full" />
          </div>
          <div class="w-1/2">
            <label class="block text-sm mb-1 font-medium">Hasta hora</label>
            <InputText v-model="filtroHoraFin" type="time" class="w-full" />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-between gap-2">
          <button class="p-button-secondary btn-cancelar" @click="resetFilters">Limpiar</button>
          <button class="p-button-primary btn-treinux" @click="showFilterDialog = false">Aplicar</button>
        </div>
      </template>
    </Dialog>

    <!-- Dialog Crear o Editar Clase -->
    <Dialog v-model:visible="mostrarDialogClase" :header="modoEdicion ? 'Editar Clase' : 'Nueva Clase'" modal class="w-[500px]">
      <div class="flex flex-col gap-4">
        <div>
          <label>Seleccionar profesor</label>
          <Dropdown 
            v-model="claseForm.profesor_id" 
            :options="profesores" 
            option-label="nombre" 
            option-value="id" 
            class="w-full"
          />
        </div>
        <div>
          <label>Día de la semana</label>
          <Dropdown v-model="claseForm.dia_semana" :options="diasSemana" class="w-full" />
        </div>
        <div>
          <label>Hora inicio</label>
          <InputText v-model="claseForm.hora_inicio" type="time" class="w-full" />
        </div>
        <div>
          <label>Hora fin</label>
          <InputText v-model="claseForm.hora_fin" type="time" class="w-full" />
        </div>
        <div>
          <label>Sala</label>
          <InputText v-model="claseForm.sala" class="w-full" />
        </div>
        <div>
          <label>Cupo máximo de alumnos</label>
          <InputText v-model="claseForm.cupo_maximo" type="number" min="1" class="w-full" />
        </div>

        <div class="flex justify-between mt-4 gap-2">
          <button class="p-button-secondary btn-cancelar" @click="cerrarDialog()" >Cancelar</button>
          <Button :label="modoEdicion ? 'Actualizar Clase' : 'Guardar'" class="p-button-success" @click="guardarClase()" />
        </div>
      </div>
    </Dialog>

    <DialogGestionAlumnos
      v-model:visible="mostrarDialogGestionAlumnos"
      :clase="claseSeleccionada"
      @reloadClases="fetchClases"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { Icon } from '@iconify/vue'
import DialogGestionAlumnos from './DialogGestionAlumnos.vue'
import ApplicationLoader from '../components/ui/ApplicationLoader.vue'

const route = useRoute()
const router = useRouter()
const actividadId = route.params.actividadId
const actividad = ref(null)
const profesores = ref([])
const clases = ref([])
const mostrarDialogGestionAlumnos = ref(false)
const claseSeleccionada = ref(null)
const isLoading = ref(true)

const abrirGestionAlumnos = (clase) => {
  claseSeleccionada.value = clase
  mostrarDialogGestionAlumnos.value = true
}

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const diasOrden = { "Lunes": 1, "Martes": 2, "Miércoles": 3, "Jueves": 4, "Viernes": 5, "Sábado": 6, "Domingo": 7 }

const filtroDias = ref([])
const filtroSala = ref([])
const filtroHoraInicio = ref('')
const filtroHoraFin = ref('')
const filtroProfesor = ref([])
const showFilterDialog = ref(false)

const totalAlumnos = computed(() => clases.value.reduce((acc, c) => acc + (c.alumnos?.length ?? 0), 0))

const salasDisponibles = computed(() => [...new Set(clases.value.map(c => c.sala))].sort())
const profesoresDisponibles = computed(() => {
  const idsConClases = [...new Set(clases.value.map(c => c.profesor?.id).filter(id => id))]
  return profesores.value.filter(profesor => idsConClases.includes(profesor.id))
})

const clasesOrdenadas = computed(() => {
  return [...clases.value].sort((a, b) => {
    const diaA = diasOrden[a.dia_semana] || 99
    const diaB = diasOrden[b.dia_semana] || 99
    if (diaA !== diaB) return diaA - diaB
    return a.hora_inicio.localeCompare(b.hora_inicio)
  })
})

const clasesFiltradas = computed(() => {
  return clasesOrdenadas.value.filter(clase => {
    const diaOk = filtroDias.value.length === 0 || filtroDias.value.includes(clase.dia_semana)
    const salaOk = filtroSala.value.length === 0 || filtroSala.value.includes(clase.sala)
    const profesorOk = filtroProfesor.value.length === 0 || filtroProfesor.value.includes(clase.profesor?.id)
    let horaOk = true
    if (filtroHoraInicio.value && clase.hora_inicio < filtroHoraInicio.value) horaOk = false
    if (filtroHoraFin.value && clase.hora_inicio > filtroHoraFin.value) horaOk = false
    return diaOk && salaOk && profesorOk && horaOk
  })
})

const mostrarDialogClase = ref(false)
const modoEdicion = ref(false)
const claseForm = ref({
  id: null,
  dia_semana: '',
  hora_inicio: '',
  hora_fin: '',
  sala: '',
  cupo_maximo: 10,
  profesor_id: null
})

const openFilterDialog = () => { showFilterDialog.value = true }
const resetFilters = () => {
  filtroDias.value = []
  filtroSala.value = []
  filtroProfesor.value = []
  filtroHoraInicio.value = ''
  filtroHoraFin.value = ''
}

const fetchActividad = async () => {
  const { data } = await supabase
    .from('actividades')
    .select('*')
    .eq('id', actividadId)
    .single()
  actividad.value = data
}

const fetchClases = async () => {
  const { data } = await supabase
    .from('clases')
    .select(`
      *,
      profesor:usuarios ( id, nombre ),
      clase_alumnos (
        alumno:usuarios ( id, nombre, email )
      )
    `)
    .eq('actividad_id', actividadId)

  clases.value = data.map(c => ({
    ...c,
    alumnos: c.clase_alumnos.map(ca => ca.alumno)
  }))
}

const fetchProfesores = async () => {
  const { data } = await supabase.from('usuarios').select('id, nombre').eq('rol', 'profesor')
  profesores.value = data
}

const abrirNuevaClase = () => {
  modoEdicion.value = false
  claseForm.value = {
    id: null,
    dia_semana: '',
    hora_inicio: '',
    hora_fin: '',
    sala: '',
    cupo_maximo: 10
  }
  mostrarDialogClase.value = true
}

const abrirEditarClase = (clase) => {
  modoEdicion.value = true
  claseForm.value = {
    id: clase.id,
    dia_semana: clase.dia_semana,
    hora_inicio: clase.hora_inicio,
    hora_fin: clase.hora_fin,
    sala: clase.sala,
    cupo_maximo: clase.cupo_maximo,
    profesor_id: clase.profesor?.id || null
  }
  mostrarDialogClase.value = true
}

const guardarClase = async () => {
  if (modoEdicion.value) {
    await supabase.from('clases').update({
      dia_semana: claseForm.value.dia_semana,
      hora_inicio: claseForm.value.hora_inicio,
      hora_fin: claseForm.value.hora_fin,
      sala: claseForm.value.sala,
      cupo_maximo: claseForm.value.cupo_maximo
    }).eq('id', claseForm.value.id)
  } else {
    await supabase.from('clases').insert({
      actividad_id: actividadId,
      dia_semana: claseForm.value.dia_semana || null,
      hora_inicio: claseForm.value.hora_inicio || null,
      hora_fin: claseForm.value.hora_fin || null,
      sala: claseForm.value.sala || null,
      cupo_maximo: claseForm.value.cupo_maximo || 0,
      profesor_id: claseForm.value.profesor_id
    })
  }
  mostrarDialogClase.value = false
  await fetchClases()
}

const cerrarDialog = () => {
  mostrarDialogClase.value = false
}

const returnActivities = () => {
  router.push({ path: '/activities' })
}

onMounted(async () => {
  try {
    isLoading.value = true
    await Promise.all([
      fetchActividad(),
      fetchClases(),
      fetchProfesores()
    ])
  } finally {
    isLoading.value = false
  }
})
</script>
