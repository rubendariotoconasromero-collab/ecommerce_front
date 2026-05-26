<template>
  <div class="product-detail-page bg-body min-vh-100 d-flex flex-column">
    <PublicNavbar />
    
    <!-- Header/Breadcrumb Section: Shopify Style Minimalist -->
    <section class="product-detail-header pt-5 mt-5 pb-4 position-relative overflow-hidden bg-white border-bottom">
      <div class="container py-3 position-relative z-1">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><router-link to="/" class="text-body-secondary opacity-60 hover-opacity-100 transition-all text-decoration-none small">Inicio</router-link></li>
            <li class="breadcrumb-item"><router-link :to="{ name: 'catalogo' }" class="text-body-secondary opacity-60 hover-opacity-100 transition-all text-decoration-none small">Catálogo</router-link></li>
            <li class="breadcrumb-item active text-dark fw-bold small" aria-current="page">{{ product.name || 'Cargando...' }}</li>
          </ol>
        </nav>
      </div>
    </section>

    <main class="flex-grow-1 py-5">
      <div class="container">
        <div v-if="loading" class="row g-5">
          <div class="col-lg-6">
            <div class="skeleton-img rounded-5 mb-4"></div>
            <div class="d-flex gap-3">
              <div class="skeleton-thumb" v-for="i in 3" :key="i"></div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="skeleton-title mb-4"></div>
            <div class="skeleton-price mb-5"></div>
            <div class="skeleton-text mb-4"></div>
            <div class="skeleton-btn"></div>
          </div>
        </div>

        <div v-else class="row g-5">
          <!-- Galería de Producto: Estilo Premium -->
          <div class="col-lg-6">
            <div class="product-gallery-sticky sticky-top" style="top: 100px;">
              <div class="main-image-viewport bg-light overflow-hidden mb-4 d-flex align-items-center justify-content-center p-5 border" style="border-radius: 0px !important;">
                <img 
                  :src="selectedImage || '/src/assets/images/product-placeholder.png'" 
                  class="img-fluid main-product-display" 
                  :alt="product.name"
                  style="max-height: 400px; object-fit: contain;"
                >
              </div>
              
              <div v-if="product.images && product.images.length > 1" class="thumbnails-track d-flex gap-3 overflow-auto pb-3 custom-scrollbar">
                <div 
                  v-for="(img, idx) in product.images" 
                  :key="idx"
                  class="thumbnail-frame border p-2 bg-white cursor-pointer transition-all"
                  style="border-radius: 0px !important;"
                  :class="{ 'active-thumbnail': selectedImage === img.url }"
                  @click="selectedImage = img.url"
                >
                  <img :src="img.url" class="img-fluid" width="85" alt="Vista miniatura">
                </div>
              </div>
            </div>
          </div>

          <!-- Información del Producto: Estilo Apple/Shopify -->
          <div class="col-lg-6">
            <div class="product-content-wrapper ps-lg-4">
              <div class="d-flex align-items-center gap-3 mb-4">
                <BaseBadge variant="primary" soft class="px-3 py-2 rounded-pill fw-bold text-uppercase tracking-wider">
                  {{ product.category?.name || 'General' }}
                </BaseBadge>
                <span v-if="product.stock > 0" class="badge-stock-success">
                  <i class="bi bi-check2-circle me-1"></i> En Stock
                </span>
              </div>

              <h1 class="display-4 fw-900 text-dark mb-4 lh-1" style="font-size: 2.8rem; letter-spacing: -0.03em;">{{ product.name }}</h1>
              
              <div class="price-display-premium mb-4 d-flex align-items-baseline gap-2">
                <span class="amount display-4 fw-bold text-dark">Bs. {{ product.sale_price }}</span>
              </div>
 
              <div class="product-description-premium mb-5">
                <h6 class="text-uppercase tracking-widest fw-bold smaller text-muted mb-3">Descripción</h6>
                <p class="fs-6 text-muted lh-lg">{{ product.description || 'Sin descripción disponible para este producto de alta calidad.' }}</p>
              </div>
 
              <!-- Atributos Clave -->
              <div class="product-features-grid mb-5">
                <div class="row g-3">
                  <div class="col-sm-4">
                    <div class="feature-item-card p-3 bg-white border" style="border-radius: 0px !important;">
                      <i class="bi bi-shield-check text-dark mb-2 d-block fs-5"></i>
                      <div class="smaller text-muted fw-bold">Calidad</div>
                      <div class="fw-bold">Certificada</div>
                    </div>
                  </div>
                  <div class="col-sm-4">
                    <div class="feature-item-card p-3 bg-white border" style="border-radius: 0px !important;">
                      <i class="bi bi-truck text-dark mb-2 d-block fs-5"></i>
                      <div class="smaller text-muted fw-bold">Envío</div>
                      <div class="fw-bold">Nacional</div>
                    </div>
                  </div>
                  <div class="col-sm-4">
                    <div class="feature-item-card p-3 bg-white border" style="border-radius: 0px !important;">
                      <i class="bi bi-arrow-repeat text-dark mb-2 d-block fs-5"></i>
                      <div class="smaller text-muted fw-bold">Garantía</div>
                      <div class="fw-bold">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Acciones de Compra: Panel Refinado -->
              <div class="purchase-panel p-4 bg-white border mb-5" style="border-radius: 0px !important;">
                <div class="row align-items-center g-3">
                  <div class="col-md-4">
                    <div class="qty-selector-premium d-flex align-items-center justify-content-between p-1 bg-white border" style="border-radius: 0px !important; border-color: #121212 !important;">
                      <button class="btn btn-qty-premium" type="button" style="border-radius: 0px !important;" @click="quantity > 1 ? quantity-- : null" :disabled="quantity <= 1">
                        <i class="bi bi-dash-lg"></i>
                      </button>
                      <div class="qty-display d-flex flex-column align-items-center">
                        <span class="smallest text-muted fw-bold text-uppercase" style="font-size: 0.6rem;">Cantidad</span>
                        <span class="fw-bold px-2 lh-1 fs-5 text-dark">{{ quantity }}</span>
                      </div>
                      <button class="btn btn-qty-premium" type="button" style="border-radius: 0px !important;" @click="quantity++">
                        <i class="bi bi-plus-lg"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-8">
                    <div class="d-grid">
                      <BaseButton 
                        variant="brand"
                        size="lg" 
                        class="btn-add-to-cart-premium py-3"
                        @click="handleAddToCart"
                      >
                        Agregar al Carrito
                      </BaseButton>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Detalles de Confianza -->
              <div class="trust-footer pt-4 border-top">
                <div class="d-flex flex-wrap gap-4">
                  <div class="d-flex align-items-center gap-2 opacity-75">
                    <i class="bi bi-lock-fill text-muted"></i>
                    <span class="smaller fw-bold">Pago 100% Seguro</span>
                  </div>
                  <div class="d-flex align-items-center gap-2 opacity-75">
                    <i class="bi bi-award-fill text-muted"></i>
                    <span class="smaller fw-bold">Soporte Corporativo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Sección de Productos Relacionados: Rediseño Premium -->
    <section class="related-products py-5 bg-white border-top">
      <div class="container py-3">
        <div class="d-flex align-items-center gap-3 mb-4">
          <h2 class="display-6 fw-900 mb-0 text-dark" style="font-size: 1.6rem; letter-spacing: -0.03em;">También te puede interesar</h2>
        </div>
        
        <div class="row g-4">
          <div class="col-xl-3 col-lg-4 col-md-6" v-for="rel in relatedProducts" :key="rel.id">
            <div class="premium-product-card group h-100">
              <div class="card-inner-premium h-100 transition-all overflow-hidden bg-white">
                <!-- Image Wrapper -->
                <div class="product-visual-wrapper position-relative overflow-hidden p-3 bg-white">
                  <div class="product-img-main-container d-flex align-items-center justify-content-center p-2">
                    <img
                      :src="rel.image"
                      @error="handleImageError"
                      class="img-fluid product-display-img transition-all"
                      :alt="rel.name"
                      style="max-height: 180px;"
                    >
                  </div>
                </div>
 
                <!-- Info Area -->
                <div class="product-body-premium p-3 text-center border-top">
                  <h6 class="fw-bold mb-2 text-dark text-truncate" style="font-size: 0.95rem;">{{ rel.name }}</h6>
                  
                  <div class="price-container-premium mb-3">
                    <span class="price-value fs-5 fw-bold text-dark">Bs. {{ rel.price }}</span>
                  </div>
 
                  <div class="d-grid">
                    <router-link :to="{ name: 'producto-detalle', params: { id: rel.id } }" class="btn btn-brand btn-sm py-2" @click="scrollToTop">
                      Ver Detalles
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Reutilizable -->
    <PublicFooter :settings="settings" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '../plugins/axios';
