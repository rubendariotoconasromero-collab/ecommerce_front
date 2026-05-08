<template>
  <div class="admin-wrapper d-flex min-vh-100">
    <!-- Sidebar (Premium SaaS Sidebar) -->
    <aside 
      class="sidebar-container d-flex flex-column transition-all shadow-lg"
      :class="{ 'sidebar-collapsed': isCollapsed }"
    >
      <!-- Sidebar Header (Logo con Contraste Elevado) -->
      <div class="sidebar-header d-flex align-items-center justify-content-center border-bottom bg-body sticky-top">
        <div class="logo-area d-flex align-items-center justify-content-center w-100 px-3">
          <img 
            v-if="!isCollapsed"
            src="/src/assets/images/logo.png" 
            alt="Logo Empresa" 
            class="sidebar-logo animate__animated animate__fadeIn"
          >
          <div v-else class="collapsed-logo-pill animate__animated animate__zoomIn">
            <span class="fw-bold">C</span>
          </div>
        </div>
      </div>

      <!-- Menú de Navegación (Jerarquía Visual Mejorada) -->
      <nav class="sidebar-nav flex-grow-1 overflow-auto py-4 px-3">
        <ul class="nav flex-column gap-2">
          
          <li class="nav-item">
            <router-link :to="{ name: 'dashboard' }" class="nav-link-custom" exact-active-class="active">
              <i class="bi bi-speedometer2 icon-main"></i>
              <span class="ms-3 nav-text" v-if="!isCollapsed">Dashboard</span>
            </router-link>
          </li>

          <!-- Grupo: Operaciones -->
          <li class="nav-item" v-if="authStore.hasPermission('modulo-pedidos')">
            <div 
              class="nav-link-custom group-header" 
              :class="{ 'active-group': isGroupActive('operaciones'), 'is-open': openGroups.operaciones }"
              @click="toggleGroup('operaciones')"
            >
              <i class="bi bi-rocket-takeoff icon-main"></i>
              <span class="ms-3 nav-text" v-if="!isCollapsed">Operaciones</span>
              <i v-if="!isCollapsed" class="bi bi-chevron-right ms-auto arrow-icon"></i>
            </div>
            <ul v-if="openGroups.operaciones && !isCollapsed" class="nav-sub flex-column">
              <li class="nav-item">
                <router-link to="/admin/pedidos" class="nav-link-sub" active-class="active">
                  Pedidos Recientes
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Grupo: Catálogo -->
          <li class="nav-item" v-if="authStore.hasPermission('modulo-categorias') || authStore.hasPermission('modulo-productos')">
            <div 
              class="nav-link-custom group-header" 
              :class="{ 'active-group': isGroupActive('catalogo'), 'is-open': openGroups.catalogo }"
              @click="toggleGroup('catalogo')"
            >
              <i class="bi bi-box-seam icon-main"></i>
              <span class="ms-3 nav-text" v-if="!isCollapsed">Inventario</span>
              <i v-if="!isCollapsed" class="bi bi-chevron-right ms-auto arrow-icon"></i>
            </div>
            <ul v-if="openGroups.catalogo && !isCollapsed" class="nav-sub flex-column">
              <li class="nav-item" v-if="authStore.hasPermission('modulo-categorias')">
                <router-link :to="{ name: 'categorias' }" class="nav-link-sub" active-class="active">
                  Categorías
                </router-link>
              </li>
              <li class="nav-item" v-if="authStore.hasPermission('modulo-productos')">
                <router-link :to="{ name: 'productos' }" class="nav-link-sub" active-class="active">
                  Productos
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Grupo: Administración -->
          <li class="nav-item" v-if="authStore.hasPermission('modulo-usuarios') || authStore.hasPermission('modulo-roles')">
            <div 
              class="nav-link-custom group-header" 
              :class="{ 'active-group': isGroupActive('admin'), 'is-open': openGroups.admin }"
              @click="toggleGroup('admin')"
            >
              <i class="bi bi-shield-check icon-main"></i>
              <span class="ms-3 nav-text" v-if="!isCollapsed">Seguridad</span>
              <i v-if="!isCollapsed" class="bi bi-chevron-right ms-auto arrow-icon"></i>
            </div>
            <ul v-if="openGroups.admin && !isCollapsed" class="nav-sub flex-column">
              <li class="nav-item" v-if="authStore.hasPermission('modulo-usuarios')">
                <router-link :to="{ name: 'usuarios' }" class="nav-link-sub" active-class="active">
                  Usuarios
                </router-link>
              </li>
              <li class="nav-item" v-if="authStore.hasPermission('modulo-roles')">
                <router-link :to="{ name: 'roles' }" class="nav-link-sub" active-class="active">
                  Roles & Permisos
                </router-link>
              </li>
              <li class="nav-item" v-if="authStore.hasPermission('modulo-configuracion')">
                <router-link :to="{ name: 'configuracion' }" class="nav-link-sub" active-class="active">
                  Configuración
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <!-- Selector de Temas (Premium UI) -->
      <div class="sidebar-footer p-3 mt-auto" v-if="!isCollapsed">
        <div class="theme-picker d-flex justify-content-between p-1 bg-body-tertiary rounded-pill border">
          <button @click="setTheme('light')" class="btn-theme-pill" :class="{ active: currentTheme === 'light' }">
            <i class="bi bi-sun-fill"></i>
          </button>
          <button @click="setTheme('semidark')" class="btn-theme-pill" :class="{ active: currentTheme === 'semidark' }">
            <i class="bi bi-circle-half"></i>
          </button>
          <button @click="setTheme('dark')" class="btn-theme-pill" :class="{ active: currentTheme === 'dark' }">
            <i class="bi bi-moon-stars-fill"></i>
          </button>
        </div>
      </div>
    </aside>

    <!-- Área de Contenido Principal -->
    <main class="main-content flex-grow-1 d-flex flex-column overflow-hidden">
      
      <!-- Glassmorphism Navbar -->
      <header class="navbar-container glass-header border-bottom px-4 d-flex align-items-center justify-content-between sticky-top">
        <div class="d-flex align-items-center">
          <button class="btn btn-toggle-modern me-3 shadow-sm" @click="isCollapsed = !isCollapsed" :title="isCollapsed ? 'Expandir menú' : 'Contraer menú'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="toggle-icon">
              <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" stroke-width="2" />
              <path d="M9 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path v-if="!isCollapsed" d="M14 10L12 12L14 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate__animated animate__fadeInLeft animate__faster" />
              <path v-else d="M12 10L14 12L12 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate__animated animate__fadeInRight animate__faster" />
            </svg>
          </button>
          
          <div class="header-breadcrumb d-none d-md-block animate__animated animate__fadeIn">
            <div class="d-flex align-items-center gap-2 mb-0">
              <h5 class="mb-0 fw-bold text-body-emphasis">{{ currentRouteName }}</h5>
            </div>
          </div>
        </div>

        <div class="navbar-actions d-flex align-items-center gap-3">
          <button class="btn btn-icon-only text-body-secondary"><i class="bi bi-bell"></i></button>
          
          <div class="dropdown">
            <button class="btn btn-profile-premium d-flex align-items-center gap-3 border shadow-sm px-3 py-1 bg-body" type="button" data-bs-toggle="dropdown">
              <div class="user-avatar-modern bg-brand text-white fw-bold">
                {{ authStore.user?.name.charAt(0).toUpperCase() }}
              </div>
              <div class="user-info text-start d-none d-sm-block">
                <p class="user-name mb-0 fw-bold text-body-emphasis">{{ authStore.user?.name }}</p>
                <p class="user-role mb-0 text-body-secondary small">Super Admin</p>
              </div>
              <i class="bi bi-chevron-down small text-body-secondary"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-xl border-0 mt-3 p-2 animate__animated animate__fadeIn animate__faster">
              <li><a class="dropdown-item rounded-2 py-2" href="#"><i class="bi bi-person-circle me-2"></i>Mi Perfil</a></li>
              <li><hr class="dropdown-divider mx-2"></li>
              <li><button class="dropdown-item text-danger rounded-2 py-2" @click="handleLogout"><i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión</button></li>
            </ul>
          </div>
        </div>
      </header>

      <!-- Viewport (Área de Trabajo) -->
      <div class="content-viewport flex-grow-1 p-4 overflow-auto bg-main">
        <router-view v-slot="{ Component }">
          <div :key="$route.path" class="h-100 container-fluid px-0">
            <component :is="Component" />
          </div>
        </router-view>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isCollapsed = ref(false);
