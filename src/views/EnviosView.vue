<template>
  <div class="animate__animated animate__fadeIn">

    <!-- ── ENCABEZADO ─────────────────────────────────────────────── -->
    <div class="sol-page-header mb-3">
      <div>
        <h2 class="sol-page-title">Envíos y Logística</h2>
        <p class="sol-page-subtitle">{{ meta.total ?? 0 }} envíos registrados en el sistema</p>
      </div>
    </div>

    <!-- ── GRID ──────────────────────────────────────────────────── -->
    <BaseDataGrid
      :items="shipments"
      :columns="gridColumns"
      :loading="loading"
      :pagination="paginationObj"
      search-placeholder="Buscar por pedido, tracking o mensajero…"
      empty-title="Sin envíos registrados"
      empty-icon="fa-solid fa-truck"
      empty-description="No hay envíos que coincidan con los filtros aplicados."
      compact
      @search="handleSearch"
      @page-change="fetchShipments"
    >
      <!-- Filtros -->
      <template #filters>
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <BaseFilterSelect
            v-model="filters.status"
            :options="statusOptions"
            width="175px"
            @update:modelValue="fetchShipments(1)"
          />
          <input
            v-model="filters.from"
            type="date"
            class="form-control form-control-sm border rounded-pill px-3"
            style="height:38px;width:160px;font-size:.8125rem;"
            @change="fetchShipments(1)"
          >
          <input
            v-model="filters.to"
            type="date"
            class="form-control form-control-sm border rounded-pill px-3"
            style="height:38px;width:160px;font-size:.8125rem;"
            @change="fetchShipments(1)"
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

      <!-- Columna: Pedido -->
      <template #col-order_info="{ item }">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-light text-secondary border d-flex align-items-center justify-content-center rounded-3"
               style="width:40px;height:40px;flex-shrink:0;">
            <i class="fa-solid fa-truck" style="font-size:.9rem;"></i>
          </div>
          <div>
            <div class="fw-bold text-body-emphasis small font-monospace">
              #{{ (item.order_id || item.order?.id || '').slice(0,8).toUpperCase() }}
            </div>
            <div class="text-body-secondary smaller mt-1 text-truncate" style="max-width:180px;">
              {{ item.order?.shipping_address ?? '—' }}
            </div>
          </div>
        </div>
      </template>

      <!-- Columna: Tracking -->
      <template #col-tracking_number="{ item }">
        <span v-if="item.tracking_number" class="font-monospace small text-body-emphasis fw-semibold">
          {{ item.tracking_number }}
        </span>
        <span v-else class="text-body-secondary small">Sin tracking</span>
      </template>

      <!-- Columna: Mensajero -->
      <template #col-courier_name="{ item }">
        <span class="small text-body-secondary">{{ item.courier_name ?? '—' }}</span>
      </template>

      <!-- Columna: Responsable -->
      <template #col-handler="{ item }">
        <span class="small text-body-secondary">{{ item.handler?.name ?? '—' }}</span>
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
        <li v-if="item.status === 'preparing'">
          <button class="dropdown-item rounded-3 py-2 small" @click="openDispatch(item)">
            <i class="fa-solid fa-truck me-2 text-primary"></i>Despachar
          </button>
        </li>
        <li v-if="item.status === 'shipped'">
          <button class="dropdown-item rounded-3 py-2 small" @click="quickAction(item, 'in-transit')">
            <i class="fa-solid fa-arrow-right me-2 text-info"></i>Marcar en tránsito
          </button>
        </li>
        <li v-if="['shipped','in_transit'].includes(item.status)">
          <button class="dropdown-item rounded-3 py-2 small" @click="quickAction(item, 'deliver')">
            <i class="fa-solid fa-check-double me-2 text-success"></i>Confirmar entrega
          </button>
        </li>
        <li v-if="['preparing','shipped','in_transit'].includes(item.status)">
          <hr class="dropdown-divider mx-2 opacity-50">
          <button class="dropdown-item text-danger rounded-3 py-2 small" @click="openFail(item)">
            <i class="fa-solid fa-circle-xmark me-2"></i>Marcar fallido
          </button>
        </li>
      </template>
    </BaseDataGrid>

    <!-- ── MODAL: Despachar ──────────────────────────────────────── -->
    <BaseModal v-model="showDispatchModal" title="Despachar envío" size="md">
      <div class="p-2 row g-3">
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
            Número de tracking
          </label>
          <input v-model="dispatchForm.tracking_number" type="text" class="form-control"
            placeholder="TRK-001234">
        </div>
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
            Mensajero / empresa de transporte
          </label>
          <input v-model="dispatchForm.courier_name" type="text" class="form-control"
            placeholder="Ej: DHL, Rapi, reparto propio…">
        </div>
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
            Notas de entrega
          </label>
          <textarea v-model="dispatchForm.notes" class="form-control sol-textarea" rows="3"
            placeholder="Instrucciones de entrega…"></textarea>
        </div>
      </div>
      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showDispatchModal = false">Cancelar</BaseButton>
          <BaseButton variant="brand" class="rounded-pill px-5 sol-shadow-brand"
            :loading="processing" @click="confirmDispatch">
            Despachar
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- ── MODAL: Marcar fallido ─────────────────────────────────── -->
    <BaseModal v-model="showFailModal" title="Marcar envío como fallido" size="md">
      <div class="p-2">
        <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
          Motivo del fallo <span class="text-danger">*</span>
        </label>
        <textarea v-model="failReason" class="form-control sol-textarea" rows="3"
          :class="{ 'is-invalid': failError }"
          placeholder="Cliente no encontrado, dirección incorrecta…"></textarea>
        <div v-if="failError" class="invalid-feedback">{{ failError }}</div>
        <div class="p-3 rounded-3 bg-body-tertiary border mt-3">
          <p class="text-muted smaller mb-0">
            <i class="fa-solid fa-circle-info me-1"></i>
            El estado del pedido permanecerá en "Enviado". Puedes crear un nuevo envío para reintentar.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showFailModal = false">Cancelar</BaseButton>
          <BaseButton variant="danger" class="rounded-pill px-5"
            :loading="processing" @click="confirmFail">
            Marcar fallido
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

