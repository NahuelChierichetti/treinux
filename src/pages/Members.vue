<template>
  <Toast />
  <div class="flex flex-col md:flex-row flex-wrap md:items-end md:justify-between gap-4 mb-5">
    <div class="flex flex-col md:flex-row gap-2">
      <div class="flex gap-2">
        <button 
          class="px-4 py-2 border border-gray-300 text-gray-700 !bg-white rounded-md text-sm font-medium shadow-sm transition-colors flex items-center gap-2 w-auto"
          @click="openFilterDialog"
        >
        <Icon icon="tabler:filter" class="text-xs text-gray-400 cursor-pointer h-4 w-4" />
        Filtros
        </button>
        <button
          v-if="hasActiveFilters"
          class="text-sm font-medium text-gray-700"
          @click="clearFilters"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
    <div class="flex gap-2 justify-start sm:justify-end">
      <Button
        v-if="selectedIds.length > 1"
        label="Eliminar seleccionados"
        icon="pi pi-trash"
        class="btn-delete"
        severity="danger"
        @click="confirmDeleteMultiple"
      />
      <Button 
        @click="showOptions = true" 
        class="btn-treinux"
        label="Nuevo Alumno"
        icon="pi pi-plus"
        iconPos="left"
      />
    </div>
  </div>
  <div class="bg-white shadow rounded-lg p-6 overflox-x-auto w-full">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Listado de Alumnos</h2>
      <ApplicationPagination
        v-if="alumnos.length > 20"
        :currentPage="currentPage"
        :totalPages="totalPages"
        @update:currentPage="(page) => currentPage = page"
        class="mb-2"
      />
    </div>
    <div class="overflow-x-auto w-full">
      <ApplicationLoader v-if="loading" />
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr class="divide-x divide-gray-100">
            <th class="px-4 py-2">
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
            </th>
            <th class="flex justify-between px-4 py-3 text-left text-xs font-semibold text-[#f54b20] uppercase tracking-wider min-w-[180px]">
              <span>Nombre</span>
              <div class="relative">
                <Icon icon="tabler:filter" class="text-xs text-gray-400 cursor-pointer h-4 w-4" @click="toggleSortMenu" />
                <div
                  v-if="showSortMenu"
                  class="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow z-50"
                >
                  <div
                    class="text-sm px-3 text-gray-400 font-medium py-2 hover:bg-gray-100 cursor-pointer"
                    @click="sortBy = 'asc'; showSortMenu = false"
                  >
                    a - z
                  </div>
                  <div
                    class="text-sm px-3 py-2 text-gray-400 font-medium hover:bg-gray-100 cursor-pointer"
                    @click="sortBy = 'desc'; showSortMenu = false"
                  >
                    z - a
                  </div>
                </div>
              </div>
            </th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">DNI</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Ingreso</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">Estado Deuda</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ficha Médica</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="alumno in paginatedAlumnos" :key="alumno.id">
            <td class="px-4 py-2">
              <input type="checkbox" :value="alumno.id" v-model="selectedIds" />
            </td>
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
                {{ alumno.tiene_deuda ? 'Debe' : 'Al día' }}
              </span>
            </td>
            <td class="px-4 py-2 text-center">
              <FileText :class="[alumno.ficha_medica ? 'text-orange-500 cursor-pointer' : 'text-gray-300 disabled']" class="w-5 h-5 mx-auto" @click="viewFichaMedica(alumno.ficha_medica)"/>
            </td>
            <td class="px-4 py-2 flex gap-2 justify-center">
              <button class="px-2 py-1 text-sm text-gray-500" @click="editAlumno(alumno)">
                <Icon icon="tabler:edit" class="h-4 w-4" />
              </button>
              <button class="px-2 py-1 text-sm text-red-500" @click="confirmDelete(alumno)">
                <Icon icon="tabler:trash" class="h-4 w-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog 
      v-model:visible="showOptions" 
      header="Nuevo Alumno" 
      modal
      class="w-full md:w-1/2 mx-2 md:mx-0"
    >
      <div class="flex gap-4 py-4">
        <button 
          class="flex flex-col gap-2 w-full border-dashed border-[2px] px-4 py-6 rounded border-gray-100 hover:border-gray-200 !bg-white !text-gray-300 font-medium !font-sans" 
          @click="abrirManual"
        >
          <Icon icon="tabler:user-plus" class="w-8 h-8 mx-auto" />
          Crear usuario manual
        </button>
        <button 
          class="flex flex-col gap-2 w-full border-dashed border-[2px] px-4 py-6 rounded border-gray-100 hover:border-gray-200 !bg-white !text-gray-300 font-medium !font-sans"
          @click="openImport"
        >
          <Icon icon="tabler:cloud-upload" class="w-8 h-8 mx-auto" />
          Importar usuarios
        </button> 
      </div>
    </Dialog>

    <Dialog 
      v-model:visible="showForm" 
      header="Registrar nuevo alumno" 
      modal
      class="w-full md:w-1/2 mx-2 md:mx-0"
    >
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

          <div class="border border-gray-300 rounded-[3px] mt-3 p-4">
            <div class="flex flex-col gap-2">
              <label>Ficha médica</label>
              <label for="ficha-upload" class="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer w-max">
                Seleccionar archivo
              </label>
            </div>
  
            <input
              id="ficha-upload"
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              @change="handleFileUpload"
              hidden
            />
  
            <div class="flex flex-col w-full border rounded mt-3 max-h-32 overflow-y-auto">
              <div v-if="form.ficha_medica" class="flex justify-between items-center p-3 border-b">
                <span class="text-xs break-all">{{ form.ficha_medica.split('/').pop() }}</span>
                <div
                  class="w-6 h-6 rounded-full bg-slate-200 cursor-pointer flex items-center justify-center"
                  @click="form.ficha_medica = ''"
                >
                  <i class="pi pi-times text-sm"></i>
                </div>
              </div>
              <div v-else>
                <p class="text-xs p-3 text-gray-500">No hay archivos seleccionados.</p>
              </div>
            </div>
  
            <p class="text-xs font-medium text-blue-700 bg-blue-100 p-3 rounded mt-2">
              El archivo debe ser PDF, JPG o PNG. Tamaño máximo: 1 MB.
            </p>
          </div>

          <div v-if="isEditMode">
            <label>Estado de deuda</label>
            <select v-model="form.tiene_deuda" class="input-sm">
              <option :value="false">Sin deuda</option>
              <option :value="true">Con deuda</option>
            </select>
          </div>
        </div>

        <div class="flex justify-between gap-2 mt-4 w-full">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md text-sm font-medium shadow-sm transition-colors"
            @click="resetForm"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 border border-[#f54b20] text-white bg-[#f54b20] rounded-md text-sm font-medium shadow-sm transition-colors"
          >
            {{ isEditMode ? 'Actualizar alumno' : 'Crear usuario' }}
          </button>
        </div>
      </form>
    </Dialog>

    <Dialog 
      v-model:visible="showImportDialog" 
      header="Importar usuarios" 
      modal
      class="w-full md:w-1/2 mx-2 md:mx-0"
    >
      <div v-if="importStep === 1">
        <p class="text-xs text-gray-600 mb-3">Subí un archivo .CSV con los usuarios a importar.</p>
        <div class="flex flex-col gap-2">
          <label for="csv-upload" class="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer w-max">
            Seleccionar archivo
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            @change="handleCSVUpload"
            hidden
          />

          <div class="flex flex-col w-full border rounded mt-3 max-h-32 overflow-y-auto">
            <div v-if="selectedFileName" class="flex justify-between items-center p-3 border-b">
              <span class="text-xs">{{ selectedFileName }}</span>
              <div
                class="w-6 h-6 rounded-full bg-slate-200 cursor-pointer flex items-center justify-center"
                @click="clearSelectedFile"
              >
                <i class="pi pi-times text-sm"></i>
              </div>
            </div>
            <div v-else>
              <p class="text-xs p-3 text-gray-500">No hay archivos seleccionados.</p>
            </div>
          </div>

          <p class="text-xs font-medium text-blue-700 bg-blue-100 p-3 rounded mt-2">
            El archivo no debe superar los 25 MB.
          </p>
        </div>
      </div>

      <div v-else-if="importStep === 2">
        <p class="text-xs text-gray-600 mb-3">Emparejá las columnas del archivo con los campos del sistema:</p>
        <div v-for="field in expectedFields" :key="field.value" class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}</label>
          <Dropdown
            v-model="columnMapping[field.value]"
            :options="csvHeaders"
            placeholder="Seleccionar columna del CSV"
            class="w-full input-treinux"
          />
        </div>
        <div class="mt-4 flex items-center gap-2">
          <input type="checkbox" v-model="updateUsersExist" id="updateExisting" />
          <label for="updateExisting" class="text-sm text-gray-700">Actualizar usuarios existentes si ya existen</label>
        </div>
      </div>

      <div v-else-if="importStep === 3" class="flex flex-col items-center justify-center py-6 gap-4">
        <p class="text-sm text-gray-600">Importando usuarios...</p>

        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            class="bg-[#f54b20] h-3 transition-all duration-500 ease-out"
            :style="{ width: importProgress + '%' }"
          ></div>
        </div>

        <div v-if="importResult === 'success'" class="text-green-700 text-sm mt-4 text-center">
          <p class="font-semibold text-base mb-2">✅ ¡Importación exitosa!</p>
          <p v-if="importResumen.news > 0">{{ pluralize(importResumen.news, 'usuario importado', 'usuarios importados') }}</p>
          <p v-if="importResumen.updates > 0">{{ pluralize(importResumen.updates, 'usuario actualizado', 'usuarios actualizados') }}</p>
          <p v-if="importResumen.ignored > 0">{{ pluralize(importResumen.ignored, 'usuario ya existía y no fue modificado', 'usuarios ya existían y no fueron modificados') }}</p>
        </div>
        <p v-if="importResult === 'error'" class="text-red-600 font-medium mt-4">La importación falló. Intentalo nuevamente.</p>
      </div>

      <template #footer>
        <div class="flex justify-end w-full">
          <Button
            v-if="importStep === 3 && importResult"
            label="Finalizar importación"
            class="btn-treinux"
            @click="cancelarImportacion"
          />

          <template v-else>
            <div class="flex gap-2 justify-between w-full">
              <div>
                <Button
                  label="Cancelar"
                  class="p-button-text btn-cancelar"
                  @click="cancelarImportacion"
                />
              </div>
              <div class="flex gap-2">
                <Button
                  v-if="importStep > 1"
                  label="Atrás"
                  class="p-button-secondary btn-cancelar"
                  @click="importStep--"
                />
                <Button
                  v-if="importStep === 1"
                  label="Siguiente"
                  class="p-button-primary btn-treinux"
                  :disabled="!csvHeaders.length"
                  @click="importStep = 2"
                />
                <Button
                  v-if="importStep === 2"
                  label="Importar"
                  class="p-button-primary btn-treinux"
                  @click="importUsersFromCSV"
                />
              </div>
            </div>
          </template>
        </div>
      </template>
    </Dialog>
  </div>
  <DialogConfirmDelete
    v-model:visible="showConfirmDelete"
    @confirm="deleteAlumno"
  />
  <DialogConfirmDelete
    v-model:visible="showConfirmDeleteMultiple"
    :message="`¿Estás seguro que querés eliminar ${selectedIds.length} alumnos seleccionados?`"
    @confirm="deleteMultipleAlumnos"
  />
  <Dialog 
    v-model:visible="showFilterDialog" 
    header="Filtros de búsqueda"
    modal
    class="w-full md:w-1/2 mx-2 md:mx-0"
  >
    <div class="flex flex-col gap-4 py-4">
      <div class="flex flex-col gap-2">
        <label class="block text-sm font-medium text-gray-700">Buscar por nombre</label>
        <InputText
          v-model="searchTemp"
          placeholder="Buscar por nombre"
          class="border !px-4 !py-2 rounded w-full !border-gray-300 !focus:outline !focus:outline-[#f54b20] !focus:border-[#f54b20]"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="block text-sm font-medium text-gray-700">Estado de Deuda</label>
        <Dropdown
          v-model="filterDebtTemp"
          :options="opcionesDeuda"
          optionLabel="label"
          optionValue="value"
          placeholder="Filtrar por deuda"
          class="filter-deuda w-full !text-sm !px-4 !py-2 border !border-gray-300 rounded !leading-[0.5rem] !focus:outline-none !focus:ring-1 !focus:ring-[#f54b20] !focus:border-[#f54b20]"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="block text-sm font-medium text-gray-700">Fecha de ingreso</label>
        <Calendar
          v-model="filterJoinDateTemp"
          placeholder="Filtrar por fecha"
          selectionMode="range"
          dateFormat="dd/mm/yy"
          :maxDate="new Date()"
          class="w-full"
          showIcon
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="block text-sm font-medium text-gray-700">Ficha médica</label>
        <Dropdown
          v-model="filterMedicalRecordTemp"
          :options="medicalRecordOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Filtrar por ficha médica"
          class="filter-deuda w-full !text-sm !px-4 !py-2 border !border-gray-300 rounded !leading-[0.5rem] !focus:outline-none !focus:ring-1 !focus:ring-[#f54b20] !focus:border-[#f54b20]"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between gap-2">
        <button class="p-button-secondary btn-cancelar" @click="showFilterDialog = false" >Cerrar</button>
        <button class="p-button-primary btn-treinux" @click="applyFilters">Aplicar filtros</button>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { FileText, Pencil, Trash } from 'lucide-vue-next'
