import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '../components/views/Dashboard.vue'
import Alumnos from '../pages/Alumnos.vue'
import Asistencias from '../pages/Asistencias.vue'
import Rutinas from '../pages/Rutinas.vue'
import Reportes from '../pages/Reportes.vue'
import Pagos from '../pages/Pagos.vue'
import Notas from '../pages/Notas.vue'
import Configuracion from '../pages/Configuracion.vue'
import RegistroGimnasio from '../pages/RegistroGimnasio.vue'
import Login from '../pages/Login.vue'
import store from '../store/index.js'
import RecuperarPassword from '../pages/RecuperarPassword.vue'

const routes = [
    {
      path: '/',
      component: Dashboard,
      children: [
        { path: '', redirect: '/alumnos' },
        { path: 'alumnos', component: Alumnos },
        { path: 'asistencias', component: Asistencias },
        { path: 'rutinas', component: Rutinas },
        { path: 'reportes', component: Reportes },
        { path: 'pagos', component: Pagos },
        { path: 'notas', component: Notas },
        { path: 'configuracion', component: Configuracion },
      ]
    },
    {
      path: '/registro-gimnasio',
      name: 'RegistroGimnasio',
      component: RegistroGimnasio
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/recuperar-contrasena',
      name: 'RecuperarPassword',
      component: RecuperarPassword // creala aunque sea vacía
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuth = store.getters.isAuthenticated

  const publicRoutes = ['/login', '/registro-gimnasio']
  const requiresAuth = !publicRoutes.includes(to.path)

  if (requiresAuth && !isAuth) {
    next('/login')
  } else {
    next()
  }
})

export default router
