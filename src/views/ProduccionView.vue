<template>
  <div>
    <!-- ── HEADER ─────────────────────────────────────────────────── -->
    <div class="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h4 class="fw-bold mb-1 text-body-emphasis">Producción</h4>
        <p class="text-muted small mb-0">{{ meta.total ?? 0 }} órdenes de producción</p>
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
      <button
        class="btn btn-sm px-3 rounded-0 ms-auto"
        :class="filters.unassigned ? 'btn-warning text-dark' : 'btn-outline-secondary'"
        @click="toggleUnassigned"
      >
        <i class="bi bi-person-x me-1"></i>Sin asignar
      </button>
    </div>

    <!-- ── TABLE ─────────────────────────────────────────────────── -->
    <div class="card border shadow-sm rounded-0">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="border-bottom bg-body-tertiary">
            <tr>
              <th class="ps-4 py-3 fw-semibold small text-muted text-uppercase">Pedido</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Producto</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase text-center">Cant.</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Trabajador</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Notas internas</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Estado</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Creado</th>
              <th class="pe-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="n in 8" :key="n">
                <td class="ps-4"><div class="skel w-75"></div></td>
                <td><div class="skel w-100"></div></td>
                <td class="text-center"><div class="skel mx-auto" style="width:30px"></div></td>
                <td><div class="skel w-75"></div></td>
                <td><div class="skel w-100"></div></td>
                <td><div class="skel" style="width:90px"></div></td>
                <td><div class="skel w-75"></div></td>
                <td></td>
              </tr>
            </template>
            <tr v-else-if="prodOrders.length === 0">
              <td colspan="8" class="text-center py-5">
                <i class="bi bi-gear text-muted d-block mb-2" style="font-size:2.5rem;opacity:.3"></i>
                <p class="text-muted small mb-0">No hay órdenes de producción con estos filtros</p>
              </td>
            </tr>
            <tr v-else v-for="p in prodOrders" :key="p.id">
              <td class="ps-4">
                <span class="fw-bold font-monospace small">
                  #{{ (p.order_item?.order_id || '').slice(0,8).toUpperCase() }}
                </span>
              </td>
              <td>
                <div class="small fw-semibold">{{ p.order_item?.product_name ?? '—' }}</div>
                <div v-if="p.order_item?.customization_notes" class="text-muted" style="font-size:.7rem">
                  {{ p.order_item.customization_notes }}
                </div>
              </td>
              <td class="text-center">
                <span class="badge bg-secondary bg-opacity-10 text-secondary border small">
                  {{ p.order_item?.quantity ?? '—' }}
                </span>
              </td>
              <td>
                <template v-if="p.worker">
                  <span class="small fw-semibold">{{ p.worker.name }}</span>
                </template>
                <span v-else class="badge rounded-0 bg-warning text-dark small px-2">Sin asignar</span>
              </td>
              <td class="small text-muted" style="max-width:160px">
                <span class="text-truncate d-block">{{ p.internal_notes || '—' }}</span>
              </td>
              <td>
                <span class="badge rounded-0 px-2 py-1" :class="STATUS_CONFIG[p.status]?.badge ?? 'bg-secondary'">
                  {{ STATUS_CONFIG[p.status]?.label ?? p.status }}
                </span>
              </td>
              <td class="text-muted small">{{ fmtDate(p.created_at) }}</td>
              <td class="pe-4">
                <div class="d-flex gap-1 justify-content-end flex-wrap">
                  <!-- Assign/Reassign worker (queued or in_progress) -->
                  <button
                    v-if="['queued','in_progress'].includes(p.status)"
                    @click="openAssign(p)"
                    class="btn btn-sm btn-outline-secondary rounded-0 px-2" title="Asignar trabajador">
                    <i class="bi bi-person-check"></i>
                  </button>
                  <!-- Start: queued → in_progress -->
                  <button
                    v-if="p.status === 'queued'"
                    @click="openAction(p, 'start')"
                    class="btn btn-sm btn-info rounded-0 px-2" title="Iniciar producción">
                    <i class="bi bi-play-fill"></i>
                  </button>
                  <!-- Complete: in_progress → completed -->
                  <button
                    v-if="p.status === 'in_progress'"
                    @click="openAction(p, 'complete')"
                    class="btn btn-sm btn-success rounded-0 px-2" title="Completar producción">
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <!-- Cancel: queued or in_progress -->
                  <button
                    v-if="['queued','in_progress'].includes(p.status)"
                    @click="openAction(p, 'cancel')"
                    class="btn btn-sm btn-outline-danger rounded-0 px-2" title="Cancelar">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="meta.last_page > 1" class="d-flex justify-content-between align-items-center px-4 py-3 border-top">
        <span class="text-muted small">Página {{ meta.current_page }} de {{ meta.last_page }} · {{ meta.total }} órdenes</span>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary rounded-0" :disabled="meta.current_page <= 1" @click="fetchProdOrders(meta.current_page - 1)"><i class="bi bi-chevron-left"></i></button>
          <button class="btn btn-sm btn-outline-secondary rounded-0" :disabled="meta.current_page >= meta.last_page" @click="fetchProdOrders(meta.current_page + 1)"><i class="bi bi-chevron-right"></i></button>
        </div>
      </div>
    </div>

    <!-- ── ACTION MODAL (start / complete / cancel) ──────────────── -->
    <div v-if="showActionModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,.4)">
      <div class="modal-dialog modal-dialog-centered" style="max-width:420px">
        <div class="modal-content rounded-0 border-0 shadow-lg">
          <div class="modal-header px-4 py-3 border-bottom">
            <h6 class="modal-title fw-bold mb-0">
              <i class="bi me-2" :class="ACTION_CONFIG[currentAction]?.icon"></i>
              {{ ACTION_CONFIG[currentAction]?.title }}
            </h6>
            <button class="btn-close btn-sm" @click="showActionModal = false"></button>
          </div>
          <div class="modal-body px-4 py-4">
            <div class="mb-3 p-3 bg-body-tertiary border">
              <div class="d-flex justify-content-between small mb-1">
                <span class="text-muted">Pedido</span>
                <span class="fw-bold font-monospace">#{{ (selectedProd?.order_item?.order_id || '').slice(0,8).toUpperCase() }}</span>
              </div>
              <div class="d-flex justify-content-between small">
                <span class="text-muted">Producto</span>
                <span>{{ selectedProd?.order_item?.product_name }}</span>
              </div>
            </div>
            <div>
              <label class="form-label fw-semibold small text-uppercase opacity-70">Notas internas (opcional)</label>
              <textarea v-model="actionNotes" class="form-control form-control-sm rounded-0" rows="3"
                placeholder="Observaciones del operario…"></textarea>
            </div>
            <p v-if="currentAction === 'cancel'" class="text-danger small mt-2 mb-0">
              <i class="bi bi-exclamation-triangle me-1"></i>
              Si la producción estaba iniciada, el stock se revertirá a "reservado".
            </p>
          </div>
          <div class="modal-footer px-4 py-3 border-top gap-2">
            <button class="btn btn-sm btn-outline-secondary rounded-0 px-4" @click="showActionModal = false">Cancelar</button>
            <button class="btn btn-sm rounded-0 px-4" :class="ACTION_CONFIG[currentAction]?.btn" :disabled="processing" @click="confirmAction">
              <span v-if="processing" class="spinner-border spinner-border-sm me-1"></span>
              {{ ACTION_CONFIG[currentAction]?.confirm }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── ASSIGN WORKER MODAL ───────────────────────────────────── -->
    <div v-if="showAssignModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,.4)">
      <div class="modal-dialog modal-dialog-centered" style="max-width:380px">
        <div class="modal-content rounded-0 border-0 shadow-lg">
          <div class="modal-header px-4 py-3 border-bottom">
            <h6 class="modal-title fw-bold mb-0"><i class="bi bi-person-check me-2"></i>Asignar trabajador</h6>
            <button class="btn-close btn-sm" @click="showAssignModal = false"></button>
          </div>
          <div class="modal-body px-4 py-4">
            <p class="text-muted small mb-3">
              Producto: <strong class="text-dark">{{ selectedProd?.order_item?.product_name }}</strong>
            </p>
            <label class="form-label fw-semibold small text-uppercase opacity-70">Trabajador</label>
            <div v-if="loadingWorkers" class="text-center py-3">
              <div class="spinner-border spinner-border-sm text-secondary"></div>
            </div>
            <select v-else v-model="assignWorkerId" class="form-select form-select-sm rounded-0">
              <option value="">— Sin asignar —</option>
              <option v-for="w in workers" :key="w.id" :value="w.id">{{ w.name }}</option>
            </select>
          </div>
          <div class="modal-footer px-4 py-3 border-top gap-2">
            <button class="btn btn-sm btn-outline-secondary rounded-0 px-4" @click="showAssignModal = false">Cancelar</button>
            <button class="btn btn-sm btn-dark rounded-0 px-4" :disabled="processing || loadingWorkers" @click="confirmAssign">
              <span v-if="processing" class="spinner-border spinner-border-sm me-1"></span>
              Asignar
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
  { key: '',            label: 'Todos' },
  { key: 'queued',      label: 'En cola' },
  { key: 'in_progress', label: 'En producción' },
  { key: 'completed',   label: 'Completados' },
  { key: 'cancelled',   label: 'Cancelados' },
];

