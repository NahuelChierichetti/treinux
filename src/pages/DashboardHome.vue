<template>
  <div class="flex flex-col gap-6">
    <div class="flex w-full justify-between items-center mb-6">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-bold">Dashboard</h2>
        <p class="text-gray-500 text-sm">Bienvenido de nuevo, {{ userName }}</p>
      </div>
      <Button class="btn-treinux" label="Acción Rápida" icon="pi pi-plus" iconPos="left" @click="showQuickAction = true" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded shadow p-6 flex flex-col gap-2">
        <span class="text-gray-500 text-sm">Total Alumnos</span>
        <span class="text-3xl font-bold">{{ metrics.totalAlumnos }}</span>
        <span class="text-green-600 text-xs">+{{ metrics.alumnosCrecimiento }}% este mes</span>
      </div>
      <div class="bg-white rounded shadow p-6 flex flex-col gap-2">
        <span class="text-gray-500 text-sm">Asistencias Hoy</span>
        <span class="text-3xl font-bold">{{ metrics.asistenciasHoy }}</span>
        <span class="text-orange-600 text-xs">Último: {{ metrics.ultimaAsistencia }}</span>
      </div>
      <div class="bg-white rounded shadow p-6 flex flex-col gap-2">
        <span class="text-gray-500 text-sm">Ingresos Mes</span>
        <span class="text-3xl font-bold">${{ metrics.ingresosMes.toLocaleString() }}</span>
        <span class="text-green-600 text-xs">+{{ metrics.ingresosCrecimiento }}% vs anterior</span>
      </div>
      <div class="bg-white rounded shadow p-6 flex flex-col gap-2">
        <span class="text-gray-500 text-sm">Clases Activas</span>
        <span class="text-3xl font-bold">{{ metrics.clasesActivas }}</span>
        <span class="text-gray-500 text-xs">{{ metrics.clasesEnCurso }} en curso</span>
      </div>
    </div>

    <div class="bg-white rounded shadow p-6 mt-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button class="flex flex-col gap-2 w-full border-dashed border-2 px-4 py-6 rounded border-gray-100 hover:border-gray-200 bg-white text-gray-500 font-medium font-sans" @click="nuevoAlumno">
          <Icon icon="tabler:user-plus" class="w-8 h-8 mx-auto" />
          Nuevo Alumno
        </button>
        <button class="flex flex-col gap-2 w-full border-dashed border-2 px-4 py-6 rounded border-gray-100 hover:border-gray-200 bg-white text-gray-500 font-medium font-sans" @click="marcarAsistencia">
          <Icon icon="tabler:check" class="w-8 h-8 mx-auto" />
          Marcar Asistencia
        </button>
        <button class="flex flex-col gap-2 w-full border-dashed border-2 px-4 py-6 rounded border-gray-100 hover:border-gray-200 bg-white text-gray-500 font-medium font-sans" @click="nuevaRutina">
          <Icon icon="tabler:clipboard-list" class="w-8 h-8 mx-auto" />
          Nueva Rutina
        </button>
        <button class="flex flex-col gap-2 w-full border-dashed border-2 px-4 py-6 rounded border-gray-100 hover:border-gray-200 bg-white text-gray-500 font-medium font-sans" @click="crearClase">
          <Icon icon="tabler:calendar-plus" class="w-8 h-8 mx-auto" />
          Crear Clase
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <div class="bg-white rounded shadow p-6">
        <h3 class="font-semibold mb-4">Actividad Reciente</h3>
        <ul class="flex flex-col gap-2">
          <li v-for="(item, idx) in actividadReciente" :key="idx" class="flex items-center gap-2 text-sm">
            <Icon :icon="item.icon" class="w-4 h-4" :class="item.color" />
            <span class="font-medium">{{ item.texto }}</span>
            <span class="text-xs text-gray-400 ml-auto">{{ item.tiempo }}</span>
          </li>
        </ul>
      </div>
      <div class="bg-white rounded shadow p-6">
        <h3 class="font-semibold mb-4">Notificaciones <span class="ml-2 text-xs text-red-500">{{ notificaciones.length }} nuevas</span></h3>
        <ul class="flex flex-col gap-2">
          <li v-for="(n, idx) in notificaciones" :key="idx" class="rounded p-2 text-sm" :class="n.color">
            <span class="font-semibold">{{ n.titulo }}</span> <span>{{ n.descripcion }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import { Icon } from '@iconify/vue'

const userName = 'Carlos' // Reemplazar por usuario real
const showQuickAction = ref(false)

const metrics = ref({
  totalAlumnos: 248,
  alumnosCrecimiento: 12,
  asistenciasHoy: 89,
  ultimaAsistencia: '14:30',
  ingresosMes: 45200,
  ingresosCrecimiento: 8,
  clasesActivas: 12,
  clasesEnCurso: 6
})

const actividadReciente = ref([
  { icon: 'tabler:user', texto: 'María González se registró', tiempo: 'Hace 2 minutos', color: 'text-green-500' },
  { icon: 'tabler:calendar-event', texto: 'Clase de Yoga programada', tiempo: 'Hace 15 minutos', color: 'text-blue-500' },
  { icon: 'tabler:credit-card', texto: 'Pago recibido – $2,500', tiempo: 'Hace 1 hora', color: 'text-yellow-500' }
])

const notificaciones = ref([
  { titulo: 'Vencimiento de membresía', descripcion: '5 alumnos vencen esta semana', color: 'bg-red-100 text-red-700' },
  { titulo: 'Clase por comenzar', descripcion: 'Crossfit a las 15:00', color: 'bg-yellow-100 text-yellow-700' },
  { titulo: 'Actualización disponible', descripcion: 'Nueva versión del sistema', color: 'bg-blue-100 text-blue-700' }
])

function nuevoAlumno() {
  // Navegar a crear alumno
}
function marcarAsistencia() {
  // Navegar a marcar asistencia
}
function nuevaRutina() {
  // Navegar a crear rutina
}
function crearClase() {
  // Navegar a crear clase
}
</script>