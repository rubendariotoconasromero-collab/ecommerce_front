<template>
  <div class="base-data-grid" :class="{ 'base-data-grid--compact': compact }">
    <!-- Header: Search and Filters -->
    <div class="grid-header mb-3 p-2 p-md-3 bg-body rounded-4 border shadow-sm" v-if="searchable">
      <div class="row g-2 align-items-center">
        <div class="col-12 col-md-5">
          <div class="input-group-custom has-icon">
            <span class="input-icon"><i class="bi bi-search"></i></span>
            <input 
              type="text" 
              class="form-control form-control-sm py-2" 
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

    <!-- Data Content -->
    <div v-if="layout === 'table'" class="card border-0 shadow-sm rounded-4 bg-body overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-body-tertiary">
            <tr>
              <th v-if="titleKey" class="ps-4" :style="{ width: mainColWidth }">{{ mainColLabel }}</th>
              <th v-for="col in visibleColumns" :key="col.key" :class="[col.align ? `text-${col.align}` : '']">{{ col.label }}</th>
              <th v-if="$slots['item-status']" class="text-center">ESTADO</th>
              <th v-if="$slots['item-footer-actions']" class="text-center">{{ footerActionsLabel }}</th>
              <th class="text-end pe-4" style="width: 80px;">ACCIONES</th>
            </tr>
          </thead>

          <BaseSkeletonTable 
            v-if="loading" 
            :rows="5" 
            :columns="visibleColumns.length + (titleKey ? 1 : 0)" 
            :hasAvatar="!!titleKey" 
          />

          <tbody v-else-if="items.length === 0">
            <tr>
              <td :colspan="totalColumns" class="py-4 border-0 text-center">
                <BaseEmptyState :title="emptyTitle" :description="emptyDescription" :icon="emptyIcon" />
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="item in items" :key="item.id" class="animate__animated animate__fadeIn animate__faster">
              <td v-if="titleKey" class="ps-4">
                <div class="d-flex align-items-center gap-3 py-1">
                  <slot name="item-avatar" :item="item">
                    <div class="avatar-circle-sm bg-soft-primary text-primary fw-bold">
                      {{ item[titleKey]?.charAt(0).toUpperCase() || '?' }}
                    </div>
                  </slot>
                  <div class="lh-sm">
                    <div class="fw-bold text-body-emphasis small d-flex align-items-center flex-wrap gap-2">
                      {{ item[titleKey] }}
                      <slot name="item-title-badge" :item="item" />
                    </div>
                    <div class="text-body-secondary smaller mt-1" v-if="subtitleKey">{{ item[subtitleKey] }}</div>
                  </div>
                </div>
              </td>

              <td v-for="col in visibleColumns" :key="col.key" :class="[col.align ? `text-${col.align}` : '', 'small text-body']">
                <slot :name="`col-${col.key}`" :item="item" :value="item[col.key]">{{ item[col.key] || '---' }}</slot>
              </td>

              <td v-if="$slots['item-status']" class="text-center">
                <slot name="item-status" :item="item" />
              </td>

              <td v-if="$slots['item-footer-actions']" class="text-center">
                <slot name="item-footer-actions" :item="item" />
              </td>

              <td class="text-end pe-4">
                <div class="dropdown">
                  <button class="btn btn-icon-only text-body-secondary border-0 bg-transparent shadow-none" type="button" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}'>
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-xl border-0 p-2 rounded-3 animate__animated animate__fadeIn animate__faster" style="min-width: 160px; z-index: 9999;">
                    <slot name="item-actions" :item="item">
                      <li><button class="dropdown-item rounded-2 py-2 small" @click="$emit('edit', item)"><i class="bi bi-pencil me-2 text-primary"></i>Editar</button></li>
                      <li><hr class="dropdown-divider mx-2 my-1"></li>
                      <li><button class="dropdown-item text-danger rounded-2 py-2 small" @click="$emit('delete', item)"><i class="bi bi-trash3 me-2"></i>Eliminar</button></li>
                    </slot>
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Card Grid Layout -->
    <div v-else class="card-grid-container">
      <div v-if="loading" class="row g-3">
        <div v-for="n in 6" :key="n" class="col-12 col-md-6 col-xl-4">
          <BaseSkeletonCard />
        </div>
      </div>
      
      <div v-else-if="items.length === 0" class="card bg-body border-0 shadow-sm rounded-4 py-5 text-center">
        <BaseEmptyState :title="emptyTitle" :description="emptyDescription" :icon="emptyIcon" />
      </div>

      <div v-else class="row g-3">
        <div v-for="item in items" :key="item.id" class="col-12 col-md-6 col-xl-4 animate__animated animate__fadeIn">
          <slot name="item-card" :item="item">
            <div class="card h-100 border-0 shadow-sm rounded-4 bg-body hover-translate-y transition-all">
              <div class="card-body p-3">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <slot name="item-avatar" :item="item">
                    <div class="avatar-circle-sm bg-soft-primary text-primary fw-bold">
                      {{ item[titleKey]?.charAt(0).toUpperCase() || '?' }}
                    </div>
                  </slot>
                  <div class="lh-sm">
                    <div class="fw-bold text-body-emphasis small d-flex align-items-center flex-wrap gap-2">
                      {{ item[titleKey] }}
                      <slot name="item-title-badge" :item="item" />
                    </div>
                    <div class="text-body-secondary smaller mt-1" v-if="subtitleKey">{{ item[subtitleKey] }}</div>
                  </div>
                  <div class="ms-auto">
                    <slot name="item-status" :item="item" />
                  </div>
                </div>
                <div class="small text-body mb-3">
                  <div v-for="col in visibleColumns.slice(0, 3)" :key="col.key" class="d-flex justify-content-between mb-1">
                    <span class="text-body-secondary fw-medium">{{ col.label }}:</span>
                    <span>{{ item[col.key] || '---' }}</span>
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                  <slot name="item-footer-actions" :item="item" />
                  <div class="dropdown">
                    <button class="btn btn-icon-only text-body-secondary border-0 bg-transparent shadow-none" type="button" data-bs-toggle="dropdown" data-bs-popper-config='{"strategy":"fixed"}'>
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-xl border-0 p-2 rounded-3" style="min-width: 160px; z-index: 9999;">
                      <slot name="item-actions" :item="item">
                        <li><button class="dropdown-item rounded-2 py-2 small" @click="$emit('edit', item)"><i class="bi bi-pencil me-2 text-primary"></i>Editar</button></li>
                        <li><hr class="dropdown-divider mx-2 my-1"></li>
                        <li><button class="dropdown-item text-danger rounded-2 py-2 small" @click="$emit('delete', item)"><i class="bi bi-trash3 me-2"></i>Eliminar</button></li>
                      </slot>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="grid-footer mt-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 px-2" v-if="items.length > 0">
      <div class="small text-body-secondary">
        Mostrando <span class="fw-semibold text-body-emphasis">{{ pagination.from || 1 }}</span> al 
        <span class="fw-semibold text-body-emphasis">{{ pagination.to || items.length }}</span> de 
        <span class="fw-semibold text-body-emphasis">{{ pagination.total || items.length }}</span>
      </div>
      <nav aria-label="Pagination" v-if="pagination.last_page > 1">
        <ul class="pagination pagination-rounded mb-0 gap-1">
          <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
            <button class="page-link shadow-none" @click.prevent="$emit('page-change', pagination.current_page - 1)">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          
          <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: pagination.current_page === page }">
            <button class="page-link shadow-none" @click.prevent="$emit('page-change', page)">{{ page }}</button>
          </li>

          <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
            <button class="page-link shadow-none" @click.prevent="$emit('page-change', pagination.current_page + 1)">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue';