const STATUS_CONFIG = {
  queued:      { label: 'En cola',         badge: 'bg-warning text-dark' },
  in_progress: { label: 'En producción',   badge: 'bg-info text-dark' },
  completed:   { label: 'Completado',      badge: 'bg-success text-white' },
  cancelled:   { label: 'Cancelado',       badge: 'bg-danger text-white' },
};

const ACTION_CONFIG = {
  start:    { title: 'Iniciar producción',       icon: 'bi-play-fill',   btn: 'btn-info',    confirm: 'Iniciar' },
  complete: { title: 'Completar producción',     icon: 'bi-check-circle', btn: 'btn-success', confirm: 'Completar' },
  cancel:   { title: 'Cancelar orden de producción', icon: 'bi-x-circle', btn: 'btn-danger',  confirm: 'Cancelar' },
};

const prodOrders = ref([]);
const meta       = ref({});
const loading    = ref(false);
const filters    = reactive({ status: '', unassigned: false });

const selectedProd   = ref(null);
const processing     = ref(false);

// Action modal
const showActionModal = ref(false);
const currentAction   = ref('');
const actionNotes     = ref('');

// Assign modal
const showAssignModal = ref(false);
const assignWorkerId  = ref('');
const workers         = ref([]);
const loadingWorkers  = ref(false);

