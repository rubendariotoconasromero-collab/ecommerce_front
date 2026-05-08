<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Header: Título y Acciones -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-0 text-body-emphasis text-gradient-primary">Catálogo de Productos</h3>
        <p class="text-body-secondary small mb-0">Gestiona precios, tiempos de producción e inventario</p>
      </div>
      <div class="d-flex gap-2">
        <div class="btn-group shadow-sm">
          <button 
            class="btn btn-light" 
            :class="{ active: currentLayout === 'table' }"
            @click="currentLayout = 'table'"
            title="Vista de Tabla"
          >
            <i class="bi bi-list-ul"></i>
          </button>
          <button 
            class="btn btn-light" 
            :class="{ active: currentLayout === 'card' }"
            @click="currentLayout = 'card'"
            title="Vista de Cuadrícula"
          >
            <i class="bi bi-grid-3x3-gap"></i>
          </button>
        </div>
        <BaseButton variant="brand" icon="bi bi-plus-circle" @click="openModal(null)">
          Nuevo Producto
        </BaseButton>
      </div>
    </div>

    <!-- BaseDataGrid for Products -->
    <BaseDataGrid
      :layout="currentLayout"
      :items="productsData.data"
      :columns="gridColumns"
      :loading="isLoading"
      :pagination="productsData"
      title-key="name"
      subtitle-key="sku"
      main-col-label="PRODUCTO / SKU"
      main-col-width="30%"
      empty-title="No se encontraron productos"
      empty-icon="bi bi-box-seam"
      @edit="openModal"
      @delete="deleteProduct"
      @page-change="fetchData"
      @search="(val) => { filters.search = val; fetchData(1); }"
    >
      <!-- Custom Filters Slot -->
      <template #filters>
        <div class="d-flex gap-2">
          <select class="form-select form-select-sm shadow-none" v-model="filters.category_id" @change="fetchData(1)" style="width: 180px;">
            <option value="">Todas las Categorías</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <select class="form-select form-select-sm shadow-none" v-model="filters.active" @change="fetchData(1)" style="width: 150px;">
            <option value="">Todos los Estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          <BaseButton variant="light" size="sm" icon="bi bi-arrow-counterclockwise" @click="resetFilters" />
        </div>
      </template>

      <!-- Avatar Column Customization -->
      <template #item-avatar="{ item }">
        <div class="product-preview-circle overflow-hidden border shadow-sm bg-body-tertiary">
          <img 
            v-if="item.images && item.images.length > 0" 
            :src="item.images.find(i => i.is_primary)?.url || item.images.find(i => i.is_primary)?.image_url || item.images[0].url || item.images[0].image_url" 
            alt="Prod" 
            class="w-100 h-100 object-fit-cover"
          >
          <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-body-secondary">
            <i class="bi bi-image fs-5"></i>
          </div>
        </div>
      </template>


      <!-- Featured Column -->
      <template #col-is_featured="{ value }">
        <BaseBadge v-if="value" variant="warning" soft class="px-2 py-1">
          <i class="bi bi-star-fill me-1"></i> Destacado
        </BaseBadge>
        <span v-else class="text-body-secondary smaller">-</span>
      </template>

      <!-- Category Column -->
      <template #col-category_id="{ item }">
        <BaseBadge v-if="item.category" variant="secondary" soft class="fw-medium border">
          {{ item.category.name }}
        </BaseBadge>
        <span v-else class="text-body-secondary smaller">Sin categoría</span>
      </template>

      <!-- Cost Price -->
      <template #col-cost_price="{ value }">
        <span class="text-body-secondary small">Bs. {{ parseFloat(value).toLocaleString() }}</span>
      </template>

      <!-- Sale Price -->
      <template #col-sale_price="{ value }">
        <span class="fw-bold text-brand">Bs. {{ parseFloat(value).toLocaleString() }}</span>
      </template>

      <!-- Lead Time -->
      <template #col-production_lead_time_days="{ value }">
        <div v-if="value > 0" class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill">
          <i class="bi bi-clock-history me-1"></i> {{ value }} Días
        </div>
        <div v-else class="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
          Stock Inmediato
        </div>
      </template>

      <!-- Status Badge -->
      <template #item-status="{ item }">
        <div v-if="item.is_active" class="d-flex align-items-center text-success small fw-bold">
          <span class="status-dot bg-success me-2"></span> Activo
        </div>
        <div v-else class="d-flex align-items-center text-body-secondary small fw-bold">
          <span class="status-dot bg-secondary me-2"></span> Inactivo
        </div>
      </template>

      <!-- Custom Actions -->
      <template #item-actions="{ item }">
        <li><button class="dropdown-item rounded-2 py-2" @click="openModal(item)"><i class="bi bi-pencil me-2 text-primary"></i>Editar</button></li>
        <li>
          <router-link :to="{ name: 'producto-imagenes', params: { id: item.id } }" class="dropdown-item rounded-2 py-2 text-success">
            <i class="bi bi-images me-2"></i>Gestionar Imágenes
          </router-link>
        </li>
        <li><hr class="dropdown-divider mx-2"></li>
        <li><button class="dropdown-item text-danger rounded-2 py-2" @click="deleteProduct(item)"><i class="bi bi-trash3 me-2"></i>Eliminar</button></li>
      </template>
    </BaseDataGrid>

    <!-- Product Modal -->
    <BaseModal v-model="showModal" :title="isEditing ? 'Editar Producto' : 'Nuevo Producto'" size="lg">
      <form @submit.prevent="saveProduct" id="productForm">
        <div class="row g-4">
          <div class="col-md-8">
            <BaseInput v-model="form.name" label="Nombre del Producto" placeholder="Ej: Botella PET 500ml Cristal" required />
          </div>
          <div class="col-md-4">
            <BaseInput v-model="form.sku" label="Código SKU" placeholder="PROD-001" required />
          </div>

          <div class="col-md-6">
            <BaseSelect v-model="form.category_id" label="Categoría" required>
              <option value="" disabled>Seleccione una categoría...</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </BaseSelect>
          </div>

          <div class="col-md-6">
            <BaseInput v-model="form.production_lead_time_days" type="number" label="Días de Producción" placeholder="0 para entrega inmediata" min="0" />
          </div>

          <div class="col-12"><div class="separator-text">Precios y Finanzas</div></div>

          <div class="col-md-4">
            <BaseInput v-model="form.base_price" type="number" step="0.01" label="Precio Base (Bs.)" required />
          </div>
          <div class="col-md-4">
            <BaseInput v-model="form.cost_price" type="number" step="0.01" label="Costo Directo (Bs.)" required />
          </div>
          <div class="col-md-4">
            <BaseInput v-model="form.sale_price" type="number" step="0.01" label="Precio de Venta (Bs.)" required />
          </div>

          <div class="col-12">
            <label class="form-label small fw-semibold text-body-secondary text-uppercase mb-1 ms-1">Descripción Técnica</label>
            <textarea class="form-control bg-body-tertiary border-0 shadow-none" rows="3" v-model="form.description" placeholder="Especificaciones, material, peso..."></textarea>
          </div>

          <div class="col-12 mt-2">
            <div class="p-3 bg-body-tertiary rounded-4 d-flex gap-4">
              <div class="form-check form-switch custom-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="prodActive" v-model="form.is_active">
                <label class="form-check-label ms-2 fw-bold text-body-emphasis" for="prodActive">Producto Activo</label>
              </div>
              <div class="form-check form-switch custom-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="prodFeatured" v-model="form.is_featured">
                <label class="form-check-label ms-2 fw-bold text-warning" for="prodFeatured">
                  <i class="bi bi-star-fill me-1"></i> Destacar en Home
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <div class="d-flex justify-content-end gap-2 w-100">
          <BaseButton variant="light" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton type="submit" form="productForm" variant="brand" :loading="isSaving">
            {{ isEditing ? 'Actualizar Producto' : 'Crear Producto' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../plugins/axios';
import { Toast, ConfirmAlert } from '../plugins/swal';
import Swal from 'sweetalert2';
import BaseDataGrid from '../components/base/BaseDataGrid.vue';
import BaseButton from '../components/base/BaseButton.vue';
import BaseModal from '../components/base/BaseModal.vue';
import BaseInput from '../components/base/BaseInput.vue';
import BaseSelect from '../components/base/BaseSelect.vue';
import BaseBadge from '../components/base/BaseBadge.vue';

// State
const productsData = ref({ data: [], current_page: 1, last_page: 1, total: 0 });
const categories = ref([]);
const currentLayout = ref('table');
const isLoading = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
const showModal = ref(false);

const gridColumns = [
  { label: 'CATEGORÍA', key: 'category_id' },
  { label: 'COSTO (Bs.)', key: 'cost_price', align: 'end' },
  { label: 'VENTA (Bs.)', key: 'sale_price', align: 'end' },
  { label: 'DESTACADO', key: 'is_featured', align: 'center' },
  { label: 'TIEMPO PROD.', key: 'production_lead_time_days', align: 'center' }
];

const filters = reactive({
  search: '',
  category_id: '',
  active: ''
});

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

// Logic
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
    const params = {
      page: page,
      search: filters.search,
      category_id: filters.category_id,
      active: filters.active
    };
    const response = await api.get('/products', { params });
    productsData.value = response.data;
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Error al cargar el catálogo de productos' });
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
    form.id = product.id;
    form.category_id = product.category_id;
    form.sku = product.sku;
    form.name = product.name;
    form.description = product.description || '';
    form.base_price = product.base_price;
    form.cost_price = product.cost_price;
    form.sale_price = product.sale_price;
    form.production_lead_time_days = product.production_lead_time_days;
    form.is_active = Boolean(product.is_active);
    form.is_featured = Boolean(product.is_featured);
  } else {
    isEditing.value = false;
    form.id = null;
    form.category_id = '';
    form.sku = '';
    form.name = '';
    form.description = '';
    form.base_price = 0;
    form.cost_price = 0;
    form.sale_price = 0;
    form.production_lead_time_days = 0;
    form.is_active = true;
    form.is_featured = false;
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
    Toast.fire({ icon: 'success', title: `Producto ${isEditing.value ? 'actualizado' : 'creado'} con éxito` });
  } catch (error) {
    if (error.response && error.response.status === 422) {
      Toast.fire({ icon: 'warning', title: error.response.data.message || 'Verifica los campos obligatorios' });
    } else {
      Toast.fire({ icon: 'error', title: 'Ocurrió un error al procesar el producto' });
    }
  } finally {
    isSaving.value = false;
  }
};

const deleteProduct = async (product) => {
  const result = await ConfirmAlert.fire({
    title: '¿Confirmar eliminación?',
    text: `Estás a punto de eliminar el producto "${product.name}". Esta acción no se puede deshacer.`
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/products/${product.id}`);
      fetchData(productsData.value.current_page || 1);
      Swal.fire('¡Eliminado!', 'El producto ha sido removido del catálogo.', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar el producto. Podría estar vinculado a otros registros.', 'error');
    }
  }
};

onMounted(() => {
  fetchCategories();
  fetchData();
});
</script>

<style scoped>
.text-gradient-primary {
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.product-preview-circle {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.separator-text {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin: 1rem 0;
}

.separator-text::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border-color);
  margin-left: 1rem;
  opacity: 0.5;
}

.custom-switch .form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>