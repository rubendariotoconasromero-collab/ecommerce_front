<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-0">Catálogo de Productos</h3>
        <p class="text-muted-custom small mb-0">Gestiona precios, tiempos de producción e inventario</p>
      </div>
      <button class="btn btn-brand text-white" style="background-color: var(--brand-primary);" @click="openModal(null)">
        <i class="bi bi-plus-circle me-2"></i>Nuevo Producto
      </button>
    </div>

    <!-- BaseDataGrid for Products -->
    <BaseDataGrid
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
          <select class="form-select form-select-sm" v-model="filters.category_id" @change="fetchData(1)" style="width: 180px;">
            <option value="">Todas las Categorías</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <select class="form-select form-select-sm" v-model="filters.active" @change="fetchData(1)" style="width: 150px;">
            <option value="">Todos los Estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          <button class="btn btn-light btn-sm" @click="resetFilters" title="Limpiar Filtros">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
        </div>
      </template>

      <!-- Avatar Column Customization -->
      <template #item-avatar>
        <div class="bg-light rounded d-flex justify-content-center align-items-center text-muted" style="width: 45px; height: 45px; border-radius: 12px !important;">
          <i class="bi bi-image"></i>
        </div>
      </template>

      <!-- Category Column -->
      <template #col-category_id="{ item }">
        <span class="badge bg-light text-dark border">{{ item.category?.name }}</span>
      </template>

      <!-- Cost Price -->
      <template #col-cost_price="{ value }">
        <span class="text-muted small">Bs. {{ value }}</span>
      </template>

      <!-- Sale Price -->
      <template #col-sale_price="{ value }">
        <span class="fw-bold text-brand">Bs. {{ value }}</span>
      </template>

      <!-- Lead Time -->
      <template #col-production_lead_time_days="{ value }">
        <div v-if="value > 0" class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
          <i class="bi bi-clock-history me-1"></i> {{ value }} Días
        </div>
        <div v-else class="badge bg-success-subtle text-success border border-success-subtle">
          Stock Inmediato
        </div>
      </template>

      <!-- Status Badge -->
      <template #item-status="{ item }">
        <span v-if="item.is_active" class="text-success small fw-bold"><i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i>Activo</span>
        <span v-else class="text-danger small fw-bold"><i class="bi bi-circle-fill me-1" style="font-size: 0.5rem;"></i>Inactivo</span>
      </template>

      <!-- Custom Actions -->
      <template #item-actions="{ item }">
        <li><button class="dropdown-item rounded-2 py-2" @click="openModal(item)"><i class="bi bi-pencil me-2"></i>Editar</button></li>
        <li>
          <router-link :to="{ name: 'producto-imagenes', params: { id: item.id } }" class="dropdown-item rounded-2 py-2 text-success">
            <i class="bi bi-images me-2"></i>Gestionar Imágenes
          </router-link>
        </li>
        <li><hr class="dropdown-divider mx-2"></li>
        <li><button class="dropdown-item text-danger rounded-2 py-2" @click="deleteProduct(item)"><i class="bi bi-trash3 me-2"></i>Eliminar</button></li>
      </template>
    </BaseDataGrid>

    <div class="modal fade" id="productModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light border-0">
            <h5 class="modal-title fw-bold">{{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="saveProduct">
            <div class="modal-body p-4">
              <div class="row g-3">
                
                <div class="col-md-8">
                  <label class="form-label small fw-bold text-muted">NOMBRE DEL PRODUCTO</label>
                  <input type="text" class="form-control" v-model="form.name" required>
                </div>
                
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">CÓDIGO SKU</label>
                  <input type="text" class="form-control" v-model="form.sku" required>
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">CATEGORÍA</label>
                  <select class="form-select" v-model="form.category_id" required>
                    <option value="" disabled>Seleccione...</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-bold text-muted">DÍAS DE PRODUCCIÓN</label>
                  <input type="number" class="form-control" v-model="form.production_lead_time_days" min="0" placeholder="0 para Stock Inmediato">
                  <small class="text-muted" style="font-size: 0.7rem;">Tiempo estimado.</small>
                </div>

                <div class="col-12"><hr class="my-2"></div>

                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">PRECIO BASE (Bs.)</label>
                  <input type="number" step="0.01" class="form-control" v-model="form.base_price" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">COSTO (Bs.)</label>
                  <input type="number" step="0.01" class="form-control text-danger" v-model="form.cost_price" required>
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold text-muted">PRECIO VENTA (Bs.)</label>
                  <input type="number" step="0.01" class="form-control text-success fw-bold" v-model="form.sale_price" required>
                </div>

                <div class="col-12"><hr class="my-2"></div>

                <div class="col-12">
                  <label class="form-label small fw-bold text-muted">DESCRIPCIÓN TÉCNICA</label>
                  <textarea class="form-control" rows="3" v-model="form.description"></textarea>
                </div>

                <div class="col-12 mt-3">
                  <div class="form-check form-switch custom-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="prodActive" v-model="form.is_active">
                    <label class="form-check-label ms-2 fw-bold" for="prodActive">Producto Activo en Tienda</label>
                  </div>
                </div>

              </div>
            </div>

            <div class="modal-footer border-0 bg-light">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-brand text-white" style="background-color: var(--brand-primary);" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                {{ isSaving ? 'Guardando...' : 'Guardar Producto' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../plugins/axios';
import { Modal } from 'bootstrap';
import { Toast, ConfirmAlert } from '../plugins/swal';
import Swal from 'sweetalert2';
import BaseDataGrid from '../components/base/BaseDataGrid.vue';

// Estado de paginación y datos
const productsData = ref({ data: [], current_page: 1, last_page: 1, total: 0 });
const categories = ref([]);

const isLoading = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
let modalInstance = null;

const gridColumns = [
  { label: 'CATEGORÍA', key: 'category_id' },
  { label: 'COSTO (Bs.)', key: 'cost_price', align: 'end' },
  { label: 'VENTA (Bs.)', key: 'sale_price', align: 'end' },
  { label: 'TIEMPO PROD.', key: 'production_lead_time_days', align: 'center' }
];

// Filtros para la búsqueda
const filters = reactive({
  search: '',
  category_id: '',
  active: ''
});

// Formulario
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
  is_active: true
});

