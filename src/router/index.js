import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '../components/views/Dashboard.vue'
import Members from '../pages/Members.vue'
import Assistance from '../pages/Assistance.vue'
import Routines from '../pages/Routines.vue'
import Shifts from '../pages/Shifts.vue'
import Team from '../pages/Team.vue'
import Payments from '../pages/Payments.vue'
import Notes from '../pages/Notes.vue'
import RegisterAssistance from '../pages/RegisterAssistance.vue'
import Settings from '../pages/Settings.vue'
import SettingsAccount from '../pages/SettingsAccount.vue'
import RegisterGym from '../pages/RegisterGym.vue'
import Login from '../pages/Login.vue'
import store from '../store/index.js'
import ResetPassword from '../pages/ResetPassword.vue'
import RegisterNewMember from '../pages/RegisterNewMember.vue'

const routes = [
    {
      path: '/',
      component: Dashboard,
      children: [
        { path: '', redirect: '/members' },
        { path: 'members', component: Members },
        { path: 'assistance', component: Assistance },
        { path: 'routines', component: Routines },
        { path: 'shifts', component: Shifts  },
        { path: 'payments', component: Payments },
        { path: 'notes', component: Notes },
        { path: 'settings', component: Settings },
        { path: 'register-assistance', component: RegisterAssistance },
        { path: 'team', component: Team },
        { path: 'settings/account', component: SettingsAccount },
      ]
    },
    {
      path: '/register-gym',
      name: 'RegistroGimnasio',
      component: RegisterGym
    },
    {
      path: '/register-member',
      name: 'RegistroMiembro',
      component: RegisterNewMember
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/reset-password',
      name: 'RecuperarPassword',
      component: ResetPassword
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuth = store.getters.isAuthenticated

  const publicRoutes = ['/login', '/register-gym', '/reset-password']
  const requiresAuth = !publicRoutes.includes(to.path)

  if (requiresAuth && !isAuth) {
    next('/login')
  } else {
    next()
  }
})

export default router
