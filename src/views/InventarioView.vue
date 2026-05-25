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

      <!-- Columna Personalizada: Producto y SKU -->
      <template #col-product_info="{ item }">
        <div class="d-flex align-items-center gap-3">
          <div class="avatar-circle-sm bg-light text-secondary border d-flex align-items-center justify-content-center rounded-3" style="width: 40px; height: 40px;">
            <i class="fa-solid fa-boxes-stacked" style="font-size: 0.95rem;"></i>
          </div>
          <div>
            <div class="fw-bold text-body-emphasis fs-6 d-flex align-items-center flex-wrap gap-2 mb-0.5">
              {{ item.product?.name }}
              <!-- Alerta de conflicto entre disponible y reservado -->
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
              <span class="text-slate-300 opacity-50">&bull;</span>
              <span class="badge bg-light border text-dark px-2 py-0.5 rounded" style="font-size: 0.62rem; font-weight: 700; letter-spacing: 0.01em;">{{ item.product?.category?.name || 'Sin Categoría' }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Columna Personalizada: Stock Físico Disponible -->
      <template #col-qty_available="{ item, value }">
        <div class="d-flex flex-column align-items-end justify-content-center h-100">
          <span class="fw-bold text-body-emphasis fs-6">{{ value }}</span>
          <span v-if="item.qty_available < item.qty_reserved" class="text-danger sol-smallest fw-medium mt-0.5">
            Déficit: {{ item.qty_reserved - item.qty_available }} unid.
          </span>
        </div>
      </template>

      <!-- Columna Personalizada: Stock Reservado -->
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

      <!-- Columna Personalizada: Stock En Producción -->
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

      <!-- Columna Personalizada: Stock Disponible para Venta -->
      <template #col-qty_sellable="{ item, value }">
        <div class="d-flex align-items-center justify-content-end h-100">
          <span class="fw-bold fs-6" :class="item.is_low_stock ? 'text-danger' : 'text-success'">
            {{ value }}
          </span>
        </div>
      </template>

      <!-- Columna Personalizada: Punto de Reorden -->
      <template #col-reorder_point="{ value }">
        <div class="d-flex align-items-center justify-content-end h-100">
          <span class="text-muted font-monospace">{{ value }}</span>
        </div>
      </template>

      <!-- Acciones de Fila -->
      <template #item-actions="{ item }">
        <li>
          <button class="dropdown-item rounded-3 py-2 small" @click="openAdjustModal(item)">
            <i class="fa-solid fa-sliders me-2 text-primary"></i>Ajustar Stock
          </button>
        </li>
      </template>
    </BaseDataGrid>

    <!-- Modal Ajustar Stock -->
    <BaseModal
      v-model="showAdjustModal"
      title="Ajuste Manual de Inventario"
      size="md"
    >
      <div v-if="selectedInventory" class="p-2">
        <!-- Tarjeta Informativa del Producto -->
        <div class="p-3 mb-4 rounded-3 border bg-body-tertiary">
          <div class="sol-fw-800 text-body-emphasis mb-1">{{ selectedInventory.product?.name }}</div>
          <div class="text-muted smaller d-flex gap-3">
            <span>SKU: <span class="fw-semibold text-primary">{{ selectedInventory.product?.sku }}</span></span>
            <span>&bull;</span>
            <span>Categoría: {{ selectedInventory.product?.category?.name || 'Sin clasificar' }}</span>
          </div>
        </div>

        <!-- Alerta de advertencia si hay stock comprometido -->
        <div 
          v-if="selectedInventory.qty_reserved > 0" 
          class="d-flex gap-3 p-3 mb-4 rounded-3 border"
          style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.15) !important; color: #92400e;"
        >
          <i class="fa-solid fa-circle-exclamation fs-5 mt-0.5"></i>
          <div class="smaller">
            Este producto tiene <span class="fw-bold">{{ selectedInventory.qty_reserved }} unidades comprometidas</span> en pedidos activos. El stock físico disponible no debería reducirse por debajo de este límite.
          </div>
        </div>

        <!-- Formulario de Ajuste -->
        <form @submit.prevent="submitAdjustment" id="adjustForm" class="row g-3">
          <div class="col-md-6">
            <BaseInput
              label="Stock Físico Disponible"
              type="number"
              v-model="adjustForm.qty_available"
              placeholder="Ej: 100"
              required
              min="0"
            />
            <div class="smaller text-muted mt-1.5 px-1">
              Stock actual: <span class="fw-bold text-body-emphasis">{{ selectedInventory.qty_available }}</span> unid.
            </div>
          </div>
          <div class="col-md-6">
            <BaseInput
              label="Punto de Reorden (Alerta)"
              type="number"
              v-model="adjustForm.reorder_point"
              placeholder="Ej: 10"
              required
              min="0"
            />
            <div class="smaller text-muted mt-1.5 px-1">
              Punto actual: <span class="fw-bold text-body-emphasis">{{ selectedInventory.reorder_point }}</span> unid.
            </div>
          </div>

          <div class="col-12">
            <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
              Motivo del Ajuste
            </label>
            <select v-model="adjustForm.reason_preset" class="form-select sol-input mb-2" required>
              <option value="" disabled>Seleccione un motivo predefinido...</option>
              <option value="Auditoría Física">Auditoría Física / Conteo</option>
              <option value="Diferencia de Inventario">Ajuste de Diferencia</option>
              <option value="Pérdida o Rotura">Pérdida, Desmedro o Rotura</option>
              <option value="Carga de Stock Inicial">Carga de Stock Inicial</option>
              <option value="Otro">Otro Motivo (especificar abajo)</option>
            </select>
          </div>

          <div class="col-12">
            <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
              Detalles Adicionales
            </label>
            <textarea
              class="form-control sol-textarea"
              rows="3"
              v-model="adjustForm.reason_detail"
              placeholder="Comentarios adicionales sobre el ajuste realizado (ej: número de acta, auditor, etc.)..."
              :required="adjustForm.reason_preset === 'Otro'"
            ></textarea>
          </div>
        </form>
      </div>

      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showAdjustModal = false">
            Cancelar
          </BaseButton>
          <BaseButton
            type="submit"
            form="adjustForm"
            variant="brand"
            class="rounded-pill px-5 sol-shadow-brand"
            :loading="isSaving"
          >
            Confirmar Ajuste
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '../plugins/axios';
import { Toast, ConfirmAlert, showBackendError } from '../plugins/swal';
import Swal from 'sweetalert2';

