<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-wrapper-custom d-flex align-items-center justify-content-center">
      <!-- Backdrop con blur -->
      <div class="modal-backdrop-custom" @click="close"></div>
      
      <!-- Caja del Dialogo -->
      <div class="modal-dialog modal-dialog-centered my-0 p-3" :class="sizeClass" style="z-index: 1051; width: 100%; max-width: inherit; pointer-events: auto;" @click.stop>
        <div 
          class="modal-content-custom animate__animated animate__zoomIn animate__faster"
          :style="{ maxWidth: sizeMaxWidth }"
          style="pointer-events: auto;"
          @click.stop
        >
          <!-- Header del Modal -->
          <div v-if="title || $slots.header" class="modal-header-custom">
            <h5 class="modal-title-custom">
              <slot name="icon" />
              {{ title }}
            </h5>
            <button type="button" class="btn-close-custom shadow-none" @click="close" aria-label="Cerrar">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <!-- Cuerpo del Modal -->
          <div class="modal-body-custom">
            <slot />
          </div>
          
          <!-- Pie del Modal (Footer) -->
          <div v-if="$slots.footer" class="modal-footer-custom d-flex justify-content-end gap-2">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  title: String,
  size: {
    type: String,
    default: 'md' // sm, md, lg, xl
  }
});

const emit = defineEmits(['update:modelValue']);

const sizeClass = computed(() => {
  return props.size !== 'md' ? `modal-${props.size}` : '';
});

const sizeMaxWidth = computed(() => {
  switch (props.size) {
    case 'sm': return '420px';
    case 'lg': return '850px';
    case 'xl': return '1140px';
    case 'md':
    default:
      return '600px';
  }
});

const close = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped>
.modal-wrapper-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1050;
  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
}

.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  z-index: 1040;
  transition: all 0.25s ease;
}

.modal-content-custom {
  border: none !important;
  border-radius: 16px !important;
  background-color: var(--sol-neutral-white, #ffffff);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  overflow: hidden;
  margin: auto;
  width: 100%;
  pointer-events: auto !important;
}

.modal-header-custom {
  background: linear-gradient(135deg, rgba(var(--sol-color-primary-rgb, 59, 130, 246), 0.07) 0%, rgba(255, 255, 255, 0.9) 100%);
  border-bottom: 1px solid var(--sol-neutral-border, #e2e8f0);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title-custom {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--sol-neutral-dark, #1e293b);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.modal-body-custom {
  padding: 1.5rem;
  max-height: 75vh;
  overflow-y: auto;
}

.modal-footer-custom {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--sol-neutral-border, #e2e8f0);
  background-color: var(--sol-neutral-light, #f8fafc);
}

.btn-close-custom {
  background-color: var(--sol-neutral-border, #e2e8f0);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 0.85rem;
  color: var(--sol-neutral-dark, #1e293b);
  padding: 0;
}

.btn-close-custom:hover {
  background-color: var(--sol-color-danger-soft, #fee2e2);
  color: var(--sol-color-danger, #ef4444);
  transform: rotate(90deg);
}

/* Soporte para animaciones fluidas */
.animate__animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}
</style>