<template>
  <div class="animate__animated animate__fadeIn">

    <!-- ── VISTA: LISTADO ─────────────────────────────────────────────── -->
    <div v-if="!showDetail">

      <div class="sol-page-header mb-3">
        <div>
          <h2 class="sol-page-title">Gestión de Pedidos</h2>
          <p class="sol-page-subtitle">{{ meta.total ?? 0 }} pedidos registrados en el sistema</p>
        </div>
        <BaseButton variant="brand" class="rounded-pill px-4 py-2 sol-fw-800 sol-shadow-brand" @click="openNewOrderModal">
          <i class="fa-solid fa-plus me-2"></i>Nuevo Pedido
        </BaseButton>
      </div>

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
        <template #filters>
          <div class="d-flex gap-2 flex-wrap align-items-center">
            <BaseFilterSelect v-model="filters.status" :options="statusOptions" width="185px" @update:modelValue="fetchOrders(1)" />
            <input v-model="filters.from" type="date" class="form-control form-control-sm border rounded-pill px-3"
                   style="height:38px;width:155px;font-size:.8125rem;" @change="fetchOrders(1)">
            <input v-model="filters.to" type="date" class="form-control form-control-sm border rounded-pill px-3"
                   style="height:38px;width:155px;font-size:.8125rem;" @change="fetchOrders(1)">
            <button v-if="filters.status !== '' || filters.from || filters.to" type="button"
                    class="btn btn-light rounded-pill px-3 border" style="height:38px;font-size:.8125rem;font-weight:600;"
                    @click="clearFilters">
              <i class="fa-solid fa-xmark me-1"></i>Limpiar
            </button>
          </div>
        </template>

        <template #col-order_info="{ item }">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-light text-secondary border d-flex align-items-center justify-content-center rounded-3" style="width:40px;height:40px;flex-shrink:0;">
              <i class="fa-solid fa-box-open" style="font-size:.9rem;"></i>
            </div>
            <div>
              <div class="fw-bold text-body-emphasis small font-monospace">#{{ item.id.slice(0,8).toUpperCase() }}</div>
              <div class="text-body-secondary smaller mt-1 d-flex align-items-center gap-2">
                <span>{{ customerName(item.customer) }}</span>
                <span class="badge rounded-pill px-2 py-0 border"
                      style="font-size:.58rem;font-weight:700;"
                      :class="item.customer?.customer_type === 'business' ? 'bg-primary-subtle text-primary border-primary-subtle' : 'bg-light text-dark border'">
                  {{ item.customer?.customer_type === 'business' ? 'Empresa' : 'Individual' }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <template #col-items_count="{ item }">
          <span class="badge rounded-pill bg-light border text-dark px-3 py-1 sol-fw-800 sol-smallest">
            {{ item.items_count ?? item.items?.length ?? '—' }}
          </span>
        </template>

        <template #col-total_amount="{ item }">
          <span class="fw-bold small text-body-emphasis">Bs. {{ fmtMoney(item.total_amount) }}</span>
        </template>

        <template #col-status="{ item }">
          <span class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest border"
                :class="STATUS_CONFIG[item.status]?.cls ?? 'bg-secondary-subtle text-secondary border-secondary-subtle'">
            {{ STATUS_CONFIG[item.status]?.label ?? item.status }}
          </span>
        </template>

        <template #col-created_at="{ item }">
          <span class="small text-body-secondary">{{ fmtDate(item.created_at) }}</span>
        </template>

        <template #item-actions="{ item }">
          <li>
            <button class="dropdown-item rounded-3 py-2 small" @click="openDetail(item.id)">
              <i class="fa-solid fa-eye me-2 text-primary"></i>Ver detalle
            </button>
          </li>
        </template>
      </BaseDataGrid>
    </div>

    <!-- ── VISTA: DETALLE (panel) ─────────────────────────────────────── -->
    <OrderDetailPanel
      v-else
      :order-id="selectedOrderId"
      @close="closeDetail"
      @refresh-list="fetchOrders(meta.current_page ?? 1)"
    />

    <!-- ── MODAL: Nueva Orden ─────────────────────────────────────────── -->
    <BaseModal v-model="showNewOrderModal" title="Nuevo Pedido" size="lg">
      <template #icon><i class="fa-solid fa-plus"></i></template>
      <div class="p-2">

        <!-- SECCIÓN: Cliente -->
        <div class="mb-4">
          <p class="smaller fw-800 text-body-secondary text-uppercase mb-2">1. Cliente</p>
          <div v-if="!newOrder.selectedCustomer">
            <div class="d-flex gap-2 mb-2">
              <input v-model="newOrder.customerQuery" type="text" class="form-control"
                     placeholder="Buscar por nombre, NIT, teléfono…"
                     @input="debouncedCustomerSearch">
              <button type="button" class="btn btn-outline-secondary px-3 flex-shrink-0 rounded-pill"
                      :disabled="newOrder.customerSearching" @click="searchCustomers">
                <span v-if="newOrder.customerSearching"><span class="spinner-border spinner-border-sm"></span></span>
                <span v-else><i class="fa-solid fa-magnifying-glass"></i></span>
              </button>
            </div>
            <div v-if="newOrder.customerResults.length" class="border rounded-3 overflow-hidden">
              <button v-for="c in newOrder.customerResults" :key="c.id" type="button"
                      class="d-flex align-items-center gap-3 w-100 px-3 py-2 text-start border-bottom bg-body customer-result-item"
                      @click="selectCustomer(c)">
                <div>
                  <div class="small fw-semibold text-body-emphasis">{{ c.business_name || c.name }}</div>
                  <div class="smaller text-muted">{{ c.tax_id }} · {{ c.phone }}</div>
                </div>
              </button>
            </div>
            <p v-if="newOrder.customerQuery.length >= 2 && !newOrder.customerSearching && !newOrder.customerResults.length"
               class="smaller text-muted mt-1 mb-0">Sin resultados.</p>
          </div>
          <div v-else class="d-flex align-items-center gap-3 p-3 rounded-3 bg-body-tertiary border">
            <div class="flex-grow-1">
              <div class="small fw-bold text-body-emphasis">{{ newOrder.selectedCustomer.business_name || newOrder.selectedCustomer.name }}</div>
              <div class="smaller text-muted">NIT/CI: {{ newOrder.selectedCustomer.tax_id }} · Tel: {{ newOrder.selectedCustomer.phone }}</div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3" @click="clearCustomer">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div v-if="newOrderErrors.customer_id" class="text-danger smaller mt-1">{{ newOrderErrors.customer_id }}</div>
        </div>

        <!-- SECCIÓN: Productos -->
        <div class="mb-4">
          <p class="smaller fw-800 text-body-secondary text-uppercase mb-2">2. Productos</p>
          <div class="d-flex gap-2 mb-2">
            <input v-model="newOrder.productQuery" type="text" class="form-control"
                   placeholder="Buscar producto por nombre o SKU…"
                   @input="debouncedProductSearch">
            <button type="button" class="btn btn-outline-secondary px-3 flex-shrink-0 rounded-pill"
                    :disabled="newOrder.productSearching" @click="searchProducts">
              <span v-if="newOrder.productSearching"><span class="spinner-border spinner-border-sm"></span></span>
              <span v-else><i class="fa-solid fa-magnifying-glass"></i></span>
            </button>
          </div>
          <div v-if="newOrder.productResults.length" class="border rounded-3 overflow-hidden mb-2">
            <button v-for="p in newOrder.productResults" :key="p.id" type="button"
                    class="d-flex align-items-center justify-content-between w-100 px-3 py-2 text-start border-bottom bg-body customer-result-item"
                    :disabled="newOrder.orderItems.some(i => i.product.id === p.id)"
                    @click="addProduct(p)">
              <div>
                <div class="small fw-semibold text-body-emphasis">{{ p.name }}</div>
                <div class="smaller text-muted">{{ p.sku }}</div>
              </div>
              <div class="text-end flex-shrink-0">
                <div class="small fw-bold text-body-emphasis">Bs. {{ fmtMoney(p.sale_price) }}</div>
                <span v-if="newOrder.orderItems.some(i => i.product.id === p.id)" class="smaller text-success">✓ Agregado</span>
              </div>
            </button>
          </div>
          <!-- Items agregados -->
          <div v-if="newOrder.orderItems.length" class="border rounded-3 overflow-hidden">
            <div v-for="(item, idx) in newOrder.orderItems" :key="idx"
                 class="d-flex align-items-center gap-3 px-3 py-2 border-bottom bg-body">
              <div class="flex-grow-1 small fw-semibold text-body-emphasis">{{ item.product.name }}</div>
              <div class="d-flex align-items-center gap-2 flex-shrink-0">
                <input v-model.number="item.qty" type="number" min="1" max="99999"
                       class="form-control form-control-sm text-center" style="width:70px;">
                <span class="small text-muted" style="min-width:80px;">Bs. {{ fmtMoney(item.product.sale_price * item.qty) }}</span>
                <button type="button" class="btn btn-sm btn-outline-danger rounded-circle p-0" style="width:26px;height:26px;" @click="removeProduct(idx)">
                  <i class="fa-solid fa-xmark" style="font-size:.65rem;"></i>
                </button>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center px-3 py-2 bg-body-tertiary">
              <span class="small fw-bold text-body-secondary text-uppercase">Total estimado</span>
              <span class="fw-bold text-body-emphasis">Bs. {{ fmtMoney(newOrderTotal) }}</span>
            </div>
          </div>
          <div v-if="newOrderErrors.items" class="text-danger smaller mt-1">{{ newOrderErrors.items }}</div>
        </div>

        <!-- SECCIÓN: Envío -->
        <div>
          <p class="smaller fw-800 text-body-secondary text-uppercase mb-2">3. Envío y notas</p>
          <div class="mb-3">
            <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-1">Dirección de entrega *</label>
            <input v-model="newOrder.shipping_address" type="text" class="form-control"
                   :class="{ 'is-invalid': newOrderErrors.shipping_address }"
                   placeholder="Calle, Nro, Zona, Ciudad">
            <div class="invalid-feedback">{{ newOrderErrors.shipping_address }}</div>
          </div>
          <div>
            <label class="form-label smaller fw-800 text-body-secondary text-uppercase mb-1">Notas internas</label>
            <textarea v-model="newOrder.notes" class="form-control" rows="2" placeholder="Instrucciones especiales, detalles del cliente…"></textarea>
          </div>
        </div>

      </div>
      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showNewOrderModal = false">Cancelar</BaseButton>
          <BaseButton variant="brand" class="rounded-pill px-5 sol-shadow-brand" :loading="creatingOrder" @click="submitNewOrder">
            <i class="fa-solid fa-check me-2"></i>Crear Pedido
          </BaseButton>
        </div>
      </template>
    </BaseModal>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import api from '../plugins/axios';
import { Toast } from '../plugins/swal';
import BaseDataGrid    from '../components/base/BaseDataGrid.vue';
import BaseButton      from '../components/base/BaseButton.vue';
import BaseModal       from '../components/base/BaseModal.vue';
import BaseFilterSelect from '../components/base/BaseFilterSelect.vue';
import OrderDetailPanel from './OrderDetailPanel.vue';

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

const statusOptions = [
  { label: 'Todos los estados', value: '' },
  { label: 'Pendientes',        value: 'pending' },
  { label: 'Confirmados',       value: 'confirmed' },
  { label: 'En Producción',     value: 'in_production' },
  { label: 'Listos',            value: 'ready' },
  { label: 'Enviados',          value: 'shipped' },
  { label: 'Entregados',        value: 'delivered' },
  { label: 'Cancelados',        value: 'cancelled' },
  { label: 'Devueltos',         value: 'returned' },
];

const gridColumns = [
  { label: 'REFERENCIA / CLIENTE', key: 'order_info',   width: '40%' },
  { label: 'ÍTEMS',                key: 'items_count',  align: 'center' },
  { label: 'TOTAL',                key: 'total_amount', align: 'end' },
  { label: 'ESTADO',               key: 'status' },
  { label: 'FECHA',                key: 'created_at' },
];

// ── LISTADO ───────────────────────────────────────────────────────────
const orders  = ref([]);
const meta    = ref({});
const loading = ref(false);
const filters = reactive({ status: '', search: '', from: '', to: '' });
let searchTimer = null;

const paginationObj = computed(() => ({
  current_page: meta.value.current_page ?? 1,
  last_page:    meta.value.last_page    ?? 1,
  total:        meta.value.total        ?? 0,
  from:         meta.value.from         ?? 0,
  to:           meta.value.to           ?? 0,
}));

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

function handleSearch(value) {
  filters.search = value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => fetchOrders(1), 380);
}

