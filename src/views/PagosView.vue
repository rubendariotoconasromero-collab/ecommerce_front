<template>
  <div class="animate__animated animate__fadeIn">

    <!-- ── ENCABEZADO ─────────────────────────────────────────────── -->
    <div class="sol-page-header mb-3">
      <div>
        <h2 class="sol-page-title">Gestión de Pagos</h2>
        <p class="sol-page-subtitle">{{ meta.total ?? 0 }} pagos registrados en el sistema</p>
      </div>
    </div>

    <!-- ── GRID ──────────────────────────────────────────────────── -->
    <BaseDataGrid
      :items="payments"
      :columns="gridColumns"
      :loading="loading"
      :pagination="paginationObj"
      search-placeholder="Buscar por referencia de pedido…"
      empty-title="Sin pagos registrados"
      empty-icon="fa-solid fa-credit-card"
      empty-description="No hay pagos que coincidan con los filtros aplicados."
      compact
      @search="handleSearch"
      @page-change="fetchPayments"
    >
      <!-- Filtros -->
      <template #filters>
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <BaseFilterSelect
            v-model="filters.status"
            :options="statusOptions"
            width="175px"
            @update:modelValue="fetchPayments(1)"
          />
          <BaseFilterSelect
            v-model="filters.method"
            :options="methodOptions"
            width="210px"
            @update:modelValue="fetchPayments(1)"
          />
          <input
            v-model="filters.from"
            type="date"
            class="form-control form-control-sm border rounded-pill px-3"
            style="height:38px;width:155px;font-size:.8125rem;"
            @change="fetchPayments(1)"
          >
          <input
            v-model="filters.to"
            type="date"
            class="form-control form-control-sm border rounded-pill px-3"
            style="height:38px;width:155px;font-size:.8125rem;"
            @change="fetchPayments(1)"
          >
          <button
            v-if="filters.status !== '' || filters.method || filters.from || filters.to"
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
            <i class="fa-solid fa-receipt" style="font-size:.9rem;"></i>
          </div>
          <div>
            <div class="fw-bold text-body-emphasis small font-monospace">
              #{{ (item.order_id || item.order?.id || '').slice(0,8).toUpperCase() }}
            </div>
            <div class="mt-1" v-if="item.order?.status">
              <span class="badge rounded-pill px-2 py-1 sol-smallest sol-fw-800 border"
                    :class="ORDER_CLS[item.order.status] ?? 'bg-secondary-subtle text-secondary border-secondary-subtle'">
                {{ ORDER_LABEL[item.order.status] ?? item.order.status }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- Columna: Método -->
      <template #col-payment_method="{ item }">
        <span class="small text-body-secondary">{{ METHOD_LABEL[item.payment_method] ?? item.payment_method }}</span>
      </template>

      <!-- Columna: Monto -->
      <template #col-amount="{ item }">
        <span class="fw-bold small text-body-emphasis">Bs. {{ fmtMoney(item.amount) }}</span>
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
        <li v-if="item.status === 'pending'">
          <button class="dropdown-item rounded-3 py-2 small" @click="openAction(item, 'complete')">
            <i class="fa-solid fa-check me-2 text-success"></i>Confirmar pago
          </button>
        </li>
        <li v-if="item.status === 'completed'">
          <button class="dropdown-item rounded-3 py-2 small" @click="openAction(item, 'refund')">
            <i class="fa-solid fa-rotate-left me-2 text-warning"></i>Reembolsar
          </button>
        </li>
        <li v-if="item.status === 'pending'">
          <hr class="dropdown-divider mx-2 opacity-50">
          <button class="dropdown-item text-danger rounded-3 py-2 small" @click="openAction(item, 'fail')">
            <i class="fa-solid fa-circle-xmark me-2"></i>Marcar fallido
          </button>
        </li>
      </template>
    </BaseDataGrid>

    <!-- ── MODAL: Acción de pago ─────────────────────────────────── -->
    <BaseModal v-model="showModal" :title="ACTION_CONFIG[currentAction]?.title" size="md">
      <div class="p-2">
        <div class="p-3 rounded-3 border bg-body-tertiary mb-4">
          <div class="d-flex justify-content-between small mb-2">
            <span class="text-muted">Pedido</span>
            <span class="fw-bold font-monospace">#{{ (selectedPayment?.order_id || '').slice(0,8).toUpperCase() }}</span>
          </div>
          <div class="d-flex justify-content-between small mb-2">
            <span class="text-muted">Monto</span>
            <span class="fw-bold">Bs. {{ fmtMoney(selectedPayment?.amount) }}</span>
          </div>
          <div class="d-flex justify-content-between small">
            <span class="text-muted">Método</span>
            <span>{{ METHOD_LABEL[selectedPayment?.payment_method] ?? selectedPayment?.payment_method }}</span>
          </div>
        </div>

        <div v-if="currentAction === 'refund'">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
            Notas del reembolso
          </label>
          <textarea v-model="actionNotes" class="form-control sol-textarea" rows="3"
            placeholder="Motivo del reembolso…"></textarea>
        </div>
        <p v-else class="text-muted small mb-0">{{ ACTION_CONFIG[currentAction]?.description }}</p>
      </div>
      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton
            :variant="ACTION_CONFIG[currentAction]?.variant ?? 'brand'"
            class="rounded-pill px-5"
            :loading="processing"
            @click="confirmAction"
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

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',   cls: 'bg-warning-subtle text-warning border-warning-subtle' },
  completed: { label: 'Pagado',      cls: 'bg-success-subtle text-success border-success-subtle' },
  failed:    { label: 'Fallido',     cls: 'bg-danger-subtle text-danger border-danger-subtle' },
  refunded:  { label: 'Reembolsado', cls: 'bg-secondary-subtle text-secondary border-secondary-subtle' },
};

