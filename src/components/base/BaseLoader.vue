<template>
  <div class="base-loader py-5 text-center">
    <div 
      class="spinner-border text-primary" 
      :class="sizeClass" 
      style="border-width: 3px;"
      role="status"
    ></div>
    <p v-if="text" class="mt-3 text-body-secondary small fw-medium">{{ text }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: 'Sincronizando...'
  },
  size: {
    type: String,
    default: 'md' // sm, md, lg
  }
});

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'spinner-border-sm';
  if (props.size === 'lg') return 'spinner-border-lg';
  return '';
});
</script>

<style scoped>
.spinner-border-lg {
  width: 3rem;
  height: 3rem;
}
</style>