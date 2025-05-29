<template>
    <div class="flex justify-center items-center border rounded gap-2 mt-6">
        <button
            class="px-3 py-2 border-r text-sm cursor-pointer"
            :disabled="currentPage === 1"
            @click="$emit('update:currentPage', currentPage - 1)"
        >
            <Icon icon="flowbite:angle-left-outline" class="w-4 h-4" />
        </button>
    
        <span class="text-sm px-6">{{ currentPage }}</span>
    
        <button
            class="px-3 py-2 border-l text-sm cursor-pointer"
            :disabled="currentPage === totalPages"
            @click="$emit('update:currentPage', currentPage + 1)"
        >
            <Icon icon="flowbite:angle-right-outline" class="w-4 h-4" />
        </button>
    </div>
</template>
  
<script setup>
import { Icon } from '@iconify/vue'

defineProps({
    currentPage: {
    type: Number,
    required: true
    },
    totalPages: {
    type: Number,
    required: true
    }
})
  
defineEmits(['update:currentPage'])
</script>
  