<template>
  <div class="landing-page bg-body">
    <!-- Public Navbar Reutilizable -->
    <PublicNavbar />

    <!-- Hero Section: Impacto Total -->
    <header id="hero" class="hero-section min-vh-100 d-flex align-items-center pt-5 overflow-hidden position-relative">
      <!-- Fondo Líquido Premium (Animated Mesh Gradient) -->
      <div class="premium-liquid-bg position-absolute inset-0 z-0">
        <div class="liquid-blob blob-1"></div>
        <div class="liquid-blob blob-2"></div>
        <div class="liquid-blob blob-3"></div>
        <div class="liquid-overlay"></div>
      </div>

      <div class="container position-relative z-1">
        <template v-if="isLoading">
          <div class="row align-items-center gy-5">
            <div class="col-lg-6">
              <div class="skeleton-badge mb-3"></div>
              <div class="skeleton-title mb-4"></div>
              <div class="skeleton-text mb-5"></div>
              <div class="d-flex gap-3">
                <div class="skeleton-btn"></div>
                <div class="skeleton-btn"></div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="skeleton-hero-img"></div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="row align-items-center gy-5">
            <div class="col-lg-6 animate__animated animate__fadeInLeft">
              <BaseBadge variant="primary" soft class="mb-3 px-3 py-2 rounded-pill">
                ✨ Bienvenido a la nueva era de compras
              </BaseBadge>
              <h1 class="display-3 fw-800 mb-4 lh-1">
                {{ settings.hero_title || 'Impulsamos tu industria con calidad premium' }}
              </h1>
              <p class="lead text-body-secondary mb-5 pe-lg-5">
                {{ settings.hero_subtitle || 'Descubre nuestro catálogo exclusivo de productos plásticos diseñados para el máximo rendimiento y durabilidad.' }}
              </p>
              <div class="d-flex flex-wrap gap-3">
                <BaseButton size="lg" variant="brand" class="px-5 rounded-pill shadow-lg" @click="scrollTo('#productos')">
                  Comenzar ahora
                </BaseButton>
                <router-link :to="{ name: 'catalogo' }" class="btn btn-outline-primary px-5 rounded-pill text-decoration-none fw-bold">
                  Ver Catálogo <i class="bi bi-arrow-right ms-2"></i>
                </router-link>
              </div>
            </div>
            <div class="col-lg-6 position-relative animate__animated animate__fadeInRight">
              <div class="hero-visual-wrapper position-relative text-center text-lg-end">
                <!-- Glow Effect Background -->
                <div class="hero-glow position-absolute top-50 start-50 translate-middle"></div>
                <img
                  :src="settings.hero_image_url || '/src/assets/images/hero-mockup.png'"
                  @error="handleImageError"
                  alt="Premium Product"
                  class="img-fluid position-relative z-1 hero-img floating-anim shadow-2xl rounded-4"
                >

                <!-- Floating Card -->
                <div class="floating-card bg-body-tertiary border p-3 rounded-4 shadow-xl position-absolute animate__animated animate__zoomIn animate__delay-2s">
                  <div class="d-flex align-items-center gap-3">
                    <div class="p-2 bg-success-subtle rounded-3"><i class="bi bi-shield-check text-success fs-4"></i></div>
                    <div>
                      <div class="fw-bold small">Calidad Certificada</div>
                      <div class="smaller text-body-secondary">Normas ISO 9001</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </header>

    <!-- Marcas: Trusted by (Nueva Sección) -->
    <section class="py-5 bg-white border-bottom opacity-75">
      <div class="container py-2">
        <div class="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-5 grayscale-100 opacity-40 transition-all hover-opacity-100">
          <div class="brand-item d-flex align-items-center gap-2" v-for="brand in brands" :key="brand.name">
            <i :class="[brand.icon, 'fs-2']"></i>
            <span class="fs-4 fw-800 tracking-tighter">{{ brand.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Beneficios: Rediseño Moderno -->
    <section class="py-10 bg-white position-relative z-1">
      <div class="container">
        <div class="row g-4 justify-content-center">
          <div class="col-lg-3 col-md-6" v-for="(benefit, index) in benefits" :key="index">
            <div class="benefit-card-stable group h-100">
              <div class="benefit-card-inner p-5 rounded-5 text-center transition-premium h-100 border-glass-light animate__animated animate__fadeIn" :style="{ animationDelay: `${index * 0.1}s` }">
                <div class="benefit-icon-premium mb-4 mx-auto shadow-sm transition-all">
                  <i :class="[benefit.icon, 'fs-1 text-primary']"></i>
                </div>
                <h5 class="fw-800 text-body-emphasis mb-3">{{ benefit.title }}</h5>
                <p class="text-body-secondary mb-0 lh-base smaller">{{ benefit.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categorías Destacadas: Rediseño Premium -->
    <section id="categorias" class="py-10 bg-gradient-subtle overflow-hidden">
      <div class="container py-5">
        <div class="text-center mb-6 animate__animated animate__fadeInUp">
          <BaseBadge variant="primary" soft class="mb-3 px-3 py-2 rounded-pill fw-bold">Nuestra Colección</BaseBadge>
          <h2 class="display-4 fw-800 text-body-emphasis mb-3">Explora por Categoría</h2>
          <p class="text-body-secondary mx-auto fs-5" style="max-width: 700px;">
            Soluciones de alta ingeniería diseñadas para elevar el estándar de tu industria y hogar.
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

    <!-- Productos Destacados: Rediseño Premium -->
    <section id="productos" class="py-10 bg-body-tertiary position-relative overflow-hidden">
      <!-- Decoración de fondo sutil -->
      <div class="position-absolute top-0 end-0 p-5 opacity-10 rotate-12 d-none d-xl-block">
        <!-- <i class="bi bi-boxes display-1 text-primary"></i> -->
      </div>

      <div class="container py-5">
        <div class="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-6 gap-4 animate__animated animate__fadeInUp">
          <div class="max-w-600">
            <BaseBadge variant="success" soft class="mb-3 px-3 py-2 rounded-pill fw-bold">Trending Now</BaseBadge>
            <h2 class="display-4 fw-800 text-body-emphasis mb-2 lh-1">Lo más buscado</h2>
            <p class="text-body-secondary mb-0 fs-5">Los productos preferidos por nuestros clientes este mes.</p>
          </div>
          <div class="d-none d-md-block">
            <router-link :to="{ name: 'catalogo' }" class="btn btn-outline-primary rounded-pill px-4 py-3 group text-decoration-none fw-bold">
              Ver Catálogo Completo <i class="bi bi-arrow-right ms-2 transition-all group-hover:translate-x-1"></i>
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
                      <button class="btn btn-icon-glass shadow-sm" title="Vista Rápida">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-icon-glass shadow-sm" title="Favoritos">
                        <i class="bi bi-heart"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Info Area -->
                  <div class="product-body-premium p-4 pt-2 text-center">
                    <div class="text-primary smaller fw-800 tracking-wider mb-2 opacity-50">{{ product.category }}</div>
                    <h5 class="product-title-premium fw-800 mb-2 text-truncate-2">{{ product.name }}</h5>
                    
                    <div class="price-container-premium mb-4">
                      <span class="currency-symbol fs-6 opacity-75">Bs.</span>
                      <span class="price-value fs-3 fw-900 text-dark">{{ product.price }}</span>
                    </div>

                    <div class="d-grid">
                      <router-link :to="{ name: 'producto-detalle', params: { id: product.id } }" class="btn btn-premium-action rounded-pill py-2 fw-bold">
                        Ver Detalles <i class="bi bi-arrow-right ms-2"></i>
                      </router-link>
                    </div>
                  </div>
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

    <!-- Product Spotlight: Innovación (Nueva Sección Estilo Apple) -->
    <section class="py-10 bg-dark text-white overflow-hidden position-relative">
      <div class="container py-5">
        <div class="row align-items-center gy-5">
          <div class="col-lg-7 order-lg-2 animate__animated animate__fadeInRight">
            <div class="spotlight-visual position-relative">
              <div class="spotlight-glow position-absolute top-50 start-50 translate-middle"></div>
              <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop" class="img-fluid rounded-5 shadow-2xl position-relative z-1" alt="Innovación">
              <div class="floating-badge-spotlight position-absolute bottom-0 start-0 mb-4 ms-4 z-2 animate__animated animate__bounceIn animate__delay-1s">
                <div class="bg-white text-dark p-3 rounded-4 shadow-lg d-flex align-items-center gap-3">
                  <div class="bg-primary-soft p-2 rounded-3 text-primary"><i class="bi bi-cpu fs-4"></i></div>
                  <div>
                    <div class="fw-800 smaller">ECO-TECH</div>
                    <div class="smallest opacity-75">Materiales Sostenibles</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-5 order-lg-1 animate__animated animate__fadeInLeft">
            <h4 class="text-primary fw-800 mb-3 tracking-wider text-uppercase small">Nuestra Obra Maestra</h4>
            <h2 class="text-primary display-3 fw-800 mb-4 lh-1">Ingeniería de polímeros reinventada</h2>
            <p class="fs-4 text-white-50 mb-5">
              Hemos desarrollado una nueva línea de productos industriales que combinan resistencia extrema con un 40% menos de huella de carbono.
            </p>
            <ul class="list-unstyled d-flex flex-column gap-3 mb-5">
              <li class="d-flex align-items-center gap-3 fs-5"><i class="fa-solid fa-check-circle text-primary"></i> Resistencia a temperaturas extremas</li>
              <li class="d-flex align-items-center gap-3 fs-5"><i class="fa-solid fa-check-circle text-primary"></i> 100% Reciclable y biodegradable</li>
              <li class="d-flex align-items-center gap-3 fs-5"><i class="fa-solid fa-check-circle text-primary"></i> Garantía extendida de 5 años</li>
            </ul>
            <BaseButton variant="brand" size="lg" class="rounded-pill px-5 py-3 shadow-lg">Descubrir la Tecnología</BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonios: Nueva Sección Premium -->
    <section class="py-10 bg-white border-top">
      <div class="container">
        <div class="text-center mb-6">
          <h2 class="display-5 fw-800 text-body-emphasis mb-3">Voces de Confianza</h2>
          <p class="text-body-secondary fs-5">Lo que dicen nuestros aliados estratégicos.</p>
        </div>
        <div class="row g-4">
          <div class="col-lg-4" v-for="i in 3" :key="i">
            <div class="testimonial-card p-5 rounded-5 border h-100 transition-all shadow-hover">
              <div class="d-flex align-items-center gap-3 mb-4">
                <img :src="`https://i.pravatar.cc/150?u=${i}`" class="avatar-md rounded-circle border-3 border-white shadow-sm" alt="User">
                <div>
                  <h6 class="fw-800 mb-0">Carlos Rivera</h6>
                  <p class="smaller text-muted mb-0">Director Industrial, CorpX</p>
                </div>
              </div>
              <p class="fs-5 text-body-secondary italic mb-4">"La calidad de los polímeros y la puntualidad en la entrega han transformado nuestra cadena de suministro. Son un aliado indispensable."</p>
              <div class="text-warning">
                <i class="bi bi-star-fill me-1" v-for="j in 5" :key="j"></i>
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
                  <div class="p-2 bg-primary-soft rounded-3 text-primary fs-4"><i class="bi bi-award"></i></div>
                  <div>
                    <div class="fw-900 fs-4 mb-0">+10 Años</div>
                    <div class="smallest text-uppercase tracking-tighter text-muted fw-bold">Experiencia</div>
                  </div>
                </div>
              </div>
              <div class="stat-item-horizontal border-start-md ps-md-4">
                <div class="d-flex align-items-center gap-3">
                  <div class="p-2 bg-success-soft rounded-3 text-success fs-4"><i class="bi bi-globe"></i></div>
                  <div>
                    <div class="fw-900 fs-4 mb-0">Nacional</div>
                    <div class="smallest text-uppercase tracking-tighter text-muted fw-bold">Presencia</div>
                  </div>
                </div>
              </div>
              <div class="stat-item-horizontal border-start-md ps-md-4">
                <div class="d-flex align-items-center gap-3">
                  <div class="p-2 bg-warning-soft rounded-3 text-warning fs-4"><i class="bi bi-emoji-smile"></i></div>
                  <div>
                    <div class="fw-900 fs-4 mb-0">99%</div>
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

    <!-- Footer: Rediseño Premium Corporativo -->
    <footer class="footer-premium bg-dark-deep position-relative overflow-hidden">
      <!-- Elementos decorativos de fondo -->
      <div class="footer-glass-glow"></div>
      
      <div class="container position-relative z-1 pt-10 pb-5">
        <div class="row g-5 mb-8">
          <!-- Columna 1: Branding & Bio -->
          <div class="col-lg-4 col-md-6">
            <div class="footer-brand-wrapper mb-4">
              <div class="d-flex align-items-center gap-3">
                <div class="brand-icon-neon">
                  <i class="bi bi-lightning-charge-fill"></i>
                </div>
                <span class="brand-text-premium">CodeSoft</span>
              </div>
            </div>
            <p class="footer-bio-text mb-5">
              {{ settings.about_description || 'Líderes globales en soluciones plásticas de alta ingeniería. Comprometidos con la sostenibilidad y la innovación constante para la industria 4.0.' }}
            </p>
            <div class="social-grid-premium">
              <a href="#" class="social-neon-link" data-color="blue"><i class="bi bi-facebook"></i></a>
              <a href="#" class="social-neon-link" data-color="purple"><i class="bi bi-instagram"></i></a>
              <a href="#" class="social-neon-link" data-color="cyan"><i class="bi bi-linkedin"></i></a>
              <a href="#" class="social-neon-link" data-color="red"><i class="bi bi-twitter-x"></i></a>
            </div>
          </div>

          <!-- Columna 2: Navegación -->
          <div class="col-lg-2 col-6">
            <h6 class="footer-heading-premium">Compañía</h6>
            <ul class="footer-list-premium">
              <li><a href="#">Sobre Nosotros</a></li>
              <li><a href="#">Nuestra Fábrica</a></li>
              <li><a href="#">Sostenibilidad</a></li>
              <li><a href="#">Innovación</a></li>
            </ul>
          </div>

          <!-- Columna 3: Soporte -->
          <div class="col-lg-2 col-6">
            <h6 class="footer-heading-premium">Ecosistema</h6>
            <ul class="footer-list-premium">
              <li><a href="#">Centro de Ayuda</a></li>
              <li><a href="#">Garantía Pro</a></li>
              <li><a href="#">Logística Global</a></li>
              <li><a href="#">Contacto</a></li>
            </ul>
          </div>

          <!-- Columna 4: Contacto & Newsletter Sutil -->
          <div class="col-lg-4 col-md-6">
            <h6 class="footer-heading-premium">Contacto Global</h6>
            <div class="footer-contact-info">
              <div class="contact-item-premium">
                <i class="bi bi-geo-alt-fill neon-text-blue"></i>
                <span>Parque Industrial, Av. Los Próceres #450</span>
              </div>
              <div class="contact-item-premium">
                <i class="bi bi-telephone-fill neon-text-purple"></i>
                <span>+591 3 345 6789</span>
              </div>
              <div class="contact-item-premium">
                <i class="bi bi-envelope-at-fill neon-text-cyan"></i>
                <span>corporativo@codesoft.com.bo</span>
              </div>
            </div>
            
            <div class="mt-4 pt-2">
              <div class="glass-input-group">
                <input type="email" placeholder="Boletín corporativo..." class="glass-input">
                <button class="glass-btn-arrow"><i class="bi bi-arrow-right"></i></button>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-bottom-premium pt-5 border-top-glass">
          <div class="row align-items-center">
            <div class="col-md-6 text-center text-md-start">
              <p class="copyright-text">
                &copy; 2026 <span class="fw-bold">CodeSoft</span>. {{ settings.footer_text || 'Excelencia en Polímeros.' }}
              </p>
            </div>
            <div class="col-md-6 mt-3 mt-md-0">
              <div class="footer-legal-links justify-content-center justify-content-md-end">
                <a href="#">Privacidad</a>
                <a href="#">Términos</a>
                <a href="#">Compliance</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>

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
import { ref, onMounted, onUnmounted } from 'vue';
import api from '../plugins/axios';
import BaseButton from '../components/base/BaseButton.vue';
import BaseBadge from '../components/base/BaseBadge.vue';
import BaseSkeletonCard from '../components/base/BaseSkeletonCard.vue';
import PublicNavbar from '../components/PublicNavbar.vue';

const settings = ref({});
const categories = ref([]);
const featuredProducts = ref([]);
const isLoading = ref(true);
const scrollY = ref(0);

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
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
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

/* HERO IMPROVEMENTS */
.hero-glow {
  width: 500px;
  height: 500px;
  background: var(--color-primary);
  filter: blur(150px);
  opacity: 0.2;
  animation: glow-pulse 4s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.25; }
}

/* Hero image enhancement */
.hero-img {
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.1));
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.floating-anim {
  animation: floating 3s ease-in-out infinite;
}

@keyframes floating {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* MODERN CATEGORY CARDS */
.modern-category-card {
  height: 480px;
  cursor: pointer;
  perspective: 1000px;
  transition: all 0.4s ease;
}

@media (max-width: 992px) {
  .modern-category-card {
    height: 400px;
  }
}

@media (max-width: 576px) {
  .modern-category-card {
    height: 320px;
  }
}

.card-inner {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  background: var(--bg-card);
  border-radius: 2.5rem;
  overflow: hidden;
  position: relative;
  height: 100%;
}

.modern-category-card:hover .card-inner {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 40px 80px rgba(0,0,0,0.25);
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
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.modern-category-card:hover .category-img {
  transform: scale(1.1);
}

.category-overlay-modern {
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(0,0,0,0) 40%, 
    rgba(0,0,0,0.4) 70%, 
    rgba(0,0,0,0.9) 100%);
  transition: all 0.5s ease;
}

.modern-category-card:hover .category-overlay-modern {
  background: linear-gradient(to bottom, 
    transparent 0%, 
    rgba(0,0,0,0.1) 30%, 
    rgba(0,0,0,0.6) 60%, 
    rgba(0,0,0,1) 100%);
}

.category-badge-floating {
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 10;
}

.glass-pill {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 0.5rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: rgb(65, 65, 65);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.category-content-modern {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 2.5rem;
  z-index: 2;
  transition: all 0.4s ease;
}

@media (max-width: 576px) {
  .category-content-modern {
    padding: 1.5rem;
  }
}

.category-title-modern {
  font-size: 2.25rem;
  line-height: 1.1;
  letter-spacing: -0.03em;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  color: white;
  font-weight: 850;
  margin-bottom: 1.25rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

@media (max-width: 992px) {
  .category-title-modern {
    font-size: 1.75rem;
  }
}

.modern-category-card:hover .category-title-modern {
  transform: translateY(-5px);
}

.category-action-hidden {
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modern-category-card:hover .category-action-hidden {
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

.benefit-card-inner {
  background: white;
  border: 1px solid #f1f5f9;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.benefit-card-stable:hover .benefit-card-inner {
  transform: translateY(-10px);
  box-shadow: 0 30px 60px rgba(0,0,0,0.06);
  border-color: var(--color-primary-soft);
}

.benefit-icon-premium {
  width: 70px;
  height: 70px;
  background: #f8fafc;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.benefit-card-stable:hover .benefit-icon-premium {
  background: var(--color-primary);
  transform: scale(1.1) rotate(8deg);
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
}

.benefit-card-stable:hover .benefit-icon-premium i {
  color: white !important;
}

.transition-premium {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.border-glass-light {
  border: 1px solid rgba(0,0,0,0.03);
}

/* PREMIUM PRODUCT CARDS */
.premium-product-card {
  perspective: 1000px;
}

.card-inner-premium {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  background: white;
  position: relative;
  border: 1px solid var(--border-light) !important;
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

/* PREMIUM LIQUID BACKGROUND */
.premium-liquid-bg {
  pointer-events: none;
  background: var(--bs-body-bg);
  overflow: hidden;
}

.liquid-blob {
  position: absolute;
  filter: blur(60px);
  border-radius: 50%;
  opacity: 0.45;
  transition: all 1s ease;
}

.blob-1 {
  width: 700px;
  height: 700px;
  background: var(--color-primary);
  top: -15%;
  left: -10%;
  animation: liquid-move-1 12s infinite alternate;
}

.blob-2 {
  width: 600px;
  height: 600px;
  background: #0ea5e9;
  bottom: -15%;
  right: -5%;
  animation: liquid-move-2 15s infinite alternate;
}

.blob-3 {
  width: 500px;
  height: 500px;
  background: #a855f7;
  top: 30%;
  left: 20%;
  animation: liquid-move-3 10s infinite alternate;
}

@keyframes liquid-move-1 {
  0% { transform: translate(0, 0) scale(1) rotate(0deg); }
  50% { transform: translate(120px, 60px) scale(1.15) rotate(45deg); }
  100% { transform: translate(60px, 120px) scale(0.95) rotate(90deg); }
}

@keyframes liquid-move-2 {
  0% { transform: translate(0, 0) scale(1) rotate(0deg); }
  50% { transform: translate(-100px, -50px) scale(1.25) rotate(-45deg); }
  100% { transform: translate(-50px, -100px) scale(0.85) rotate(-90deg); }
}

@keyframes liquid-move-3 {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(70px, -70px) scale(1.1); }
  100% { transform: translate(-70px, 70px) scale(0.9); }
}

.liquid-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, transparent 0%, var(--bs-body-bg) 90%);
  opacity: 0.5;
}

/* HERO SKELETONS */
.skeleton-badge {
  width: 200px;
  height: 32px;
  background: var(--bg-hover);
  border-radius: 50px;
  animation: skeleton-loading 1.5s infinite;
}

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
  aspect-ratio: 4/3;
  background: var(--bg-hover);
  border-radius: 2rem;
  animation: skeleton-loading 1.5s infinite;
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

/* FOOTER PREMIUM RE-DESIGN */
.bg-dark-deep {
  background-color: #050505;
}

.footer-premium {
  padding-top: 8rem;
  padding-bottom: 4rem;
  color: #a1a1aa;
  font-family: 'Plus Jakarta Sans', sans-serif;
  border-top: 1px solid rgba(255,255,255,0.05);
  margin-top: 2rem;
}

.footer-glass-glow {
  position: absolute;
  top: -150px;
  left: 10%;
  width: 300px;
  height: 300px;
  background: var(--color-primary);
  filter: blur(150px);
  opacity: 0.1;
  pointer-events: none;
}

.brand-icon-neon {
  width: 45px;
  height: 45px;
  background: rgba(79, 70, 229, 0.1);
  border: 1px solid rgba(79, 70, 229, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-size: 1.5rem;
  box-shadow: 0 0 20px rgba(79, 70, 229, 0.2);
}

.brand-text-premium {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #ffffff;
}

.footer-bio-text {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #71717a;
  max-width: 320px;
}

.social-grid-premium {
  display: flex;
  gap: 12px;
}

.social-neon-link {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #71717a;
  font-size: 1.1rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.social-neon-link:hover {
  transform: translateY(-5px);
  color: #ffffff;
}

.social-neon-link[data-color="blue"]:hover { border-color: #3b82f6; box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
.social-neon-link[data-color="purple"]:hover { border-color: #a855f7; box-shadow: 0 0 15px rgba(168, 85, 247, 0.3); }
.social-neon-link[data-color="cyan"]:hover { border-color: #06b6d4; box-shadow: 0 0 15px rgba(6, 182, 212, 0.3); }
.social-neon-link[data-color="red"]:hover { border-color: #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }

.footer-heading-premium {
  font-size: 0.85rem;
  font-weight: 700;
  text-uppercase: uppercase;
  letter-spacing: 0.1em;
  color: #ffffff;
  margin-bottom: 1.5rem;
}

.footer-list-premium {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-list-premium li {
  margin-bottom: 0.75rem;
}

.footer-list-premium a {
  color: #71717a;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.footer-list-premium a:hover {
  color: #ffffff;
  padding-left: 5px;
}

.footer-contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item-premium {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: #71717a;
}

.contact-item-premium i {
  font-size: 1.1rem;
}

.neon-text-blue { color: #3b82f6; text-shadow: 0 0 8px rgba(59, 130, 246, 0.5); }
.neon-text-purple { color: #a855f7; text-shadow: 0 0 8px rgba(168, 85, 247, 0.5); }
.neon-text-cyan { color: #06b6d4; text-shadow: 0 0 8px rgba(6, 182, 212, 0.5); }

.glass-input-group {
  display: flex;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 4px;
  transition: all 0.3s ease;
}

.glass-input-group:focus-within {
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.05);
}

.glass-input {
  background: transparent;
  border: none;
  padding: 10px 15px;
  color: #ffffff;
  font-size: 0.9rem;
  flex-grow: 1;
  outline: none;
}

.glass-btn-arrow {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #ffffff;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.glass-btn-arrow:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 0 15px rgba(79, 70, 229, 0.4);
}

.border-top-glass {
  border-top: 1px solid rgba(255,255,255,0.05);
}

.copyright-text {
  font-size: 0.85rem;
  color: #52525b;
}

.footer-legal-links {
  display: flex;
  gap: 24px;
}

.footer-legal-links a {
  color: #52525b;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.footer-legal-links a:hover {
  color: #ffffff;
}

@media (max-width: 991px) {
  .footer-premium {
    text-align: center;
  }
  .footer-brand-wrapper, .social-grid-premium, .footer-contact-info, .footer-legal-links {
    justify-content: center;
  }
  .footer-bio-text {
    margin-left: auto;
    margin-right: auto;
  }
}

/* FOOTER MODERN */
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

/* Spotlight enhancements */
.spotlight-visual {
  position: relative;
}

.spotlight-glow {
  width: 400px;
  height: 400px;
  background: var(--color-primary);
  filter: blur(100px);
  opacity: 0.15;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: glow-pulse 4s ease-in-out infinite;
}

.floating-badge-spotlight {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.floating-badge-spotlight:hover {
  transform: scale(1.08) translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
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

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}
</style>
