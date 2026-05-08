<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Header -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
      <div>
        <div class="d-flex align-items-center gap-3 mb-2">
          <router-link :to="{ name: 'productos' }" class="btn btn-icon-sm rounded-circle bg-light border shadow-sm transition-all hover-primary">
            <i class="fa-solid fa-arrow-left"></i>
          </router-link>
          <BaseBadge variant="success" soft class="px-3 py-1 rounded-pill fw-bold">Activos Visuales</BaseBadge>
        </div>
        <h2 class="fw-800 mb-0 text-body-emphasis lh-1" v-if="product">Galería: {{ product.name }}</h2>
        <p class="text-body-secondary mt-2 mb-0" v-if="product">
          Código Maestro: <span class="fw-800 text-primary">{{ product.sku }}</span> • Gestión de narrativa visual.
        </p>
      </div>
      <div class="d-flex gap-2">
        <BaseButton variant="light" class="rounded-pill px-4" @click="fetchImages">
          <i class="fa-solid fa-rotate me-2"></i>Sincronizar
        </BaseButton>
      </div>
    </div>

    <div class="row g-4">
      <!-- Upload Section -->
      <div class="col-12 col-xl-4">
        <div class="card border-0 rounded-5 shadow-soft overflow-hidden h-100">
          <div class="card-header bg-white border-0 pt-5 px-5 pb-0">
            <h5 class="fw-800 mb-1 text-body-emphasis">Carga de Multimedia</h5>
            <p class="text-muted smaller mb-0 fw-medium text-uppercase tracking-tighter">Procesamiento por Lotes</p>
          </div>
          <div class="card-body p-5">
            <div 
              class="premium-upload-zone border-2 border-dashed rounded-5 p-5 text-center transition-all mb-4"
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
                <div class="upload-icon-box mb-3 mx-auto">
                  <i class="fa-solid fa-cloud-arrow-up text-primary fs-2"></i>
                </div>
                <h6 class="fw-800 text-body-emphasis mb-2">Suelte archivos aquí</h6>
                <p class="smallest text-muted mb-0">o explore en su estación de trabajo</p>
                <div class="mt-4">
                  <span class="badge rounded-pill bg-primary-soft text-primary px-3 py-2 fw-800 smaller">JPG, PNG, WEBP</span>
                </div>
              </div>
              <div v-else class="py-4">
                <div class="spinner-border text-primary mb-4" role="status" style="width: 3rem; height: 3rem;"></div>
                <h6 class="fw-800 text-body-emphasis mb-1">Cifrando y Subiendo...</h6>
                <p class="smallest text-muted mb-0">No cierre la ventana maestro</p>
              </div>
            </div>

            <div class="alert bg-light border rounded-4 smaller d-flex gap-3 p-3 mb-0">
              <i class="fa-solid fa-circle-info text-primary fs-5"></i>
              <div class="text-body-secondary fw-medium">
                La secuencia de carga determinará automáticamente el <span class="fw-800 text-dark">Maestro Visual (Principal)</span>.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gallery Grid -->
      <div class="col-12 col-xl-8">
        <div class="card border-0 rounded-5 shadow-soft h-100">
          <div class="card-header bg-white border-0 pt-5 px-5 pb-0">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <h5 class="fw-800 mb-0 text-body-emphasis">Vitrina Digital</h5>
              <span class="badge rounded-pill bg-light border text-dark px-3 py-2 fw-800 smaller">
                {{ images.length }} ARCHIVOS
              </span>
            </div>
            <p class="text-muted smaller mb-0 fw-medium text-uppercase tracking-tighter">Inventario de Imágenes</p>
          </div>
          <div class="card-body p-5">
            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="text-muted mt-3 smaller fw-800 text-uppercase tracking-wider">Desencriptando Galería...</p>
            </div>

            <div v-else-if="images.length === 0" class="text-center py-5">
              <div class="empty-gallery-icon mb-4 mx-auto opacity-20">
                <i class="fa-solid fa-images display-1"></i>
              </div>
              <h6 class="text-muted fw-800 text-uppercase tracking-wider mb-2">Bóveda Visual Vacía</h6>
              <p class="small text-muted">Inicie la carga multimedia para generar contenido.</p>
            </div>

            <div v-else class="row g-4">
              <div class="col-6 col-md-4 col-lg-3" v-for="image in images" :key="image.id">
                <div class="premium-image-card position-relative rounded-5 overflow-hidden shadow-sm border-2 border-white h-100 transition-all">
                  <!-- Primary Badge -->
                  <div v-if="image.is_primary" class="position-absolute top-0 start-0 m-3 z-3">
                    <span class="badge bg-brand text-white shadow-brand-sm px-3 py-2 rounded-pill fw-800 smallest">
                      <i class="fa-solid fa-star me-1"></i>MAESTRO
                    </span>
                  </div>

                  <!-- Image Container -->
                  <div class="ratio ratio-1x1 bg-light overflow-hidden">
                    <img :src="image.url" class="object-fit-cover transition-slow" :alt="product?.name">
                  </div>

                  <!-- Hover Actions -->
                  <div class="premium-image-actions d-flex justify-content-center align-items-center gap-3 transition-all z-2">
                    <button 
                      class="btn btn-white btn-icon-md rounded-circle shadow-lg" 
                      @click="setPrimary(image.id)"
                      :disabled="image.is_primary"
                      title="Marcar como Principal"
                    >
                      <i class="fa-solid" :class="image.is_primary ? 'fa-star text-warning' : 'fa-star-half-stroke'"></i>
                    </button>
                    <button 
                      class="btn btn-danger btn-icon-md rounded-circle shadow-lg" 
                      @click="deleteImage(image.id)"
                      title="Eliminar permanentemente"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                  <!-- Decorative Overlay -->
                  <div class="image-inner-overlay position-absolute inset-0 z-1"></div>
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
import BaseBadge from '../components/base/BaseBadge.vue';
import BaseButton from '../components/base/BaseButton.vue';

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
    Toast.fire({ icon: 'error', title: 'Fallo al recuperar metadatos del producto' });
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
  const validFiles = files.filter(file => file.type.match('image.*'));
  if (validFiles.length === 0) {
    return Toast.fire({ icon: 'warning', title: 'Restricción de tipo: Solo se admiten formatos visuales' });
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
    Toast.fire({ icon: 'success', title: 'Multimedia sincronizado correctamente' });
    fetchImages();
    if (fileInput.value) fileInput.value.value = '';
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Fallo crítico en transferencia de datos' });
  } finally {
    isUploading.value = false;
  }
};

