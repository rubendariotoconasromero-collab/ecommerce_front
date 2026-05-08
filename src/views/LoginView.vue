<template>
  <div class="login-wrapper d-flex align-items-center justify-content-center min-vh-100 overflow-hidden position-relative">
    <!-- Premium Mesh Background -->
    <div class="premium-liquid-bg position-absolute inset-0 z-0">
      <div class="liquid-blob blob-1"></div>
      <div class="liquid-blob blob-2"></div>
      <div class="liquid-blob blob-3"></div>
      <div class="liquid-overlay"></div>
    </div>

    <div class="container position-relative z-1">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-5 col-xl-4">
          
          <div class="card premium-card border-0 animate__animated animate__zoomIn">
            <div class="card-body p-4 p-sm-5">
              
              <div class="text-center mb-5">
                <div class="logo-box-premium mb-4 mx-auto shadow-sm">
                  <i class="fa-solid fa-lightning-charge-fill text-white fs-2"></i>
                </div>
                <h2 class="fw-800 text-body-emphasis mb-2">CodeSoft</h2>
                <p class="text-muted smaller fw-medium text-uppercase tracking-wider">Acceso al Ecosistema</p>
              </div>

              <div v-if="errorMessage" class="alert alert-soft-danger border-0 small py-3 mb-4 animate__animated animate__shakeX d-flex align-items-center gap-3">
                <i class="fa-solid fa-circle-exclamation fs-5"></i>
                <div>{{ errorMessage }}</div>
              </div>

              <form @submit.prevent="handleLogin" class="premium-form">
                <div class="mb-4">
                  <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter">Email Corporativo</label>
                  <div class="input-modern-wrapper">
                    <span class="input-icon"><i class="fa-regular fa-envelope"></i></span>
                    <input 
                      type="email" 
                      class="form-control form-control-lg" 
                      placeholder="nombre@empresa.com"
                      v-model="form.email"
                      required
                    >
                  </div>
                </div>

                <div class="mb-4">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-0">Contraseña</label>
                    <a href="#" class="smaller text-brand text-decoration-none fw-bold">¿Olvidaste la clave?</a>
                  </div>
                  <div class="input-modern-wrapper">
                    <span class="input-icon"><i class="fa-solid fa-lock-open"></i></span>
                    <input 
                      type="password" 
                      class="form-control form-control-lg" 
                      placeholder="••••••••"
                      v-model="form.password"
                      required
                    >
                  </div>
                </div>

                <button 
                  type="submit" 
                  class="btn btn-brand w-100 btn-lg py-3 mt-3 rounded-pill fw-bold shadow-brand-lg transition-all" 
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <span>{{ isLoading ? 'Autenticando...' : 'Iniciar Sesión' }}</span>
                  <i v-if="!isLoading" class="fa-solid fa-arrow-right-to-bracket ms-2"></i>
                </button>
              </form>

            </div>
          </div>
          
          <div class="text-center mt-5 animate__animated animate__fadeIn animate__delay-1s">
            <router-link :to="{ name: 'home' }" class="text-body-secondary text-decoration-none smaller fw-bold hover-primary transition-all">
              <i class="fa-solid fa-arrow-left me-2"></i> Volver a la página principal
            </router-link>
            <p class="mt-4 text-body-secondary smaller opacity-50">
              &copy; 2026 CodeSoft. Tecnología para el futuro.
            </p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({ email: '', password: '' });
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = ''; 

  try {
    await authStore.login(form);
    router.push({ name: 'dashboard' });
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Error de conexión con el servidor.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('app-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
});
</script>

<style scoped>
.login-wrapper {
  background: var(--bg-body);
}

.premium-card {
  border-radius: 2.5rem !important;
  background: rgba(var(--bs-body-bg-rgb), 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 40px 100px rgba(0,0,0,0.1) !important;
}

.logo-box-premium {
  width: 60px;
  height: 60px;
  background: var(--color-primary);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-10deg);
}

.input-modern-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary);
  opacity: 0.6;
  font-size: 1.1rem;
  z-index: 5;
}

.input-modern-wrapper .form-control {
  padding-left: 3.5rem;
  height: 60px;
  border-radius: 1rem;
  border: 2px solid var(--border-light);
  background: var(--bg-body);
  font-weight: 500;
  transition: all 0.3s ease;
}

.input-modern-wrapper .form-control:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-soft);
  background: white;
}

.alert-soft-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 1rem;
}

.shadow-brand-lg {
  box-shadow: 0 15px 30px var(--color-primary-glass) !important;
}

.fw-800 { font-weight: 800; }
.smaller { font-size: 0.85rem; }
.smallest { font-size: 0.75rem; }
.tracking-wider { letter-spacing: 0.1em; }
.tracking-tighter { letter-spacing: -0.02em; }

.hover-primary:hover { color: var(--color-primary) !important; }

/* PREMIUM LIQUID MESH BACKGROUND */
.premium-liquid-bg {
  pointer-events: none;
  filter: blur(80px);
  opacity: 0.6;
}

.liquid-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
}

.blob-1 {
  width: 600px;
  height: 600px;
  background: var(--color-primary-soft);
  top: -10%;
  left: -10%;
  animation: move-1 20s infinite alternate;
}

.blob-2 {
  width: 500px;
  height: 500px;
  background: rgba(14, 165, 233, 0.15);
  bottom: -10%;
  right: -10%;
  animation: move-2 25s infinite alternate-reverse;
}

.blob-3 {
  width: 400px;
  height: 400px;
  background: rgba(139, 92, 246, 0.1);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.liquid-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent, var(--bg-body) 80%);
}

@keyframes move-1 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(200px, 100px) scale(1.2); }
}

@keyframes move-2 {
  0% { transform: translate(0, 0) scale(1.1); }
  100% { transform: translate(-150px, -50px) scale(0.9); }
}

.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
</style>