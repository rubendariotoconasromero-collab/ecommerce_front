<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Encabezado -->
    <div class="sol-page-header mb-3">
      <div>
        <h2 class="sol-page-title">Control de Inventario</h2>
        <p class="sol-page-subtitle">Monitorea niveles de stock, unidades reservadas por pedidos, alertas de reorden y realiza ajustes físicos.</p>
      </div>
      <div class="d-flex align-items-center gap-3">
        <!-- KPI Rápido: Productos con Bajo Stock -->
        <div
          v-if="lowStockCount > 0"
          class="badge rounded-pill d-flex align-items-center gap-2 px-3 py-2 animate__animated animate__pulse animate__infinite"
          style="background: rgba(239, 68, 68, 0.1); color: var(--sol-color-danger); border: 1px solid rgba(239, 68, 68, 0.15);"
        >
          <i class="fa-solid fa-triangle-exclamation"></i>
          <span class="sol-fw-800 smaller text-uppercase">{{ lowStockCount }} PRODUCTOS BAJO MÍNIMO</span>
        </div>

        <BaseButton
          variant="brand"
          class="rounded-pill px-4 sol-shadow-brand"
          @click="$router.push({ name: 'inventario-ajuste' })"
        >
          <i class="fa-solid fa-arrow-right-to-bracket me-2"></i>
          Registrar Ajuste
        </BaseButton>

        <BaseButton variant="light" class="rounded-circle p-0" style="width: 38px; height: 38px;" @click="handleRefresh">
          <i class="fa-solid fa-rotate"></i>
        </BaseButton>
      </div>
    </div>

    <!-- DataGrid -->
    <BaseDataGrid
      :key="gridKey"
      :items="inventoryData.data"
      :columns="gridColumns"
      :loading="isLoadingData"
      :pagination="inventoryData"
      :getRowClass="getRowClass"
      search-placeholder="Buscar stock por nombre de producto o SKU..."
      compact
      empty-title="No hay registros en el inventario"
      empty-description="Registra productos en el catálogo para inicializar su stock."
      empty-icon="fa-solid fa-warehouse"
      @search="handleSearch"
      @page-change="fetchInventory"
    >
      <!-- Filtros Avanzados -->
      <template #filters>
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <BaseFilterSelect
            v-model="filters.category_id"
            :options="categoryOptions"
            width="180px"
            @update:modelValue="fetchInventory(1)"
          />
          <BaseFilterSelect
            v-model="filters.low_stock"
            :options="stockStatusOptions"
            width="170px"
            @update:modelValue="fetchInventory(1)"
          />
          <BaseFilterSelect
            v-model="filters.active"
            :options="stateOptions"
            width="140px"
            @update:modelValue="fetchInventory(1)"
          />
          <button
            v-if="hasActiveFilters"
            type="button"
            class="btn btn-light rounded-pill px-3 border"
            style="height: 38px; font-size: 0.8125rem; font-weight: 600;"
            @click="resetFilters"
          >
            <i class="fa-solid fa-xmark me-1"></i> Limpiar
          </button>
        </div>
      </template>

      <!-- Columna: Producto y SKU -->
      <template #col-product_info="{ item }">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-light text-secondary border d-flex align-items-center justify-content-center rounded-3" style="width: 40px; height: 40px; flex-shrink: 0;">
            <i class="fa-solid fa-boxes-stacked" style="font-size: 0.95rem;"></i>
          </div>
          <div>
            <div class="fw-bold text-body-emphasis fs-6 d-flex align-items-center flex-wrap gap-2 mb-0.5">
              {{ item.product?.name }}
              <span
                v-if="item.qty_available < item.qty_reserved"
                class="badge rounded-pill px-2 py-0.5 sol-fw-800"
                style="background: rgba(239, 68, 68, 0.1); color: var(--sol-color-danger); border: 1px solid rgba(239, 68, 68, 0.15); font-size: 0.6rem; letter-spacing: 0.02em;"
                title="El stock físico es menor al stock reservado por pedidos activos."
              >
                <i class="fa-solid fa-triangle-exclamation me-1"></i>Conflicto
              </span>
            </div>
            <div class="text-body-secondary smaller mt-0.5 d-flex align-items-center flex-wrap gap-2">
              <span>SKU: <span class="fw-semibold text-primary">{{ item.product?.sku }}</span></span>
              <span class="opacity-50">&bull;</span>
              <span class="badge bg-light border text-dark px-2 py-0.5 rounded" style="font-size: 0.62rem; font-weight: 700; letter-spacing: 0.01em;">{{ item.product?.category?.name || 'Sin Categoría' }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Columna: Stock Físico Disponible -->
      <template #col-qty_available="{ item, value }">
        <div class="d-flex flex-column align-items-end justify-content-center h-100">
          <span class="fw-bold text-body-emphasis fs-6">{{ value }}</span>
          <span v-if="item.qty_available < item.qty_reserved" class="text-danger sol-smallest fw-medium mt-0.5">
            Déficit: {{ item.qty_reserved - item.qty_available }} unid.
          </span>
        </div>
      </template>

      <!-- Columna: Stock Reservado -->
      <template #col-qty_reserved="{ value }">
        <div class="d-flex align-items-center justify-content-end h-100">
          <span
            v-if="value > 0"
            class="badge rounded-pill px-3 py-1 text-warning border"
            style="background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.15) !important; font-size: 0.75rem; font-weight: 700;"
          >
            <i class="fa-regular fa-clock me-1"></i> {{ value }}
          </span>
          <span v-else class="text-muted smaller">0</span>
        </div>
      </template>

      <!-- Columna: Stock En Producción -->
      <template #col-qty_in_production="{ value }">
        <div class="d-flex align-items-center justify-content-end h-100">
          <span
            v-if="value > 0"
            class="badge rounded-pill px-3 py-1 text-info border"
            style="background: rgba(6, 182, 212, 0.1); border-color: rgba(6, 182, 212, 0.15) !important; font-size: 0.75rem; font-weight: 700;"
          >
            <i class="fa-solid fa-arrows-spin fa-spin me-1" style="font-size: 0.7rem; --fa-animation-duration: 3s;"></i> {{ value }}
          </span>
          <span v-else class="text-muted smaller">0</span>
        </div>
      </template>

      <!-- Columna: Stock Disponible para Venta -->
      <template #col-qty_sellable="{ item, value }">
        <div class="d-flex align-items-center justify-content-end h-100">
          <span class="fw-bold fs-6" :class="item.is_low_stock ? 'text-danger' : 'text-success'">
            {{ value }}
          </span>
        </div>
      </template>

      <!-- Columna: Punto de Reorden (edición inline) -->
      <template #col-reorder_point="{ item, value }">
        <div class="d-flex align-items-center justify-content-end h-100">

          <!-- Modo lectura -->
          <div
            v-if="editingProductId !== item.product_id"
            class="reorder-cell d-flex align-items-center gap-2"
            @click="startEditing(item)"
            title="Clic para editar el punto de reorden"
          >
            <span class="font-monospace" :class="value > 0 ? 'text-body-emphasis' : 'text-muted'">
              {{ value }}
            </span>
            <i class="fa-solid fa-pen-to-square edit-icon text-muted" style="font-size: 0.7rem;"></i>
          </div>

          <!-- Modo edición -->
          <div v-else class="d-flex align-items-center gap-1">
            <input
              :ref="el => { if (el) el.focus() }"
              type="number"
              min="0"
              class="form-control form-control-sm text-center font-monospace fw-bold"
              style="width: 70px; border-radius: 0.5rem;"
              v-model.number="editingValue"
              @keydown.enter="saveReorderPoint(item)"
              @keydown.escape="cancelEditing"
              @blur="saveReorderPoint(item)"
            />
            <span v-if="isSavingReorder" class="text-muted" style="font-size: 0.75rem;">
              <i class="fa-solid fa-spinner fa-spin"></i>
            </span>
          </div>

        </div>
      </template>

      <!-- Acciones de Fila -->
      <template #item-actions="{ item }">
        <li>
          <button class="dropdown-item rounded-3 py-2 small" @click="goToAdjust(item)">
            <i class="fa-solid fa-sliders me-2 text-primary"></i>Registrar Ajuste
          </button>
        </li>
      </template>
    </BaseDataGrid>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../plugins/axios';
import { Toast, showBackendError } from '../plugins/swal';

import BaseButton from '../components/base/BaseButton.vue';
import BaseDataGrid from '../components/base/BaseDataGrid.vue';
import BaseFilterSelect from '../components/base/BaseFilterSelect.vue';

const router = useRouter();

// ─── Estado ───────────────────────────────────────────────────────────────────

const inventoryData     = ref({ data: [], current_page: 1, last_page: 1, total: 0 });
const categories        = ref([]);
const isLoadingData     = ref(true);
const gridKey           = ref(0);
const editingProductId  = ref(null);
const editingValue      = ref(0);
const isSavingReorder   = ref(false);
let debounceTimeout     = null;

const filters = reactive({
  category_id: '',
  low_stock:   '',
  active:      '',
  search:      ''
});

// ─── Opciones de filtros ──────────────────────────────────────────────────────

const stateOptions = [
  { label: 'Todos los Estados',    value: '' },
  { label: 'Productos Activos',    value: '1' },
  { label: 'Productos Inactivos',  value: '0' }
];

const stockStatusOptions = [
  { label: 'Todos los Niveles',    value: '' },
  { label: 'Bajo Stock (Reorden)', value: 'true' }
];

const categoryOptions = computed(() => [
  { label: 'Todas las Categorías', value: '' },
  ...categories.value.map(cat => ({ label: cat.name, value: cat.id }))
]);

// ─── Columnas del grid ────────────────────────────────────────────────────────

const gridColumns = [
  { label: 'INFORMACIÓN DEL PRODUCTO', key: 'product_info',      width: '35%' },
  { label: 'STOCK FÍSICO',             key: 'qty_available',      align: 'end' },
  { label: 'COMPROMETIDO',             key: 'qty_reserved',       align: 'end' },
  { label: 'EN PRODUCCIÓN',            key: 'qty_in_production',  align: 'end' },
  { label: 'DISPONIBLE',               key: 'qty_sellable',       align: 'end' },
  { label: 'PUNTO REORDEN',            key: 'reorder_point',      align: 'end' }
];

const getRowClass = (item) => item.is_low_stock ? 'row-low-stock' : '';

// ─── Computados ───────────────────────────────────────────────────────────────

const hasActiveFilters = computed(() =>
  filters.category_id !== '' || filters.low_stock !== '' || filters.active !== ''
);

const lowStockCount = computed(() =>
  inventoryData.value.data.filter(item => item.is_low_stock).length
);

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

onMounted(() => {
  fetchCategories();
  fetchInventory();
});

// ─── Handlers ─────────────────────────────────────────────────────────────────

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    categories.value = response.data;
  } catch {
    // silencioso
  }
};

