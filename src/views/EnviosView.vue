<template>
  <div>
    <!-- ── HEADER ─────────────────────────────────────────────────── -->
    <div class="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
      <div>
        <h4 class="fw-bold mb-1 text-body-emphasis">Envíos y Logística</h4>
        <p class="text-muted small mb-0">{{ meta.total ?? 0 }} envíos registrados</p>
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
      <div class="col-md-4">
        <input v-model="filters.courier" type="text" class="form-control form-control-sm rounded-0"
          placeholder="Mensajero / courier…" @input="debouncedFetch">
      </div>
      <div class="col-md-3">
        <input v-model="filters.from" type="date" class="form-control form-control-sm rounded-0" @change="fetchShipments(1)">
      </div>
      <div class="col-md-3">
        <input v-model="filters.to" type="date" class="form-control form-control-sm rounded-0" @change="fetchShipments(1)">
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
              <th class="py-3 fw-semibold small text-muted text-uppercase">Dirección</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Tracking</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Mensajero</th>
              <th class="py-3 fw-semibold small text-muted text-uppercase">Responsable</th>
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
                <td><div class="skel" style="width:90px"></div></td>
                <td><div class="skel w-75"></div></td>
                <td><div class="skel w-75"></div></td>
                <td><div class="skel" style="width:80px"></div></td>
                <td><div class="skel w-75"></div></td>
                <td></td>
              </tr>
            </template>
            <tr v-else-if="shipments.length === 0">
              <td colspan="8" class="text-center py-5">
                <i class="bi bi-truck text-muted d-block mb-2" style="font-size:2.5rem;opacity:.3"></i>
                <p class="text-muted small mb-0">No hay envíos que coincidan con los filtros</p>
              </td>
            </tr>
            <tr v-else v-for="s in shipments" :key="s.id">
              <td class="ps-4">
                <span class="fw-bold font-monospace small">#{{ (s.order_id || s.order?.id || '').slice(0,8).toUpperCase() }}</span>
              </td>
              <td class="small text-muted" style="max-width:160px">
                <span class="text-truncate d-block">{{ s.order?.shipping_address ?? '—' }}</span>
              </td>
              <td>
                <span v-if="s.tracking_number" class="font-monospace small text-dark">{{ s.tracking_number }}</span>
                <span v-else class="text-muted small">Sin tracking</span>
              </td>
              <td class="small">{{ s.courier_name ?? '—' }}</td>
              <td class="small">{{ s.handler?.name ?? '—' }}</td>
              <td>
                <span class="badge rounded-0 px-2 py-1" :class="STATUS_CONFIG[s.status]?.badge ?? 'bg-secondary'">
                  {{ STATUS_CONFIG[s.status]?.label ?? s.status }}
                </span>
              </td>
              <td class="text-muted small">{{ fmtDate(s.created_at) }}</td>
              <td class="pe-4">
                <div class="d-flex gap-1 justify-content-end flex-wrap">
                  <!-- preparing -->
                  <button v-if="s.status === 'preparing'" @click="openDispatch(s)"
                    class="btn btn-sm btn-dark rounded-0 px-2" title="Despachar">
                    <i class="bi bi-truck"></i>
                  </button>
                  <!-- shipped -->
                  <button v-if="s.status === 'shipped'" @click="quickAction(s, 'in-transit')"
                    class="btn btn-sm btn-outline-info rounded-0 px-2" title="Marcar en tránsito">
                    <i class="bi bi-arrow-right-circle"></i>
                  </button>
                  <!-- shipped or in_transit -->
                  <button v-if="s.status === 'shipped' || s.status === 'in_transit'" @click="quickAction(s, 'deliver')"
                    class="btn btn-sm btn-success rounded-0 px-2" title="Confirmar entrega">
                    <i class="bi bi-check-all"></i>
                  </button>
                  <!-- preparing/shipped/in_transit can fail -->
                  <button v-if="['preparing','shipped','in_transit'].includes(s.status)" @click="openFail(s)"
                    class="btn btn-sm btn-outline-danger rounded-0 px-2" title="Marcar fallido">
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="meta.last_page > 1" class="d-flex justify-content-between align-items-center px-4 py-3 border-top">
        <span class="text-muted small">Página {{ meta.current_page }} de {{ meta.last_page }} · {{ meta.total }} envíos</span>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary rounded-0" :disabled="meta.current_page <= 1" @click="fetchShipments(meta.current_page - 1)"><i class="bi bi-chevron-left"></i></button>
          <button class="btn btn-sm btn-outline-secondary rounded-0" :disabled="meta.current_page >= meta.last_page" @click="fetchShipments(meta.current_page + 1)"><i class="bi bi-chevron-right"></i></button>
        </div>
      </div>
    </div>

    <!-- ── DISPATCH MODAL ────────────────────────────────────────── -->
    <div v-if="showDispatchModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,.4)">
      <div class="modal-dialog modal-dialog-centered" style="max-width:440px">
        <div class="modal-content rounded-0 border-0 shadow-lg">
          <div class="modal-header px-4 py-3 border-bottom">
            <h6 class="modal-title fw-bold mb-0"><i class="bi bi-truck me-2"></i>Despachar envío</h6>
            <button class="btn-close btn-sm" @click="showDispatchModal = false"></button>
          </div>
          <div class="modal-body px-4 py-4">
            <div class="mb-3">
              <label class="form-label fw-semibold small text-uppercase opacity-70">Número de tracking</label>
              <input v-model="dispatchForm.tracking_number" type="text" class="form-control form-control-sm rounded-0" placeholder="TRK-001234">
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold small text-uppercase opacity-70">Mensajero / empresa de transporte</label>
              <input v-model="dispatchForm.courier_name" type="text" class="form-control form-control-sm rounded-0" placeholder="Ej: DHL, Rapi, reparto propio…">
            </div>
            <div>
              <label class="form-label fw-semibold small text-uppercase opacity-70">Notas</label>
              <textarea v-model="dispatchForm.notes" class="form-control form-control-sm rounded-0" rows="2" placeholder="Instrucciones de entrega…"></textarea>
            </div>
          </div>
          <div class="modal-footer px-4 py-3 border-top gap-2">
            <button class="btn btn-sm btn-outline-secondary rounded-0 px-4" @click="showDispatchModal = false">Cancelar</button>
            <button class="btn btn-sm btn-dark rounded-0 px-4" :disabled="processing" @click="confirmDispatch">
              <span v-if="processing" class="spinner-border spinner-border-sm me-1"></span>
              Despachar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── FAIL MODAL ────────────────────────────────────────────── -->
    <div v-if="showFailModal" class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,.4)">
      <div class="modal-dialog modal-dialog-centered" style="max-width:420px">
        <div class="modal-content rounded-0 border-0 shadow-lg">
          <div class="modal-header px-4 py-3 border-bottom">
            <h6 class="modal-title fw-bold mb-0"><i class="bi bi-x-circle me-2"></i>Marcar envío como fallido</h6>
            <button class="btn-close btn-sm" @click="showFailModal = false"></button>
          </div>
          <div class="modal-body px-4 py-4">
            <label class="form-label fw-semibold small text-uppercase opacity-70">Motivo del fallo <span class="text-danger">*</span></label>
            <textarea v-model="failReason" class="form-control form-control-sm rounded-0" :class="{ 'is-invalid': failError }"
              rows="3" placeholder="Cliente no encontrado, dirección incorrecta, accidente…"></textarea>
            <div v-if="failError" class="invalid-feedback">{{ failError }}</div>
            <p class="text-muted small mt-3 mb-0">
              <i class="bi bi-info-circle me-1"></i>
              El estado del pedido permanecerá en "Enviado". Puedes crear un nuevo envío para reintentar.
            </p>
          </div>
          <div class="modal-footer px-4 py-3 border-top gap-2">
            <button class="btn btn-sm btn-outline-secondary rounded-0 px-4" @click="showFailModal = false">Cancelar</button>
            <button class="btn btn-sm btn-danger rounded-0 px-4" :disabled="processing" @click="confirmFail">
              <span v-if="processing" class="spinner-border spinner-border-sm me-1"></span>
              Marcar fallido
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
  { key: '',           label: 'Todos' },
  { key: 'preparing',  label: 'Preparando' },
  { key: 'shipped',    label: 'Despachados' },
  { key: 'in_transit', label: 'En Tránsito' },
  { key: 'delivered',  label: 'Entregados' },
  { key: 'failed',     label: 'Fallidos' },
];

