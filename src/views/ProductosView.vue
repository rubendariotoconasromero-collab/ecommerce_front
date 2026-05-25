<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Encabezado -->
    <div class="sol-page-header mb-3">
      <div>
        <h2 class="sol-page-title">Catálogo de Productos</h2>
        <p class="sol-page-subtitle">Gestiona precios, tiempos de producción y visibilidad comercial.</p>
      </div>
      <div class="d-flex align-items-center gap-3">
        <BaseButton variant="brand" class="rounded-pill px-4 py-2 sol-fw-800 sol-shadow-brand" @click="openModal(null)">
          <i class="fa-solid fa-plus me-2"></i> Nuevo Producto
        </BaseButton>
      </div>
    </div>

    <!-- Grid de Productos -->
    <BaseDataGrid
      :items="productsData.data"
      :columns="gridColumns"
      :loading="isLoading"
      :pagination="productsData"
      title-key="name"
      subtitle-key="sku"
      main-col-label="PRODUCTO"
      main-col-width="30%"
      search-placeholder="Buscar por nombre o SKU de producto..."
      compact
      empty-title="No se encontraron productos"
      empty-icon="fa-solid fa-box-open"
      @edit="openModal"
      @delete="deleteProduct"
      @page-change="fetchData"
      @search="handleSearch"
    >
      <!-- Filtros -->
      <template #filters>
        <div class="d-flex flex-wrap gap-2">
          <BaseFilterSelect
            v-model="filters.category_id"
            :options="categoryOptions"
            width="180px"
            @update:modelValue="fetchData(1)"
          />

          <BaseFilterSelect
            v-model="filters.active"
            :options="stateOptions"
            width="150px"
            @update:modelValue="fetchData(1)"
          />

          <BaseButton variant="light" size="sm" class="rounded-circle p-0" style="width: 38px; height: 38px;" @click="resetFilters">
            <i class="fa-solid fa-rotate-left"></i>
          </BaseButton>
        </div>
      </template>

      <!-- Badge Destacado en la Columna de Producto -->
      <template #item-title-badge="{ item }">
        <span v-if="item.is_featured" class="badge rounded-pill px-2 py-0.5 sol-fw-800 text-uppercase"
              style="background: rgba(245,158,11,0.1); color: #92400e; border: 1px solid rgba(245,158,11,0.15); font-size: 0.65rem; letter-spacing: 0.03em;">
          <i class="fa-solid fa-star me-1" style="font-size: 0.6rem;"></i>Destacado
        </span>
      </template>

      <!-- Avatar del Producto -->
      <template #item-avatar="{ item }">
        <div class="sol-item-frame bg-white shadow-sm d-flex align-items-center justify-content-center overflow-hidden">
          <img
            v-if="getImageUrl(item) && !imageLoadErrors[item.id]"
            :src="getImageUrl(item)"
            alt="Prod"
            class="w-100 h-100 object-fit-contain p-1 sol-transition-slow"
            @error="handleImageError(item.id)"
          >
          <svg v-else class="w-100 h-100 text-muted opacity-25 p-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </template>

      <!-- Columna Categoría -->
      <template #col-category_id="{ item }">
        <span v-if="item.category" class="badge rounded-pill bg-light border text-dark sol-fw-800 px-3 py-1 sol-smallest">
          {{ item.category.name }}
        </span>
        <span v-else class="text-muted sol-smallest sol-italic">Sin clasificar</span>
      </template>

      <!-- Precio de Costo -->
      <template #col-cost_price="{ value }">
        <span class="text-muted small sol-fw-800">Bs. {{ parseFloat(value).toLocaleString() }}</span>
      </template>

      <!-- Precio de Venta -->
      <template #col-sale_price="{ value }">
        <span class="sol-fw-800 small" style="color: var(--sol-color-primary);">Bs. {{ parseFloat(value).toLocaleString() }}</span>
      </template>

      <!-- Tiempo de Producción -->
      <template #col-production_lead_time_days="{ value }">
        <div v-if="value > 0" class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest"
             style="background: var(--sol-color-primary-soft); color: var(--sol-color-primary); border: 1px solid var(--sol-color-primary-glass);">
          <i class="fa-regular fa-clock me-1"></i> {{ value }} Días
        </div>
        <div v-else class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest"
             style="background: var(--sol-color-success-soft); color: #065f46; border: 1px solid rgba(16,185,129,0.15);">
          <i class="fa-solid fa-bolt-lightning me-1"></i> Inmediato
        </div>
      </template>

      <template #item-status="{ item }">
        <span 
          class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest text-uppercase sol-tracking-tight border d-inline-flex align-items-center justify-content-center"
          :class="item.is_active ? 'bg-success-subtle text-success border-success-subtle' : 'bg-danger-subtle text-danger border-danger-subtle'"
          style="width: 115px;"
        >
          <i class="fa-solid me-1" :class="item.is_active ? 'fa-circle-check text-success' : 'fa-circle-xmark text-danger'"></i>
          {{ item.is_active ? 'Activo' : 'Inactivo' }}
        </span>
      </template>

      <!-- Acciones personalizadas -->
      <template #item-actions="{ item }">
        <li><button class="dropdown-item rounded-3 py-2" @click="openModal(item)">
          <i class="fa-regular fa-pen-to-square me-2 text-primary"></i>Editar Producto
        </button></li>
        <li>
          <router-link :to="{ name: 'producto-imagenes', params: { id: item.id } }" class="dropdown-item rounded-3 py-2 text-success">
            <i class="fa-regular fa-images me-2"></i>Gestionar Imágenes
          </router-link>
        </li>
        <li><hr class="dropdown-divider mx-2 opacity-50"></li>
        <li v-if="item.is_active">
          <button class="dropdown-item text-danger rounded-3 py-2" @click="deactivateProduct(item)">
            <i class="fa-solid fa-ban me-2"></i>Desactivar Producto
          </button>
        </li>
        <li v-else>
          <button class="dropdown-item text-success rounded-3 py-2" @click="restoreProduct(item)">
            <i class="fa-solid fa-circle-check me-2"></i>Activar Producto
          </button>
        </li>
      </template>
    </BaseDataGrid>

    <!-- Modal de Producto -->
    <BaseModal v-model="showModal" :title="isEditing ? 'Configuración de Producto' : 'Nuevo Producto'" size="lg">
      <form @submit.prevent="saveProduct" id="productForm" class="p-2">
        <div class="row g-3">
          <div class="col-md-8">
            <BaseInput v-model="form.name" label="Nombre del Producto"
              placeholder="Ej: Componente Industrial PET 500ml" required />
          </div>
          <div class="col-md-4">
            <BaseInput v-model="form.sku" label="SKU"
              placeholder="PROD-AX-001" required />
          </div>

          <div class="col-md-6">
            <BaseSelect v-model="form.category_id" label="Categoría" required>
              <option value="" disabled>Seleccione una categoría...</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </BaseSelect>
          </div>

          <div class="col-md-6">
            <BaseInput v-model="form.production_lead_time_days" type="number"
              label="Días de Producción" placeholder="0 = Entrega Instantánea" min="0" />
          </div>

          <div class="col-12">
            <div class="sol-section-divider my-2">Precios y Costos</div>
          </div>

          <div class="col-md-4">
            <BaseInput v-model="form.base_price" type="number" step="0.01" label="Precio Base (Bs.)" required />
          </div>
          <div class="col-md-4">
            <BaseInput v-model="form.cost_price" type="number" step="0.01" label="Costo (Bs.)" required />
          </div>
          <div class="col-md-4">
            <BaseInput v-model="form.sale_price" type="number" step="0.01" label="Precio de Venta (Bs.)" required />
          </div>

          <div class="col-12">
            <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Descripción</label>
            <textarea class="form-control sol-textarea" rows="3" v-model="form.description"
              placeholder="Detalles de fabricación, materialidad, certificaciones..."></textarea>
          </div>

          <div class="col-12">
            <div class="p-3 bg-light rounded-3 border d-flex flex-column flex-sm-row gap-4">
              <div class="form-check form-switch sol-switch d-flex align-items-center gap-3 px-0">
                <input class="form-check-input ms-0 shadow-none" type="checkbox" role="switch" id="prodActive" v-model="form.is_active">
                <label class="form-check-label sol-fw-800" for="prodActive">Habilitar Comercialización</label>
              </div>
              <div class="form-check form-switch sol-switch d-flex align-items-center gap-3 px-0">
                <input class="form-check-input ms-0 shadow-none" type="checkbox" role="switch" id="prodFeatured" v-model="form.is_featured">
                <label class="form-check-label sol-fw-800 text-warning" for="prodFeatured">
                  <i class="fa-solid fa-bolt me-1"></i> Destacado en Vitrina Principal
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton type="submit" form="productForm" variant="brand" class="rounded-pill px-5 sol-shadow-brand" :loading="isSaving">
            {{ isEditing ? 'Actualizar Ficha' : 'Registrar Producto' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import api from '../plugins/axios';
import { Toast, ConfirmAlert, showBackendError } from '../plugins/swal';
import BaseDataGrid from '../components/base/BaseDataGrid.vue';
import BaseButton from '../components/base/BaseButton.vue';
import BaseModal from '../components/base/BaseModal.vue';
import BaseInput from '../components/base/BaseInput.vue';
import BaseSelect from '../components/base/BaseSelect.vue';
import BaseFilterSelect from '../components/base/BaseFilterSelect.vue';

// State
const productsData = ref({ data: [], current_page: 1, last_page: 1, total: 0 });
const categories = ref([]);
const isLoading = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
const showModal = ref(false);

const gridColumns = [
  { label: 'CATEGORÍA', key: 'category_id' },
  { label: 'COSTO', key: 'cost_price', align: 'end' },
  { label: 'PRECIO', key: 'sale_price', align: 'end' },
  { label: 'ENTREGA', key: 'production_lead_time_days', align: 'center' }
];

const imageLoadErrors = ref({});

const handleImageError = (id) => {
  imageLoadErrors.value[id] = true;
};

const getImageUrl = (item) => {
  if (!item.images || item.images.length === 0) return '';
  const img = item.images.find(i => i.is_primary) || item.images[0];
  return img ? (img.image_url || img.url) : '';
};

const filters = reactive({ search: '', category_id: '', active: '' });

const stateOptions = [
  { label: 'Todos los Estados', value: '' },
  { label: 'Activos', value: 'true' },
  { label: 'Inactivos', value: 'false' }
];

const categoryOptions = computed(() => {
  return [
    { label: 'Todas las Categorías', value: '' },
    ...categories.value.map(cat => ({ label: cat.name, value: cat.id }))
  ];
});

let debounceTimeout = null;

const handleSearch = (value) => {
  filters.search = value;
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchData(1);
  }, 450);
};

