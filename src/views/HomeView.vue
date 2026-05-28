<template>
  <div class="landing-page bg-body">
    <!-- Public Navbar Reutilizable -->
    <PublicNavbar />

    <!-- ═══════════════════════════════════════════════════════
         HERO SECTION — Full-bleed background
    ═══════════════════════════════════════════════════════ -->
    <header id="hero" class="hero-section overflow-hidden position-relative">

      <!-- ── Skeleton while loading ──────────────────── -->
      <div v-if="isLoading" class="hero-skeleton"></div>

      <!-- ── Slide track — full-bleed background ─────── -->
      <div v-else class="hero-track" aria-hidden="true">
        <div
          v-for="(img, idx) in heroImages"
          :key="idx"
          class="hero-slide"
          :class="{ 'hero-slide--on': idx === heroSlideIdx }"
        >
          <img
            :src="img"
            :alt="`Soluplast Producto ${idx + 1}`"
            class="hero-slide__img"
            :fetchpriority="idx === 0 ? 'high' : 'auto'"
            :loading="idx === 0 ? 'eager' : 'lazy'"
            decoding="async"
            @error="handleImageError"
          >
        </div>
      </div>

      <!-- ── Overlay layers ────────────────────────────── -->
      <div class="hero-overlay" aria-hidden="true"></div>
      <div class="hero-overlay-bottom" aria-hidden="true"></div>

      <!-- ── Content ──────────────────────────────────── -->
      <div class="container hero-content-wrap position-relative" style="z-index:10">
        <div class="hero-content animate__animated animate__fadeInUp" style="animation-duration:.85s;animation-fill-mode:both">

          <h1 class="hero-headline mb-4">
            {{ settings.hero_title || 'Impulsamos tu industria con calidad premium' }}
          </h1>

          <p class="hero-body mb-5">
            {{ settings.hero_subtitle || 'Soluciones de polímeros avanzados para industrias que exigen lo máximo en durabilidad, tolerancias exactas y eficiencia logística.' }}
          </p>

          <div class="d-flex align-items-center gap-3 flex-wrap">
            <button class="hero-btn-primary" @click="scrollTo('#productos')">
              Explorar productos
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="hero-btn-arrow">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <router-link :to="{ name: 'catalogo' }" class="hero-btn-ghost">
              Ver catálogo
            </router-link>
          </div>

        </div>
      </div>

      <!-- ── Control bar — bottom ──────────────────────── -->
      <div v-if="!isLoading && heroImages.length > 1" class="hero-bar" style="z-index:10">
        <div class="hero-bar__dots">
          <button
            v-for="(_, idx) in heroImages"
            :key="idx"
            class="hero-bar__dot"
            :class="{ 'hero-bar__dot--on': idx === heroSlideIdx }"
            @click="selectSlide(idx)"
            :aria-label="`Imagen ${idx + 1}`"
          ></button>
        </div>
        <div class="hero-bar__nav">
          <button class="hero-bar__btn" @click="prevSlide" aria-label="Anterior">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button class="hero-bar__btn" @click="nextSlide" aria-label="Siguiente">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

    </header>

    <!-- Marcas: Trusted by (Nueva Sección) -->
    <section class="py-5 bg-body-tertiary border-bottom position-relative overflow-hidden">
      <!-- Subtle top color accent line -->
      <div class="position-absolute top-0 start-0 end-0" style="height: 3px; background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-success) 100%); opacity: 0.8;"></div>
      <div class="container py-2">
        <div class="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-5 grayscale-100 opacity-40 transition-all hover-opacity-100">
          <div class="brand-item d-flex align-items-center gap-2" v-for="brand in brands" :key="brand.name">
            <i :class="[brand.icon, 'fs-2']"></i>
            <span class="fs-4 fw-800 tracking-tighter">{{ brand.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Beneficios: Shopify Trust Columns -->
    <section class="py-5 bg-white border-bottom position-relative z-1">
      <div class="container py-3">
        <div class="row g-4 justify-content-center">
          <div class="col-lg-3 col-md-6" v-for="(benefit, index) in benefits" :key="index">
            <div class="benefit-card-stable group h-100">
              <div class="benefit-card-inner p-4 text-center transition-premium h-100 animate__animated animate__fadeIn" :style="{ animationDelay: `${index * 0.1}s` }">
                <div class="benefit-icon-premium mb-3 mx-auto transition-all">
                  <i :class="[benefit.icon, 'fs-2']" style="color: #121212 !important;"></i>
                </div>
                <h6 class="fw-bold text-dark text-uppercase tracking-wider mb-2" style="font-size: 0.8rem;">{{ benefit.title }}</h6>
                <p class="text-muted mb-0 smaller" style="line-height: 1.4;">{{ benefit.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categorías Destacadas: Shopify Collections -->
    <section id="categorias" class="py-5 bg-white border-bottom overflow-hidden">
      <div class="container py-4">
        <div class="text-center mb-5 animate__animated animate__fadeInUp">
          <span class="text-muted small fw-bold text-uppercase tracking-wider mb-2 d-block">Explorar Soluciones</span>
          <h2 class="display-5 fw-900 text-dark mb-3" style="letter-spacing: -0.03em;">Nuestras Colecciones</h2>
          <p class="text-muted mx-auto fs-6 max-w-600">
            Productos diseñados bajo altos estándares de ingeniería para su industria y hogar.
          </p>
        </div>

        <div class="row g-4 justify-content-center">
          <template v-if="isLoading">
            <div class="col-xl-3 col-lg-4 col-md-6" v-for="i in 4" :key="i">
              <div class="skeleton-category rounded-5 mb-4"></div>
            </div>
          </template>
          <template v-else>
            <div class="col-xl-3 col-lg-4 col-md-6" v-for="(cat, index) in categories" :key="index">
              <router-link :to="{ name: 'catalogo', query: { category: cat.id } }" class="category-link">
                <div class="modern-category-card group animate__animated animate__fadeInUp" :style="{ animationDelay: `${index * 0.1}s` }">
                  <div class="card-inner">
                    <!-- Product Count Badge -->
                    <div class="category-badge-floating">
                      <span class="glass-pill">
                        {{ cat.products_count }} ITEMS
                      </span>
                    </div>

                    <!-- Background Image -->
                    <div class="category-img-container">
                      <img
                        :src="cat.image || '/src/assets/images/category-placeholder.jpg'"
                        @error="handleImageError"
                        class="category-img transition-slow"
                        :alt="cat.name"
                      >
                    </div>

                    <!-- Gradient Overlay -->
                    <div class="category-overlay-modern position-absolute inset-0 z-1"></div>

                    <!-- Content Area -->
                    <div class="category-content-modern">
                      <h3 class="category-title-modern">{{ cat.name }}</h3>
                      <div class="category-action-hidden d-flex align-items-center gap-2">
                        <span class="text-white-75 smaller fw-600">Explorar</span>
                        <i class="bi bi-arrow-right text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </router-link>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- Productos Destacados: Shopify Grid -->
    <section id="productos" class="py-5 bg-white border-bottom position-relative overflow-hidden">
      <div class="container py-4">
        <div class="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-5 animate__animated animate__fadeInUp">
          <div class="max-w-600">
            <span class="text-muted small fw-bold text-uppercase tracking-wider mb-2 d-block">Destacados</span>
            <h2 class="display-5 fw-900 text-dark mb-2" style="letter-spacing: -0.03em;">Los Más Vendidos</h2>
            <p class="text-muted mb-0 fs-6">Los productos preferidos por nuestros clientes este mes.</p>
          </div>
          <div class="d-none d-md-block">
            <router-link :to="{ name: 'catalogo' }" class="btn btn-outline-secondary px-4 py-3 text-decoration-none fw-bold hover-lift">
              Ver Catálogo Completo <i class="bi bi-arrow-right ms-2"></i>
            </router-link>
          </div>
        </div>

        <div class="row g-4">
          <template v-if="isLoading">
            <div class="col-xl-3 col-lg-4 col-md-6" v-for="i in 4" :key="i">
              <BaseSkeletonCard />
            </div>
          </template>
          <template v-else>
            <div class="col-xl-3 col-lg-4 col-md-6" v-for="(product, index) in featuredProducts" :key="index">
              <div class="premium-product-card group animate__animated animate__fadeInUp" :style="{ animationDelay: `${index * 0.1}s` }">
                <div class="card-inner-premium h-100 shadow-sm transition-all overflow-hidden bg-white border-0 rounded-4">
                  <!-- Image Wrapper -->
                  <div class="product-visual-wrapper position-relative overflow-hidden p-3 bg-white">
                    <BaseBadge v-if="product.is_new" variant="primary" class="position-absolute top-3 start-3 z-3 px-3 py-1 shadow-sm rounded-pill smaller fw-bold">NUEVO</BaseBadge>
                    
                    <div class="product-img-main-container d-flex align-items-center justify-content-center p-2">
                      <img
                        :src="product.image || '/src/assets/images/product-placeholder.png'"
                        @error="handleImageError"
                        class="img-fluid product-display-img transition-all"
                        :alt="product.name"
                      >
                    </div>

                    <!-- Action Overlay -->
                    <div class="product-overlay-actions d-flex flex-column gap-2 position-absolute top-3 end-3 opacity-0 transition-all translate-x-10">
                      <router-link :to="{ name: 'producto-detalle', params: { id: product.id } }" class="btn btn-icon-glass shadow-sm" title="Ver Detalles">
                        <i class="bi bi-eye"></i>
                      </router-link>
                      <button class="btn btn-icon-glass shadow-sm" title="Añadir al Carrito" @click="handleAddToCart(product)">
                        <i class="bi bi-cart-plus-fill"></i>
                      </button>
                    </div>
                        <!-- Info Area -->
                  <div class="product-body-premium p-3 text-center border-top bg-white">
                    <div class="text-muted smaller mb-1 text-uppercase tracking-wider" style="font-size: 0.65rem; font-weight: 700;">{{ product.category }}</div>
                    <h6 class="fw-bold mb-2 text-dark text-truncate" style="font-size: 0.95rem; line-height: 1.3;">{{ product.name }}</h6>
                    
                    <div class="price-container-premium mb-3">
                      <span class="price-value fs-5 fw-bold text-dark">Bs. {{ product.price }}</span>
                    </div>
 
                    <div class="d-grid">
                      <router-link :to="{ name: 'producto-detalle', params: { id: product.id } }" class="btn btn-brand btn-sm py-2">
                        Ver Detalles
                      </router-link>
                    </div>
                  </div>              </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Botón móvil -->
        <div class="d-md-none text-center mt-5">
          <router-link :to="{ name: 'catalogo' }" class="btn btn-primary w-100 rounded-pill py-3 fw-bold text-decoration-none">
            Ver Catálogo Completo
          </router-link>
        </div>
      </div>
    </section>

    <!-- Testimonios: Shopify Reviews -->
    <section class="py-5 bg-white border-top">
      <div class="container py-3">
        <div class="text-center mb-5">
          <span class="text-muted small fw-bold text-uppercase tracking-wider mb-2 d-block">Testimonios</span>
          <h2 class="display-5 fw-900 text-dark mb-3" style="letter-spacing: -0.03em;">Opiniones de Clientes</h2>
        </div>
        <div class="row g-4">
          <div class="col-lg-4" v-for="i in 3" :key="i">
            <div class="testimonial-card p-4 h-100 transition-all">
              <div class="d-flex align-items-center gap-3 mb-3">
                <img :src="`https://i.pravatar.cc/150?u=${i}`" class="avatar-md rounded-circle shadow-sm" alt="User">
                <div>
                  <h6 class="fw-bold text-dark mb-0">Carlos Rivera</h6>
                  <p class="smaller text-muted mb-0">Director Industrial, CorpX</p>
                </div>
              </div>
              <p class="smaller text-muted italic mb-3">"La calidad de los polímeros y la puntualidad en la entrega han transformado nuestra cadena de suministro. Son un aliado indispensable."</p>
              <div class="text-warning">
                <i class="bi bi-star-fill me-1" style="color: var(--color-warning) !important;" v-for="j in 5" :key="j"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Sobre Nosotros: Sección Nueva Premium -->
    <section id="nosotros" class="py-10 section-linen position-relative">
      <div class="container py-5">
        <div class="row align-items-center gy-5">
          <div class="col-lg-7 animate__animated animate__fadeInLeft">
            <BaseBadge variant="warning" soft class="mb-3 px-3 py-2 rounded-pill fw-bold text-uppercase tracking-wider">Trayectoria y Confianza</BaseBadge>
            <h2 class="display-4 fw-800 text-body-emphasis mb-4 lh-1">Liderando la industria con innovación constante</h2>
            <p class="fs-5 text-body-secondary mb-5 pe-lg-5">
              Desde hace más de una década, nos dedicamos a transformar el mercado de soluciones plásticas. Nuestra misión es simple: proporcionar productos de alta calidad que impulsen la eficiencia de nuestros clientes industriales y la comodidad en los hogares.
            </p>

            <!-- Stats Horizontal Row -->
            <div class="d-flex flex-wrap align-items-center gap-4 gap-md-5 mb-5">
              <div class="stat-item-horizontal">
                <div class="d-flex align-items-center gap-3">
                  <div class="p-2 rounded-3 fs-4" style="background: rgba(0, 41, 84, 0.08); color: var(--color-primary) !important;"><i class="bi bi-award"></i></div>
                  <div>
                    <div class="fw-900 fs-4 mb-0" style="color: var(--color-primary) !important;">+10 Años</div>
                    <div class="smallest text-uppercase tracking-tighter text-muted fw-bold">Experiencia</div>
                  </div>
                </div>
              </div>
              <div class="stat-item-horizontal border-start-md ps-md-4">
                <div class="d-flex align-items-center gap-3">
                  <div class="p-2 rounded-3 fs-4" style="background: rgba(0, 113, 158, 0.08); color: var(--color-secondary) !important;"><i class="bi bi-globe"></i></div>
                  <div>
                    <div class="fw-900 fs-4 mb-0" style="color: var(--color-secondary) !important;">Nacional</div>
                    <div class="smallest text-uppercase tracking-tighter text-muted fw-bold">Presencia</div>
                  </div>
                </div>
              </div>
              <div class="stat-item-horizontal border-start-md ps-md-4">
                <div class="d-flex align-items-center gap-3">
                  <div class="p-2 rounded-3 fs-4" style="background: rgba(16, 185, 129, 0.08); color: var(--color-success) !important;"><i class="bi bi-emoji-smile"></i></div>
                  <div>
                    <div class="fw-900 fs-4 mb-0" style="color: var(--color-success) !important;">99%</div>
                    <div class="smallest text-uppercase tracking-tighter text-muted fw-bold">Satisfacción</div>
                  </div>
                </div>
              </div>
            </div>

            <BaseButton variant="outline-brand" size="lg" class="rounded-pill px-5 fw-bold">Descubre Nuestra Historia</BaseButton>
          </div>
          
          <div class="col-lg-5 animate__animated animate__fadeInRight">
            <div class="about-visual-refined position-relative">
              <div class="image-stack">
                <div class="image-frame-premium main-frame">
                  <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=600&auto=format&fit=crop" class="img-fluid rounded-4 shadow-2xl" alt="Fábrica Industrial">
                </div>
                <div class="image-frame-premium secondary-frame d-none d-md-block">
                  <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=600&auto=format&fit=crop" class="img-fluid rounded-4 shadow-xl" alt="Almacén Premium">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Reutilizable -->
    <PublicFooter :settings="settings" />

    <!-- Botón Volver Arriba -->
    <button
      class="btn-scroll-top shadow-xl transition-all"
      @click="scrollToTop"
      :class="{ 'show': scrollY > 500 }"
    >
      <i class="bi bi-arrow-up"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../plugins/axios';
import { useCartStore } from '../stores/cart';
import Swal from 'sweetalert2';
import BaseButton from '../components/base/BaseButton.vue';
import BaseBadge from '../components/base/BaseBadge.vue';
import BaseSkeletonCard from '../components/base/BaseSkeletonCard.vue';
import PublicNavbar from '../components/PublicNavbar.vue';
import PublicFooter from '../components/PublicFooter.vue';

const cartStore = useCartStore();

const handleAddToCart = (product) => {
  cartStore.addToCart(product, 1);
  Swal.fire({
    title: '¡Añadido a la orden!',
    text: `Se agregó 1 unidad de "${product.name}" a tu cotización.`,
    icon: 'success',
    confirmButtonColor: '#2563eb',
    timer: 2000,
    showConfirmButton: false
  });
};

const settings        = ref({});
const categories      = ref([]);
const featuredProducts = ref([]);
const isLoading       = ref(true);
const scrollY         = ref(0);

// ── Hero Images / Carousel State ─────────────────────────────────────────────
const heroSlideIdx = ref(0);
let   heroInterval = null;

const heroImages = computed(() => {
  const imgs = [
    settings.value.hero_image_url,
    settings.value.hero_image_2_url,
    settings.value.hero_image_3_url,
  ].filter(Boolean);
  
  if (imgs.length > 0) return imgs;
  
  // Fallbacks: 3 high-quality product/industrial photos from Unsplash
  return [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop'
  ];
});

const startHeroInterval = () => {
  if (heroInterval) clearInterval(heroInterval);
  heroInterval = setInterval(() => {
    if (heroImages.value.length > 1) {
      heroSlideIdx.value = (heroSlideIdx.value + 1) % heroImages.value.length;
    }
  }, 5000);
};

const selectSlide = (idx) => {
  heroSlideIdx.value = idx;
  startHeroInterval();
};

const prevSlide = () => {
  if (heroImages.value.length > 1) {
    heroSlideIdx.value = (heroSlideIdx.value - 1 + heroImages.value.length) % heroImages.value.length;
    startHeroInterval();
  }
};

const nextSlide = () => {
  if (heroImages.value.length > 1) {
    heroSlideIdx.value = (heroSlideIdx.value + 1) % heroImages.value.length;
    startHeroInterval();
  }
};

const handleScroll = () => {
  scrollY.value = window.scrollY;
};

const scrollTo = (id) => {
  const el = document.querySelector(id);
  if (el) {
    const offset = 90; // Altura aproximada del navbar fijo
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

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleImageError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=400&auto=format&fit=crop';
};

const brands = [
  { name: 'IndustrialCo', icon: 'bi-buildings' },
  { name: 'EcoPlast', icon: 'bi-leaf' },
  { name: 'GlobalLogistics', icon: 'bi-globe-americas' },
  { name: 'TechSupply', icon: 'bi-cpu' },
  { name: 'BuildMaster', icon: 'bi-tools' }
];

const benefits = [
  { icon: 'bi-truck', title: 'Envíos Rápidos', desc: 'Entregas a nivel nacional en 24/48 horas con seguimiento en tiempo real.' },
  { icon: 'bi-shield-check', title: 'Pagos Seguros', desc: 'Protocolos de seguridad de nivel bancario para proteger cada transacción.' },
  { icon: 'bi-box-seam', title: 'Garantía Total', desc: 'Todos nuestros productos están certificados bajo normas internacionales.' },
  { icon: 'bi-headset', title: 'Soporte 24/7', desc: 'Atención personalizada multicanal ante cualquier duda o requerimiento.' }
];

const fetchSettings = async () => {
  try {
    const response = await api.get('/public/settings');
    settings.value = response.data;
  } catch (error) {
    console.error('Error al cargar configuración');
  }
};

const fetchCategories = async () => {
  try {
    const response = await api.get('/public/categories?active=true');
    categories.value = response.data.slice(0, 4).map(c => ({
      id: c.id,
      name: c.name || c.nombre || c.title || 'Categoría',
      products_count: c.products_count || c.productsCount || 0,
      image: c.image_url || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600&auto=format&fit=crop'
    }));
  } catch (error) {
    console.error('Error al cargar categorías');
  }
};

const fetchFeaturedProducts = async () => {
  try {
    const response = await api.get('/public/products?featured=true&nopaginate=true');
    featuredProducts.value = response.data.map(p => {
      const primaryImage = p.images?.find(img => img.is_primary) || p.images?.[0];
      return {
        id: p.id,
        name: p.name,
        category: p.category?.name || 'General',
        price: parseFloat(p.sale_price).toFixed(2),
        is_new: true,
        image: primaryImage ? (primaryImage.url || primaryImage.image_url) : '/src/assets/images/product-placeholder.png'
      };
    });
  } catch (error) {
    console.error('Error al cargar productos destacados');
  }
};

onMounted(async () => {
  isLoading.value = true;
  await Promise.all([
    fetchSettings(),
    fetchCategories(),
    fetchFeaturedProducts()
  ]);
  isLoading.value = false;
  startHeroInterval();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  if (heroInterval) {
    clearInterval(heroInterval);
  }
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════
   HERO — Premium Industrial v2
   Inspirado en Apple, Stripe y SaaS moderno
═══════════════════════════════════════════════════════ */

/* ── Contenedor principal ────────────────────────── */
/* ── Hero: Full-bleed background ─────────────────── */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: #0a0a0a;
}

/* Slide track — absolute, covers entire hero */
.hero-track {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.4s cubic-bezier(.16,1,.3,1);
}
.hero-slide--on { opacity: 1; }

.hero-slide__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

/* Skeleton while loading */
.hero-skeleton {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(90deg, #141414 25%, #1e1e1e 50%, #141414 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

/* Overlay — left-side darkness for text legibility */
.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    100deg,
    rgba(0,0,0,.75) 0%,
    rgba(0,0,0,.48) 45%,
    rgba(0,0,0,.10) 100%
  );
}

/* Overlay — bottom darkness for controls */
.hero-overlay-bottom {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    to top,
    rgba(0,0,0,.6) 0%,
    transparent 40%
  );
}

/* Content wrapper — vertically centered, left-aligned */
.hero-content-wrap {
  display: flex;
  align-items: center;
  min-height: 100vh;
  padding-top: 88px;
  padding-bottom: 110px;
}

.hero-content { max-width: 640px; }

/* Headline */
.hero-headline {
  font-size: clamp(2.5rem, 1rem + 4.8vw, 5rem);
  font-weight: 350;
  line-height: 1.08;
  letter-spacing: -.03em;
  color: #ffffff;
  text-wrap: balance;
}

/* Body */
.hero-body {
  font-size: 1.1rem;
  color: rgba(255,255,255,.7);
  line-height: 1.72;
  max-width: 520px;
}

/* Primary CTA — white solid */
.hero-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  background: #ffffff;
  color: #0a0a0a;
  border: none;
  border-radius: 10px;
  padding: .9rem 2rem;
  font-size: .82rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background .2s ease,
              transform .25s cubic-bezier(.16,1,.3,1),
              box-shadow .25s ease;
}
.hero-btn-primary:hover {
  background: #efefef;
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(0,0,0,.35);
}
.hero-btn-arrow {
  transition: transform .25s cubic-bezier(.16,1,.3,1);
}
.hero-btn-primary:hover .hero-btn-arrow { transform: translateX(4px); }

/* Ghost CTA — white border underline */
.hero-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  color: rgba(255,255,255,.85);
  text-decoration: none;
  font-size: .82rem;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  border-bottom: 1.5px solid rgba(255,255,255,.35);
  padding-bottom: 2px;
  transition: border-color .2s ease, color .2s ease;
}
.hero-btn-ghost:hover {
  color: #ffffff;
  border-color: rgba(255,255,255,.9);
}

/* ── Control bar — pinned to bottom ─────────────── */
.hero-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2.5rem;
}

.hero-bar__dots { display: flex; gap: .55rem; align-items: center; }
.hero-bar__dot {
  width: 32px; height: 2px;
  background: rgba(255,255,255,.3);
  border: none; border-radius: 2px;
  cursor: pointer; padding: 0;
  transition: width .45s cubic-bezier(.16,1,.3,1), background .3s ease;
}
.hero-bar__dot--on { width: 56px; background: #ffffff; }

.hero-bar__nav { display: flex; gap: .5rem; }
.hero-bar__btn {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: .82rem;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: background .2s ease, transform .2s ease;
}
.hero-bar__btn:hover {
  background: rgba(255,255,255,.22);
  transform: scale(1.08);
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 991px) {
  .hero-content { max-width: 100%; }
  .hero-body { max-width: 100%; }
  .hero-content-wrap { padding-top: 80px; padding-bottom: 100px; }
  .hero-bar { padding: 1.25rem 1.5rem; }
}

@media (max-width: 575px) {
  .hero-headline { font-size: clamp(1.9rem, 9vw, 2.8rem); }
  .hero-bar { padding: 1rem 1.25rem; }
  .hero-bar__dot { width: 24px; }
  .hero-bar__dot--on { width: 40px; }
}

/* ========================================================
   TYPOGRAPHY & SPACING
======================================================== */
.fw-800 { font-weight: 800; }
.py-10 { padding-top: 7rem; padding-bottom: 7rem; }
.mb-6 { margin-bottom: 4rem; }
.max-w-600 { max-width: 600px; }
.tracking-wider { letter-spacing: 0.1em; }
.shadow-hover { transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }

/* Enhanced Typography */
h1, h2, h3, h4, h5, h6 {
  letter-spacing: -0.02em;
  line-height: 1.2;
}

p {
  line-height: 1.7;
}

.lead {
  font-size: 1.15rem;
  font-weight: 400;
  line-height: 1.75;
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

/* SHOPIFY COLLECTION CARDS */
.modern-category-card {
  height: 440px;
  cursor: pointer;
  transition: all 0.4s ease;
}

.card-inner {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  background: #f4f4f4;
  border-radius: 0px !important;
  overflow: hidden;
  position: relative;
  height: 100%;
  border: 1px solid #e8e8e1;
}

.modern-category-card:hover .card-inner {
  transform: scale(1.01);
  border-color: #121212;
  box-shadow: none;
}

.category-img-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.category-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.modern-category-card:hover .category-img {
  transform: scale(1.05);
}

.category-overlay-modern {
  background: rgba(18, 18, 18, 0.2) !important;
  transition: all 0.4s ease;
}

.modern-category-card:hover .category-overlay-modern {
  background: rgba(18, 18, 18, 0.4) !important;
}

.category-badge-floating {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10;
}

.glass-pill {
  background: #121212 !important;
  border: none !important;
  border-radius: 0px !important;
  padding: 0.4rem 1rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #ffffff !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

.category-content-modern {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2rem;
  z-index: 2;
}

.category-title-modern {
  font-size: 1.6rem !important;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: white;
  font-weight: 900;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.category-action-hidden {
  opacity: 1 !important;
  transform: none !important;
}

.category-action-hidden span {
  text-decoration: underline;
  text-underline-offset: 4px;
}dden {
  opacity: 1;
  transform: translateY(0);
}

/* ABOUT SECTION REFINED */
.section-linen {
  background-color: #fcfcfc;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23000000' fill-opacity='0.03' d='M1 3h1v1H1V3zm2-2h1v1H2V1z'%3E%3C/path%3E%3C/svg%3E");
}

.stat-item-horizontal {
  transition: all 0.3s ease;
}

.stat-item-horizontal:hover {
  transform: translateY(-3px);
}

@media (min-width: 768px) {
  .border-start-md {
    border-left: 1px solid var(--border-light) !important;
  }
}

.image-stack {
  position: relative;
  padding-bottom: 60px;
}

.image-frame-premium {
  border: 1px solid #d4af37; /* Fina línea dorada */
  padding: 8px;
  background: white;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.main-frame {
  position: relative;
  z-index: 2;
  transform: rotate(-2deg);
}

.secondary-frame {
  position: absolute;
  top: 60px;
  right: -40px;
  width: 80%;
  z-index: 1;
  transform: rotate(4deg);
}

.premium-product-card:hover .secondary-frame {
  transform: rotate(6deg) translate(10px, 10px);
}

.image-frame-premium:hover {
  transform: rotate(0deg) scale(1.02);
  z-index: 10;
  box-shadow: 0 30px 60px rgba(212, 175, 55, 0.15) !important;
}

.about-visual-refined::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #d4af37 0%, transparent 70%);
  opacity: 0.1;
  z-index: 0;
}

/* BENEFIT CARDS STABLE & MODERN */
.benefit-card-stable {
  cursor: default;
}

/* SHOPIFY TRUST COLUMNS */
.benefit-card-inner {
  background: #ffffff !important;
  border: 1px solid #e8e8e1 !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  border-radius: 0px !important;
}

.benefit-card-stable:hover .benefit-card-inner {
  transform: translateY(-5px) !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border-color: #121212 !important;
}

.benefit-icon-premium {
  width: 55px;
  height: 55px;
  background: #f4f4f4 !important;
  border-radius: 0px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.benefit-card-stable:hover .benefit-icon-premium {
  background: #121212 !important;
  transform: none !important;
  box-shadow: none !important;
}

.benefit-card-stable:hover .benefit-icon-premium i {
  color: white !important;
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

.product-display-img {
  max-height: 85%;
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
  color: #121212 !important;
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

.smaller { font-size: 0.75rem; }
.smallest { font-size: 0.65rem; }

/* ANIMATIONS & TRANSITIONS */
.transition-slow { transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
.transform-scale-up { transform: translateY(20px); transition: all 0.4s ease; }
.modern-product-card:hover .transform-scale-up { transform: translateY(0); }

/* FOOTER */
.social-link {
  width: 45px;
  height: 45px;
  background: rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: white;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.social-link:hover {
  background: var(--color-primary);
  transform: translateY(-6px) scale(1.15);
  box-shadow: 0 12px 28px rgba(79, 70, 229, 0.4);
  border-color: var(--color-primary);
}

/* PREMIUM LIQUID BACKGROUND MINIMALIST WIH BRAND GLOW */
.premium-liquid-bg {
  pointer-events: none;
  background: radial-gradient(circle at 80% 20%, rgba(0, 113, 158, 0.08) 0%, rgba(0, 41, 84, 0.03) 50%, var(--bs-body-bg) 100%);
  overflow: hidden;
}

.border-glass {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.hover-lift {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05);
}

.hover-lift:active {
  transform: translateY(-1px);
}

/* HERO SKELETONS */
.skeleton-title {
  width: 100%;
  height: 120px;
  background: var(--bg-hover);
  border-radius: 1rem;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-text {
  width: 90%;
  height: 60px;
  background: var(--bg-hover);
  border-radius: 0.5rem;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-btn {
  width: 160px;
  height: 48px;
  background: var(--bg-hover);
  border-radius: 50px;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-hero-img {
  width: 100%;
  max-width: 440px;
  aspect-ratio: 1 / 1;
  background: var(--bg-hover);
  border-radius: 0px;
  animation: skeleton-loading 1.5s infinite;
  margin: 0 auto;
}

/* UTILITIES */
.rounded-5 { border-radius: 2rem !important; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }

/* NEWSLETTER */
.max-w-700 { max-width: 700px; }
.max-w-500 { max-width: 500px; }

.newsletter-form-wrapper {
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 50px;
  background: white;
  position: relative;
  overflow: hidden;
}

.newsletter-form-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.newsletter-form-wrapper:focus-within::before {
  left: 100%;
}

.newsletter-form-wrapper:focus-within {
  transform: scale(1.02);
  box-shadow: 0 0 30px rgba(79, 70, 229, 0.2);
}

.newsletter-form-wrapper input {
  transition: all 0.3s ease;
  color: var(--text-main) !important;
}

.newsletter-form-wrapper input:focus {
  text-shadow: 0 0 8px rgba(79, 70, 229, 0.1);
}

.newsletter-form-wrapper button {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.newsletter-form-wrapper:hover button {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.3);
}

/* FOOTER */
.social-link {
  width: 45px;
  height: 45px;
  background: rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: white;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.social-link:hover {
  background: var(--color-primary);
  transform: translateY(-6px) scale(1.15);
  box-shadow: 0 12px 28px rgba(79, 70, 229, 0.4);
  border-color: var(--color-primary);
}
.footer-link-modern {
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 0.95rem;
  position: relative;
}

.footer-link-modern::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.footer-link-modern:hover::before {
  width: 100%;
}

.footer-link-modern:hover {
  color: var(--color-primary);
  transform: translateX(2px);
}

.footer-logo-box {
  box-shadow: 0 8px 16px rgba(79, 70, 229, 0.2);
  transition: all 0.3s ease;
}

.footer-logo-box:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 24px rgba(79, 70, 229, 0.3);
}

/* SCROLL TOP */
.btn-scroll-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.btn-scroll-top.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.btn-scroll-top:hover {
  background: var(--color-primary-hover);
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(79, 70, 229, 0.4);
}

/* TRACKING WIDER */
.tracking-tighter { letter-spacing: -0.05em; }

/* SKELETONS */
.skeleton-category {
  height: 480px;
  background: linear-gradient(90deg, var(--bg-hover) 25%, var(--border-light) 50%, var(--bg-hover) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 2rem;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Enhanced Hover States */
.btn {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn:hover {
  transform: translateY(-2px);
}



/* Text color enhancements */
.text-white-50 {
  transition: opacity 0.3s ease;
}

/* List enhancements */
ul li {
  transition: all 0.3s ease;
}

ul li:hover {
  padding-left: 4px;
}

/* Image enhancements */
img {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Testimonial & Brands Shopify Refinement */
.testimonial-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #e8e8e1 !important;
  border-top: 3px solid #121212 !important;
  border-radius: 0px !important;
  transition: all 0.3s ease;
  background: #ffffff !important;
  box-shadow: none !important;
}

.testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05) !important;
  border-top-color: #333333 !important;
}

.brand-item {
  transition: all 0.3s ease;
}

.brand-item:hover {
  color: #121212 !important;
  transform: scale(1.05);
}

.about-visual-refined {
  border-radius: 0px !important;
}

.image-stack {
  border-radius: 0px !important;
  background: #ffffff !important;
  border: 1px solid #e8e8e1 !important;
}

/* SCROLL TOP SHOPIFY STYLE */
.btn-scroll-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 45px;
  height: 45px;
  background: #121212 !important;
  color: white !important;
  border: none;
  border-radius: 0px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: none !important;
}
</style>