const setPrimary = async (imageId) => {
  try {
    await api.put(`/products/${productId}/images/${imageId}/primary`);
    fetchImages();
    Toast.fire({ icon: 'success', title: 'Maestro Visual actualizado' });
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Error de jerarquía visual' });
  }
};

const deleteImage = async (imageId) => {
  const result = await ConfirmAlert.fire({
    title: '¿Confirmar purga de archivo?',
    text: 'Esta acción eliminará permanentemente el activo multimedia.'
  });

  if (result.isConfirmed) {
    try {
      await api.delete(`/products/${productId}/images/${imageId}`);
      fetchImages();
      Toast.fire({ icon: 'success', title: 'Activo purgado con éxito' });
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Fallo al purgar archivo' });
    }
  }
};
</script>

<style scoped>
.fw-800 { font-weight: 800; }
.smaller { font-size: 0.85rem; }
.smallest { font-size: 0.75rem; }
.tracking-tighter { letter-spacing: -0.02em; }
.tracking-wider { letter-spacing: 0.1em; }
.shadow-soft { box-shadow: 0 10px 40px rgba(0,0,0,0.04) !important; }
.transition-slow { transition: all 0.6s ease; }

.btn-icon-sm {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  border: none;
}

.btn-icon-md {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.hover-primary:hover {
  background: var(--color-primary-soft) !important;
  color: var(--color-primary) !important;
}

.premium-upload-zone {
  border-color: var(--border-color);
  cursor: pointer;
  background-color: var(--bg-body-tertiary);
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.premium-upload-zone:hover, .premium-upload-zone.is-dragging {
  border-color: var(--color-primary);
  background-color: var(--color-primary-soft);
}

.upload-icon-box {
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
}

.bg-primary-soft { background: var(--color-primary-soft); }

.premium-image-card:hover img {
  transform: scale(1.1);
}

.premium-image-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -40%);
  opacity: 0;
  pointer-events: none;
}

.premium-image-card:hover .premium-image-actions {
  opacity: 1;
  transform: translate(-50%, -50%);
  pointer-events: all;
}

.image-inner-overlay {
  background: linear-gradient(to top, rgba(0,0,0,0.4), transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.premium-image-card:hover .image-inner-overlay {
  opacity: 1;
}

.btn-white {
  background-color: white;
  color: var(--slate-900);
  border: none;
}

.btn-white:hover {
  background-color: var(--color-primary);
  color: white;
}

.shadow-brand-sm {
  box-shadow: 0 10px 20px var(--color-primary-glass) !important;
}

.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.rounded-5 { border-radius: 2rem !important; }
</style>