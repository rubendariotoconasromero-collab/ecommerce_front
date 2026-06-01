<template>
  <div class="cart-page bg-body min-vh-100 d-flex flex-column">
    <PublicNavbar />

    <!-- Header -->
    <section class="pt-5 mt-5 pb-4 position-relative overflow-hidden bg-white border-bottom">
      <div class="container py-4 position-relative z-1">
        <nav aria-label="breadcrumb" class="mb-3">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/" class="text-body-secondary opacity-60 hover-opacity-100 transition-all text-decoration-none small">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active text-dark fw-bold small" aria-current="page">Carrito</li>
          </ol>
        </nav>
        <div class="d-flex align-items-center gap-3 flex-wrap mb-2">
          <h1 class="display-4 fw-900 mb-0 lh-1 text-dark" style="letter-spacing: -0.04em;">Tu Carrito</h1>
          <span v-if="cartStore.cartQty > 0"
                class="badge border text-dark px-3 py-2 fw-800 smaller text-uppercase"
                style="background:rgba(18,18,18,.06);border-color:rgba(18,18,18,.15)!important;letter-spacing:.06em;">
            {{ cartStore.cartQty }} {{ cartStore.cartQty === 1 ? 'artículo' : 'artículos' }}
          </span>
        </div>
        <p class="lead text-muted mb-0" style="font-size:1rem;">
          {{ cartStore.cartQty > 0 ? 'Revisa tu selección y procede al pago cuando estés listo.' : 'Aún no tienes productos en tu carrito.' }}
        </p>
      </div>
    </section>

    <!-- Content -->
    <section class="py-5 flex-grow-1">
      <div class="container">

        <!-- Carrito vacío -->
        <div v-if="cartStore.items.length === 0" class="text-center py-5">
          <i class="fa-solid fa-box-open display-4 text-muted opacity-30 d-block mb-4"></i>
          <h4 class="fw-bold text-dark mb-2">El carrito está vacío</h4>
          <p class="text-muted mb-4 mx-auto" style="max-width: 380px;">
            Explora nuestro catálogo y añade los productos que necesitas.
          </p>
          <router-link :to="{ name: 'catalogo' }" class="btn btn-brand rounded-0 px-5 py-3 text-decoration-none fw-bold">
            <i class="fa-solid fa-store me-2"></i>Explorar Catálogo
          </router-link>
        </div>

        <div v-else class="row g-5">
          <!-- Lista de productos -->
          <div class="col-lg-7">
            <div class="cart-card p-4">
              <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-light-subtle">
                <h5 class="fw-bold text-dark mb-0">Productos</h5>
                <button
                  class="btn btn-link text-danger text-decoration-none small fw-bold p-0"
                  @click="handleClearCart"
                >
                  <i class="fa-solid fa-trash-can me-1"></i>Vaciar carrito
                </button>
              </div>

              <div class="d-flex flex-column gap-3">
                <div
                  v-for="item in cartStore.items"
                  :key="item.id"
                  class="cart-item d-flex align-items-center gap-3 p-3 bg-white border border-light-subtle rounded-0"
                >
                  <!-- Imagen -->
                  <div class="cart-item-img-wrap flex-shrink-0">
                    <img
                      v-if="item.image && !brokenImages[item.id]"
                      :src="item.image"
                      :alt="item.name"
                      class="img-fluid cart-item-img"
                      @error="brokenImages[item.id] = true"
                    >
                    <i v-else class="fa-solid fa-cube text-muted" style="font-size:1.4rem;opacity:.3;"></i>
                  </div>

                  <!-- Info -->
                  <div class="flex-grow-1 min-w-0">
                    <h6 class="fw-bold text-dark mb-1 text-truncate" style="font-size: 0.95rem;">{{ item.name }}</h6>
                    <span class="badge border text-muted text-uppercase smaller rounded-0 px-2 py-1 bg-light">{{ item.sku }}</span>
                  </div>

                  <!-- Cantidad -->
                  <div class="qty-control d-flex align-items-center flex-shrink-0">
                    <button
                      class="btn-qty"
                      @click="cartStore.changeQty(item.id, -1)"
                      :disabled="item.qty <= 1"
                      aria-label="Reducir"
                    >
                      <i class="fa-solid fa-minus" style="font-size: 0.65rem;"></i>
                    </button>
                    <span class="qty-display" style="min-width: 32px; text-align: center;">{{ item.qty }}</span>
                    <button class="btn-qty" @click="cartStore.addToCart({ id: item.id }, 1)" aria-label="Aumentar">
                      <i class="fa-solid fa-plus" style="font-size: 0.65rem;"></i>
                    </button>
                  </div>

                  <!-- Precio -->
                  <div class="text-end flex-shrink-0" style="min-width: 95px;">
                    <div class="fw-bold text-dark">Bs. {{ (item.price * item.qty).toFixed(2) }}</div>
                    <div class="text-muted smaller">Bs. {{ item.price.toFixed(2) }}/u</div>
                  </div>

                  <!-- Eliminar -->
                  <button
                    class="btn btn-link text-muted border-0 p-1 flex-shrink-0 hover-dark-text"
                    @click="cartStore.removeFromCart(item.id)"
                    aria-label="Eliminar"
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>

              <!-- Continuar comprando -->
              <div class="pt-4 mt-3 border-top border-light-subtle">
                <router-link :to="{ name: 'catalogo' }" class="btn btn-outline-dark rounded-0 px-4 py-2 small fw-semibold text-decoration-none">
                  <i class="fa-solid fa-arrow-left me-2"></i>Seguir comprando
                </router-link>
              </div>
            </div>
          </div>

          <!-- Resumen + CTA checkout -->
          <div class="col-lg-5">
            <div class="cart-card p-4 sticky-top" style="top: 100px;">
              <h5 class="fw-bold text-dark mb-4 pb-3 border-bottom border-light-subtle">Resumen del pedido</h5>

              <div class="d-flex justify-content-between mb-2 text-muted small">
                <span>Subtotal ({{ cartStore.cartQty }} artículos)</span>
                <span class="fw-bold text-dark">Bs. {{ cartStore.cartSubtotal.toFixed(2) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-3 text-muted small">
                <span>Transporte estimado</span>
                <span class="fw-bold text-dark">Bs. {{ cartStore.cartShipping.toFixed(2) }}</span>
              </div>

              <div class="d-flex justify-content-between align-items-center border-top border-light-subtle pt-3 mb-4">
                <span class="fw-bold text-dark fs-6 text-uppercase">Total estimado</span>
                <span class="fw-bold text-dark fs-3">Bs. {{ cartStore.cartTotal.toFixed(2) }}</span>
              </div>

              <!-- CTA Checkout -->
              <router-link
                :to="{ name: 'checkout' }"
                class="btn btn-brand w-100 py-3 rounded-0 fw-bold text-decoration-none d-flex align-items-center justify-content-center gap-2 mb-3 text-uppercase"
                style="letter-spacing: 0.05em;"
              >
                <i class="fa-solid fa-credit-card"></i>
                Proceder al Pago
                <i class="fa-solid fa-arrow-right"></i>
              </router-link>

              <!-- Seguridad -->
              <div class="d-flex align-items-center justify-content-center gap-4 pt-2 opacity-60 border-top border-light-subtle pt-3">
                <span class="smaller d-flex align-items-center gap-1 text-muted">
                  <i class="fa-solid fa-lock"></i> Pago seguro
                </span>
                <span class="smaller d-flex align-items-center gap-1 text-muted">
                  <i class="fa-solid fa-shield-halved"></i> Datos protegidos
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <PublicFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useCartStore } from '../stores/cart';
import PublicNavbar from '../components/PublicNavbar.vue';
import PublicFooter from '../components/PublicFooter.vue';

const cartStore = useCartStore();
const router = useRouter();

const brokenImages = ref({});

const handleClearCart = () => {
  Swal.fire({
    title: '¿Vaciar carrito?',
    text: 'Se eliminarán todos los productos.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#121212',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sí, vaciar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) cartStore.clearCart();
  });
};
</script>

