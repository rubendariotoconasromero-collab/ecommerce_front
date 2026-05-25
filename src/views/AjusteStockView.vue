<template>
  <div class="animate__animated animate__fadeIn">

    <!-- Encabezado con botón Regresar -->
    <div class="sol-page-header mb-3">
      <div class="d-flex align-items-center gap-3">
        <button
          type="button"
          class="btn btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center"
          style="width: 38px; height: 38px;"
          @click="$router.push({ name: 'inventario' })"
          title="Volver al Control de Inventario"
        >
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <div>
          <h2 class="sol-page-title">Registro de Ajuste de Stock</h2>
          <p class="sol-page-subtitle">Registra ingresos, salidas y correcciones de inventario para múltiples productos en un solo lote.</p>
        </div>
      </div>
    </div>

    <div class="row g-4">

      <!-- Panel Izquierdo: Configuración del Lote -->
      <div class="col-12 col-lg-3">
        <div class="card border shadow-sm h-100" style="border-radius: var(--radius-lg);">
          <div class="card-body p-4 d-flex flex-column gap-3">
            <div>
              <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
                Tipo de Ajuste <span class="text-danger">*</span>
              </label>
              <div class="d-flex flex-column gap-2">
                <label
                  v-for="opt in adjustmentTypes"
                  :key="opt.value"
                  class="d-flex align-items-start gap-2 p-2 rounded-3 border cursor-pointer"
                  :class="batchForm.adjustment_type === opt.value ? 'border-primary bg-primary bg-opacity-10' : 'bg-body-tertiary'"
                  style="cursor: pointer;"
                >
                  <input
                    type="radio"
                    :value="opt.value"
                    v-model="batchForm.adjustment_type"
                    class="form-check-input mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <div class="fw-bold small" :style="batchForm.adjustment_type === opt.value ? 'color: var(--color-primary)' : ''">
                      <i :class="opt.icon" class="me-1"></i>{{ opt.label }}
                    </div>
                    <div class="sol-smallest text-muted">{{ opt.description }}</div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
                Notas del Lote
              </label>
              <textarea
                class="form-control"
                rows="4"
                v-model="batchForm.notes"
                placeholder="Motivo general del ajuste, número de acta, auditor, etc..."
                style="font-size: 0.85rem; resize: none;"
              ></textarea>
            </div>

            <!-- Resumen del Lote -->
            <div
              v-if="lines.length > 0"
              class="mt-auto p-3 rounded-3 border"
              style="background: rgba(var(--bs-primary-rgb), 0.06); border-color: rgba(var(--bs-primary-rgb), 0.15) !important;"
            >
              <div class="smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Resumen</div>
              <div class="d-flex flex-column gap-1">
                <div class="d-flex justify-content-between smaller">
                  <span class="text-muted">Productos:</span>
                  <span class="fw-bold">{{ lines.length }}</span>
                </div>
                <div class="d-flex justify-content-between smaller">
                  <span class="text-muted">Unidades ajustadas:</span>
                  <span class="fw-bold" :class="totalDelta >= 0 ? 'text-success' : 'text-danger'">
                    {{ totalDelta >= 0 ? '+' : '' }}{{ totalDelta }}
                  </span>
                </div>
                <div class="d-flex justify-content-between smaller" v-if="linesWithPriceChange > 0">
                  <span class="text-muted">Con cambio de precio:</span>
                  <span class="fw-bold text-info">{{ linesWithPriceChange }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Panel Derecho: Búsqueda + Tabla de Líneas -->
      <div class="col-12 col-lg-9">

        <!-- Barra de búsqueda de productos -->
        <div class="card border shadow-sm mb-3" style="border-radius: var(--radius-lg);">
          <div class="card-body p-3">
            <div class="d-flex gap-2 align-items-center">
              <div class="position-relative flex-grow-1">
                <i class="fa-solid fa-magnifying-glass position-absolute text-muted" style="left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.85rem;"></i>
                <input
                  type="text"
                  class="form-control ps-5"
                  placeholder="Buscar producto por nombre o SKU para agregar al ajuste..."
                  v-model="searchQuery"
                  @input="handleProductSearch"
                  @keydown.escape="clearSearch"
                  autocomplete="off"
                  style="font-size: 0.875rem;"
                />
              </div>
              <button
                v-if="searchQuery"
                type="button"
                class="btn btn-light border"
                @click="clearSearch"
                style="height: 38px;"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Resultados de búsqueda -->
            <div
              v-if="searchResults.length > 0"
              class="mt-2 border rounded-3 overflow-hidden"
              style="max-height: 280px; overflow-y: auto;"
            >
              <div
                v-for="product in searchResults"
                :key="product.id"
                class="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
                :class="isAlreadyAdded(product.id) ? 'opacity-50 bg-body-secondary' : 'bg-body hover-bg'"
                style="cursor: pointer;"
                @click="!isAlreadyAdded(product.id) && addProduct(product)"
              >
                <div>
                  <div class="fw-semibold small">{{ product.name }}</div>
                  <div class="text-muted sol-smallest">
                    SKU: <span class="fw-bold text-primary">{{ product.sku }}</span>
                    <span class="mx-2 opacity-50">&bull;</span>
                    Stock actual:
                    <span class="fw-bold" :class="product.inventory?.qty_available > 0 ? 'text-success' : 'text-danger'">
                      {{ product.inventory?.qty_available ?? 0 }}
                    </span>
                  </div>
                </div>
                <div>
                  <span v-if="isAlreadyAdded(product.id)" class="badge bg-secondary rounded-pill small px-3">
                    Ya agregado
                  </span>
                  <button v-else type="button" class="btn btn-sm btn-primary rounded-pill px-3" style="font-size: 0.75rem;">
                    <i class="fa-solid fa-plus me-1"></i> Agregar
                  </button>
                </div>
              </div>
            </div>

            <div v-if="isSearching" class="text-center text-muted py-2 small">
              <i class="fa-solid fa-spinner fa-spin me-2"></i>Buscando...
            </div>
          </div>
        </div>

        <!-- Tabla de Líneas del Ajuste -->
        <div class="card border shadow-sm" style="border-radius: var(--radius-lg);">
          <div class="card-header border-bottom px-4 py-3 d-flex align-items-center justify-content-between" style="background: transparent;">
            <div class="fw-bold text-body-emphasis">
              <i class="fa-solid fa-table-list me-2 text-primary"></i>
              Detalle del Ajuste
              <span v-if="lines.length > 0" class="badge bg-primary rounded-pill ms-2 px-2" style="font-size: 0.7rem;">{{ lines.length }}</span>
            </div>
            <button
              v-if="lines.length > 0"
              type="button"
              class="btn btn-sm btn-outline-danger rounded-pill"
              @click="clearAllLines"
              style="font-size: 0.75rem;"
            >
              <i class="fa-solid fa-trash me-1"></i> Limpiar todo
            </button>
          </div>

          <!-- Empty State -->
          <div v-if="lines.length === 0" class="py-5 text-center text-muted">
            <i class="fa-solid fa-boxes-stacked mb-3" style="font-size: 2.5rem; opacity: 0.25;"></i>
            <p class="fw-semibold mb-1">Sin productos agregados</p>
            <p class="smaller">Usa el buscador de arriba para agregar productos al ajuste.</p>
          </div>

          <!-- Tabla con Líneas -->
          <div v-else class="table-responsive">
            <table class="table table-sm align-middle mb-0" style="font-size: 0.835rem;">
              <thead class="table-light">
                <tr>
                  <th class="ps-4 py-3" style="min-width: 200px;">PRODUCTO</th>
                  <th class="text-end py-3" style="width: 90px;">STOCK ANT.</th>
                  <th class="text-center py-3" style="width: 110px;">CANTIDAD</th>
                  <th class="text-end py-3" style="width: 90px;">STOCK NUEVO</th>
                  <th class="text-end py-3" style="width: 110px;">P. COSTO</th>
                  <th class="text-end py-3" style="width: 110px;">P. VENTA</th>
                  <th class="py-3" style="min-width: 140px;">NOTAS LÍNEA</th>
                  <th class="text-center py-3" style="width: 54px;"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(line, idx) in lines"
                  :key="line.product_id"
                  class="border-bottom"
                  :class="getLineClass(line)"
                >
                  <!-- Producto -->
                  <td class="ps-4 py-2">
                    <div class="fw-semibold text-body-emphasis">{{ line.product_name }}</div>
                    <div class="sol-smallest text-primary fw-bold">{{ line.product_sku }}</div>
                  </td>

                  <!-- Stock Anterior -->
                  <td class="text-end py-2">
                    <span class="fw-bold font-monospace">{{ line.previous_qty }}</span>
                  </td>

                  <!-- Cantidad a Ajustar -->
                  <td class="py-2">
                    <input
                      type="number"
                      class="form-control form-control-sm text-center font-monospace fw-bold"
                      :min="batchForm.adjustment_type === 'correction' ? undefined : 1"
                      v-model.number="line.quantity"
                      @input="() => recalcLine(line)"
                      style="border-radius: 0.5rem;"
                    />
                  </td>

                  <!-- Stock Nuevo (computed) -->
                  <td class="text-end py-2">
                    <span
                      class="fw-bold font-monospace"
                      :class="computedNewQty(line) > line.previous_qty ? 'text-success' : computedNewQty(line) < line.previous_qty ? 'text-danger' : 'text-muted'"
                    >
                      {{ computedNewQty(line) }}
                    </span>
                    <div v-if="computedDelta(line) !== 0" class="sol-smallest mt-0.5" :class="computedDelta(line) > 0 ? 'text-success' : 'text-danger'">
                      {{ computedDelta(line) > 0 ? '+' : '' }}{{ computedDelta(line) }}
                    </div>
                  </td>

                  <!-- Precio Costo -->
                  <td class="py-2">
                    <div class="d-flex flex-column align-items-end gap-1">
                      <div class="sol-smallest text-muted font-monospace">{{ formatPrice(line.previous_cost_price) }}</div>
                      <input
                        type="number"
                        class="form-control form-control-sm text-end font-monospace"
                        min="0"
                        step="0.01"
                        v-model.number="line.new_cost_price"
                        placeholder="Sin cambio"
                        style="border-radius: 0.5rem; font-size: 0.78rem; max-width: 100px;"
                      />
                    </div>
                  </td>

                  <!-- Precio Venta -->
                  <td class="py-2">
                    <div class="d-flex flex-column align-items-end gap-1">
                      <div class="sol-smallest text-muted font-monospace">{{ formatPrice(line.previous_sale_price) }}</div>
                      <input
                        type="number"
                        class="form-control form-control-sm text-end font-monospace"
                        min="0"
                        step="0.01"
                        v-model.number="line.new_sale_price"
                        placeholder="Sin cambio"
                        style="border-radius: 0.5rem; font-size: 0.78rem; max-width: 100px;"
                      />
                    </div>
                  </td>

                  <!-- Notas de Línea -->
                  <td class="py-2">
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="line.line_notes"
                      placeholder="Opcional..."
                      maxlength="200"
                      style="border-radius: 0.5rem; font-size: 0.78rem;"
                    />
                  </td>

                  <!-- Eliminar línea -->
                  <td class="text-center py-2">
                    <button
                      type="button"
                      class="btn btn-sm btn-link text-danger p-1"
                      @click="removeLine(idx)"
                      title="Quitar del ajuste"
                    >
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer de la tabla / Acciones -->
          <div
            v-if="lines.length > 0"
            class="card-footer border-top px-4 py-3 d-flex align-items-center justify-content-between flex-wrap gap-3"
            style="background: transparent;"
          >
            <div class="smaller text-muted">
              <i class="fa-solid fa-circle-info me-1"></i>
              Los precios en gris son los valores actuales. Completa el campo inferior solo si deseas actualizarlos.
            </div>
            <div class="d-flex gap-2">
              <BaseButton
                variant="light"
                class="rounded-pill px-4"
                @click="$router.push({ name: 'inventario' })"
              >
                Cancelar
              </BaseButton>
              <BaseButton
                variant="brand"
                class="rounded-pill px-5 sol-shadow-brand"
                :loading="isSaving"
                :disabled="lines.length === 0 || !batchForm.adjustment_type"
                @click="submitAdjustment"
              >
                <i class="fa-solid fa-check me-2"></i>
                Confirmar Ajuste ({{ lines.length }} producto{{ lines.length !== 1 ? 's' : '' }})
              </BaseButton>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Historial de Lotes (sección desplegable) -->
    <div class="card border shadow-sm mt-4" style="border-radius: var(--radius-lg);">
      <div
        class="card-header border-bottom px-4 py-3 d-flex align-items-center justify-content-between"
        style="background: transparent; cursor: pointer;"
        @click="showHistory = !showHistory"
      >
        <div class="fw-bold text-body-emphasis">
          <i class="fa-solid fa-clock-rotate-left me-2 text-secondary"></i>
          Historial de Ajustes Registrados
        </div>
        <i class="fa-solid text-muted" :class="showHistory ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </div>
      <div v-if="showHistory">
        <div v-if="isLoadingHistory" class="text-center py-4 text-muted small">
          <i class="fa-solid fa-spinner fa-spin me-2"></i>Cargando historial...
        </div>
        <div v-else-if="historyData.data?.length === 0" class="text-center py-4 text-muted small">
          <i class="fa-solid fa-inbox me-2"></i>Aún no hay ajustes registrados.
        </div>
        <div v-else class="table-responsive">
          <table class="table table-sm align-middle mb-0" style="font-size: 0.835rem;">
            <thead class="table-light">
              <tr>
                <th class="ps-4 py-3">N° LOTE</th>
                <th class="py-3">TIPO</th>
                <th class="text-center py-3">PRODUCTOS</th>
                <th class="py-3">NOTAS</th>
                <th class="py-3">REGISTRADO POR</th>
                <th class="py-3">FECHA</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="batch in historyData.data"
                :key="batch.id"
                class="border-bottom"
              >
                <td class="ps-4 py-2 fw-bold font-monospace text-primary">{{ batch.batch_number }}</td>
                <td class="py-2">
                  <span class="badge rounded-pill px-3 py-1" :class="typeBadgeClass(batch.adjustment_type)">
                    <i :class="typeIcon(batch.adjustment_type)" class="me-1"></i>
                    {{ batch.type_label }}
                  </span>
                </td>
                <td class="text-center py-2">
                  <span class="fw-bold">{{ batch.lines_count }}</span>
                </td>
                <td class="py-2 text-muted smaller" style="max-width: 200px;">
                  <span class="text-truncate d-block" style="max-width: 180px;" :title="batch.notes">
                    {{ batch.notes || '—' }}
                  </span>
                </td>
                <td class="py-2 smaller">{{ batch.creator?.name || 'Sistema' }}</td>
                <td class="py-2 smaller text-muted">{{ formatDate(batch.confirmed_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Paginación del historial -->
        <div
          v-if="historyData.last_page > 1"
          class="d-flex justify-content-center py-3 gap-2"
        >
          <button
            class="btn btn-sm btn-light border rounded-pill px-3"
            :disabled="historyData.current_page <= 1"
            @click="fetchHistory(historyData.current_page - 1)"
          >
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span class="btn btn-sm btn-light border rounded-pill px-3 disabled">
            {{ historyData.current_page }} / {{ historyData.last_page }}
          </span>
          <button
            class="btn btn-sm btn-light border rounded-pill px-3"
            :disabled="historyData.current_page >= historyData.last_page"
            @click="fetchHistory(historyData.current_page + 1)"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../plugins/axios';
import { Toast, showBackendError } from '../plugins/swal';
import BaseButton from '../components/base/BaseButton.vue';

const router = useRouter();
const route  = useRoute();

// ─── Estado ───────────────────────────────────────────────────────────────────

const lines        = ref([]);
const isSaving     = ref(false);
const searchQuery  = ref('');
const searchResults = ref([]);
const isSearching  = ref(false);
const showHistory  = ref(false);
const isLoadingHistory = ref(false);
const historyData  = ref({ data: [], current_page: 1, last_page: 1 });

let searchDebounce = null;

const batchForm = reactive({
  adjustment_type: 'entry',
  notes: '',
});

// ─── Opciones de tipo de ajuste ───────────────────────────────────────────────

const adjustmentTypes = [
  {
    value: 'entry',
    label: 'Ingreso',
    icon: 'fa-solid fa-arrow-down text-success',
    description: 'Suma unidades al stock disponible.'
  },
  {
    value: 'exit',
    label: 'Salida',
    icon: 'fa-solid fa-arrow-up text-danger',
    description: 'Resta unidades del stock disponible.'
  },
  {
    value: 'initial_stock',
    label: 'Stock Inicial',
    icon: 'fa-solid fa-box-open text-info',
    description: 'Carga del inventario desde cero.'
  },
  {
    value: 'correction',
    label: 'Corrección',
    icon: 'fa-solid fa-sliders text-warning',
    description: 'Ajuste libre (positivo o negativo).'
  },
];

// ─── Computados ───────────────────────────────────────────────────────────────

const totalDelta = computed(() =>
  lines.value.reduce((sum, line) => sum + computedDelta(line), 0)
);

const linesWithPriceChange = computed(() =>
  lines.value.filter(l => l.new_cost_price != null || l.new_sale_price != null).length
);

// ─── Helpers de cálculo ───────────────────────────────────────────────────────

function computedDelta(line) {
  const qty = Number(line.quantity) || 0;
  if (batchForm.adjustment_type === 'exit') return -qty;
  return qty; // entry, initial_stock, correction
}

function computedNewQty(line) {
  return Math.max(0, line.previous_qty + computedDelta(line));
}

function recalcLine() {
  // Forzar reactividad en los computados — se recalcula automáticamente
}

// ─── Gestión de productos/líneas ──────────────────────────────────────────────

const isAlreadyAdded = (productId) =>
  lines.value.some(l => l.product_id === productId);

function addProduct(product) {
  lines.value.push({
    product_id:         product.id,
    product_name:       product.name,
    product_sku:        product.sku,
    previous_qty:       product.inventory?.qty_available ?? 0,
    previous_cost_price: parseFloat(product.cost_price) || 0,
    previous_sale_price: parseFloat(product.sale_price) || 0,
    quantity:           1,
    new_cost_price:     null,
    new_sale_price:     null,
    line_notes:         '',
  });
  clearSearch();
}

function removeLine(idx) {
  lines.value.splice(idx, 1);
}

function clearAllLines() {
  lines.value = [];
}

// ─── Búsqueda de productos ────────────────────────────────────────────────────

function handleProductSearch() {
  if (searchDebounce) clearTimeout(searchDebounce);
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  searchDebounce = setTimeout(searchProducts, 350);
}

async function searchProducts() {
  if (!searchQuery.value.trim()) return;
  isSearching.value = true;
  try {
    const response = await api.get('/products', {
      params: { search: searchQuery.value, active: 1, nopaginate: true }
    });
    // La respuesta puede ser paginada o directa según nopaginate
    const raw = response.data;
    searchResults.value = Array.isArray(raw) ? raw : (raw.data ?? []);
  } catch {
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
}

function clearSearch() {
  searchQuery.value = '';
  searchResults.value = [];
}

// ─── Envío del ajuste ─────────────────────────────────────────────────────────

async function submitAdjustment() {
  if (lines.value.length === 0) {
    Toast.fire({ icon: 'warning', title: 'Agrega al menos un producto al ajuste.' });
    return;
  }
  if (!batchForm.adjustment_type) {
    Toast.fire({ icon: 'warning', title: 'Selecciona el tipo de ajuste.' });
    return;
  }

  isSaving.value = true;
  try {
    const payload = {
      adjustment_type: batchForm.adjustment_type,
      notes: batchForm.notes || null,
      lines: lines.value.map(line => ({
        product_id:     line.product_id,
        quantity:       Math.abs(Number(line.quantity)) || 1,
        new_cost_price: line.new_cost_price != null && line.new_cost_price !== '' ? Number(line.new_cost_price) : undefined,
        new_sale_price: line.new_sale_price != null && line.new_sale_price !== '' ? Number(line.new_sale_price) : undefined,
        line_notes:     line.line_notes || null,
      })),
    };

    const response = await api.post('/inventory-adjustments', payload);

    Toast.fire({ icon: 'success', title: response.data.message });

    // Limpiar formulario y refrescar historial
    lines.value = [];
    batchForm.notes = '';
    batchForm.adjustment_type = 'entry';
    showHistory.value = true;
    fetchHistory(1);

  } catch (error) {
    showBackendError(error, 'Error al registrar el ajuste de stock.');
  } finally {
    isSaving.value = false;
  }
}

// ─── Historial ────────────────────────────────────────────────────────────────

async function fetchHistory(page = 1) {
  isLoadingHistory.value = true;
  try {
    const response = await api.get('/inventory-adjustments', { params: { page } });
    historyData.value = response.data;
  } catch {
    // silencioso
  } finally {
    isLoadingHistory.value = false;
  }
}

watch(showHistory, (val) => {
  if (val && historyData.value.data.length === 0) fetchHistory(1);
});

// ─── Pre-carga desde query params (cuando viene desde la fila del inventario) ─

onMounted(() => {
  const q = route.query;
  if (q.product_id) {
    lines.value.push({
      product_id:          q.product_id,
      product_name:        q.product_name  ?? '',
      product_sku:         q.product_sku   ?? '',
      previous_qty:        Number(q.qty_available) || 0,
      previous_cost_price: parseFloat(q.cost_price)  || 0,
      previous_sale_price: parseFloat(q.sale_price)  || 0,
      quantity:            1,
      new_cost_price:      null,
      new_sale_price:      null,
      line_notes:          '',
    });
  }
});

// ─── Utilidades de vista ──────────────────────────────────────────────────────

function getLineClass(line) {
  const delta = computedDelta(line);
  if (delta > 0) return 'table-success-subtle';
  if (delta < 0) return 'table-danger-subtle';
  return '';
}

function formatPrice(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function formatDate(dt) {
  if (!dt) return '—';
  return new Intl.DateTimeFormat('es', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(dt));
}

function typeBadgeClass(type) {
  return {
    entry:         'text-success border',
    exit:          'text-danger border',
    initial_stock: 'text-info border',
    correction:    'text-warning border',
  }[type] ?? 'text-secondary border';
}

function typeIcon(type) {
  return {
    entry:         'fa-solid fa-arrow-down',
    exit:          'fa-solid fa-arrow-up',
    initial_stock: 'fa-solid fa-box-open',
    correction:    'fa-solid fa-sliders',
  }[type] ?? 'fa-solid fa-circle';
}
</script>

<style scoped>
.table-success-subtle {
  background-color: rgba(25, 135, 84, 0.04) !important;
}
.table-danger-subtle {
  background-color: rgba(220, 53, 69, 0.04) !important;
}
.hover-bg:hover {
  background-color: var(--bs-tertiary-bg) !important;
}
</style>