async function fetchProdOrders(page = 1) {
  loading.value = true;
  try {
    const params = { page };
    if (filters.status)     params.status     = filters.status;
    if (filters.unassigned) params.unassigned = 1;
    const { data } = await api.get('/production-orders', { params });
    prodOrders.value = data.data;
    meta.value       = data.meta ?? {};
  } finally {
    loading.value = false;
  }
}

function setStatus(val) { filters.status = val; fetchProdOrders(1); }

function toggleUnassigned() {
  filters.unassigned = !filters.unassigned;
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
  const url     = `/orders/${orderId}/production-orders/${p.id}/${currentAction.value}`;
  try {
    await api.patch(url, { internal_notes: actionNotes.value || null });
    showActionModal.value = false;
    fetchProdOrders(meta.value.current_page ?? 1);
  } catch (e) {
    alert(e.response?.data?.message ?? 'Error al procesar la acción.');
  } finally {
    processing.value = false;
  }
}

async function openAssign(prod) {
  selectedProd.value  = prod;
  assignWorkerId.value = prod.worker?.id ?? '';
  showAssignModal.value = true;

  // Load workers lazily
  if (workers.value.length === 0) {
    loadingWorkers.value = true;
    try {
      const { data } = await api.get('/users', { params: { page: 1 } });
      // Filter only active, non-deleted users that have no customer profile (internal staff)
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
    await api.patch(`/orders/${orderId}/production-orders/${p.id}/assign`, {
      assigned_worker_id: assignWorkerId.value || null,
    });
    showAssignModal.value = false;
    fetchProdOrders(meta.value.current_page ?? 1);
  } catch (e) {
    alert(e.response?.data?.message ?? 'Error al asignar el trabajador.');
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

<style scoped>
.skel { height: 14px; border-radius: 2px; background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