import ApplicationLoader from '../components/ui/ApplicationLoader.vue'
import ApplicationPagination from '../components/ui/ApplicationPagination.vue'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { supabase } from '@/supabase'
import { useStore } from 'vuex'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import DialogConfirmDelete from '../components/ui/DialogConfirmDelete.vue'
import { Icon } from '@iconify/vue'

const toast = useToast()
const store = useStore()
const alumnos = ref([])
const loading = ref(true)
const search = ref('')
const filterDebt = ref(null)
const showOptions = ref(false)
const showForm = ref(false)
const isEditMode = ref(false)
const alumnoSelected = ref(null)
const alumnoDeleted = ref(null)
const showConfirmDelete = ref(false)
const showImportDialog = ref(false)
const csvHeaders = ref([])
const csvData = ref([])
const columnMapping = ref({})
const importStep = ref(1)
const selectedFileName = ref('')
const importProgress = ref(0)
const importResult = ref(null)
const updateUsersExist = ref(false)
const filterJoinDate = ref(null)
const filterMedicalRecord = ref(null)
const sortBy = ref(null)
const showSortMenu = ref(false)
const selectedIds = ref([])
const selectAll = ref(false)
const showConfirmDeleteMultiple = ref(false)
const currentPage = ref(1)
const itemsPerPage = 20
const showFilterDialog = ref(false)
const searchTemp = ref('')
const filterDebtTemp = ref(null)
const filterJoinDateTemp = ref(null)
const filterMedicalRecordTemp = ref(null)

