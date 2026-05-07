<template>
  <button
    :type="type"
    :class="[
      'btn',
      `btn-${variant}`,
      size ? `btn-${size}` : '',
      { 'btn-loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
    <i v-if="icon && !loading" :class="[icon, $slots.default ? 'me-2' : '']"></i>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'brand' // brand, light, danger, success, info, warning
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
  }
});

defineEmits(['click']);
</script>

<style scoped>
.btn-loading {
  cursor: wait;
  opacity: 0.8;
}
</style>