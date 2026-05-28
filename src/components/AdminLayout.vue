<template>
  <div class="admin-wrapper d-flex min-vh-100">
    <!-- Sidebar (Premium SaaS Sidebar) -->
    <aside 
      class="sidebar-container d-flex flex-column transition-all shadow-lg"
      :class="{ 'sidebar-collapsed': isCollapsed }"
    >
      <!-- Sidebar Header (Logo con Contraste Elevado) -->
      <div class="sidebar-header d-flex align-items-center justify-content-center border-bottom bg-body sticky-top">
        <div class="logo-area d-flex align-items-center justify-content-center w-100 px-3 gap-2">
          <!-- Sidebar expandido -->
          <template v-if="!isCollapsed">
            <img v-if="settingsStore.settings?.logo_sidebar_url"
              :src="settingsStore.settings.logo_sidebar_url"
              alt="Logo" class="sidebar-logo animate__animated animate__fadeIn">
            <template v-else>
              <i class="fa-solid fa-cubes text-primary fs-4"></i>
              <span class="fw-900 text-body-emphasis fs-5 animate__animated animate__fadeIn">SOLUPLAST</span>
            </template>
          </template>
          <!-- Sidebar colapsado -->
          <template v-else>
            <img v-if="settingsStore.settings?.logo_sidebar_compact_url"
              :src="settingsStore.settings.logo_sidebar_compact_url"
              alt="Logo" class="collapsed-logo-pill animate__animated animate__zoomIn" style="object-fit:contain;background:transparent;border:none">
            <div v-else class="collapsed-logo-pill animate__animated animate__zoomIn">
              <span class="fw-bold">S</span>
            </div>
          </template>
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

          <!-- Clientes -->
          <li class="nav-item" v-if="authStore.hasPermission('modulo-clientes')">
            <router-link :to="{ name: 'clientes' }" class="nav-link-custom" active-class="active">
              <i class="bi bi-people icon-main"></i>
              <span class="ms-3 nav-text" v-if="!isCollapsed">Clientes</span>
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
                <router-link :to="{ name: 'pedidos' }" class="nav-link-sub" active-class="active">
                  Pedidos
                </router-link>
              </li>
              <li class="nav-item">
                <router-link :to="{ name: 'produccion' }" class="nav-link-sub" active-class="active">
                  Producción
                </router-link>
              </li>
              <li class="nav-item">
                <router-link :to="{ name: 'envios' }" class="nav-link-sub" active-class="active">
                  Envíos
                </router-link>
              </li>
              <li class="nav-item">
                <router-link :to="{ name: 'pagos' }" class="nav-link-sub" active-class="active">
                  Pagos
                </router-link>
              </li>
              <li class="nav-item">
                <router-link :to="{ name: 'devoluciones' }" class="nav-link-sub" active-class="active">
                  Devoluciones
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
              <li class="nav-item" v-if="authStore.hasPermission('modulo-inventario')">
                <router-link :to="{ name: 'inventario' }" class="nav-link-sub" active-class="active">
                  Control de Stock
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
                {{ authStore.user?.name?.charAt(0).toUpperCase() }}
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
import { useSettingsStore } from '../stores/settings';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();

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
    operaciones: ['pedidos', 'produccion', 'envios', 'pagos', 'devoluciones'],
    catalogo: ['categorias', 'productos', 'inventario'],
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
  settingsStore.fetch();
});
</script>

