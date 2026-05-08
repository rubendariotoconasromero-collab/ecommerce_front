<template>
  <div class="product-detail-page bg-body min-vh-100 d-flex flex-column">
    <PublicNavbar />

    <!-- Breadcrumb: Navegación Limpia -->
    <nav class="breadcrumb-container pt-10 mt-5 pb-4">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item"><router-link to="/" class="text-decoration-none opacity-50 hover-opacity-100 transition-all">Inicio</router-link></li>
            <li class="breadcrumb-item"><router-link :to="{ name: 'catalogo' }" class="text-decoration-none opacity-50 hover-opacity-100 transition-all">Catálogo</router-link></li>
            <li class="breadcrumb-item active fw-bold text-primary" aria-current="page">{{ product.name || 'Cargando...' }}</li>
          </ol>
        </nav>
      </div>
    </nav>

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
              <div class="main-image-viewport rounded-5 bg-white shadow-soft overflow-hidden mb-4 d-flex align-items-center justify-content-center p-5 border">
                <img 
                  :src="selectedImage || '/src/assets/images/product-placeholder.png'" 
                  class="img-fluid main-product-display floating-anim-soft" 
                  :alt="product.name"
                >
              </div>
              
              <div v-if="product.images && product.images.length > 1" class="thumbnails-track d-flex gap-3 overflow-auto pb-3 custom-scrollbar">
                <div 
                  v-for="(img, idx) in product.images" 
                  :key="idx"
                  class="thumbnail-frame rounded-4 border p-2 bg-white cursor-pointer transition-all"
                  :class="{ 'active-thumbnail shadow-sm': selectedImage === img.url }"
                  @click="selectedImage = img.url"
                >
                  <img :src="img.url" class="img-fluid rounded-3" width="85" alt="Vista miniatura">
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

              <h1 class="display-4 fw-900 text-body-emphasis mb-4 lh-1">{{ product.name }}</h1>
              
              <div class="price-display-premium mb-5 d-flex align-items-baseline gap-2">
                <span class="currency fs-3 fw-bold text-primary">Bs.</span>
                <span class="amount display-3 fw-900 text-primary">{{ product.sale_price }}</span>
              </div>

              <div class="product-description-premium mb-5">
                <h6 class="text-uppercase tracking-widest fw-800 smaller text-muted mb-3">Descripción</h6>
                <p class="fs-5 text-body-secondary lh-lg">{{ product.description || 'Sin descripción disponible para este producto de alta calidad.' }}</p>
              </div>

              <!-- Atributos Clave -->
              <div class="product-features-grid mb-5">
                <div class="row g-3">
                  <div class="col-6 col-sm-4">
                    <div class="feature-item-card p-3 rounded-4 bg-white border shadow-sm">
                      <i class="bi bi-shield-check text-primary mb-2 d-block fs-4"></i>
                      <div class="smaller text-muted fw-bold">Calidad</div>
                      <div class="fw-800">Certificada</div>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="feature-item-card p-3 rounded-4 bg-white border shadow-sm">
                      <i class="bi bi-truck text-primary mb-2 d-block fs-4"></i>
                      <div class="smaller text-muted fw-bold">Envío</div>
                      <div class="fw-800">Nacional</div>
                    </div>
                  </div>
                  <div class="col-6 col-sm-4">
                    <div class="feature-item-card p-3 rounded-4 bg-white border shadow-sm">
                      <i class="bi bi-arrow-repeat text-primary mb-2 d-block fs-4"></i>
                      <div class="smaller text-muted fw-bold">Garantía</div>
                      <div class="fw-800">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Acciones de Compra -->
              <div class="purchase-panel p-4 rounded-5 bg-white shadow-lg border-glass mb-5">
                <div class="row align-items-center gy-4">
                  <div class="col-md-4">
                    <div class="qty-selector-premium d-flex align-items-center justify-content-between p-2 rounded-pill bg-light border">
                      <button class="btn btn-qty" @click="quantity > 1 ? quantity-- : null" :disabled="quantity <= 1">
                        <i class="bi bi-dash"></i>
                      </button>
                      <span class="fw-900 px-3 fs-5">{{ quantity }}</span>
                      <button class="btn btn-qty" @click="quantity++">
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-8">
                    <div class="d-flex gap-3">
                      <BaseButton 
                        size="lg" 
                        block 
                        class="rounded-pill fw-bold shadow-brand py-3 transition-all hover-scale"
                        icon="bi bi-cart-plus-fill"
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

    <!-- Sección de Productos Relacionados -->
    <section class="related-products py-10 bg-body-tertiary">
      <div class="container">
        <h2 class="display-6 fw-900 mb-5">También te puede interesar</h2>
        <div class="row g-4">
          <div class="col-xl-3 col-lg-4 col-md-6" v-for="rel in relatedProducts" :key="rel.id">
            <router-link :to="{ name: 'producto-detalle', params: { id: rel.id } }" class="text-decoration-none" @click="scrollToTop">
              <div class="premium-product-card mini shadow-sm rounded-4 bg-white p-3 border-0 transition-all hover-shadow-lg">
                <div class="img-mini-container rounded-3 bg-light p-3 mb-3 d-flex align-items-center justify-content-center">
                  <img :src="rel.image" class="img-fluid" :alt="rel.name" style="max-height: 120px;">
                </div>
                <h6 class="fw-bold text-dark text-truncate mb-2">{{ rel.name }}</h6>
                <div class="fw-900 text-primary">Bs. {{ rel.price }}</div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Premium Corporativo -->
    <footer class="footer-premium bg-dark-deep position-relative overflow-hidden mt-0">
      <div class="footer-glass-glow"></div>
      <div class="container position-relative z-1 pt-10 pb-5">
        <div class="row g-5 mb-8">
          <div class="col-lg-4 col-md-6">
            <div class="footer-brand-wrapper mb-4">
              <div class="d-flex align-items-center gap-3">
                <div class="brand-icon-neon"><i class="bi bi-lightning-charge-fill"></i></div>
                <span class="brand-text-premium">CodeSoft</span>
              </div>
            </div>
            <p class="footer-bio-text mb-5">{{ settings.about_description || 'Excelencia en Polímeros.' }}</p>
            <div class="social-grid-premium">
              <a href="#" class="social-neon-link" data-color="blue"><i class="bi bi-facebook"></i></a>
              <a href="#" class="social-neon-link" data-color="purple"><i class="bi bi-instagram"></i></a>
              <a href="#" class="social-neon-link" data-color="cyan"><i class="bi bi-linkedin"></i></a>
            </div>
          </div>
          <div class="col-lg-2 col-6">
            <h6 class="footer-heading-premium">Compañía</h6>
            <ul class="footer-list-premium">
              <li><a href="#">Sobre Nosotros</a></li>
              <li><a href="#">Sostenibilidad</a></li>
            </ul>
          </div>
          <div class="col-lg-2 col-6">
            <h6 class="footer-heading-premium">Ecosistema</h6>
            <ul class="footer-list-premium">
              <li><a href="#">Garantía Pro</a></li>
              <li><a href="#">Contacto</a></li>
            </ul>
          </div>
          <div class="col-lg-4 col-md-6">
            <h6 class="footer-heading-premium">Contacto Global</h6>
            <div class="footer-contact-info">
              <div class="contact-item-premium"><i class="bi bi-geo-alt-fill neon-text-blue"></i><span>Parque Industrial #450</span></div>
              <div class="contact-item-premium"><i class="bi bi-telephone-fill neon-text-purple"></i><span>+591 3 345 6789</span></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import api from '../plugins/axios';
