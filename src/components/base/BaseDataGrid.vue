<template>
  <div class="base-data-grid">
    <!-- Header: Search and Filters -->
    <div class="grid-header mb-4 p-3 bg-white rounded-4 border shadow-sm" v-if="searchable">
      <div class="row g-3 align-items-center">
        <div class="col-12 col-md-5">
          <div class="input-group-custom has-icon">
            <span class="input-icon"><i class="bi bi-search"></i></span>
            <input 
              type="text" 
              class="form-control" 
              :placeholder="searchPlaceholder"
              @input="onSearch"
            >
          </div>
        </div>
        <div class="col-12 col-md-auto ms-auto">
          <slot name="filters" />
        </div>
      </div>
    </div>

    <!-- Table Layout -->
    <div class="card border-0 shadow-sm rounded-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
            <tr>
              <!-- Principal Info Header -->
              <th v-if="titleKey" class="ps-4" :style="{ width: mainColWidth }">
                {{ mainColLabel }}
              </th>
              
              <!-- Dynamic Columns Headers -->
              <th 
                v-for="col in visibleColumns" 
                :key="col.key"
                :class="[col.align ? `text-${col.align}` : '']"
              >
                {{ col.label }}
              </th>

              <!-- Status Column Header -->
              <th v-if="$slots['item-status']" class="text-center">ESTADO</th>

              <!-- Details/Footer Actions Header -->
              <th v-if="$slots['item-footer-actions']" class="text-center">DETALLES</th>

              <!-- Actions Column Header -->
              <th class="text-end pe-4" style="width: 100px;">ACCIONES</th>
            </tr>
          </thead>

          <!-- Loading State -->
          <tbody v-if="loading">
            <tr v-for="n in 5" :key="n">
              <td :colspan="totalColumns" class="py-4 text-center">
                <div class="spinner-border spinner-border-sm text-brand" role="status"></div>
                <span class="ms-2 text-muted small">Cargando...</span>
              </td>
            </tr>
          </tbody>

          <!-- Empty State -->
          <tbody v-else-if="items.length === 0">
            <tr>
              <td :colspan="totalColumns" class="py-5 border-0">
                <BaseEmptyState 
                  :title="emptyTitle" 
                  :description="emptyDescription" 
                  :icon="emptyIcon"
                />
              </td>
            </tr>
          </tbody>

          <!-- Data Rows -->
          <tbody v-else>
            <tr 
              v-for="item in items" 
              :key="item.id" 
              class="animate__animated animate__fadeIn"
            >
              <!-- Info Principal (Avatar + Title + Subtitle) -->
              <td v-if="titleKey" class="ps-4">
                <div class="d-flex align-items-center gap-3">
                  <slot name="item-avatar" :item="item">
                    <div class="avatar-circle-sm bg-soft-primary text-brand fw-bold">
                      {{ item[titleKey]?.charAt(0).toUpperCase() || '?' }}
                    </div>
                  </slot>
                  <div>
                    <div class="fw-bold text-dark">{{ item[titleKey] }}</div>
                    <div class="text-muted small" v-if="subtitleKey">{{ item[subtitleKey] }}</div>
                  </div>
                </div>
              </td>

              <!-- Dynamic Columns -->
              <td 
                v-for="col in visibleColumns" 
                :key="col.key"
                :class="[col.align ? `text-${col.align}` : '']"
              >
                <slot :name="`col-${col.key}`" :item="item" :value="item[col.key]">
                  {{ item[col.key] || '---' }}
                </slot>
              </td>

              <!-- Status -->
              <td v-if="$slots['item-status']" class="text-center">
                <slot name="item-status" :item="item" />
              </td>

              <!-- Footer Actions (as Details column) -->
              <td v-if="$slots['item-footer-actions']" class="text-center">
                <slot name="item-footer-actions" :item="item" />
              </td>

              <!-- Actions Dropdown -->
              <td class="text-end pe-4">
                <div class="dropdown">
                  <button 
                    class="btn btn-icon-only text-muted" 
                    type="button" 
                    data-bs-toggle="dropdown"
                    data-bs-popper-config='{"strategy":"fixed"}'
                  >
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-xl border-0 p-2 rounded-3" style="min-width: 150px; z-index: 1060;">
                    <slot name="item-actions" :item="item">
                      <li><button class="dropdown-item rounded-2 py-2" @click="$emit('edit', item)"><i class="bi bi-pencil me-2"></i>Editar</button></li>
                      <li><hr class="dropdown-divider mx-2"></li>
                      <li><button class="dropdown-item text-danger rounded-2 py-2" @click="$emit('delete', item)"><i class="bi bi-trash3 me-2"></i>Eliminar</button></li>
                    </slot>
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="grid-footer mt-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 px-3" v-if="items.length > 0">
      <div class="small text-muted">
        Mostrando <span class="fw-bold text-dark">{{ pagination.from || 1 }}</span> al 
        <span class="fw-bold text-dark">{{ pagination.to || items.length }}</span> de 
        <span class="fw-bold text-dark">{{ pagination.total || items.length }}</span> resultados
      </div>
      <nav aria-label="Pagination" v-if="pagination.last_page > 1">
        <ul class="pagination pagination-rounded mb-0 shadow-sm">
          <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
            <a class="page-link" href="#" @click.prevent="$emit('page-change', pagination.current_page - 1)">
              <i class="bi bi-chevron-left"></i>
            </a>
          </li>
          
          <li v-for="page in pagination.last_page" :key="page" class="page-item" :class="{ active: pagination.current_page === page }">
            <a class="page-link" href="#" @click.prevent="$emit('page-change', page)">{{ page }}</a>
          </li>

          <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
            <a class="page-link" href="#" @click.prevent="$emit('page-change', pagination.current_page + 1)">
              <i class="bi bi-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue';
