<template>
  <div class="base-input-wrapper mb-3">
    <label v-if="label" class="form-label small fw-semibold text-body-secondary text-uppercase mb-1 ms-1">
      {{ label }}
    </label>
    <div class="input-group-custom" :class="{ 'has-icon': icon }">
      <span v-if="icon" class="input-icon">
        <i :class="icon"></i>
      </span>
      <input
        :type="type"
        :value="modelValue"
        class="form-control"
        :class="{ 'is-invalid': error, 'form-control-sm': size === 'sm' }"
        v-bind="$attrs"
        @input="$emit('update:modelValue', $event.target.value)"
      >
    </div>
    <div v-if="error" class="invalid-feedback d-block mt-1 ms-1 small">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  modelValue: [String, Number],
  type: {
    type: String,
    default: 'text'
  },
  icon: String,
  error: String,
  size: {
    type: String,
    default: 'md' // sm, md
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.input-group-custom {
  position: relative;
  transition: all 0.2s ease;
}
.has-icon .form-control {
  padding-left: 2.5rem;
}
.input-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  z-index: 5;
  font-size: 1rem;
  transition: color 0.2s ease;
}
.form-control:focus + .input-icon {
  color: var(--color-primary);
}
.form-control {
  border-color: var(--border-color);
  background-color: var(--bg-input);
}
.form-control:focus {
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}
</style>