import { useCartStore } from '../stores/cart';
import Swal from 'sweetalert2';
import PublicNavbar from '../components/PublicNavbar.vue';
import PublicFooter from '../components/PublicFooter.vue';
import BaseBadge from '../components/base/BaseBadge.vue';
import BaseButton from '../components/base/BaseButton.vue';

const cartStore = useCartStore();

const props = defineProps(['id']);
const route = useRoute();
const product = ref({});
const relatedProducts = ref([]);
const settings = ref({});
const loading = ref(true);
const quantity = ref(1);
const selectedImage = ref('');

const handleAddToCart = () => {
  cartStore.addToCart(product.value, quantity.value);
  Swal.fire({
    title: '¡Añadido a la orden!',
    text: `Se agregaron ${quantity.value} unidades de "${product.value.name}" a tu cotización.`,
    icon: 'success',
    confirmButtonColor: '#2563eb',
    timer: 2000,
    showConfirmButton: false
  });
};

const fetchProduct = async (id) => {
  loading.value = true;
  try {
    const response = await api.get(`/public/products/${id}`);
    product.value = response.data;
    
    // Configurar imagen inicial
    const primaryImg = product.value.images?.find(img => img.is_primary) || product.value.images?.[0];
    selectedImage.value = primaryImg ? primaryImg.url : '';
    
    // Cargar relacionados (mismo categoría)
    fetchRelated(product.value.category_id);
  } catch (error) {
    console.error('Error al cargar producto:', error);
  } finally {
    loading.value = false;
  }
};

