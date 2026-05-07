<template>
  <div class="text-center py-5">
    <div class="py-4 animate__animated animate__fadeIn">
      <i v-if="icon" :class="[icon, 'text-muted opacity-25']" style="font-size: 3rem;"></i>
      <h5 class="mt-3 fw-bold text-dark">{{ title }}</h5>
      <p class="text-muted">{{ description }}</p>
      <div v-if="$slots.action" class="mt-4">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'No se encontraron resultados'
  },
  description: {
    type: String,
    default: 'Intenta ajustar tus filtros o agregar un nuevo registro.'
  },
  icon: {
    type: String,
    default: 'bi-search'
  }
});
</script>