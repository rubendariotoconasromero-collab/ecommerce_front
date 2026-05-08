<template>
  <div class="animate__animated animate__fadeIn">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
      <div>
        <BaseBadge variant="primary" soft class="mb-2 px-3 py-1 rounded-pill fw-bold">Estructura de Tienda</BaseBadge>
        <h2 class="fw-800 mb-0 text-body-emphasis lh-1">Gestión de Categorías</h2>
        <p class="text-body-secondary mt-2 mb-0">Organiza tu inventario con una jerarquía visual impecable.</p>
      </div>
      <div class="d-flex align-items-center gap-3">
        <div class="premium-segmented-control shadow-sm p-1 rounded-pill bg-light border">
          <button 
            class="btn btn-icon-sm rounded-circle transition-all" 
            :class="{ 'bg-white shadow-sm text-primary': currentLayout === 'table', 'text-muted': currentLayout !== 'table' }"
            @click="currentLayout = 'table'"
            title="Vista de Tabla"
          >
            <i class="fa-solid fa-list-ul"></i>
          </button>
          <button 
            class="btn btn-icon-sm rounded-circle transition-all" 
            :class="{ 'bg-white shadow-sm text-primary': currentLayout === 'card' }"
            @click="currentLayout = 'card'"
            title="Vista de Cuadrícula"
          >
            <i class="fa-solid fa-table-cells-large"></i>
          </button>
        </div>
        <BaseButton variant="brand" class="rounded-pill px-4 py-2 fw-bold shadow-brand-sm" @click="openModal(null)">
          <i class="fa-solid fa-circle-plus me-2"></i> Nueva Categoría
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
      empty-icon="fa-solid fa-folder-open"
      @edit="openModal"
      @delete="deleteCategory"
    >
      <!-- Custom Avatar for Category Image -->
      <template #item-avatar="{ item }">
        <div class="category-premium-frame overflow-hidden shadow-sm border-2 border-white">
          <img v-if="item.image_url" :src="item.image_url" alt="Cat" class="w-100 h-100 object-fit-cover transition-slow">
          <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center bg-soft-primary text-primary fw-800 fs-5">
            {{ item.name?.charAt(0).toUpperCase() }}
          </div>
        </div>
      </template>

      <!-- Custom column for products count -->
      <template #col-products_count="{ value }">
        <div class="text-body-secondary small fw-bold">
          <span class="badge rounded-pill bg-light border text-dark px-3 py-2">
            <i class="fa-solid fa-boxes-stacked text-primary me-2"></i> {{ value || 0 }} ítems
          </span>
        </div>
      </template>

      <!-- Status Badge -->
      <template #item-status="{ item }">
        <div class="d-flex align-items-center">
          <div v-if="item.is_active" class="status-indicator active"></div>
          <div v-else class="status-indicator inactive"></div>
          <span class="smaller fw-800 text-uppercase tracking-tighter" :class="item.is_active ? 'text-success' : 'text-danger'">
            {{ item.is_active ? 'Publicada' : 'Oculta' }}
          </span>
        </div>
      </template>
    </BaseDataGrid>

    <BaseModal v-model="showModal" :title="isEditing ? 'Configurar Categoría' : 'Nueva Categoría Maestro'" size="md">
      <form @submit.prevent="saveCategory" id="categoryForm" class="p-2">
        <div class="row g-4">
          <div class="col-12">
            <BaseInput 
              v-model="form.name" 
              label="Etiqueta de Categoría" 
              placeholder="Ej: Inyección Industrial de Polímeros" 
              required
              class="premium-input"
            />
          </div>

          <div class="col-12">
            <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Visual de Portada</label>
            <div class="premium-upload-zone rounded-5 border-dashed p-2 text-center transition-all" :class="{ 'has-preview': previewImage }">
              <input 
                type="file" 
                id="categoryImage" 
                class="visually-hidden" 
                accept="image/*"
                @change="onFileChange"
              >
              <label for="categoryImage" class="upload-label cursor-pointer w-100 h-100 mb-0 d-flex align-items-center justify-content-center" style="min-height: 200px;">
                <div v-if="!previewImage" class="animate__animated animate__fadeIn py-4">
                  <div class="upload-icon-box mb-3 mx-auto">
                    <i class="fa-solid fa-cloud-arrow-up text-primary fs-3"></i>
                  </div>
                  <h6 class="fw-800 text-body-emphasis mb-1">Arrastra o selecciona imagen</h6>
                  <p class="smallest text-muted mb-0">Recomendado: 800x600px (Máx. 2MB)</p>
                </div>
                <div v-else class="preview-stage position-relative animate__animated animate__zoomIn">
                  <img :src="previewImage" alt="Preview" class="img-fluid rounded-4 shadow-sm preview-img">
                  <div class="preview-actions position-absolute top-50 start-50 translate-middle d-flex gap-2">
                    <span class="badge bg-white text-dark shadow-lg px-4 py-2 rounded-pill fw-800 smaller pointer-events-none">
                      <i class="fa-solid fa-image-rotate me-2 text-primary"></i> Cambiar Arte
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Narrativa de Categoría</label>
            <textarea class="form-control premium-textarea" rows="3" v-model="form.description" placeholder="Escribe una breve descripción técnica o comercial..."></textarea>
          </div>

          <div class="col-12">
            <div class="p-3 bg-light rounded-4 border">
              <div class="form-check form-switch premium-switch d-flex align-items-center justify-content-between px-0">
                <label class="form-check-label ms-0" for="activeSwitch">
                  <span class="fw-800 text-body-emphasis">Estado de Visibilidad</span>
                  <div class="smallest text-muted">¿Habilitar para venta al público?</div>
                </label>
                <input 
                  class="form-check-input ms-0 mt-0 shadow-none" 
                  type="checkbox" 
                  role="switch" 
                  id="activeSwitch" 
                  v-model="form.is_active"
                >
              </div>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton type="submit" form="categoryForm" variant="brand" class="rounded-pill px-5 shadow-brand-sm" :loading="isSaving">
            {{ isEditing ? 'Guardar Cambios' : 'Generar Categoría' }}
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
  { label: 'ÍTEMS ACTIVOS', key: 'products_count', align: 'center' }
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
    Toast.fire({ icon: 'error', title: 'Error de sincronización con la nube' });
  } finally {
    isLoading.value = false;
  }
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    Toast.fire({ icon: 'warning', title: 'El archivo excede los límites (2MB)' });
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
    formData.append('_method', 'PUT'); 
  }

  try {
    const url = isEditing.value ? `/categories/${form.id}` : '/categories';
    await api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    showModal.value = false;
    fetchData();
    Toast.fire({ icon: 'success', title: `Procesado con éxito` });
  } catch (error) {
    if (error.response && error.response.status === 422) {
      Toast.fire({ icon: 'warning', title: error.response.data.message || 'Verifica los parámetros' });
    } else {
      Toast.fire({ icon: 'error', title: 'Fallo crítico en el servidor' });
    }
  } finally {
    isSaving.value = false;
  }
};

