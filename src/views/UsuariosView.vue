<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Encabezado -->
    <div class="sol-page-header mb-5">
      <div>
        <BaseBadge variant="primary" soft class="mb-2 px-3 py-1 rounded-pill sol-fw-800">Seguridad y Accesos</BaseBadge>
        <h2 class="sol-page-title">Gestión de Usuarios</h2>
        <p class="sol-page-subtitle">Control total sobre perfiles, roles y permisos del ecosistema.</p>
      </div>
      <div class="d-flex align-items-center gap-3">
        <!-- Control segmentado -->
        <div class="sol-segmented">
          <button
            class="sol-segmented__btn"
            :class="{ 'sol-segmented__btn--active': currentLayout === 'table' }"
            @click="currentLayout = 'table'"
            title="Vista de Tabla"
          >
            <i class="fa-solid fa-list-ul"></i>
          </button>
          <button
            class="sol-segmented__btn"
            :class="{ 'sol-segmented__btn--active': currentLayout === 'card' }"
            @click="currentLayout = 'card'"
            title="Vista de Cuadrícula"
          >
            <i class="fa-solid fa-table-cells-large"></i>
          </button>
        </div>
        <BaseButton variant="light" class="rounded-circle p-0" style="width: 38px; height: 38px;" @click="fetchUsers">
          <i class="fa-solid fa-rotate"></i>
        </BaseButton>
        <BaseButton variant="brand" class="rounded-pill px-4 py-2 sol-fw-800 sol-shadow-brand" @click="openModal(null)">
          <i class="fa-solid fa-user-plus me-2"></i> Nuevo Usuario
        </BaseButton>
      </div>
    </div>

    <!-- DataGrid Moderno -->
    <BaseDataGrid
      :layout="currentLayout"
      :items="usersData.data"
      :columns="gridColumns"
      :loading="isLoadingData"
      :pagination="usersData"
      title-key="name"
      subtitle-key="email"
      empty-title="Bóveda de usuarios vacía"
      empty-icon="fa-solid fa-users-slash"
      @edit="openModal"
      @delete="(u) => deleteUser(u.id, u.name)"
      @page-change="fetchUsers"
    >
      <!-- Filtros Personalizados -->
      <template #filters>
        <div class="sol-filter-pill">
          <i class="fa-solid fa-filter sol-smallest text-primary me-1"></i>
          <select class="form-select form-select-sm" style="width: 180px;">
            <option value="">Todos los tipos</option>
            <option value="individual">Individual</option>
            <option value="company">Empresa (B2B)</option>
          </select>
        </div>
      </template>

      <!-- Personalización de columnas específicas -->
      <template #col-customer_type="{ value }">
        <div class="d-flex align-items-center gap-2">
          <i :class="value === 'company' ? 'fa-solid fa-building text-primary' : 'fa-solid fa-user text-muted'" class="sol-smaller"></i>
          <span class="sol-fw-800 sol-smaller text-uppercase sol-tracking-tight">{{ value === 'company' ? 'Empresa B2B' : 'Individual' }}</span>
        </div>
      </template>

      <!-- Estado -->
      <template #item-status="{ item }">
        <div class="d-flex align-items-center">
          <div class="sol-status-dot" :class="item.is_active ? 'sol-status-dot--active' : 'sol-status-dot--inactive'"></div>
          <span class="sol-smaller sol-fw-800 text-uppercase sol-tracking-tight" :class="item.is_active ? 'text-success' : 'text-danger'">
            {{ item.is_active ? 'Activo' : 'Suspendido' }}
          </span>
        </div>
      </template>

      <!-- Badge de rol (footer card) -->
      <template #item-footer-actions="{ item }">
        <div class="d-flex flex-wrap gap-1 justify-content-end">
          <span v-if="item.role" class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest"
                style="background: var(--sol-color-primary-soft); color: var(--sol-color-primary);">
            {{ item.role.name }}
          </span>
        </div>
      </template>
    </BaseDataGrid>

    <!-- Modal Reutilizable -->
    <BaseModal
      v-model="showModal"
      :title="isEditing ? 'Editar Usuario' : 'Nuevo Usuario'"
      size="md"
    >
      <div v-if="errorMessage" class="d-flex align-items-center gap-3 p-3 mb-4 animate__animated animate__shakeX rounded-3"
           style="background: var(--sol-color-danger-soft); color: var(--sol-color-danger);">
        <i class="fa-solid fa-triangle-exclamation"></i> <div class="sol-smaller">{{ errorMessage }}</div>
      </div>

      <form class="row g-4 p-2">
        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Clasificación de Cuenta</label>
          <div class="d-flex gap-3">
            <div class="premium-radio-box flex-fill">
              <input type="radio" value="individual" v-model="form.customer_type" id="typeInd" class="btn-check">
              <label class="btn btn-outline-light w-100 py-3 rounded-4 fw-800 smaller" for="typeInd">
                <i class="fa-solid fa-user me-2"></i> INDIVIDUAL
              </label>
            </div>
            <div class="premium-radio-box flex-fill">
              <input type="radio" value="company" v-model="form.customer_type" id="typeComp" class="btn-check">
              <label class="btn btn-outline-light w-100 py-3 rounded-4 fw-800 smaller" for="typeComp">
                <i class="fa-solid fa-building-shield me-2"></i> EMPRESA B2B
              </label>
            </div>
          </div>
        </div>

        <div class="col-12">
          <BaseInput label="Identidad Completa" v-model="form.name" placeholder="Ej: Ing. Alexander Pierce" required class="premium-input" />
        </div>

        <div class="col-12 animate__animated animate__fadeIn" v-if="form.customer_type === 'company'">
          <BaseInput label="Denominación Social" v-model="form.business_name" placeholder="Ej: Soluplast Industrial S.A." required class="premium-input" />
        </div>

        <div class="col-12">
          <BaseInput label="Canal de Enlace (Email)" type="email" v-model="form.email" placeholder="correo@corporativo.com" required class="premium-input" />
        </div>

        <div class="col-12">
          <BaseInput 
            label="Credencial de Acceso (Password)" 
            type="password"
            v-model="form.password" 
            placeholder="••••••••••••"
            :required="!isEditing"
            class="premium-input"
          />
          <div v-if="isEditing" class="smallest text-muted mt-1 italic ps-2">* Dejar vacío para preservar credencial actual</div>
        </div>

        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Rol de Operación</label>
          <BaseSelect v-model="form.role_id" class="premium-select">
            <option value="">Selecciona un rol de operación</option>
            <option v-for="role in rolesList" :key="role.id" :value="role.id">{{ role.name }}</option>
          </BaseSelect>
        </div>

        <div class="col-12" v-if="isEditing">
          <div class="p-3 bg-light rounded-3 border">
            <div class="form-check form-switch sol-switch d-flex align-items-center justify-content-between px-0">
              <label class="form-check-label ms-0" for="activeSwitch">
                <span class="sol-fw-800">Permiso de Operación</span>
                <div class="sol-smallest text-muted">¿Habilitar acceso al sistema?</div>
              </label>
              <input class="form-check-input ms-0 mt-0 shadow-none" type="checkbox" role="switch"
                id="activeSwitch" v-model="form.is_active">
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton variant="brand" class="rounded-pill px-5 sol-shadow-brand" :loading="isSaving" @click="saveUser">
            {{ isEditing ? 'Guardar Cambios' : 'Crear Usuario' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../plugins/axios';
import { Toast, ConfirmAlert } from '../plugins/swal';
import Swal from 'sweetalert2';

import BaseButton from '../components/base/BaseButton.vue';
import BaseInput from '../components/base/BaseInput.vue';
import BaseSelect from '../components/base/BaseSelect.vue';
import BaseModal from '../components/base/BaseModal.vue';
import BaseBadge from '../components/base/BaseBadge.vue';
import BaseDataGrid from '../components/base/BaseDataGrid.vue';

const usersData = ref({ data: [], current_page: 1, last_page: 1, total: 0 });
const rolesList = ref([]);
const isLoadingData = ref(true);
const currentLayout = ref('table');
const isSaving = ref(false);
const isEditing = ref(false);
const showModal = ref(false);
const errorMessage = ref('');

const gridColumns = [
  { label: 'CLASIFICACIÓN', key: 'customer_type' },
  { label: 'IDENTIFICADOR', key: 'id' }
];

const form = reactive({
  id: null,
  customer_type: 'individual',
  name: '',
  business_name: '',
  email: '',
  password: '',
  role_id: '',
  is_active: true
});

onMounted(() => {
  fetchUsers();
  fetchRoles();
});

const fetchUsers = async (page = 1) => {
  isLoadingData.value = true;
  try {
    const response = await api.get('/users', { params: { page } });
    const rawData = response.data.data ? response.data.data : response.data;
    
    // Aplanamos de forma transparente las relaciones de perfil comercial de clientes
    const mappedData = rawData.map(u => ({
      ...u,
      customer_type: u.customer?.customer_type || 'staff',
      business_name: u.customer?.business_name || '',
      tax_id: u.customer?.tax_id || '',
    }));

    if (response.data.data) {
      usersData.value = {
        ...response.data,
        data: mappedData
      };
    } else {
      usersData.value = { data: mappedData, current_page: 1, last_page: 1, total: mappedData.length };
    }
  } catch (error) {
    Toast.fire({ icon: 'error', title: 'Error de sincronización de usuarios' });
  } finally {
    isLoadingData.value = false;
  }
};

const fetchRoles = async () => {
  try {
    const response = await api.get('/roles');
    rolesList.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

const openModal = (userData) => {
  errorMessage.value = '';
  if (userData && userData.id) {
    isEditing.value = true;
    form.id = userData.id;
    form.customer_type = userData.customer_type;
    form.name = userData.name;
    form.business_name = userData.business_name || '';
    form.email = userData.email;
    form.password = '';
    form.is_active = userData.is_active;
    form.role_id = userData.role_id || (userData.role ? userData.role.id : '');
  } else {
    isEditing.value = false;
    form.id = null;
    form.customer_type = 'individual';
    form.name = '';
    form.business_name = '';
    form.email = '';
    form.password = '';
    form.is_active = true;
    form.role_id = '';
  }
  showModal.value = true;
};

const saveUser = async () => {
  isSaving.value = true;
  errorMessage.value = '';
  try {
    if (isEditing.value) {
      await api.put(`/users/${form.id}`, form);
    } else {
      await api.post('/users', form);
    }
    showModal.value = false;
    fetchUsers(); 
    Toast.fire({ icon: 'success', title: 'Registro procesado correctamente' });
  } catch (error) {
    errorMessage.value = error.response?.data?.errors 
      ? Object.values(error.response.data.errors)[0][0] 
      : 'Error en la solicitud técnica.';
  } finally {
    isSaving.value = false;
  }
};

const deleteUser = async (id, userName) => {
  const result = await ConfirmAlert.fire({
    title: '¿Confirmar restricción?',
    text: `El usuario "${userName}" perderá acceso inmediato al ecosistema.`,
    confirmButtonText: 'Sí, suspender acceso',
  });
  if (result.isConfirmed) {
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(); 
      Swal.fire({
        title: 'Acceso Restringido',
        text: 'El usuario ha sido desactivado.',
        icon: 'success',
        confirmButtonColor: 'var(--sol-color-primary)'
      });
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Fallo al procesar suspensión' });
    }
  }
};
</script>

<style scoped>
/* Radio box de tipo de cuenta */
.premium-radio-box .btn-outline-light {
  border: 2px solid var(--sol-neutral-border);
  color: var(--sol-neutral-gray);
  background: #f8fafc;
}
.premium-radio-box .btn-check:checked + .btn-outline-light {
  border-color: var(--sol-color-primary);
  background: #ffffff;
  color: var(--sol-color-primary);
  box-shadow: var(--sol-shadow-md);
}
</style>