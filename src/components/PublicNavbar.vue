<template>
  <nav class="navbar navbar-expand-lg fixed-top glass-navbar py-3 px-md-5">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand d-flex align-items-center gap-2">
        <i class="fa-solid fa-cubes text-primary fs-3"></i>
        <span class="fw-bold text-body-emphasis fs-4 d-none d-sm-block">SOLUPLAST</span>
      </router-link>

      <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#publicNav">
        <i class="bi bi-list fs-1 text-body-emphasis"></i>
      </button>

      <div class="collapse navbar-collapse" id="publicNav">
        <ul class="navbar-nav mx-auto gap-lg-4 mb-2 mb-lg-0 fw-medium">
          <li class="nav-item">
            <router-link to="/" class="nav-link" :class="{ 'text-body-emphasis': isHome, 'text-body-secondary': !isHome }">
              Inicio
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/catalogo" class="nav-link" :class="{ 'text-body-emphasis': isCatalog, 'text-body-secondary': !isCatalog }">
              Catálogo Completo
            </router-link>
          </li>
          <li class="nav-item" v-if="isHome">
            <a href="#categorias" class="nav-link text-body-secondary" @click.prevent="scrollTo('#categorias')">
              Categorías
            </a>
          </li>
          <li class="nav-item" v-if="isHome">
            <a href="#nosotros" class="nav-link text-body-secondary" @click.prevent="scrollTo('#nosotros')">
              Nosotros
            </a>
          </li>
        </ul>

        <div class="d-flex align-items-center gap-3">
          <router-link :to="{ name: 'carrito' }" class="btn btn-light btn-sm position-relative rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;" aria-label="Ver carrito">
            <i class="fa-solid fa-shopping-bag text-primary fs-5"></i>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" v-if="cartStore.cartQty > 0" style="font-size: 0.7rem;">
              {{ cartStore.cartQty }}
            </span>
          </router-link>
          <router-link :to="{ name: 'login' }" class="btn btn-link text-body-emphasis text-decoration-none fw-semibold p-0">
            Iniciar Sesión
          </router-link>
          <BaseButton variant="brand" class="px-4 py-2 rounded-pill shadow" v-if="isHome" @click="scrollTo('#productos')">
            Explorar Catálogo
          </BaseButton>
          <router-link v-else to="/catalogo" class="btn btn-brand px-4 py-2 rounded-pill shadow text-decoration-none fw-semibold">
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

const isHome = computed(() => route.name === 'home');
const isCatalog = computed(() => route.name === 'catalogo');

const scrollTo = (id) => {
  const el = document.querySelector(id);
  if (el) {
    const offset = 90;
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = el.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};
</script>

<style scoped>
/* NAVBAR */
.glass-navbar {
  background: rgba(var(--bs-body-bg-rgb), 0.7);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-bottom: 1px solid var(--border-color);
  z-index: 1100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-navbar:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.nav-link {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.text-body-emphasis {
  color: var(--text-emphasis) !important;
}

.navbar-brand {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.navbar-brand:hover {
  transform: scale(1.05);
}

@media (max-width: 991px) {
  .navbar-collapse {
    border-top: 1px solid var(--border-color);
    margin-top: 1rem;
    padding-top: 1rem;
  }
}
</style>
