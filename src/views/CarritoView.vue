<template>
  <div class="cart-page bg-body min-vh-100 d-flex flex-column">
    <!-- Public Navbar Reutilizable -->
    <PublicNavbar />

    <!-- Hero Section Reducido con Efecto Líquido -->
    <section class="cart-hero pt-5 mt-5 pb-4 position-relative overflow-hidden flex-shrink-0">
      <!-- Fondo Líquido Premium -->
      <div class="premium-liquid-bg position-absolute inset-0 z-0">
        <div class="liquid-blob blob-1"></div>
        <div class="liquid-blob blob-2"></div>
        <div class="liquid-overlay"></div>
      </div>
      
      <div class="container py-5 position-relative z-1">
        <div class="row align-items-center">
          <div class="col-12">
            <BaseBadge variant="primary" soft class="mb-3 px-3 py-2 rounded-pill fw-bold">
              <i class="fa-solid fa-cart-shopping me-1"></i> Adquisición de Suministros
            </BaseBadge>
            <h1 class="display-4 fw-900 mb-2 lh-1 text-body-emphasis">Tu Carrito de Cotización</h1>
            <p class="lead text-body-secondary mb-0 max-w-600">Revisa tu lista de insumos de polímeros y confirma el flete industrial para tu planta.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="cart-content py-5 flex-grow-1">
      <div class="container">
        <div class="row g-5">
          <!-- Detalle de Productos -->
          <div class="col-lg-7">
            <div class="card border-0 rounded-5 shadow-soft p-4 p-sm-5 bg-card">
              <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <h4 class="fw-800 text-body-emphasis mb-0">Detalle de Insumos</h4>
                <span class="badge bg-primary-soft text-primary px-3 py-2 rounded-pill fw-bold" v-if="cartStore.items.length > 0">
                  {{ cartStore.cartQty }} artículos
                </span>
              </div>

              <!-- Carrito Vacío -->
              <div v-if="cartStore.items.length === 0" class="text-center py-10">
                <div class="mb-4">
                  <i class="fa-solid fa-box-open text-body-secondary opacity-30 display-3"></i>
                </div>
                <h5 class="fw-800 text-body-emphasis">El carrito está vacío</h5>
                <p class="text-body-secondary smaller max-w-400 mx-auto">Explora nuestra gama técnica de bidones, tambores e inyecciones de polietileno de alta densidad.</p>
                <router-link :to="{ name: 'catalogo' }" class="btn btn-brand rounded-pill px-5 py-3 mt-4 text-decoration-none shadow-brand-sm">
                  <i class="fa-solid fa-industry me-2"></i>Ver Catálogo
                </router-link>
              </div>

              <!-- Lista de Items (CartItem) -->
              <div v-else class="d-flex flex-column gap-4">
                <div 
                  v-for="item in cartStore.items" 
                  :key="item.id"
                  class="cart-item-row d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between p-3 rounded-4 border bg-white shadow-hover transition-all gap-3"
                >
                  <div class="d-flex align-items-center gap-3">
                    <div class="product-thumb-wrapper p-2 bg-light rounded-3">
                      <img :src="item.image" :alt="item.name" class="img-fluid" @error="handleImageError">
                    </div>
                    <div>
                      <h6 class="fw-800 text-body-emphasis mb-1 text-truncate-1">{{ item.name }}</h6>
                      <span class="badge bg-soft-primary text-uppercase smallest tracking-wider">{{ item.sku }}</span>
                    </div>
                  </div>

                  <div class="d-flex align-items-center justify-content-between w-100 w-sm-auto gap-4">
                    <!-- Cantidad con accesibilidad por teclado -->
                    <div class="qty-counter border rounded-pill bg-light p-1 d-flex align-items-center">
                      <button 
                        class="btn-qty rounded-circle" 
                        @click="cartStore.changeQty(item.id, -1)" 
                        aria-label="Reducir cantidad"
                      >
                        <i class="fa-solid fa-minus smaller text-muted"></i>
                      </button>
                      <span class="fw-bold px-3 text-dark">{{ item.qty }}</span>
                      <button 
                        class="btn-qty rounded-circle" 
                        @click="cartStore.addToCart({ id: item.id }, 1)" 
                        aria-label="Aumentar cantidad"
                      >
                        <i class="fa-solid fa-plus smaller text-muted"></i>
                      </button>
                    </div>

                    <!-- Precio total del Item -->
                    <div class="text-end" style="min-width: 100px;">
                      <span class="fw-900 text-body-emphasis d-block">Bs. {{ (item.price * item.qty).toFixed(2) }}</span>
                      <span class="smallest text-muted">Bs. {{ item.price.toFixed(2) }}/u</span>
                    </div>

                    <!-- Eliminar -->
                    <button 
                      class="btn btn-link text-danger border-0 p-1" 
                      @click="cartStore.removeFromCart(item.id)" 
                      aria-label="Eliminar producto"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>

                <!-- Botón de Vaciar -->
                <div class="pt-4 border-top text-end">
                  <button class="btn btn-outline-danger rounded-pill px-4" @click="handleClearCart">
                    <i class="fa-solid fa-trash-arrow-up me-2"></i>Vaciar Carrito
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Checkout & Resumen Financiero -->
          <div class="col-lg-5">
            <div class="card border-0 rounded-5 shadow-soft p-4 p-sm-5 bg-card sticky-top" style="top: 100px;">
              <h4 class="fw-800 text-body-emphasis mb-4 border-bottom pb-3">Resumen de Cotización</h4>
              
              <div class="d-flex justify-content-between mb-2">
                <span class="text-body-secondary fw-medium">Subtotal Neto</span>
                <span class="fw-bold text-body-emphasis">Bs. {{ cartStore.cartSubtotal.toFixed(2) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-body-secondary fw-medium">Transporte de Carga Especializada</span>
                <span class="fw-bold text-body-emphasis">Bs. {{ cartStore.cartShipping.toFixed(2) }}</span>
              </div>
              <div class="d-flex justify-content-between border-top pt-3 mb-4">
                <span class="fw-800 text-body-emphasis">Monto Total Estimado</span>
                <span class="fw-900 text-primary fs-3">Bs. {{ cartStore.cartTotal.toFixed(2) }}</span>
              </div>

              <!-- Formulario de Envío B2B -->
              <h5 class="fw-800 text-body-emphasis mb-3 border-top pt-4">Información de Despacho</h5>
              
              <!-- Comentarios sobre Laravel:
                   Este formulario se acopla directamente a una solicitud POST a /api/orders.
                   Requiere que el token Bearer esté almacenado en Axios para pasar a través del middleware auth:sanctum. -->
              <form @submit.prevent="submitOrder">
                <div class="mb-3">
                  <label class="form-label smaller fw-800 text-uppercase tracking-tighter">Entidad Cliente / Razón Social</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="orderForm.name" 
                    required 
                    placeholder="Ej: AgroIndustria Boliviana S.A." 
                    aria-required="true"
                  />
                </div>
                
                <div class="mb-3">
                  <label class="form-label smaller fw-800 text-uppercase tracking-tighter">Dirección de Despacho de Planta</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="orderForm.address" 
                    required 
                    placeholder="Calle 10, Galpón 4 - Parque Industrial" 
                    aria-required="true"
                  />
                </div>

                <div class="row g-3 mb-4">
                  <div class="col-6">
                    <label class="form-label smaller fw-800 text-uppercase tracking-tighter">NIT / RUT Fiscal</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="orderForm.tax_id" 
                      required 
                      placeholder="NIT Facturación" 
                      aria-required="true"
                    />
                  </div>
                  <div class="col-6">
                    <label class="form-label smaller fw-800 text-uppercase tracking-tighter">Teléfono Operativo</label>
                    <input 
                      type="tel" 
                      class="form-control" 
                      v-model="orderForm.phone" 
                      required 
                      placeholder="70000000" 
                      aria-required="true"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  class="btn btn-brand w-100 py-3 rounded-pill fw-bold shadow-brand-sm" 
                  :disabled="cartStore.items.length === 0 || isSubmitting"
                >
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fa-solid fa-circle-check me-2"></i>
                  <span>{{ isSubmitting ? 'Registrando...' : 'Confirmar Solicitud de Pedido' }}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Public Footer Reutilizable -->
    <PublicFooter />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useCartStore } from '../stores/cart';
import BaseBadge from '../components/base/BaseBadge.vue';
import PublicNavbar from '../components/PublicNavbar.vue';
import PublicFooter from '../components/PublicFooter.vue';

const router = useRouter();
const cartStore = useCartStore();

const isSubmitting = ref(false);
const orderForm = reactive({ name: '', address: '', tax_id: '', phone: '' });

const handleImageError = (e) => {
  e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=400&auto=format&fit=crop';
};

const handleClearCart = () => {
  Swal.fire({
    title: '¿Vaciar carrito?',
    text: 'Se eliminarán todos los productos de tu lista de cotización.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sí, vaciar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      cartStore.clearCart();
      Swal.fire('Vaciado', 'Tu carrito ha sido vaciado.', 'success');
    }
  });
};

