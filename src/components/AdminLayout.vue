<template>
  <div class="d-flex bg-main min-vh-100">
    
    <aside 
      class="bg-dark text-white shadow-sm d-flex flex-column transition-all"
      :class="{ 'sidebar-collapsed': isCollapsed }"
      style="width: 260px; z-index: 1040; transition: all 0.3s;"
    >
      <div class="p-3 d-flex align-items-center justify-content-between border-bottom bg-white w-100" style="height: 73px;">
        
        <div class="d-flex align-items-center overflow-hidden" style="max-width: 80%;">
          <img 
            v-if="!isCollapsed"
            src="/src/assets/images/logo.png" 
            alt="Logo Empresa" 
            class="img-fluid" 
            style="max-height: 60px; object-fit: contain;"
          >
          <img 
            v-else
            src="https://via.placeholder.com/40x40?text=L" 
            alt="Icono Empresa" 
            class="img-fluid" 
            style="max-height: 35px; object-fit: contain; margin: 0 auto;"
          >
        </div>
        
        <button class="btn btn-sm d-none d-md-block" @click="isCollapsed = !isCollapsed">
          <i class="bi" :class="isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
        </button>
      </div>

      <div class="flex-grow-1 overflow-auto py-3">
        <ul class="nav flex-column mb-auto px-2">
          
          <li class="nav-item mb-1">
            <router-link :to="{ name: 'dashboard' }" class="nav-link nav-link-custom" active-class="active">
              <i class="bi bi-grid-1x2"></i>
              <span class="ms-2" v-if="!isCollapsed">Dashboard</span>
            </router-link>
          </li>

          <li class="nav-item mb-1 sidebar-heading small fw-bold px-3 mt-3 mb-2" v-if="!isCollapsed">OPERACIONES</li>
          
          <li class="nav-item mb-1">
            <router-link to="/admin/pedidos" class="nav-link nav-link-custom" active-class="active">
              <i class="bi bi-cart3"></i>
              <span class="ms-2" v-if="!isCollapsed">Pedidos</span>
            </router-link>
          </li>

          <li class="nav-item mb-1 sidebar-heading small fw-bold px-3 mt-3 mb-2" v-if="!isCollapsed && (authStore.hasPermission('ver-usuarios') || authStore.hasPermission('ver-roles'))">
            ADMINISTRACIÓN
          </li>
          
          <li class="nav-item mb-1" v-if="authStore.hasPermission('ver-usuarios')">
            <router-link :to="{ name: 'usuarios' }" class="nav-link nav-link-custom" active-class="active">
              <i class="bi bi-people"></i>
              <span class="ms-2" v-if="!isCollapsed">Usuarios</span>
            </router-link>
          </li>

          <li class="nav-item mb-1" v-if="authStore.hasPermission('ver-usuarios')"> <router-link :to="{ name: 'roles' }" class="nav-link nav-link-custom" active-class="active">
              <i class="bi bi-shield-lock"></i>
              <span class="ms-2" v-if="!isCollapsed">Roles y Permisos</span>
            </router-link>
          </li>



        </ul>
      </div>
    </aside>

    <main class="flex-grow-1 d-flex flex-column overflow-hidden">
      
      <header class="bg-white shadow-sm px-4 py-3 d-flex align-items-center justify-content-between z-1">
        <button class="btn btn-light d-md-none" @click="isCollapsed = !isCollapsed">
          <i class="bi bi-list fs-5"></i>
        </button>

        <div class="d-none d-md-block">
          <h5 class="mb-0 fw-bold">Panel de Control</h5>
        </div>

        <div class="dropdown">
          <button class="btn btn-light dropdown-toggle d-flex align-items-center border-0" type="button" data-bs-toggle="dropdown">
            <div class="bg-brand text-white rounded-circle d-flex justify-content-center align-items-center me-2" style="width: 32px; height: 32px;">
              {{ authStore.user?.name.charAt(0).toUpperCase() }}
            </div>
            <span class="d-none d-sm-block">{{ authStore.user?.name }}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
            <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>Mi Perfil</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><button class="dropdown-item text-danger" @click="handleLogout"><i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión</button></li>
          </ul>
        </div>
      </header>

      <div class="flex-grow-1 p-4 overflow-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const isCollapsed = ref(false); // Controla si el sidebar está abierto o cerrado

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: 'login' });
};
</script>

<style scoped>
/* Estilos específicos para el Layout */
.bg-main { background-color: var(--bg-main); }
.bg-brand { background-color: var(--brand-primary); }

/* Estilos adaptados para Fondo Oscuro (Dark Sidebar) */
.nav-link-custom {
  color: rgba(255, 255, 255, 0.7); /* Texto gris claro translúcido */
  border-radius: var(--border-radius-md);
  padding: 0.6rem 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.nav-link-custom:hover {
  background-color: rgba(255, 255, 255, 0.1); /* Brillo blanco sutil */
  color: #ffffff; /* Texto blanco puro al pasar el mouse */
}

.nav-link-custom.active {
  background-color: var(--brand-primary); /* Fondo del color de la marca */
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.sidebar-collapsed {
  width: 70px !important;
}

/* Títulos de las secciones del menú */
.sidebar-heading {
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.5px;
}

.sidebar-collapsed {
  width: 70px !important;
}

.bg-main { background-color: var(--bg-main); }
.bg-brand { background-color: var(--brand-primary); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Animación de transición entre páginas */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>