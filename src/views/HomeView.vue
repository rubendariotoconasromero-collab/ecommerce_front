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
            <li class="nav-item"><a class="nav-link text-body-emphasis" href="#hero" @click.prevent="scrollTo('#hero')">Inicio</a></li>
            <li class="nav-item"><a class="nav-link text-body-secondary" href="#categorias" @click.prevent="scrollTo('#categorias')">Categorías</a></li>
            <li class="nav-item"><a class="nav-link text-body-secondary" href="#productos" @click.prevent="scrollTo('#productos')">Catálogo</a></li>
            <li class="nav-item"><a class="nav-link text-body-secondary" href="#nosotros" @click.prevent="scrollTo('#nosotros')">Nosotros</a></li>
          </ul>
          
          <div class="d-flex align-items-center gap-3">
            <router-link :to="{ name: 'login' }" class="btn btn-link text-body-emphasis text-decoration-none fw-semibold">
              Iniciar Sesión
            </router-link>
            <BaseButton variant="brand" class="px-4 py-2 rounded-pill shadow" @click="scrollTo('#productos')">
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
              <BaseButton size="lg" variant="brand" class="px-5 rounded-pill shadow-lg" @click="scrollTo('#productos')">
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
        <div class="row g-5 justify-content-center">
          <div class="col-lg-3 col-md-6" v-for="(benefit, index) in benefits" :key="index">
            <div class="benefit-card p-5 rounded-5 text-center transition-all h-100 border-0 bg-transparent animate__animated animate__fadeIn" :style="{ animationDelay: `${index * 0.1}s` }">
              <div class="benefit-icon-wrapper mb-4 mx-auto shadow-sm">
                <i :class="[benefit.icon, 'fs-1 text-primary']"></i>
              </div>
              <h5 class="fw-800 text-body-emphasis mb-3">{{ benefit.title }}</h5>
              <p class="text-body-secondary mb-0 lh-base">{{ benefit.desc }}</p>
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
              <div class="modern-category-card group animate__animated animate__fadeInUp" :style="{ animationDelay: `${index * 0.1}s` }">
                <div class="card-inner overflow-hidden rounded-5 shadow-hover h-100 position-relative">
                  <!-- Product Count Badge -->
                  <div class="category-badge-floating z-3">
                    <span class="glass-pill px-3 py-1 smaller fw-800 text-white">
                      {{ cat.products_count }} ITEMS
                    </span>
                  </div>
                  
                  <!-- Background Image -->
                  <div class="category-img-container">
                    <img 
                      :src="cat.image || '/src/assets/images/category-placeholder.jpg'" 
                      @error="handleImageError"
                      class="category-img transition-slow" 
                      alt="Categoría"
                    >
                  </div>

                  <!-- Gradient Overlay -->
                  <div class="category-overlay-modern position-absolute inset-0 z-1"></div>

                  <!-- Content Area -->
                  <div class="category-content-modern d-flex flex-column justify-content-end p-4 z-2">
                    <h3 class="text-white fw-800 mb-2 category-title-modern text-truncate w-100">{{ cat.name }}</h3>
                    <div class="category-action-hidden transition-all">
                      <BaseButton variant="light" size="sm" class="glass-button rounded-pill px-4 py-2 fw-bold w-fit">
                        Explorar <i class="fa-solid fa-arrow-right-long ms-1"></i>
                      </BaseButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- Productos Destacados: Rediseño Premium -->
    <section id="productos" class="py-10 bg-body-tertiary position-relative overflow-hidden">
      <!-- Decoración de fondo sutil -->
      <div class="position-absolute top-0 end-0 p-5 opacity-10 rotate-12 d-none d-xl-block">
        <i class="fa-solid fa-cubes-stacked display-1 text-primary"></i>
      </div>

      <div class="container py-5">
        <div class="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-6 gap-4 animate__animated animate__fadeInUp">
          <div class="max-w-600">
            <BaseBadge variant="success" soft class="mb-3 px-3 py-2 rounded-pill fw-bold">Trending Now</BaseBadge>
            <h2 class="display-4 fw-800 text-body-emphasis mb-2 lh-1">Lo más buscado</h2>
            <p class="text-body-secondary mb-0 fs-5">Los productos preferidos por nuestros clientes este mes.</p>
          </div>
          <div class="d-none d-md-block">
            <BaseButton variant="outline-brand" class="rounded-pill px-4 py-3 group">
              Ver Catálogo Completo <i class="fa-solid fa-arrow-right ms-2 transition-all group-hover:translate-x-1"></i>
            </BaseButton>
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
              <div class="modern-product-card group animate__animated animate__fadeInUp" :style="{ animationDelay: `${index * 0.1}s` }">
                <div class="card h-100 border-0 bg-transparent">
                  <!-- Image Wrapper -->
                  <div class="product-visual-container position-relative mb-4">
                    <BaseBadge v-if="product.is_new" variant="primary" class="position-absolute top-3 start-3 z-3 px-3 py-1 shadow-sm rounded-pill smaller fw-bold">NUEVO</BaseBadge>
                    
                    <div class="product-img-frame rounded-5 bg-white shadow-sm overflow-hidden d-flex align-items-center justify-content-center p-4 transition-all">
                      <img 
                        :src="product.image || '/src/assets/images/product-placeholder.png'" 
                        @error="handleImageError"
                        class="img-fluid product-main-img transition-slow" 
                        :alt="product.name"
                      >
                      
                      <!-- Quick Actions Hover -->
                      <div class="product-quick-actions position-absolute inset-0 d-flex align-items-center justify-content-center opacity-0 transition-all">
                        <div class="d-flex gap-2 transform-scale-up">
                          <button class="btn btn-white btn-icon-lg rounded-circle shadow-lg" title="Vista Rápida">
                            <i class="fa-regular fa-eye"></i>
                          </button>
                          <button class="btn btn-brand btn-icon-lg rounded-circle shadow-lg" title="Agregar al Carrito">
                            <i class="fa-solid fa-cart-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Info Area -->
                  <div class="product-info-container text-center px-2">
                    <div class="text-primary smaller text-uppercase fw-800 tracking-wider mb-2 opacity-75">{{ product.category }}</div>
                    <h5 class="fw-800 text-body-emphasis mb-3 text-truncate-2 h-2.5rem px-2 lh-sm">{{ product.name }}</h5>
                    
                    <div class="d-flex align-items-center justify-content-center gap-3">
                      <div class="fs-4 fw-800 text-brand">Bs. {{ product.price }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Botón móvil -->
        <div class="d-md-none text-center mt-5">
          <BaseButton variant="brand" class="w-100 rounded-pill py-3">Ver Catálogo Completo</BaseButton>
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
                  <div class="bg-primary-soft p-2 rounded-3 text-primary"><i class="fa-solid fa-microchip fs-4"></i></div>
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
            <h2 class="display-3 fw-800 mb-4 lh-1">Ingeniería de polímeros reinventada</h2>
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
    <section id="nosotros" class="py-10 bg-body-tertiary">
      <div class="container py-5">
        <div class="row align-items-center gy-5">
          <div class="col-lg-6 animate__animated animate__fadeInLeft">
            <BaseBadge variant="warning" soft class="mb-3 px-3 py-2 rounded-pill fw-bold">Sobre Nosotros</BaseBadge>
            <h2 class="display-4 fw-800 text-body-emphasis mb-4 lh-1">Liderando la industria con innovación constante</h2>
            <p class="fs-5 text-body-secondary mb-5">
              Desde hace más de una década, nos dedicamos a transformar el mercado de soluciones plásticas. Nuestra misión es simple: proporcionar productos de alta calidad que impulsen la eficiencia de nuestros clientes industriales y la comodidad en los hogares.
            </p>
            
            <div class="row g-4 mb-5">
              <div class="col-sm-6">
                <div class="d-flex align-items-center gap-3">
                  <div class="p-3 bg-primary-soft rounded-4 text-primary fs-3"><i class="bi bi-award"></i></div>
                  <div>
                    <div class="fw-800 fs-4 mb-0">+10 Años</div>
                    <div class="small text-muted">De experiencia</div>
                  </div>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="d-flex align-items-center gap-3">
                  <div class="p-3 bg-success-soft rounded-4 text-success fs-3"><i class="bi bi-globe"></i></div>
                  <div>
                    <div class="fw-800 fs-4 mb-0">Nacional</div>
                    <div class="small text-muted">Presencia total</div>
                  </div>
                </div>
              </div>
            </div>
            
            <BaseButton variant="outline-brand" size="lg" class="rounded-pill px-5">Nuestra Historia</BaseButton>
          </div>
          <div class="col-lg-6 position-relative animate__animated animate__fadeInRight">
            <div class="about-visual-grid position-relative">
              <div class="row g-3">
                <div class="col-7">
                  <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop" class="img-fluid rounded-5 shadow-lg mb-3" alt="Fábrica">
                  <img src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?q=80&w=600&auto=format&fit=crop" class="img-fluid rounded-5 shadow-lg" alt="Logística">
                </div>
                <div class="col-5 pt-5">
                  <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=600&auto=format&fit=crop" class="img-fluid rounded-5 shadow-lg mb-3" alt="Almacén">
                  <div class="bg-brand rounded-5 p-4 text-white shadow-xl d-flex flex-column justify-content-center text-center h-50">
                    <div class="display-5 fw-800 mb-0">99%</div>
                    <div class="small opacity-75">Satisfacción del Cliente</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter / CTA: Sección Nueva Premium -->
    <section class="py-10 bg-brand position-relative overflow-hidden">
      <!-- Background Abstract Shapes -->
      <div class="position-absolute top-0 start-0 w-100 h-100 opacity-10">
        <div class="liquid-blob blob-1" style="width: 600px; height: 600px; background: white; top: -20%; left: -10%;"></div>
        <div class="liquid-blob blob-2" style="width: 500px; height: 500px; background: white; bottom: -20%; right: -10%;"></div>
      </div>

      <div class="container position-relative z-1 text-center py-5">
        <div class="max-w-700 mx-auto animate__animated animate__fadeInUp">
          <h2 class="display-3 fw-800 text-white mb-4 lh-1">¿Listo para elevar tu estándar industrial?</h2>
          <p class="fs-5 text-white opacity-75 mb-5">
            Únete a cientos de empresas que ya confían en nuestra calidad y tecnología para sus procesos.
          </p>
          
          <div class="newsletter-form-wrapper bg-white p-2 rounded-pill shadow-2xl d-flex align-items-center max-w-500 mx-auto">
            <input type="email" class="form-control border-0 bg-transparent px-4 py-3 shadow-none" placeholder="Tu correo corporativo...">
            <button class="btn btn-brand px-5 py-3 rounded-pill fw-bold shadow-lg">
              Empezar <i class="bi bi-rocket-takeoff ms-2"></i>
            </button>
          </div>
          <p class="smaller text-white opacity-50 mt-4 italic">Al suscribirte, aceptas nuestros términos y políticas de privacidad.</p>
        </div>
      </div>
    </section>

    <!-- Footer: Rediseño Premium -->
    <footer class="footer pt-10 pb-5 bg-dark text-white border-top border-secondary border-opacity-10">
      <div class="container">
        <div class="row g-5 mb-10">
          <div class="col-lg-4">
            <div class="d-flex align-items-center gap-3 mb-4">
              <div class="footer-logo-box p-2 bg-brand rounded-3">
                <i class="bi bi-lightning-charge-fill fs-3"></i>
              </div>
              <span class="fw-bold fs-3 tracking-tighter">CodeSoft</span>
            </div>
            <p class="text-white-50 mb-5 fs-6 lh-lg pe-lg-5">
              {{ settings.about_description || 'Líderes globales en soluciones plásticas de alta ingeniería. Comprometidos con la sostenibilidad y la innovación constante.' }}
            </p>
            <div class="d-flex gap-3">
              <a href="#" class="social-link"><i class="bi bi-facebook fs-5"></i></a>
              <a href="#" class="social-link"><i class="bi bi-instagram fs-5"></i></a>
              <a href="#" class="social-link"><i class="bi bi-linkedin fs-5"></i></a>
              <a href="#" class="social-link"><i class="bi bi-twitter-x fs-5"></i></a>
            </div>
          </div>
          
          <div class="col-lg-2 col-6">
            <h6 class="fw-800 text-white mb-4 text-uppercase tracking-wider smaller">Empresa</h6>
            <ul class="list-unstyled d-flex flex-column gap-3">
              <li><a href="#" class="footer-link-modern">Sobre Nosotros</a></li>
              <li><a href="#" class="footer-link-modern">Nuestra Fábrica</a></li>
              <li><a href="#" class="footer-link-modern">Sostenibilidad</a></li>
              <li><a href="#" class="footer-link-modern">Carreras</a></li>
            </ul>
          </div>
          
          <div class="col-lg-2 col-6">
            <h6 class="fw-800 text-white mb-4 text-uppercase tracking-wider smaller">Soporte</h6>
            <ul class="list-unstyled d-flex flex-column gap-3">
              <li><a href="#" class="footer-link-modern">Centro de Ayuda</a></li>
              <li><a href="#" class="footer-link-modern">Garantía</a></li>
              <li><a href="#" class="footer-link-modern">Envíos</a></li>
              <li><a href="#" class="footer-link-modern">Contacto</a></li>
            </ul>
          </div>
          
          <div class="col-lg-4">
            <h6 class="fw-800 text-white mb-4 text-uppercase tracking-wider smaller">Contacto Directo</h6>
            <div class="d-flex flex-column gap-4">
              <div class="d-flex align-items-start gap-3">
                <i class="bi bi-geo-alt text-brand fs-5"></i>
                <p class="text-white-50 small mb-0">Parque Industrial, Av. Los Próceres #450, Santa Cruz, Bolivia</p>
              </div>
              <div class="d-flex align-items-start gap-3">
                <i class="bi bi-telephone text-brand fs-5"></i>
                <p class="text-white-50 small mb-0">+591 3 345 6789<br><span class="smaller opacity-50">Lunes a Viernes, 8:00 - 18:00</span></p>
              </div>
              <div class="d-flex align-items-start gap-3">
                <i class="bi bi-envelope text-brand fs-5"></i>
                <p class="text-white-50 small mb-0">ventas@codesoft.com.bo</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom border-top border-secondary border-opacity-10 pt-5 mt-5">
          <div class="row align-items-center">
            <div class="col-md-6 text-center text-md-start mb-4 mb-md-0">
              <p class="text-white-50 smaller mb-0">
                &copy; 2026 CodeSoft. {{ settings.footer_text || 'Todos los derechos reservados.' }}
              </p>
            </div>
            <div class="col-md-6">
              <div class="d-flex justify-content-center justify-content-md-end gap-4 text-white-50 smaller">
                <a href="#" class="footer-link-modern">Privacidad</a>
                <a href="#" class="footer-link-modern">Términos</a>
                <a href="#" class="footer-link-modern">Cookies</a>
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
.fw-800 { font-weight: 800; }
.py-10 { padding-top: 7rem; padding-bottom: 7rem; }
.mb-6 { margin-bottom: 4rem; }
.max-w-600 { max-width: 600px; }
.tracking-wider { letter-spacing: 0.1em; }
.shadow-hover { transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }

/* NAVBAR */
.glass-navbar {
  background: rgba(var(--bs-body-bg-rgb), 0.7);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-bottom: 1px solid var(--border-color);
  z-index: 1100;
}

/* HERO IMPROVEMENTS */
.hero-glow {
  width: 500px;
  height: 500px;
  background: var(--color-primary);
  filter: blur(150px);
  opacity: 0.2;
}

/* MODERN CATEGORY CARDS */
.modern-category-card {
  height: 480px;
  cursor: pointer;
  perspective: 1000px;
}

.card-inner {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-card);
}

