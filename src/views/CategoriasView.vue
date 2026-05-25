<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Encabezado de Página -->
    <div class="sol-page-header mb-3">
      <div>
        <h2 class="sol-page-title">Gestión de Categorías</h2>
        <p class="sol-page-subtitle">Organiza tu inventario con una jerarquía visual impecable.</p>
      </div>
      <div class="d-flex align-items-center gap-3">
        <BaseButton variant="brand" class="rounded-pill px-4 py-2 sol-fw-800 sol-shadow-brand" @click="openModal(null)">
          <i class="fa-solid fa-plus me-2"></i> Nueva Categoría
        </BaseButton>
      </div>
    </div>

    <!-- Grid de Categorías -->
    <BaseDataGrid
      :items="categories"
      :columns="gridColumns"
      :loading="isLoading"
      title-key="name"
      main-col-label="CATEGORÍA"
      compact
      search-placeholder="Buscar por nombre o descripción de categoría..."
      empty-title="No hay categorías registradas"
      empty-icon="fa-solid fa-folder-open"
      @edit="openModal"
      @search="handleSearch"
    >
      <!-- Avatar de Categoría -->
      <template #item-avatar="{ item }">
        <div class="sol-item-frame border-2 border-white shadow-sm">
          <img v-if="item.image_url" :src="item.image_url" alt="Cat" class="w-100 h-100 object-fit-cover sol-transition-slow">
          <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-primary sol-fw-800 fs-5"
               style="background: var(--sol-color-primary-soft)">
            {{ item.name?.charAt(0).toUpperCase() }}
          </div>
        </div>
      </template>

      <!-- Columna de conteo de productos -->
      <template #col-products_count="{ value }">
        <span class="badge rounded-pill bg-light border text-dark px-3 py-1 sol-fw-800 sol-smallest">
          {{ value || 0 }} productos
        </span>
      </template>

      <!-- Badge de estado -->
      <template #item-status="{ item }">
        <span
          class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest text-uppercase sol-tracking-tight border d-inline-flex align-items-center justify-content-center"
          :class="item.is_active ? 'bg-success-subtle text-success border-success-subtle' : 'bg-danger-subtle text-danger border-danger-subtle'"
          style="width: 115px;"
        >
          <i class="fa-solid me-1" :class="item.is_active ? 'fa-circle-check' : 'fa-circle-xmark'"></i>
          {{ item.is_active ? 'Activa' : 'Inactiva' }}
        </span>
      </template>

      <!-- Acciones -->
      <template #item-actions="{ item }">
        <li>
          <button class="dropdown-item rounded-3 py-2 small" @click="openModal(item)">
            <i class="fa-regular fa-pen-to-square me-2 text-primary"></i>Editar
          </button>
        </li>
        <li><hr class="dropdown-divider mx-2 opacity-50"></li>
        <li v-if="item.is_active">
          <button class="dropdown-item text-danger rounded-3 py-2 small" @click="deactivateCategory(item)">
            <i class="fa-solid fa-ban me-2"></i>Desactivar
          </button>
        </li>
        <li v-else>
          <button class="dropdown-item text-success rounded-3 py-2 small" @click="restoreCategory(item)">
            <i class="fa-solid fa-circle-check me-2"></i>Activar
          </button>
        </li>
      </template>
    </BaseDataGrid>

    <!-- Modal de Categoría -->
    <BaseModal v-model="showModal" :title="isEditing ? 'Configurar Categoría' : 'Nueva Categoría'" size="md">
      <form @submit.prevent="saveCategory" id="categoryForm" class="p-2">
        <div class="row g-3">
          <div class="col-12">
            <BaseInput
              v-model="form.name"
              label="Nombre de la Categoría"
              placeholder="Ej: Inyección Industrial de Polímeros"
              required
            />
          </div>

          <div class="col-12">
            <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Imagen de Portada</label>
            <div class="sol-upload-zone p-2 text-center" :class="{ 'has-preview': previewImage }">
              <input type="file" id="categoryImage" class="visually-hidden" accept="image/*" @change="onFileChange">
              <label for="categoryImage" class="sol-cursor w-100 h-100 mb-0 d-flex align-items-center justify-content-center" style="min-height: 200px;">
                <div v-if="!previewImage" class="animate__animated animate__fadeIn py-4">
                  <div class="sol-upload-icon">
                    <i class="fa-solid fa-cloud-arrow-up text-primary fs-3"></i>
                  </div>
                  <h6 class="sol-fw-800 mb-1">Arrastra o selecciona imagen</h6>
                  <p class="sol-smallest text-muted mb-0">Recomendado: 800×600px (Máx. 2MB)</p>
                </div>
                <div v-else class="preview-stage position-relative animate__animated animate__zoomIn">
                  <img :src="previewImage" alt="Preview" class="img-fluid rounded-3 shadow-sm" style="max-height: 220px; width: 100%; object-fit: cover;">
                  <div class="position-absolute top-50 start-50 translate-middle" style="opacity: 0; transition: opacity 0.3s;" @mouseenter="e => e.target.parentElement.querySelector('.preview-overlay').style.opacity = 1">
                    <span class="badge bg-white text-dark shadow-lg px-4 py-2 rounded-pill sol-fw-800 sol-smaller preview-overlay">
                      <i class="fa-solid fa-image-rotate me-2 text-primary"></i> Cambiar Arte
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Descripción</label>
            <textarea class="form-control sol-textarea" rows="3" v-model="form.description"
              placeholder="Breve descripción técnica o comercial..."></textarea>
          </div>

          <div class="col-12">
            <div class="p-3 rounded-3 border bg-light">
              <div class="form-check form-switch sol-switch d-flex align-items-center justify-content-between px-0">
                <label class="form-check-label ms-0" for="activeSwitch">
                  <span class="sol-fw-800">Estado de Visibilidad</span>
                  <div class="sol-smallest text-muted">¿Habilitar para venta al público?</div>
                </label>
                <input class="form-check-input ms-0 mt-0 shadow-none" type="checkbox" role="switch"
                  id="activeSwitch" v-model="form.is_active">
              </div>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton type="submit" form="categoryForm" variant="brand" class="rounded-pill px-5 sol-shadow-brand" :loading="isSaving">
            {{ isEditing ? 'Guardar Cambios' : 'Crear Categoría' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../plugins/axios';
import { Toast, ConfirmAlert, showBackendError } from '../plugins/swal';
import BaseDataGrid from '../components/base/BaseDataGrid.vue';
import BaseButton from '../components/base/BaseButton.vue';
import BaseModal from '../components/base/BaseModal.vue';
import BaseInput from '../components/base/BaseInput.vue';

const categories = ref([]);
const isLoading = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
const showModal = ref(false);

const gridColumns = [
  { label: 'PRODUCTOS', key: 'products_count', align: 'center' }
];

const form = reactive({
  id: null,
  name: '',
  description: '',
  is_active: true
});

const selectedFile = ref(null);
const previewImage = ref(null);

const searchQuery = ref('');
let debounceTimeout = null;

const handleSearch = (value) => {
  searchQuery.value = value;
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchData();
  }, 450);
};