const STATUS_CONFIG = {
  preparing:  { label: 'Preparando',  cls: 'bg-warning-subtle text-warning border-warning-subtle' },
  shipped:    { label: 'Despachado',  cls: 'bg-dark text-white border-dark' },
  in_transit: { label: 'En Tránsito', cls: 'bg-info-subtle text-info border-info-subtle' },
  delivered:  { label: 'Entregado',   cls: 'bg-success-subtle text-success border-success-subtle' },
  failed:     { label: 'Fallido',     cls: 'bg-danger-subtle text-danger border-danger-subtle' },
};

const statusOptions = [
  { label: 'Todos los estados', value: '' },
  { label: 'Preparando',        value: 'preparing' },
  { label: 'Despachados',       value: 'shipped' },
  { label: 'En Tránsito',       value: 'in_transit' },
  { label: 'Entregados',        value: 'delivered' },
  { label: 'Fallidos',          value: 'failed' },
];

const gridColumns = [
  { label: 'PEDIDO / DIRECCIÓN', key: 'order_info',       width: '30%' },
  { label: 'TRACKING',           key: 'tracking_number' },
  { label: 'MENSAJERO',          key: 'courier_name' },
  { label: 'RESPONSABLE',        key: 'handler' },
  { label: 'ESTADO',             key: 'status' },
  { label: 'FECHA',              key: 'created_at' },
];

const shipments        = ref([]);
const meta             = ref({});
const loading          = ref(false);
const filters          = reactive({ status: '', from: '', to: '', search: '' });
let debounceTimer      = null;

