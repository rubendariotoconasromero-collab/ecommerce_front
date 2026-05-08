<template>
  <button
    :type="type"
    :class="[
      'btn',
      `btn-${variant}`,
      size ? `btn-${size}` : '',
      { 'btn-loading': loading },
      { 'w-100': block }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner-border spinner-border-sm" role="status"></span>
    <i v-if="icon && !loading" :class="[icon]"></i>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'brand' // brand, light, danger, success, info, warning, outline-brand
  },
  size: {
    type: String,
    default: '' // sm, lg
  },
  type: {
    type: String,
    default: 'button'
  },
  icon: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<style scoped>
.btn {
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:active {
  transform: scale(0.98);
}

.btn-loading {
  cursor: wait;
  opacity: 0.8;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
}

/* Ensure brand variant has proper depth */
.btn-brand {
  box-shadow: var(--shadow-sm);
}

.btn-brand:hover:not(:disabled) {
  box-shadow: 0 4px 12px var(--color-primary-glass);
}

/* Outline variant for secondary actions */
.btn-outline-brand {
  border: 1.5px solid var(--color-primary);
  color: var(--color-primary);
  background: transparent;
}

.btn-outline-brand:hover:not(:disabled) {
  background: var(--color-primary-soft);
}
</style>