<template>
  <div class="animate__animated animate__fadeIn">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold mb-0 text-body-emphasis text-gradient-primary">Gestión de Categorías</h3>
        <p class="text-body-secondary small mb-0">Organiza tus productos por grupos lógicos y visuales</p>
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
          Nueva Categoría
        </BaseButton>
      </div>
    </div>

    <!-- BaseDataGrid for Categories -->
    <BaseDataGrid
      :layout="currentLayout"
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
      <!-- Custom Avatar for Category Image -->
      <template #item-avatar="{ item }">
        <div class="category-preview-circle overflow-hidden border shadow-sm">
          <img v-if="item.image_url" :src="item.image_url" alt="Cat" class="w-100 h-100 object-fit-cover">
          <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center bg-soft-primary text-primary fw-bold fs-5">
            {{ item.name?.charAt(0).toUpperCase() }}
          </div>
        </div>
      </template>

      <!-- Custom column for products count -->
      <template #col-products_count="{ value }">
        <div class="text-body-secondary small fw-medium">
          <BaseBadge variant="secondary" soft class="border">
            <i class="bi bi-box-seam me-1"></i> {{ value || 0 }} productos
          </BaseBadge>
        </div>
      </template>

      <!-- Status Badge -->
      <template #item-status="{ item }">
        <BaseBadge v-if="item.is_active" variant="success" soft class="px-2 py-1">
          <i class="bi bi-check-circle me-1"></i> Activa
        </BaseBadge>
        <BaseBadge v-else variant="danger" soft class="px-2 py-1">
          <i class="bi bi-x-circle me-1"></i> Inactiva
        </BaseBadge>
      </template>
    </BaseDataGrid>

    <BaseModal v-model="showModal" :title="isEditing ? 'Editar Categoría' : 'Nueva Categoría'" size="md">
      <form @submit.prevent="saveCategory" id="categoryForm">
        <div class="row g-4">
          <div class="col-12">
            <BaseInput 
              v-model="form.name" 
              label="Nombre de la Categoría" 
              placeholder="Ej: Inyección Plástica, Envases, etc." 
              required
            />
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-body-secondary text-uppercase mb-2 ms-1">Imagen de Portada</label>
            <div class="upload-zone rounded-4 border-dashed p-4 text-center transition-all" :class="{ 'has-preview': previewImage }">
              <input 
                type="file" 
                id="categoryImage" 
                class="visually-hidden" 
                accept="image/*"
                @change="onFileChange"
              >
              <label for="categoryImage" class="upload-label cursor-pointer w-100 h-100 mb-0">
                <div v-if="!previewImage" class="animate__animated animate__fadeIn">
                  <i class="bi bi-cloud-arrow-up display-4 text-body-tertiary"></i>
                  <p class="mt-2 mb-0 fw-semibold text-body-emphasis">Selecciona una imagen</p>
                  <p class="small text-body-secondary">JPG, PNG o WEBP (Máx. 2MB)</p>
                </div>
                <div v-else class="preview-container position-relative animate__animated animate__zoomIn animate__faster">
                  <img :src="previewImage" alt="Preview" class="img-fluid rounded-3 shadow-sm preview-img">
                  <div class="preview-overlay position-absolute inset-0 d-flex align-items-center justify-content-center rounded-3">
                    <span class="badge bg-dark-glass px-3 py-2 rounded-pill"><i class="bi bi-pencil-square me-2"></i>Cambiar</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label small fw-bold text-body-secondary text-uppercase mb-1 ms-1">Descripción Breve</label>
            <textarea class="form-control bg-body-tertiary border-0 shadow-none" rows="2" v-model="form.description" placeholder="Describe esta categoría..."></textarea>
          </div>

          <div class="col-12">
            <div class="p-3 bg-body-tertiary rounded-4">
              <div class="form-check form-switch custom-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="activeSwitch" 
                  v-model="form.is_active"
                >
                <label class="form-check-label ms-2" for="activeSwitch">
                  <span class="fw-bold text-body-emphasis">Categoría Visible</span>
                  <div class="text-body-secondary smaller">Se mostrará en la tienda pública</div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="d-flex justify-content-end gap-2 w-100">
          <BaseButton variant="light" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton type="submit" form="categoryForm" variant="brand" :loading="isSaving">
            {{ isEditing ? 'Actualizar Categoría' : 'Crear Categoría' }}
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
import BaseBadge from '../components/base/BaseBadge.vue';

const categories = ref([]);
const isLoading = ref(true);
const currentLayout = ref('table');
const isSaving = ref(false);
const isEditing = ref(false);
const showModal = ref(false);

const gridColumns = [
  { label: 'PRODUCTOS ASOCIADOS', key: 'products_count', align: 'center' }
];

const form = reactive({
  id: null,
  name: '',
  description: '',
  is_active: true
});

const selectedFile = ref(null);
const previewImage = ref(null);

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

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    Toast.fire({ icon: 'warning', title: 'La imagen excede los 2MB' });
    return;
  }

  selectedFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const openModal = (category = null) => {
  if (category) {
    isEditing.value = true;
    form.id = category.id;
    form.name = category.name;
    form.description = category.description || '';
    form.is_active = !!category.is_active;
    previewImage.value = category.image_url;
  } else {
    isEditing.value = false;
    form.id = null;
    form.name = '';
    form.description = '';
    form.is_active = true;
    previewImage.value = null;
  }
  selectedFile.value = null;
  showModal.value = true;
};

const saveCategory = async () => {
  isSaving.value = true;
  
  const formData = new FormData();
  formData.append('name', form.name);
  formData.append('description', form.description || '');
  formData.append('is_active', form.is_active ? '1' : '0');
  
  if (selectedFile.value) {
    formData.append('image', selectedFile.value);
  }

  if (isEditing.value) {
    formData.append('_method', 'PUT'); // Laravel requiere _method para procesar FormData con PUT
  }

  try {
    const url = isEditing.value ? `/categories/${form.id}` : '/categories';
    await api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    showModal.value = false;
    fetchData();
    Toast.fire({ icon: 'success', title: `Categoría ${isEditing.value ? 'actualizada' : 'creada'} correctamente` });
  } catch (error) {
    if (error.response && error.response.status === 422) {
      Toast.fire({ icon: 'warning', title: error.response.data.message || 'Verifica los datos' });
    } else {
      Toast.fire({ icon: 'error', title: 'Error al procesar la solicitud' });
    }
  } finally {
    isSaving.value = false;
  }
};

const deleteCategory = async (category) => {
  if (category.products_count > 0) {
    return Swal.fire('No permitido', `Esta categoría tiene ${category.products_count} productos asociados.`, 'warning');
  }

  const result = await ConfirmAlert.fire({
    title: '¿Eliminar Categoría?',
    text: `Estás a punto de eliminar "${category.name}".`
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

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.text-gradient-primary {
  background: linear-gradient(135deg, var(--color-primary), #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.category-preview-circle {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.upload-zone {
  border: 2px dashed var(--border-color);
  background: var(--bg-body-tertiary);
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.upload-zone:hover {
  border-color: var(--color-primary);
  background: var(--bg-hover);
}

.upload-zone.has-preview {
  border-style: solid;
  padding: 0.5rem !important;
}

.preview-container {
  width: 100%;
  height: 160px;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-container:hover .preview-overlay {
  opacity: 1;
}

.bg-dark-glass {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.custom-switch .form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.cursor-pointer { cursor: pointer; }
</style>