<template>
  <div class="login-page">

    <!-- ═══════════════════════════════════════════
         PANEL IZQUIERDO — Identidad Corporativa
    ═══════════════════════════════════════════ -->
    <div class="brand-panel d-none d-lg-flex">

      <!-- Fondo animado -->
      <div class="brand-bg">
        <div class="brand-orb brand-orb--1"></div>
        <div class="brand-orb brand-orb--2"></div>
        <div class="brand-orb brand-orb--3"></div>
        <div class="brand-grid"></div>
      </div>

      <!-- Contenido del panel -->
      <div class="brand-content">

        <!-- Logo -->
        <div class="brand-logo animate__animated animate__fadeInDown">
          <div class="brand-logo__icon">
            <i class="fa-solid fa-cubes"></i>
          </div>
          <span class="brand-logo__name">SOLUPLAST</span>
        </div>

        <!-- Claim central -->
        <div class="brand-claim animate__animated animate__fadeInUp" style="animation-delay: 0.3s;">
          <div class="brand-claim__tag">
            <i class="fa-solid fa-award me-2"></i> Estándar de Excelencia Industrial
          </div>
          <h1 class="brand-claim__title">
            Ingeniería<br>
            Termoplástica<br>
            <span class="brand-claim__title--accent">de Alta Precisión</span>
          </h1>
          <p class="brand-claim__desc">
            Soluciones de polímeros avanzados para industrias que exigen lo máximo en durabilidad, tolerancias exactas y cadenas logísticas eficientes.
          </p>
        </div>

        <!-- Métricas -->
        <div class="brand-metrics animate__animated animate__fadeInUp" style="animation-delay: 0.5s;">
          <div class="brand-metric">
            <div class="brand-metric__value">+10M</div>
            <div class="brand-metric__label">Piezas Inyectadas</div>
          </div>
          <div class="brand-metric__divider"></div>
          <div class="brand-metric">
            <div class="brand-metric__value">ISO 9001</div>
            <div class="brand-metric__label">Certificación</div>
          </div>
          <div class="brand-metric__divider"></div>
          <div class="brand-metric">
            <div class="brand-metric__value">18+</div>
            <div class="brand-metric__label">Años de Experiencia</div>
          </div>
        </div>

        <!-- Footer del panel -->
        <div class="brand-footer">
          <span>© 2026 SOLUPLAST S.A. Todos los derechos reservados.</span>
          <div class="d-flex gap-3">
            <a href="#" class="brand-footer__link">Privacidad</a>
            <a href="#" class="brand-footer__link">Calidad ISO</a>
          </div>
        </div>

      </div>
    </div>

    <!-- ═══════════════════════════════════════════
         PANEL DERECHO — Formulario de Acceso
    ═══════════════════════════════════════════ -->
    <div class="form-panel">

      <!-- Fondo decorativo mobile -->
      <div class="form-panel__bg-mobile d-lg-none">
        <div class="mobile-orb"></div>
      </div>

      <div class="form-wrapper animate__animated animate__fadeIn">

        <!-- Logo mobile -->
        <div class="form-mobile-logo d-flex d-lg-none">
          <div class="brand-logo__icon brand-logo__icon--sm">
            <i class="fa-solid fa-cubes"></i>
          </div>
          <span class="brand-logo__name brand-logo__name--dark">SOLUPLAST</span>
        </div>

        <!-- Encabezado del formulario -->
        <div class="form-header">
          <div class="form-header__eyebrow">
            <span class="form-header__dot"></span>
            Panel de Administración
          </div>
          <h2 class="form-header__title">Bienvenido de vuelta</h2>
          <p class="form-header__subtitle">Introduce tus credenciales para acceder al centro de control corporativo.</p>
        </div>

        <!-- Alerta de error -->
        <div v-if="errorMessage"
          class="form-alert form-alert--error animate__animated animate__shakeX">
          <div class="form-alert__icon">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div class="form-alert__msg">{{ errorMessage }}</div>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleLogin" class="login-form" novalidate>

          <!-- Campo Email -->
          <div class="form-field" :class="{ 'form-field--focused': focusedField === 'email', 'form-field--filled': form.email }">
            <label class="form-field__label" for="loginEmail">Correo Electrónico</label>
            <div class="form-field__control">
              <span class="form-field__icon">
                <i class="fa-regular fa-envelope"></i>
              </span>
              <input
                id="loginEmail"
                type="email"
                class="form-field__input"
                placeholder="nombre@soluplast.com"
                v-model="form.email"
                required
                autocomplete="email"
                @focus="focusedField = 'email'"
                @blur="focusedField = ''"
              >
            </div>
          </div>

          <!-- Campo Contraseña -->
          <div class="form-field" :class="{ 'form-field--focused': focusedField === 'password', 'form-field--filled': form.password }">
            <div class="d-flex justify-content-between align-items-center">
              <label class="form-field__label" for="loginPassword">Contraseña</label>
              <a href="#" class="form-field__forgot">¿Olvidaste tu clave?</a>
            </div>
            <div class="form-field__control">
              <span class="form-field__icon">
                <i class="fa-solid fa-lock"></i>
              </span>
              <input
                id="loginPassword"
                :type="showPassword ? 'text' : 'password'"
                class="form-field__input"
                placeholder="••••••••••••"
                v-model="form.password"
                required
                autocomplete="current-password"
                @focus="focusedField = 'password'"
                @blur="focusedField = ''"
              >
              <button type="button" class="form-field__eye" @click="showPassword = !showPassword" tabindex="-1">
                <i class="fa-regular" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Recordar sesión -->
          <div class="form-remember">
            <label class="form-remember__label" for="rememberMe">
              <input type="checkbox" id="rememberMe" class="form-remember__check" v-model="rememberMe">
              <span class="form-remember__toggle"></span>
              Mantener sesión iniciada
            </label>
          </div>

          <!-- Botón de submit -->
          <button
            type="submit"
            class="login-btn"
            :class="{ 'login-btn--loading': isLoading }"
            :disabled="isLoading"
          >
            <span class="login-btn__content">
              <span v-if="isLoading" class="login-btn__spinner"></span>
              <span>{{ isLoading ? 'Autenticando...' : 'Iniciar Sesión' }}</span>
              <i v-if="!isLoading" class="fa-solid fa-arrow-right-long login-btn__arrow"></i>
            </span>
          </button>

        </form>

        <!-- Indicadores de seguridad -->
        <div class="security-badges">
          <span class="security-badge">
            <i class="fa-solid fa-shield-check"></i> SSL Seguro
          </span>
          <span class="security-badge">
            <i class="fa-solid fa-lock"></i> Cifrado AES-256
          </span>
          <span class="security-badge">
            <i class="fa-solid fa-user-shield"></i> 2FA Listo
          </span>
        </div>

        <!-- Volver al sitio -->
        <div class="form-back">
          <router-link :to="{ name: 'home' }" class="form-back__link">
            <i class="fa-solid fa-arrow-left me-2"></i>
            Volver al sitio público
          </router-link>
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
const showPassword = ref(false);
const rememberMe = ref(false);
const focusedField = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await authStore.login(form);
    router.push({ name: 'dashboard' });
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Credenciales incorrectas. Verifica e intenta de nuevo.';
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
/* ════════════════════════════════════════════
   LAYOUT BASE
   ════════════════════════════════════════════ */