function clearFilters() {
  Object.assign(filters, { status: '', search: '', from: '', to: '' });
  fetchOrders(1);
}

// ── DETALLE ───────────────────────────────────────────────────────────
const showDetail     = ref(false);
const selectedOrderId = ref('');

function openDetail(orderId) {
  selectedOrderId.value = orderId;
  showDetail.value      = true;
}

function closeDetail() {
  showDetail.value      = false;
  selectedOrderId.value = '';
}

// ── NUEVA ORDEN ───────────────────────────────────────────────────────
const showNewOrderModal = ref(false);
const creatingOrder     = ref(false);

const newOrder = reactive({
  customerQuery:   '',
  customerResults: [],
  customerSearching: false,
  selectedCustomer: null,
  productQuery:    '',
  productResults:  [],
  productSearching: false,
  orderItems:      [],
  shipping_address: '',
  notes:           '',
});

const newOrderErrors = reactive({ customer_id: '', items: '', shipping_address: '' });

const newOrderTotal = computed(() =>
  newOrder.orderItems.reduce((s, i) => s + (i.product.sale_price * i.qty), 0)
);

function openNewOrderModal() {
  Object.assign(newOrder, {
    customerQuery: '', customerResults: [], customerSearching: false, selectedCustomer: null,
    productQuery: '', productResults: [], productSearching: false, orderItems: [],
    shipping_address: '', notes: '',
  });
  Object.assign(newOrderErrors, { customer_id: '', items: '', shipping_address: '' });
  showNewOrderModal.value = true;
}

