<template>
  <Toast />
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-bold">Rutinas de Entrenamiento</h2>
    <div class="flex gap-3">
      <Button 
        @click="agregarBloque" 
        class="btn-treinux"
        label="Agregar Bloque"
        icon="pi pi-plus"
        iconPos="left"
      />
      <button 
        @click="showAIModal = true" 
        class="!bg-gradient-to-r !from-orange-400 !to-red-600 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-md transition-all duration-300 flex items-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
        label="Generar con IA"
        icon="pi pi-sparkles"
        iconPos="left"
      >
        <Icon icon="tabler:sparkles" class="w-5 h-5" />
        Generar con IA
      </button>
    </div>
  </div>

  <div class="bg-white shadow rounded-lg p-6">
    <!-- Lista de bloques -->
    <div v-if="rutina.bloques.length === 0" class="text-center py-12">
      <div class="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
        <i class="pi pi-plus-circle text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-semibold text-gray-600 mb-2">No hay bloques de ejercicios</h3>
        <p class="text-gray-500 mb-4">Comienza agregando un bloque o genera una rutina con IA</p>
      </div>
    </div>
        
    <draggable v-model="rutina.bloques" item-key="id" class="space-y-4" handle=".drag-handle">
      <template #item="{element, index}">
        <div class="border rounded-lg shadow-sm bg-white">
          <!-- Header del bloque -->
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="drag-handle cursor-move p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <i class="pi pi-bars text-gray-400"></i>
              </div>
              <div class="flex-1">
                <InputText 
                  v-model="element.nombre" 
                  placeholder="Nombre del bloque (ej: Calentamiento, Fuerza, Cardio)" 
                  class="w-full text-lg font-semibold border border-gray-300 rounded-md px-3 py-2" 
                />
              </div>
              <button 
                @click="eliminarBloque(index)" 
                class="btn-delete p-2 rounded-lg">
                <i class="pi pi-trash text-sm"></i>
              </button>
            </div>
          </div>
          
          <!-- Ejercicios del bloque -->
          <div class="p-4">
            <div v-if="element.ejercicios.length === 0" class="text-center py-6">
              <i class="pi pi-dumbbell text-2xl text-gray-400 mb-2"></i>
              <p class="text-gray-500 text-sm">No hay ejercicios en este bloque</p>
            </div>
            
            <div class="space-y-3">
              <div v-for="(ejercicio, j) in element.ejercicios" :key="j" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="flex items-center gap-3">
                  <div class="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label class="text-xs font-medium text-gray-600 mb-1 block">Ejercicio</label>
                      <InputText 
                        v-model="ejercicio.nombre" 
                        placeholder="Ej: Sentadillas, Press de banca" 
                        class="w-full border border-gray-300 rounded-md px-3 py-2" 
                      />
                    </div>
                    <div>
                      <label class="text-xs font-medium text-gray-600 mb-1 block">Series y repeticiones</label>
                      <InputText 
                        v-model="ejercicio.detalle" 
                        placeholder="Ej: 3x12, 4x8, 30 seg" 
                        class="w-full border border-gray-300 rounded-md px-3 py-2" 
                      />
                    </div>
                  </div>
                  <button 
                    @click="eliminarEjercicio(index, j)" 
                    class="btn-delete p-2 rounded-lg">
                    <i class="pi pi-times text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              @click="agregarEjercicio(index)" 
              class="mt-4 w-full btn-treinux flex items-center justify-center gap-2">
              <i class="pi pi-plus text-sm"></i>
              Agregar Ejercicio
            </button>
          </div>
        </div>
      </template>
    </draggable>

    
    <!-- Sección de asignación y guardado -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div>
          <label class="text-sm font-medium text-gray-700 mb-2 block">Asignar rutina a alumno</label>
          <Dropdown 
            v-model="rutina.usuario_id" 
            :options="alumnos" 
            option-label="nombre" 
            option-value="id" 
            placeholder="Seleccionar alumno" 
            class="w-full border border-gray-300 rounded-md" 
          />
        </div>
        <div class="flex justify-end">
          <Button 
            @click="guardarRutina" 
            :disabled="!rutina.usuario_id || rutina.bloques.length === 0"
            :class="[
              'btn-treinux',
              (!rutina.usuario_id || rutina.bloques.length === 0) 
                ? '!bg-gray-300 !text-gray-500 cursor-not-allowed' 
                : ''
            ]"
            label="Guardar Rutina"
            icon="pi pi-save"
            iconPos="left"
          />
        </div>
      </div>
    </div>
  </div>
  <!-- Modal de IA estilo Chat LLM -->
  <Dialog v-model:visible="showAIModal" modal :style="{width: '60rem'}" :breakpoints="{'1199px': '85vw', '575px': '95vw'}" :closable="true">
    <template #header>
      <div class="flex items-end gap-3 w-full bg-white border-b border-gray-200 p-4 -m-4 mb-0 mr-2">
        <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
          <Icon icon="tabler:robot" class="w-4 h-4" />
        </div>
        <span class="text-lg font-semibold text-gray-800">Asistente de Rutinas IA</span>
        <div class="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
        </div>
      </div>
    </template>
    
    <div class="min-h-[500px] -mx-4 -mb-4">
      <!-- Chat Container -->
      <div class="flex flex-col h-[500px]">
        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <!-- AI Welcome Message -->
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
              IA
            </div>
            <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p class="text-gray-700 leading-relaxed">
                ¡Hola! Soy tu asistente de entrenamiento. Describe el tipo de rutina que necesitas y la crearé especialmente para ti.
              </p>
            </div>
          </div>
          
          <!-- User Message -->
          <div v-if="userMessage" class="flex items-start gap-3 justify-end">
            <div class="bg-orange-500 rounded-lg p-4 shadow-sm border border-orange-200 max-w-xs">
              <p class="text-white leading-relaxed">
                {{ userMessage }}
              </p>
            </div>
            <div class="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
              TU
            </div>
          </div>
          
          <!-- Rutina Generada -->
          <div v-if="aiRoutine.length > 0" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div class="space-y-3">
              <div v-for="(bloque, idx) in aiRoutine" :key="idx" class="bg-white rounded-lg p-3 border border-gray-200">
                <h4 class="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <div class="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-semibold">
                    {{ idx + 1 }}
                  </div>
                  {{ bloque.nombre }}
                </h4>
                <div class="space-y-1 ml-8">
                  <div v-for="(ejercicio, ejIdx) in bloque.ejercicios" :key="ejIdx" class="text-sm text-gray-600">
                    • <span class="font-medium">{{ ejercicio.nombre }}</span>
                    <span v-if="ejercicio.detalle" class="text-orange-600 ml-1">({{ ejercicio.detalle }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- AI Loading Response -->
          <div v-if="aiLoading" class="flex items-start gap-3">
            <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
              IA
            </div>
            <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div class="flex items-center gap-2">
                <div class="flex gap-1">
                  <div class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
                <span class="text-gray-600 text-sm">Generando rutina...</span>
              </div>
            </div>
          </div>
          

        </div>
        
        <!-- Input Area -->
        <div class="border-t border-gray-200 p-4 bg-white">
          <div class="flex gap-3">
            <div class="flex-1">
              <textarea 
                v-model="aiPrompt" 
                rows="2" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 resize-none" 
                placeholder="Describe la rutina que necesitas (ej: rutina de fuerza para principiantes, 3 días por semana...)" 
                :disabled="aiLoading"
                @keydown.enter.prevent="!aiLoading && aiPrompt.trim() && generarRutinaAI()"
              ></textarea>
            </div>
            <button 
               @click="generarRutinaAI"
               :disabled="!aiPrompt.trim() || aiLoading" 
               :class="[
                 'w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center',
                 aiPrompt.trim() && !aiLoading 
                   ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow-md' 
                   : 'bg-gray-300 text-gray-500 cursor-not-allowed'
               ]">
               <Icon icon="tabler:send" class="w-5 h-5" />
             </button>
          </div>
          
          <!-- Action Buttons -->
          <div v-if="aiRoutine.length > 0" class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <button 
              @click="reiniciarChat"
              class="p-button-secondary btn-cancelar flex items-center gap-2 !px-4 !py-2 rounded-md"
            >
              <Icon icon="tabler:refresh" class="w-4 h-4" />
              Nueva rutina
            </button>
            <button 
              @click="agregarAIRutina" 
              class="!bg-gradient-to-r !from-orange-400 !to-red-600 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-md transition-all duration-300 flex items-center gap-2 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
            >
              <Icon icon="tabler:plus" class="w-5 h-5" />
              Agregar a Rutina
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- <template #footer>
      <div class="flex justify-end">
        <Button 
          @click="showAIModal = false; aiPrompt = ''; aiRoutine = []" 
          label="Cerrar"
          icon="pi pi-times"
          iconPos="left"
          class="p-button-outlined"
        />
      </div>
    </template> -->
  </Dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { supabase } from '@/supabase'
import draggable from 'vuedraggable'
import Dialog from 'primevue/dialog'
import { Icon } from '@iconify/vue'
import ApplicationLoader from '../components/ui/ApplicationLoader.vue'
import { useStore } from 'vuex'

const toast = useToast()
const store = useStore()
const rutina = ref({ bloques: [], usuario_id: null })
const alumnos = ref([])

const currentGimnasio = computed(() => store.getters.getCurrentGimnasio)

const showAIModal = ref(false)
const aiPrompt = ref("")
const aiLoading = ref(false)
const aiRoutine = ref([])
const userMessage = ref("")

async function generarRutinaAI() {
  if (!aiPrompt.value.trim()) return
  
  aiLoading.value = true
  aiRoutine.value = []
  
  const currentPrompt = aiPrompt.value
  userMessage.value = currentPrompt // Guardar el mensaje del usuario
  aiPrompt.value = "" // Limpiar el input después de guardar
  
  try {
    const response = await fetch('https://treinux-production.up.railway.app/api/generate-routine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        prompt: currentPrompt
      })
    })
    const data = await response.json()
    
    // Intenta parsear el JSON generado por la IA
    let rutinaJson = data.result
    let aiTextResponse = data.textResponse || ''
    if (typeof rutinaJson === 'string') {
      try {
        // Eliminar comillas adicionales si existen
        if (rutinaJson.startsWith('"') && rutinaJson.endsWith('"')) {
          rutinaJson = rutinaJson.substring(1, rutinaJson.length - 1)
        }
        // Reemplazar escapes de comillas si existen
        rutinaJson = rutinaJson.replace(/\\\"|\\"/g, '"')
        rutinaJson = JSON.parse(rutinaJson)
      } catch (parseError) {
        console.error('Error al parsear JSON:', parseError)
        console.log('Contenido que no se pudo parsear:', rutinaJson)
        aiRoutine.value = ['Error al parsear la respuesta de la IA']
        aiLoading.value = false
        return
      }
    }
    
    console.log('Rutina JSON recibida:', rutinaJson)
    
    // Transformar la estructura recibida al formato esperado
    if (Array.isArray(rutinaJson)) {
      aiRoutine.value = rutinaJson
    } else if (rutinaJson.bloques) {
      aiRoutine.value = rutinaJson.bloques
    } else if (rutinaJson.rutina && rutinaJson.rutina.bloques) {
      aiRoutine.value = rutinaJson.rutina.bloques
    } else {
      // Intentar convertir cualquier otro formato de objeto a bloques
      const bloques = []
      
      // Caso: { rutina_pecho: { bloque_1: {...}, bloque_2: {...} } }
      Object.keys(rutinaJson).forEach(rutinaKey => {
        const rutina = rutinaJson[rutinaKey]
        if (typeof rutina === 'object') {
          // Si es un objeto con bloques numerados (bloque_1, bloque_2, etc.)
          if (Object.keys(rutina).some(key => key.startsWith('bloque_'))) {
            const bloque = {
              nombre: rutinaKey.replace('rutina_', '').replace(/_/g, ' ').toUpperCase(),
              ejercicios: []
            }
            
            Object.keys(rutina).forEach(bloqueKey => {
              if (bloqueKey.startsWith('bloque_')) {
                const ejercicio = rutina[bloqueKey]
                bloque.ejercicios.push({
                  nombre: ejercicio.ejercicio || ejercicio.nombre || 'Ejercicio sin nombre',
                  detalle: ejercicio.detalle || 
                          (ejercicio.series && ejercicio.repeticiones ? 
                           `${ejercicio.series}x${ejercicio.repeticiones}` : '')
                })
              }
            })
            
            bloques.push(bloque)
          }
        }
      })
      
      if (bloques.length > 0) {
        aiRoutine.value = bloques
      } else {
        aiRoutine.value = [{ 
          nombre: 'Rutina generada', 
          ejercicios: [{ nombre: 'No se pudo interpretar la rutina. Formato no reconocido.', detalle: '' }] 
        }]
      }
    }
    
    // Rutina generada exitosamente
    
  } catch (e) {
    console.error('Error al generar rutina:', e)
    aiRoutine.value = [{ 
      nombre: 'Error', 
      ejercicios: [{ nombre: 'Error al generar rutina', detalle: e.message || '' }] 
    }]
    
    // Error al generar rutina
  }
  aiLoading.value = false
}
function agregarAIRutina() {
  if (!aiRoutine.value.length) return
  
  // Agregar cada bloque de la rutina generada a la rutina actual
  aiRoutine.value.forEach(bloque => {
    // Verificar que el bloque tenga la estructura esperada
    if (bloque && typeof bloque === 'object') {
      rutina.value.bloques.push({
        id: Date.now() + Math.random(), // ID único
        nombre: bloque.nombre || 'Bloque IA',
        ejercicios: Array.isArray(bloque.ejercicios) ? bloque.ejercicios.map(ej => {
          // Si el ejercicio es un objeto con nombre y detalle
          if (ej && typeof ej === 'object') {
            return {
              nombre: ej.nombre || '',
              detalle: ej.detalle || ej.descripcion || ''
            }
          } 
          // Si el ejercicio es solo un string
          else if (typeof ej === 'string') {
            return { nombre: ej, detalle: '' }
          }
          // Caso por defecto
          return { nombre: '', detalle: '' }
        }) : []
      })
    }
    // Si el bloque es solo un string (caso de error o mensaje)
    else if (typeof bloque === 'string') {
      rutina.value.bloques.push({
        id: Date.now() + Math.random(), // ID único
        nombre: 'Bloque IA',
        ejercicios: [{ nombre: bloque, detalle: '' }]
      })
    }
  })
  
  showAIModal.value = false
  aiPrompt.value = ""
  aiRoutine.value = []
  userMessage.value = "" // Limpiar también el mensaje del usuario
}

