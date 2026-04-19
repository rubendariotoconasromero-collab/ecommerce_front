<template>
  <div class="d-flex justify-content-center align-items-center min-vh-100">
    
    <div class="col-12 col-md-8 col-lg-5 col-xl-4 px-3">
      
      <div class="card card-custom overflow-hidden">
        <div class="card-body p-4 p-sm-5">
          
          <div class="text-center mb-4">
            <img 
              src="/src/assets/images/logo.png" 
              alt="Logo de la Empresa" 
              class="img-fluid mb-3"
              style="max-height: 60px; object-fit: contain;"
            >
            <h4 class="fw-bold mb-1">¡Bienvenido de nuevo!</h4>
            <p class="text-muted-custom small">Por favor, ingresa tus credenciales</p>
          </div>

          <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center py-2" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <div class="small">{{ errorMessage }}</div>
          </div>

          <form @submit.prevent="handleLogin">
            
            <div class="form-floating mb-3">
              <input 
                type="email" 
                class="form-control form-control-custom" 
                id="floatingEmail" 
                placeholder="name@example.com"
                v-model="form.email"
                required
              >
              <label for="floatingEmail" class="text-muted">Correo Electrónico</label>
            </div>

            <div class="form-floating mb-4">
              <input 
                type="password" 
                class="form-control form-control-custom" 
                id="floatingPassword" 
                placeholder="Password"
                v-model="form.password"
                required
              >
              <label for="floatingPassword" class="text-muted">Contraseña</label>
            </div>

            <button 
              type="submit" 
              class="btn btn-brand w-100 btn-lg d-flex justify-content-center align-items-center" 
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span>{{ isLoading ? 'Verificando...' : 'Iniciar Sesión' }}</span>
            </button>
            
          </form>

        </div>
      </div>
      
      <div class="text-center mt-4">
        <p class="text-muted-custom small mb-0">
          ¿Olvidaste tu contraseña? <a href="#" class="text-brand text-decoration-none fw-bold">Recupérala aquí</a>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: ''
});

const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = ''; 

  try {
    await authStore.login(form);
    router.push({ name: 'dashboard' });
  } catch (error) {
    if (error.response && error.response.status === 422) {
      const errors = error.response.data.errors;
      errorMessage.value = Object.values(errors)[0][0];
    } else if (error.response && error.response.data.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = 'Error al conectar. Verifica tu servidor local.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>