const paginatedAlumnos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredAlumnos.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(filteredAlumnos.value.length / itemsPerPage)
})

const toggleSortMenu = () => {
  showSortMenu.value = !showSortMenu.value
}

const opcionesDeuda = [
  { label: 'Todos', value: null },
  { label: 'Con deuda', value: true },
  { label: 'Sin deuda', value: false }
]

const expectedFields = [
  { label: 'Nombre', value: 'nombre' },
  { label: 'Email', value: 'email' },
  { label: 'Teléfono', value: 'telefono' },
  { label: 'DNI', value: 'dni' },
  { label: 'Fecha de ingreso', value: 'fecha_ingreso' },
  { label: 'Estado de deuda', value: 'tiene_deuda' },
  { label: 'Ficha médica', value: 'ficha_medica' }
]

const requiredFields = ['nombre', 'email', 'telefono', 'dni']

const importResumen = ref({
  news: 0,
  updates: 0,
  ignored: 0
})

const medicalRecordOptions = [
  { label: 'Todos', value: null },
  { label: 'Con ficha', value: true },
  { label: 'Sin ficha', value: false }
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

const filteredAlumnos = computed(() => {
  let result = alumnos.value.filter(alumno => {
    const matchName = alumno.nombre.toLowerCase().includes(search.value.toLowerCase())
    const matchDebt = filterDebt.value === null || alumno.tiene_deuda === filterDebt.value

    let matchJoinDate = true
    if (filterJoinDate.value && filterJoinDate.value.length === 2 && filterJoinDate.value[0] && filterJoinDate.value[1]) {
      const fechaIngreso = new Date(alumno.fecha_ingreso)
      const startDate = new Date(filterJoinDate.value[0])
      const endDate = new Date(filterJoinDate.value[1])
      matchJoinDate = fechaIngreso >= startDate && fechaIngreso <= endDate
    }

    const matchMedicalRecord =
      filterMedicalRecord.value === null ||
      (filterMedicalRecord.value === true && alumno.ficha_medica) ||
      (filterMedicalRecord.value === false && !alumno.ficha_medica)

    return matchName && matchDebt && matchJoinDate && matchMedicalRecord
  })

  if (sortBy.value === 'asc') {
    result.sort((a, b) => a.nombre.localeCompare(b.nombre))
  } else if (sortBy.value === 'desc') {
    result.sort((a, b) => b.nombre.localeCompare(a.nombre))
  }

  return result
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

  if (isEditMode.value && alumnoSelected.value?.id) {
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ ficha_medica: path })
      .eq('id', alumnoSelected.value.id)

    if (updateError) {
      console.error('Error al actualizar ficha médica:', updateError)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La ficha se subió pero no se pudo guardar en el alumno.',
        life: 4000
      })
      return
    }

    loadAlumnos()
  }
}

