<template>
  <div class="base-select-wrapper mb-3">
    <label v-if="label" class="form-label small fw-semibold text-body-secondary text-uppercase mb-1 ms-1">
      {{ label }}
    </label>
    <select
      :value="modelValue"
      class="form-select"
      :class="{ 'is-invalid': error, 'form-select-sm': size === 'sm' }"
      v-bind="$attrs"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <slot />
    </select>
    <div v-if="error" class="invalid-feedback d-block mt-1 ms-1 small">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  modelValue: [String, Number, Array],
  error: String,
  size: {
    type: String,
    default: 'md' // sm, md
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.form-select {
  border-color: var(--border-color);
  background-color: var(--bg-input);
  padding-right: 2.5rem !important; /* Prevents text from overlapping with the arrow */
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  cursor: pointer;
}
.form-select-sm {
  padding-right: 2rem !important;
}
.form-select:focus {
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}
</style>