<template>
  <div class="animate__animated animate__fadeIn">

    <!-- ── ENCABEZADO ─────────────────────────────────────────────── -->
    <div class="sol-page-header mb-3">
      <div>
        <h2 class="sol-page-title">Devoluciones</h2>
        <p class="sol-page-subtitle">{{ meta.total ?? 0 }} solicitudes de devolución registradas</p>
      </div>
    </div>

    <!-- ── GRID ──────────────────────────────────────────────────── -->
    <BaseDataGrid
      :items="returns"
      :columns="gridColumns"
      :loading="loading"
      :pagination="paginationObj"
      search-placeholder="Buscar por referencia de pedido o motivo…"
      empty-title="Sin solicitudes de devolución"
      empty-icon="fa-solid fa-arrow-rotate-left"
      empty-description="No hay devoluciones que coincidan con los filtros aplicados."
      compact
      @search="handleSearch"
      @page-change="fetchReturns"
    >
      <!-- Filtros -->
      <template #filters>
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <BaseFilterSelect
            v-model="filters.status"
            :options="statusOptions"
            width="175px"
            @update:modelValue="fetchReturns(1)"
          />
          <BaseFilterSelect
            v-model="filters.return_type"
            :options="typeOptions"
            width="185px"
            @update:modelValue="fetchReturns(1)"
          />
          <input
            v-model="filters.from"
            type="date"
            class="form-control form-control-sm border rounded-pill px-3"
            style="height:38px;width:155px;font-size:.8125rem;"
            @change="fetchReturns(1)"
          >
          <input
            v-model="filters.to"
            type="date"
            class="form-control form-control-sm border rounded-pill px-3"
            style="height:38px;width:155px;font-size:.8125rem;"
            @change="fetchReturns(1)"
          >
          <button
            v-if="filters.status !== '' || filters.return_type || filters.from || filters.to"
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
            <i class="fa-solid fa-arrow-rotate-left" style="font-size:.9rem;"></i>
          </div>
          <div>
            <div class="fw-bold text-body-emphasis small font-monospace">
              #{{ (item.order_id || item.order?.id || '').slice(0,8).toUpperCase() }}
            </div>
            <div class="mt-1">
              <span class="badge rounded-pill px-2 py-1 sol-smallest sol-fw-800 border"
                    :class="item.return_type === 'full'
                      ? 'bg-dark text-white border-dark'
                      : 'bg-light text-dark border'">
                {{ item.return_type === 'full' ? 'Total' : 'Parcial' }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Columna: Producto -->
      <template #col-product="{ item }">
        <span class="small text-body-secondary">
          {{ item.order_item?.product_name ?? (item.return_type === 'full' ? 'Todos los ítems' : '—') }}
        </span>
      </template>

      <!-- Columna: Motivo -->
      <template #col-reason="{ item }">
        <span class="small text-body-secondary text-truncate d-block" style="max-width:180px;">
          {{ item.reason || '—' }}
        </span>
      </template>

      <!-- Columna: Reembolso -->
      <template #col-refund_amount="{ item }">
        <span v-if="item.refund_amount" class="fw-bold small text-body-emphasis">
          Bs. {{ fmtMoney(item.refund_amount) }}
        </span>
        <span v-else class="text-body-secondary small">—</span>
      </template>

      <!-- Columna: Estado -->
      <template #col-status="{ item }">
        <span class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest border"
              :class="STATUS_CONFIG[item.status]?.cls ?? 'bg-secondary-subtle text-secondary border-secondary-subtle'">
          {{ STATUS_CONFIG[item.status]?.label ?? item.status }}
        </span>
      </template>

      <!-- Columna: Fecha -->
      <template #col-request_at="{ item }">
        <span class="small text-body-secondary">{{ fmtDate(item.request_at) }}</span>
      </template>

      <!-- Acciones -->
      <template #item-actions="{ item }">
        <template v-if="item.status === 'requested'">
          <li>
            <button class="dropdown-item rounded-3 py-2 small" @click="openModal(item, 'approve')">
              <i class="fa-solid fa-check me-2 text-success"></i>Aprobar
            </button>
          </li>
          <li><hr class="dropdown-divider mx-2 opacity-50"></li>
          <li>
            <button class="dropdown-item text-danger rounded-3 py-2 small" @click="openModal(item, 'reject')">
              <i class="fa-solid fa-ban me-2"></i>Rechazar
            </button>
          </li>
        </template>
        <li v-if="item.status === 'approved'">
          <button class="dropdown-item rounded-3 py-2 small" @click="openModal(item, 'resolve')">
            <i class="fa-solid fa-check-double me-2 text-primary"></i>Marcar resuelta
          </button>
        </li>
      </template>
    </BaseDataGrid>

    <!-- ── MODAL: Acción de devolución ───────────────────────────── -->
    <BaseModal v-model="showModal" :title="MODAL_CONFIG[currentAction]?.title" size="md">
      <div class="p-2">
        <!-- Contexto -->
        <div class="p-3 rounded-3 border bg-body-tertiary mb-4">
          <div class="d-flex justify-content-between small mb-2">
            <span class="text-muted">Pedido</span>
            <span class="fw-bold font-monospace">#{{ (selectedReturn?.order_id || '').slice(0,8).toUpperCase() }}</span>
          </div>
          <div class="d-flex justify-content-between small mb-2">
            <span class="text-muted">Tipo</span>
            <span>{{ selectedReturn?.return_type === 'full' ? 'Devolución total' : 'Devolución parcial' }}</span>
          </div>
          <div v-if="selectedReturn?.reason" class="d-flex justify-content-between small">
            <span class="text-muted">Motivo</span>
            <span class="text-end" style="max-width:220px;">{{ selectedReturn.reason }}</span>
          </div>
        </div>

        <!-- Monto a reembolsar (solo en aprobar) -->
        <div v-if="currentAction === 'approve'" class="mb-4">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
            Monto a reembolsar (opcional)
          </label>
          <div class="input-group">
            <span class="input-group-text rounded-start-3">Bs.</span>
            <input v-model="form.refund_amount" type="number" step="0.01" min="0"
              class="form-control rounded-end-3" placeholder="0.00">
          </div>
        </div>

        <!-- Notas -->
        <div>
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
            Notas {{ currentAction === 'reject' ? '(requerido: motivo de rechazo)' : '(opcional)' }}
          </label>
          <textarea v-model="form.notes" class="form-control sol-textarea" rows="3"
            :placeholder="currentAction === 'reject'
              ? 'Explica el motivo del rechazo…'
              : 'Observaciones adicionales…'">
          </textarea>
        </div>
      </div>
      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton
            :variant="MODAL_CONFIG[currentAction]?.variant ?? 'brand'"
            class="rounded-pill px-5"
            :loading="processing"
            @click="confirmAction"
          >
            {{ MODAL_CONFIG[currentAction]?.confirm }}
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
  requested: { label: 'Solicitada', cls: 'bg-warning-subtle text-warning border-warning-subtle' },
  approved:  { label: 'Aprobada',   cls: 'bg-info-subtle text-info border-info-subtle' },
  rejected:  { label: 'Rechazada',  cls: 'bg-danger-subtle text-danger border-danger-subtle' },
  resolved:  { label: 'Resuelta',   cls: 'bg-success-subtle text-success border-success-subtle' },
};