import PublicNavbar from '../components/PublicNavbar.vue';
import BaseBadge from '../components/base/BaseBadge.vue';

const props = defineProps(['id']);
const route = useRoute();
const product = ref({});
const relatedProducts = ref([]);
const settings = ref({});
const loading = ref(true);
const quantity = ref(1);
const selectedImage = ref('');

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
    const response = await api.get(`/public/products?category_id=${categoryId}&active=true`);
    relatedProducts.value = response.data
      .filter(p => p.id != props.id)
      .slice(0, 4)
      .map(p => {
        const primary = p.images?.find(img => img.is_primary) || p.images?.[0];
        return {
          id: p.id,
          name: p.name,
          price: parseFloat(p.sale_price).toFixed(2),
          image: primary ? primary.url : '/src/assets/images/product-placeholder.png'
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
  border-color: #f1f5f9 !important;
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
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 12px;
  border-radius: 50px;
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
  background: #f8fafc !important;
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

/* SKELETONS */
.skeleton-img { height: 500px; background: #f1f5f9; animation: pulse 1.5s infinite; }
.skeleton-thumb { width: 100px; height: 100px; background: #f1f5f9; border-radius: 1rem; }
.skeleton-title { height: 60px; width: 80%; background: #f1f5f9; border-radius: 1rem; }
.skeleton-price { height: 80px; width: 40%; background: #f1f5f9; border-radius: 1rem; }
.skeleton-text { height: 150px; background: #f1f5f9; border-radius: 1rem; }
.skeleton-btn { height: 70px; background: #f1f5f9; border-radius: 50px; }

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* FOOTER COPIADO DE HOMEVIEW PARA CONSISTENCIA */
.bg-dark-deep { background-color: #050505; }
.footer-premium { padding-top: 6rem; padding-bottom: 4rem; color: #a1a1aa; border-top: 1px solid rgba(255,255,255,0.05); }
.footer-glass-glow { position: absolute; top: -150px; left: 10%; width: 300px; height: 300px; background: var(--color-primary); filter: blur(150px); opacity: 0.1; }
.brand-icon-neon { width: 40px; height: 40px; background: rgba(79, 70, 229, 0.1); border: 1px solid rgba(79, 70, 229, 0.3); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--color-primary); }
.brand-text-premium { font-size: 1.5rem; font-weight: 800; color: #ffffff; }
.footer-bio-text { font-size: 0.9rem; color: #71717a; max-width: 300px; }
.social-grid-premium { display: flex; gap: 10px; }
.social-neon-link { width: 36px; height: 36px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #71717a; transition: all 0.3s; }
.social-neon-link:hover { transform: translateY(-3px); color: #fff; border-color: #fff; }
.footer-heading-premium { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #ffffff; margin-bottom: 1.2rem; }
.footer-list-premium { list-style: none; padding: 0; }
.footer-list-premium li { margin-bottom: 0.5rem; }
.footer-list-premium a { color: #71717a; text-decoration: none; font-size: 0.85rem; }
.footer-contact-info { display: flex; flex-direction: column; gap: 0.8rem; }
.contact-item-premium { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; }
.neon-text-blue { color: #3b82f6; }
.neon-text-purple { color: #a855f7; }

.custom-scrollbar::-webkit-scrollbar { height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
</style>