<template>
  <div class="catalog-page bg-body min-vh-100">
    <!-- Public Navbar Reutilizable -->
    <PublicNavbar />

    <!-- Hero Section Reducida Shopify Style -->
    <section class="catalog-hero pt-5 mt-5 pb-4 position-relative overflow-hidden bg-white border-bottom">
      <div class="container py-4 position-relative z-1">
        <div class="row align-items-center gy-4">
          <div class="col-lg-12">
            <h1 class="display-4 fw-900 mb-3 lh-1 text-dark" style="letter-spacing: -0.04em;">Catálogo de Productos</h1>
            <p class="lead text-muted mb-0 max-w-600">Descubre soluciones plásticas de alta ingeniería diseñadas para el máximo rendimiento.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="catalog-content py-5">
      <div class="container">
        <div class="row g-4">
          <!-- Sidebar Filtros -->
          <div class="col-lg-3">
            <div class="filters-card bg-white p-4 border sticky-top" style="top: 100px;">
              <div class="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <h6 class="fw-bold mb-0 text-dark text-uppercase tracking-wider">Filtros</h6>
                <button v-if="hasActiveFilters" class="btn btn-link btn-sm text-danger p-0 fw-bold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;" @click="resetFilters">
                  Limpiar
                </button>
              </div>

              <!-- Search -->
              <div class="mb-4">
                <label class="form-label fw-800 smaller text-uppercase">Buscar Producto</label>
                <div class="input-group input-group-premium">
                  <span class="input-group-text bg-transparent border-end-0">
                    <i class="fa-solid fa-magnifying-glass text-dark"></i>
                  </span>
                  <input 
                    v-model="filters.search" 
                    type="text" 
                    class="form-control border-start-0 shadow-none" 
                    placeholder="Nombre, SKU..."
                    @input="applyFilters"
                  >
                </div>
              </div>

              <!-- Categories -->
              <div class="mb-4">
                <label class="form-label fw-800 smaller text-uppercase mb-3">Categoría</label>
                <div class="d-flex flex-column gap-2">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      id="allCategories" 
                      value="" 
                      v-model="filters.category_id"
                      @change="applyFilters"
                    >
                    <label class="form-check-label fw-500" for="allCategories">
                      Todas las categorías
                    </label>
                  </div>
                  <div v-for="cat in categories" :key="cat.id" class="form-check">
                    <input 
                      class="form-check-input" 
                      type="radio" 
                      :id="`cat-${cat.id}`" 
                      :value="cat.id" 
                      v-model="filters.category_id"
                      @change="applyFilters"
                    >
                    <label class="form-check-label fw-500" :for="`cat-${cat.id}`">
                      {{ cat.name }}
                      <span class="smaller text-body-secondary">({{ cat.products_count }})</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Price Range -->
              <div class="mb-4">
                <label class="form-label fw-800 smaller text-uppercase mb-3">Rango de Precio</label>
                <div class="price-inputs d-flex gap-2 mb-3">
                  <input 
                    v-model.number="filters.minPrice" 
                    type="number" 
                    placeholder="Min" 
                    class="form-control form-control-sm"
                    @change="applyFilters"
                  >
                  <span class="d-flex align-items-center">-</span>
                  <input 
                    v-model.number="filters.maxPrice" 
                    type="number" 
                    placeholder="Max" 
                    class="form-control form-control-sm"
                    @change="applyFilters"
                  >
                </div>
                <div class="price-info text-body-secondary smallest">
                  <span v-if="filters.minPrice">Desde: Bs. {{ filters.minPrice }}</span>
                  <span v-if="filters.maxPrice">Hasta: Bs. {{ filters.maxPrice }}</span>
                </div>
              </div>

              <!-- Stock Status -->
              <div class="mb-4">
                <label class="form-label fw-800 smaller text-uppercase mb-3">Disponibilidad</label>
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="inStock" 
                    v-model="filters.inStock"
                    @change="applyFilters"
                  >
                  <label class="form-check-label fw-500" for="inStock">
                    Disponible
                  </label>
                </div>
              </div>

              <!-- Featured Only -->
              <div>
                <label class="form-label fw-800 smaller text-uppercase mb-3">Mostrar</label>
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="featuredOnly" 
                    v-model="filters.featuredOnly"
                    @change="applyFilters"
                  >
                  <label class="form-check-label fw-500" for="featuredOnly">
                    <i class="fa-solid fa-star text-warning"></i> Solo destacados
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Products Grid -->
          <div class="col-lg-9">
            <!-- Toolbar -->
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3 pb-4 border-bottom">
              <div class="d-flex align-items-center gap-3">
                <span class="fw-bold text-body-emphasis">{{ filteredCount }} resultados</span>
                <span v-if="hasActiveFilters" class="badge bg-primary-soft text-primary px-3 py-2 rounded-pill">
                  Filtros activos
                </span>
              </div>

              <div class="d-flex gap-3">
                <select v-model="sortBy" class="form-select form-select-sm w-auto" @change="applyFilters">
                  <option value="featured">Destacados primero</option>
                  <option value="newest">Más recientes</option>
                  <option value="price-low">Menor precio</option>
                  <option value="price-high">Mayor precio</option>
                  <option value="name">Nombre A-Z</option>
                </select>
              </div>
            </div>

            <!-- Loading State -->
            <template v-if="isLoading">
              <div class="row g-4">
                <div class="col-md-6 col-lg-4" v-for="i in 6" :key="i">
                  <div class="skeleton-product rounded-5 h-100"></div>
                </div>
              </div>
            </template>

            <!-- Empty State -->
            <template v-else-if="filteredProducts.length === 0">
              <div class="text-center py-10">
                <div class="mb-4">
                  <i class="fa-solid fa-inbox fs-1 text-body-secondary opacity-50"></i>
                </div>
                <h4 class="fw-800 text-body-emphasis mb-2">No hay productos que coincidan</h4>
                <p class="text-body-secondary mb-4">Intenta cambiar los filtros o realiza una búsqueda diferente.</p>
                <BaseButton variant="outline-brand" class="rounded-pill px-4" @click="resetFilters">
                  Limpiar filtros
                </BaseButton>
              </div>
            </template>

            <!-- Products Grid -->
            <template v-else>
              <div class="row g-4">
                <div class="col-md-6 col-lg-4" v-for="product in paginatedProducts" :key="product.id">
                  <div 
                    class="premium-product-card group animate__animated animate__fadeInUp"
                    @mouseenter="handleMouseEnter(product)"
                    @mouseleave="handleMouseLeave(product)"
                  >
                    <div class="card-inner-premium h-100 shadow-sm transition-all overflow-hidden bg-white border-0 rounded-4">
                      <!-- Image Wrapper -->
                      <div class="product-visual-wrapper position-relative overflow-hidden p-3 bg-white">
                        <BaseBadge v-if="product.is_featured" variant="warning" class="position-absolute top-3 start-3 z-3 px-3 py-1 shadow-sm rounded-pill smaller fw-bold">DESTACADO</BaseBadge>
                        
                        <router-link :to="{ name: 'producto-detalle', params: { id: product.id } }" class="product-img-main-container d-flex align-items-center justify-content-center p-2 text-decoration-none">
                          <img
                            :src="getProductImage(product)"
                            @error="handleImageError"
                            class="img-fluid product-display-img transition-all"
                            :alt="product.name"
                          >
                        </router-link>
                      </div>

                      <!-- Info Area -->
                      <div class="product-body-premium p-3 text-center border-top bg-white">
                        <div class="text-muted smaller mb-1 text-uppercase tracking-wider" style="font-size: 0.65rem; font-weight: 700;">{{ product.category?.name || 'General' }}</div>
                        <router-link :to="{ name: 'producto-detalle', params: { id: product.id } }" class="text-decoration-none">
                          <h6 class="fw-bold mb-2 text-dark text-truncate product-title-hover" style="font-size: 0.95rem; line-height: 1.3;">{{ product.name }}</h6>
                        </router-link>
                        
                        <div class="price-container-premium mb-3">
                          <span class="price-value fs-5 fw-bold text-dark">Bs. {{ parseFloat(product.sale_price).toLocaleString() }}</span>
                        </div>

                        <div class="d-grid gap-2">
                          <button class="btn btn-brand btn-sm btn-card-action py-2" @click="handleAddToCart(product)">
                            <i class="bi bi-cart-plus-fill me-1"></i> Agregar
                          </button>
                          <router-link :to="{ name: 'producto-detalle', params: { id: product.id } }" class="btn btn-outline-brand btn-sm btn-card-action py-2">
                            Ver Detalles
                          </router-link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="d-flex justify-content-center mt-8 mb-4">
                <nav>
                  <ul class="pagination pagination-premium shadow-sm">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                        <i class="fa-solid fa-chevron-left me-1"></i> Primera
                      </button>
                    </li>
                    <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                      <button class="page-link" @click="currentPage = page">{{ page }}</button>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                        Última <i class="fa-solid fa-chevron-right ms-1"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-5 bg-light text-dark mt-5 border-top">
      <div class="container text-center py-3">
        <h3 class="fw-900 mb-3 text-uppercase tracking-wide" style="font-size: 1.5rem;">¿No encuentras lo que necesitas?</h3>
        <p class="lead mb-4 text-muted">Nuestro equipo de ventas está disponible para ayudarte a encontrar la solución perfecta.</p>
        <BaseButton variant="brand" class="px-5 py-3 fw-bold shadow-none">
          Contactar Ventas
        </BaseButton>
      </div>
    </section>

    <!-- Footer Reutilizable -->
    <PublicFooter :settings="settings" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../plugins/axios';
