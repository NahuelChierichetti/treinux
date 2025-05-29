<template>
  <Toast />
  <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
    <div class="flex flex-col md:flex-row gap-2">
      <div class="flex flex-col gap-2">
        <label class="block text-sm font-medium text-gray-700">Buscar por nombre</label>
        <InputText
          v-model="search"
          placeholder="Buscar por nombre"
          class="border !px-4 !py-2 rounded w-full md:w-64 !border-gray-300 !focus:outline !focus:outline-[#f54b20] !focus:border-[#f54b20]"
        />
      </div>
    </div>
  </div>

  <div class="bg-white shadow rounded-lg p-6 overflow-x-auto w-full">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Asistencias</h2>
      <ApplicationPagination
        v-if="usuarios.length > 20"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:currentPage="(page) => currentPage = page"
        class="mb-2"
      />
    </div>

    <ApplicationLoader v-if="loading" />
    <table v-else class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr class="divide-x divide-gray-100">
          <th class="px-4 py-3 text-left text-xs font-semibold text-[#f54b20] uppercase tracking-wider">Nombre</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Turno</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Asistencias</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="usuario in paginatedUsuarios" :key="usuario.id">
          <td class="px-4 py-3 text-slate-700 text-sm font-normal">{{ usuario.nombre }}</td>
          <td class="px-4 py-2 text-slate-400 italic text-sm">Sin asignar</td>
          <td class="px-4 py-2">
            <div class="flex gap-2">
              <span
                v-for="(asistencia, index) in usuario.asistencias"
                :key="index"
                :class="[
                  'w-6 h-6 rounded-full text-xs flex items-center justify-center font-semibold',
                  asistencia.estado === 'P' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                ]"
              >
                {{ asistencia.estado }}
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import ApplicationLoader from '../components/ui/ApplicationLoader.vue'
import ApplicationPagination from '../components/ui/ApplicationPagination.vue'

const toast = useToast()
const usuarios = ref([])
const loading = ref(true)
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 20

const paginatedUsuarios = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredUsuarios.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsuarios.value.length / itemsPerPage)
})

const filteredUsuarios = computed(() => {
  return usuarios.value.filter((u) =>
    u.nombre.toLowerCase().includes(search.value.toLowerCase())
  )
})

const loadUsuarios = async () => {
  loading.value = true
  try {
    const { data: alumnos, error } = await supabase
      .from('usuarios')
      .select('id, nombre')
      .eq('rol', 'alumno')

    if (error) throw error

    const { data: asistenciasData, error: asistenciasError } = await supabase
      .from('asistencias')
      .select('user_id, fecha, estado')

    if (asistenciasError) throw asistenciasError

    usuarios.value = alumnos.map((u) => {
      const asistenciasUsuario = asistenciasData
        .filter((a) => a.user_id === u.id)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5)

      return {
        ...u,
        asistencias: asistenciasUsuario,
      }
    })
  } catch (err) {
    console.error('Error cargando usuarios o asistencias:', err)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos.',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsuarios()
})
</script>