const STATUS_CONFIG = {
  preparing:  { label: 'Preparando',  badge: 'bg-warning text-dark' },
  shipped:    { label: 'Despachado',  badge: 'bg-dark text-white' },
  in_transit: { label: 'En Tránsito', badge: 'bg-info text-dark' },
  delivered:  { label: 'Entregado',   badge: 'bg-success text-white' },
  failed:     { label: 'Fallido',     badge: 'bg-danger text-white' },
};

const shipments = ref([]);
const meta      = ref({});
const loading   = ref(false);
const filters   = reactive({ status: '', courier: '', from: '', to: '' });

const selectedShipment   = ref(null);
const processing         = ref(false);

// Dispatch modal
const showDispatchModal = ref(false);
const dispatchForm      = reactive({ tracking_number: '', courier_name: '', notes: '' });

// Fail modal
const showFailModal = ref(false);
const failReason    = ref('');
const failError     = ref('');

let debounceTimer = null;

async function fetchShipments(page = 1) {
  loading.value = true;
  try {
    const params = { page };
    if (filters.status)  params.status       = filters.status;
    if (filters.courier) params.courier_name = filters.courier;
    if (filters.from)    params.from         = filters.from;
    if (filters.to)      params.to           = filters.to;
    const { data } = await api.get('/shipments', { params });
    shipments.value = data.data;
    meta.value      = data.meta ?? {};
  } finally {
    loading.value = false;
  }
}