.modern-category-card:hover .card-inner {
  transform: translateY(-12px);
  box-shadow: 0 30px 60px rgba(0,0,0,0.12) !important;
}

.category-img-container {
  height: 100%;
  width: 100%;
}

.category-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.02);
}

.modern-category-card:hover .category-img {
  transform: scale(1.1);
}

.category-overlay-modern {
  background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 100%);
}

.category-badge-floating {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
}

.glass-pill {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
}

.glass-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white !important;
  transition: all 0.3s ease;
}

.glass-button:hover {
  background: white !important;
  color: black !important;
  transform: scale(1.05);
}

.category-title-modern {
  font-size: 2rem;
  letter-spacing: -0.02em;
}

/* MODERN PRODUCT CARDS */
.modern-product-card {
  transition: all 0.4s ease;
}

.product-img-frame {
  aspect-ratio: 1/1;
  position: relative;
}

.modern-product-card:hover .product-img-frame {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
}

.product-main-img {
  max-height: 85%;
  object-fit: contain;
}

.modern-product-card:hover .product-main-img {
  transform: scale(1.08);
}

.product-quick-actions {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.modern-product-card:hover .product-quick-actions {
  opacity: 1 !important;
}

.btn-icon-lg {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.btn-white {
  background: white;
  color: var(--slate-900);
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.h-2.5rem { height: 3.5rem; }

/* ANIMATIONS & TRANSITIONS */
.transition-slow { transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
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
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.social-link:hover {
  background: var(--color-primary);
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 10px 20px var(--color-primary-glass);
}

/* PREMIUM LIQUID BACKGROUND */
.bg-gradient-subtle {
  background: radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.03) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.03) 0%, transparent 40%);
}

.premium-liquid-bg {
  pointer-events: none;
  filter: blur(70px);
  opacity: 0.8;
}

/* UTILITIES */
.rounded-5 { border-radius: 2rem !important; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }

/* BENEFIT CARDS */
.benefit-card {
  background: var(--bg-card);
  border: 1px solid transparent;
  transition: all 0.4s ease;
}

.benefit-card:hover {
  background: white;
  border-color: var(--color-primary-soft);
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.05);
}