const form = reactive({
  id: null,
  category_id: '',
  sku: '',
  name: '',
  description: '',
  base_price: 0,
  cost_price: 0,
  sale_price: 0,
  production_lead_time_days: 0,
  is_active: true,
  is_featured: false
});

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    categories.value = response.data;
  } catch (error) {
    console.error('Error al cargar categorías', error);
  }
};

const fetchData = async (page = 1) => {
  isLoading.value = true;
  try {
    const params = { page, search: filters.search, category_id: filters.category_id, active: filters.active };
    const response = await api.get('/products', { params });
    productsData.value = response.data;
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Error de sincronización de catálogo' });
  } finally {
    isLoading.value = false;
  }
};

const resetFilters = () => {
  filters.search = '';
  filters.category_id = '';
  filters.active = '';
  fetchData(1);
};

const openModal = (product = null) => {
  if (product) {
    isEditing.value = true;
    Object.assign(form, {
      id: product.id,
      category_id: product.category_id,
      sku: product.sku,
      name: product.name,
      description: product.description || '',
      base_price: product.base_price,
      cost_price: product.cost_price,
      sale_price: product.sale_price,
      production_lead_time_days: product.production_lead_time_days,
      is_active: Boolean(product.is_active),
      is_featured: Boolean(product.is_featured)
    });
  } else {
    isEditing.value = false;
    Object.assign(form, { id: null, category_id: '', sku: '', name: '', description: '', base_price: 0, cost_price: 0, sale_price: 0, production_lead_time_days: 0, is_active: true, is_featured: false });
  }
  showModal.value = true;
};

