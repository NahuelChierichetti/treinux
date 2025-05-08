<template>
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar (móvil) -->
        <div v-if="sidebarOpen" @click="sidebarOpen = false" 
           class="fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden"></div>
      
        <!-- Sidebar -->
        <div :class="sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'" 
           class="fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-[#242424] lg:translate-x-0 lg:static lg:inset-0">
        <div class="flex mt-8">
            <div class="flex ml-2">
                <img :src="LogoTreinux" class="w-40 h-16 mx-2" />
                <!-- <span class="mx-2 text-2xl font-semibold text-white">Treinux</span> -->
            </div>
        </div>
        
            <nav class="mt-10">
                <template v-for="(item, index) in menuItems" :key="index">
                    <a
                        class="flex items-center px-6 py-3 mt-1 text-gray-100 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100"
                        :class="{ 'bg-gray-700 bg-opacity-25': route.path === item.path }"
                        @click.prevent="navigateTo(item.path)"
                        href="#"
                    >
                        <component :is="item.icon" class="w-5 h-5" />
                        <span class="mx-3">{{ item.name }}</span>
                    </a>
                </template>
            </nav>
        </div>
      
        <div class="flex flex-col flex-1 overflow-hidden">
            <!-- Header -->
            <header class="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-gray-200">
                <div class="flex items-center">
                    <button @click="sidebarOpen = true" class="text-gray-500 focus:outline-none lg:hidden">
                    <Menu class="w-6 h-6" />
                    </button>
                </div>
                
                <div class="relative">
                    <button @click="profileOpen = !profileOpen" 
                            class="flex items-center space-x-2 relative focus:outline-none">
                    <div class="w-10 h-10 overflow-hidden rounded-full border-2 border-gray-300">
                        <img src="../../assets/images/sin-imagen.jpg" 
                            class="object-cover w-full h-full" alt="avatar">
                    </div>
                    <div class="flex flex-col items-start">
                        <span class="font-medium text-gray-700">{{ nombreGimnasio }}</span>
                        <span class="text-xs text-gray-400">{{ emailUsuario }}</span>
                    </div>
                    <ChevronDown class="w-4 h-4 text-gray-700" />
                    </button>
                    
                    <div v-if="profileOpen" 
                        class="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl z-20">
                        <a href="#" @click.prevent="navigateTo('/configuracion')" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <SettingsIcon class="w-4 h-4" /> Configurar Perfil
                        </a>
                        <a href="#" @click.prevent="logout" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <LogOut class="w-4 h-4" /> Cerrar Sesión
                        </a>
                    </div>
                </div>
            </header>
        
            <!-- Main content -->
            <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                <div class="container px-6 py-8 mx-auto">
                    <router-view />
                </div>
            </main>
        </div>
    </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { supabase } from '@/supabase'
import {
  Menu,
  ChevronDown,
  Users,
  Calendar,
  Dumbbell,
  BarChart,
  CreditCard,
  FileText,
  Settings,
  Settings as SettingsIcon,
  LogOut, 
} from 'lucide-vue-next'
import LogoTreinux from '../../assets/images/logo-treinux.svg'

const sidebarOpen = ref(false)
const profileOpen = ref(false)
const route = useRoute()
const router = useRouter()
const store = useStore()

const user = computed(() => store.getters.getUser)
console.log('user', user.value)
const currentGimnasio = computed(() => store.getters.getCurrentGimnasio)
console.log('currentGimnasio', currentGimnasio.value)

const nombreGimnasio = computed(() => {
  const gimnasioNombre = currentGimnasio.value?.nombre || 'Gimnasio'
  return `${gimnasioNombre}`
})

const emailUsuario = computed(() => {
    const email = user.value?.email || 'usuario@email.com'
    return `${email}`
})

const menuItems = [
  { name: 'Alumnos', icon: Users, path: '/alumnos' },
  { name: 'Asistencias', icon: Calendar, path: '/asistencias' },
  { name: 'Rutinas', icon: Dumbbell, path: '/rutinas' },
  { name: 'Reportes', icon: BarChart, path: '/reportes' },
  { name: 'Pagos', icon: CreditCard, path: '/pagos' },
  { name: 'Notas', icon: FileText, path: '/notas' },
  { name: 'Configuración', icon: Settings, path: '/configuracion' }
]

const navigateTo = (path) => {
  router.push(path)
}

const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    store.dispatch('logout') // limpia user y gimnasio
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error.message)
  }
}

onMounted(() => {
  const isAuthenticated = store.getters.isAuthenticated
  if (!isAuthenticated) {
    router.push('/login')
  }
})
</script>