<style scoped>
.fw-800 { font-weight: 800; }
.smaller { font-size: 0.75rem; }

/* ── Navbar overrides — igual que CatalogView / ProductDetailView ── */
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
:deep(.nav-link.active) { opacity: 1; }
:deep(.nav-link::after) { display: none !important; }
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

/* Cart card */
.cart-card {
  background: white;
  border-radius: 0px !important;
  border: 1px solid #e8e8e1;
  box-shadow: none !important;
}

/* Cart item */
.cart-item {
  border-color: #e8e8e1 !important;
  transition: all 0.2s ease;
}
.cart-item:hover {
  background: #fafafa !important;
}

.cart-item-img-wrap {
  width: 64px;
  height: 64px;
  border-radius: 0px !important;
  overflow: hidden;
  background: #f5f5f5;
  border: 1px solid #e8e8e1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cart-item-img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

/* Qty control */
.qty-control {
  border: 1px solid #121212;
  border-radius: 0px !important;
  padding: 0;
  display: inline-flex;
  background: white;
}
.btn-qty {
  width: 32px;
  height: 32px;
  border-radius: 0px !important;
  border: none;
  background: transparent;
  color: #121212;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn-qty:hover:not(:disabled) {
  background: #121212;
  color: white;
}
.btn-qty:disabled {
  opacity: 0.3;
  cursor: default;
}
.qty-display {
  font-weight: 700;
  color: #121212;
  font-size: 0.9rem;
  padding: 0 4px;
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

.hover-dark-text {
  color: #888888 !important;
  transition: color 0.2s ease;
}
.hover-dark-text:hover {
  color: #121212 !important;
}

@media (max-width: 575px) {
  .cart-item { flex-wrap: wrap; }
  .cart-item-img-wrap { width: 56px; height: 56px; }
}
</style>
