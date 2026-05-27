<template>
  <div>
    <!-- ── HEADER ─────────────────────────────────────────────────── -->
    <div class="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h4 class="fw-bold mb-1 text-body-emphasis">Devoluciones</h4>
        <p class="text-muted small mb-0">{{ meta.total ?? 0 }} solicitudes registradas</p>
      </div>
    </div>

    <!-- ── STATUS TABS ───────────────────────────────────────────── -->
    <div class="d-flex gap-2 flex-wrap mb-3 pb-3 border-bottom">
      <button
        v-for="tab in STATUS_TABS" :key="tab.key"
        class="btn btn-sm px-3 rounded-0"
        :class="filters.status === tab.key ? 'btn-dark' : 'btn-outline-secondary'"
        @click="setStatus(tab.key)"
      >{{ tab.label }}</button>
    </div>

    <!-- ── FILTERS ───────────────────────────────────────────────── -->
    <div class="row g-2 mb-4">
      <div class="col-md-3">
        <select v-model="filters.return_type" class="form-select form-select-sm rounded-0" @change="fetchReturns(1)">
          <option value="">Todos los tipos</option>
          <option value="full">Devolución total</option>
          <option value="partial">Devolución parcial</option>
        </select>
      </div>
      <div class="col-md-3">
        <input v-model="filters.from" type="date" class="form-control form-control-sm rounded-0" @change="fetchReturns(1)">
      </div>
      <div class="col-md-3">
        <input v-model="filters.to" type="date" class="form-control form-control-sm rounded-0" @change="fetchReturns(1)">
      </div>
      <div class="col-md-1">
        <button @click="clearFilters" class="btn btn-sm btn-outline-secondary rounded-0 w-100">
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
              <th class="py-3 fw-semibold small text-muted text-uppercase">Tipo</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Producto</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Motivo</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase text-end">Reembolso</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Estado</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Fecha</th>
              <th class="pe-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="n in 6" :key="n">
                <td class="ps-4"><div class="skel w-75"></div></td>
                <td><div class="skel" style="width:80px"></div></td>
                <td><div class="skel w-100"></div></td>
                <td><div class="skel w-100"></div></td>
                <td class="text-end"><div class="skel ms-auto" style="width:70px"></div></td>
                <td><div class="skel" style="width:80px"></div></td>
                <td><div class="skel w-75"></div></td>
                <td></td>
              </tr>
            </template>
            <tr v-else-if="returns.length === 0">
              <td colspan="8" class="text-center py-5">
                <i class="bi bi-arrow-return-left text-muted d-block mb-2" style="font-size:2.5rem;opacity:.3"></i>
                <p class="text-muted small mb-0">No hay devoluciones que coincidan con los filtros</p>
              </td>
            </tr>
            <tr v-else v-for="r in returns" :key="r.id">
              <td class="ps-4">
                <span class="fw-bold font-monospace small">#{{ (r.order_id || r.order?.id || '').slice(0,8).toUpperCase() }}</span>
              </td>
              <td>
                <span class="badge rounded-0 px-2 small" :class="r.return_type === 'full' ? 'bg-dark text-white' : 'bg-light text-dark border'">
                  {{ r.return_type === 'full' ? 'Total' : 'Parcial' }}
                </span>
              </td>
              <td class="small text-muted">
                {{ r.order_item?.product_name ?? (r.return_type === 'full' ? 'Todos los ítems' : '—') }}
              </td>
              <td class="small text-muted" style="max-width:180px">
                <span class="text-truncate d-block">{{ r.reason || '—' }}</span>
              </td>
              <td class="text-end small fw-bold">
                <span v-if="r.refund_amount">Bs. {{ fmtMoney(r.refund_amount) }}</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <span class="badge rounded-0 px-2 py-1" :class="STATUS_CONFIG[r.status]?.badge ?? 'bg-secondary'">
                  {{ STATUS_CONFIG[r.status]?.label ?? r.status }}
                </span>
              </td>
              <td class="text-muted small">{{ fmtDate(r.request_at) }}</td>
              <td class="pe-4">
                <div class="d-flex gap-1 justify-content-end">
                  <template v-if="r.status === 'requested'">
                    <button @click="openModal(r, 'approve')" class="btn btn-sm btn-success rounded-0 px-2" title="Aprobar">
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <button @click="openModal(r, 'reject')" class="btn btn-sm btn-outline-danger rounded-0 px-2" title="Rechazar">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </template>
                  <button v-if="r.status === 'approved'" @click="openModal(r, 'resolve')"
                    class="btn btn-sm btn-primary rounded-0 px-2" title="Resolver">
                    <i class="bi bi-check-all"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="meta.last_page > 1" class="d-flex justify-content-between align-items-center px-4 py-3 border-top">
        <span class="text-muted small">Página {{ meta.current_page }} de {{ meta.last_page }} · {{ meta.total }} solicitudes</span>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary rounded-0" :disabled="meta.current_page <= 1" @click="fetchReturns(meta.current_page - 1)"><i class="bi bi-chevron-left"></i></button>
          <button class="btn btn-sm btn-outline-secondary rounded-0" :disabled="meta.current_page >= meta.last_page" @click="fetchReturns(meta.current_page + 1)"><i class="bi bi-chevron-right"></i></button>
        </div>
      </div>
    </div>

    <!-- ── ACTION MODAL ──────────────────────────────────────────── -->
    <div v-if="showModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,.4)">
      <div class="modal-dialog modal-dialog-centered" style="max-width:440px">
        <div class="modal-content rounded-0 border-0 shadow-lg">
          <div class="modal-header px-4 py-3 border-bottom">
            <h6 class="modal-title fw-bold mb-0">
              <i class="bi me-2" :class="MODAL_CONFIG[currentAction]?.icon"></i>
              {{ MODAL_CONFIG[currentAction]?.title }}
            </h6>
            <button class="btn-close btn-sm" @click="showModal = false"></button>
          </div>
          <div class="modal-body px-4 py-4">
            <!-- Context info -->
            <div class="mb-3 p-3 bg-body-tertiary border" style="border-radius:0">
              <div class="d-flex justify-content-between small mb-1">
                <span class="text-muted">Pedido</span>
                <span class="fw-bold font-monospace">#{{ (selectedReturn?.order_id || '').slice(0,8).toUpperCase() }}</span>
              </div>
              <div class="d-flex justify-content-between small mb-1">
                <span class="text-muted">Tipo</span>
                <span>{{ selectedReturn?.return_type === 'full' ? 'Devolución total' : 'Devolución parcial' }}</span>
              </div>
              <div v-if="selectedReturn?.reason" class="d-flex justify-content-between small">
                <span class="text-muted">Motivo</span>
                <span class="text-end" style="max-width:220px">{{ selectedReturn.reason }}</span>
              </div>
            </div>

            <!-- Approve: update refund amount -->
            <div v-if="currentAction === 'approve'" class="mb-3">
              <label class="form-label fw-semibold small text-uppercase opacity-70">Monto a reembolsar (opcional)</label>
              <div class="input-group input-group-sm">
                <span class="input-group-text rounded-0">Bs.</span>
                <input v-model="form.refund_amount" type="number" step="0.01" min="0"
                  class="form-control rounded-0" placeholder="0.00">
              </div>
            </div>

            <!-- Notes for all actions -->
            <div>
              <label class="form-label fw-semibold small text-uppercase opacity-70">
                Notas {{ currentAction === 'reject' ? '(requerido: motivo de rechazo)' : '(opcional)' }}
              </label>
              <textarea v-model="form.notes" class="form-control form-control-sm rounded-0" rows="3"
                :placeholder="currentAction === 'reject' ? 'Explica el motivo del rechazo…' : 'Observaciones adicionales…'">
              </textarea>
            </div>
          </div>
          <div class="modal-footer px-4 py-3 border-top gap-2">
            <button class="btn btn-sm btn-outline-secondary rounded-0 px-4" @click="showModal = false">Cancelar</button>
            <button class="btn btn-sm rounded-0 px-4" :class="MODAL_CONFIG[currentAction]?.btn" :disabled="processing" @click="confirmAction">
              <span v-if="processing" class="spinner-border spinner-border-sm me-1"></span>
              {{ MODAL_CONFIG[currentAction]?.confirm }}
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
  { key: '',          label: 'Todas' },
  { key: 'requested', label: 'Solicitadas' },
  { key: 'approved',  label: 'Aprobadas' },
  { key: 'rejected',  label: 'Rechazadas' },
  { key: 'resolved',  label: 'Resueltas' },
];