function reiniciarChat() {
  aiPrompt.value = ''
  aiRoutine.value = []
  aiLoading.value = false
  userMessage.value = '' // Limpiar también el mensaje del usuario
}

function agregarBloque() {
  rutina.value.bloques.push({ 
    id: Date.now() + Math.random(), // ID único
    nombre: '', 
    ejercicios: [] 
  })
}
function eliminarBloque(i) {
  rutina.value.bloques.splice(i, 1)
}
function agregarEjercicio(i) {
  rutina.value.bloques[i].ejercicios.push({ nombre: '', detalle: '' })
}
function eliminarEjercicio(i, j) {
  rutina.value.bloques[i].ejercicios.splice(j, 1)
}

async function cargarAlumnos() {
  if (!currentGimnasio.value?.id) {
    console.warn('No hay gimnasio seleccionado')
    return
  }
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, rol, gym_id')
    .eq('rol', 'alumno')
    .eq('gym_id', currentGimnasio.value.id)
    
  if (!error) {
    alumnos.value = data
  } else {
    console.error('Error al cargar alumnos:', error)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'No se pudieron cargar los alumnos', 
      life: 3000 
    })
  }
}

async function guardarRutina() {
  if (!rutina.value.usuario_id || rutina.value.bloques.length === 0) {
    toast.add({ 
      severity: 'warn', 
      summary: 'Campos requeridos', 
      detail: 'Selecciona un alumno y agrega al menos un bloque de ejercicios', 
      life: 3000 
    })
    return
  }
  
  if (!currentGimnasio.value?.id) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'No hay gimnasio seleccionado', 
      life: 3000 
    })
    return
  }
  
  try {
    const { error } = await supabase.from('rutinas').insert({
      usuario_id: rutina.value.usuario_id,
      gym_id: currentGimnasio.value.id,
      bloques: rutina.value.bloques,
      fecha_creacion: new Date().toISOString(),
      activa: true
    })
    
    if (!error) {
      toast.add({ 
        severity: 'success', 
        summary: 'Rutina guardada', 
        detail: 'La rutina se asignó correctamente al alumno', 
        life: 3000 
      })
      rutina.value = { bloques: [], usuario_id: null }
    } else {
      console.error('Error al guardar rutina:', error)
      toast.add({ 
        severity: 'error', 
        summary: 'Error al guardar', 
        detail: error.message || 'No se pudo guardar la rutina', 
        life: 4000 
      })
    }
  } catch (error) {
    console.error('Error inesperado:', error)
    toast.add({ 
      severity: 'error', 
      summary: 'Error inesperado', 
      detail: 'Ocurrió un error al guardar la rutina', 
      life: 4000 
    })
  }
}

onMounted(() => {
  cargarAlumnos()
})
</script>
  