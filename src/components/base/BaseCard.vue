<template>
  <div class="card shadow-sm border-0 mb-3" :class="{ 'card-flush': noPadding }">
    <div v-if="title || $slots.header" class="card-header bg-transparent py-2 px-3">
      <div class="d-flex align-items-center justify-content-between">
        <h6 v-if="title" class="mb-0 fw-bold text-body-emphasis">{{ title }}</h6>
        <slot name="header" />
      </div>
    </div>
    <div class="card-body" :class="{ 'p-0': noPadding, 'p-3': !noPadding }">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer bg-transparent border-top py-2 px-3">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  noPadding: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-2px);
}
</style>