import BaseButton from '../components/base/BaseButton.vue';
import BaseInput from '../components/base/BaseInput.vue';
import BaseModal from '../components/base/BaseModal.vue';
import BaseDataGrid from '../components/base/BaseDataGrid.vue';
import BaseFilterSelect from '../components/base/BaseFilterSelect.vue';

// State
const inventoryData = ref({ data: [], current_page: 1, last_page: 1, total: 0 });
const categories = ref([]);
const isLoadingData = ref(true);
const isSaving = ref(false);
const showAdjustModal = ref(false);
const selectedInventory = ref(null);
const gridKey = ref(0);
let debounceTimeout = null;

const filters = reactive({
  category_id: '',
  low_stock: '',
  active: '',
  search: ''
});

// Dropdowns Options
const stateOptions = [
  { label: 'Todos los Estados', value: '' },
  { label: 'Productos Activos', value: '1' },
  { label: 'Productos Inactivos', value: '0' }
];

const stockStatusOptions = [
  { label: 'Todos los Niveles', value: '' },
  { label: 'Bajo Stock (Reorden)', value: 'true' }
];

const categoryOptions = computed(() => {
  return [
    { label: 'Todas las Categorías', value: '' },
    ...categories.value.map(cat => ({ label: cat.name, value: cat.id }))
  ];
});

