<template>
  <div class="login-wrapper d-flex align-items-center justify-content-center min-vh-100">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-5 col-xl-4">
          
          <div class="card shadow-custom border-0 animate__animated animate__fadeInUp">
            <div class="card-body p-4 p-sm-5">
              
              <div class="text-center mb-5">
                <div class="logo-container-login mb-4">
                  <img src="/src/assets/images/logo.png" alt="Logo" class="img-fluid">
                </div>
                <h3 class="fw-bold text-main mb-2">¡Bienvenido!</h3>
                <p class="text-muted small">Ingresa tus credenciales para continuar</p>
              </div>

              <div v-if="errorMessage" class="alert alert-danger border-0 small py-2 mb-4 animate__animated animate__shakeX">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMessage }}
              </div>

              <form @submit.prevent="handleLogin">
                <div class="mb-4">
                  <label class="form-label small fw-bold text-muted text-uppercase">Email</label>
                  <div class="input-group-custom">
                    <span class="icon"><i class="bi bi-envelope"></i></span>
                    <input 
                      type="email" 
                      class="form-control form-control-lg" 
                      placeholder="correo@ejemplo.com"
                      v-model="form.email"
                      required
                    >
                  </div>
                </div>

                <div class="mb-4">
                  <div class="d-flex justify-content-between">
                    <label class="form-label small fw-bold text-muted text-uppercase">Contraseña</label>
                    <a href="#" class="small text-brand text-decoration-none">¿Olvidaste la clave?</a>
                  </div>
                  <div class="input-group-custom">
                    <span class="icon"><i class="bi bi-lock"></i></span>
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
                  class="btn btn-brand w-100 btn-lg py-3 mt-2" 
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <span class="fw-bold">{{ isLoading ? 'Verificando...' : 'Entrar al Sistema' }}</span>
                </button>
              </form>

            </div>
          </div>
          
          <p class="text-center mt-4 text-muted small">
            &copy; 2026 CodeSoft E-commerce. Todos los derechos reservados.
          </p>

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
  // Asegurar que el login use el tema guardado o claro por defecto
  const savedTheme = localStorage.getItem('app-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');

.login-wrapper {
  background: var(--bg-body);
}

.logo-container-login img {
  max-height: 70px;
}

.input-group-custom {
  position: relative;
}

.input-group-custom .icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  z-index: 5;
}

.input-group-custom .form-control {
  padding-left: 3rem;
}

.card {
  border-radius: var(--radius-xl) !important;
}
</style>