const MODAL_CONFIG = {
  approve: { title: 'Aprobar devolución',  variant: 'brand',   confirm: 'Aprobar' },
  reject:  { title: 'Rechazar devolución', variant: 'danger',  confirm: 'Rechazar' },
  resolve: { title: 'Resolver devolución', variant: 'brand',   confirm: 'Marcar resuelta' },
};

const statusOptions = [
  { label: 'Todos los estados', value: '' },
  { label: 'Solicitadas',       value: 'requested' },
  { label: 'Aprobadas',         value: 'approved' },
  { label: 'Rechazadas',        value: 'rejected' },
  { label: 'Resueltas',         value: 'resolved' },
];

const typeOptions = [
  { label: 'Todos los tipos',    value: '' },
  { label: 'Devolución total',   value: 'full' },
  { label: 'Devolución parcial', value: 'partial' },
];

const gridColumns = [
  { label: 'PEDIDO / TIPO',  key: 'order_info',    width: '25%' },
  { label: 'PRODUCTO',       key: 'product' },
  { label: 'MOTIVO',         key: 'reason' },
  { label: 'REEMBOLSO',      key: 'refund_amount', align: 'end' },
  { label: 'ESTADO',         key: 'status' },
  { label: 'FECHA',          key: 'request_at' },
];

const returns        = ref([]);
const meta           = ref({});
const loading        = ref(false);
const filters        = reactive({ status: 'requested', return_type: '', from: '', to: '', search: '' });
let debounceTimer    = null;

const showModal      = ref(false);
const selectedReturn = ref(null);
const currentAction  = ref('');
const form           = reactive({ refund_amount: '', notes: '' });
const processing     = ref(false);

const paginationObj = computed(() => ({
  current_page: meta.value.current_page ?? 1,
  last_page:    meta.value.last_page    ?? 1,
  total:        meta.value.total        ?? 0,
  from:         meta.value.from         ?? 0,
  to:           meta.value.to           ?? 0,
}));

async function fetchReturns(page = 1) {
  loading.value = true;
  try {
    const params = { page };
    if (filters.status)      params.status      = filters.status;
    if (filters.return_type) params.return_type = filters.return_type;
    if (filters.from)        params.from        = filters.from;
    if (filters.to)          params.to          = filters.to;
    if (filters.search)      params.search      = filters.search;
    const { data } = await api.get('/returns', { params });
    returns.value = data.data;
    meta.value    = data.meta ?? {};
  } finally {
    loading.value = false;
  }
}

function handleSearch(value) {
  filters.search = value;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchReturns(1), 450);
}

function clearFilters() {
  Object.assign(filters, { status: '', return_type: '', from: '', to: '', search: '' });
  fetchReturns(1);
}

function openModal(ret, action) {
  selectedReturn.value = ret;
  currentAction.value  = action;
  form.refund_amount   = ret.refund_amount ?? '';
  form.notes           = '';
  showModal.value      = true;
}

async function confirmAction() {
  if (!selectedReturn.value) return;
  processing.value = true;
  const r       = selectedReturn.value;
  const orderId = r.order_id ?? r.order?.id;
  const body    = { notes: form.notes || null };
  if (currentAction.value === 'approve' && form.refund_amount) {
    body.refund_amount = parseFloat(form.refund_amount);
  }
  try {
    await api.patch(`/orders/${orderId}/returns/${r.id}/${currentAction.value}`, body);
    showModal.value = false;
    Toast.fire({ icon: 'success', title: 'Acción procesada correctamente' });
    fetchReturns(meta.value.current_page ?? 1);
  } catch (e) {
    Toast.fire({ icon: 'error', title: e.response?.data?.message ?? 'Error al procesar la acción.' });
  } finally {
    processing.value = false;
  }
}

function fmtMoney(val) {
  return Number(val ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

onMounted(() => fetchReturns());
</script>