const currentTheme = ref(localStorage.getItem('app-theme') || 'light');
const openGroups = reactive({ operaciones: false, catalogo: false, admin: false });

const currentRouteName = computed(() => route.meta.title || route.name || 'Panel');

const setTheme = (theme) => {
  currentTheme.value = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('app-theme', theme);
};

const toggleGroup = (group) => {
  if (isCollapsed.value) isCollapsed.value = false;
  openGroups[group] = !openGroups[group];
};

const isGroupActive = (group) => {
  const routes = {
    operaciones: ['pedidos'],
    catalogo: ['categorias', 'productos'],
    admin: ['usuarios', 'roles', 'configuracion']
  };
  return routes[group]?.includes(route.name);
};

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: 'login' });
};

onMounted(() => {
  setTheme(currentTheme.value);
  if (isGroupActive('operaciones')) openGroups.operaciones = true;
  if (isGroupActive('catalogo')) openGroups.catalogo = true;
  if (isGroupActive('admin')) openGroups.admin = true;
});
</script>

<style scoped>
/* SIDEBAR PREMIUM */
.sidebar-container {
  width: 270px;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  z-index: 1040;
  flex-shrink: 0; /* Evita que el sidebar se encoja si el contenido principal es muy ancho */
}

.sidebar-collapsed { width: 85px !important; }