const deleteCategory = async (category) => {
  if (category.products_count > 0) {
    return Swal.fire({
      title: 'Operación Bloqueada',
      text: `Esta categoría resguarda ${category.products_count} productos. Reubícalos primero.`,
      icon: 'warning',
      confirmButtonColor: 'var(--color-primary)'
    });
  }

  const result = await ConfirmAlert.fire({
    title: '¿Confirmar eliminación?',
    text: `Esta acción es irreversible para la categoría "${category.name}".`
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/categories/${category.id}`);
      fetchData();
      Swal.fire({
        title: 'Depurado',
        text: 'Registro eliminado permanentemente.',
        icon: 'success',
        confirmButtonColor: 'var(--color-primary)'
      });
    } catch (error) {
      Swal.fire('Error', 'Fallo al purgar registro.', 'error');
    }
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.fw-800 { font-weight: 800; }
.smaller { font-size: 0.85rem; }
.smallest { font-size: 0.75rem; }
.tracking-tighter { letter-spacing: -0.02em; }
.transition-slow { transition: all 0.6s ease; }

.category-premium-frame {
  width: 60px;
  height: 60px;
  border-radius: 20px;
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-premium-frame:hover img {
  transform: scale(1.15);
}

.premium-segmented-control {
  display: flex;
  gap: 4px;
}

.btn-icon-sm {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  border: none;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 10px;
}

.status-indicator.active { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
.status-indicator.inactive { background: #ef4444; }

.premium-upload-zone {
  border: 2px dashed var(--border-color);
  background: var(--bg-body-tertiary);
  cursor: pointer;
  overflow: hidden;
  border-radius: 2rem !important;
}

.premium-upload-zone:hover {
  border-color: var(--color-primary);
  background: var(--bg-hover);
}

.upload-icon-box {
  width: 60px;
  height: 60px;
  background: var(--color-primary-soft);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-stage img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.preview-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-stage:hover .preview-actions {
  opacity: 1;
}

.premium-textarea {
  border-radius: 1.25rem;
  border: 2px solid var(--border-light);
  background: var(--bg-body-tertiary);
  padding: 1rem;
  transition: all 0.3s ease;
}

.premium-textarea:focus {
  border-color: var(--color-primary);
  background: white;
  box-shadow: 0 0 0 4px var(--color-primary-soft);
}

.premium-switch .form-check-input {
  width: 3rem;
  height: 1.75rem;
  cursor: pointer;
}

.premium-switch .form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.shadow-brand-sm {
  box-shadow: 0 10px 20px var(--color-primary-glass) !important;
}
</style>