const submitAlumno = async () => {
  if (!form.value.nombre || !form.value.email || !form.value.telefono || !form.value.dni || !form.value.fecha_ingreso) {
    alert('Por favor completa todos los campos obligatorios.')
    return
  }

  try {
    if (isEditMode.value) {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: form.value.nombre,
          email: form.value.email,
          telefono: form.value.telefono,
          dni: form.value.dni,
          fecha_ingreso: form.value.fecha_ingreso,
          ficha_medica: form.value.ficha_medica,
          tiene_deuda: form.value.tiene_deuda,
        })
        .eq('id', alumnoSelected.value.id)

      if (error) throw error

      toast.add({
        severity: 'success',
        summary: 'Alumno actualizado',
        detail: 'El alumno fue actualizado exitosamente.',
        life: 3000
      })
    } else {
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
    }

    showForm.value = false
    isEditMode.value = false
    alumnoSelected.value = null
    form.value = {
      nombre: '',
      email: '',
      telefono: '',
      dni: '',
      fecha_ingreso: null,
      ficha_medica: '',
      tiene_deuda: null,
    }

    loadAlumnos()
  } catch (error) {
    console.error('Error:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo procesar la solicitud.',
      life: 4000
    })
  }
}

const resetForm = () => {
  showForm.value = false
  isEditMode.value = false
  alumnoSelected.value = null
  form.value = {
    nombre: '',
    email: '',
    telefono: '',
    dni: '',
    fecha_ingreso: null,
    ficha_medica: '',
    tiene_deuda: null,
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

const editAlumno = (alumno) => {
  form.value = { ...alumno  }
  isEditMode.value = true
  alumnoSelected.value = alumno
  showForm.value = true
}

const openFilterDialog = () => {
  searchTemp.value = search.value
  filterDebtTemp.value = filterDebt.value
  filterJoinDateTemp.value = filterJoinDate.value
  filterMedicalRecordTemp.value = filterMedicalRecord.value
  showFilterDialog.value = true
}

const applyFilters = () => {
  search.value = searchTemp.value
  filterDebt.value = filterDebtTemp.value
  filterJoinDate.value = filterJoinDateTemp.value
  filterMedicalRecord.value = filterMedicalRecordTemp.value
  showFilterDialog.value = false
}

const hasActiveFilters = computed(() => {
  return (
    search.value.trim() !== '' ||
    filterDebt.value !== null ||
    filterJoinDate.value !== null ||
    filterMedicalRecord.value !== null
  )
})

const clearFilters = () => {
  search.value = ''
  filterDebt.value = null
  filterJoinDate.value = null
  filterMedicalRecord.value = null

  searchTemp.value = ''
  filterDebtTemp.value = null
  filterJoinDateTemp.value = null
  filterMedicalRecordTemp.value = null
}

const confirmDeleteMultiple = () => {
  if (!selectedIds.value.length) return
    showConfirmDeleteMultiple.value = true
}

const deleteMultipleAlumnos = async () => {
  if (!selectedIds.value.length) return

  const { error } = await supabase
    .from('usuarios')
    .delete()
    .in('id', selectedIds.value)

  if (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron eliminar los alumnos.',
      life: 3000
    })
    return
  }

  toast.add({
    severity: 'success',
    summary: 'Alumnos eliminados',
    detail: 'Los alumnos fueron eliminados exitosamente.',
    life: 3000
  })

  selectedIds.value = []
  selectAll.value = false
  showConfirmDeleteMultiple.value = false
  loadAlumnos()
}

