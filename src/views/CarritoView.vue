<template>
  <div class="cart-page bg-body min-vh-100 d-flex flex-column">
    <PublicNavbar />

    <!-- Hero -->
    <section class="cart-hero pt-5 mt-5 pb-3 position-relative overflow-hidden flex-shrink-0">
      <div class="premium-liquid-bg position-absolute inset-0 z-0">
        <div class="liquid-blob blob-1"></div>
        <div class="liquid-blob blob-2"></div>
        <div class="liquid-overlay"></div>
      </div>
      <div class="container py-4 position-relative z-1">
        <nav aria-label="breadcrumb" class="mb-3">
          <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
              <router-link to="/" class="text-body-secondary text-decoration-none small opacity-60">Inicio</router-link>
            </li>
            <li class="breadcrumb-item active text-body-emphasis fw-bold small">Carrito</li>
          </ol>
        </nav>
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <h1 class="display-5 fw-900 mb-0 lh-1 text-body-emphasis">
            <i class="fa-solid fa-shopping-bag text-primary me-3" style="font-size: 1.6rem;"></i>
            Tu Carrito
          </h1>
          <span v-if="cartStore.cartQty > 0" class="badge bg-primary text-white rounded-pill px-3 py-2 fw-bold">
            {{ cartStore.cartQty }} {{ cartStore.cartQty === 1 ? 'artículo' : 'artículos' }}
          </span>
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="cart-content py-6 flex-grow-1">
      <div class="container">

        <!-- Carrito vacío -->
        <div v-if="cartStore.items.length === 0" class="text-center py-10">
          <i class="fa-solid fa-box-open display-3 text-body-secondary opacity-20 d-block mb-4"></i>
          <h4 class="fw-800 text-body-emphasis mb-2">El carrito está vacío</h4>
          <p class="text-body-secondary mb-5 mx-auto" style="max-width: 380px;">
            Explora nuestro catálogo y añade los productos que necesitas.
          </p>
          <router-link :to="{ name: 'catalogo' }" class="btn btn-brand rounded-pill px-5 py-3 text-decoration-none fw-bold shadow">
            <i class="fa-solid fa-store me-2"></i>Explorar Catálogo
          </router-link>
        </div>

        <div v-else class="row g-5">
          <!-- Lista de productos -->
          <div class="col-lg-7">
            <div class="cart-card">
              <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h5 class="fw-800 text-body-emphasis mb-0">Productos</h5>
                <button
                  class="btn btn-link text-danger text-decoration-none small fw-semibold p-0"
                  @click="handleClearCart"
                >
                  <i class="fa-solid fa-trash-can me-1"></i>Vaciar carrito
                </button>
              </div>

              <div class="d-flex flex-column gap-3">
                <div
                  v-for="item in cartStore.items"
                  :key="item.id"
                  class="cart-item d-flex align-items-center gap-3 p-3 rounded-4 border bg-body"
                >
                  <!-- Imagen -->
                  <div class="cart-item-img-wrap flex-shrink-0">
                    <img
                      :src="item.image || fallbackImg"
                      :alt="item.name"
                      class="img-fluid cart-item-img"
                      @error="e => e.target.src = fallbackImg"
                    >
                  </div>

                  <!-- Info -->
                  <div class="flex-grow-1 min-w-0">
                    <h6 class="fw-800 text-body-emphasis mb-1 text-truncate">{{ item.name }}</h6>
                    <span class="badge bg-light border text-muted text-uppercase smaller">{{ item.sku }}</span>
                  </div>

                  <!-- Cantidad -->
                  <div class="qty-control d-flex align-items-center gap-1 flex-shrink-0">
                    <button
                      class="btn-qty"
                      @click="cartStore.changeQty(item.id, -1)"
                      :disabled="item.qty <= 1"
                      aria-label="Reducir"
                    >
                      <i class="fa-solid fa-minus" style="font-size: 0.65rem;"></i>
                    </button>
                    <span class="fw-bold px-2 text-body-emphasis" style="min-width: 28px; text-align: center;">{{ item.qty }}</span>
                    <button class="btn-qty" @click="cartStore.addToCart({ id: item.id }, 1)" aria-label="Aumentar">
                      <i class="fa-solid fa-plus" style="font-size: 0.65rem;"></i>
                    </button>
                  </div>

                  <!-- Precio -->
                  <div class="text-end flex-shrink-0" style="min-width: 95px;">
                    <div class="fw-900 text-body-emphasis">Bs. {{ (item.price * item.qty).toFixed(2) }}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">Bs. {{ item.price.toFixed(2) }}/u</div>
                  </div>

                  <!-- Eliminar -->
                  <button
                    class="btn btn-link text-danger border-0 p-1 flex-shrink-0"
                    @click="cartStore.removeFromCart(item.id)"
                    aria-label="Eliminar"
                  >
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>

              <!-- Continuar comprando -->
              <div class="pt-4 mt-2 border-top">
                <router-link :to="{ name: 'catalogo' }" class="btn btn-light rounded-pill px-4 small fw-semibold text-decoration-none">
                  <i class="fa-solid fa-arrow-left me-2"></i>Seguir comprando
                </router-link>
              </div>
            </div>
          </div>

          <!-- Resumen + CTA checkout -->
          <div class="col-lg-5">
            <div class="cart-card sticky-top" style="top: 100px;">
              <h5 class="fw-800 text-body-emphasis mb-4 pb-3 border-bottom">Resumen del pedido</h5>

              <div class="d-flex justify-content-between mb-2 text-body-secondary">
                <span>Subtotal ({{ cartStore.cartQty }} artículos)</span>
                <span class="fw-bold text-body-emphasis">Bs. {{ cartStore.cartSubtotal.toFixed(2) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-3 text-body-secondary">
                <span>Transporte estimado</span>
                <span class="fw-bold text-body-emphasis">Bs. {{ cartStore.cartShipping.toFixed(2) }}</span>
              </div>

              <div class="d-flex justify-content-between align-items-center border-top pt-3 mb-5">
                <span class="fw-800 text-body-emphasis fs-5">Total estimado</span>
                <span class="fw-900 text-primary fs-3">Bs. {{ cartStore.cartTotal.toFixed(2) }}</span>
              </div>

              <!-- CTA Checkout -->
              <router-link
                :to="{ name: 'checkout' }"
                class="btn btn-brand w-100 py-3 rounded-pill fw-bold shadow-brand text-decoration-none d-flex align-items-center justify-content-center gap-2 mb-3"
              >
                <i class="fa-solid fa-credit-card"></i>
                Proceder al Pago
                <i class="fa-solid fa-arrow-right"></i>
              </router-link>

              <!-- Seguridad -->
              <div class="d-flex align-items-center justify-content-center gap-4 pt-2 opacity-50">
                <span class="smaller d-flex align-items-center gap-1">
                  <i class="fa-solid fa-lock"></i> Pago seguro
                </span>
                <span class="smaller d-flex align-items-center gap-1">
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
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useCartStore } from '../stores/cart';
import PublicNavbar from '../components/PublicNavbar.vue';
import PublicFooter from '../components/PublicFooter.vue';

const cartStore = useCartStore();
const router = useRouter();

const fallbackImg = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=400&auto=format&fit=crop';

const handleClearCart = () => {
  Swal.fire({
    title: '¿Vaciar carrito?',
    text: 'Se eliminarán todos los productos.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sí, vaciar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) cartStore.clearCart();
  });
};
</script>

<style scoped>
.fw-900 { font-weight: 900; }
.fw-800 { font-weight: 800; }
.py-6  { padding-top: 3.5rem; padding-bottom: 3.5rem; }
.py-10 { padding-top: 7rem; padding-bottom: 7rem; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }

/* Hero liquid */
.premium-liquid-bg { pointer-events: none; overflow: hidden; }
.liquid-blob {
  position: absolute;
  filter: blur(140px);
  border-radius: 50%;
  opacity: 0.6;
}
.blob-1 {
  width: 500px; height: 500px;
  background: var(--color-primary-soft, rgba(37,99,235,0.1));
  top: -20%; left: -10%;
}
.blob-2 {
  width: 400px; height: 400px;
  background: rgba(14,165,233,0.08);
  bottom: -20%; right: -5%;
}
.liquid-overlay {
  position: absolute; inset: 0;
  background: radial-gradient(circle at center, transparent, var(--bs-body-bg) 85%);
}

/* Cart card */
.cart-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid rgba(0,0,0,0.06);
  padding: 1.75rem;
  box-shadow: 0 2px 20px rgba(0,0,0,0.04);
}

/* Cart item */
.cart-item {
  transition: all 0.2s ease;
}
.cart-item:hover {
  background: var(--bs-body-bg) !important;
  border-color: rgba(var(--bs-primary-rgb), 0.15) !important;
}

.cart-item-img-wrap {
  width: 64px;
  height: 64px;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}
.cart-item-img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

/* Qty control */
.qty-control {
  background: #f1f5f9;
  border-radius: 50px;
  padding: 0.25rem 0.4rem;
}
.btn-qty {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: all 0.15s ease;
}
.btn-qty:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
}
.btn-qty:disabled {
  opacity: 0.35;
  cursor: default;
}

.shadow-brand {
  box-shadow: 0 10px 30px rgba(var(--bs-primary-rgb), 0.3);
}

@media (max-width: 575px) {
  .cart-item { flex-wrap: wrap; }
  .cart-item-img-wrap { width: 56px; height: 56px; }
}
</style>
