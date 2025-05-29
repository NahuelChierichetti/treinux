<template>
  <Dialog
    v-model:visible="internalVisible"
    header="Confirmar acción"
    modal
    class="w-full max-w-sm"
  >
    <p class="text-sm text-gray-700">{{ message || '¿Estás seguro que querés eliminar este elemento?' }}</p>

    <template #footer>
      <div class="flex justify-between gap-2">
        <button class="p-button-secondary btn-cancelar" @click="cancel">Cancelar</button>
        <button class="p-button-primary btn-treinux" @click="confirm">Eliminar</button>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

// Props y eventos
const props = defineProps({
  visible: Boolean,
  message: String
})

const emit = defineEmits(['update:visible', 'confirm'])

// Control interno de visibilidad
const internalVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// Acciones
const cancel = () => emit('update:visible', false)
const confirm = () => {
  emit('confirm')
  emit('update:visible', false)
}
</script>