.sidebar-header { height: 80px; }

.sidebar-logo { max-height: 50px; width: auto; object-fit: contain; }

.collapsed-logo-pill {
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  border-radius: 12px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  box-shadow: 0 4px 10px var(--color-primary-glass);
}

/* NAV LINKS PREMIUM */
.nav-link-custom {
  color: var(--sidebar-link);
  border-radius: var(--radius-md);
  padding: 0.8rem 1.2rem;
  font-weight: 600; /* Slightly bolder for Plus Jakarta Sans */
  display: flex;
  align-items: center;
  transition: var(--transition-base);
  cursor: pointer;
  letter-spacing: -0.01em;
}

.nav-link-custom:hover {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
}

.nav-link-custom.active, .nav-link-custom.active-group {
  background-color: var(--sidebar-bg-active);
  color: var(--text-inverse) !important;
  box-shadow: 0 4px 12px var(--color-primary-glass);
}

.nav-sub {
  margin-left: 2.2rem;
  padding-left: 1rem;
  border-left: 1px dashed var(--border-color);
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  gap: 0.25rem;
  display: flex;
}

.nav-link-sub {
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  color: var(--sidebar-link);
  text-decoration: none;
  border-radius: 6px;
  transition: var(--transition-fast);
}

.nav-link-sub:hover, .nav-link-sub.active {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.arrow-icon { font-size: 0.75rem; transition: transform 0.3s ease; opacity: 0.5; }
.is-open .arrow-icon { transform: rotate(90deg); opacity: 1; }

/* NAVBAR COMPONENTS */
.navbar-container { height: 80px; z-index: 1030; }

.main-content {
  min-width: 0; /* Fundamental para que el contenido no empuje al sidebar en flexbox */
}

.btn-toggle-modern {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--bg-body);
  border: 1px solid var(--border-color);
  color: var(--text-body-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  padding: 0;
}

.btn-toggle-modern:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
  border-color: var(--color-primary-glass);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-toggle-modern:active {
  transform: scale(0.95);
}

.toggle-icon {
  transition: transform 0.3s ease;
}

.sidebar-collapsed + .main-content .btn-toggle-modern .toggle-icon {
  transform: rotate(0deg);
}

.btn-profile-premium { border-radius: 50px; }

.user-avatar-modern {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

/* THEME PICKER PILL */
.theme-picker { width: 100%; }
.btn-theme-pill {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem;
  border-radius: 50px;
  color: var(--slate-400);
  transition: var(--transition-base);
}
.btn-theme-pill.active {
  background: var(--bg-card);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}
[data-theme="dark"] .btn-theme-pill.active { 
  background: var(--slate-800); 
  color: white; 
}

/* TRANSITIONS */
.page-fade-enter-active, .page-fade-leave-active { transition: var(--transition-base); }
.page-fade-enter-from { opacity: 0; transform: scale(0.98); }
.page-fade-leave-to { opacity: 0; transform: scale(1.02); }
</style>