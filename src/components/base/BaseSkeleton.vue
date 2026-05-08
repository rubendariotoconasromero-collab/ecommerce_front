<template>
  <div 
    class="skeleton-base" 
    :class="[
      { 'skeleton-animate': animate },
      `skeleton-${variant}`
    ]"
    :style="style"
  ></div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'text' // text, rect, circle, button, avatar
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: 'auto'
  },
  animate: {
    type: Boolean,
    default: true
  },
  borderRadius: {
    type: String,
    default: null
  }
});

const style = computed(() => {
  const s = {
    width: props.width,
    height: props.height === 'auto' ? (props.variant === 'text' ? '0.8em' : '100%') : props.height
  };
  
  if (props.borderRadius) {
    s.borderRadius = props.borderRadius;
  }
  
  return s;
});
</script>

<style scoped>
.skeleton-base {
  background-color: var(--bg-hover);
  display: block;
}

.skeleton-animate {
  animation: skeleton-shimmer 1.8s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    var(--bg-hover) 25%,
    var(--border-color) 37%,
    var(--bg-hover) 63%
  );
  background-size: 400% 100%;
}

@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.skeleton-text {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  border-radius: 4px;
}

.skeleton-rect {
  border-radius: var(--radius-md);
}

.skeleton-circle {
  border-radius: 50%;
}

.skeleton-avatar {
  border-radius: 12px;
  width: 40px;
  height: 40px;
}

.skeleton-button {
  border-radius: 8px;
  width: 32px;
  height: 32px;
}
</style>