import BaseEmptyState from './BaseEmptyState.vue';

const props = defineProps({
  items: { type: Array, required: true },
  columns: { type: Array, required: true }, // { label, key, hidden, align }
  loading: { type: Boolean, default: false },
  searchable: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: 'Buscar registros...' },
  titleKey: { type: String, default: null },
  subtitleKey: { type: String, default: null },
  mainColLabel: { type: String, default: 'INFORMACIÓN' },
  mainColWidth: { type: String, default: 'auto' },
  emptyTitle: String,
  emptyDescription: String,
  emptyIcon: String,
  pagination: {
    type: Object,
    default: () => ({
      current_page: 1,
      last_page: 1,
      total: 0,
      from: 0,
      to: 0
    })
  }
});

const emit = defineEmits(['search', 'edit', 'delete', 'page-change']);
const slots = useSlots();

const onSearch = (event) => {
  emit('search', event.target.value);
};

const visibleColumns = computed(() => {
  return props.columns.filter(col => !col.hidden);
});

const totalColumns = computed(() => {
  let count = visibleColumns.value.length + 1; // +1 for Actions
  if (props.titleKey) count++;
  if (slots['item-status']) count++;
  if (slots['item-footer-actions']) count++;
  return count;
});
</script>

<style scoped>
.table thead th {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  border-top: none;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.avatar-circle-sm {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.bg-soft-primary { background: var(--color-primary-soft); }

.pagination-rounded .page-item .page-link {
  border-radius: 50%;
  margin: 0 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.pagination-rounded .page-item.active .page-link {
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 4px 8px var(--color-primary-glass);
}

.btn-icon-only {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.btn-icon-only:hover {
  background: var(--bg-hover);
  color: var(--color-primary) !important;
}

.input-group-custom { position: relative; }
.has-icon .form-control { padding-left: 2.8rem; }
.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  z-index: 5;
}

.table-hover tbody tr {
  transition: background-color 0.2s ease;
}

/* Ensure row with open dropdown is on top of other rows */
.table tbody tr:focus-within {
  z-index: 10;
  position: relative;
}
</style>