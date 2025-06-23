<template>
    <div class="flex h-screen bg-gray-100">
      <!-- Overlay for mobile -->
      <div v-if="sidebarOpen" @click="sidebarOpen = false"
           class="fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden"></div>
  
      <!-- Sidebar -->
      <div :class="['fixed inset-y-0 left-0 z-30 overflow-y-auto transition duration-300 transform bg-[#282C34] border-r border-[#2C2C2C]', sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in', sidebarCollapsed ? 'w-20' : 'w-60']"
           class="lg:translate-x-0 lg:static lg:inset-0">
        <!-- Logo y collapse -->
        <div class="flex items-center justify-between px-4 py-4 border-b border-[#2C2C2C]" :class="sidebarCollapsed ? 'flex-col' : 'flex-row'">
          <img v-if="sidebarCollapsed" :src="FaviconTreinux" class="w-8 h-8 mb-2" />
          <img v-if="!sidebarCollapsed" :src="LogoTreinux" class="w-18 h-8" />
          <button @click="sidebarCollapsed = !sidebarCollapsed" class="text-gray-400 hover:text-white">
            <Icon icon="tabler:layout-sidebar-left-collapse" class="w-5 h-5" v-if="!sidebarCollapsed" />
            <Icon icon="tabler:layout-sidebar-right-collapse" class="w-5 h-5" v-else />
          </button>
        </div>
        
        <!-- Navigation -->
        <nav class="mt-6 flex flex-col gap-1">
          <template v-for="(item, index) in menuItems" :key="index">
            <div class="relative group">
              <a href="#"
                 class="flex items-center mx-2 px-4 py-3 text-[15px] text-gray-300 hover:bg-white/10 rounded-lg transition"
                 :class="{ 'bg-white/10 text-white': route.path === item.path }"
                 @click.prevent="navigateTo(item.path)">
                 <component :is="item.icon" class="w-5 h-5 mx-auto" v-if="sidebarCollapsed" v-tooltip.right="item.name" />
                <div class="flex items-center gap-3" v-else>
                  <component :is="item.icon" class="w-5 h-5" />
                  <span>{{ item.name }}</span>
                </div>
              </a>
              <!-- Tooltip -->
              <div v-if="sidebarCollapsed" class="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                {{ item.name }}
              </div>
            </div>
          </template>
        </nav>
      </div>
  
      <!-- Main content -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <!-- Header -->
        <header class="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div class="flex items-center">
            <button @click="sidebarOpen = true" class="text-gray-500 focus:outline-none lg:hidden">
              <Menu class="w-6 h-6" />
            </button>
          </div>
          <div class="relative">
            <button @click="profileOpen = !profileOpen" class="flex items-center space-x-2">
              <div class="w-10 h-10 overflow-hidden rounded-full border-2 border-gray-300">
                <img :src="imagenPerfil" class="object-cover w-full h-full" alt="avatar" />
              </div>
              <div class="flex flex-col items-start">
                <span class="font-medium text-gray-700">{{ nombreGimnasio }}</span>
                <span class="text-xs text-gray-400">{{ emailUsuario }}</span>
              </div>
              <ChevronDown class="w-4 h-4 text-gray-700" />
            </button>
  
            <div v-if="profileOpen" class="absolute right-0 w-52 mt-2 py-2 bg-white rounded-md shadow-xl z-20">
              <div v-if="user.rol === 'superadmin'" class="border-b border-gray-100 pb-2">
                <div class="px-4 pt-2 text-sm text-gray-400 font-semibold">Gimnasio</div>
                <a href="#" @click.prevent="navigateTo('/settings')" class="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 hover:bg-gray-100">
                  <Icon icon="tabler:settings" class="w-4 h-4" /> Configuración
                </a>
              </div>
              <div>
                <div class="px-4 pt-2 text-sm text-gray-400 font-semibold">Cuenta</div>
                <a href="#" @click.prevent="navigateTo('/settings/account')" class="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 hover:bg-gray-100">
                  <Icon icon="tabler:settings" class="w-4 h-4" /> Configuración
                </a>
                <a href="#" @click.prevent="logout" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Icon icon="tabler:logout" class="w-4 h-4" /> Cerrar Sesión
                </a>
              </div>
            </div>
          </div>
        </header>
  
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
    Activity,
    CalendarFold
  } from 'lucide-vue-next'
  import { Icon } from '@iconify/vue'
  import LogoTreinux from '../../assets/images/logo-treinux.svg'
  import FaviconTreinux from '../../assets/images/favicon-treinux.svg'
  
  const sidebarOpen = ref(false)
  const profileOpen = ref(false)
  const sidebarCollapsed = ref(false)
  const route = useRoute()
  const router = useRouter()
  const store = useStore()
  
  const user = computed(() => store.getters.getUser)
  const currentGimnasio = computed(() => store.getters.getCurrentGimnasio)
  const nombreGimnasio = computed(() => currentGimnasio.value?.nombre || 'Gimnasio')
  const emailUsuario = computed(() => user.value?.email || 'usuario@email.com')
  
  const defaultImage = new URL('@/assets/images/sin-imagen.jpg', import.meta.url).href
  const imagenPerfil = ref(defaultImage)
  
  const menuItems = [
    { name: 'Alumnos', icon: Users, path: '/members' },
    { name: 'Asistencias', icon: Calendar, path: '/assistance' },
    { name: 'Rutinas', icon: Dumbbell, path: '/routines' },
    // { name: 'Turnos', icon: CalendarFold, path: '/shifts' },
    { name: 'Actividades', icon: Activity, path: '/activities' },
    { name: 'Equipo', icon: Users, path: '/team' },
    { name: 'Pagos', icon: CreditCard, path: '/payments' },
    { name: 'Notas', icon: FileText, path: '/notes' },
  ]
  
  const navigateTo = (path) => {
    router.push(path)
  }
  
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      store.dispatch('logout')
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message)
    }
  }
  
  onMounted(async () => {
    if (currentGimnasio.value?.imagen) {
      const { data } = await supabase.storage.from('gimnasios').createSignedUrl(currentGimnasio.value.imagen, 3600)
      if (data?.signedUrl) imagenPerfil.value = data.signedUrl
    }
    if (!store.getters.isAuthenticated) router.push('/login')
  })
  </script>