const fetchRelated = async (categoryId) => {
  try {
    const response = await api.get(`/public/products?category_id=${categoryId}&active=true&nopaginate=true`);
    const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
    
    relatedProducts.value = data
      .filter(p => p.id != props.id)
      .slice(0, 4)
      .map(p => {
        const primary = p.images?.find(img => img.is_primary) || p.images?.[0];
        return {
          id: p.id,
          name: p.name,
          price: parseFloat(p.sale_price).toFixed(2),
          image: primary ? (primary.url || primary.image_url) : '/src/assets/images/product-placeholder.png'
        }
      });
  } catch (error) {
    console.error('Error al cargar relacionados:', error);
  }
};

const fetchSettings = async () => {
  try {
    const response = await api.get('/public/settings');
    settings.value = response.data;
  } catch (error) {
    console.error('Error al cargar configuración');
  }
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  fetchProduct(props.id);
  fetchSettings();
  scrollToTop();
});

// Vigilar cambios en la ID (cuando se hace clic en un relacionado)
watch(() => props.id, (newId) => {
  fetchProduct(newId);
  scrollToTop();
});
</script>

<style scoped>
.fw-900 { font-weight: 900; }
.pt-10 { padding-top: 6rem; }
.lh-1 { line-height: 1.1; }

.premium-liquid-bg {
  pointer-events: none;
  background: var(--bs-body-bg);
  overflow: hidden;
}

.liquid-blob {
  position: absolute;
  filter: blur(140px);
  border-radius: 50%;
  opacity: 0.85;
  transition: all 1s ease;
}

.blob-1 {
  width: 600px;
  height: 600px;
  background: var(--color-primary);
  top: -20%;
  left: -10%;
  animation: liquid-move-1 6s infinite alternate;
}