const confirmDelete = (alumno) => {
  alumnoDeleted.value = alumno
  showConfirmDelete.value = true
}

const deleteAlumno = async () => {
  if (!alumnoDeleted.value?.id) return

  const { error } = await supabase
   .from('usuarios')
   .delete()
   .eq('id', alumnoDeleted.value.id)
   
   if (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el alumno.',
      life: 3000
    })
    return
   }

  toast.add({
    severity: 'success',
    summary: 'Alumno eliminado',
    detail: 'El alumno fue eliminado exitosamente.',
    life: 3000
  })

  alumnoDeleted.value = null
  loadAlumnos()
}

const pluralize = (cantidad, singular, plural) => {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`
}

const openImport = () => {
  showOptions.value = false
  showImportDialog.value = true
  csvHeaders.value = []
  csvData.value = []
  columnMapping.value = {}
}

const handleCSVUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 25 * 1024 * 1024) {
    toast.add({
      severity: 'error',
      summary: 'Archivo muy grande',
      detail: 'El archivo supera los 25 MB permitidos.',
      life: 3000
    })
    return
  }

  selectedFileName.value = file.name

  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target.result
    const rows = text.trim().split('\n')
    csvHeaders.value = rows[0].split(',').map(h => h.trim())
    csvData.value = rows.slice(1).map(row => {
      const values = row.split(',').map(v => v.trim())
      const obj = {}
      csvHeaders.value.forEach((header, index) => {
        obj[header] = values[index] || ''
      })
      return obj
    })
  }
  reader.readAsText(file)
}

const parseBoolean = (value) => {
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase()
    return ['true', '1', 'sí', 'si'].includes(lower)
  }
  return Boolean(value)
}

const importUsersFromCSV = async () => {
  const requiredFields = ['nombre', 'email', 'telefono', 'dni']
  const unmappedRequired = requiredFields.filter(field => !columnMapping.value[field])

  if (unmappedRequired.length > 0) {
    toast.add({
      severity: 'error',
      summary: 'Campos requeridos faltantes',
      detail: `Faltan emparejar: ${unmappedRequired.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')}`,
      life: 3000
    })
    return
  }

  importStep.value = 3
  importProgress.value = 0
  importResult.value = null

  const simulateProgress = () => {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        importProgress.value = progress
        if (progress >= 100) {
          clearInterval(interval)
          resolve()
        }
      }, 500)
    })
  }

  await simulateProgress()

  const mappedData = columnMapping.value

  const registers = csvData.value.map(row => {
    const getColumn = (key) => {
      const col = mappedData[key]
      return col ? (row[col]?.trim() || '') : ''
    }

    return {
      nombre: getColumn('nombre'),
      email: getColumn('email'),
      telefono: getColumn('telefono'),
      dni: getColumn('dni'),
      fecha_ingreso: getColumn('fecha_ingreso') || new Date().toISOString(),
      ficha_medica: getColumn('ficha_medica') || null,
      tiene_deuda: mappedData['tiene_deuda']
        ? parseBoolean(getColumn('tiene_deuda'))
        : false,
      rol: 'alumno',
      gym_id: currentGimnasio.value.id
    }
  })

  try {
    const emails = registers.map(u => u.email).filter(Boolean)

    const { data: existing, error: fetchError } = await supabase
      .from('usuarios')
      .select('*')
      .in('email', emails)

    if (fetchError) throw fetchError

    const news = []
    const updates = []

    for (const user of registers) {
      const exist = existing.find(e => e.email === user.email)
      if (exist) {
        if (updateUsersExist.value) {
          const hasChanges = ['nombre', 'telefono', 'dni', 'fecha_ingreso', 'tiene_deuda', 'ficha_medica'].some(
            input => user[input] && user[input] !== exist[input]
          )
          if (hasChanges) {
            updates.push({ ...user, id: exist.id })
          }
        }
      } else {
        news.push(user)
      }
    }

    if (news.length > 0) {
      const { error: insertError } = await supabase.from('usuarios').insert(news)
      if (insertError) throw insertError
    }

    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('usuarios')
        .update(update)
        .eq('id', update.id)
      if (updateError) throw updateError
    }

    importResumen.value = {
      news: news.length,
      updates: updates.length,
      ignored: registers.length - news.length - updates.length
    }
    importResult.value = 'success'
    loadAlumnos()
  } catch (err) {
    console.error('Error en importación:', err)
    importResult.value = 'error'
  }
}


