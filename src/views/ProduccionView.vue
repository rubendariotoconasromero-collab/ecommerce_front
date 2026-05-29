<template>
  <div class="animate__animated animate__fadeIn">

    <!-- ── ENCABEZADO ─────────────────────────────────────────────── -->
    <div class="sol-page-header mb-3">
      <div>
        <h2 class="sol-page-title">Producción</h2>
        <p class="sol-page-subtitle">{{ meta.total ?? 0 }} órdenes de producción registradas</p>
      </div>
    </div>

    <!-- ── GRID ──────────────────────────────────────────────────── -->
    <BaseDataGrid
      :items="prodOrders"
      :columns="gridColumns"
      :loading="loading"
      :pagination="paginationObj"
      search-placeholder="Buscar por pedido, producto o trabajador…"
      empty-title="Sin órdenes de producción"
      empty-icon="fa-solid fa-gears"
      empty-description="No hay órdenes que coincidan con los filtros aplicados."
      compact
      @search="handleSearch"
      @page-change="fetchProdOrders"
    >
      <!-- Filtros -->
      <template #filters>
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <BaseFilterSelect
            v-model="filters.status"
            :options="statusOptions"
            width="175px"
            @update:modelValue="fetchProdOrders(1)"
          />
          <button
            class="btn rounded-pill px-3 border"
            :class="filters.unassigned ? 'btn-warning' : 'btn-light'"
            style="height:38px;font-size:.8125rem;font-weight:600;"
            @click="toggleUnassigned"
          >
            <i class="fa-solid fa-user-slash me-1"></i>Sin asignar
          </button>
          <button
            v-if="filters.status !== '' || filters.unassigned"
            type="button"
            class="btn btn-light rounded-pill px-3 border"
            style="height:38px;font-size:.8125rem;font-weight:600;"
            @click="resetFilters"
          >
            <i class="fa-solid fa-xmark me-1"></i>Limpiar
          </button>
        </div>
      </template>

      <!-- Columna: Pedido + Producto -->
      <template #col-order_info="{ item }">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-light text-secondary border d-flex align-items-center justify-content-center rounded-3"
               style="width:40px;height:40px;flex-shrink:0;">
            <i class="fa-solid fa-gears" style="font-size:.9rem;"></i>
          </div>
          <div>
            <div class="fw-bold text-body-emphasis small font-monospace">
              #{{ (item.order_item?.order_id || '').slice(0,8).toUpperCase() }}
            </div>
            <div class="text-body-secondary smaller mt-1">
              {{ item.order_item?.product_name ?? '—' }}
              <span v-if="item.order_item?.customization_notes" class="ms-1 opacity-60">
                · {{ item.order_item.customization_notes }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Columna: Cantidad -->
      <template #col-quantity="{ item }">
        <span class="badge rounded-pill bg-light border text-dark px-3 py-1 sol-fw-800 sol-smallest">
          {{ item.order_item?.quantity ?? '—' }} unid.
        </span>
      </template>

      <!-- Columna: Trabajador -->
      <template #col-worker="{ item }">
        <span v-if="item.worker" class="small fw-semibold text-body-emphasis">
          {{ item.worker.name }}
        </span>
        <span v-else class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest"
              style="background:rgba(245,158,11,.1);color:#d97706;border:1px solid rgba(245,158,11,.2);">
          <i class="fa-solid fa-user-slash me-1"></i>Sin asignar
        </span>
      </template>

      <!-- Columna: Notas -->
      <template #col-internal_notes="{ item }">
        <span class="small text-body-secondary text-truncate d-block" style="max-width:160px;">
          {{ item.internal_notes || '—' }}
        </span>
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
        <template v-if="['queued','in_progress'].includes(item.status)">
          <li>
            <button class="dropdown-item rounded-3 py-2 small" @click="openAssign(item)">
              <i class="fa-solid fa-user-check me-2 text-primary"></i>Asignar trabajador
            </button>
          </li>
          <li><hr class="dropdown-divider mx-2 opacity-50"></li>
        </template>
        <li v-if="item.status === 'queued'">
          <button class="dropdown-item rounded-3 py-2 small" @click="openAction(item, 'start')">
            <i class="fa-solid fa-play me-2 text-info"></i>Iniciar producción
          </button>
        </li>
        <li v-if="item.status === 'in_progress'">
          <button class="dropdown-item rounded-3 py-2 small" @click="openAction(item, 'complete')">
            <i class="fa-solid fa-check me-2 text-success"></i>Completar
          </button>
        </li>
        <li v-if="['queued','in_progress'].includes(item.status)">
          <hr class="dropdown-divider mx-2 opacity-50">
        </li>
        <li v-if="['queued','in_progress'].includes(item.status)">
          <button class="dropdown-item text-danger rounded-3 py-2 small" @click="openAction(item, 'cancel')">
            <i class="fa-solid fa-ban me-2"></i>Cancelar
          </button>
        </li>
      </template>
    </BaseDataGrid>

    <!-- ── MODAL: Acción (iniciar / completar / cancelar) ─────────── -->
    <BaseModal v-model="showActionModal" :title="ACTION_CONFIG[currentAction]?.title" size="md">
      <div class="p-2">
        <div class="p-3 rounded-3 border bg-body-tertiary mb-4">
          <div class="d-flex justify-content-between small mb-2">
            <span class="text-muted">Pedido</span>
            <span class="fw-bold font-monospace">#{{ (selectedProd?.order_item?.order_id || '').slice(0,8).toUpperCase() }}</span>
          </div>
          <div class="d-flex justify-content-between small">
            <span class="text-muted">Producto</span>
            <span class="fw-semibold">{{ selectedProd?.order_item?.product_name }}</span>
          </div>
        </div>
        <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
          Notas internas (opcional)
        </label>
        <textarea v-model="actionNotes" class="form-control sol-textarea" rows="3"
          placeholder="Observaciones del operario…"></textarea>
        <p v-if="currentAction === 'cancel'" class="text-danger smaller mt-2 mb-0">
          <i class="fa-solid fa-triangle-exclamation me-1"></i>
          Si la producción estaba iniciada, el stock se revertirá a "reservado".
        </p>
      </div>
      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showActionModal = false">Cancelar</BaseButton>
          <BaseButton
            :variant="ACTION_CONFIG[currentAction]?.variant ?? 'brand'"
            class="rounded-pill px-5"
            :loading="processing"
            @click="confirmAction"
          >
            {{ ACTION_CONFIG[currentAction]?.confirm }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- ── MODAL: Asignar trabajador ─────────────────────────────── -->
    <BaseModal v-model="showAssignModal" title="Asignar trabajador" size="md">
      <div class="p-2">
        <p class="text-muted small mb-3">
          Producto: <strong class="text-body-emphasis">{{ selectedProd?.order_item?.product_name }}</strong>
        </p>
        <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
          Trabajador
        </label>
        <div v-if="loadingWorkers" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-secondary"></div>
        </div>
        <select v-else v-model="assignWorkerId" class="form-select">
          <option value="">— Sin asignar —</option>
          <option v-for="w in workers" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>
      </div>
      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showAssignModal = false">Cancelar</BaseButton>
          <BaseButton variant="brand" class="rounded-pill px-5 sol-shadow-brand"
            :loading="processing || loadingWorkers" @click="confirmAssign">
            Asignar
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
  queued:      { label: 'En cola',        cls: 'bg-warning-subtle text-warning border-warning-subtle' },
  in_progress: { label: 'En producción',  cls: 'bg-info-subtle text-info border-info-subtle' },
  completed:   { label: 'Completado',     cls: 'bg-success-subtle text-success border-success-subtle' },
  cancelled:   { label: 'Cancelado',      cls: 'bg-danger-subtle text-danger border-danger-subtle' },
};

const ACTION_CONFIG = {
  start:    { title: 'Iniciar producción',           variant: 'brand', confirm: 'Iniciar' },
  complete: { title: 'Completar producción',         variant: 'brand', confirm: 'Completar' },
  cancel:   { title: 'Cancelar orden de producción', variant: 'danger', confirm: 'Cancelar' },
};

const statusOptions = [
  { label: 'Todos los estados',  value: '' },
  { label: 'En cola',            value: 'queued' },
  { label: 'En producción',      value: 'in_progress' },
  { label: 'Completados',        value: 'completed' },
  { label: 'Cancelados',         value: 'cancelled' },
];

const gridColumns = [
  { label: 'PEDIDO / PRODUCTO', key: 'order_info',     width: '35%' },
  { label: 'CANTIDAD',          key: 'quantity',        align: 'center' },
  { label: 'TRABAJADOR',        key: 'worker' },
  { label: 'NOTAS',             key: 'internal_notes' },
  { label: 'ESTADO',            key: 'status' },
  { label: 'FECHA',             key: 'created_at' },
];

const prodOrders   = ref([]);
const meta         = ref({});
const loading      = ref(false);
const filters      = reactive({ status: '', unassigned: false, search: '' });
let debounceTimer  = null;

const selectedProd    = ref(null);
const processing      = ref(false);

const showActionModal = ref(false);
const currentAction   = ref('');
const actionNotes     = ref('');

const showAssignModal = ref(false);
const assignWorkerId  = ref('');
const workers         = ref([]);
const loadingWorkers  = ref(false);

const paginationObj = computed(() => ({
  current_page: meta.value.current_page ?? 1,
  last_page:    meta.value.last_page    ?? 1,
  total:        meta.value.total        ?? 0,
  from:         meta.value.from         ?? 0,
  to:           meta.value.to           ?? 0,
}));

async function fetchProdOrders(page = 1) {
  loading.value = true;
  try {
    const params = { page };
    if (filters.status)     params.status     = filters.status;
    if (filters.unassigned) params.unassigned = 1;
    if (filters.search)     params.search     = filters.search;
    const { data } = await api.get('/production-orders', { params });
    prodOrders.value = data.data;
    meta.value       = data.meta ?? {};
  } finally {
    loading.value = false;
  }
}

function handleSearch(value) {
  filters.search = value;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchProdOrders(1), 450);
}