onMounted(() => {
  modalInstance = new Modal(document.getElementById('productModal'));
  fetchCategories();
  fetchData();
});

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    categories.value = response.data;
  } catch (error) {
    console.error('Error al cargar categorías');
  }
};

const fetchData = async (page = 1) => {
  isLoading.value = true;
  try {
    // Construir los parámetros de consulta (Query Strings)
    const params = {
      page: page,
      search: filters.search,
      category_id: filters.category_id,
      active: filters.active
    };

    const response = await api.get('/products', { params });
    productsData.value = response.data; // Laravel devuelve el objeto paginado completo
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Error al cargar productos' });
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
    form.is_active = product.is_active;
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
  }
  modalInstance.show();
};

const saveProduct = async () => {
  isSaving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/products/${form.id}`, form);
    } else {
      await api.post('/products', form);
    }
    
    modalInstance.hide();
    fetchData(productsData.value.current_page); // Recargar en la página actual
    Toast.fire({ icon: 'success', title: 'Producto guardado' });
  } catch (error) {
    if (error.response && error.response.status === 422) {
      Toast.fire({ icon: 'warning', title: error.response.data.message || 'Verifica los datos (Ej. SKU duplicado)' });
    } else {
      Toast.fire({ icon: 'error', title: 'Error al procesar la solicitud' });
    }
  } finally {
    isSaving.value = false;
  }
};

const deleteProduct = async (product) => {
  const result = await ConfirmAlert.fire({
    title: '¿Eliminar Producto?',
    text: `Estás a punto de eliminar "${product.name}".`
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/products/${product.id}`);
      fetchData(productsData.value.current_page);
      Swal.fire('Eliminado', 'Producto eliminado del catálogo.', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar. Puede estar asociado a un pedido.', 'error');
    }
  }
};
</script>

<style scoped>
.item-row:hover { background-color: #f8f9fa; }
.custom-switch .form-check-input:checked {
  background-color: var(--brand-primary, #0d6efd);
  border-color: var(--brand-primary, #0d6efd);
}
</style>