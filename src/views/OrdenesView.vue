<template>
  <div class="animate__animated animate__fadeIn">

    <!-- ── ENCABEZADO ─────────────────────────────────────────────── -->
    <div class="sol-page-header mb-3">
      <div>
        <h2 class="sol-page-title">Gestión de Pedidos</h2>
        <p class="sol-page-subtitle">{{ meta.total ?? 0 }} pedidos registrados en el sistema</p>
      </div>
    </div>

    <!-- ── GRID ──────────────────────────────────────────────────── -->
    <BaseDataGrid
      :items="orders"
      :columns="gridColumns"
      :loading="loading"
      :pagination="paginationObj"
      search-placeholder="Buscar por referencia o cliente…"
      empty-title="Sin pedidos registrados"
      empty-icon="fa-solid fa-inbox"
      empty-description="No hay pedidos que coincidan con los filtros aplicados."
      compact
      @search="handleSearch"
      @page-change="fetchOrders"
    >
      <!-- Filtros -->
      <template #filters>
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <BaseFilterSelect
            v-model="filters.status"
            :options="statusOptions"
            width="185px"
            @update:modelValue="fetchOrders(1)"
          />
          <input
            v-model="filters.from"
            type="date"
            class="form-control form-control-sm border rounded-pill px-3"
            style="height:38px;width:155px;font-size:.8125rem;"
            @change="fetchOrders(1)"
          >
          <input
            v-model="filters.to"
            type="date"
            class="form-control form-control-sm border rounded-pill px-3"
            style="height:38px;width:155px;font-size:.8125rem;"
            @change="fetchOrders(1)"
          >
          <button
            v-if="filters.status !== '' || filters.from || filters.to"
            type="button"
            class="btn btn-light rounded-pill px-3 border"
            style="height:38px;font-size:.8125rem;font-weight:600;"
            @click="clearFilters"
          >
            <i class="fa-solid fa-xmark me-1"></i>Limpiar
          </button>
        </div>
      </template>

      <!-- Columna: Referencia + Cliente -->
      <template #col-order_info="{ item }">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-light text-secondary border d-flex align-items-center justify-content-center rounded-3"
               style="width:40px;height:40px;flex-shrink:0;">
            <i class="fa-solid fa-box-open" style="font-size:.9rem;"></i>
          </div>
          <div>
            <div class="fw-bold text-body-emphasis small font-monospace">
              #{{ item.id.slice(0,8).toUpperCase() }}
            </div>
            <div class="text-body-secondary smaller mt-1 d-flex align-items-center gap-2">
              <span>{{ customerName(item.customer) }}</span>
              <span class="badge rounded-pill px-2 py-0 border"
                    style="font-size:.58rem;font-weight:700;letter-spacing:.02em;"
                    :class="item.customer?.customer_type === 'business'
                      ? 'bg-primary-subtle text-primary border-primary-subtle'
                      : 'bg-light text-dark border'">
                {{ item.customer?.customer_type === 'business' ? 'Empresa' : 'Individual' }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Columna: Ítems -->
      <template #col-items_count="{ item }">
        <span class="badge rounded-pill bg-light border text-dark px-3 py-1 sol-fw-800 sol-smallest">
          {{ item.items_count ?? item.items?.length ?? '—' }}
        </span>
      </template>

      <!-- Columna: Total -->
      <template #col-total_amount="{ item }">
        <span class="fw-bold small text-body-emphasis">Bs. {{ fmtMoney(item.total_amount) }}</span>
      </template>

      <!-- Columna: Estado -->
      <template #col-status="{ item }">
        <span class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest border"
              :class="STATUS_CONFIG[item.status]?.cls ?? 'bg-secondary-subtle text-secondary border-secondary-subtle'">
          {{ STATUS_CONFIG[item.status]?.label ?? item.status }}
        </span>
      </template>

      <!-- Columna: Fecha -->
      <template #col-created_at="{ item }">
        <span class="small text-body-secondary">{{ fmtDate(item.created_at) }}</span>
      </template>

      <!-- Acciones -->
      <template #item-actions="{ item }">
        <li>
          <button class="dropdown-item rounded-3 py-2 small" @click="openDetail(item.id)">
            <i class="fa-solid fa-eye me-2 text-primary"></i>Ver detalle
          </button>
        </li>
      </template>
    </BaseDataGrid>

    <!-- ══════════════════════════════════════════════════════════════
         PANEL DE DETALLE — slide-in lateral
    ══════════════════════════════════════════════════════════════ -->
    <div v-if="showDetail" class="detail-overlay" @click.self="closeDetail">
      <div class="detail-panel animate__animated animate__fadeInRight animate__faster">

        <!-- Header del panel -->
        <div class="detail-header d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-light border d-flex align-items-center justify-content-center rounded-3"
                 style="width:42px;height:42px;flex-shrink:0;">
              <i class="fa-solid fa-box-open text-secondary"></i>
            </div>
            <div>
              <h6 class="fw-bold mb-0 font-monospace text-body-emphasis">
                #{{ selectedOrder?.id?.slice(0,8).toUpperCase() }}
              </h6>
              <p class="text-body-secondary smaller mb-0">{{ customerName(selectedOrder?.customer) }}</p>
            </div>
            <span v-if="selectedOrder"
                  class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest border ms-1"
                  :class="STATUS_CONFIG[selectedOrder.status]?.cls ?? 'bg-secondary-subtle text-secondary border-secondary-subtle'">
              {{ STATUS_CONFIG[selectedOrder.status]?.label ?? selectedOrder.status }}
            </span>
          </div>
          <button class="btn btn-light rounded-circle p-0 border" style="width:34px;height:34px;" @click="closeDetail">
            <i class="fa-solid fa-xmark text-body-secondary"></i>
          </button>
        </div>

        <!-- Cargando detalle -->
        <div v-if="detailLoading" class="d-flex align-items-center justify-content-center" style="height:400px;">
          <div class="spinner-border text-secondary" role="status"></div>
        </div>

        <!-- Cuerpo del panel -->
        <div v-else-if="selectedOrder" class="detail-body px-4 py-4 overflow-auto">

          <!-- Acciones de transición -->
          <div v-if="selectedOrder.allowed_transitions?.length" class="mb-4">
            <p class="smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Acciones disponibles</p>
            <div class="d-flex gap-2 flex-wrap">
              <button
                v-for="trans in selectedOrder.allowed_transitions"
                :key="trans"
                class="btn btn-sm rounded-pill px-3"
                :class="TRANSITION_CONFIG[trans]?.btn ?? 'btn-outline-secondary'"
                @click="initiateTransition(trans)"
              >
                <i class="fa-solid me-1" :class="TRANSITION_CONFIG[trans]?.icon ?? 'fa-arrow-right'"></i>
                {{ TRANSITION_CONFIG[trans]?.label ?? trans }}
              </button>
            </div>
          </div>

          <div class="row g-4">

            <!-- IZQUIERDA: Cliente + Productos -->
            <div class="col-lg-7">

              <!-- Tarjeta cliente -->
              <div class="info-card rounded-3 border overflow-hidden mb-4">
                <div class="info-card-header">
                  <i class="fa-solid fa-user-circle me-2"></i>Cliente
                </div>
                <div class="info-card-body p-3">
                  <div class="row g-3">
                    <div class="col-6">
                      <div class="label-sm">Nombre</div>
                      <div class="value-sm">{{ selectedOrder.customer?.business_name || selectedOrder.customer?.name }}</div>
                    </div>
                    <div class="col-6">
                      <div class="label-sm">Tipo</div>
                      <div class="value-sm">
                        <span class="badge rounded-pill px-2 py-1 sol-smallest border"
                              :class="selectedOrder.customer?.customer_type === 'business'
                                ? 'bg-primary-subtle text-primary border-primary-subtle'
                                : 'bg-light text-dark border'">
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

              <!-- Tabla de productos -->
              <div class="info-card rounded-3 border overflow-hidden">
                <div class="info-card-header">
                  <i class="fa-solid fa-boxes-stacked me-2"></i>Productos del pedido
                </div>
                <div class="table-responsive">
                  <table class="table table-sm mb-0">
                    <thead class="bg-body-tertiary">
                      <tr>
                        <th class="ps-3 py-2 small fw-semibold text-muted text-uppercase">Producto</th>
                        <th class="py-2 small fw-semibold text-muted text-uppercase text-center">Cant.</th>
                        <th class="py-2 small fw-semibold text-muted text-uppercase text-end">P. Unit.</th>
                        <th class="pe-3 py-2 small fw-semibold text-muted text-uppercase text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in selectedOrder.items" :key="item.id">
                        <td class="ps-3 py-2">
                          <div class="small fw-semibold">{{ item.product_name }}</div>
                          <div v-if="item.customization_notes" class="text-muted" style="font-size:.7rem;">{{ item.customization_notes }}</div>
                        </td>
                        <td class="py-2 text-center small">{{ item.quantity }}</td>
                        <td class="py-2 text-end small">Bs. {{ fmtMoney(item.unit_price) }}</td>
                        <td class="pe-3 py-2 text-end small fw-bold">Bs. {{ fmtMoney(item.subtotal) }}</td>
                      </tr>
                    </tbody>
                    <tfoot class="border-top bg-body-tertiary">
                      <tr>
                        <td colspan="3" class="ps-3 py-2 fw-bold small text-end pe-2">Total</td>
                        <td class="pe-3 py-2 fw-bold text-end">Bs. {{ fmtMoney(selectedOrder.total_amount) }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>

            <!-- DERECHA: Datos + Pago + Historial -->
            <div class="col-lg-5">

              <!-- Datos del pedido -->
              <div class="info-card rounded-3 border overflow-hidden mb-4">
                <div class="info-card-header">
                  <i class="fa-solid fa-circle-info me-2"></i>Datos del pedido
                </div>
                <div class="info-card-body p-3">
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

              <!-- Pago -->
              <div class="info-card rounded-3 border overflow-hidden mb-4" v-if="selectedOrder.payments?.length">
                <div class="info-card-header">
                  <i class="fa-solid fa-credit-card me-2"></i>Pago
                </div>
                <div class="info-card-body p-3">
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
                      <span class="badge rounded-pill px-2 py-1 sol-smallest border"
                            :class="paymentBadgeCls(pmt.status)">
                        {{ fmtPaymentStatus(pmt.status) }}
                      </span>
                    </div>
                    <div v-if="pmt.paid_at" class="d-flex justify-content-between align-items-center">
                      <span class="label-sm mb-0">Fecha de pago</span>
                      <span class="value-sm">{{ fmtDateOnly(pmt.paid_at) }}</span>
                    </div>
                  </div>
                  <div v-if="!selectedOrder.payments.some(p => p.status === 'completed')" class="mt-2 pt-2 border-top">
                    <div class="d-flex justify-content-between">
                      <span class="text-muted small">Pendiente de cobro</span>
                      <span class="fw-bold small text-danger">Bs. {{ fmtMoney(selectedOrder.total_amount) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Historial -->
              <div class="info-card rounded-3 border overflow-hidden" v-if="selectedOrder.handlers?.length">
                <div class="info-card-header">
                  <i class="fa-solid fa-clock-rotate-left me-2"></i>Historial
                </div>
                <div class="info-card-body p-3">
                  <div class="timeline">
                    <div
                      v-for="(h, idx) in selectedOrder.handlers"
                      :key="h.id"
                      class="timeline-item"
                      :class="{ last: idx === selectedOrder.handlers.length - 1 }"
                    >
                      <div class="timeline-dot"></div>
                      <div class="timeline-content">
                        <div class="small fw-semibold text-body-emphasis">{{ h.action_taken }}</div>
                        <div class="d-flex gap-2 align-items-center mt-1">
                          <span class="badge rounded-pill bg-light text-muted border sol-smallest">{{ h.handler_role }}</span>
                          <span class="text-muted" style="font-size:.72rem;">{{ h.handler_name }}</span>
                        </div>
                        <div v-if="h.notes" class="text-muted fst-italic mt-1" style="font-size:.72rem;">{{ h.notes }}</div>
                        <div class="text-muted mt-1" style="font-size:.68rem;">{{ fmtDateLong(h.handled_at) }}</div>
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

    <!-- ── MODAL: Confirmación de cambio de estado ────────────────── -->
    <BaseModal v-model="showTransitionModal" :title="TRANSITION_CONFIG[pendingTransition]?.label ?? 'Cambiar estado'" size="md">
      <div class="p-2">
        <p class="text-body-secondary small mb-3">
          ¿Confirmas el cambio de estado a
          <strong class="text-body-emphasis">{{ STATUS_CONFIG[pendingTransition]?.label ?? pendingTransition }}</strong>?
        </p>
        <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
          Notas (opcional)
        </label>
        <textarea
          v-model="transitionNotes"
          class="form-control sol-textarea"
          rows="3"
          placeholder="Observaciones sobre este cambio…"
        ></textarea>
      </div>
      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showTransitionModal = false">Cancelar</BaseButton>
          <BaseButton
            :variant="TRANSITION_CONFIG[pendingTransition]?.variant ?? 'brand'"
            class="rounded-pill px-5"
            :loading="transitioning"
            @click="confirmTransition"
          >
            Confirmar
          </BaseButton>
        </div>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '../plugins/axios';
import { Toast } from '../plugins/swal';
import BaseDataGrid from '../components/base/BaseDataGrid.vue';
import BaseButton from '../components/base/BaseButton.vue';
import BaseModal from '../components/base/BaseModal.vue';
import BaseFilterSelect from '../components/base/BaseFilterSelect.vue';

// ── CONSTANTES ────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:       { label: 'Pendiente',     cls: 'bg-warning-subtle text-warning border-warning-subtle' },
  confirmed:     { label: 'Confirmado',    cls: 'bg-primary-subtle text-primary border-primary-subtle' },
  in_production: { label: 'En Producción', cls: 'bg-info-subtle text-info border-info-subtle' },
  ready:         { label: 'Listo',         cls: 'bg-success-subtle text-success border-success-subtle' },
  shipped:       { label: 'Enviado',       cls: 'bg-dark text-white border-dark' },
  delivered:     { label: 'Entregado',     cls: 'bg-success-subtle text-success border-success-subtle' },
  cancelled:     { label: 'Cancelado',     cls: 'bg-danger-subtle text-danger border-danger-subtle' },
  returned:      { label: 'Devuelto',      cls: 'bg-secondary-subtle text-secondary border-secondary-subtle' },
};

const TRANSITION_CONFIG = {
  confirmed:     { label: 'Confirmar pedido',     variant: 'brand',   btn: 'btn-primary',  icon: 'fa-circle-check' },
  in_production: { label: 'Iniciar producción',   variant: 'brand',   btn: 'btn-info',     icon: 'fa-gears' },
  ready:         { label: 'Marcar como listo',    variant: 'brand',   btn: 'btn-success',  icon: 'fa-box-open' },
  shipped:       { label: 'Marcar como enviado',  variant: 'brand',   btn: 'btn-dark',     icon: 'fa-truck' },
  delivered:     { label: 'Confirmar entrega',    variant: 'brand',   btn: 'btn-success',  icon: 'fa-check-double' },
  cancelled:     { label: 'Cancelar pedido',      variant: 'danger',  btn: 'btn-danger',   icon: 'fa-ban' },
  returned:      { label: 'Registrar devolución', variant: 'warning', btn: 'btn-warning',  icon: 'fa-rotate-left' },
};

const statusOptions = [
  { label: 'Todos los estados',  value: '' },
  { label: 'Pendientes',         value: 'pending' },
  { label: 'Confirmados',        value: 'confirmed' },
  { label: 'En Producción',      value: 'in_production' },
  { label: 'Listos',             value: 'ready' },
  { label: 'Enviados',           value: 'shipped' },
  { label: 'Entregados',         value: 'delivered' },
  { label: 'Cancelados',         value: 'cancelled' },
  { label: 'Devueltos',          value: 'returned' },
];

const gridColumns = [
  { label: 'REFERENCIA / CLIENTE', key: 'order_info',    width: '35%' },
  { label: 'ÍTEMS',                key: 'items_count',   align: 'center' },
  { label: 'TOTAL',                key: 'total_amount',  align: 'end' },
  { label: 'ESTADO',               key: 'status' },
  { label: 'FECHA',                key: 'created_at' },
];

// ── ESTADO ────────────────────────────────────────────────────────────

const orders  = ref([]);
const meta    = ref({});
const loading = ref(false);
const filters = reactive({ status: '', search: '', from: '', to: '' });
let searchTimer = null;

const selectedOrder      = ref(null);
const detailLoading      = ref(false);
const showDetail         = ref(false);

const showTransitionModal = ref(false);
const pendingTransition   = ref('');
const transitionNotes     = ref('');
const transitioning       = ref(false);

const paginationObj = computed(() => ({
  current_page: meta.value.current_page ?? 1,
  last_page:    meta.value.last_page    ?? 1,
  total:        meta.value.total        ?? 0,
  from:         meta.value.from         ?? 0,
  to:           meta.value.to           ?? 0,
}));

// ── DATOS ─────────────────────────────────────────────────────────────

async function fetchOrders(page = 1) {
  loading.value = true;
  try {
    const params = { page };
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.from)   params.from   = filters.from;
    if (filters.to)     params.to     = filters.to;
    const { data } = await api.get('/orders', { params });
    orders.value = data.data;
    meta.value   = data.meta ?? {};
  } catch {
    Toast.fire({ icon: 'error', title: 'Error al cargar los pedidos' });
  } finally {
    loading.value = false;
  }
}

async function openDetail(orderId) {
  showDetail.value    = true;
  detailLoading.value = true;
  selectedOrder.value = null;
  try {
    const { data } = await api.get(`/orders/${orderId}`);
    selectedOrder.value = data.data ?? data;
  } catch {
    Toast.fire({ icon: 'error', title: 'Error al cargar el detalle del pedido' });
    showDetail.value = false;
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail() {
  showDetail.value    = false;
  selectedOrder.value = null;
}

// ── TRANSICIONES DE ESTADO ────────────────────────────────────────────

function initiateTransition(status) {
  pendingTransition.value   = status;
  transitionNotes.value     = '';
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
    Toast.fire({ icon: 'success', title: 'Estado actualizado correctamente' });
    const { data } = await api.get(`/orders/${selectedOrder.value.id}`);
    selectedOrder.value = data.data ?? data;
    fetchOrders(meta.value.current_page ?? 1);
  } catch (e) {
    Toast.fire({ icon: 'error', title: e.response?.data?.message ?? 'Error al cambiar el estado del pedido.' });
  } finally {
    transitioning.value = false;
  }
}

// ── FILTROS ───────────────────────────────────────────────────────────

function handleSearch(value) {
  filters.search = value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => fetchOrders(1), 380);
}

function clearFilters() {
  Object.assign(filters, { status: '', search: '', from: '', to: '' });
  fetchOrders(1);
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

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateLong(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtDateOnly(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtPaymentMethod(method) {
  const map = {
    efectivo: 'Efectivo / Contraentrega', transferencia_bancaria: 'Transferencia bancaria',
    tarjeta_debito: 'Tarjeta débito', tarjeta_credito: 'Tarjeta crédito',
    cheque: 'Cheque', mercadopago: 'MercadoPago', otro: 'Otro',
  };
  return map[method] ?? method;
}

function fmtPaymentStatus(status) {
  return { pending: 'Pendiente', completed: 'Pagado', failed: 'Fallido', refunded: 'Reembolsado' }[status] ?? status;
}

function paymentBadgeCls(status) {
  return {
    pending:   'bg-warning-subtle text-warning border-warning-subtle',
    completed: 'bg-success-subtle text-success border-success-subtle',
    failed:    'bg-danger-subtle text-danger border-danger-subtle',
    refunded:  'bg-secondary-subtle text-secondary border-secondary-subtle',
  }[status] ?? 'bg-light text-dark border';
}

onMounted(() => fetchOrders());
</script>

<style scoped>
/* ── Panel de detalle lateral ──────────────────────────────────── */
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
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
  box-shadow: -8px 0 40px rgba(0,0,0,.15);
}

.detail-header {
  flex-shrink: 0;
  background: var(--bs-body-bg);
  min-height: 68px;
}

.detail-body { flex: 1; overflow-y: auto; }

/* ── Info cards ────────────────────────────────────────────────── */
.info-card-header {
  background: var(--bs-tertiary-bg);
  border-bottom: 1px solid var(--bs-border-color);
  padding: .6rem 1rem;
  font-size: .78rem;
  font-weight: 700;
  color: var(--bs-body-color);
  text-transform: uppercase;
  letter-spacing: .06em;
}

.label-sm {
  font-size: .68rem;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--bs-secondary-color);
  font-weight: 700;
  margin-bottom: 2px;
}

.value-sm {
  font-size: .85rem;
  color: var(--bs-body-color);
  font-weight: 500;
}

/* ── Timeline ──────────────────────────────────────────────────── */
.timeline { position: relative; padding-left: 1.25rem; }
.timeline-item {
  position: relative;
  padding-bottom: 1rem;
  padding-left: 1rem;
}
.timeline-item:not(.last)::before {
  content: '';
  position: absolute;
  left: 0; top: 10px; bottom: 0;
  width: 1px;
  background: var(--bs-border-color);
}
.timeline-dot {
  position: absolute;
  left: -4px; top: 4px;
  width: 9px; height: 9px;
  border-radius: 50%;
  background: var(--bs-body-emphasis-color);
  border: 2px solid var(--bs-body-bg);
}
.timeline-content { padding-left: .25rem; }
</style>