function setStatus(val) { filters.status = val; fetchShipments(1); }

function clearFilters() {
  filters.status = ''; filters.courier = ''; filters.from = ''; filters.to = '';
  fetchShipments(1);
}

function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchShipments(1), 380);
}

// Quick action (no extra fields needed)
async function quickAction(shipment, action) {
  processing.value = true;
  const orderId = shipment.order_id ?? shipment.order?.id;
  try {
    await api.patch(`/orders/${orderId}/shipments/${shipment.id}/${action}`, {});
    fetchShipments(meta.value.current_page ?? 1);
  } catch (e) {
    alert(e.response?.data?.message ?? 'Error al procesar el envío.');
  } finally {
    processing.value = false;
  }
}

// Dispatch (with form)
function openDispatch(shipment) {
  selectedShipment.value        = shipment;
  dispatchForm.tracking_number  = shipment.tracking_number ?? '';
  dispatchForm.courier_name     = shipment.courier_name ?? '';
  dispatchForm.notes            = '';
  showDispatchModal.value       = true;
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
    fetchShipments(meta.value.current_page ?? 1);
  } catch (e) {
    alert(e.response?.data?.message ?? 'Error al despachar el envío.');
  } finally {
    processing.value = false;
  }
}

// Fail (with required reason)
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
    await api.patch(`/orders/${orderId}/shipments/${s.id}/fail`, {
      failure_reason: failReason.value.trim(),
    });
    showFailModal.value = false;
    fetchShipments(meta.value.current_page ?? 1);
  } catch (e) {
    alert(e.response?.data?.message ?? 'Error al marcar el envío como fallido.');
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

<style scoped>
.skel { height: 14px; border-radius: 2px; background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>