import { useCartStore } from '../stores/cart';
import { Toast } from '../plugins/swal';
import BaseButton from '../components/base/BaseButton.vue';
import BaseBadge from '../components/base/BaseBadge.vue';
import PublicNavbar from '../components/PublicNavbar.vue';
import PublicFooter from '../components/PublicFooter.vue';

const cartStore = useCartStore();
const route  = useRoute();
const router = useRouter();

const handleAddToCart = (product) => {
  cartStore.addToCart(product, 1);
  Toast.fire({ icon: 'success', title: `"${product.name}" agregado al carrito` });
};

// State
const products = ref([]);
const categories = ref([]);
const isLoading = ref(true);
const currentPage = ref(1);
const itemsPerPage = ref(12);
const sortBy = ref('featured');

const filters = ref({
  search: '',
  category_id: '',
  minPrice: null,
  maxPrice: null,
  inStock: false,
  featuredOnly: false
});

// Computed
const filteredProducts = computed(() => {
  let result = products.value;

  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search)
    );
  }

  // Category filter
  if (filters.value.category_id) {
    result = result.filter(p => p.category_id == filters.value.category_id);
  }

  // Price filter
  if (filters.value.minPrice !== null) {
    result = result.filter(p => parseFloat(p.sale_price) >= filters.value.minPrice);
  }
  if (filters.value.maxPrice !== null) {
    result = result.filter(p => parseFloat(p.sale_price) <= filters.value.maxPrice);
  }

  // Featured filter
  if (filters.value.featuredOnly) {
    result = result.filter(p => p.is_featured);
  }

  // Stock filter
  if (filters.value.inStock) {
    result = result.filter(p => p.is_active);
  }

  // Sort
  if (sortBy.value === 'featured') {
    result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  } else if (sortBy.value === 'newest') {
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy.value === 'price-low') {
    result.sort((a, b) => parseFloat(a.sale_price) - parseFloat(b.sale_price));
  } else if (sortBy.value === 'price-high') {
    result.sort((a, b) => parseFloat(b.sale_price) - parseFloat(a.sale_price));
  } else if (sortBy.value === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }

  return result;
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredProducts.value.slice(start, end);
});

