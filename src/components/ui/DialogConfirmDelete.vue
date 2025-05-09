<template>
    <Dialog
      :visible="internalVisible"
      @update:visible="emit('update:visible', $event)"
      :modal="true"
      header="Confirmar eliminación"
      :style="{ width: '30vw' }"
      :closable="true"
      closable-icon="pi pi-times"
    >
      <p class="text-sm text-gray-600">¿Estás seguro que querés eliminar este alumno?</p>
  
      <template #footer>
        <button class="px-4 py-2 border !border-gray-300 !text-gray-700 !bg-white rounded-md text-sm font-medium shadow-sm transition-colors" @click="cancel">
            Cancelar
        </button>
        <button class="px-4 py-2 bg-red-500 text-white border border-red-500 hover:bg-red-600 rounded-md text-sm font-medium shadow-sm transition-colors" @click="confirm">
            Eliminar
        </button>
      </template>
    </Dialog>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import Dialog from 'primevue/dialog'
  
  const props = defineProps({
    visible: Boolean
  })
  const emit = defineEmits(['update:visible', 'confirm'])
  
  const internalVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })
  
  const cancel = () => emit('update:visible', false)
  const confirm = () => {
    emit('confirm')
    emit('update:visible', false)
  }
  </script>
  