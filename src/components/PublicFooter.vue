<template>
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
            {{ settings?.about_description || 'Líderes globales en soluciones plásticas de alta ingeniería. Comprometidos con la sostenibilidad y la innovación constante para la industria 4.0.' }}
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
            <li><router-link to="/">Inicio</router-link></li>
            <li><router-link to="/catalogo">Catálogo</router-link></li>
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
              &copy; 2026 <span class="fw-bold">CodeSoft</span>. {{ settings?.footer_text || 'Excelencia en Polímeros.' }}
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
</template>

<script setup>
defineProps({
  settings: {
    type: Object,
    default: () => ({})
  }
});
</script>

<style scoped>
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
  position: relative;
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
  text-transform: uppercase;
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

.pt-10 {
  padding-top: 6rem;
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
</style>