const filteredCount = computed(() => filteredProducts.value.length);
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value));
const totalProducts = computed(() => products.value.length);

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const hasActiveFilters = computed(() => {
  return filters.value.search ||
    filters.value.category_id ||
    filters.value.minPrice !== null ||
    filters.value.maxPrice !== null ||
    filters.value.inStock ||
    filters.value.featuredOnly;
});

// Methods
const fetchProducts = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/public/products?nopaginate=true&active=true');
    products.value = response.data.map(p => {
      const primaryImage = p.images?.find(img => img.is_primary) || p.images?.[0];
      return {
        ...p,
        primaryImage: primaryImage ? primaryImage.image_url : null
      };
    });
  } catch (error) {
    console.error('Error al cargar productos:', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await api.get('/public/categories?active=true');
    categories.value = response.data;
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
};

const applyFilters = () => {
  currentPage.value = 1;
};

const syncCategoryFromQuery = () => {
  filters.value.category_id = route.query.category || '';
  currentPage.value = 1;
};

const resetFilters = () => {
  filters.value = {
    search: '',
    category_id: '',
    minPrice: null,
    maxPrice: null,
    inStock: false,
    featuredOnly: false
  };
  sortBy.value = 'featured';
  currentPage.value = 1;
};

const activeImageIndexes = ref({});
const hoverIntervals = ref({});

const getProductImage = (product) => {
  const images = product.images || [];
  if (images.length === 0) {
    return product.primaryImage || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=400&auto=format&fit=crop';
  }
  const currentIndex = activeImageIndexes.value[product.id] || 0;
  const img = images[currentIndex] || images[0];
  return img ? (img.image_url || img.url) : 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=400&auto=format&fit=crop';
};

const handleMouseEnter = (product) => {
  const images = product.images || [];
  if (images.length <= 1) return;
  
  if (hoverIntervals.value[product.id]) {
    clearInterval(hoverIntervals.value[product.id]);
  }
  
  hoverIntervals.value[product.id] = setInterval(() => {
    const currentIndex = activeImageIndexes.value[product.id] || 0;
    const nextIndex = (currentIndex + 1) % images.length;
    activeImageIndexes.value[product.id] = nextIndex;
  }, 1250);
};

const handleMouseLeave = (product) => {
  if (hoverIntervals.value[product.id]) {
    clearInterval(hoverIntervals.value[product.id]);
    delete hoverIntervals.value[product.id];
  }
  activeImageIndexes.value[product.id] = 0;
};

const handleImageError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=400&auto=format&fit=crop';
};

