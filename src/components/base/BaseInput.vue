<template>
  <div class="base-input-wrapper mb-3">
    <label v-if="label" class="form-label small fw-bold text-muted text-uppercase mb-2">
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
        :class="{ 'is-invalid': error }"
        v-bind="$attrs"
        @input="$emit('update:modelValue', $event.target.value)"
      >
    </div>
    <div v-if="error" class="invalid-feedback d-block mt-1">
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
  error: String
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.input-group-custom {
  position: relative;
}
.has-icon .form-control {
  padding-left: 2.8rem;
}
.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  z-index: 5;
  font-size: 1.1rem;
}
</style>