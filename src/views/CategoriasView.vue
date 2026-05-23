<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Encabezado de Página -->
    <div class="sol-page-header mb-5">
      <div>
        <BaseBadge variant="primary" soft class="mb-2 px-3 py-1 rounded-pill sol-fw-800">Estructura de Tienda</BaseBadge>
        <h2 class="sol-page-title">Gestión de Categorías</h2>
        <p class="sol-page-subtitle">Organiza tu inventario con una jerarquía visual impecable.</p>
      </div>
      <div class="d-flex align-items-center gap-3">
        <!-- Control segmentado layout -->
        <div class="sol-segmented">
          <button
            class="sol-segmented__btn"
            :class="{ 'sol-segmented__btn--active': currentLayout === 'table' }"
            @click="currentLayout = 'table'"
            title="Vista de Tabla"
          >
            <i class="fa-solid fa-list-ul"></i>
          </button>
          <button
            class="sol-segmented__btn"
            :class="{ 'sol-segmented__btn--active': currentLayout === 'card' }"
            @click="currentLayout = 'card'"
            title="Vista de Cuadrícula"
          >
            <i class="fa-solid fa-table-cells-large"></i>
          </button>
        </div>
        <BaseButton variant="brand" class="rounded-pill px-4 py-2 sol-fw-800 sol-shadow-brand" @click="openModal(null)">
          <i class="fa-solid fa-circle-plus me-2"></i> Nueva Categoría
        </BaseButton>
      </div>
    </div>

    <!-- Grid de Categorías -->
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
        <span class="badge rounded-pill bg-light border text-dark px-3 py-2 sol-fw-800 sol-smaller">
          <i class="fa-solid fa-boxes-stacked text-primary me-2"></i>{{ value || 0 }} ítems
        </span>
      </template>

      <!-- Badge de estado -->
      <template #item-status="{ item }">
        <div class="d-flex align-items-center">
          <div class="sol-status-dot" :class="item.is_active ? 'sol-status-dot--active' : 'sol-status-dot--inactive'"></div>
          <span class="sol-smaller sol-fw-800 text-uppercase sol-tracking-tight"
                :class="item.is_active ? 'text-success' : 'text-danger'">
            {{ item.is_active ? 'Publicada' : 'Oculta' }}
          </span>
        </div>
      </template>
    </BaseDataGrid>

    <!-- Modal de Categoría -->
    <BaseModal v-model="showModal" :title="isEditing ? 'Configurar Categoría' : 'Nueva Categoría'" size="md">
      <form @submit.prevent="saveCategory" id="categoryForm" class="p-2">
        <div class="row g-4">
          <div class="col-12">
            <BaseInput
              v-model="form.name"
              label="Etiqueta de Categoría"
              placeholder="Ej: Inyección Industrial de Polímeros"
              required
            />
          </div>

          <div class="col-12">
            <label class="form-label">Visual de Portada</label>
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
            <label class="form-label">Descripción de la Categoría</label>
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
    if (error.response?.status === 422) {
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
      confirmButtonColor: 'var(--sol-color-primary)'
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
      Swal.fire({ title: 'Eliminado', text: 'Registro eliminado permanentemente.', icon: 'success', confirmButtonColor: 'var(--sol-color-primary)' });
    } catch (error) {
      Swal.fire('Error', 'Fallo al eliminar registro.', 'error');
    }
  }
};

onMounted(() => { fetchData(); });
</script>