<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Encabezado -->
    <div class="sol-page-header mb-3">
      <div>
        <h2 class="sol-page-title">Gestión de Clientes</h2>
        <p class="sol-page-subtitle">Registro y seguimiento de clientes individuales y empresariales.</p>
      </div>
      <div class="d-flex align-items-center gap-3">
        <BaseButton variant="light" class="rounded-circle p-0" style="width: 38px; height: 38px;" @click="handleRefresh">
          <i class="fa-solid fa-rotate"></i>
        </BaseButton>
        <BaseButton variant="brand" class="rounded-pill px-4 py-2 sol-fw-800 sol-shadow-brand" @click="openModal(null)">
          <i class="fa-solid fa-plus me-2"></i> Nuevo Cliente
        </BaseButton>
      </div>
    </div>

    <!-- DataGrid -->
    <BaseDataGrid
      :key="gridKey"
      :items="customersData.data"
      :columns="gridColumns"
      :loading="isLoadingData"
      :pagination="customersData"
      title-key="name"
      subtitle-key="email"
      main-col-label="CLIENTE"
      search-placeholder="Buscar por nombre, correo, empresa o NIT..."
      compact
      :show-avatar="false"
      empty-title="Sin clientes registrados"
      empty-icon="fa-solid fa-users-slash"
      @search="handleSearch"
      @edit="openModal"
      @delete="deactivateCustomer"
      @page-change="fetchCustomers"
    >
      <!-- Filtros -->
      <template #filters>
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <BaseFilterSelect
            v-model="filters.type"
            :options="typeOptions"
            width="170px"
            @update:modelValue="fetchCustomers(1)"
          />
          <BaseFilterSelect
            v-model="filters.active"
            :options="stateOptions"
            width="170px"
            @update:modelValue="fetchCustomers(1)"
          />
          <button
            v-if="hasActiveFilters"
            type="button"
            class="btn btn-light rounded-pill px-3 border"
            style="height: 36px; font-size: 0.8125rem; font-weight: 600;"
            @click="resetFilters"
          >
            <i class="fa-solid fa-xmark me-1"></i> Limpiar
          </button>
        </div>
      </template>

      <!-- Columna: Tipo -->
      <template #col-customer_type="{ item }">
        <span
          class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest text-uppercase border"
          :class="item.customer_type === 'business'
            ? 'bg-primary-subtle text-primary border-primary-subtle'
            : 'bg-secondary-subtle text-secondary border-secondary-subtle'"
        >
          <i class="fa-solid me-1" :class="item.customer_type === 'business' ? 'fa-building' : 'fa-user'"></i>
          {{ item.customer_type === 'business' ? 'Empresa' : 'Individual' }}
        </span>
      </template>

      <!-- Columna: Empresa / NIT -->
      <template #col-business_name="{ item }">
        <div v-if="item.business_name" class="fw-semibold text-body-emphasis">{{ item.business_name }}</div>
        <div v-if="item.tax_id" class="sol-smallest text-muted mt-1">NIT: {{ item.tax_id }}</div>
        <span v-if="!item.business_name && !item.tax_id" class="text-muted">---</span>
      </template>

      <!-- Columna: Pedidos -->
      <template #col-orders_count="{ item }">
        <div class="d-flex flex-column align-items-center gap-1">
          <span class="fw-bold">{{ item.orders_count ?? 0 }}</span>
          <span
            v-if="item.active_orders_count > 0"
            class="badge bg-warning-subtle text-warning border border-warning-subtle sol-smallest rounded-pill"
          >
            {{ item.active_orders_count }} activa{{ item.active_orders_count !== 1 ? 's' : '' }}
          </span>
        </div>
      </template>

      <!-- Columna: Total Facturado -->
      <template #col-total_spent="{ item }">
        <span class="fw-semibold text-body-emphasis">
          Q {{ Number(item.total_spent ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
        </span>
      </template>

      <!-- Estado -->
      <template #item-status="{ item }">
        <span
          class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest text-uppercase border d-inline-flex align-items-center justify-content-center"
          :class="item.is_active
            ? 'bg-success-subtle text-success border-success-subtle'
            : 'bg-danger-subtle text-danger border-danger-subtle'"
          style="width: 105px;"
        >
          <i class="fa-solid me-1" :class="item.is_active ? 'fa-circle-check' : 'fa-circle-xmark'"></i>
          {{ item.is_active ? 'Activo' : 'Inactivo' }}
        </span>
      </template>

      <!-- Acciones -->
      <template #item-actions="{ item }">
        <li>
          <button class="dropdown-item rounded-3 py-2 small" @click="openModal(item)">
            <i class="fa-regular fa-pen-to-square me-2 text-primary"></i>Editar Cliente
          </button>
        </li>
        <li><hr class="dropdown-divider mx-2 opacity-50"></li>
        <li v-if="item.is_active">
          <button class="dropdown-item text-danger rounded-3 py-2 small" @click="deactivateCustomer(item)">
            <i class="fa-solid fa-user-slash me-2"></i>Desactivar
          </button>
        </li>
        <li v-else>
          <button class="dropdown-item text-success rounded-3 py-2 small" @click="restoreCustomer(item)">
            <i class="fa-solid fa-user-check me-2"></i>Activar
          </button>
        </li>
      </template>
    </BaseDataGrid>

    <!-- Modal Crear / Editar -->
    <BaseModal
      v-model="showModal"
      :title="isEditing ? 'Editar Cliente' : 'Nuevo Cliente'"
      size="md"
    >
      <div
        v-if="errorMessage"
        class="d-flex align-items-center gap-3 p-3 mb-4 animate__animated animate__shakeX rounded-3"
        style="background: var(--sol-color-danger-soft); color: var(--sol-color-danger);"
      >
        <i class="fa-solid fa-triangle-exclamation"></i>
        <div class="sol-smaller">{{ errorMessage }}</div>
      </div>

      <form @submit.prevent="saveCustomer" id="customerForm" class="row g-3 p-2">

        <!-- Selector de tipo -->
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">
            Tipo de Cliente
          </label>
          <div class="d-flex gap-2">
            <button
              type="button"
              class="btn flex-fill py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 border transition-all"
              :class="form.customer_type === 'individual'
                ? 'text-white border-primary'
                : 'btn-light border'"
              :style="form.customer_type === 'individual' ? 'background: var(--color-primary);' : ''"
              @click="form.customer_type = 'individual'"
            >
              <i class="fa-solid fa-user fs-6"></i>
              <span class="sol-fw-800 sol-smallest text-uppercase">Individual</span>
            </button>
            <button
              type="button"
              class="btn flex-fill py-2 rounded-3 d-flex align-items-center justify-content-center gap-2 border transition-all"
              :class="form.customer_type === 'business'
                ? 'text-white border-primary'
                : 'btn-light border'"
              :style="form.customer_type === 'business' ? 'background: var(--color-primary);' : ''"
              @click="form.customer_type = 'business'"
            >
              <i class="fa-solid fa-building fs-6"></i>
              <span class="sol-fw-800 sol-smallest text-uppercase">Empresa</span>
            </button>
          </div>
        </div>

        <div class="col-12">
          <BaseInput
            label="Nombre Completo / Contacto"
            v-model="form.name"
            placeholder="Ej: Luis Martínez"
            required
          />
        </div>

        <div class="col-12 col-md-6">
          <BaseInput
            label="Correo Electrónico"
            type="email"
            v-model="form.email"
            placeholder="cliente@empresa.com"
            required
          />
        </div>
        <div class="col-12 col-md-6">
          <BaseInput
            label="Teléfono"
            type="tel"
            v-model="form.phone"
            placeholder="Ej: +502 4587 9685"
          />
        </div>

        <!-- Campos exclusivos para empresa -->
        <template v-if="form.customer_type === 'business'">
          <div class="col-12">
            <BaseInput
              label="Razón Social"
              v-model="form.business_name"
              placeholder="Nombre legal de la empresa"
              required
            />
          </div>
          <div class="col-12 col-md-6">
            <BaseInput
              label="NIT / Tax ID"
              v-model="form.tax_id"
              placeholder="Ej: 1234567-8"
            />
          </div>
        </template>

        <!-- Toggle activo (solo en edición) -->
        <div class="col-12" v-if="isEditing">
          <div class="p-3 bg-light rounded-3 border">
            <div class="form-check form-switch sol-switch d-flex align-items-center justify-content-between px-0">
              <label class="form-check-label ms-0" for="customerActiveSwitch">
                <span class="sol-fw-800">Estado del Cliente</span>
                <div class="sol-smallest text-muted">¿Cliente activo en el sistema?</div>
              </label>
              <input
                class="form-check-input ms-0 mt-0 shadow-none"
                type="checkbox"
                role="switch"
                id="customerActiveSwitch"
                v-model="form.is_active"
              >
            </div>
          </div>
        </div>

      </form>

      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showModal = false">
            Cancelar
          </BaseButton>
          <BaseButton
            type="submit"
            form="customerForm"
            variant="brand"
            class="rounded-pill px-5 sol-shadow-brand"
            :loading="isSaving"
          >
            {{ isEditing ? 'Guardar Cambios' : 'Crear Cliente' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '../plugins/axios';
import { Toast, ConfirmAlert, showBackendError } from '../plugins/swal';

import BaseButton from '../components/base/BaseButton.vue';
import BaseInput from '../components/base/BaseInput.vue';
import BaseModal from '../components/base/BaseModal.vue';
import BaseDataGrid from '../components/base/BaseDataGrid.vue';
import BaseFilterSelect from '../components/base/BaseFilterSelect.vue';

const customersData = ref({ data: [], current_page: 1, last_page: 1, total: 0 });
const isLoadingData = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
const showModal = ref(false);
const errorMessage = ref('');
const searchQuery = ref('');
const gridKey = ref(0);
let debounceTimeout = null;

const filters = reactive({ type: '', active: '' });

const typeOptions = [
  { label: 'Todos los tipos', value: '' },
  { label: 'Individual', value: 'individual' },
  { label: 'Empresa', value: 'business' }
];

const stateOptions = [
  { label: 'Todos los estados', value: '' },
  { label: 'Activos', value: 'true' },
  { label: 'Inactivos', value: 'false' }
];

const gridColumns = [
  { label: 'TIPO',            key: 'customer_type' },
  { label: 'EMPRESA / NIT',   key: 'business_name' },
  { label: 'TELÉFONO',        key: 'phone' },
  { label: 'PEDIDOS',         key: 'orders_count',  align: 'center' },
  { label: 'TOTAL FACTURADO', key: 'total_spent',   align: 'end' },
];

const form = reactive({
  id: null,
  customer_type: 'individual',
  name: '',
  email: '',
  phone: '',
  business_name: '',
  tax_id: '',
  is_active: true,
});

const hasActiveFilters = computed(() => filters.type !== '' || filters.active !== '');

onMounted(() => fetchCustomers());

const handleSearch = (value) => {
  searchQuery.value = value;
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => fetchCustomers(1), 450);
};

const handleRefresh = () => {
  searchQuery.value = '';
  filters.type = '';
  filters.active = '';
  gridKey.value += 1;
  fetchCustomers(1);
};

const resetFilters = () => {
  filters.type = '';
  filters.active = '';
  fetchCustomers(1);
};

const fetchCustomers = async (page = 1) => {
  isLoadingData.value = true;
  try {
    const params = { page };
    if (searchQuery.value)  params.search = searchQuery.value;
    if (filters.type)       params.type   = filters.type;
    if (filters.active !== '') params.active = filters.active;

    const response = await api.get('/customers', { params });
    customersData.value = response.data;
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Error al cargar clientes' });
  } finally {
    isLoadingData.value = false;
  }
};

const openModal = (customer = null) => {
  errorMessage.value = '';
  if (customer?.id) {
    isEditing.value = true;
    Object.assign(form, {
      id:            customer.id,
      customer_type: customer.customer_type || 'individual',
      name:          customer.name,
      email:         customer.email,
      phone:         customer.phone || '',
      business_name: customer.business_name || '',
      tax_id:        customer.tax_id || '',
      is_active:     customer.is_active,
    });
  } else {
    isEditing.value = false;
    Object.assign(form, {
      id: null, customer_type: 'individual',
      name: '', email: '', phone: '',
      business_name: '', tax_id: '', is_active: true,
    });
  }
  showModal.value = true;
};

const saveCustomer = async () => {
  isSaving.value = true;
  errorMessage.value = '';
  try {
    const payload = {
      customer_type: form.customer_type,
      name:          form.name,
      email:         form.email,
      phone:         form.phone  || null,
      business_name: form.customer_type === 'business' ? (form.business_name || null) : null,
      tax_id:        form.customer_type === 'business' ? (form.tax_id || null) : null,
      is_active:     form.is_active,
    };

    if (isEditing.value) {
      await api.put(`/customers/${form.id}`, payload);
    } else {
      await api.post('/customers', payload);
    }

    showModal.value = false;
    fetchCustomers(customersData.value.current_page || 1);
    Toast.fire({ icon: 'success', title: isEditing.value ? 'Cliente actualizado' : 'Cliente creado exitosamente' });
  } catch (error) {
    showBackendError(error, 'Error al guardar cliente');
  } finally {
    isSaving.value = false;
  }
};

const deactivateCustomer = async (customer) => {
  const result = await ConfirmAlert.fire({
    title: '¿Desactivar cliente?',
    text: `"${customer.name}" no podrá realizar pedidos hasta ser reactivado.`,
    confirmButtonText: 'Sí, desactivar',
  });
  if (result.isConfirmed) {
    try {
      await api.delete(`/customers/${customer.id}`);
      fetchCustomers(customersData.value.current_page || 1);
      Toast.fire({ icon: 'success', title: 'Cliente desactivado correctamente' });
    } catch (error) {
      showBackendError(error, 'Error al desactivar cliente');
    }
  }
};

const restoreCustomer = async (customer) => {
  const result = await ConfirmAlert.fire({
    title: '¿Activar cliente?',
    text: `"${customer.name}" podrá volver a realizar pedidos.`,
    confirmButtonText: 'Sí, activar',
  });
  if (result.isConfirmed) {
    try {
      await api.patch(`/customers/${customer.id}/restore`);
      fetchCustomers(customersData.value.current_page || 1);
      Toast.fire({ icon: 'success', title: 'Cliente reactivado correctamente' });
    } catch (error) {
      showBackendError(error, 'Error al activar cliente');
    }
  }
};
</script>
