<template>
  <div class="categorias-page bg-body min-vh-100 d-flex flex-column">
    <PublicNavbar />

    <!-- Hero -->
    <section class="cats-hero pt-5 mt-5 pb-4 position-relative overflow-hidden">
      <div class="premium-liquid-bg position-absolute inset-0 z-0">
        <div class="liquid-blob blob-1"></div>
        <div class="liquid-blob blob-2"></div>
        <div class="liquid-overlay"></div>
      </div>
      <div class="container py-5 position-relative z-1">
        <nav aria-label="breadcrumb" class="mb-4">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/" class="text-body-secondary text-decoration-none small opacity-60">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active text-body-emphasis fw-bold small" aria-current="page">Categorías</li>
          </ol>
        </nav>
        <div class="animate__animated animate__fadeInUp">
          <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2 fw-bold mb-3 d-inline-block">
            <i class="fa-solid fa-layer-group me-1"></i> Colección Completa
          </span>
          <h1 class="display-4 fw-900 mb-3 lh-1 text-body-emphasis">Categorías de Productos</h1>
          <p class="lead text-body-secondary mb-0" style="max-width: 600px;">
            Encuentra exactamente lo que necesitas explorando nuestras líneas de soluciones plásticas industriales.
          </p>
        </div>
      </div>
    </section>

    <!-- Contenido principal -->
    <main class="flex-grow-1 py-8">
      <div class="container">

        <!-- Barra de búsqueda -->
        <div class="row justify-content-center mb-6">
          <div class="col-lg-6">
            <div class="input-group input-group-lg search-bar shadow-sm rounded-pill overflow-hidden">
              <span class="input-group-text bg-white border-0 ps-4">
                <i class="fa-solid fa-magnifying-glass text-primary"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control bg-white border-0 shadow-none"
                placeholder="Buscar categoría..."
              >
              <button v-if="searchQuery" class="btn bg-white border-0 pe-4" @click="searchQuery = ''">
                <i class="fa-solid fa-xmark text-muted"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading skeletons -->
        <template v-if="isLoading">
          <div class="row g-4">
            <div class="col-xl-3 col-lg-4 col-md-6" v-for="i in 8" :key="i">
              <div class="skeleton-cat-card rounded-4"></div>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <template v-else-if="filteredCategories.length === 0">
          <div class="text-center py-10">
            <i class="fa-solid fa-folder-open display-4 text-body-secondary opacity-30 mb-4 d-block"></i>
            <h4 class="fw-800 text-body-emphasis mb-2">Sin resultados</h4>
            <p class="text-body-secondary">No hay categorías que coincidan con "{{ searchQuery }}".</p>
            <button class="btn btn-outline-primary rounded-pill px-4 mt-2" @click="searchQuery = ''">
              <i class="fa-solid fa-xmark me-1"></i> Limpiar búsqueda
            </button>
          </div>
        </template>

        <!-- Grid de categorías -->
        <template v-else>
          <div class="row g-4">
            <div
              class="col-xl-3 col-lg-4 col-md-6"
              v-for="(cat, idx) in filteredCategories"
              :key="cat.id"
            >
              <router-link
                :to="{ name: 'catalogo', query: { category: cat.id } }"
                class="cat-card-link text-decoration-none"
              >
                <div class="cat-card animate__animated animate__fadeInUp" :style="{ animationDelay: `${Math.min(idx, 7) * 0.05}s` }">
                  <!-- Icono / Imagen -->
                  <div class="cat-img-wrapper">
                    <img
                      v-if="cat.image"
                      :src="cat.image"
                      :alt="cat.name"
                      class="cat-img"
                      @error="handleImageError"
                    >
                    <div v-else class="cat-icon-fallback">
                      <i class="fa-solid fa-boxes-stacked"></i>
                    </div>
                    <!-- Overlay -->
                    <div class="cat-overlay"></div>
                    <!-- Badge productos -->
                    <span class="cat-count-badge">{{ cat.products_count ?? 0 }} productos</span>
                  </div>

                  <!-- Info -->
                  <div class="cat-info">
                    <h5 class="cat-name fw-800 mb-1 text-body-emphasis">{{ cat.name }}</h5>
                    <p v-if="cat.description" class="cat-desc text-body-secondary smaller mb-0 text-truncate-2">
                      {{ cat.description }}
                    </p>
                    <p v-else class="cat-desc text-body-secondary smaller mb-0 opacity-50">
                      Ver colección completa
                    </p>
                    <span class="cat-cta mt-2 d-flex align-items-center gap-1 text-primary fw-bold smaller">
                      Explorar <i class="fa-solid fa-arrow-right" style="font-size: 0.75rem;"></i>
                    </span>
                  </div>
                </div>
              </router-link>
            </div>
          </div>

          <!-- CTA Ver Catálogo -->
          <div class="text-center mt-8">
            <router-link
              :to="{ name: 'catalogo' }"
              class="btn btn-brand btn-lg rounded-pill px-5 py-3 shadow text-decoration-none fw-bold"
            >
              <i class="fa-solid fa-store me-2"></i>
              Ver Todo el Catálogo
            </router-link>
          </div>
        </template>
      </div>
    </main>

    <PublicFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../plugins/axios';