.blob-2 {
  width: 500px;
  height: 500px;
  background: var(--color-primary);
  filter: blur(140px) brightness(1.1) hue-rotate(-10deg);
  bottom: -20%;
  right: -5%;
  animation: liquid-move-2 8s infinite alternate;
}

.blob-3 {
  width: 400px;
  height: 400px;
  background: var(--color-primary);
  filter: blur(140px) brightness(0.9) hue-rotate(10deg);
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

.bg-brand-premium {
  background-color: var(--bs-body-bg) !important;
}

.hero-decorative-glow {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  filter: blur(50px);
  pointer-events: none;
}

.shadow-soft {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
}

.main-image-viewport {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 500px;
}

.main-product-display {
  max-height: 450px;
  object-fit: contain;
  transition: transform 0.8s ease;
}

.floating-anim-soft {
  animation: floating-soft 4s ease-in-out infinite;
}

@keyframes floating-soft {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}

.thumbnail-frame {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-color: var(--border-light) !important;
}

.thumbnail-frame:hover {
  border-color: var(--color-primary) !important;
  transform: scale(1.05);
}

.active-thumbnail {
  border-color: var(--color-primary) !important;
  border-width: 2px !important;
}

.badge-stock-success {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-success);
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 12px;
  border-radius: var(--radius-xl);
}

.price-display-premium {
  color: var(--color-primary);
}

.feature-item-card {
  transition: all 0.3s ease;
}

.feature-item-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-primary-soft) !important;
}

.purchase-panel {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.qty-selector-premium {
  background: var(--bg-hover) !important;
}

.btn-qty {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #64748b;
  transition: all 0.2s ease;
}

.btn-qty:hover:not(:disabled) {
  background: white;
  color: var(--color-primary);
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.shadow-brand {
  box-shadow: 0 15px 30px rgba(79, 70, 229, 0.25);
}

.hover-scale:hover {
  transform: scale(1.02);
}

.btn-add-to-cart-premium {
  box-shadow: 0 15px 35px rgba(79, 70, 229, 0.3) !important;
  position: relative;
  overflow: hidden;
}

.btn-add-to-cart-premium {
  background-color: #121212 !important;
  border: 1px solid #121212 !important;
  color: white !important;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  border-radius: 0px !important;
  box-shadow: none !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-add-to-cart-premium:hover {
  background-color: #333333 !important;
  border-color: #333333 !important;
}

.btn-qty-premium {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0px !important;
  border: none;
  background: white;
  color: #121212;
  transition: all 0.2s ease;
}

.btn-qty-premium:hover:not(:disabled) {
  background: #f4f4f4;
}

.btn-qty-premium:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* PREMIUM PRODUCT CARDS SHOPIFY UNIFIED */
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

.product-display-img {
  max-height: 85%;
  object-fit: contain;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.premium-product-card:hover .product-display-img {
  transform: scale(1.05);
}

.product-title-premium {
  font-size: 0.95rem;
  color: #121212;
  font-weight: 700;
}

.price-container-premium {
  color: #121212 !important;
}

.btn-premium-action {
  background: #121212 !important;
  color: white !important;
  border-radius: 0px !important;
  border: none;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.btn-premium-action:hover {
  background: #333333 !important;
}

/* SKELETONS */
.skeleton-img { height: 500px; background: #e8e8e1; animation: pulse 1.5s infinite; border-radius: 0px !important; }
.skeleton-thumb { width: 100px; height: 100px; background: #e8e8e1; border-radius: 0px !important; }
.skeleton-title { height: 60px; width: 80%; background: #e8e8e1; border-radius: 0px !important; }
.skeleton-price { height: 80px; width: 40%; background: #e8e8e1; border-radius: 0px !important; }
.skeleton-text { height: 150px; background: #e8e8e1; border-radius: 0px !important; }
.skeleton-btn { height: 70px; background: #e8e8e1; border-radius: 0px !important; }

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.custom-scrollbar::-webkit-scrollbar { height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #fafafa; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 0px !important; }

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
</style>