function toggleUnassigned() {
  filters.unassigned = !filters.unassigned;
  fetchProdOrders(1);
}

function resetFilters() {
  filters.status     = '';
  filters.unassigned = false;
  fetchProdOrders(1);
}

function openAction(prod, action) {
  selectedProd.value    = prod;
  currentAction.value   = action;
  actionNotes.value     = '';
  showActionModal.value = true;
}

async function confirmAction() {
  if (!selectedProd.value) return;
  processing.value = true;
  const p       = selectedProd.value;
  const orderId = p.order_item?.order_id;
  try {
    await api.patch(`/orders/${orderId}/production-orders/${p.id}/${currentAction.value}`,
      { internal_notes: actionNotes.value || null });
    showActionModal.value = false;
    Toast.fire({ icon: 'success', title: 'Acción procesada correctamente' });
    fetchProdOrders(meta.value.current_page ?? 1);
  } catch (e) {
    Toast.fire({ icon: 'error', title: e.response?.data?.message ?? 'Error al procesar la acción.' });
  } finally {
    processing.value = false;
  }
}

async function openAssign(prod) {
  selectedProd.value    = prod;
  assignWorkerId.value  = prod.worker?.id ?? '';
  showAssignModal.value = true;
  if (workers.value.length === 0) {
    loadingWorkers.value = true;
    try {
      const { data } = await api.get('/users', { params: { page: 1 } });
      workers.value = (data.data ?? []).filter(u => u.is_active && !u.deleted_at);
    } catch {
      workers.value = [];
    } finally {
      loadingWorkers.value = false;
    }
  }
}

async function confirmAssign() {
  if (!selectedProd.value) return;
  processing.value = true;
  const p       = selectedProd.value;
  const orderId = p.order_item?.order_id;
  try {
    await api.patch(`/orders/${orderId}/production-orders/${p.id}/assign`,
      { assigned_worker_id: assignWorkerId.value || null });
    showAssignModal.value = false;
    Toast.fire({ icon: 'success', title: 'Trabajador asignado correctamente' });
    fetchProdOrders(meta.value.current_page ?? 1);
  } catch (e) {
    Toast.fire({ icon: 'error', title: e.response?.data?.message ?? 'Error al asignar el trabajador.' });
  } finally {
    processing.value = false;
  }
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

onMounted(() => fetchProdOrders());
</script>