onMounted(async () => {
  // Scroll al inicio de la página
  window.scrollTo(0, 0);
  syncCategoryFromQuery();
  await Promise.all([fetchProducts(), fetchCategories()]);
});

watch(() => route.query.category, () => {
  syncCategoryFromQuery();
});
</script>

<style scoped>
/* Typography */
.fw-800 { font-weight: 800; }
.py-10 { padding-top: 7rem; padding-bottom: 7rem; }
.py-8 { padding-top: 5rem; padding-bottom: 5rem; }
.mt-8 { margin-top: 5rem; }
.mb-6 { margin-bottom: 4rem; }
.text-white-75 { color: rgba(255, 255, 255, 0.75); }
.text-white-50 { color: rgba(255, 255, 255, 0.5); }
.transition-all { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.transition-slow { transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }

/* Navbar */
.glass-navbar {
  background: rgba(var(--bs-body-bg-rgb), 0.7);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-bottom: 1px solid var(--border-color);
  z-index: 1100;
}

/* Hero */
.catalog-hero {
  padding-top: 6rem;
  background: var(--bs-body-bg);
}

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
  transition: all 1s ease;
}

.blob-1 {
  width: 600px;
  height: 600px;
  /* background: var(--color-primary); */
  background: rgb(17, 92, 255);
  filter: blur(140px) brightness(1.1) hue-rotate(10deg);
  top: -20%;
  left: -10%;
  animation: liquid-move-1 6s infinite alternate;
}

.blob-2 {
  width: 500px;
  height: 500px;
  /* background: var(--color-primary); */
  background: rgb(17, 92, 255);
  filter: blur(140px) brightness(1.2) hue-rotate(-10deg);
  bottom: -20%;
  right: -5%;
  animation: liquid-move-2 8s infinite alternate;
}

.blob-3 {
  width: 400px;
  height: 400px;
  /* background: var(--color-primary); */
  background: rgb(17, 92, 255);
  filter: blur(140px) brightness(1.1) hue-rotate(10deg);
  top: 10%;
  left: 50%;
  animation: liquid-move-3 5s infinite alternate;
}

@keyframes liquid-move-1 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(80px, 40px) scale(1.1); }
}

@keyframes liquid-move-2 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-60px, -30px) scale(1.15); }
}

@keyframes liquid-move-3 {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(40px, -40px) rotate(90deg); }
}

.liquid-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, transparent 0%, var(--bs-body-bg) 90%);
  opacity: 0.6;
}

.max-w-600 { max-width: 600px; }

