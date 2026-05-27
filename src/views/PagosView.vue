<template>
  <div>
    <!-- ── HEADER ─────────────────────────────────────────────────── -->
    <div class="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h4 class="fw-bold mb-1 text-body-emphasis">Gestión de Pagos</h4>
        <p class="text-muted small mb-0">{{ meta.total ?? 0 }} pagos registrados</p>
      </div>
    </div>

    <!-- ── STATUS TABS ───────────────────────────────────────────── -->
    <div class="d-flex gap-2 flex-wrap mb-3 pb-3 border-bottom">
      <button
        v-for="tab in STATUS_TABS" :key="tab.key"
        class="btn btn-sm px-3 rounded-0"
        :class="filters.status === tab.key ? 'btn-dark' : 'btn-outline-secondary'"
        @click="setFilter('status', tab.key)"
      >{{ tab.label }}</button>
    </div>

    <!-- ── FILTERS ───────────────────────────────────────────────── -->
    <div class="row g-2 mb-4">
      <div class="col-md-3">
        <select v-model="filters.method" class="form-select form-select-sm rounded-0" @change="fetchPayments(1)">
          <option value="">Todos los métodos</option>
          <option v-for="m in METHODS" :key="m.key" :value="m.key">{{ m.label }}</option>
        </select>
      </div>
      <div class="col-md-3">
        <input v-model="filters.from" type="date" class="form-control form-control-sm rounded-0" @change="fetchPayments(1)">
      </div>
      <div class="col-md-3">
        <input v-model="filters.to" type="date" class="form-control form-control-sm rounded-0" @change="fetchPayments(1)">
      </div>
      <div class="col-md-1">
        <button @click="clearFilters" class="btn btn-sm btn-outline-secondary rounded-0 w-100" title="Limpiar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>

    <!-- ── TABLE ─────────────────────────────────────────────────── -->
    <div class="card border shadow-sm rounded-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="border-bottom bg-body-tertiary">
            <tr>
              <th class="ps-4 py-3 fw-semibold small text-muted text-uppercase">Pedido</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Método</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase text-end">Monto</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Estado</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Fecha</th>
              <th class="pe-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="n in 8" :key="n">
                <td class="ps-4"><div class="skel w-75"></div></td>
                <td><div class="skel w-100"></div></td>
                <td class="text-end"><div class="skel ms-auto" style="width:70px"></div></td>
                <td><div class="skel" style="width:80px"></div></td>
                <td><div class="skel w-75"></div></td>
                <td></td>
              </tr>
            </template>
            <tr v-else-if="payments.length === 0">
              <td colspan="6" class="text-center py-5">
                <i class="bi bi-credit-card text-muted d-block mb-2" style="font-size:2.5rem;opacity:.3"></i>
                <p class="text-muted small mb-0">No hay pagos que coincidan con los filtros</p>
              </td>
            </tr>
            <tr v-else v-for="p in payments" :key="p.id">
              <td class="ps-4">
                <span class="fw-bold font-monospace small">#{{ (p.order_id || p.order?.id || '').slice(0,8).toUpperCase() }}</span>
                <div v-if="p.order?.status" class="mt-1">
                  <span class="badge rounded-0 px-1" style="font-size:.65rem" :class="ORDER_BADGE[p.order.status] ?? 'bg-secondary'">
                    {{ ORDER_LABEL[p.order.status] ?? p.order.status }}
                  </span>
                </div>
              </td>
              <td class="small">{{ METHOD_LABEL[p.payment_method] ?? p.payment_method }}</td>
              <td class="text-end fw-bold small">Bs. {{ fmtMoney(p.amount) }}</td>
              <td>
                <span class="badge rounded-0 px-2 py-1" :class="STATUS_CONFIG[p.status]?.badge ?? 'bg-secondary'">
                  {{ STATUS_CONFIG[p.status]?.label ?? p.status }}
                </span>
              </td>
              <td class="text-muted small">{{ fmtDate(p.created_at) }}</td>
              <td class="pe-4">
                <div class="d-flex gap-1 justify-content-end">
                  <button v-if="p.status === 'pending'" @click="openAction(p, 'complete')"
                    class="btn btn-sm btn-success rounded-0 px-2" title="Confirmar pago">
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <button v-if="p.status === 'pending'" @click="openAction(p, 'fail')"
                    class="btn btn-sm btn-outline-danger rounded-0 px-2" title="Marcar fallido">
                    <i class="bi bi-x-lg"></i>
                  </button>
                  <button v-if="p.status === 'completed'" @click="openAction(p, 'refund')"
                    class="btn btn-sm btn-outline-warning rounded-0 px-2" title="Reembolsar">
                    <i class="bi bi-arrow-counterclockwise"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div v-if="meta.last_page > 1" class="d-flex justify-content-between align-items-center px-4 py-3 border-top">
        <span class="text-muted small">Página {{ meta.current_page }} de {{ meta.last_page }} · {{ meta.total }} pagos</span>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary rounded-0" :disabled="meta.current_page <= 1" @click="fetchPayments(meta.current_page - 1)"><i class="bi bi-chevron-left"></i></button>
          <button class="btn btn-sm btn-outline-secondary rounded-0" :disabled="meta.current_page >= meta.last_page" @click="fetchPayments(meta.current_page + 1)"><i class="bi bi-chevron-right"></i></button>
        </div>
      </div>
    </div>

    <!-- ── ACTION MODAL ──────────────────────────────────────────── -->
    <div v-if="showModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,.4)">
      <div class="modal-dialog modal-dialog-centered" style="max-width:420px">
        <div class="modal-content rounded-0 border-0 shadow-lg">
          <div class="modal-header px-4 py-3 border-bottom">
            <h6 class="modal-title fw-bold mb-0">
              <i class="bi me-2" :class="ACTION_CONFIG[currentAction]?.icon"></i>
              {{ ACTION_CONFIG[currentAction]?.title }}
            </h6>
            <button class="btn-close btn-sm" @click="showModal = false"></button>
          </div>
          <div class="modal-body px-4 py-4">
            <div class="d-flex justify-content-between mb-3 small">
              <span class="text-muted">Pedido</span>
              <span class="fw-bold font-monospace">#{{ (selectedPayment?.order_id || '').slice(0,8).toUpperCase() }}</span>
            </div>
            <div class="d-flex justify-content-between mb-3 small">
              <span class="text-muted">Monto</span>
              <span class="fw-bold">Bs. {{ fmtMoney(selectedPayment?.amount) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-3 small">
              <span class="text-muted">Método</span>
              <span>{{ METHOD_LABEL[selectedPayment?.payment_method] ?? selectedPayment?.payment_method }}</span>
            </div>
            <div class="mt-3" v-if="currentAction === 'refund'">
              <label class="form-label fw-semibold small text-uppercase opacity-70">Notas del reembolso</label>
              <textarea v-model="actionNotes" class="form-control form-control-sm rounded-0" rows="3" placeholder="Motivo del reembolso…"></textarea>
            </div>
            <p v-else class="text-muted small mb-0">{{ ACTION_CONFIG[currentAction]?.description }}</p>
          </div>
          <div class="modal-footer px-4 py-3 border-top gap-2">
            <button class="btn btn-sm btn-outline-secondary rounded-0 px-4" @click="showModal = false">Cancelar</button>
            <button class="btn btn-sm rounded-0 px-4" :class="ACTION_CONFIG[currentAction]?.btn" :disabled="processing" @click="confirmAction">
              <span v-if="processing" class="spinner-border spinner-border-sm me-1"></span>
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

const STATUS_TABS = [
  { key: '', label: 'Todos' },
  { key: 'pending',   label: 'Pendientes' },
  { key: 'completed', label: 'Completados' },
  { key: 'failed',    label: 'Fallidos' },
  { key: 'refunded',  label: 'Reembolsados' },
];

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',    badge: 'bg-warning text-dark' },
  completed: { label: 'Pagado',       badge: 'bg-success text-white' },
  failed:    { label: 'Fallido',      badge: 'bg-danger text-white' },
  refunded:  { label: 'Reembolsado',  badge: 'bg-secondary text-white' },
};

const METHODS = [
  { key: 'efectivo',             label: 'Efectivo / Contraentrega' },
  { key: 'transferencia_bancaria', label: 'Transferencia bancaria' },
  { key: 'tarjeta_debito',      label: 'Tarjeta débito' },
  { key: 'tarjeta_credito',     label: 'Tarjeta crédito' },
  { key: 'cheque',              label: 'Cheque' },
  { key: 'mercadopago',         label: 'MercadoPago' },
  { key: 'otro',                label: 'Otro' },
];

const METHOD_LABEL = Object.fromEntries(METHODS.map(m => [m.key, m.label]));

const ORDER_BADGE = {
  pending: 'bg-warning text-dark', confirmed: 'bg-primary', in_production: 'bg-info text-dark',
  ready: 'bg-success', shipped: 'bg-dark', delivered: 'bg-success', cancelled: 'bg-danger', returned: 'bg-secondary',
};
const ORDER_LABEL = {
  pending: 'Pendiente', confirmed: 'Confirmado', in_production: 'En Producción',
  ready: 'Listo', shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado', returned: 'Devuelto',
};

const ACTION_CONFIG = {
  complete: { title: 'Confirmar cobro',    description: '¿Confirmas que el pago fue recibido?', btn: 'btn-success', icon: 'bi-check-circle' },
  fail:     { title: 'Marcar como fallido', description: 'El pago será marcado como no recibido/fallido.', btn: 'btn-danger', icon: 'bi-x-circle' },
  refund:   { title: 'Reembolsar pago',    description: '', btn: 'btn-warning', icon: 'bi-arrow-counterclockwise' },
};

const payments       = ref([]);
const meta           = ref({});
const loading        = ref(false);
const filters        = reactive({ status: 'pending', method: '', from: '', to: '' });
const showModal      = ref(false);
const selectedPayment = ref(null);
const currentAction  = ref('');
const actionNotes    = ref('');
const processing     = ref(false);

async function fetchPayments(page = 1) {
  loading.value = true;
  try {
    const params = { page };
    if (filters.status) params.status = filters.status;
    if (filters.method) params.payment_method = filters.method;
    if (filters.from)   params.from = filters.from;
    if (filters.to)     params.to   = filters.to;
    const { data } = await api.get('/payments', { params });
    payments.value = data.data;
    meta.value     = data.meta ?? {};
  } finally {
    loading.value = false;
  }
}

function setFilter(key, val) {
  filters[key] = val;
  fetchPayments(1);
}

function clearFilters() {
  filters.status = '';
  filters.method = '';
  filters.from   = '';
  filters.to     = '';
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
    const url = `/orders/${orderId}/payments/${p.id}/${currentAction.value}`;
    const body = currentAction.value === 'refund' ? { notes: actionNotes.value || null } : {};
    await api.patch(url, body);
    showModal.value = false;
    fetchPayments(meta.value.current_page ?? 1);
  } catch (e) {
    alert(e.response?.data?.message ?? 'Error al procesar la acción.');
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

<style scoped>
.skel { height: 14px; border-radius: 2px; background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
