<template>
  <div>
    <!-- ── PAGE HEADER ──────────────────────────────────────────── -->
    <div class="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h4 class="fw-bold mb-1 text-body-emphasis">Gestión de Pedidos</h4>
        <p class="text-muted small mb-0">
          <span v-if="!loading">{{ meta.total ?? 0 }} pedidos en total</span>
          <span v-else>Cargando…</span>
        </p>
      </div>
    </div>

    <!-- ── STATUS TABS ───────────────────────────────────────────── -->
    <div class="status-tabs d-flex gap-2 flex-wrap mb-3 pb-3 border-bottom">
      <button
        v-for="tab in STATUS_TABS"
        :key="tab.key"
        class="btn btn-sm px-3 rounded-0"
        :class="filters.status === tab.key ? 'btn-dark' : 'btn-outline-secondary'"
        @click="setStatusFilter(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── FILTERS ───────────────────────────────────────────────── -->
    <div class="row g-2 mb-4">
      <div class="col-md-5">
        <div class="input-group input-group-sm">
          <span class="input-group-text bg-white">
            <i class="bi bi-search text-muted"></i>
          </span>
          <input
            v-model="filters.search"
            type="text"
            class="form-control"
            placeholder="Buscar por referencia o cliente…"
            @input="debouncedFetch"
          >
        </div>
      </div>
      <div class="col-md-3">
        <input
          v-model="filters.from"
          type="date"
          class="form-control form-control-sm"
          @change="fetchOrders(1)"
        >
      </div>
      <div class="col-md-3">
        <input
          v-model="filters.to"
          type="date"
          class="form-control form-control-sm"
          @change="fetchOrders(1)"
        >
      </div>
      <div class="col-md-1">
        <button @click="clearFilters" class="btn btn-sm btn-outline-secondary w-100" title="Limpiar filtros">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>

    <!-- ── TABLE ─────────────────────────────────────────────────── -->
    <div class="card border shadow-sm rounded-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 orders-table">
          <thead class="border-bottom bg-body-tertiary">
            <tr>
              <th class="ps-4 py-3 fw-semibold small text-muted text-uppercase">Referencia</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Cliente</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase text-center">Items</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase text-end">Total</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Estado</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Fecha</th>
              <th class="pe-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading -->
            <template v-if="loading">
              <tr v-for="n in 8" :key="n">
                <td class="ps-4"><div class="skeleton-cell w-75"></div></td>
                <td><div class="skeleton-cell w-100"></div></td>
                <td class="text-center"><div class="skeleton-cell mx-auto" style="width: 30px;"></div></td>
                <td class="text-end"><div class="skeleton-cell ms-auto" style="width: 70px;"></div></td>
                <td><div class="skeleton-cell" style="width: 90px;"></div></td>
                <td><div class="skeleton-cell w-75"></div></td>
                <td></td>
              </tr>
            </template>

            <!-- Empty -->
            <tr v-else-if="orders.length === 0">
              <td colspan="7" class="text-center py-5">
                <i class="bi bi-inbox text-muted d-block mb-2" style="font-size: 2.5rem; opacity: .3;"></i>
                <p class="text-muted small mb-0">No hay pedidos que coincidan con los filtros aplicados</p>
              </td>
            </tr>

            <!-- Rows -->
            <tr v-else v-for="order in orders" :key="order.id" class="order-row">
              <td class="ps-4">
                <span class="fw-bold font-monospace small text-dark">
                  #{{ order.id.slice(0, 8).toUpperCase() }}
                </span>
              </td>
              <td>
                <div class="fw-semibold text-body-emphasis small">{{ customerName(order.customer) }}</div>
                <div class="text-muted" style="font-size: 0.72rem;">
                  {{ order.customer?.customer_type === 'business' ? 'Empresa' : 'Individual' }}
                </div>
              </td>
              <td class="text-center">
                <span class="badge bg-secondary bg-opacity-10 text-secondary border small">
                  {{ order.items_count ?? order.items?.length ?? '—' }}
                </span>
              </td>
              <td class="text-end">
                <span class="fw-bold small">Bs. {{ fmtMoney(order.total_amount) }}</span>
              </td>
              <td>
                <span class="badge rounded-0 px-2 py-1" :class="STATUS_CONFIG[order.status]?.badge ?? 'bg-secondary'">
                  {{ STATUS_CONFIG[order.status]?.label ?? order.status }}
                </span>
              </td>
              <td class="text-muted small">{{ fmtDate(order.created_at) }}</td>
              <td class="pe-4">
                <button
                  class="btn btn-sm btn-outline-dark rounded-0 px-3"
                  @click="openDetail(order.id)"
                >
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="meta.last_page > 1"
        class="d-flex justify-content-between align-items-center px-4 py-3 border-top"
      >
        <span class="text-muted small">
          Página {{ meta.current_page }} de {{ meta.last_page }}
          &nbsp;·&nbsp; {{ meta.total }} pedidos
        </span>
        <div class="d-flex gap-2">
          <button
            class="btn btn-sm btn-outline-secondary rounded-0"
            :disabled="meta.current_page <= 1"
            @click="fetchOrders(meta.current_page - 1)"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
          <button
            class="btn btn-sm btn-outline-secondary rounded-0"
            :disabled="meta.current_page >= meta.last_page"
            @click="fetchOrders(meta.current_page + 1)"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
         ORDER DETAIL MODAL
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="showDetail" class="modal-overlay" @click.self="closeDetail">
      <div class="detail-panel">

        <!-- Panel header -->
        <div class="detail-header d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div>
              <h5 class="fw-bold mb-0 font-monospace text-dark">
                #{{ selectedOrder?.id?.slice(0, 8).toUpperCase() }}
              </h5>
              <p class="text-muted small mb-0">{{ customerName(selectedOrder?.customer) }}</p>
            </div>
            <span
              v-if="selectedOrder"
              class="badge rounded-0 px-2 py-1 ms-2"
              :class="STATUS_CONFIG[selectedOrder.status]?.badge ?? 'bg-secondary'"
            >
              {{ STATUS_CONFIG[selectedOrder.status]?.label ?? selectedOrder?.status }}
            </span>
          </div>
          <button class="btn btn-sm btn-outline-secondary rounded-0" @click="closeDetail">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Loading detail -->
        <div v-if="detailLoading" class="d-flex align-items-center justify-content-center" style="height: 400px;">
          <div class="spinner-border text-secondary" role="status"></div>
        </div>

        <!-- Panel body -->
        <div v-else-if="selectedOrder" class="detail-body px-4 py-4 overflow-auto">

          <!-- Transition buttons -->
          <div v-if="selectedOrder.allowed_transitions?.length" class="mb-4">
            <p class="text-muted small fw-semibold text-uppercase mb-2">Acciones disponibles</p>
            <div class="d-flex gap-2 flex-wrap">
              <button
                v-for="trans in selectedOrder.allowed_transitions"
                :key="trans"
                class="btn btn-sm rounded-0 px-3"
                :class="TRANSITION_CONFIG[trans]?.btn ?? 'btn-secondary'"
                @click="initiateTransition(trans)"
              >
                <i class="bi me-1" :class="TRANSITION_CONFIG[trans]?.icon ?? 'bi-arrow-right'"></i>
                {{ TRANSITION_CONFIG[trans]?.label ?? trans }}
              </button>
            </div>
          </div>

          <div class="row g-4">

            <!-- LEFT: Customer + Items -->
            <div class="col-lg-7">

              <!-- Customer card -->
              <div class="info-card mb-4">
                <div class="info-card-header">
                  <i class="bi bi-person-circle me-2"></i> Cliente
                </div>
                <div class="info-card-body">
                  <div class="row g-2">
                    <div class="col-6">
                      <div class="label-sm">Nombre</div>
                      <div class="value-sm">{{ selectedOrder.customer?.business_name || selectedOrder.customer?.name }}</div>
                    </div>
                    <div class="col-6">
                      <div class="label-sm">Tipo</div>
                      <div class="value-sm">
                        <span class="badge rounded-0 bg-light text-dark border small">
                          {{ selectedOrder.customer?.customer_type === 'business' ? 'Empresa' : 'Individual' }}
                        </span>
                      </div>
                    </div>
                    <div class="col-6" v-if="selectedOrder.customer?.phone">
                      <div class="label-sm">Teléfono</div>
                      <div class="value-sm">{{ selectedOrder.customer.phone }}</div>
                    </div>
                    <div class="col-6" v-if="selectedOrder.customer?.email">
                      <div class="label-sm">Email</div>
                      <div class="value-sm text-truncate">{{ selectedOrder.customer.email }}</div>
                    </div>
                    <div class="col-12">
                      <div class="label-sm">Dirección de entrega</div>
                      <div class="value-sm">{{ selectedOrder.shipping_address }}</div>
                    </div>
                    <div class="col-12" v-if="selectedOrder.notes">
                      <div class="label-sm">Notas</div>
                      <div class="value-sm text-muted fst-italic">{{ selectedOrder.notes }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Items table -->
              <div class="info-card">
                <div class="info-card-header">
                  <i class="bi bi-box-seam me-2"></i> Productos del pedido
                </div>
                <div class="table-responsive">
                  <table class="table table-sm mb-0">
                    <thead class="bg-body-tertiary">
                      <tr>
                        <th class="ps-3 py-2 small fw-semibold text-muted">Producto</th>
                        <th class="py-2 small fw-semibold text-muted text-center">Cant.</th>
                        <th class="py-2 small fw-semibold text-muted text-end">P. Unit.</th>
                        <th class="pe-3 py-2 small fw-semibold text-muted text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in selectedOrder.items" :key="item.id">
                        <td class="ps-3 py-2">
                          <div class="small fw-semibold">{{ item.product_name }}</div>
                          <div v-if="item.customization_notes" class="text-muted" style="font-size: 0.7rem;">{{ item.customization_notes }}</div>
                        </td>
                        <td class="py-2 text-center small">{{ item.quantity }}</td>
                        <td class="py-2 text-end small">Bs. {{ fmtMoney(item.unit_price) }}</td>
                        <td class="pe-3 py-2 text-end small fw-bold">Bs. {{ fmtMoney(item.subtotal) }}</td>
                      </tr>
                    </tbody>
                    <tfoot class="border-top">
                      <tr>
                        <td colspan="3" class="ps-3 py-2 fw-bold small text-end pe-2">Total</td>
                        <td class="pe-3 py-2 fw-bold text-end">Bs. {{ fmtMoney(selectedOrder.total_amount) }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>

            <!-- RIGHT: Info + Payment -->
            <div class="col-lg-5">

              <!-- Order info card -->
              <div class="info-card mb-4">
                <div class="info-card-header">
                  <i class="bi bi-info-circle me-2"></i> Datos del pedido
                </div>
                <div class="info-card-body">
                  <div class="d-flex flex-column gap-3">
                    <div>
                      <div class="label-sm">Creado el</div>
                      <div class="value-sm">{{ fmtDateLong(selectedOrder.created_at) }}</div>
                    </div>
                    <div v-if="selectedOrder.expected_delivery_date">
                      <div class="label-sm">Entrega estimada</div>
                      <div class="value-sm">{{ fmtDateOnly(selectedOrder.expected_delivery_date) }}</div>
                    </div>
                    <div v-if="selectedOrder.created_by">
                      <div class="label-sm">Registrado por</div>
                      <div class="value-sm">{{ selectedOrder.created_by?.name ?? 'Cliente Web' }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment card -->
              <div class="info-card mb-4" v-if="selectedOrder.payments?.length">
                <div class="info-card-header">
                  <i class="bi bi-credit-card me-2"></i> Pago
                </div>
                <div class="info-card-body">
                  <div v-for="pmt in selectedOrder.payments" :key="pmt.id" class="d-flex flex-column gap-2">
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="label-sm mb-0">Método</span>
                      <span class="value-sm">{{ fmtPaymentMethod(pmt.payment_method) }}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="label-sm mb-0">Monto</span>
                      <span class="fw-bold small">Bs. {{ fmtMoney(pmt.amount) }}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="label-sm mb-0">Estado</span>
                      <span class="badge rounded-0 small px-2" :class="paymentBadge(pmt.status)">
                        {{ fmtPaymentStatus(pmt.status) }}
                      </span>
                    </div>
                    <div v-if="pmt.paid_at" class="d-flex justify-content-between align-items-center">
                      <span class="label-sm mb-0">Fecha de pago</span>
                      <span class="value-sm">{{ fmtDateOnly(pmt.paid_at) }}</span>
                    </div>
                  </div>
                  <!-- Totales si no hay pagos completados -->
                  <div v-if="!selectedOrder.payments.some(p => p.status === 'completed')" class="mt-2 pt-2 border-top">
                    <div class="d-flex justify-content-between">
                      <span class="text-muted small">Pendiente de cobro</span>
                      <span class="fw-bold small text-danger">Bs. {{ fmtMoney(selectedOrder.total_amount) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Handlers timeline -->
              <div class="info-card" v-if="selectedOrder.handlers?.length">
                <div class="info-card-header">
                  <i class="bi bi-clock-history me-2"></i> Historial
                </div>
                <div class="info-card-body py-3">
                  <div class="timeline">
                    <div
                      v-for="(h, idx) in selectedOrder.handlers"
                      :key="h.id"
                      class="timeline-item"
                      :class="{ 'last': idx === selectedOrder.handlers.length - 1 }"
                    >
                      <div class="timeline-dot"></div>
                      <div class="timeline-content">
                        <div class="small fw-semibold text-body-emphasis">{{ h.action_taken }}</div>
                        <div class="d-flex gap-2 align-items-center mt-1">
                          <span class="badge rounded-0 bg-light text-muted border" style="font-size: 0.65rem;">{{ h.handler_role }}</span>
                          <span class="text-muted" style="font-size: 0.72rem;">{{ h.handler_name }}</span>
                        </div>
                        <div v-if="h.notes" class="text-muted fst-italic mt-1" style="font-size: 0.72rem;">{{ h.notes }}</div>
                        <div class="text-muted mt-1" style="font-size: 0.68rem;">{{ fmtDateLong(h.handled_at) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
         STATUS CHANGE CONFIRMATION MODAL
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="showTransitionModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,.4);">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
        <div class="modal-content rounded-0 border-0 shadow-lg">
          <div class="modal-header border-bottom px-4 py-3">
            <h6 class="modal-title fw-bold mb-0">
              <i class="bi me-2" :class="TRANSITION_CONFIG[pendingTransition]?.icon ?? 'bi-arrow-right'"></i>
              {{ TRANSITION_CONFIG[pendingTransition]?.label ?? pendingTransition }}
            </h6>
            <button class="btn-close btn-sm" @click="showTransitionModal = false"></button>
          </div>
          <div class="modal-body px-4 py-4">
            <p class="text-muted small mb-3">
              ¿Confirmas el cambio de estado a
              <strong class="text-dark">{{ STATUS_CONFIG[pendingTransition]?.label ?? pendingTransition }}</strong>?
            </p>
            <label class="form-label fw-semibold small text-uppercase opacity-70">Notas (opcional)</label>
            <textarea
              v-model="transitionNotes"
              class="form-control form-control-sm rounded-0"
              rows="3"
              placeholder="Observaciones sobre este cambio…"
            ></textarea>
          </div>
          <div class="modal-footer px-4 py-3 border-top gap-2">
            <button class="btn btn-sm btn-outline-secondary rounded-0 px-4" @click="showTransitionModal = false">
              Cancelar
            </button>
            <button
              class="btn btn-sm rounded-0 px-4"
              :class="TRANSITION_CONFIG[pendingTransition]?.btn ?? 'btn-dark'"
              :disabled="transitioning"
              @click="confirmTransition"
            >
              <span v-if="transitioning" class="spinner-border spinner-border-sm me-1"></span>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../plugins/axios';

// ── CONSTANTS ───────────────────────────────────────────────────────
const STATUS_TABS = [
  { key: '',             label: 'Todos' },
  { key: 'pending',      label: 'Pendientes' },
  { key: 'confirmed',    label: 'Confirmados' },
  { key: 'in_production',label: 'En Producción' },
  { key: 'ready',        label: 'Listos' },
  { key: 'shipped',      label: 'Enviados' },
  { key: 'delivered',    label: 'Entregados' },
  { key: 'cancelled',    label: 'Cancelados' },
  { key: 'returned',     label: 'Devueltos' },
];

const STATUS_CONFIG = {
  pending:       { label: 'Pendiente',      badge: 'bg-warning text-dark' },
  confirmed:     { label: 'Confirmado',     badge: 'bg-primary text-white' },
  in_production: { label: 'En Producción',  badge: 'bg-info text-dark' },
  ready:         { label: 'Listo',          badge: 'bg-success text-white' },
  shipped:       { label: 'Enviado',        badge: 'bg-dark text-white' },
  delivered:     { label: 'Entregado',      badge: 'bg-success text-white' },
  cancelled:     { label: 'Cancelado',      badge: 'bg-danger text-white' },
  returned:      { label: 'Devuelto',       badge: 'bg-secondary text-white' },
};

const TRANSITION_CONFIG = {
  confirmed:     { label: 'Confirmar pedido',       btn: 'btn-primary',   icon: 'bi-check-circle' },
  in_production: { label: 'Iniciar producción',     btn: 'btn-info',      icon: 'bi-gear-fill' },
  ready:         { label: 'Marcar como listo',      btn: 'btn-success',   icon: 'bi-box-seam' },
  shipped:       { label: 'Marcar como enviado',    btn: 'btn-dark',      icon: 'bi-truck' },
  delivered:     { label: 'Confirmar entrega',      btn: 'btn-success',   icon: 'bi-check-all' },
  cancelled:     { label: 'Cancelar pedido',        btn: 'btn-danger',    icon: 'bi-x-circle' },
  returned:      { label: 'Registrar devolución',   btn: 'btn-warning',   icon: 'bi-arrow-return-left' },
};

// ── STATE ────────────────────────────────────────────────────────────
const orders  = ref([]);
const meta    = ref({});
const loading = ref(false);

const filters = reactive({
  status: '',
  search: '',
  from:   '',
  to:     '',
});

const selectedOrder    = ref(null);
const detailLoading    = ref(false);
const showDetail       = ref(false);

const showTransitionModal = ref(false);
const pendingTransition   = ref('');
const transitionNotes     = ref('');
const transitioning       = ref(false);

let searchTimer = null;

// ── DATA FETCHING ─────────────────────────────────────────────────────
async function fetchOrders(page = 1) {
  loading.value = true;
  try {
    const params = { page };
    if (filters.status) params.status  = filters.status;
    if (filters.search) params.search  = filters.search;
    if (filters.from)   params.from    = filters.from;
    if (filters.to)     params.to      = filters.to;

    const { data } = await api.get('/orders', { params });
    orders.value = data.data;
    meta.value   = data.meta ?? {};
  } catch (e) {
    console.error('Error fetching orders', e);
  } finally {
    loading.value = false;
  }
}

async function openDetail(orderId) {
  showDetail.value   = true;
  detailLoading.value = true;
  selectedOrder.value = null;
  try {
    const { data } = await api.get(`/orders/${orderId}`);
    selectedOrder.value = data.data ?? data;
  } catch (e) {
    console.error('Error fetching order detail', e);
    showDetail.value = false;
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail() {
  showDetail.value    = false;
  selectedOrder.value = null;
}

// ── STATUS TRANSITION ─────────────────────────────────────────────────
function initiateTransition(status) {
  pendingTransition.value = status;
  transitionNotes.value   = '';
  showTransitionModal.value = true;
}

async function confirmTransition() {
  if (!selectedOrder.value) return;
  transitioning.value = true;
  try {
    await api.patch(`/orders/${selectedOrder.value.id}/status`, {
      status: pendingTransition.value,
      notes:  transitionNotes.value || null,
    });

    showTransitionModal.value = false;

    // Reload detail
    const { data } = await api.get(`/orders/${selectedOrder.value.id}`);
    selectedOrder.value = data.data ?? data;

    // Refresh list in background
    fetchOrders(meta.value.current_page ?? 1);
  } catch (e) {
    const msg = e.response?.data?.message ?? 'Error al cambiar el estado del pedido.';
    alert(msg);
  } finally {
    transitioning.value = false;
  }
}

// ── FILTER HELPERS ────────────────────────────────────────────────────
function setStatusFilter(status) {
  filters.status = status;
  fetchOrders(1);
}

function clearFilters() {
  filters.status = '';
  filters.search = '';
  filters.from   = '';
  filters.to     = '';
  fetchOrders(1);
}

function debouncedFetch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => fetchOrders(1), 380);
}

// ── FORMATTERS ────────────────────────────────────────────────────────
function customerName(customer) {
  if (!customer) return '—';
  return customer.business_name || customer.name || '—';
}

function fmtMoney(val) {
  if (val == null) return '0.00';
  return Number(val).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateLong(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function fmtDateOnly(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtPaymentMethod(method) {
  const map = {
    efectivo: 'Efectivo / Contraentrega',
    transferencia_bancaria: 'Transferencia bancaria',
    tarjeta_debito: 'Tarjeta débito',
    tarjeta_credito: 'Tarjeta crédito',
    cheque: 'Cheque',
    mercadopago: 'MercadoPago',
    otro: 'Otro',
  };
  return map[method] ?? method;
}

function fmtPaymentStatus(status) {
  return { pending: 'Pendiente', completed: 'Pagado', failed: 'Fallido', refunded: 'Reembolsado' }[status] ?? status;
}

function paymentBadge(status) {
  return {
    pending:   'bg-warning text-dark',
    completed: 'bg-success text-white',
    failed:    'bg-danger text-white',
    refunded:  'bg-secondary text-white',
  }[status] ?? 'bg-light text-dark';
}

// ── INIT ──────────────────────────────────────────────────────────────
onMounted(() => fetchOrders());
</script>

<style scoped>
/* Table */
.orders-table th { letter-spacing: 0.04em; }
.order-row { transition: background 0.1s; }
.order-row:hover { background: var(--bs-tertiary-bg); }

/* Skeleton loader cells */
.skeleton-cell {
  height: 14px;
  border-radius: 2px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Detail panel overlay ───────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1050;
  display: flex;
  justify-content: flex-end;
}
.detail-panel {
  width: min(760px, 95vw);
  height: 100vh;
  background: var(--bs-body-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -8px 0 32px rgba(0,0,0,.18);
}
.detail-header {
  flex-shrink: 0;
  background: var(--bs-body-bg);
  min-height: 64px;
}
.detail-body {
  flex: 1;
  overflow-y: auto;
}

/* ── Info cards ──────────────────────── */
.info-card {
  border: 1px solid var(--bs-border-color);
  border-radius: 0;
  overflow: hidden;
}
.info-card-header {
  background: var(--bs-tertiary-bg);
  border-bottom: 1px solid var(--bs-border-color);
  padding: 0.6rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--bs-body-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.info-card-body { padding: 1rem; }

.label-sm {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bs-secondary-color);
  font-weight: 600;
  margin-bottom: 2px;
}
.value-sm {
  font-size: 0.85rem;
  color: var(--bs-body-color);
  font-weight: 500;
}

/* ── Timeline ──────────────────────── */
.timeline { position: relative; padding-left: 1.25rem; }
.timeline-item {
  position: relative;
  padding-bottom: 1rem;
  padding-left: 1rem;
}
.timeline-item:not(.last)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 0;
  width: 1px;
  background: var(--bs-border-color);
}
.timeline-dot {
  position: absolute;
  left: -4px;
  top: 4px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--bs-body-emphasis-color);
  border: 2px solid var(--bs-body-bg);
}
.timeline-content { padding-left: 0.25rem; }
</style>