const cancelarImportacion = () => {
  showImportDialog.value = false
  importStep.value = 1
  selectedFileName.value = ''
  csvHeaders.value = []
  csvData.value = []
  columnMapping.value = {}
}

const clearSelectedFile = () => {
  selectedFileName.value = ''
  csvHeaders.value = []
  csvData.value = []
  columnMapping.value = {}
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedIds.value = filteredAlumnos.value.map(alumno => alumno.id)
  } else {
    selectedIds.value = []
  }
}

onMounted(() => {
  loadAlumnos()
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.relative')) {
      showSortMenu.value = false
    }
  })
})
</script>
<style>
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

.btn-cancelar{
  padding: 0.5rem 1rem !important; /* py-2 px-4 */
  border: 1px solid #d1d5db !important; /* border-gray-300 */
  color: #374151 !important; /* text-gray-700 */
  background-color: #ffffff !important; /* bg-white */
  border-radius: 0.375rem !important; /* rounded-md (6px) */
  font-size: 0.875rem !important; /* text-sm */
  font-weight: 500 !important; /* font-medium */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; /* shadow-sm */
  transition: color 0.2s, background-color 0.2s, border-color 0.2s !important;
}

.btn-delete{
  padding: 0.5rem 1rem !important; /* py-2 px-4 */
  border: 1px solid #ef4444 !important; /* border-gray-300 */
  color: #ffffff !important; /* text-gray-700 */
  background-color: #ef4444 !important; /* bg-white */
  border-radius: 0.375rem !important; /* rounded-md (6px) */
  font-size: 0.875rem !important; /* text-sm */
  font-weight: 500 !important; /* font-medium */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; /* shadow-sm */
  transition: color 0.2s, background-color 0.2s, border-color 0.2s !important;
}

.btn-treinux{
  padding: 0.5rem 1rem!important; /* py-2 px-4 */
  border: 1px solid #f54b20!important; /* border-red-500 */
  color: #ffffff!important; /* text-white */
  background-color: #f54b20!important; /* bg-red-500 */
  border-radius: 0.375rem!important; /* rounded-md (6px) */
  font-size: 0.875rem!important; /* text-sm */
  font-weight: 500!important; /* font-medium */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)!important; /* shadow-sm */
  transition: color 0.2s, background-color 0.2s, border-color 0.2s!important;
}

</style>