<style scoped>
/* ─── SIDEBAR ───────────────────────────────────────── */
.sidebar-container {
  width: 240px;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  z-index: 1040;
  flex-shrink: 0;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-collapsed { width: 72px !important; }

.sidebar-header {
  height: 64px;
  flex-shrink: 0;
}

.sidebar-logo {
  height: 34px;
  max-width: 160px;
  object-fit: contain;
}

.collapsed-logo-pill {
  width: 36px;
  height: 36px;
  background: var(--color-primary);
  border-radius: 9px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 800;
}

/* ─── NAV LINKS ─────────────────────────────────────── */
.nav-link-custom {
  color: var(--sidebar-link);
  border-radius: var(--radius-md);
  padding: 0.65rem 0.875rem;
  border-left: 2.5px solid transparent;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  transition: var(--transition-fast);
  cursor: pointer;
  text-decoration: none;
}

.nav-link-custom:hover {
  background-color: var(--color-primary-soft);
  color: var(--sidebar-link-hover);
}

.nav-link-custom.active,
.nav-link-custom.active-group {
  background-color: var(--sidebar-bg-active);
  color: var(--sidebar-link-active) !important;
  border-left-color: var(--sidebar-link-active);
  font-weight: 600;
}

/* Dark sidebar hover override */
[data-theme="semidark"] .nav-link-custom:hover,
[data-theme="dark"] .nav-link-custom:hover {
  background-color: rgba(255, 255, 255, 0.07);
  color: #ffffff;
}

/* Icon centering in collapsed mode */
.sidebar-collapsed .nav-link-custom {
  justify-content: center;
  padding: 0.65rem;
  border-left-color: transparent !important;
}
.sidebar-collapsed .nav-link-custom.active,
.sidebar-collapsed .nav-link-custom.active-group {
  background-color: var(--sidebar-bg-active);
}

.icon-main { font-size: 1.05rem; flex-shrink: 0; }

.nav-sub {
  margin-left: 2rem;
  padding-left: 0.875rem;
  border-left: 1px solid var(--border-color);
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  gap: 0.125rem;
  display: flex;
}

.nav-link-sub {
  font-size: 0.85rem;
  padding: 0.4rem 0.75rem;
  color: var(--sidebar-link);
  text-decoration: none;
  border-radius: 6px;
  transition: var(--transition-fast);
  font-weight: 400;
  display: block;
}
.nav-link-sub:hover {
  color: var(--sidebar-link-hover);
  background: var(--color-primary-soft);
}
.nav-link-sub.active {
  color: var(--color-primary);
  font-weight: 600;
  background: var(--color-primary-soft);
}

[data-theme="semidark"] .nav-link-sub:hover,
[data-theme="dark"] .nav-link-sub:hover {
  background: rgba(255,255,255,0.07);
  color: #ffffff;
}
[data-theme="semidark"] .nav-link-sub.active,
[data-theme="dark"] .nav-link-sub.active {
  background: rgba(255,255,255,0.09);
  color: #ffffff;
}

.arrow-icon {
  font-size: 0.7rem;
  transition: transform 0.25s ease;
  opacity: 0.35;
}
.is-open .arrow-icon { transform: rotate(90deg); opacity: 0.65; }
.active-group .arrow-icon { opacity: 0.65; }

/* ─── HEADER ────────────────────────────────────────── */
.navbar-container {
  height: 64px;
  z-index: 1030;
  flex-shrink: 0;
}

.main-content { min-width: 0; }

.btn-toggle-modern {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}
.btn-toggle-modern:hover {
  background: var(--bg-hover);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}
.btn-toggle-modern:active { transform: scale(0.95); }

.btn-icon-only {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 9px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: var(--transition-fast);
}
.btn-icon-only:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.btn-profile-premium {
  border-radius: 10px !important;
  border: 1px solid var(--border-color) !important;
  background: var(--bg-card) !important;
  transition: var(--transition-fast);
  padding: 0.35rem 0.75rem !important;
}
.btn-profile-premium:hover {
  border-color: var(--border-color) !important;
  box-shadow: var(--shadow-md) !important;
}

.user-avatar-modern {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
}
.user-name { font-size: 0.875rem; }
.user-role { font-size: 0.75rem; }

/* ─── THEME PICKER ──────────────────────────────────── */
.theme-picker { width: 100%; }
.btn-theme-pill {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.45rem;
  border-radius: 50px;
  color: var(--text-muted);
  font-size: 0.875rem;
  transition: var(--transition-fast);
  cursor: pointer;
}
.btn-theme-pill:hover { color: var(--text-main); }
.btn-theme-pill.active {
  background: var(--bg-card);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}
[data-theme="dark"] .btn-theme-pill.active,
[data-theme="semidark"] .btn-theme-pill.active {
  background: var(--slate-800);
  color: #ffffff;
}
</style>