// Grid Columns Definition
const gridColumns = [
  { label: 'INFORMACIÓN DEL PRODUCTO', key: 'product_info', width: '35%' },
  { label: 'STOCK FÍSICO',             key: 'qty_available',     align: 'end' },
  { label: 'COMPROMETIDO',             key: 'qty_reserved',      align: 'end' },
  { label: 'EN PRODUCCIÓN',            key: 'qty_in_production',  align: 'end' },
  { label: 'DISPONIBLE',               key: 'qty_sellable',       align: 'end' },
  { label: 'PUNTO REORDEN',            key: 'reorder_point',     align: 'end' }
];

const getRowClass = (item) => {
  return item.is_low_stock ? 'row-low-stock' : '';
};

// Computed Indicators
const hasActiveFilters = computed(() => {
  return filters.category_id !== '' || filters.low_stock !== '' || filters.active !== '';
});

// Counter of items with low stock currently visible or in total
const lowStockCount = computed(() => {
  return inventoryData.value.data.filter(item => item.is_low_stock).length;
});

// Form for adjustment
const adjustForm = reactive({
  qty_available: 0,
  reorder_point: 0,
  reason_preset: '',
  reason_detail: ''
});

// Lifecycle
onMounted(() => {
  fetchCategories();
  fetchInventory();
});

// Handlers
const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    categories.value = response.data;
  } catch (error) {
    console.error('Error al cargar categorías en inventario', error);
  }
};

const fetchInventory = async (page = 1) => {
  isLoadingData.value = true;
  try {
    const params = { page };
    if (filters.search)          params.search = filters.search;
    if (filters.category_id)     params.category_id = filters.category_id;
    if (filters.low_stock)       params.low_stock = filters.low_stock === 'true' ? 1 : 0;
    if (filters.active !== '')   params.active = filters.active;

    const response = await api.get('/inventory', { params });
    inventoryData.value = response.data;
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Error al sincronizar inventario' });
  } finally {
    isLoadingData.value = false;
  }
};

const handleSearch = (value) => {
  filters.search = value;
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchInventory(1);
  }, 450);
};

const handleRefresh = () => {
  filters.search = '';
  filters.category_id = '';
  filters.low_stock = '';
  filters.active = '';
  gridKey.value += 1;
  fetchInventory(1);
};

const resetFilters = () => {
  filters.category_id = '';
  filters.low_stock = '';
  filters.active = '';
  fetchInventory(1);
};

const openAdjustModal = (item) => {
  selectedInventory.value = item;
  Object.assign(adjustForm, {
    qty_available: item.qty_available,
    reorder_point: item.reorder_point,
    reason_preset: '',
    reason_detail: ''
  });
  showAdjustModal.value = true;
};

const submitAdjustment = async () => {
  isSaving.value = true;
  try {
    const productId = selectedInventory.value.product_id;
    
    // Concatenate preset and detail for the reason
    const finalReason = adjustForm.reason_detail.trim() 
      ? `[${adjustForm.reason_preset}] ${adjustForm.reason_detail.trim()}`
      : adjustForm.reason_preset;

    const payload = {
      qty_available: Number(adjustForm.qty_available),
      reorder_point: Number(adjustForm.reorder_point),
      reason: finalReason
    };

    const response = await api.post(`/inventory/${productId}/adjust`, payload);

    showAdjustModal.value = false;
    fetchInventory(inventoryData.value.current_page || 1);

    // Show custom alert if there is a warning (conflict with reserved stock)
    if (response.data.warning) {
      Swal.fire({
        icon: 'warning',
        title: 'Ajuste completado con advertencias',
        text: response.data.warning,
        confirmButtonColor: '#eab308'
      });
    } else {
      Toast.fire({ icon: 'success', title: 'Inventario ajustado con éxito' });
    }
  } catch (error) {
    showBackendError(error, 'Error al procesar el ajuste de inventario');
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.sol-input {
  background-color: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
  height: 38px;
  font-size: 0.85rem;
  padding: 0 0.75rem;
  transition: var(--transition-fast);
}
.sol-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
  outline: none;
}

:deep(.row-low-stock) {
  background-color: rgba(239, 68, 68, 0.05) !important;
}
:deep(.row-low-stock:hover) {
  background-color: rgba(239, 68, 68, 0.08) !important;
}
</style>
