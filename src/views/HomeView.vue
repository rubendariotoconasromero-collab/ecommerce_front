<template>
  <div class="landing-page bg-body">
    <!-- Navbar Pública Premium (Glassmorphism) -->
    <nav class="navbar navbar-expand-lg fixed-top glass-navbar py-3 px-md-5">
      <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center gap-2" href="#">
          <!-- <img src="/src/assets/images/logo.png" alt="Logo" class="landing-logo"> -->
          <span class="fw-bold text-body-emphasis fs-4 d-none d-sm-block">CodeSoft</span>
        </a>
        
        <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#landingNav">
          <i class="bi bi-list fs-1 text-body-emphasis"></i>
        </button>

        <div class="collapse navbar-collapse" id="landingNav">
          <ul class="navbar-nav mx-auto gap-lg-4 mb-2 mb-lg-0 fw-medium">
            <li class="nav-item"><a class="nav-link text-body-emphasis active" href="#hero">Inicio</a></li>
            <li class="nav-item"><a class="nav-link text-body-secondary" href="#categorias">Categorías</a></li>
            <li class="nav-item"><a class="nav-link text-body-secondary" href="#productos">Catálogo</a></li>
            <li class="nav-item"><a class="nav-link text-body-secondary" href="#nosotros">Nosotros</a></li>
          </ul>
          
          <div class="d-flex align-items-center gap-3">
            <router-link :to="{ name: 'login' }" class="btn btn-link text-body-emphasis text-decoration-none fw-semibold">
              Iniciar Sesión
            </router-link>
            <BaseButton variant="brand" class="px-4 py-2 rounded-pill shadow">
              Explorar Catálogo
            </BaseButton>
          </div>
        </div>
      </div>
    </nav>

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
        <div class="row align-items-center gy-5">
          <div class="col-lg-6 animate__animated animate__fadeInLeft">
            <BaseBadge variant="primary" soft class="mb-3 px-3 py-2 rounded-pill">
              ✨ Bienvenido a la nueva era de compras
            </BaseBadge>
            <h1 class="display-3 fw-800 text-body-emphasis mb-4 lh-1">
              {{ settings.hero_title || 'Impulsamos tu industria con calidad premium' }}
            </h1>
            <p class="lead text-body-secondary mb-5 pe-lg-5">
              {{ settings.hero_subtitle || 'Descubre nuestro catálogo exclusivo de productos plásticos diseñados para el máximo rendimiento y durabilidad.' }}
            </p>
            <div class="d-flex flex-wrap gap-3">
              <BaseButton size="lg" variant="brand" class="px-5 rounded-pill shadow-lg">
                Comenzar ahora
              </BaseButton>
              <BaseButton size="lg" variant="outline-brand" class="px-5 rounded-pill">
                Ver Vídeo <i class="bi bi-play-circle ms-2"></i>
              </BaseButton>
            </div>
            
            <div class="mt-5 d-flex align-items-center gap-4 animate__animated animate__fadeIn animate__delay-1s">
              <div class="d-flex align-items-center">
                <div class="avatar-stack">
                  <div class="avatar-sm bg-primary text-white border-2 border-body">A</div>
                  <div class="avatar-sm bg-success text-white border-2 border-body">B</div>
                  <div class="avatar-sm bg-info text-white border-2 border-body">C</div>
                </div>
                <div class="ms-3">
                  <div class="fw-bold small text-body-emphasis">+1,200 Clientes</div>
                  <div class="smaller text-body-secondary">Confían en nosotros</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6 position-relative animate__animated animate__fadeInRight">
            <div class="hero-visual-wrapper position-relative">
              <!-- Glow Effect Background -->
              <div class="hero-glow position-absolute top-50 start-50 translate-middle"></div>
              <img 
                :src="settings.hero_image_url || '/src/assets/images/hero-mockup.png'" 
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
      </div>
    </header>

    <!-- Beneficios (Trust & Value) -->
    <section class="py-5 bg-body-tertiary border-top border-bottom">
      <div class="container py-4">
        <div class="row g-4 text-center">
          <div class="col-md-3" v-for="(benefit, index) in benefits" :key="index">
            <div class="p-4 hover-translate-y transition-all">
              <div class="icon-box-lg bg-body rounded-4 border shadow-sm mx-auto mb-4 d-flex align-items-center justify-content-center">
                <i :class="[benefit.icon, 'text-primary fs-2']"></i>
              </div>
              <h6 class="fw-bold text-body-emphasis mb-2">{{ benefit.title }}</h6>
              <p class="small text-body-secondary mb-0">{{ benefit.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categorías Destacadas -->
    <section id="categorias" class="py-10">
      <div class="container py-5">
        <div class="text-center mb-5 animate__animated animate__fadeInUp">
          <BaseBadge variant="info" soft class="mb-2">Nuestro Universo</BaseBadge>
          <h2 class="display-5 fw-800 text-body-emphasis mb-3">Explora por Categoría</h2>
          <p class="text-body-secondary mx-auto" style="max-width: 600px;">
            Soluciones especializadas para cada una de tus necesidades industriales y domésticas.
          </p>
        </div>

        <div class="row g-4">
          <div class="col-lg-4 col-md-6" v-for="(cat, index) in categories" :key="index">
            <div class="category-card position-relative overflow-hidden rounded-4 border-0 shadow-sm animate__animated animate__fadeInUp" :style="{ animationDelay: `${index * 0.1}s` }">
              <div class="card-img-overlay d-flex flex-column justify-content-end p-4 z-2">
                <h4 class="text-white fw-bold mb-1">{{ cat.name }}</h4>
                <p class="text-white opacity-75 small mb-3">{{ cat.products_count }} Productos</p>
                <BaseButton variant="light" size="sm" class="w-fit rounded-pill px-4">Ver más</BaseButton>
              </div>
              <img :src="cat.image || '/src/assets/images/category-placeholder.jpg'" class="img-fluid w-100 category-bg-img" alt="Categoría">
              <div class="category-overlay position-absolute inset-0 bg-dark opacity-50 transition-all"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Productos Destacados -->
    <section id="productos" class="py-10 bg-body-tertiary">
      <div class="container py-5">
        <div class="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-5 gap-4">
          <div class="animate__animated animate__fadeInLeft">
            <h2 class="display-5 fw-800 text-body-emphasis mb-2">Lo más buscado</h2>
            <p class="text-body-secondary mb-0">Los productos preferidos por nuestros clientes este mes.</p>
          </div>
          <div class="animate__animated animate__fadeInRight">
            <BaseButton variant="outline-brand" class="rounded-pill px-4">Ver Catálogo Completo <i class="bi bi-arrow-right ms-2"></i></BaseButton>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-xl-3 col-lg-4 col-md-6" v-for="(product, index) in featuredProducts" :key="index">
            <div class="product-card card border-0 h-100 shadow-sm rounded-4 bg-body animate__animated animate__fadeInUp" :style="{ animationDelay: `${index * 0.1}s` }">
              <div class="position-relative p-3">
                <BaseBadge v-if="product.is_new" variant="success" class="position-absolute top-4 start-4 z-3 px-3 py-1 shadow-sm">NUEVO</BaseBadge>
                <div class="product-img-wrapper rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center" style="aspect-ratio: 1/1;">
                  <img :src="product.image || '/src/assets/images/product-placeholder.png'" class="img-fluid product-img transition-all" :alt="product.name">
                </div>
              </div>
              <div class="card-body pt-0 px-4 pb-4 d-flex flex-column">
                <div class="text-body-secondary smaller text-uppercase fw-bold mb-1">{{ product.category }}</div>
                <h6 class="fw-bold text-body-emphasis mb-3 text-truncate">{{ product.name }}</h6>
                <div class="mt-auto d-flex align-items-center justify-content-between">
                  <div class="text-brand fw-800 fs-5">Bs. {{ product.price }}</div>
                  <button class="btn btn-icon-only btn-brand rounded-circle shadow-sm">
                    <i class="bi bi-cart-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Premium -->
    <footer class="footer py-8 bg-dark text-white border-top">
      <div class="container py-5">
        <div class="row g-5">
          <div class="col-lg-4">
            <div class="d-flex align-items-center gap-2 mb-4">
              <img src="/src/assets/images/logo.png" alt="Logo" class="landing-logo filter-invert">
              <span class="fw-bold fs-4">CodeSoft</span>
            </div>
            <p class="text-white-50 mb-4 pe-lg-5">
              {{ settings.about_description || 'Líderes en la fabricación y distribución de productos plásticos de alta calidad para el mercado industrial y corporativo.' }}
            </p>
            <div class="d-flex gap-3">
              <a href="#" class="social-link"><i class="bi bi-facebook fs-5"></i></a>
              <a href="#" class="social-link"><i class="bi bi-instagram fs-5"></i></a>
              <a href="#" class="social-link"><i class="bi bi-linkedin fs-5"></i></a>
              <a href="#" class="social-link"><i class="bi bi-twitter-x fs-5"></i></a>
            </div>
          </div>
          <div class="col-lg-2 col-6 col-md-4">
            <h6 class="fw-bold mb-4">Empresa</h6>
            <ul class="list-unstyled d-flex flex-column gap-2 text-white-50">
              <li><a href="#" class="footer-link">Sobre Nosotros</a></li>
              <li><a href="#" class="footer-link">Contacto</a></li>
              <li><a href="#" class="footer-link">Carreras</a></li>
              <li><a href="#" class="footer-link">Noticias</a></li>
            </ul>
          </div>
          <div class="col-lg-2 col-6 col-md-4">
            <h6 class="fw-bold mb-4">Soporte</h6>
            <ul class="list-unstyled d-flex flex-column gap-2 text-white-50">
              <li><a href="#" class="footer-link">Centro de Ayuda</a></li>
              <li><a href="#" class="footer-link">Guías de Compra</a></li>
              <li><a href="#" class="footer-link">Envíos y Entregas</a></li>
              <li><a href="#" class="footer-link">Garantía</a></li>
            </ul>
          </div>
          <div class="col-lg-4 col-md-4">
            <h6 class="fw-bold mb-4">Suscríbete</h6>
            <p class="text-white-50 small mb-4">Recibe nuestras novedades y ofertas exclusivas directamente en tu email.</p>
            <div class="input-group shadow-sm">
              <input type="email" class="form-control bg-dark border-secondary text-white" placeholder="Tu email...">
              <button class="btn btn-brand px-4" type="button">Unirme</button>
            </div>
          </div>
        </div>
        <hr class="my-5 border-secondary">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-white-50 smaller">
          <div>{{ settings.footer_text || '© 2026 CodeSoft. Todos los derechos reservados.' }}</div>
          <div class="d-flex gap-4">
            <a href="#" class="footer-link">Privacidad</a>
            <a href="#" class="footer-link">Términos</a>
            <a href="#" class="footer-link">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../plugins/axios';
import BaseButton from '../components/base/BaseButton.vue';
import BaseBadge from '../components/base/BaseBadge.vue';

const settings = ref({});
const categories = ref([]);
const featuredProducts = ref([]);

const benefits = [
  { icon: 'bi-truck', title: 'Envíos Rápidos', desc: 'Entregas a nivel nacional en 24/48 horas.' },
  { icon: 'bi-shield-check', title: 'Pagos Seguros', desc: 'Protocolos de seguridad de nivel bancario.' },
  { icon: 'bi-box-seam', title: 'Garantía Total', desc: 'Todos nuestros productos están certificados.' },
  { icon: 'bi-headset', title: 'Soporte 24/7', desc: 'Atención personalizada ante cualquier duda.' }
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
      name: c.name,
      products_count: c.products_count,
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

onMounted(() => {
  fetchSettings();
  fetchCategories();
  fetchFeaturedProducts();
});
</script>

<style scoped>
.fw-800 { font-weight: 800; }
.py-10 { padding-top: 6rem; padding-bottom: 6rem; }
.w-fit { width: fit-content; }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }

/* NAVBAR */
.glass-navbar {
  background: rgba(var(--bs-body-bg-rgb), 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  z-index: 1100;
}

.landing-logo { height: 40px; width: auto; }
.filter-invert { filter: brightness(0) invert(1); }

/* HERO */
.hero-section {
  background: radial-gradient(circle at top right, var(--color-primary-soft), transparent 40%);
}

.hero-glow {
  width: 400px;
  height: 400px;
  background: var(--color-primary);
  filter: blur(120px);
  opacity: 0.15;
}

.hero-img {
  border-radius: 2rem;
  transform: perspective(1000px) rotateY(-5deg);
}

.floating-anim {
  animation: floating 6s ease-in-out infinite;
}

@keyframes floating {
  0% { transform: perspective(1000px) rotateY(-5deg) translateY(0px); }
  50% { transform: perspective(1000px) rotateY(-5deg) translateY(-20px); }
  100% { transform: perspective(1000px) rotateY(-5deg) translateY(0px); }
}

.floating-card {
  bottom: 10%;
  left: -5%;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(var(--bs-body-bg-rgb), 0.8) !important;
}

.avatar-stack {
  display: flex;
  margin-left: 0.5rem;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  margin-left: -10px;
  border: 2px solid;
}

/* CARDS */
.icon-box-lg {
  width: 70px;
  height: 70px;
}

.category-card {
  height: 400px;
  cursor: pointer;
}

.category-bg-img {
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-card:hover .category-bg-img {
  transform: scale(1.1);
}

.category-card:hover .category-overlay {
  opacity: 0.3 !important;
}

.product-card {
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg) !important;
}

.product-img-wrapper {
  background-color: var(--bg-hover) !important;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

/* FOOTER */
.social-link {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: white;
  transition: all 0.2s ease;
  text-decoration: none;
}

.social-link:hover {
  background: var(--color-primary);
  transform: translateY(-3px);
}

.footer-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: white;
}

/* PREMIUM LIQUID MESH BACKGROUND - RECORRIDO TOTAL */
.premium-liquid-bg {
  pointer-events: none;
  filter: blur(60px);
  opacity: 0.95;
}

.liquid-blob {
  position: absolute;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  transition: all 1s ease;
  will-change: transform; /* Optimización de rendimiento para animaciones largas */
}

.blob-1 {
  width: 900px;
  height: 900px;
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  top: -10%;
  left: -10%;
  opacity: 0.5;
  animation: move-total-1 12s infinite alternate cubic-bezier(0.45, 0, 0.55, 1);
}

.blob-2 {
  width: 800px;
  height: 800px;
  background: linear-gradient(135deg, #0ea5e9, #22d3ee);
  bottom: -10%;
  right: -10%;
  opacity: 0.4;
  animation: move-total-2 15s infinite alternate-reverse cubic-bezier(0.45, 0, 0.55, 1);
}

.blob-3 {
  width: 700px;
  height: 700px;
  background: linear-gradient(135deg, #818cf8, var(--color-primary));
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.3;
  animation: move-total-3 10s infinite alternate cubic-bezier(0.45, 0, 0.55, 1);
}

.liquid-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, transparent 10%, var(--bs-body-bg) 90%);
  backdrop-filter: saturate(160%) brightness(108%);
}

@keyframes move-total-1 {
  0% { transform: translate(0, 0) rotate(0deg) scale(1); }
  50% { transform: translate(60vw, 30vh) rotate(120deg) scale(1.2); } /* Recorre gran parte de la pantalla */
  100% { transform: translate(20vw, 70vh) rotate(240deg) scale(0.8); }
}

@keyframes move-total-2 {
  0% { transform: translate(0, 0) rotate(0deg) scale(1.1); }
  50% { transform: translate(-50vw, -40vh) rotate(-150deg) scale(0.8); } /* Cruza hacia la esquina opuesta */
  100% { transform: translate(-80vw, 10vh) rotate(-300deg) scale(1.3); }
}

@keyframes move-total-3 {
  0% { transform: translate(-50%, -50%) scale(0.9); }
  50% { transform: translate(-10%, -80%) scale(1.5); } /* Movimiento central expansivo */
  100% { transform: translate(-90%, 20%) scale(1.1); }
}

.cascading-paths {
  filter: drop-shadow(0 0 8px var(--color-primary-glass));
}
</style>