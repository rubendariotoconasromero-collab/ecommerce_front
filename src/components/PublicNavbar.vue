<template>
  <nav class="navbar navbar-expand-lg fixed-top glass-navbar py-3 px-md-5">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand d-flex align-items-center gap-2">
        <i class="fa-solid fa-cubes text-primary fs-3"></i>
        <span class="fw-bold text-body-emphasis fs-4 d-none d-sm-block">SOLUPLAST</span>
      </router-link>

      <div class="d-flex align-items-center gap-3 d-lg-none">
        <!-- Cart mobile -->
        <router-link :to="{ name: 'carrito' }" class="cart-btn-mobile position-relative" aria-label="Ver carrito">
          <i class="fa-solid fa-shopping-bag fs-5"></i>
          <span v-if="cartStore.cartQty > 0" class="cart-badge-pill">{{ cartStore.cartQty }}</span>
        </router-link>
        <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#publicNav">
          <i class="bi bi-list fs-1 text-body-emphasis"></i>
        </button>
      </div>

      <div class="collapse navbar-collapse" id="publicNav">
        <ul class="navbar-nav mx-auto gap-lg-4 mb-2 mb-lg-0 fw-medium">
          <li class="nav-item">
            <router-link to="/" class="nav-link" :class="{ active: isHome }">
              Inicio
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/categorias" class="nav-link" :class="{ active: isCategories }">
              Categorías
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/catalogo" class="nav-link" :class="{ active: isCatalog }">
              Catálogo
            </router-link>
          </li>
          <li class="nav-item" v-if="isHome">
            <a href="#nosotros" class="nav-link" @click.prevent="scrollTo('#nosotros')">
              Nosotros
            </a>
          </li>
        </ul>

        <div class="d-flex align-items-center gap-3">
          <!-- Cart button desktop -->
          <router-link :to="{ name: 'carrito' }" class="cart-btn-desktop position-relative d-none d-lg-flex align-items-center gap-2" aria-label="Ver carrito">
            <i class="fa-solid fa-shopping-bag fs-5"></i>
            <span class="fw-semibold" style="font-size: 0.875rem;">Carrito</span>
            <span v-if="cartStore.cartQty > 0" class="cart-badge-pill">{{ cartStore.cartQty }}</span>
          </router-link>

          <router-link :to="{ name: 'login' }" class="btn btn-link text-body-emphasis text-decoration-none fw-semibold p-0 d-none d-sm-block">
            Iniciar Sesión
          </router-link>

          <BaseButton variant="brand" class="px-4 py-2 rounded-pill shadow d-none d-lg-block" v-if="isHome" @click="scrollTo('#productos')">
            Explorar
          </BaseButton>
          <router-link v-else-if="!isCatalog" to="/catalogo" class="btn btn-brand px-4 py-2 rounded-pill shadow text-decoration-none fw-semibold d-none d-lg-block">
            Ver Catálogo
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCartStore } from '../stores/cart';
import BaseButton from './base/BaseButton.vue';

const cartStore = useCartStore();
const route = useRoute();

const isHome       = computed(() => route.name === 'home');
const isCatalog    = computed(() => route.name === 'catalogo');
const isCategories = computed(() => route.name === 'categorias-publicas');

const scrollTo = (id) => {
  const el = document.querySelector(id);
  if (el) {
    const offset = 90;
    const bodyRect    = document.body.getBoundingClientRect().top;
    const elementRect = el.getBoundingClientRect().top;
    const offsetPosition = elementRect - bodyRect - offset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
};
</script>

<style scoped>
.glass-navbar {
  background: rgba(var(--bs-body-bg-rgb), 0.85);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--border-color);
  z-index: 1100;
  transition: all 0.3s ease;
}

.glass-navbar:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.nav-link {
  color: var(--bs-body-color);
  opacity: 0.7;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width 0.3s ease;
  border-radius: 2px;
}

.nav-link:hover,
.nav-link.active {
  opacity: 1;
  color: var(--bs-body-emphasis) !important;
}

.nav-link.active::after,
.nav-link:hover::after {
  width: 60%;
}

.navbar-brand {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.navbar-brand:hover {
  transform: scale(1.04);
}

/* Cart button desktop */
.cart-btn-desktop {
  position: relative;
  padding: 0.45rem 1rem 0.45rem 0.8rem;
  border-radius: 50px;
  background: rgba(var(--bs-primary-rgb), 0.08);
  color: var(--color-primary);
  text-decoration: none;
  border: 1px solid rgba(var(--bs-primary-rgb), 0.15);
  transition: all 0.2s ease;
  font-weight: 600;
}

.cart-btn-desktop:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  box-shadow: 0 6px 20px rgba(var(--bs-primary-rgb), 0.25);
  transform: translateY(-1px);
}

/* Cart button mobile */
.cart-btn-mobile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(var(--bs-primary-rgb), 0.08);
  color: var(--color-primary);
  text-decoration: none;
  border: 1px solid rgba(var(--bs-primary-rgb), 0.15);
  transition: all 0.2s ease;
}

.cart-btn-mobile:hover {
  background: var(--color-primary);
  color: white;
}

/* Badge counter */
.cart-badge-pill {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 50px;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
}

@media (max-width: 991px) {
  .navbar-collapse {
    border-top: 1px solid var(--border-color);
    margin-top: 1rem;
    padding-top: 1rem;
  }

  .nav-link {
    padding: 0.5rem 0;
  }
}
</style>