.stats-box {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.filters-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.input-group-premium .input-group-text {
  border-color: rgba(0, 0, 0, 0.05);
}

.input-group-premium .form-control,
.input-group-premium .form-select {
  border-color: rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.input-group-premium .form-control:focus,
.input-group-premium .form-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 0.25rem rgba(79, 70, 229, 0.15);
}

.form-check-input {
  width: 1.25em;
  height: 1.25em;
  margin-top: 0.2rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

input[type="radio"].form-check-input {
  border-radius: 50% !important;
}

.form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.form-check-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(79, 70, 229, 0.25);
}

.price-inputs input {
  border-color: rgba(0, 0, 0, 0.05);
}

/* PREMIUM PRODUCT CARDS UNIFIED */
.premium-product-card {
  perspective: 1000px;
}

.card-inner-premium {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  background: white;
  position: relative;
  border: 1px solid rgba(0,0,0,0.05) !important;
}

.premium-product-card:hover .card-inner-premium {
  transform: translateY(-12px);
  box-shadow: 0 40px 80px rgba(0,0,0,0.1) !important;
  border-color: var(--color-primary-soft) !important;
}

.product-img-main-container {
  aspect-ratio: 1/1;
  overflow: hidden;
  border-radius: 1.5rem;
  background: #f8fafc;
  transition: all 0.5s ease;
}

.premium-product-card:hover .product-img-main-container {
  background: white;
}

.product-display-img {
  width: 100%;
  height: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-product-card:hover .product-display-img {
  transform: scale(1.15);
}

.product-overlay-actions {
  z-index: 10;
}

.premium-product-card:hover .product-overlay-actions {
  opacity: 1 !important;
  transform: translateX(0);
}

.translate-x-10 {
  transform: translateX(10px);
}

.btn-icon-glass {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 12px;
  color: var(--slate-900);
  transition: all 0.3s ease;
}

.btn-icon-glass:hover {
  background: var(--color-primary);
  color: white;
  transform: scale(1.1);
}

.product-title-premium {
  font-size: 1.15rem;
  color: #1e293b;
  line-height: 1.4;
  height: 3.2rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-container-premium {
  color: var(--color-primary);
}

.price-value {
  letter-spacing: -0.02em;
}

.btn-premium-action {
  background: #f1f5f9;
  color: #475569;
  border: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-product-card:hover .btn-premium-action {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
}

/* Card title hover effect */
.product-title-hover {
  transition: color 0.2s ease;
}
.product-title-hover:hover {
  color: var(--sol-color-primary) !important;
}

/* Custom card actions */
:deep(.btn-card-action) {
  padding: 0.5rem 1.2rem !important;
  font-size: 0.72rem !important;
  letter-spacing: 0.1em !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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
  transform: none !important;
}

:deep(.btn-outline-secondary) {
  border: 1px solid #121212 !important;
  color: #121212 !important;
  background: transparent !important;
}

:deep(.btn-outline-secondary:hover) {
  background-color: #121212 !important;
  color: #ffffff !important;
  transform: none !important;
}

:deep(.btn-outline-brand) {
  border: 1px solid #121212 !important;
  color: #121212 !important;
  background: transparent !important;
  border-radius: 0px !important;
}

:deep(.btn-outline-brand:hover) {
  background-color: #121212 !important;
  color: #ffffff !important;
  transform: none !important;
}

/* BaseBadge override */
:deep(.badge) {
  border-radius: 0px !important;
  font-weight: 700;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
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
  transform: none !important;
}

:deep(.cart-badge-pill) {
  border-radius: 0px !important;
  background-color: #121212 !important;
  color: #ffffff !important;
  font-weight: 800;
}

/* PREMIUM PRODUCT CARDS SHOPIFY */
.premium-product-card {
  perspective: none;
}

.card-inner-premium {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background: white;
  position: relative;
  border: 1px solid #e8e8e1 !important;
  border-radius: 0px !important;
  box-shadow: none !important;
}

.premium-product-card:hover .card-inner-premium {
  transform: translateY(-6px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.06) !important;
  border-color: #121212 !important;
}

.product-img-main-container {
  aspect-ratio: 1/1;
  overflow: hidden;
  border-radius: 0px !important;
  background: #f9f9f9 !important;
  transition: all 0.3s ease;
}

.premium-product-card:hover .product-img-main-container {
  background: #f4f4f4 !important;
}

.price-container-premium {
  color: #121212 !important;
}

.filters-card {
  border-radius: 0px !important;
  box-shadow: none !important;
}

.form-check-input {
  border-radius: 0px !important;
}

.form-control, .form-select {
  border-radius: 0px !important;
}

.pagination-premium {
  border-radius: 0px !important;
}

.pagination-premium .page-link {
  border-radius: 0px !important;
  color: #121212 !important;
}

.pagination-premium .page-item.active .page-link {
  background-color: #121212 !important;
  border-color: #121212 !important;
  color: white !important;
}
</style>