const saveProduct = async () => {
  isSaving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/products/${form.id}`, form);
    } else {
      await api.post('/products', form);
    }
    showModal.value = false;
    fetchData(productsData.value.current_page || 1);
    Toast.fire({ icon: 'success', title: 'Operación completada con éxito' });
  } catch (error) {
    showBackendError(error, 'Error al guardar producto');
  } finally {
    isSaving.value = false;
  }
};

const deactivateProduct = async (product) => {
  const result = await ConfirmAlert.fire({
    title: '¿Desactivar producto?',
    text: `"${product.name}" dejará de estar disponible hasta ser reactivado.`,
    confirmButtonText: 'Sí, desactivar',
  });
  if (result.isConfirmed) {
    try {
      await api.delete(`/products/${product.id}`);
      fetchData(productsData.value.current_page || 1);
      Toast.fire({ icon: 'success', title: 'Producto desactivado correctamente' });
    } catch (error) {
      showBackendError(error, 'Error al desactivar producto');
    }
  }
};

const restoreProduct = async (product) => {
  const result = await ConfirmAlert.fire({
    title: '¿Activar producto?',
    text: `"${product.name}" volverá a estar disponible en el catálogo.`,
    confirmButtonText: 'Sí, activar',
  });
  if (result.isConfirmed) {
    try {
      await api.patch(`/products/${product.id}/restore`);
      fetchData(productsData.value.current_page || 1);
      Toast.fire({ icon: 'success', title: 'Producto reactivado correctamente' });
    } catch (error) {
      showBackendError(error, 'Error al activar producto');
    }
  }
};

onMounted(() => {
  fetchCategories();
  fetchData();
});
</script>