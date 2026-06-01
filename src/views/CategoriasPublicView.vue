<template>
  <div class="categorias-page bg-body min-vh-100 d-flex flex-column">
    <PublicNavbar />

    <!-- Hero Section Reducida Style (idéntico a CatalogView) -->
    <section class="categorias-hero pt-5 mt-5 pb-4 position-relative overflow-hidden bg-white border-bottom">
      <div class="container py-4 position-relative z-1">
        <div class="row align-items-center gy-4">
          <div class="col-lg-12">
            <h1 class="display-4 fw-900 mb-3 lh-1 text-dark" style="letter-spacing: -0.04em;">Categorías de Productos</h1>
            <p class="lead text-muted mb-0 max-w-600">Encuentra exactamente lo que necesitas explorando nuestras líneas de soluciones plásticas industriales.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenido principal -->
    <main class="flex-grow-1 py-5">
      <div class="container">

        <!-- Barra de búsqueda premium -->
        <div class="row justify-content-center mb-5">
          <div class="col-lg-6">
            <div class="input-group input-group-premium shadow-sm rounded-4 overflow-hidden border">
              <span class="input-group-text bg-white border-0 ps-4">
                <i class="fa-solid fa-magnifying-glass text-primary" style="font-size: 1.1rem;"></i>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control bg-white border-0 shadow-none py-3"
                style="font-size: 0.95rem;"
                placeholder="Buscar categoría..."
              >
              <button v-if="searchQuery" class="btn bg-white border-0 pe-4 d-flex align-items-center justify-content-center" @click="searchQuery = ''">
                <i class="fa-solid fa-xmark text-muted"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Loading skeletons premium -->
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
            <button class="btn btn-outline-brand rounded-pill px-4 mt-2" @click="searchQuery = ''">
              Limpiar búsqueda
            </button>
          </div>
        </template>

        <!-- Grid de categorías premium -->
        <template v-else>
          <div class="row g-4">
            <div
              class="col-xl-3 col-lg-4 col-md-6"
              v-for="(cat, idx) in filteredCategories"
              :key="cat.id"
            >
              <router-link
                :to="{ name: 'catalogo', query: { category: cat.id } }"
                class="cat-card-link text-decoration-none d-block h-100"
              >
                <div class="premium-cat-card group animate__animated animate__fadeInUp h-100" :style="{ animationDelay: `${Math.min(idx, 7) * 0.05}s` }">
                  <div class="card-inner-premium h-100 shadow-sm transition-all overflow-hidden bg-white border-0 rounded-4 d-flex flex-column">
                    <!-- Visual Wrapper -->
                    <div class="cat-visual-wrapper position-relative overflow-hidden p-3 bg-white">
                      <!-- Badge productos -->
                      <span class="badge bg-dark text-white position-absolute top-3 start-3 z-3 px-3 py-1 shadow-sm rounded-pill smaller fw-bold">
                        {{ cat.products_count ?? 0 }} productos
                      </span>
                      
                      <!-- Image Container -->
                      <div class="cat-img-main-container d-flex align-items-center justify-content-center p-2 rounded-4">
                        <img
                          v-if="(cat.image_url || cat.image) && !imageLoadErrors[cat.id]"
                          :src="cat.image_url || cat.image"
                          :alt="cat.name"
                          class="img-fluid cat-display-img transition-all"
                          @error="handleImageError(cat.id)"
                        >
                        <div v-else class="cat-icon-fallback d-flex align-items-center justify-content-center w-100 h-100 bg-light rounded-4">
                          <i class="fa-solid fa-boxes-stacked fs-1 text-secondary opacity-30"></i>
                        </div>
                      </div>
                    </div>

                    <!-- Info Area -->
                    <div class="cat-body-premium p-4 text-center border-top bg-white d-flex flex-column flex-grow-1">
                      <h5 class="fw-bold mb-2 text-dark text-truncate" style="font-size: 1.15rem; line-height: 1.4;">{{ cat.name }}</h5>
                      <p v-if="cat.description" class="text-muted smaller mb-3 text-truncate-2" style="font-size: 0.825rem; line-height: 1.5; height: 2.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        {{ cat.description }}
                      </p>
                      <p v-else class="text-muted smaller mb-3 opacity-50" style="font-size: 0.825rem; line-height: 1.5; height: 2.5rem;">
                        Ver colección completa de esta línea.
                      </p>
                      
                      <div class="d-grid mt-auto">
                        <span class="btn btn-premium-action btn-sm py-2 rounded-3 d-flex align-items-center justify-content-center gap-2">
                          Explorar Línea <i class="fa-solid fa-arrow-right" style="font-size: 0.75rem;"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </router-link>
            </div>
          </div>

          <div class="text-center mt-5 pt-4">
            <router-link
              :to="{ name: 'catalogo' }"
              class="btn btn-brand btn-lg px-5 py-3 text-decoration-none fw-bold"
            >
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

