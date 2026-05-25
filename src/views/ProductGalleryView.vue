<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Encabezado -->
    <div class="sol-page-header mb-3">
      <div>
        <div class="d-flex align-items-center gap-3 mb-2">
          <router-link :to="{ name: 'productos' }" class="btn btn-light border shadow-sm rounded-circle d-flex align-items-center justify-content-center"
            style="width: 36px; height: 36px;">
            <i class="fa-solid fa-arrow-left"></i>
          </router-link>
        </div>
        <h2 class="sol-page-title" v-if="product">Imágenes: {{ product.name }}</h2>
        <p class="sol-page-subtitle" v-if="product">
          SKU: <span class="sol-fw-800" style="color: var(--sol-color-primary);">{{ product.sku }}</span> &bull; Sube y gestiona las fotos de este producto.
        </p>
      </div>
      <BaseButton variant="light" class="rounded-pill px-4" @click="fetchImages">
        <i class="fa-solid fa-rotate me-2"></i>Actualizar
      </BaseButton>
    </div>

    <div class="row g-4">
      <!-- Upload Section -->
      <div class="col-12 col-xl-4">
        <div class="ui-card h-100">
          <div class="p-4 pb-0 border-bottom">
            <h5 class="sol-fw-800 mb-1">Subir Imágenes</h5>
            <p class="text-muted sol-smaller mb-3 sol-tracking-tight text-uppercase">Selecciona varias fotos</p>
          </div>
          <div class="p-4">
            <div
              class="sol-upload-zone p-4 text-center mb-4 d-flex align-items-center justify-content-center"
              style="min-height: 220px;"
              :class="{ 'sol-upload-zone--dragging': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              @click="$refs.fileInput.click()"
            >
              <input type="file" ref="fileInput" class="d-none" multiple accept="image/jpeg, image/png, image/webp" @change="handleFileSelect">
              <div v-if="!isUploading">
                <div class="sol-upload-icon mb-3">
                  <i class="fa-solid fa-cloud-arrow-up text-primary fs-2"></i>
                </div>
                <h6 class="sol-fw-800 mb-2">Arrastra las fotos aquí</h6>
                <p class="sol-smallest text-muted mb-0">o haz clic para buscar en tu equipo</p>
                <div class="mt-3">
                  <span class="badge rounded-pill px-3 py-2 sol-fw-800 sol-smaller"
                        style="background: var(--sol-color-primary-soft); color: var(--sol-color-primary);">JPG, PNG, WEBP</span>
                </div>
              </div>
              <div v-else class="py-4 text-center">
                <div class="spinner-border mb-3" style="color: var(--sol-color-primary); width: 3rem; height: 3rem;" role="status"></div>
                <h6 class="sol-fw-800 mb-1">Subiendo archivos...</h6>
                <p class="sol-smallest text-muted mb-0">No cierre esta ventana</p>
              </div>
            </div>

            <div class="d-flex gap-3 p-3 rounded-3 border bg-light sol-smaller">
              <i class="fa-solid fa-circle-info text-primary fs-5"></i>
              <div class="text-muted">
                La primera imagen que subas se marcará automáticamente como la <span class="sol-fw-800 text-dark">Foto Principal</span>.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gallery Grid -->
      <div class="col-12 col-xl-8">
        <div class="ui-card h-100">
          <div class="p-4 border-bottom d-flex justify-content-between align-items-center">
            <div>
              <h5 class="sol-fw-800 mb-0">Imágenes Guardadas</h5>
              <p class="text-muted sol-smaller mb-0 sol-tracking-tight text-uppercase">Fotos de este producto</p>
            </div>
            <span class="badge rounded-pill bg-light border text-dark px-3 py-2 sol-fw-800 sol-smaller">
              {{ images.length }} FOTOS
            </span>
          </div>
          <div class="p-4">
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border" style="color: var(--sol-color-primary);" role="status"></div>
              <p class="text-muted mt-3 sol-smaller sol-fw-800 text-uppercase sol-tracking-wide">Cargando imágenes...</p>
            </div>

            <div v-else-if="images.length === 0" class="text-center py-5">
              <div class="mb-4" style="opacity: 0.2;">
                <i class="fa-solid fa-images" style="font-size: 5rem;"></i>
              </div>
              <h6 class="text-muted sol-fw-800 text-uppercase sol-tracking-wide mb-2">Aún no hay fotos</h6>
              <p class="small text-muted">Sube fotos en el panel izquierdo para comenzar.</p>
            </div>

            <div v-else class="row g-3">
              <div class="col-6 col-md-4 col-lg-3" v-for="image in images" :key="image.id">
                <div class="gallery-card position-relative rounded-3 overflow-hidden shadow-sm h-100">
                  <!-- Primary Badge -->
                  <div v-if="image.is_primary" class="position-absolute top-0 start-0 m-2 z-3">
                    <span class="badge px-3 py-2 rounded-pill sol-fw-800 sol-smallest"
                          style="background: var(--sol-color-primary); color: white;">
                      <i class="fa-solid fa-star me-1"></i>FOTO PRINCIPAL
                    </span>
                  </div>

                  <!-- Image -->
                  <div class="ratio ratio-1x1 bg-light overflow-hidden d-flex align-items-center justify-content-center">
                    <img
                      v-if="!imageLoadErrors[image.id]"
                      :src="image.image_url || image.url"
                      class="w-100 h-100 object-fit-cover sol-transition-slow"
                      :alt="product?.name"
                      @error="handleImageError(image.id)"
                    >
                    <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted bg-white p-3">
                      <svg class="w-50 h-50 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </div>

                  <!-- Hover Actions -->
                  <div class="gallery-actions d-flex justify-content-center align-items-center gap-2 z-2">
                    <button
                      class="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                      style="width: 40px; height: 40px; background: white; border: none;"
                      @click="setPrimary(image.id)"
                      :disabled="image.is_primary"
                      title="Marcar como Principal"
                    >
                      <i class="fa-solid" :class="image.is_primary ? 'fa-star text-warning' : 'fa-star-half-stroke'"></i>
                    </button>
                    <button
                      class="btn btn-danger btn-sm rounded-circle d-flex align-items-center justify-content-center"
                      style="width: 40px; height: 40px;"
                      @click="deleteImage(image.id)"
                      title="Eliminar imagen"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                  <!-- Overlay -->
                  <div class="gallery-overlay position-absolute inset-0 z-1"></div>
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
import BaseButton from '../components/base/BaseButton.vue';