.login-page {
  min-height: 100vh;
  display: flex;
  font-family: var(--sol-font-family);
}

/* ════════════════════════════════════════════
   PANEL IZQUIERDO — BRANDING
   ════════════════════════════════════════════ */
.brand-panel {
  width: 50%;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  flex-direction: column;
}

/* Fondo preciso — sin blur */
.brand-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #000d1f 0%, #001a38 55%, #002654 100%);
}

/* Dot grid premium — patrón industrial */
.brand-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.11) 1px, transparent 1px);
  background-size: 30px 30px;
}

/* Anillos geométricos — precisión técnica, sin blur */
.brand-orb {
  position: absolute;
  border-radius: 50%;
}
.brand-orb--1 {
  width: 580px;
  height: 580px;
  border: 1px solid rgba(255,255,255,0.05);
  top: -160px;
  right: -120px;
  animation: ringRotate 80s linear infinite;
}
.brand-orb--2 {
  width: 380px;
  height: 380px;
  border: 1px solid rgba(255,255,255,0.07);
  bottom: -90px;
  left: -90px;
  animation: ringRotate 60s linear infinite reverse;
}
.brand-orb--3 {
  width: 200px;
  height: 200px;
  border: 1px solid rgba(0, 113, 158, 0.2);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Contenido del panel */
.brand-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2.5rem;
}