const categories = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const imageLoadErrors = ref({});

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

const handleImageError = (id) => {
  imageLoadErrors.value[id] = true;
};

onMounted(() => {
  window.scrollTo(0, 0);
  fetchCategories();
});
</script>

<style scoped>
.fw-800 { font-weight: 800; }
.py-10 { padding-top: 7rem; padding-bottom: 7rem; }
.max-w-600 { max-width: 600px; }
.smaller { font-size: 0.75rem; }

/* Hero section style */
.categorias-hero {
  padding-top: 6rem;
  background: var(--bs-body-bg);
}

/* Input group premium */
.input-group-premium {
  border-color: rgba(0, 0, 0, 0.05);
  background: white;
  transition: all 0.3s ease;
}

.input-group-premium:focus-within {
  border-color: #121212 !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important;
}

/* Premium Category Cards */
.premium-cat-card {
  perspective: 1000px;
}

.card-inner-premium {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  background: white;
  position: relative;
  border: 1px solid rgba(0,0,0,0.05) !important;
}

.premium-cat-card:hover .card-inner-premium {
  transform: translateY(-12px);
  box-shadow: 0 40px 80px rgba(0,0,0,0.08) !important;
  border-color: #121212 !important;
}

.cat-visual-wrapper {
  z-index: 1;
}

.cat-img-main-container {
  aspect-ratio: 1 / 1.1;
  overflow: hidden;
  background: #f8fafc;
  transition: all 0.5s ease;
  width: 100%;
}

.premium-cat-card:hover .cat-img-main-container {
  background: white;
}

.cat-display-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-cat-card:hover .cat-display-img {
  transform: scale(1.08);
}

.cat-icon-fallback {
  height: 100%;
  width: 100%;
  transition: all 0.5s ease;
}

/* Action button inside card */
.btn-premium-action {
  background: #f1f5f9;
  color: #475569;
  border: none;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.725rem;
  letter-spacing: 0.05em;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-cat-card:hover .btn-premium-action {
  background: #121212;
  color: white;
  box-shadow: 0 10px 20px rgba(18, 18, 18, 0.15);
}

/* Skeletons */
.skeleton-cat-card {
  height: 460px;
  background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
  background-size: 200% 100%;
  animation: skel-load 1.5s infinite;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

@keyframes skel-load {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* SHOPIFY GLOBAL STYLING OVERRIDES FOR VUE COMPONENTS */
:deep(.btn) {
  border-radius: 0px !important;
  box-shadow: none !important;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  font-weight: 700;
  padding: 0.8rem 1.6rem !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border-width: 1px !important;
}

:deep(.btn-brand) {
  background-color: #121212 !important;
  border-color: #121212 !important;
  color: #ffffff !important;
}

:deep(.btn-brand:hover) {
  background-color: #333333 !important;
  border-color: #333333 !important;
}

:deep(.btn-outline-brand) {
  border: 1px solid #121212 !important;
  color: #121212 !important;
  background: transparent !important;
}

:deep(.btn-outline-brand:hover) {
  background-color: #121212 !important;
  color: #ffffff !important;
}

/* NAVBAR */
:deep(.glass-navbar) {
  background: #ffffff !important;
  backdrop-filter: none !important;
  border-bottom: 1px solid #e8e8e1 !important;
  box-shadow: none !important;
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
}

:deep(.nav-link) {
  color: #121212 !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  opacity: 0.75;
}

:deep(.nav-link:hover),
:deep(.nav-link.active) {
  opacity: 1;
}

:deep(.nav-link::after) {
  display: none !important;
}

:deep(.cart-btn-desktop),
:deep(.cart-btn-mobile) {
  border-radius: 0px !important;
  border: 1px solid #121212 !important;
  background: transparent !important;
  color: #121212 !important;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
}

:deep(.cart-btn-desktop:hover),
:deep(.cart-btn-mobile:hover) {
  background: #121212 !important;
  color: #ffffff !important;
  box-shadow: none !important;
}

:deep(.cart-badge-pill) {
  border-radius: 0px !important;
  background-color: #121212 !important;
  color: #ffffff !important;
  font-weight: 800;
}
</style>
