<template>
  <div class="flex flex-col gap-6">
    <div class="flex w-full justify-between items-center">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold">Actividades</h2>
        <p class="text-gray-500 text-sm">Gestiona las actividades y clases de tu gimnasio</p>
      </div>
      <Button @click="showDialogNuevaActividad = true" class="btn-treinux" label="Nueva Actividad" icon="pi pi-plus"
        iconPos="left" />
    </div>

    <ApplicationLoader v-if="isLoading" />
    <div v-else class="flex w-full">
      <div class="grid grid-cols-3 gap-6 w-full">
        <div v-for="actividad in actividades" :key="actividad.id"
          class="border rounded-md bg-white px-6 py-8 shadow flex flex-col justify-between">
          <div>
            <h3 class="text-xl font-semibold mb-2">
              <Icon icon="tabler:activity" class="h-5 w-5 inline-block mr-2" :style="{ color: actividad.color }" />{{ actividad.nombre }}
            </h3>
            <p class="text-sm text-gray-500">{{ actividad.descripcion ?? 'Sin descripción' }}</p>
          </div>
          <div class="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div><i class="pi pi-calendar mr-1"></i>{{ actividad.clases.length }} clases</div>
            <div><i class="pi pi-users mr-1"></i>{{ actividad.cantidad_alumnos ?? 0 }} alumnos</div>
          </div>
          <button class="p-button-secondary btn-cancelar w-full mt-4" @click="abrirDetalle(actividad)">
            Gestionar Clases
          </button>
        </div>
      </div>
    </div>

    <!-- Dialog para crear nueva actividad -->
    <Dialog v-model:visible="showDialogNuevaActividad" header="Nueva Actividad" modal class="w-[400px]">
      <div class="flex flex-col gap-4">
        <div>
          <label class="block mb-2">Nombre de la actividad</label>
          <InputText v-model="nuevaActividad.nombre" class="w-full" />
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <Button label="Cancelar" class="p-button-secondary" @click="showDialogNuevaActividad = false" />
          <Button label="Guardar" class="p-button-success" :disabled="!nuevaActividad.nombre"
            @click="guardarNuevaActividad" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Icon } from '@iconify/vue'
import ApplicationLoader from '../components/ui/ApplicationLoader.vue'

const store = useStore()
const router = useRouter()
const isLoading = ref(true)
const actividades = ref([])
const showDialogNuevaActividad = ref(false)
const nuevaActividad = ref({ nombre: '' })

const currentGymId = computed(() => store.getters.getCurrentGimnasio?.id)

const fetchActividades = async () => {
  const { data, error } = await supabase
    .from('actividades')
    .select(`
      *,
      clases:clases ( id )
    `)
    .eq('gym_id', currentGymId.value)

  if (!error) {
    // Ahora después de traer actividades, calculamos los alumnos inscriptos
    for (let actividad of data) {
      const claseIds = actividad.clases.map(c => c.id)

      if (claseIds.length > 0) {
        const { data: inscripciones } = await supabase
          .from('clase_alumnos')
          .select('id')
          .in('clase_id', claseIds)

        actividad.cantidad_alumnos = inscripciones.length
      } else {
        actividad.cantidad_alumnos = 0
      }
    }

    actividades.value = data
  }
}

const guardarNuevaActividad = async () => {
  await supabase.from('actividades').insert({
    nombre: nuevaActividad.value.nombre,
    gym_id: currentGymId.value
  })
  nuevaActividad.value = { nombre: '' }
  showDialogNuevaActividad.value = false
  fetchActividades()
}

const abrirDetalle = async (actividad) => {
  await router.push({ name: 'GestionClases', params: { actividadId: actividad.id } })
}


onMounted(async () => {
  try {
    isLoading.value = true
    await fetchActividades()
  } finally {
    isLoading.value = false
  }
})
</script>