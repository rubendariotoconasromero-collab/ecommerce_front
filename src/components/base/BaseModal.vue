<template>
  <Teleport to="body">
    <div
      class="modal fade shadow-lg"
      :class="{ show: modelValue, 'd-block': modelValue }"
      tabindex="-1"
      aria-hidden="true"
      v-if="modelValue"
    >
      <div class="modal-backdrop fade show" @click="close"></div>
      <div class="modal-dialog modal-dialog-centered" :class="sizeClass">
        <div class="modal-content border-0 shadow-xl rounded-4 animate__animated animate__zoomIn animate__faster bg-body">
          <div v-if="title || $slots.header" class="modal-header border-0 pb-0 px-4 pt-4">
            <h5 class="modal-title fw-bold text-body-emphasis d-flex align-items-center gap-2">
              <slot name="icon" />
              {{ title }}
            </h5>
            <button type="button" class="btn-close shadow-none" @click="close"></button>
          </div>
          <div class="modal-body px-4 py-3">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer border-0 p-4 pt-0">
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

const close = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped>
.modal-backdrop {
  z-index: -1;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
.d-block {
  display: block !important;
}
.modal-content {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
</style>