<template>
  <Teleport to="body">
    <div
      class="modal fade"
      :class="{ show: modelValue, 'd-block': modelValue }"
      tabindex="-1"
      aria-hidden="true"
      v-if="modelValue"
    >
      <div class="modal-backdrop fade show" @click="close"></div>
      <div class="modal-dialog modal-dialog-centered" :class="sizeClass">
        <div class="modal-content border-0 shadow-xl rounded-4 animate__animated animate__zoomIn animate__faster">
          <div v-if="title" class="modal-header border-0 pb-0 px-4 pt-4">
            <h5 class="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <slot name="icon" />
              {{ title }}
            </h5>
            <button type="button" class="btn-close" @click="close"></button>
          </div>
          <div class="modal-body p-4">
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
}
.d-block {
  background: rgba(0, 0, 0, 0.5);
  display: block !important;
}
</style>