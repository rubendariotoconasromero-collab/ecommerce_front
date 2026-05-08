import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Swal from 'sweetalert2' // ¡Importante! Faltaba importar esto para tu alerta

import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import CatalogView from '../views/CatalogView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import AdminLayout from '../components/AdminLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import UsuariosView from '../views/UsuariosView.vue'
import CategoriasView from '../views/CategoriasView.vue'
import ProductosView from '../views/ProductosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/catalogo',
      name: 'catalogo',
      component: CatalogView,
    },
    {
      path: '/producto/:id',
      name: 'producto-detalle',
      component: ProductDetailView,
      props: true
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardView },
        { 
          path: 'usuarios', 
          name: 'usuarios', 
          component: UsuariosView, 
          meta: { permission: 'modulo-usuarios' } 
        },
        { 
          path: 'roles', 
          name: 'roles', 
          component: () => import('../views/RolesView.vue'), 
          meta: { permission: 'modulo-roles' } 
        },
        { 
          path: 'categorias', 
          name: 'categorias', 
          component: CategoriasView, 
          meta: { permission: 'modulo-categorias' } 
        },
        { 
          path: 'productos', 
          name: 'productos', 
          component: ProductosView, 
          meta: { permission: 'modulo-productos' } 
        },
        { 
          path: 'productos/:id/imagenes', 
          name: 'producto-imagenes', 
          component: () => import('../views/ProductGalleryView.vue'), 
          meta: { permission: 'modulo-productos', title: 'Galería de Producto' } 
        },
        { 
          path: 'configuracion', 
          name: 'configuracion', 
          component: () => import('../views/ConfiguracionView.vue'), 
          meta: { permission: 'modulo-configuracion' } 
        },
      ],
    },
  ],
})

// Guardián de seguridad refactorizado: AHORA ES ASÍNCRONO (async)
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  
  // SOLUCIÓN AL PROBLEMA F5: Recuperar datos del usuario si hay token pero no hay usuario en memoria
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchUser() // Esperamos a que lleguen los datos de Laravel
    } catch (error) {
      // Si el token ya expiró o es inválido en el backend, lo mandamos al login
      return { name: 'login' }
    }
  }

  // 1. Verificación básica de Auth
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  } 
  
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  // 2. Verificación de Permiso por Módulo
  if (to.meta.permission) {
    if (!authStore.hasPermission(to.meta.permission)) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para entrar a este módulo.',
        confirmButtonColor: '#0d6efd'
      })
      return { name: 'dashboard' }
    }
  }

  return true // Permite la navegación
})

export default router