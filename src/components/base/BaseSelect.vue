<template>
  <div class="base-select-wrapper mb-3">
    <label v-if="label" class="form-label small fw-bold text-muted text-uppercase mb-2">
      {{ label }}
    </label>
    <select
      :value="modelValue"
      class="form-select"
      :class="{ 'is-invalid': error }"
      v-bind="$attrs"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <slot />
    </select>
    <div v-if="error" class="invalid-feedback d-block mt-1">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  modelValue: [String, Number, Array],
  error: String
});

defineEmits(['update:modelValue']);
</script>