.benefit-icon-wrapper {
  width: 80px;
  height: 80px;
  background: var(--color-primary-soft);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;
}

.benefit-card:hover .benefit-icon-wrapper {
  background: var(--color-primary);
  transform: rotate(10deg);
}

.benefit-card:hover .benefit-icon-wrapper i {
  color: white !important;
}

/* ABOUT SECTION */
.bg-primary-soft { background: var(--color-primary-soft); }
.bg-success-soft { background: rgba(16, 185, 129, 0.1); }
.bg-brand { background: var(--color-primary) !important; }

/* NEWSLETTER */
.max-w-700 { max-width: 700px; }
.max-w-500 { max-width: 500px; }

.newsletter-form-wrapper {
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.3s ease;
}

.newsletter-form-wrapper:focus-within {
  transform: scale(1.02);
  box-shadow: 0 0 30px rgba(0,0,0,0.15);
}

/* FOOTER MODERN */
.footer-link-modern {
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.footer-link-modern:hover {
  color: var(--color-primary);
  padding-left: 5px;
}

.footer-logo-box {
  box-shadow: 0 8px 16px var(--color-primary-glass);
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
}

.btn-scroll-top.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.btn-scroll-top:hover {
  background: var(--color-primary-hover);
  transform: translateY(-5px);
}

.tracking-tighter { letter-spacing: -0.05em; }

/* SKELETONS */
.skeleton-category {
  height: 480px;
  background: linear-gradient(90deg, var(--bg-hover) 25%, var(--border-light) 50%, var(--bg-hover) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>