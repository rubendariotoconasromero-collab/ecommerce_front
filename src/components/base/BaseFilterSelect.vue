<template>
  <div 
    class="sol-custom-select" 
    :style="{ width: width || 'auto' }" 
    ref="dropdownRef"
  >
    <!-- Trigger Button -->
    <div 
      class="select-trigger d-flex align-items-center justify-content-between transition-all"
      :class="{ 'is-open': isOpen }"
      @click="toggleDropdown"
    >
      <span class="selected-label text-truncate">{{ selectedLabel }}</span>
      <i class="fa-solid fa-chevron-down chevron-arrow transition-all"></i>
    </div>

    <!-- Floating Options Dropdown -->
    <transition name="fade-slide">
      <div v-if="isOpen" class="select-dropdown-list shadow-lg border rounded-3 animate__animated animate__fadeIn animate__faster">
        <div 
          v-for="option in options" 
          :key="option.value"
          class="dropdown-item-custom d-flex align-items-center justify-content-between"
          :class="{ 'is-selected': option.value === modelValue }"
          @click="selectOption(option.value)"
        >
          <span class="option-label text-truncate">{{ option.label }}</span>
          <i v-if="option.value === modelValue" class="fa-solid fa-check check-icon text-primary small"></i>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: [String, Number, Boolean],
  options: {
    type: Array,
    required: true // Array of { label: String, value: any }
  },
  width: String
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (value) => {
  emit('update:modelValue', value);
  isOpen.value = false;
};

const selectedLabel = computed(() => {
  const selected = props.options.find(opt => opt.value === props.modelValue);
  return selected ? selected.label : '';
});

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true);
});
</script>

<style scoped>
.sol-custom-select {
  position: relative;
  user-select: none;
  font-family: var(--sol-font-family);
}

.select-trigger {
  background-color: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md); /* Matches input fields semirounded (0.8rem) */
  height: 38px;
  padding: 0 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-main);
  cursor: pointer;
}

.select-trigger:hover {
  border-color: var(--slate-400) !important;
}

.select-trigger.is-open {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 3px var(--color-primary-soft) !important;
}

.chevron-arrow {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-left: 0.5rem;
}

.select-trigger.is-open .chevron-arrow {
  transform: rotate(180deg);
  color: var(--color-primary);
}

.select-dropdown-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  z-index: 1050;
  max-height: 250px;
  overflow-y: auto;
  padding: 0.35rem 0;
  transform-origin: top;
}

.dropdown-item-custom {
  padding: 0.55rem 1rem;
  font-size: 0.825rem;
  color: var(--text-main);
  cursor: pointer;
  transition: var(--transition-fast);
}

.dropdown-item-custom:hover {
  background-color: var(--bg-hover);
  color: var(--color-primary);
}

.dropdown-item-custom.is-selected {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 600;
}

.check-icon {
  margin-left: 0.5rem;
}

/* Custom scrollbar styling for floating list */
.select-dropdown-list::-webkit-scrollbar {
  width: 6px;
}
.select-dropdown-list::-webkit-scrollbar-track {
  background: transparent;
}
.select-dropdown-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}
.select-dropdown-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
