<template>
  <div class="card shadow-sm border-0 mb-4" :class="{ 'card-flush': noPadding }">
    <div v-if="title || $slots.header" class="card-header border-bottom bg-transparent py-3">
      <div class="d-flex align-items-center justify-content-between">
        <h5 v-if="title" class="mb-0 fw-bold text-dark">{{ title }}</h5>
        <slot name="header" />
      </div>
    </div>
    <div class="card-body" :class="{ 'p-0': noPadding }">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer bg-transparent border-top py-3">
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