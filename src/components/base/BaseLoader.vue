<template>
  <div class="base-loader py-5 text-center">
    <div 
      class="spinner-grow text-brand" 
      :class="sizeClass" 
      role="status"
    ></div>
    <p v-if="text" class="mt-3 text-muted small fw-medium">{{ text }}</p>
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
  return props.size !== 'md' ? `spinner-grow-${props.size}` : '';
});
</script>