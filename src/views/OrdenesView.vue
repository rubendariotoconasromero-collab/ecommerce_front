<template>
  <div class="animate__animated animate__fadeIn">

    <!-- ── VISTA 1: LISTADO DE PEDIDOS ───────────────────────────── -->
    <div v-if="!showDetail" class="animate__animated animate__fadeIn">
      <!-- Encabezado de la página -->
      <div class="sol-page-header mb-3">
        <div>
          <h2 class="sol-page-title">Gestión de Pedidos</h2>
          <p class="sol-page-subtitle">{{ meta.total ?? 0 }} pedidos registrados en el sistema</p>
        </div>
      </div>

      <!-- DataGrid de pedidos -->
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
    </div>

    <!-- ── VISTA 2: SECCIÓN COMPLETA DE DETALLE ───────────────────── -->
    <div v-else class="animate__animated animate__fadeIn">
      
      <!-- Encabezado de detalle premium -->
      <div class="sol-page-header mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <!-- LADO IZQUIERDO: Volver + Título + Cliente -->
        <div class="d-flex align-items-center gap-3">
          <!-- Botón de Volver -->
          <button class="btn btn-back-circle rounded-circle p-0 border d-flex align-items-center justify-content-center shadow-sm" @click="closeDetail" title="Volver al listado de pedidos">
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <div>
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <h3 class="fw-bold mb-0 font-monospace text-body-emphasis" style="letter-spacing: -0.5px; font-size: 1.5rem;">
                  Pedido #{{ selectedOrder?.id?.slice(0,8).toUpperCase() }}
                </h3>
                <span v-if="selectedOrder"
                      class="badge rounded-pill px-3 py-1.5 sol-fw-800 sol-smallest border ms-1"
                      :class="STATUS_CONFIG[selectedOrder.status]?.cls ?? 'bg-secondary-subtle text-secondary border-secondary-subtle'">
                  {{ STATUS_CONFIG[selectedOrder.status]?.label ?? selectedOrder.status }}
                </span>
              </div>
              <p class="text-body-secondary smaller mb-0 mt-0.5">{{ customerName(selectedOrder?.customer) }}</p>
            </div>
          </div>
        </div>

        <!-- LADO DERECHO: Botones de Transición (Acciones) -->
        <div v-if="!detailLoading && selectedOrder?.allowed_transitions?.length" class="d-flex gap-2 flex-wrap align-items-center animate__animated animate__fadeIn">
          <button
            v-for="trans in selectedOrder.allowed_transitions"
            :key="trans"
            class="btn btn-sm rounded-pill px-3 py-1.5 fw-semibold shadow-sm transition-all"
            :class="TRANSITION_CONFIG[trans]?.btn ?? 'btn-outline-secondary'"
            @click="initiateTransition(trans)"
          >
            <i class="fa-solid me-1.5" :class="TRANSITION_CONFIG[trans]?.icon ?? 'fa-arrow-right'"></i>
            {{ TRANSITION_CONFIG[trans]?.label ?? trans }}
          </button>
        </div>
      </div>

      <!-- Cargando detalle -->
      <div v-if="detailLoading" class="d-flex flex-column align-items-center justify-content-center bg-card rounded-4 border p-5 shadow-sm" style="min-height:350px;">
        <div class="spinner-border text-primary mb-3" role="status"></div>
        <p class="text-muted small mb-0">Cargando la información detallada del pedido...</p>
      </div>

      <!-- Información del pedido -->
      <div v-else-if="selectedOrder" class="animate__animated animate__fadeIn">

        <div class="row g-4">
          <!-- COLUMNA IZQUIERDA: Cliente + Productos -->
          <div class="col-lg-8">
            
            <!-- Tarjeta Cliente -->
            <div class="info-card rounded-4 mb-4 shadow-sm overflow-hidden">
              <div class="info-card-header d-flex align-items-center py-3 px-4 bg-light border-bottom">
                <span class="fw-bold text-uppercase tracking-wider" style="font-size: .8rem;">Información del Cliente</span>
              </div>
              <div class="p-4">
                <div class="row g-3">
                  <div class="col-sm-6">
                    <div class="label-sm">Nombre / Razón Social</div>
                    <div class="value-sm fw-bold text-body-emphasis">{{ selectedOrder.customer?.business_name || selectedOrder.customer?.name }}</div>
                  </div>
                  <div class="col-sm-6">
                    <div class="label-sm">Tipo de Cliente</div>
                    <div class="value-sm mt-1">
                      <span class="badge rounded-pill px-2.5 py-1 sol-smallest border"
                            :class="selectedOrder.customer?.customer_type === 'business'
                              ? 'bg-primary-subtle text-primary border-primary-subtle'
                              : 'bg-light text-dark border'">
                        {{ selectedOrder.customer?.customer_type === 'business' ? 'Empresa' : 'Individual' }}
                      </span>
                    </div>
                  </div>
                  <div class="col-sm-6" v-if="selectedOrder.customer?.phone">
                    <div class="label-sm">Teléfono de Contacto</div>
                    <div class="value-sm text-body-emphasis">{{ selectedOrder.customer.phone }}</div>
                  </div>
                  <div class="col-sm-6" v-if="selectedOrder.customer?.email">
                    <div class="label-sm">Correo Electrónico</div>
                    <div class="value-sm text-body-emphasis text-truncate">{{ selectedOrder.customer.email }}</div>
                  </div>
                  <div class="col-12">
                    <div class="label-sm">Dirección de entrega</div>
                    <div class="value-sm text-body-emphasis">{{ selectedOrder.shipping_address }}</div>
                  </div>
                  <div class="col-12 border-top pt-3 mt-3" v-if="selectedOrder.notes">
                    <div class="label-sm">Notas del Pedido</div>
                    <div class="value-sm text-muted fst-italic">"{{ selectedOrder.notes }}"</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabla de Productos -->
            <div class="info-card rounded-4 shadow-sm overflow-hidden">
              <div class="info-card-header d-flex align-items-center py-3 px-4 bg-light border-bottom">
                <span class="fw-bold text-uppercase tracking-wider" style="font-size: .8rem;">Detalle de Productos</span>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="bg-body-tertiary">
                    <tr>
                      <th class="ps-4 py-3 small fw-semibold text-muted text-uppercase">Producto</th>
                      <th class="py-3 small fw-semibold text-muted text-uppercase text-center" style="width: 100px;">Cantidad</th>
                      <th class="py-3 small fw-semibold text-muted text-uppercase text-end" style="width: 140px;">P. Unit.</th>
                      <th class="pe-4 py-3 small fw-semibold text-muted text-uppercase text-end" style="width: 150px;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in selectedOrder.items" :key="item.id">
                      <td class="ps-4 py-3">
                        <div class="small fw-semibold text-body-emphasis">{{ item.product_name }}</div>
                        <div v-if="item.customization_notes" class="text-muted mt-1 small d-flex align-items-center gap-1" style="font-size:.75rem;">
                          <i class="fa-solid fa-pen-nib text-secondary smaller"></i>
                          <span>{{ item.customization_notes }}</span>
                        </div>
                      </td>
                      <td class="py-3 text-center small fw-semibold text-body-emphasis">{{ item.quantity }}</td>
                      <td class="py-3 text-end small text-body-emphasis">Bs. {{ fmtMoney(item.unit_price) }}</td>
                      <td class="pe-4 py-3 text-end small fw-bold text-body-emphasis">Bs. {{ fmtMoney(item.subtotal) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="border-top bg-body-tertiary">
                    <tr>
                      <td colspan="3" class="ps-4 py-3 fw-bold text-end text-body-emphasis" style="font-size: 0.9rem;">Total a Pagar</td>
                      <td class="pe-4 py-3 fw-bold text-end text-primary fs-5">Bs. {{ fmtMoney(selectedOrder.total_amount) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>

          <!-- COLUMNA DERECHA: Datos + Pago + Historial -->
          <div class="col-lg-4">
            
            <!-- Datos del Pedido -->
            <div class="info-card rounded-4 mb-4 shadow-sm overflow-hidden">
              <div class="info-card-header d-flex align-items-center py-3 px-4 bg-light border-bottom">
                <span class="fw-bold text-uppercase tracking-wider" style="font-size: .8rem;">Datos del Pedido</span>
              </div>
              <div class="p-4">
                <div class="d-flex flex-column gap-3">
                  <div class="d-flex justify-content-between border-bottom pb-2">
                    <div>
                      <div class="label-sm">Creado el</div>
                      <div class="value-sm fw-semibold text-body-emphasis">{{ fmtDateLong(selectedOrder.created_at) }}</div>
                    </div>
                  </div>
                  <div v-if="selectedOrder.expected_delivery_date" class="d-flex justify-content-between border-bottom pb-2">
                    <div>
                      <div class="label-sm">Entrega estimada</div>
                      <div class="value-sm fw-semibold text-body-emphasis">{{ fmtDateOnly(selectedOrder.expected_delivery_date) }}</div>
                    </div>
                  </div>
                  <div v-if="selectedOrder.created_by" class="d-flex justify-content-between">
                    <div>
                      <div class="label-sm">Registrado por</div>
                      <div class="value-sm fw-semibold text-body-emphasis">{{ selectedOrder.created_by?.name ?? 'Cliente Web' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pago -->
            <div class="info-card rounded-4 mb-4 shadow-sm overflow-hidden" v-if="selectedOrder.payments?.length">
              <div class="info-card-header d-flex align-items-center py-3 px-4 bg-light border-bottom">
                <span class="fw-bold text-uppercase tracking-wider" style="font-size: .8rem;">Detalles de Pago</span>
              </div>
              <div class="p-4">
                <div v-for="pmt in selectedOrder.payments" :key="pmt.id" class="d-flex flex-column gap-3">
                  <div class="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span class="label-sm mb-0">Método</span>
                    <span class="value-sm fw-semibold text-body-emphasis">{{ fmtPaymentMethod(pmt.payment_method) }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span class="label-sm mb-0">Monto</span>
                    <span class="fw-bold text-body-emphasis small">Bs. {{ fmtMoney(pmt.amount) }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center border-bottom pb-2">
                    <span class="label-sm mb-0">Estado</span>
                    <span class="badge rounded-pill px-2.5 py-1 sol-smallest border"
                          :class="paymentBadgeCls(pmt.status)">
                      {{ fmtPaymentStatus(pmt.status) }}
                    </span>
                  </div>
                  <div v-if="pmt.paid_at" class="d-flex justify-content-between align-items-center">
                    <span class="label-sm mb-0">Fecha de pago</span>
                    <span class="value-sm fw-semibold text-body-emphasis">{{ fmtDateOnly(pmt.paid_at) }}</span>
                  </div>
                </div>
                <div v-if="!selectedOrder.payments.some(p => p.status === 'completed')" class="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                  <span class="text-danger small fw-bold"><i class="fa-solid fa-triangle-exclamation me-1"></i>Pendiente de cobro</span>
                  <span class="fw-bold fs-6 text-danger">Bs. {{ fmtMoney(selectedOrder.total_amount) }}</span>
                </div>
              </div>
            </div>

            <!-- Historial -->
            <div class="info-card rounded-4 shadow-sm overflow-hidden" v-if="selectedOrder.handlers?.length">
              <div class="info-card-header d-flex align-items-center py-3 px-4 bg-light border-bottom">
                <span class="fw-bold text-uppercase tracking-wider" style="font-size: .8rem;">Historial / Bitácora</span>
              </div>
              <div class="p-4">
                <div class="timeline">
                  <div
                    v-for="(h, idx) in selectedOrder.handlers"
                    :key="h.id"
                    class="timeline-item"
                    :class="{ last: idx === selectedOrder.handlers.length - 1 }"
                  >
                    <div class="timeline-dot bg-primary"></div>
                    <div class="timeline-content">
                      <div class="small fw-bold text-body-emphasis">{{ h.action_taken }}</div>
                      <div class="d-flex gap-2 align-items-center mt-1.5 flex-wrap">
                        <span class="badge rounded-pill bg-light text-muted border sol-smallest" style="font-size: 0.65rem;">{{ h.handler_role }}</span>
                        <span class="text-muted smaller" style="font-size:.72rem;">{{ h.handler_name }}</span>
                      </div>
                      <div v-if="h.notes" class="text-muted fst-italic mt-2 p-2 bg-light border rounded-3 small" style="font-size:.75rem;">
                        "{{ h.notes }}"
                      </div>
                      <div class="text-muted mt-2" style="font-size:.68rem;">
                        <i class="fa-regular fa-clock me-1"></i>{{ fmtDateLong(h.handled_at) }}
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
  pending:       { label: 'Pendiente',     cls: 'badge-sol-pending' },
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
/* ── Botón Volver premium ──────────────────────────────────────── */
.btn-back-circle {
  width: 40px;
  height: 40px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-back-circle:hover {
  color: var(--color-primary);
  background-color: var(--bg-hover);
  transform: translateX(-4px);
  box-shadow: var(--shadow-sm);
}
.btn-back-circle:active {
  transform: scale(0.92) translateX(-4px);
}

/* ── Tarjetas de información premium ───────────────────────────── */
.info-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.25s ease;
}
.info-card:hover {
  box-shadow: var(--shadow-md);
}

.info-card-header {
  background: var(--bs-tertiary-bg);
  border-bottom: 1px solid var(--bs-border-color);
  padding: .8rem 1.25rem;
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
  margin-bottom: 4px;
}

.value-sm {
  font-size: .88rem;
  color: var(--bs-body-color);
  font-weight: 500;
}

/* ── Timeline de historial ─────────────────────────────────────── */
.timeline { position: relative; padding-left: 1.25rem; }
.timeline-item {
  position: relative;
  padding-bottom: 1.5rem;
  padding-left: 1.25rem;
}
.timeline-item:not(.last)::before {
  content: '';
  position: absolute;
  left: 0; top: 10px; bottom: 0;
  width: 1.5px;
  background: var(--border-color);
}
.timeline-dot {
  position: absolute;
  left: -4px; top: 5px;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--color-primary) !important;
  border: 2px solid var(--bg-card);
}
.timeline-content { padding-left: .25rem; }

/* ── Badge especial para Pendiente (Contraste Elevado) ────────── */
.badge-sol-pending {
  background-color: #fffbeb !important;
  color: #78350f !important;
  border: 1px solid #fde68a !important;
}
[data-theme="dark"] .badge-sol-pending,
[data-theme="semidark"] .badge-sol-pending {
  background-color: rgba(217, 119, 6, 0.15) !important;
  color: #fbbf24 !important;
  border-color: rgba(217, 119, 6, 0.3) !important;
}
</style>