let customerTimer = null;
function debouncedCustomerSearch() {
  clearTimeout(customerTimer);
  if (newOrder.customerQuery.length < 2) { newOrder.customerResults = []; return; }
  customerTimer = setTimeout(searchCustomers, 350);
}

async function searchCustomers() {
  if (newOrder.customerQuery.length < 2) return;
  newOrder.customerSearching = true;
  try {
    const { data } = await api.get('/customers', { params: { search: newOrder.customerQuery, active: true } });
    newOrder.customerResults = (data.data ?? []).slice(0, 6);
  } catch { newOrder.customerResults = []; }
  finally { newOrder.customerSearching = false; }
}

function selectCustomer(c) {
  newOrder.selectedCustomer = c;
  newOrder.customerResults  = [];
  newOrder.customerQuery    = '';
  if (!newOrder.shipping_address && c.address) newOrder.shipping_address = c.address;
}

function clearCustomer() {
  newOrder.selectedCustomer = null;
}

let productTimer = null;
function debouncedProductSearch() {
  clearTimeout(productTimer);
  if (newOrder.productQuery.length < 2) { newOrder.productResults = []; return; }
  productTimer = setTimeout(searchProducts, 350);
}

async function searchProducts() {
  if (newOrder.productQuery.length < 2) return;
  newOrder.productSearching = true;
  try {
    const { data } = await api.get('/public/products', { params: { search: newOrder.productQuery } });
    newOrder.productResults = (data.data ?? []).slice(0, 6);
  } catch { newOrder.productResults = []; }
  finally { newOrder.productSearching = false; }
}

