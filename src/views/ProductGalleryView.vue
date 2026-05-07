<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <router-link :to="{ name: 'productos' }" class="btn btn-sm btn-light rounded-circle">
            <i class="bi bi-arrow-left"></i>
          </router-link>
          <h3 class="fw-bold mb-0">Galería de Imágenes</h3>
        </div>
        <p class="text-muted-custom small mb-0" v-if="product">
          Gestionando imágenes para: <span class="fw-bold text-dark">{{ product.name }}</span> (SKU: {{ product.sku }})
        </p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm px-3" @click="fetchImages">
          <i class="bi bi-arrow-clockwise me-2"></i>Actualizar
        </button>
      </div>
    </div>

    <div class="row g-4">
      <!-- Upload Section -->
      <div class="col-12 col-xl-4">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-header bg-white border-0 pt-4 px-4">
            <h6 class="fw-bold mb-0">Subir Nuevas Imágenes</h6>
            <p class="text-muted small mb-0">Puedes seleccionar varios archivos a la vez</p>
          </div>
          <div class="card-body p-4">
            <div 
              class="upload-zone border-2 border-dashed rounded-4 p-5 text-center transition-all mb-3"
              :class="{ 'is-dragging': isDragging, 'is-uploading': isUploading }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="$refs.fileInput.click()"
            >
              <input 
                type="file" 
                ref="fileInput" 
                class="d-none" 
                multiple 
                accept="image/jpeg, image/png, image/webp"
                @change="handleFileSelect"
              >
              <div v-if="!isUploading">
                <i class="bi bi-cloud-arrow-up fs-1 text-brand mb-2 d-block"></i>
                <h6 class="fw-bold text-dark">Arrastra tus imágenes aquí</h6>
                <p class="small text-muted mb-0">o haz clic para buscar archivos</p>
                <div class="mt-3">
                  <span class="badge bg-soft-primary text-brand small">JPG, PNG, WEBP</span>
                </div>
              </div>
              <div v-else>
                <div class="spinner-border text-brand mb-3" role="status"></div>
                <h6 class="fw-bold text-dark">Subiendo archivos...</h6>
                <p class="small text-muted mb-0">Por favor, espera un momento</p>
              </div>
            </div>

            <div class="alert bg-soft-info border-0 small mb-0">
              <i class="bi bi-info-circle-fill me-2"></i>
              La primera imagen que subas será marcada automáticamente como **Principal**.
            </div>
          </div>
        </div>
      </div>

      <!-- Gallery Grid -->
      <div class="col-12 col-xl-8">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
            <h6 class="fw-bold mb-0">Imágenes del Producto ({{ images.length }})</h6>
          </div>
          <div class="card-body p-4">
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-brand" role="status"></div>
              <p class="text-muted mt-2 small">Cargando galería...</p>
            </div>

            <div v-else-if="images.length === 0" class="text-center py-5">
              <i class="bi bi-images fs-1 text-muted opacity-25 mb-3 d-block"></i>
              <h6 class="text-muted fw-bold">Sin imágenes registradas</h6>
              <p class="small text-muted">Utiliza el panel de la izquierda para comenzar.</p>
            </div>

            <div v-else class="row g-3">
              <div class="col-6 col-md-4 col-lg-3" v-for="image in images" :key="image.id">
                <div class="image-card position-relative rounded-4 overflow-hidden shadow-sm border h-100">
                  <!-- Primary Badge -->
                  <div v-if="image.is_primary" class="position-absolute top-0 start-0 m-2 z-1">
                    <span class="badge bg-brand text-white shadow-sm px-2">
                      <i class="bi bi-star-fill me-1"></i>Principal
                    </span>
                  </div>

                  <!-- Image Container -->
                  <div class="ratio ratio-1x1 bg-light">
                    <img :src="image.url" class="object-fit-cover" :alt="product?.name">
                  </div>

                  <!-- Hover Actions -->
                  <div class="image-actions d-flex justify-content-center align-items-center gap-2 transition-all">
                    <button 
                      class="btn btn-sm btn-white rounded-circle shadow-sm" 
                      @click="setPrimary(image.id)"
                      :disabled="image.is_primary"
                      title="Marcar como Principal"
                    >
                      <i class="bi" :class="image.is_primary ? 'bi-star-fill text-warning' : 'bi-star'"></i>
                    </button>
                    <button 
                      class="btn btn-sm btn-danger rounded-circle shadow-sm" 
                      @click="deleteImage(image.id)"
                      title="Eliminar"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../plugins/axios';
import { Toast, ConfirmAlert } from '../plugins/swal';

const route = useRoute();
const productId = route.params.id;

const product = ref(null);
const images = ref([]);
const isLoading = ref(true);
const isUploading = ref(false);
const isDragging = ref(false);
const fileInput = ref(null);

onMounted(() => {
  fetchProduct();
  fetchImages();
});

const fetchProduct = async () => {
  try {
    const response = await api.get(`/products/${productId}`);
    product.value = response.data;
  } catch (error) {
    console.error('Error al cargar producto');
    Toast.fire({ icon: 'error', title: 'No se pudo cargar el producto' });
  }
};

const fetchImages = async () => {
  isLoading.value = true;
  try {
    const response = await api.get(`/products/${productId}/images`);
    images.value = response.data;
  } catch (error) {
    console.error('Error al cargar imágenes');
  } finally {
    isLoading.value = false;
  }
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  if (files.length > 0) {
    uploadImages(files);
  }
};

const handleDrop = (event) => {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer.files);
  if (files.length > 0) {
    uploadImages(files);
  }
};

const uploadImages = async (files) => {
  // Validar tipos de archivo
  const validFiles = files.filter(file => file.type.match('image.*'));
  if (validFiles.length === 0) {
    return Toast.fire({ icon: 'warning', title: 'Solo se permiten archivos de imagen' });
  }

  isUploading.value = true;
  const formData = new FormData();
  validFiles.forEach(file => {
    formData.append('images[]', file); // Nota el uso de [] para múltiples archivos en Laravel
  });

  try {
    await api.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    Toast.fire({ icon: 'success', title: 'Imágenes subidas correctamente' });
    fetchImages();
    if (fileInput.value) fileInput.value.value = '';
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Error al subir las imágenes' });
  } finally {
    isUploading.value = false;
  }
};

const setPrimary = async (imageId) => {
  try {
    await api.put(`/products/${productId}/images/${imageId}/primary`);
    fetchImages();
    Toast.fire({ icon: 'success', title: 'Imagen principal actualizada' });
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Error al actualizar' });
  }
};

const deleteImage = async (imageId) => {
  const result = await ConfirmAlert.fire({
    title: '¿Eliminar imagen?',
    text: 'Esta acción no se puede deshacer.'
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/products/${productId}/images/${imageId}`);
      fetchImages();
      Toast.fire({ icon: 'success', title: 'Imagen eliminada' });
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Error al eliminar' });
    }
  }
};
</script>

<style scoped>
.upload-zone {
  border-color: #dee2e6;
  cursor: pointer;
  background-color: #f8f9fa;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover, .upload-zone.is-dragging {
  border-color: var(--color-primary);
  background-color: var(--color-primary-soft);
}

.upload-zone.is-uploading {
  pointer-events: none;
  opacity: 0.7;
}

.btn-white {
  background-color: white;
  color: var(--text-dark);
}

.image-card .image-actions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  opacity: 0;
  z-index: 2;
}

.image-card:hover .image-actions {
  opacity: 1;
}

.object-fit-cover {
  object-fit: cover;
}
</style>