/* Logo */
.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}
.brand-logo__icon {
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  color: #ffffff;
  flex-shrink: 0;
}
.brand-logo__icon--sm {
  width: 38px;
  height: 38px;
  font-size: 1rem;
  border-radius: 10px;
}
.brand-logo__name {
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.05em;
}
.brand-logo__name--dark {
  color: var(--sol-neutral-dark);
}

/* Claim central */
.brand-claim {
  margin: auto 0;
  max-width: 400px;
}
.brand-claim__tag {
  display: inline-flex;
  align-items: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.65);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.375rem 0.875rem;
  border-radius: 50px;
  margin-bottom: 1.5rem;
}
.brand-claim__title {
  font-size: 2.75rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.08;
  letter-spacing: -0.03em;
  margin-bottom: 1.25rem;
}
.brand-claim__title--accent {
  color: rgba(255,255,255,0.45);
  font-weight: 300;
  font-style: italic;
}
.brand-claim__desc {
  font-size: 0.9375rem;
  color: rgba(255,255,255,0.45);
  line-height: 1.75;
  margin-bottom: 2rem;
  font-weight: 400;
}

/* Métricas */
.brand-metrics {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 1.25rem 1.75rem;
  margin-bottom: 2rem;
}
.brand-metric {
  flex: 1;
  text-align: center;
}
.brand-metric__value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 0.3rem;
  letter-spacing: -0.03em;
}
.brand-metric__label {
  font-size: 0.67rem;
  font-weight: 500;
  color: rgba(255,255,255,0.32);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.brand-metric__divider {
  width: 1px;
  height: 34px;
  background: rgba(255,255,255,0.09);
  margin: 0 1.25rem;
}

/* Footer del panel */
.brand-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.22);
}
.brand-footer__link {
  color: rgba(255,255,255,0.22);
  text-decoration: none;
  transition: color 0.2s ease;
}
.brand-footer__link:hover { color: rgba(255,255,255,0.5); }

/* ════════════════════════════════════════════
   PANEL DERECHO — FORMULARIO
   ════════════════════════════════════════════ */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  background: #ffffff;
  position: relative;
}

/* Mobile decoration: single subtle corner shape, no blur */
.form-panel__bg-mobile {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.mobile-orb {
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  border: 1px solid rgba(0, 41, 84, 0.06);
  top: -160px;
  right: -130px;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
}

/* Logo mobile */
.form-mobile-logo {
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  justify-content: center;
}

/* Encabezado del formulario */
.form-header { margin-bottom: 2rem; }
.form-header__eyebrow {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sol-neutral-gray);
  margin-bottom: 0.75rem;
}
.form-header__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--sol-color-success);
  margin-right: 0.5rem;
  animation: dotPulse 2.5s ease-in-out infinite;
}
@keyframes dotPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
.form-header__title {
  font-size: 1.875rem;
  font-weight: 800;
  color: var(--sol-neutral-dark);
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 0.5rem;
}
.form-header__subtitle {
  font-size: 0.875rem;
  color: var(--sol-neutral-gray);
  line-height: 1.65;
  margin: 0;
  font-weight: 400;
}