const STATUS_CONFIG = {
  requested: { label: 'Solicitada', badge: 'bg-warning text-dark' },
  approved:  { label: 'Aprobada',   badge: 'bg-info text-dark' },
  rejected:  { label: 'Rechazada',  badge: 'bg-danger text-white' },
  resolved:  { label: 'Resuelta',   badge: 'bg-success text-white' },
};

const MODAL_CONFIG = {
  approve: { title: 'Aprobar devolución',  icon: 'bi-check-circle',  btn: 'btn-success', confirm: 'Aprobar' },
  reject:  { title: 'Rechazar devolución', icon: 'bi-x-circle',      btn: 'btn-danger',  confirm: 'Rechazar' },
  resolve: { title: 'Resolver devolución', icon: 'bi-check-all',     btn: 'btn-primary', confirm: 'Marcar resuelta' },
};

const returns        = ref([]);
const meta           = ref({});
const loading        = ref(false);
const filters        = reactive({ status: 'requested', return_type: '', from: '', to: '' });
const showModal      = ref(false);
const selectedReturn = ref(null);
const currentAction  = ref('');
const form           = reactive({ refund_amount: '', notes: '' });
const processing     = ref(false);

async function fetchReturns(page = 1) {
  loading.value = true;
  try {
    const params = { page };
    if (filters.status)      params.status      = filters.status;
    if (filters.return_type) params.return_type = filters.return_type;
    if (filters.from)        params.from        = filters.from;
    if (filters.to)          params.to          = filters.to;
    const { data } = await api.get('/returns', { params });
    returns.value = data.data;
    meta.value    = data.meta ?? {};
  } finally {
    loading.value = false;
  }
}

function setStatus(val) {
  filters.status = val;
  fetchReturns(1);
}

function clearFilters() {
  filters.status = '';
  filters.return_type = '';
  filters.from = '';
  filters.to   = '';
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
  const url     = `/orders/${orderId}/returns/${r.id}/${currentAction.value}`;

  const body = { notes: form.notes || null };
  if (currentAction.value === 'approve' && form.refund_amount) {
    body.refund_amount = parseFloat(form.refund_amount);
  }

  try {
    await api.patch(url, body);
    showModal.value = false;
    fetchReturns(meta.value.current_page ?? 1);
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

onMounted(() => fetchReturns());
</script>

<style scoped>
.skel { height: 14px; border-radius: 2px; background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