const route = useRoute();
const productId = route.params.id;

const product = ref(null);
const images = ref([]);
const isLoading = ref(true);
const isUploading = ref(false);
const isDragging = ref(false);
const fileInput = ref(null);
const imageLoadErrors = ref({});

const handleImageError = (id) => {
  imageLoadErrors.value[id] = true;
};

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
    Toast.fire({ icon: 'error', title: 'Error al obtener los datos del producto' });
  }
};

const fetchImages = async () => {
  isLoading.value = true;
  try {
    const response = await api.get(`/products/${productId}/images`);
    images.value = response.data;
    imageLoadErrors.value = {}; // Reset errors on fetch
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
  const validFiles = files.filter(file => file.type.match('image.*'));
  if (validFiles.length === 0) {
    return Toast.fire({ icon: 'warning', title: 'Solo se permiten archivos de imagen (JPG, PNG o WEBP)' });
  }

  isUploading.value = true;
  const formData = new FormData();
  validFiles.forEach(file => {
    formData.append('images[]', file); 
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
    Toast.fire({ icon: 'success', title: 'Foto principal establecida' });
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Error al cambiar la foto principal' });
  }
};

const deleteImage = async (imageId) => {
  const result = await ConfirmAlert.fire({
    title: '¿Eliminar esta foto?',
    text: 'Esta foto se borrará permanentemente del catálogo.'
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/products/${productId}/images/${imageId}`);
      fetchImages();
      Toast.fire({ icon: 'success', title: 'Imagen eliminada correctamente' });
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Error al eliminar la imagen' });
    }
  }
};
</script>

<style scoped>
/* Tarjetas de galería */
.gallery-card { transition: var(--sol-transition-base); }
.gallery-card:hover img { transform: scale(1.08); }

.gallery-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -40%);
  opacity: 0;
  pointer-events: none;
  transition: all 0.25s ease;
}
.gallery-card:hover .gallery-actions {
  opacity: 1;
  transform: translate(-50%, -50%);
  pointer-events: all;
}
.gallery-overlay {
  background: linear-gradient(to top, rgba(0,0,0,0.35), transparent 55%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.gallery-card:hover .gallery-overlay { opacity: 1; }

/* Upload zone dragging state */
.sol-upload-zone--dragging {
  border-color: var(--sol-color-primary) !important;
  background: var(--sol-color-primary-soft) !important;
}

.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
</style>