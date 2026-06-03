<template>
  <div class="checkout-page bg-white min-vh-100 d-flex flex-column">
    <PublicNavbar />

    <!-- Hero Section Reducida Style (idéntico a CatalogView) -->
    <section class="checkout-hero pt-5 mt-5 pb-4 position-relative overflow-hidden bg-white border-bottom flex-shrink-0">
      <div class="container py-4 position-relative z-1">
        <div class="row align-items-center gy-4">
          <div class="col-lg-12">
            <nav aria-label="breadcrumb" class="mb-3">
              <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item">
                  <router-link to="/" class="text-body-secondary text-decoration-none small opacity-60">Inicio</router-link>
                </li>
                <li class="breadcrumb-item">
                  <router-link :to="{ name: 'carrito' }" class="text-body-secondary text-decoration-none small opacity-60">Carrito</router-link>
                </li>
                <li class="breadcrumb-item active text-dark fw-bold small">Checkout</li>
              </ol>
            </nav>
            <h1 class="display-4 fw-900 mb-3 lh-1 text-dark" style="letter-spacing: -0.04em;">Confirmar Pedido</h1>
            <p class="lead text-muted mb-0 max-w-600">Revisa tu pedido y completa los datos de despacho para procesar tu solicitud.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Redirect si carrito vacío -->
    <div v-if="cartStore.items.length === 0 && !orderSuccess" class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="text-center py-5">
        <i class="fa-solid fa-cart-shopping display-4 text-muted opacity-30 d-block mb-4"></i>
        <h4 class="fw-bold text-dark mb-2">Tu carrito está vacío</h4>
        <p class="text-muted mb-4">Agrega productos antes de continuar con el pago.</p>
        <router-link :to="{ name: 'catalogo' }" class="btn btn-brand rounded-0 px-5 py-3 text-decoration-none fw-bold text-uppercase">
          <i class="fa-solid fa-store me-2"></i>Ir al Catálogo
        </router-link>
      </div>
    </div>

    <!-- Contenido checkout -->
    <section v-else-if="!orderSuccess" class="py-5 flex-grow-1">
      <div class="container">
        <div class="row g-5">

          <!-- Formulario de datos -->
          <div class="col-lg-7 order-2 order-lg-1">
            <form @submit.prevent="submitOrder" novalidate>

              <!-- Datos del cliente -->
              <div class="checkout-section mb-4">
                <div class="checkout-section-header">
                  <span class="checkout-step-num">1</span>
                  <h5 class="fw-bold mb-0 text-dark">Información del Cliente</h5>
                  <button
                    type="button"
                    class="lookup-link ms-auto"
                    @click="openLookupModal"
                  >
                    <i class="fa-solid fa-magnifying-glass me-1"></i>¿Ya eres cliente?
                  </button>
                </div>
                <div class="checkout-section-body">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label fw-bold smaller text-uppercase opacity-70">Nombre / Razón Social *</label>
                      <input
                        v-model="form.name"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.name }"
                        placeholder="Ej: Empresa Boliviana S.A."
                        required
                      >
                      <div class="invalid-feedback">{{ errors.name }}</div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-bold smaller text-uppercase opacity-70">NIT / CI *</label>
                      <input
                        v-model="form.tax_id"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.tax_id }"
                        placeholder="NIT de facturación"
                        required
                      >
                      <div class="invalid-feedback">{{ errors.tax_id }}</div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-bold smaller text-uppercase opacity-70">Teléfono *</label>
                      <input
                        v-model="form.phone"
                        type="tel"
                        class="form-control"
                        :class="{ 'is-invalid': errors.phone }"
                        placeholder="70000000"
                        required
                      >
                      <div class="invalid-feedback">{{ errors.phone }}</div>
                    </div>
                    <div class="col-12">
                      <label class="form-label fw-bold smaller text-uppercase opacity-70">Correo Electrónico</label>
                      <input
                        v-model="form.email"
                        type="email"
                        class="form-control"
                        placeholder="contacto@empresa.com (opcional)"
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dirección de despacho -->
              <div class="checkout-section mb-4">
                <div class="checkout-section-header">
                  <span class="checkout-step-num">2</span>
                  <h5 class="fw-bold mb-0 text-dark">Dirección de Despacho</h5>
                </div>
                <div class="checkout-section-body">
                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label fw-bold smaller text-uppercase opacity-70">Dirección completa *</label>
                      <input
                        v-model="form.address"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.address }"
                        placeholder="Calle, Nro, Barrio o Zona"
                        required
                      >
                      <div class="invalid-feedback">{{ errors.address }}</div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-bold smaller text-uppercase opacity-70">Ciudad *</label>
                      <input
                        v-model="form.city"
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.city }"
                        placeholder="Ej: Santa Cruz"
                        required
                      >
                      <div class="invalid-feedback">{{ errors.city }}</div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-bold smaller text-uppercase opacity-70">Referencia</label>
                      <input
                        v-model="form.reference"
                        type="text"
                        class="form-control"
                        placeholder="Referencia de ubicación"
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Notas -->
              <div class="checkout-section mb-5">
                <div class="checkout-section-header">
                  <span class="checkout-step-num">3</span>
                  <h5 class="fw-bold mb-0 text-dark">Notas Adicionales</h5>
                </div>
                <div class="checkout-section-body">
                  <textarea
                    v-model="form.notes"
                    class="form-control text-area-custom"
                    rows="3"
                    placeholder="Instrucciones especiales de entrega, horarios preferidos, etc."
                  ></textarea>
                </div>
              </div>

              <!-- Error del servidor -->
              <div v-if="serverError" class="alert alert-danger rounded-0 py-2 px-3 small mb-3">
                <i class="fa-solid fa-circle-exclamation me-2"></i>{{ serverError }}
              </div>

              <!-- Submit -->
              <button
                type="submit"
                class="btn btn-brand w-100 py-3 rounded-0 fw-bold fs-5 text-uppercase"
                style="letter-spacing: 0.05em;"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">
                  <span class="spinner-border spinner-border-sm me-2"></span>Procesando...
                </span>
                <span v-else>
                  <i class="fa-solid fa-circle-check me-2"></i>Confirmar Pedido — Bs. {{ cartStore.cartTotal.toFixed(2) }}
                </span>
              </button>

              <p class="text-center text-muted smaller mt-3 opacity-70">
                <i class="fa-solid fa-lock me-1"></i> Tus datos están protegidos y seguros.
              </p>
            </form>
          </div>

          <!-- Resumen del pedido -->
          <div class="col-lg-5 order-1 order-lg-2">
            <div class="order-summary-card sticky-top" style="top: 100px;">
              <h5 class="fw-bold text-dark mb-4 pb-3 border-bottom border-light-subtle text-uppercase" style="font-size: 0.95rem; letter-spacing: 0.05em;">Resumen del Pedido</h5>

              <!-- Productos -->
              <div class="d-flex flex-column gap-3 mb-4">
                <div v-for="item in cartStore.items" :key="item.id" class="d-flex align-items-center gap-3">
                  <div class="order-item-img-wrap flex-shrink-0">
                    <img
                      :src="item.image || fallbackImg"
                      :alt="item.name"
                      @error="e => e.target.src = fallbackImg"
                    >
                    <span class="order-item-qty">{{ item.qty }}</span>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <div class="fw-bold text-dark smaller text-truncate">{{ item.name }}</div>
                    <div class="text-muted smaller">{{ item.sku }}</div>
                  </div>
                  <div class="fw-bold text-dark flex-shrink-0 small">
                    Bs. {{ (item.price * item.qty).toFixed(2) }}
                  </div>
                </div>
              </div>

              <!-- Totales -->
              <div class="border-top border-light-subtle pt-3">
                <div class="d-flex justify-content-between mb-2 text-muted small">
                  <span>Subtotal</span>
                  <span class="fw-bold text-dark">Bs. {{ cartStore.cartSubtotal.toFixed(2) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-3 text-muted small">
                  <span>Transporte</span>
                  <span class="fw-bold text-dark">Bs. {{ cartStore.cartShipping.toFixed(2) }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center border-top border-light-subtle pt-3">
                  <span class="fw-bold text-dark text-uppercase small">Total</span>
                  <span class="fw-bold text-dark fs-4">Bs. {{ cartStore.cartTotal.toFixed(2) }}</span>
                </div>
              </div>

              <!-- Garantías -->
              <div class="mt-4 pt-3 border-top border-light-subtle">
                <div class="d-flex flex-column gap-2">
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <i class="fa-solid fa-shield-halved text-dark"></i>
                    <span>Compra 100% segura</span>
                  </div>
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <i class="fa-solid fa-truck text-dark"></i>
                    <span>Entrega coordinada por nuestro equipo</span>
                  </div>
                  <div class="d-flex align-items-center gap-2 text-muted small">
                    <i class="fa-solid fa-headset text-dark"></i>
                    <span>Soporte postventa disponible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Pantalla de éxito -->
    <!-- Pantalla de éxito -->
    <div v-if="orderSuccess" class="flex-grow-1 d-flex align-items-center py-5">
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-lg-6 col-md-8">
            <div class="card border border-light-subtle rounded-0 p-5 text-center shadow-sm bg-white animate__animated animate__fadeIn">
              <div class="success-checkmark mx-auto">
                <i class="fa-solid fa-circle-check"></i>
              </div>
              <h2 class="fw-bold text-dark mb-3 text-uppercase" style="letter-spacing: 0.05em; font-size: 1.75rem;">¡Pedido Confirmado!</h2>
              <p class="lead text-muted mb-4 mx-auto" style="max-width: 440px; font-size: 1.05rem; line-height: 1.6;">
                Hemos recibido tu solicitud de cotización correctamente. Nuestro equipo comercial te contactará a la brevedad para coordinar los detalles y tiempos de entrega.
              </p>
              <div class="p-3 bg-light border border-light-subtle mb-4 text-start">
                <div class="d-flex justify-content-between mb-2 small text-muted">
                  <span>Número de referencia:</span>
                  <span class="fw-bold text-dark font-monospace">#{{ orderRef }}</span>
                </div>
                <div v-if="orderDate" class="d-flex justify-content-between small text-muted">
                  <span>Entrega estimada:</span>
                  <span class="fw-bold text-dark">{{ orderDate }}</span>
                </div>
              </div>
              <div class="d-flex gap-3 justify-content-center flex-wrap">
                <router-link :to="{ name: 'home' }" class="btn btn-brand rounded-0 px-4 py-3 text-decoration-none fw-bold text-uppercase flex-grow-1 flex-sm-grow-0">
                  <i class="fa-solid fa-house me-2"></i>Ir al Inicio
                </router-link>
                <router-link :to="{ name: 'catalogo' }" class="btn btn-outline-dark rounded-0 px-4 py-3 text-decoration-none fw-bold text-uppercase flex-grow-1 flex-sm-grow-0">
                  Seguir Comprando
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PublicFooter />

    <!-- Modal: Buscar cliente por NIT/CI -->
    <BaseModal v-model="showLookupModal" title="Buscar cliente registrado" size="sm">
      <template #icon><i class="fa-solid fa-user-magnifying-glass"></i></template>

      <p class="text-muted small mb-3">
        Ingresa tu NIT o CI para cargar automáticamente tus datos en el formulario.
      </p>

      <div class="d-flex gap-2 mb-3">
        <input
          v-model="lookupTaxId"
          type="text"
          class="form-control"
          placeholder="Ej: 12345678"
          @keyup.enter="searchCustomer"
          :disabled="isSearching"
        >
        <button
          type="button"
          class="btn btn-brand px-3 flex-shrink-0"
          @click="searchCustomer"
          :disabled="isSearching || !lookupTaxId.trim()"
        >
          <span v-if="isSearching"><span class="spinner-border spinner-border-sm"></span></span>
          <span v-else><i class="fa-solid fa-magnifying-glass"></i></span>
        </button>
      </div>

      <!-- Resultado encontrado -->
      <div v-if="lookupResult" class="lookup-result-card mb-1">
        <div class="d-flex align-items-center gap-2 mb-2">
          <i class="fa-solid fa-circle-check text-success"></i>
          <span class="fw-bold text-dark small">Cliente encontrado</span>
        </div>
        <div class="small text-muted d-flex flex-column gap-1">
          <span><span class="fw-bold text-dark">Nombre:</span> {{ lookupResult.name }}</span>
          <span><span class="fw-bold text-dark">NIT/CI:</span> {{ lookupResult.tax_id }}</span>
          <span v-if="lookupResult.phone"><span class="fw-bold text-dark">Teléfono:</span> {{ lookupResult.phone }}</span>
          <span v-if="lookupResult.email"><span class="fw-bold text-dark">Correo:</span> {{ lookupResult.email }}</span>
        </div>
      </div>

      <!-- No encontrado -->
      <div v-if="lookupNotFound" class="alert alert-warning rounded-0 py-2 px-3 small mb-1">
        <i class="fa-solid fa-triangle-exclamation me-2"></i>
        No se encontró ningún cliente con ese NIT/CI.
      </div>

      <template #footer>
        <button type="button" class="btn btn-outline-dark rounded-0 px-4 py-2 small fw-bold" @click="showLookupModal = false">
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-brand rounded-0 px-4 py-2 small fw-bold"
          :disabled="!lookupResult"
          @click="applyLookupResult"
        >
          <i class="fa-solid fa-file-import me-2"></i>Cargar datos
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useCartStore } from '../stores/cart';
import api from '../plugins/axios';
import PublicNavbar from '../components/PublicNavbar.vue';
import PublicFooter from '../components/PublicFooter.vue';
import BaseModal from '../components/base/BaseModal.vue';

const cartStore = useCartStore();

// --- Lookup modal ---
const showLookupModal = ref(false);
const lookupTaxId    = ref('');
const isSearching    = ref(false);
const lookupResult   = ref(null);
const lookupNotFound = ref(false);

const openLookupModal = () => {
  lookupTaxId.value    = '';
  lookupResult.value   = null;
  lookupNotFound.value = false;
  showLookupModal.value = true;
};

const searchCustomer = async () => {
  if (!lookupTaxId.value.trim()) return;
  isSearching.value    = true;
  lookupResult.value   = null;
  lookupNotFound.value = false;
  try {
    const { data } = await api.get('/public/customers/lookup', {
      params: { tax_id: lookupTaxId.value.trim() },
    });
    lookupResult.value = data;
  } catch (e) {
    if (e.response?.status === 404) lookupNotFound.value = true;
  } finally {
    isSearching.value = false;
  }
};

const applyLookupResult = () => {
  if (!lookupResult.value) return;
  form.name   = lookupResult.value.name   || form.name;
  form.tax_id = lookupResult.value.tax_id || form.tax_id;
  form.phone  = lookupResult.value.phone  || form.phone;
  form.email  = lookupResult.value.email  || form.email;
  showLookupModal.value = false;
};

const isSubmitting = ref(false);
const orderSuccess = ref(false);
const orderRef     = ref('');
const orderDate    = ref('');
const serverError  = ref('');

const fallbackImg = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=400&auto=format&fit=crop';

const form = reactive({
  name: '', tax_id: '', phone: '', email: '',
  address: '', city: '', reference: '', notes: ''
});

const errors = reactive({
  name: '', tax_id: '', phone: '', address: '', city: ''
});

const validate = () => {
  let valid = true;
  errors.name = errors.tax_id = errors.phone = errors.address = errors.city = '';
  if (!form.name.trim())    { errors.name    = 'El nombre es requerido.';    valid = false; }
  if (!form.tax_id.trim())  { errors.tax_id  = 'El NIT/CI es requerido.';   valid = false; }
  if (!form.phone.trim())   { errors.phone   = 'El teléfono es requerido.';  valid = false; }
  if (!form.address.trim()) { errors.address = 'La dirección es requerida.'; valid = false; }
  if (!form.city.trim())    { errors.city    = 'La ciudad es requerida.';    valid = false; }
  return valid;
};

const submitOrder = async () => {
  if (!validate()) return;
  serverError.value  = '';
  isSubmitting.value = true;

  try {
    const { data } = await api.post('/public/orders', {
      name:      form.name.trim(),
      tax_id:    form.tax_id.trim(),
      phone:     form.phone.trim(),
      email:     form.email.trim() || undefined,
      address:   form.address.trim(),
      city:      form.city.trim(),
      reference: form.reference.trim() || undefined,
      notes:     form.notes.trim() || undefined,
      items:     cartStore.items.map(i => ({
        product_id: i.id,
        quantity:   i.qty,
      })),
    });

    orderRef.value  = data.reference;
    orderDate.value = data.delivery_date
      ? new Date(data.delivery_date).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })
      : '';

    cartStore.clearCart();
    orderSuccess.value = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    serverError.value =
      e.response?.data?.message ||
      e.response?.data?.errors?.items?.[0] ||
      'Ocurrió un error al procesar el pedido. Por favor, inténtalo nuevamente.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.fw-800 { font-weight: 800; }
.smaller { font-size: 0.75rem; }

/* Checkout sections */
.checkout-section {
  border: 1px solid #e8e8e1;
  border-radius: 0px !important;
  overflow: hidden;
}

.checkout-section-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.25rem 1.5rem;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e1;
}

.checkout-step-num {
  width: 24px;
  height: 24px;
  border-radius: 0px !important;
  background: #121212;
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkout-section-body {
  padding: 1.5rem;
  background: white;
}

/* Order summary card */
.order-summary-card {
  background: #fafafa !important;
  border: 1px solid #e8e8e1;
  border-radius: 0px !important;
  padding: 1.75rem;
  box-shadow: none !important;
}

/* Order item img */
.order-item-img-wrap {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 0px !important;
  overflow: visible;
  background: white;
  border: 1px solid #e8e8e1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.order-item-img-wrap img {
  width: 85%;
  height: 85%;
  object-fit: contain;
}
.order-item-qty {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #121212;
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
}

/* Success animation */
.success-checkmark {
  font-size: 5rem;
  color: #10b981;
  margin-bottom: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  animation: scale-up 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes scale-up {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Form inputs styling */
.form-control {
  border-radius: 0px !important;
  border: 1px solid #e8e8e1;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  box-shadow: none !important;
}
.form-control:focus {
  border-color: #121212 !important;
  background-color: white;
}

.text-area-custom {
  resize: vertical;
}

/* Shopify Buttons overrides */
.btn-brand {
  background-color: #121212 !important;
  border-color: #121212 !important;
  color: white !important;
  border-radius: 0px !important;
  transition: all 0.25s ease;
  box-shadow: none !important;
}
.btn-brand:hover {
  background-color: #333333 !important;
  border-color: #333333 !important;
}

.btn-outline-dark {
  border-color: #121212 !important;
  color: #121212 !important;
  border-radius: 0px !important;
  background-color: transparent !important;
  transition: all 0.25s ease;
}
.btn-outline-dark:hover {
  background-color: #121212 !important;
  color: white !important;
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
}

:deep(.cart-badge-pill) {
  border-radius: 0px !important;
  background-color: #121212 !important;
  color: #ffffff !important;
  font-weight: 800;
}

/* Hero section style */
.checkout-hero {
  padding-top: 6rem;
  background: var(--bs-body-bg);
}

/* Lookup link */
.lookup-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.78rem;
  font-weight: 700;
  color: #121212;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: #a0a0a0;
  cursor: pointer;
  opacity: 0.65;
  transition: opacity 0.2s ease;
  letter-spacing: 0.02em;
}
.lookup-link:hover {
  opacity: 1;
  text-decoration-color: #121212;
}

/* Lookup result card */
.lookup-result-card {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 0.875rem 1rem;
}
</style>