const submitOrder = async () => {
  isSubmitting.value = true;
  
  try {
    // Simulación de pedido exitoso
    // Laravel Integration Comment:
    // Aquí conectarías a la API con axios.post('/orders', { items: cartStore.items, ...orderForm })
    
    // Almacenamos el pedido de forma simulada en localStorage para que el panel de administración
    // pueda leerlo e integrarlo en la visualización como un pedido dinámico real
    const simulatedOrders = JSON.parse(localStorage.getItem('soluplast_simulated_orders') || '[]');
    simulatedOrders.unshift({
      id: simulatedOrders.length + 101,
      client: orderForm.name,
      status: 'pending',
      address: orderForm.address,
      total: cartStore.cartTotal,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('soluplast_simulated_orders', JSON.stringify(simulatedOrders));

    await Swal.fire({
      title: '¡Pedido Solicitado con Éxito!',
      text: 'Nuestros ingenieros de planta procesarán la cotización y coordinarán la entrega logística.',
      icon: 'success',
      confirmButtonColor: '#002954',
      confirmButtonText: 'Entendido'
    });

    cartStore.clearCart();
    orderForm.name = '';
    orderForm.address = '';
    orderForm.tax_id = '';
    orderForm.phone = '';

    // Redirigir al inicio o catálogo
    router.push({ name: 'home' });
  } catch (error) {
    Swal.fire('Error', 'Hubo un error al registrar tu pedido.', 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.fw-900 { font-weight: 900; }
.fw-800 { font-weight: 800; }
.smaller { font-size: 0.85rem; }
.smallest { font-size: 0.75rem; }
.tracking-wider { letter-spacing: 0.08em; }
.max-w-600 { max-width: 600px; }
.max-w-400 { max-width: 400px; }
.py-10 { padding-top: 6rem; padding-bottom: 6rem; }
.shadow-soft { box-shadow: var(--shadow-md) !important; }
.shadow-hover:hover { box-shadow: var(--shadow-lg) !important; }

/* Hero */
.premium-liquid-bg {
  pointer-events: none;
  background: var(--bg-body);
  overflow: hidden;
}
.liquid-blob {
  position: absolute;
  filter: blur(140px);
  border-radius: 50%;
  opacity: 0.6;
}
.blob-1 {
  width: 500px;
  height: 500px;
  background: var(--color-primary-soft);
  top: -20%;
  left: -10%;
}
.blob-2 {
  width: 400px;
  height: 400px;
  background: rgba(14, 165, 233, 0.1);
  bottom: -20%;
  right: -5%;
}
.liquid-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent, var(--bg-body) 85%);
}

/* Cart Item */
.product-thumb-wrapper {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid var(--border-color);
}
.product-thumb-wrapper img {
  max-height: 90%;
  object-fit: contain;
}

.qty-counter {
  height: 38px;
}
.btn-qty {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}
.btn-qty:hover {
  background: var(--border-color);
}

.btn-qty:active {
  transform: scale(0.9);
}

.shadow-brand-sm {
  box-shadow: 0 8px 20px var(--color-primary-glass) !important;
}

@media (max-width: 575px) {
  .cart-item-row {
    text-align: center;
    align-items: center !important;
  }
  .product-thumb-wrapper {
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