const fetchInventory = async (page = 1) => {
  isLoadingData.value = true;
  try {
    const params = { page };
    if (filters.search)        params.search      = filters.search;
    if (filters.category_id)   params.category_id = filters.category_id;
    if (filters.low_stock)     params.low_stock   = filters.low_stock === 'true' ? 1 : 0;
    if (filters.active !== '') params.active      = filters.active;

    const response = await api.get('/inventory', { params });
    inventoryData.value = response.data;
  } catch {
    Toast.fire({ icon: 'error', title: 'Error al sincronizar inventario' });
  } finally {
    isLoadingData.value = false;
  }
};

const handleSearch = (value) => {
  filters.search = value;
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => fetchInventory(1), 450);
};

const handleRefresh = () => {
  Object.assign(filters, { search: '', category_id: '', low_stock: '', active: '' });
  gridKey.value += 1;
  fetchInventory(1);
};

const resetFilters = () => {
  Object.assign(filters, { category_id: '', low_stock: '', active: '' });
  fetchInventory(1);
};

// ─── Edición inline del punto de reorden ─────────────────────────────────────

const startEditing = (item) => {
  editingProductId.value = item.product_id;
  editingValue.value     = item.reorder_point;
};

const cancelEditing = () => {
  editingProductId.value = null;
};