/* Alerta de error */
.form-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}
.form-alert--error {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.15);
  color: #b91c1c;
}
.form-alert__icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.85rem;
}

/* ════════════════════════════════════════
   CAMPOS DE FORMULARIO
   ════════════════════════════════════════ */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.form-field__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
  transition: color 0.2s ease;
}
.form-field--focused .form-field__label {
  color: var(--sol-color-primary);
}
.form-field__control {
  position: relative;
  display: flex;
  align-items: center;
}
.form-field__icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  color: #9ca3af;
  transition: color 0.2s ease;
  pointer-events: none;
  z-index: 2;
}
.form-field--focused .form-field__icon {
  color: var(--sol-color-secondary);
}
.form-field__input {
  width: 100%;
  height: 50px;
  padding: 0 2.75rem 0 2.75rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--sol-neutral-dark);
  outline: none;
  transition: all 0.18s ease;
  font-family: var(--sol-font-family);
}
.form-field__input::placeholder {
  color: #c4c9d4;
  font-weight: 400;
}
.form-field__input:focus {
  border-color: var(--sol-color-secondary);
  box-shadow: 0 0 0 3px rgba(0, 113, 158, 0.1);
  background: #ffffff;
}
.form-field--filled .form-field__input:not(:focus) {
  border-color: #d1d5db;
  background: #ffffff;
}
.form-field__eye {
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: color 0.2s ease;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.form-field__eye:hover { color: var(--sol-color-primary); }

.form-field__forgot {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--sol-color-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}
.form-field__forgot:hover { color: var(--sol-color-primary); }

/* Remember toggle */
.form-remember { margin-top: -0.125rem; }
.form-remember__label {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  user-select: none;
}
.form-remember__check { display: none; }
.form-remember__toggle {
  width: 38px;
  height: 22px;
  border-radius: 50px;
  background: #e5e7eb;
  position: relative;
  flex-shrink: 0;
  transition: background 0.22s ease;
}
.form-remember__toggle::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  top: 3px;
  left: 3px;
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}
.form-remember__check:checked + .form-remember__toggle { background: var(--sol-color-primary); }
.form-remember__check:checked + .form-remember__toggle::after { transform: translateX(16px); }

/* ════════════════════════════════════════
   BOTÓN DE LOGIN
   ════════════════════════════════════════ */
.login-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 10px;
  background: var(--sol-color-primary);
  color: #ffffff;
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: var(--sol-font-family);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 41, 84, 0.2), 0 4px 12px rgba(0, 41, 84, 0.12);
  position: relative;
  overflow: hidden;
  margin-top: 0.375rem;
  letter-spacing: 0.01em;
}
.login-btn:hover:not(:disabled) {
  background: #001f3f;
  box-shadow: 0 2px 8px rgba(0, 41, 84, 0.2), 0 8px 20px rgba(0, 41, 84, 0.18);
  transform: translateY(-1px);
}
.login-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 41, 84, 0.2);
}
.login-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.login-btn__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}
.login-btn__arrow { transition: transform 0.25s ease; }
.login-btn:hover .login-btn__arrow { transform: translateX(3px); }
.login-btn__spinner {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ════════════════════════════════════════
   INDICADORES DE SEGURIDAD
   ════════════════════════════════════════ */
.security-badges {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f3f4f6;
}
.security-badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.security-badge i { color: var(--sol-color-success); }

/* Volver al sitio */
.form-back { text-align: center; margin-top: 1.25rem; }
.form-back__link {
  font-size: 0.85rem;
  font-weight: 500;
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
}
.form-back__link:hover { color: var(--sol-color-primary); }

/* ════════════════════════════════════════
   RESPONSIVE
   ════════════════════════════════════════ */
@media (max-width: 991.98px) {
  .login-page { flex-direction: column; }
  .form-panel {
    padding: 2.5rem 1.5rem 3rem;
    min-height: 100vh;
  }
}
</style>