const ACTION_CONFIG = {
  complete: { title: 'Confirmar cobro',    description: '¿Confirmas que el pago fue recibido?', variant: 'brand' },
  fail:     { title: 'Marcar como fallido', description: 'El pago será marcado como no recibido.', variant: 'danger' },
  refund:   { title: 'Reembolsar pago',    description: '', variant: 'warning' },
};

const ORDER_CLS = {
  pending:       'bg-warning-subtle text-warning border-warning-subtle',
  confirmed:     'bg-primary-subtle text-primary border-primary-subtle',
  in_production: 'bg-info-subtle text-info border-info-subtle',
  ready:         'bg-success-subtle text-success border-success-subtle',
  shipped:       'bg-dark text-white border-dark',
  delivered:     'bg-success-subtle text-success border-success-subtle',
  cancelled:     'bg-danger-subtle text-danger border-danger-subtle',
  returned:      'bg-secondary-subtle text-secondary border-secondary-subtle',
};
const ORDER_LABEL = {
  pending: 'Pendiente', confirmed: 'Confirmado', in_production: 'En Producción',
  ready: 'Listo', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado', returned: 'Devuelto',
};

const METHODS = [
  { key: 'efectivo',               label: 'Efectivo / Contraentrega' },
  { key: 'transferencia_bancaria', label: 'Transferencia bancaria' },
  { key: 'tarjeta_debito',         label: 'Tarjeta débito' },
  { key: 'tarjeta_credito',        label: 'Tarjeta crédito' },
  { key: 'cheque',                 label: 'Cheque' },
  { key: 'mercadopago',            label: 'MercadoPago' },
  { key: 'otro',                   label: 'Otro' },
];
const METHOD_LABEL  = Object.fromEntries(METHODS.map(m => [m.key, m.label]));
const methodOptions = [
  { label: 'Todos los métodos', value: '' },
  ...METHODS.map(m => ({ label: m.label, value: m.key }))
];
const statusOptions = [
  { label: 'Todos los estados', value: '' },
  { label: 'Pendientes',        value: 'pending' },
  { label: 'Completados',       value: 'completed' },
  { label: 'Fallidos',          value: 'failed' },
  { label: 'Reembolsados',      value: 'refunded' },
];

const gridColumns = [
  { label: 'PEDIDO',  key: 'order_info',      width: '28%' },
  { label: 'MÉTODO',  key: 'payment_method' },
  { label: 'MONTO',   key: 'amount',          align: 'end' },
  { label: 'ESTADO',  key: 'status' },
  { label: 'FECHA',   key: 'created_at' },
];

const payments        = ref([]);
const meta            = ref({});
const loading         = ref(false);
const filters         = reactive({ status: 'pending', method: '', from: '', to: '', search: '' });
let debounceTimer     = null;

const showModal       = ref(false);
const selectedPayment = ref(null);
const currentAction   = ref('');
const actionNotes     = ref('');
const processing      = ref(false);

const paginationObj = computed(() => ({
  current_page: meta.value.current_page ?? 1,
  last_page:    meta.value.last_page    ?? 1,
  total:        meta.value.total        ?? 0,
  from:         meta.value.from         ?? 0,
  to:           meta.value.to           ?? 0,
}));

async function fetchPayments(page = 1) {
  loading.value = true;
  try {
    const params = { page };
    if (filters.status) params.status         = filters.status;
    if (filters.method) params.payment_method = filters.method;
    if (filters.from)   params.from           = filters.from;
    if (filters.to)     params.to             = filters.to;
    if (filters.search) params.search         = filters.search;
    const { data } = await api.get('/payments', { params });
    payments.value = data.data;
    meta.value     = data.meta ?? {};
  } finally {
    loading.value = false;
  }
}

function handleSearch(value) {
  filters.search = value;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchPayments(1), 450);
}

function clearFilters() {
  Object.assign(filters, { status: '', method: '', from: '', to: '', search: '' });
  fetchPayments(1);
}

function openAction(payment, action) {
  selectedPayment.value = payment;
  currentAction.value   = action;
  actionNotes.value     = '';
  showModal.value       = true;
}

async function confirmAction() {
  if (!selectedPayment.value) return;
  processing.value = true;
  const p       = selectedPayment.value;
  const orderId = p.order_id ?? p.order?.id;
  try {
    const body = currentAction.value === 'refund' ? { notes: actionNotes.value || null } : {};
    await api.patch(`/orders/${orderId}/payments/${p.id}/${currentAction.value}`, body);
    showModal.value = false;
    Toast.fire({ icon: 'success', title: 'Acción procesada correctamente' });
    fetchPayments(meta.value.current_page ?? 1);
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

onMounted(() => fetchPayments());
</script>