import PublicNavbar from '../components/PublicNavbar.vue';
import PublicFooter from '../components/PublicFooter.vue';

const categories   = ref([]);
const isLoading    = ref(true);
const searchQuery  = ref('');

const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) return categories.value;
  const q = searchQuery.value.toLowerCase();
  return categories.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.description || '').toLowerCase().includes(q)
  );
});

const fetchCategories = async () => {
  try {
    const response = await api.get('/public/categories');
    categories.value = Array.isArray(response.data) ? response.data : (response.data.data || []);
  } catch (e) {
    console.error('Error al cargar categorías:', e);
  } finally {
    isLoading.value = false;
  }
};

const handleImageError = (e) => {
  e.target.closest('.cat-img-wrapper').querySelector('.cat-img')?.remove();
};

onMounted(() => {
  window.scrollTo(0, 0);
  fetchCategories();
});
</script>

<style scoped>
.fw-900 { font-weight: 900; }
.py-8  { padding-top: 5rem; padding-bottom: 5rem; }
.py-10 { padding-top: 7rem; padding-bottom: 7rem; }
.mt-8  { margin-top: 5rem; }
.mb-6  { margin-bottom: 4rem; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }

/* Hero liquid */
.premium-liquid-bg {
  pointer-events: none;
  background: var(--bs-body-bg);
  overflow: hidden;
}
.liquid-blob {
  position: absolute;
  filter: blur(140px);
  border-radius: 50%;
  opacity: 0.9;
}
.blob-1 {
  width: 600px; height: 600px;
  background: rgb(17, 92, 255);
  filter: blur(140px) brightness(1.1) hue-rotate(10deg);
  top: -20%; left: -10%;
  animation: lmove1 6s infinite alternate;
}
.blob-2 {
  width: 400px; height: 400px;
  background: rgb(17, 92, 255);
  filter: blur(140px) brightness(1.2) hue-rotate(-20deg);
  bottom: -20%; right: -5%;
  animation: lmove2 8s infinite alternate;
}
.liquid-overlay {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 50%, transparent 0%, var(--bs-body-bg) 85%);
  opacity: 0.65;
}
@keyframes lmove1 { to { transform: translate(60px, 30px) scale(1.1); } }
@keyframes lmove2 { to { transform: translate(-40px, -20px) scale(1.12); } }

/* Search bar */
.search-bar {
  border: 1px solid rgba(0,0,0,0.08);
  transition: box-shadow 0.2s ease;
}
.search-bar:focus-within {
  box-shadow: 0 0 0 3px rgba(var(--bs-primary-rgb), 0.15) !important;
  border-color: var(--color-primary);
}

/* Category cards */
.cat-card-link:hover { text-decoration: none; }

.cat-card {
  background: white;
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.06);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}

.cat-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 30px 60px rgba(0,0,0,0.1);
  border-color: rgba(var(--bs-primary-rgb), 0.2);
}

/* Image */
.cat-img-wrapper {
  position: relative;
  height: 180px;
  overflow: hidden;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.cat-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.cat-card:hover .cat-img {
  transform: scale(1.08);
}

.cat-icon-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 3rem;
  color: var(--color-primary);
  opacity: 0.35;
}

.cat-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%);
  transition: opacity 0.3s ease;
  opacity: 0;
}

.cat-card:hover .cat-overlay {
  opacity: 1;
}

.cat-count-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(255,255,255,0.9);
  color: var(--color-primary);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 0.25rem 0.65rem;
  border-radius: 50px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(var(--bs-primary-rgb), 0.15);
}

/* Info */
.cat-info {
  padding: 1.25rem;
}

.cat-name {
  font-size: 1.1rem;
  line-height: 1.3;
  transition: color 0.2s ease;
}

.cat-card:hover .cat-name {
  color: var(--color-primary) !important;
}

.cat-desc {
  font-size: 0.83rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cat-cta {
  transition: gap 0.2s ease;
}

.cat-card:hover .cat-cta {
  gap: 0.5rem !important;
}

/* Skeleton */
.skeleton-cat-card {
  height: 280px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: skel-load 1.5s infinite;
}
@keyframes skel-load {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Responsive */
@media (max-width: 767px) {
  .cat-img-wrapper { height: 150px; }
}
</style>