const saveReorderPoint = async (item) => {
  // Evitar doble llamada si blur se dispara después de Enter
  if (!editingProductId.value || isSavingReorder.value) return;

  const newValue = Number(editingValue.value);

  // Sin cambio: salir sin llamada al servidor
  if (newValue === item.reorder_point) {
    cancelEditing();
    return;
  }

  isSavingReorder.value = true;
  try {
    const response = await api.patch(`/inventory/${item.product_id}/reorder-point`, {
      reorder_point: newValue,
    });

    // Actualizar el valor localmente sin recargar toda la tabla
    item.reorder_point = response.data.inventory.reorder_point;
    item.is_low_stock  = response.data.inventory.is_low_stock;

    cancelEditing();
    Toast.fire({ icon: 'success', title: 'Punto de reorden actualizado' });
  } catch (error) {
    showBackendError(error, 'Error al actualizar el punto de reorden');
  } finally {
    isSavingReorder.value = false;
  }
};

// ─── Navegación al módulo de ajuste ──────────────────────────────────────────

// Navega al módulo de ajuste con el producto de la fila pre-cargado
const goToAdjust = (item) => {
  router.push({
    name: 'inventario-ajuste',
    query: {
      product_id:    item.product_id,
      product_name:  item.product?.name,
      product_sku:   item.product?.sku,
      qty_available: item.qty_available,
      cost_price:    item.product?.cost_price,
      sale_price:    item.product?.sale_price,
    }
  });
};
</script>

<style scoped>
:deep(.row-low-stock) {
  background-color: rgba(239, 68, 68, 0.05) !important;
}
:deep(.row-low-stock:hover) {
  background-color: rgba(239, 68, 68, 0.08) !important;
}

.reorder-cell {
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  transition: background 0.15s;
}
.reorder-cell .edit-icon {
  opacity: 0;
  transition: opacity 0.15s;
}
.reorder-cell:hover {
  background: var(--bs-tertiary-bg);
}
.reorder-cell:hover .edit-icon {
  opacity: 1;
}
</style>