import BaseEmptyState from './BaseEmptyState.vue';
import BaseSkeletonTable from './BaseSkeletonTable.vue';
import BaseSkeletonCard from './BaseSkeletonCard.vue';

const props = defineProps({
  layout: {
    type: String,
    default: 'table' // table, card
  },
  items: { type: Array, required: true },
  columns: { type: Array, required: true }, // { label, key, hidden, align }
  loading: { type: Boolean, default: false },
  searchable: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: 'Buscar registros...' },
  titleKey: { type: String, default: null },
  subtitleKey: { type: String, default: null },
  mainColLabel: { type: String, default: 'INFORMACIÓN' },
  mainColWidth: { type: String, default: 'auto' },
  footerActionsLabel: { type: String, default: 'DETALLES' },
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
  },
  compact: {
    type: Boolean,
    default: false
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

const visiblePages = computed(() => {
  const current = props.pagination.current_page;
  const last = props.pagination.last_page;
  const delta = 2;
  const range = [];

  for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
    range.push(i);
  }

  if (current - delta > 2) range.unshift('...');
  range.unshift(1);
  if (current + delta < last - 1) range.push('...');
  if (last > 1) range.push(last);

  return range.filter(p => p !== '...' || true); // Simple range for now, but could be improved
});
</script>

<style scoped>
.smaller { font-size: 0.75rem; }

.table thead th {
  font-size: 0.725rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  border-top: none;
  padding: 0.85rem 1rem;
}

.table tbody td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-light);
}

.avatar-circle-sm {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.bg-soft-primary { background: var(--color-primary-soft); }

.pagination-rounded .page-link {
  border-radius: 8px !important;
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  background: var(--bg-body);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.pagination-rounded .page-item.active .page-link {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
  box-shadow: 0 4px 10px var(--color-primary-glass);
}

.pagination-rounded .page-item:not(.active):not(.disabled) .page-link:hover {
  background-color: var(--bg-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-icon-only {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-icon-only:hover {
  background: var(--bg-hover) !important;
  color: var(--color-primary) !important;
}

.input-group-custom { position: relative; }
.has-icon .form-control { padding-left: 2.5rem; }
.input-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  z-index: 5;
  font-size: 0.9rem;
}

.table-hover tbody tr {
  transition: background-color 0.15s ease;
}

/* Evita que el dropdown se oculte detrás de otras filas o se recorte al final de la tabla */
.table tbody tr:focus-within {
  z-index: 10;
  position: relative;
}

.table-responsive {
  padding-bottom: 60px; /* Espacio extra para que el dropdown no se corte en tablas con pocos registros */
  margin-bottom: -60px;
}

/* Compact Mode Styles */
.base-data-grid--compact .table thead th {
  padding: 0.5rem 0.75rem;
  font-size: 0.7rem;
}

.base-data-grid--compact .table tbody td {
  padding: 0.5rem 0.75rem;
  font-size: 0.775rem;
}

.base-data-grid--compact .avatar-circle-sm {
  width: 28px;
  height: 28px;
  font-size: 0.75rem;
}

.base-data-grid--compact .py-1 {
  padding-top: 0.15rem !important;
  padding-bottom: 0.15rem !important;
}

.base-data-grid--compact .gap-3 {
  gap: 0.5rem !important;
}

.base-data-grid--compact .card-body {
  padding: 0.75rem !important;
}
</style>