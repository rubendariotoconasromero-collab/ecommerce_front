<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-0">Categorías de Productos</h3>
        <p class="text-muted-custom small mb-0">Gestiona las clasificaciones de tu catálogo de plásticos</p>
      </div>
      <button class="btn btn-brand text-white" style="background-color: var(--brand-primary);" @click="openModal(null)">
        <i class="bi bi-plus-circle me-2"></i>Nueva Categoría
      </button>
    </div>

    <!-- BaseDataGrid for Categories -->
    <BaseDataGrid
      :items="categories"
      :columns="gridColumns"
      :loading="isLoading"
      title-key="name"
      subtitle-key="slug"
      main-col-label="CATEGORÍA"
      empty-title="No hay categorías registradas"
      empty-icon="bi bi-folder-x"
      @edit="openModal"
      @delete="deleteCategory"
    >
      <!-- Custom column for products count -->
      <template #col-products_count="{ value }">
        <div class="text-muted small">
          <i class="bi bi-box-seam me-1"></i> {{ value || 0 }} productos
        </div>
      </template>

      <!-- Status Badge -->
      <template #item-status="{ item }">
        <span v-if="item.is_active" class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
          <i class="bi bi-check-circle me-1"></i> Activa
        </span>
        <span v-else class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
          <i class="bi bi-x-circle me-1"></i> Inactiva
        </span>
      </template>
    </BaseDataGrid>

    <div class="modal fade" id="categoryModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light border-0">
            <h5 class="modal-title fw-bold">{{ isEditing ? 'Editar Categoría' : 'Nueva Categoría' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <form @submit.prevent="saveCategory">
            <div class="modal-body p-4">
              <div class="mb-4">
                <label class="form-label small fw-bold text-muted">NOMBRE DE LA CATEGORÍA</label>
                <input 
                  type="text" 
                  class="form-control form-control-lg fs-6" 
                  v-model="form.name" 
                  placeholder="Ej: Inyección Plástica, Envases, etc." 
                  required
                >
              </div>

              <div class="form-check form-switch custom-switch">
                <input 
                  class="form-check-input form-check-input-brand" 
                  type="checkbox" 
                  role="switch" 
                  id="activeSwitch" 
                  v-model="form.is_active"
                >
                <label class="form-check-label ms-2" for="activeSwitch">
                  <span class="fw-bold text-dark">Categoría Activa</span>
                  <div class="text-muted small">Visible en el catálogo público</div>
                </label>
              </div>
            </div>

            <div class="modal-footer border-0 bg-light">
              <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-brand text-white" style="background-color: var(--brand-primary);" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span>
                {{ isSaving ? 'Guardando...' : 'Guardar Categoría' }}
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

const categories = ref([]);
const isLoading = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
let modalInstance = null;

const gridColumns = [
  { label: 'PRODUCTOS ASOCIADOS', key: 'products_count', align: 'center' }
];

const form = reactive({
  id: null,
  name: '',
  is_active: true
});

onMounted(() => {
  modalInstance = new Modal(document.getElementById('categoryModal'));
  fetchData();
});

const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/categories');
    categories.value = response.data;
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    Toast.fire({ icon: 'error', title: 'Error al cargar los datos' });
  } finally {
    isLoading.value = false;
  }
};

const openModal = (category = null) => {
  if (category) {
    isEditing.value = true;
    form.id = category.id;
    form.name = category.name;
    form.is_active = category.is_active;
  } else {
    isEditing.value = false;
    form.id = null;
    form.name = '';
    form.is_active = true; // Por defecto activa
  }
  modalInstance.show();
};

const saveCategory = async () => {
  isSaving.value = true;
  try {
    if (isEditing.value) {
      await api.put(`/categories/${form.id}`, form);
    } else {
      await api.post('/categories', form);
    }
    
    modalInstance.hide();
    fetchData();
    Toast.fire({ icon: 'success', title: 'Categoría guardada correctamente' });
  } catch (error) {
    // Manejo de errores de validación (Ej: Nombre duplicado)
    if (error.response && error.response.status === 422) {
      Toast.fire({ icon: 'warning', title: error.response.data.message || 'Verifica los datos ingresados' });
    } else {
      Toast.fire({ icon: 'error', title: 'Error al procesar la solicitud' });
    }
  } finally {
    isSaving.value = false;
  }
};

const deleteCategory = async (category) => {
  if (category.products_count > 0) {
    return Swal.fire('No permitido', `Esta categoría tiene ${category.products_count} productos asociados. Elimínalos o reasígnalos primero.`, 'warning');
  }

  const result = await ConfirmAlert.fire({
    title: '¿Eliminar Categoría?',
    text: `Estás a punto de eliminar "${category.name}". Esta acción no se puede deshacer.`
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/categories/${category.id}`);
      fetchData();
      Swal.fire('Eliminado', 'La categoría ha sido eliminada.', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar la categoría.', 'error');
    }
  }
};
</script>

<style scoped>
/* Estilo para que el switch parezca del color de la marca */
.custom-switch .form-check-input:checked {
  background-color: var(--brand-primary, #0d6efd);
  border-color: var(--brand-primary, #0d6efd);
}
</style>