const selectedShipment  = ref(null);
const processing        = ref(false);

const showDispatchModal = ref(false);
const dispatchForm      = reactive({ tracking_number: '', courier_name: '', notes: '' });

const showFailModal = ref(false);
const failReason    = ref('');
const failError     = ref('');

const paginationObj = computed(() => ({
  current_page: meta.value.current_page ?? 1,
  last_page:    meta.value.last_page    ?? 1,
  total:        meta.value.total        ?? 0,
  from:         meta.value.from         ?? 0,
  to:           meta.value.to           ?? 0,
}));

async function fetchShipments(page = 1) {
  loading.value = true;
  try {
    const params = { page };
    if (filters.status) params.status       = filters.status;
    if (filters.search) params.courier_name = filters.search;
    if (filters.from)   params.from         = filters.from;
    if (filters.to)     params.to           = filters.to;
    const { data } = await api.get('/shipments', { params });
    shipments.value = data.data;
    meta.value      = data.meta ?? {};
  } finally {
    loading.value = false;
  }
}

function handleSearch(value) {
  filters.search = value;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchShipments(1), 450);
}

function clearFilters() {
  filters.status = ''; filters.from = ''; filters.to = ''; filters.search = '';
  fetchShipments(1);
}

async function quickAction(shipment, action) {
  processing.value = true;
  const orderId = shipment.order_id ?? shipment.order?.id;
  try {
    await api.patch(`/orders/${orderId}/shipments/${shipment.id}/${action}`, {});
    Toast.fire({ icon: 'success', title: 'Estado actualizado correctamente' });
    fetchShipments(meta.value.current_page ?? 1);
  } catch (e) {
    Toast.fire({ icon: 'error', title: e.response?.data?.message ?? 'Error al procesar el envío.' });
  } finally {
    processing.value = false;
  }
}

function openDispatch(shipment) {
  selectedShipment.value       = shipment;
  dispatchForm.tracking_number = shipment.tracking_number ?? '';
  dispatchForm.courier_name    = shipment.courier_name ?? '';
  dispatchForm.notes           = '';
  showDispatchModal.value      = true;
}

async function confirmDispatch() {
  if (!selectedShipment.value) return;
  processing.value = true;
  const s       = selectedShipment.value;
  const orderId = s.order_id ?? s.order?.id;
  try {
    await api.patch(`/orders/${orderId}/shipments/${s.id}/dispatch`, {
      tracking_number: dispatchForm.tracking_number || null,
      courier_name:    dispatchForm.courier_name    || null,
      notes:           dispatchForm.notes           || null,
    });
    showDispatchModal.value = false;
    Toast.fire({ icon: 'success', title: 'Envío despachado correctamente' });
    fetchShipments(meta.value.current_page ?? 1);
  } catch (e) {
    Toast.fire({ icon: 'error', title: e.response?.data?.message ?? 'Error al despachar el envío.' });
  } finally {
    processing.value = false;
  }
}

function openFail(shipment) {
  selectedShipment.value = shipment;
  failReason.value       = '';
  failError.value        = '';
  showFailModal.value    = true;
}

async function confirmFail() {
  failError.value = '';
  if (!failReason.value.trim()) { failError.value = 'El motivo del fallo es obligatorio.'; return; }
  processing.value = true;
  const s       = selectedShipment.value;
  const orderId = s.order_id ?? s.order?.id;
  try {
    await api.patch(`/orders/${orderId}/shipments/${s.id}/fail`,
      { failure_reason: failReason.value.trim() });
    showFailModal.value = false;
    Toast.fire({ icon: 'success', title: 'Envío marcado como fallido' });
    fetchShipments(meta.value.current_page ?? 1);
  } catch (e) {
    Toast.fire({ icon: 'error', title: e.response?.data?.message ?? 'Error al marcar el envío como fallido.' });
  } finally {
    processing.value = false;
  }
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

onMounted(() => fetchShipments());
</script>
