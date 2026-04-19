import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import AdminLayout from '../components/AdminLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import UsuariosView from '../views/UsuariosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      // Ruta padre: Usa el Layout
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      // Rutas hijas: Se inyectan en el <router-view> del Layout
      children: [
        {
          path: '', // Si entra a /admin, carga el dashboard por defecto
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: UsuariosView,
        },

        {
          path: 'roles',
          name: 'roles',
          component: () => import('../views/RolesView.vue'),
        },
        // Aquí agregaremos futuras rutas como:
        // { path: 'usuarios', name: 'usuarios', component: UsuariosView }
      ],
    },
    // Redirección si entran a la raíz '/'
    {
      path: '/',
      redirect: '/admin',
    },
  ],
})

// Guardián de seguridad (Igual que antes)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router