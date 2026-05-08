<template>
  <span 
    class="badge d-inline-flex align-items-center" 
    :class="[
      soft ? `bg-soft-${variant}` : `bg-${variant}`,
      { 'border': border },
      size ? `badge-${size}` : ''
    ]"
  >
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'secondary' // primary, success, danger, warning, info, secondary
  },
  soft: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: '' // sm
  }
});
</script>

<style scoped>
.badge {
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 0.35em 0.65em;
  transition: all 0.2s ease;
}

.badge-sm {
  padding: 0.25em 0.5em;
  font-size: 0.75rem;
}

/* Variant extensions if not in styles.css */
.bg-soft-secondary {
  background: var(--bg-hover);
  color: var(--text-muted);
}

.bg-soft-primary {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}
</style>