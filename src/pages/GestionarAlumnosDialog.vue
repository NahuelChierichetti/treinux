<template>
    <Dialog :visible="localVisible" :modal="true" header="Gestionar Alumnos" class="w-[500px]" @update:visible="emitClose">
      <div class="flex flex-col gap-4">
        <div>
          <label>Buscar alumno</label>
          <InputText v-model="busqueda" class="w-full" @input="buscarAlumnos" placeholder="Nombre o email" />
        </div>
  
        <div v-if="resultados.length > 0">
          <div v-for="alumno in resultados" :key="alumno.id" class="flex justify-between items-center border p-2 rounded">
            <span>{{ alumno.nombre }} - {{ alumno.email }}</span>
            <Button 
              label="Agregar"
              size="small"
              :disabled="claseAlumnos.find(a => a.alumno_id === alumno.id) || claseAlumnos.length >= clase.cupo_maximo"
              @click="agregarAlumno(alumno)"
            />
          </div>
        </div>
  
        <h4 class="font-semibold mt-4">Alumnos inscriptos ({{ claseAlumnos.length }}/{{ clase.cupo_maximo }})</h4>
        <ul class="list-disc ml-5">
          <li v-for="alumno in claseAlumnos" :key="alumno.id">
            {{ alumno.nombre }}
            <Button size="small" icon="pi pi-times" class="p-button-danger p-button-text" @click="eliminarAlumno(alumno)" />
          </li>
        </ul>
      </div>
    </Dialog>
  </template>
  
<script setup>
import { ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { supabase } from '@/supabase'
  
const props = defineProps({
    visible: Boolean,
    clase: Object
})

const emit = defineEmits(['close', 'updated'])

const localVisible = ref(false)

watch(() => props.visible, (nuevoValor) => {
    localVisible.value = nuevoValor
    if (nuevoValor) cargarAlumnosClase()
})
  
  const busqueda = ref('')
  const resultados = ref([])
  const claseAlumnos = ref([])
  
  const buscarAlumnos = async () => {
    if (busqueda.value.length < 2) {
      resultados.value = []
      return
    }
    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .ilike('nombre', `%${busqueda.value}%`)
  
    resultados.value = data
  }
  
  const cargarAlumnosClase = async () => {
    const { data } = await supabase
      .from('clase_alumnos')
      .select(`
        *,
        usuario:usuarios ( id, nombre, email )
      `)
      .eq('clase_id', props.clase.id)
  
    claseAlumnos.value = data.map(a => ({
      id: a.usuario.id,
      nombre: a.usuario.nombre,
      email: a.usuario.email,
      alumno_id: a.usuario.id
    }))
  }
  
  const agregarAlumno = async (alumno) => {
    await supabase.from('clase_alumnos').insert({
      clase_id: props.clase.id,
      alumno_id: alumno.id
    })
    await cargarAlumnosClase()
    emit('updated')
  }
  
  const eliminarAlumno = async (alumno) => {
    await supabase.from('clase_alumnos')
      .delete()
      .eq('clase_id', props.clase.id)
      .eq('alumno_id', alumno.id)
  
    await cargarAlumnosClase()
    emit('updated')
  }
  
  watch(() => props.visible, (nuevoValor) => {
    if (nuevoValor) {
      cargarAlumnosClase()
    }
  })
  </script>
  