<template>
  <span 
    class="badge" 
    :class="[
      soft ? `bg-soft-${variant}` : `bg-${variant}`,
      { 'border': border }
    ]"
  >
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'secondary'
  },
  soft: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: false
  }
});
</script>