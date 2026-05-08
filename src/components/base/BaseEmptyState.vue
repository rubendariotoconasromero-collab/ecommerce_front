<template>
  <div class="text-center py-4 py-md-5">
    <div class="animate__animated animate__fadeIn">
      <div class="icon-wrapper mb-3">
        <i v-if="icon" :class="[icon, 'text-body-secondary opacity-50']" style="font-size: 3.5rem;"></i>
      </div>
      <h5 class="fw-bold text-body-emphasis">{{ title }}</h5>
      <p class="text-body-secondary mx-auto" style="max-width: 400px;">{{ description }}</p>
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

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: var(--bg-hover);
  border-radius: 50%;
  margin-bottom: 1.5rem;
}
</style>