<template>
  <div class="card shadow-soft border-0 mb-3" :class="{ 'card-flush': noPadding, 'rounded-5': premium }">
    <div v-if="title || $slots.header" class="card-header bg-transparent border-0 py-3 px-4">
      <div class="d-flex align-items-center justify-content-between">
        <h5 v-if="title" class="mb-0 fw-800 text-body-emphasis">{{ title }}</h5>
        <slot name="header" />
      </div>
    </div>
    <div class="card-body" :class="{ 'p-0': noPadding, 'p-4': !noPadding }">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer bg-transparent border-top border-light py-3 px-4">
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
  },
  premium: {
    type: Boolean,
    default: true
  }
});
</script>

<style scoped>
.card {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  background: var(--bg-card);
}

.shadow-soft {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03) !important;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08) !important;
}

.fw-800 { font-weight: 800; }
.rounded-5 { border-radius: 2rem !important; }
</style>