const fetchData = async () => {
  isLoading.value = true;
  try {
    const params = {};
    if (searchQuery.value) params.search = searchQuery.value;
    const response = await api.get('/categories', { params });
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
  reader.onload = (e) => { previewImage.value = e.target.result; };
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
  if (selectedFile.value) formData.append('image', selectedFile.value);
  if (isEditing.value) formData.append('_method', 'PUT');

  try {
    const url = isEditing.value ? `/categories/${form.id}` : '/categories';
    await api.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    showModal.value = false;
    fetchData();
    Toast.fire({ icon: 'success', title: 'Procesado con éxito' });
  } catch (error) {
    showBackendError(error, 'Error al guardar categoría');
  } finally {
    isSaving.value = false;
  }
};

const deactivateCategory = async (category) => {
  const result = await ConfirmAlert.fire({
    title: '¿Desactivar categoría?',
    text: `"${category.name}" dejará de estar visible hasta ser reactivada.`,
    confirmButtonText: 'Sí, desactivar',
  });
  if (result.isConfirmed) {
    try {
      await api.delete(`/categories/${category.id}`);
      fetchData();
      Toast.fire({ icon: 'success', title: 'Categoría desactivada correctamente' });
    } catch (error) {
      showBackendError(error, 'Error al desactivar categoría');
    }
  }
};

const restoreCategory = async (category) => {
  const result = await ConfirmAlert.fire({
    title: '¿Activar categoría?',
    text: `"${category.name}" volverá a estar disponible.`,
    confirmButtonText: 'Sí, activar',
  });
  if (result.isConfirmed) {
    try {
      await api.patch(`/categories/${category.id}/restore`);
      fetchData();
      Toast.fire({ icon: 'success', title: 'Categoría reactivada correctamente' });
    } catch (error) {
      showBackendError(error, 'Error al activar categoría');
    }
  }
};

onMounted(() => { fetchData(); });
</script>

<style scoped>
.sol-item-frame {
  width: 40px !important;
  height: 40px !important;
  border-radius: var(--sol-radius-md) !important;
}
</style>