<template>
    <Dialog v-model:visible="internalVisible" :header="`Gestionar miembros de la clase`" modal class="w-[600px]">

        <!-- Alumnos ya inscriptos -->
        <div class="mb-5">
            <h3 class="font-semibold mb-2">Alumnos Inscriptos ({{ selectedAlumnos.length }}/{{ clase?.cupo_maximo }})
            </h3>
            <div class="flex flex-col gap-2">
                <div v-for="alumno in alumnosInscriptos" :key="alumno.id"
                    class="flex justify-between items-center border border rounded p-3">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-gray-500 font-semibold">
                            {{ alumno.nombre.substring(0, 2).toUpperCase() }}
                        </div>
                        <div class="flex flex-col">
                            <span class="font-medium text-slate-700">{{ alumno.nombre }}</span>
                            <span class="text-gray-400 text-sm">{{ alumno.email }}</span>
                        </div>
                    </div>
                    <button @click="quitarAlumno(alumno.id)" class="px-3 py-2 text-red-500 rounded-md">
                        <Icon icon="tabler:user-x" class="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Alumnos disponibles para agregar -->
        <div>
            <h3 class="font-semibold mb-2">Alumnos disponibles</h3>
            <InputText v-model="search" placeholder="Buscar alumnos..." class="w-full mb-3" />

            <div class="flex flex-col gap-2">
                <div v-for="alumno in filteredDisponibles" :key="alumno.id"
                    class="flex justify-between items-center bg-white border rounded p-3">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-gray-500 font-semibold">
                            {{ alumno.nombre.substring(0, 2).toUpperCase() }}
                        </div>
                        <div class="flex flex-col">
                            <span class="font-medium text-slate-700">{{ alumno.nombre }}</span>
                            <span class="text-gray-400 text-sm">{{ alumno.email }}</span>
                        </div>
                    </div>
                    <button @click="agregarAlumno(alumno.id)" class="px-3 py-2 text-green-500 rounded-md">
                        <Icon icon="tabler:user-plus" class="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-between w-full">
                <button class="p-button-secondary btn-cancelar" @click="internalVisible = false">Cerrar</button>
                <button class="btn-treinux" @click="guardarCambios">Guardar Cambios</button>
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '@/supabase'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import { Icon } from '@iconify/vue'
import { useStore } from 'vuex'

const props = defineProps({ visible: Boolean, clase: Object })
const emit = defineEmits(['update:visible', 'reloadClases'])

const store = useStore()
const gymId = computed(() => store.getters.getCurrentGimnasio.id)
const alumnos = ref([])
const search = ref('')
const selectedAlumnos = ref([])

const internalVisible = ref(props.visible)
watch(() => props.visible, (val) => { internalVisible.value = val })
watch(internalVisible, (val) => {
    emit('update:visible', val)
    if (val) {
        fetchAlumnos()
        inicializarSeleccion()
    }
})

const fetchAlumnos = async () => {
    const { data } = await supabase.from('usuarios').select('*').eq('rol', 'alumno').eq('gym_id', gymId.value)
    alumnos.value = data
}

const inicializarSeleccion = () => {
    selectedAlumnos.value = props.clase.alumnos?.map(a => a.id) ?? []
}

const alumnosInscriptos = computed(() =>
    alumnos.value.filter(a => selectedAlumnos.value.includes(a.id))
)

const alumnosDisponibles = computed(() =>
    alumnos.value.filter(a => !selectedAlumnos.value.includes(a.id))
)

const filteredDisponibles = computed(() =>
    alumnosDisponibles.value.filter(a => a.nombre.toLowerCase().includes(search.value.toLowerCase()))
)

const agregarAlumno = (alumnoId) => {
    if (selectedAlumnos.value.length >= props.clase.cupo_maximo) {
        alert('Clase llena.'); return
    }
    selectedAlumnos.value.push(alumnoId)
}

const quitarAlumno = (alumnoId) => {
    selectedAlumnos.value = selectedAlumnos.value.filter(id => id !== alumnoId)
}

const guardarCambios = async () => {
    const originalAlumnos = props.clase.alumnos?.map(a => a.id) ?? []
    const nuevos = selectedAlumnos.value

    const alumnosAInsertar = nuevos.filter(id => !originalAlumnos.includes(id))
    const alumnosAEliminar = originalAlumnos.filter(id => !nuevos.includes(id))

    // Insertar nuevos
    if (alumnosAInsertar.length > 0) {
        const inserts = alumnosAInsertar.map(id => ({ clase_id: props.clase.id, alumno_id: id }))
        await supabase.from('clase_alumnos').insert(inserts)
    }

    // Eliminar los que se deseleccionaron
    for (const alumnoId of alumnosAEliminar) {
        await supabase.from('clase_alumnos')
            .delete()
            .eq('clase_id', props.clase.id)
            .eq('alumno_id', alumnoId)
    }

    emit('reloadClases')
    internalVisible.value = false
}
</script>