function addProduct(p) {
  if (newOrder.orderItems.some(i => i.product.id === p.id)) return;
  newOrder.orderItems.push({ product: p, qty: 1 });
  newOrder.productResults = [];
  newOrder.productQuery   = '';
}

function removeProduct(idx) {
  newOrder.orderItems.splice(idx, 1);
}

async function submitNewOrder() {
  Object.assign(newOrderErrors, { customer_id: '', items: '', shipping_address: '' });
  let valid = true;
  if (!newOrder.selectedCustomer)       { newOrderErrors.customer_id       = 'Selecciona un cliente.';          valid = false; }
  if (!newOrder.orderItems.length)      { newOrderErrors.items              = 'Agrega al menos un producto.';    valid = false; }
  if (!newOrder.shipping_address.trim()){ newOrderErrors.shipping_address   = 'La dirección es obligatoria.';   valid = false; }
  if (!valid) return;

  creatingOrder.value = true;
  try {
    const { data } = await api.post('/orders', {
      customer_id:      newOrder.selectedCustomer.id,
      shipping_address: newOrder.shipping_address.trim(),
      notes:            newOrder.notes.trim() || null,
      items:            newOrder.orderItems.map(i => ({ product_id: i.product.id, quantity: i.qty })),
    });
    showNewOrderModal.value = false;
    Toast.fire({ icon: 'success', title: 'Pedido creado correctamente' });
    await fetchOrders(1);
    // Abrir el detalle del pedido recién creado
    openDetail(data.order?.id ?? data.data?.id);
  } catch (e) {
    const errs = e.response?.data?.errors ?? {};
    if (errs.customer_id)      newOrderErrors.customer_id      = errs.customer_id[0];
    if (errs.items)            newOrderErrors.items            = errs.items[0];
    if (errs.shipping_address) newOrderErrors.shipping_address = errs.shipping_address[0];
    if (!Object.keys(errs).length) {
      Toast.fire({ icon: 'error', title: e.response?.data?.message ?? 'Error al crear el pedido.' });
    }
  } finally {
    creatingOrder.value = false;
  }
}

// ── HELPERS ───────────────────────────────────────────────────────────
function customerName(c) {
  if (!c) return '—';
  return c.business_name || c.name || '—';
}
function fmtMoney(v) {
  return Number(v ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Cargar al montar
import { onMounted } from 'vue';
onMounted(() => fetchOrders());
</script>

<style scoped>
.badge-sol-pending {
  background-color: #fffbeb !important; color: #78350f !important; border: 1px solid #fde68a !important;
}
[data-theme="dark"] .badge-sol-pending, [data-theme="semidark"] .badge-sol-pending {
  background-color: rgba(217,119,6,.15) !important; color: #fbbf24 !important; border-color: rgba(217,119,6,.3) !important;
}
.customer-result-item { transition: background .15s ease; cursor: pointer; }
.customer-result-item:hover:not(:disabled) { background: var(--bg-hover) !important; }
.customer-result-item:disabled { opacity: .55; cursor: default; }
</style>
