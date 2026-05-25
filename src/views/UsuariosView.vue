<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Encabezado -->
    <div class="sol-page-header mb-3">
      <div>
        <h2 class="sol-page-title">Gestión de Usuarios</h2>
        <p class="sol-page-subtitle">Control total sobre perfiles, roles y permisos del personal del sistema.</p>
      </div>
      <div class="d-flex align-items-center gap-3">
        <BaseButton variant="light" class="rounded-circle p-0" style="width: 38px; height: 38px;" @click="handleRefresh">
          <i class="fa-solid fa-rotate"></i>
        </BaseButton>
        <BaseButton variant="brand" class="rounded-pill px-4 py-2 sol-fw-800 sol-shadow-brand" @click="openModal(null)">
          <i class="fa-solid fa-plus me-2"></i> Nuevo Usuario
        </BaseButton>
      </div>
    </div>

    <!-- DataGrid Moderno Único y Consolidado -->
    <BaseDataGrid
      :key="gridKey"
      :items="usersData.data"
      :columns="gridColumns"
      :loading="isLoadingData"
      :pagination="usersData"
      title-key="name"
      subtitle-key="email"
      main-col-label="USUARIO"
      search-placeholder="Buscar por nombre o correo electrónico..."
      footer-actions-label="ROL"
      compact
      empty-title="Bóveda de usuarios vacía"
      empty-icon="fa-solid fa-users-slash"
      @search="handleSearch"
      @edit="openModal"
      @delete="(u) => deleteUser(u.id, u.name)"
      @page-change="fetchUsers"
    >
      <!-- Estado -->
      <template #item-status="{ item }">
        <span
          class="badge rounded-pill px-3 py-1 sol-fw-800 sol-smallest text-uppercase sol-tracking-tight border d-inline-flex align-items-center justify-content-center"
          :class="item.is_active ? 'bg-success-subtle text-success border-success-subtle' : 'bg-danger-subtle text-danger border-danger-subtle'"
          style="width: 115px;"
        >
          <i class="fa-solid me-1" :class="item.is_active ? 'fa-circle-check' : 'fa-circle-xmark'"></i>
          {{ item.is_active ? 'Activo' : 'Inactivo' }}
        </span>
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

      <!-- Menú de Acciones -->
      <template #item-actions="{ item }">
        <li>
          <button class="dropdown-item rounded-3 py-2 small" @click="openModal(item)">
            <i class="fa-regular fa-pen-to-square me-2 text-primary"></i>Editar Usuario
          </button>
        </li>
        <li><hr class="dropdown-divider mx-2 opacity-50"></li>
        <li v-if="item.is_active">
          <button class="dropdown-item text-danger rounded-3 py-2 small" @click="deleteUser(item.id, item.name)">
            <i class="fa-solid fa-user-slash me-2"></i>Desactivar
          </button>
        </li>
        <li v-else>
          <button class="dropdown-item text-success rounded-3 py-2 small" @click="restoreUser(item.id, item.name)">
            <i class="fa-solid fa-user-check me-2"></i>Activar
          </button>
        </li>
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

      <form @submit.prevent="saveUser" id="userForm" class="row g-3 p-2">
        <div class="col-12">
          <BaseInput label="Nombre Completo" v-model="form.name" placeholder="Ej: Ing. Alexander Pierce" required class="premium-input" />
        </div>

        <!-- Email y Teléfono -->
        <div class="col-12 col-md-6">
          <BaseInput label="Correo Electrónico" type="email" v-model="form.email" placeholder="correo@corporativo.com" required class="premium-input" />
        </div>

        <div class="col-12 col-md-6">
          <BaseInput label="Teléfono" type="tel" v-model="form.phone" placeholder="Ej: +502 4587 9685" class="premium-input" />
        </div>

        <div class="col-12">
          <BaseInput 
            label="Contraseña" 
            type="password"
            v-model="form.password" 
            :placeholder="isEditing ? 'Completar únicamente para cambiar...' : '••••••••••••'" 
            :required="!isEditing" 
            class="premium-input" 
          />
        </div>

        <div class="col-12">
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Rol del Usuario</label>
          <BaseSelect v-model="form.role_id" class="premium-select" required>
            <option value="">Selecciona un rol</option>
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
          <BaseButton type="submit" form="userForm" variant="brand" class="rounded-pill px-5 sol-shadow-brand" :loading="isSaving">
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
import { Toast, ConfirmAlert, showBackendError } from '../plugins/swal';

import BaseButton from '../components/base/BaseButton.vue';
import BaseInput from '../components/base/BaseInput.vue';
import BaseSelect from '../components/base/BaseSelect.vue';
import BaseModal from '../components/base/BaseModal.vue';
import BaseDataGrid from '../components/base/BaseDataGrid.vue';

const usersData = ref({ data: [], current_page: 1, last_page: 1, total: 0 });
const rolesList = ref([]);
const isLoadingData = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
const showModal = ref(false);
const errorMessage = ref('');

const searchQuery = ref('');
const gridKey = ref(0);
let debounceTimeout = null;

const gridColumns = [
  { label: 'ROL ASIGNADO', key: 'role_name' },
  { label: 'TELÉFONO', key: 'phone' }
];

const form = reactive({
  id: null,
  name: '',
  phone: '',
  email: '',
  password: '',
  role_id: '',
  is_active: true
});

onMounted(() => {
  fetchUsers();
  fetchRoles();
});

const handleSearch = (value) => {
  searchQuery.value = value;
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchUsers(1);
  }, 450);
};

const handleRefresh = () => {
  searchQuery.value = '';
  gridKey.value += 1;
  fetchUsers(1);
};

const fetchUsers = async (page = 1) => {
  isLoadingData.value = true;
  try {
    const params = { page };
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    
    const response = await api.get('/users', { params });
    const rawData = response.data.data ? response.data.data : response.data;
    
    // Filtramos para mostrar únicamente el Personal Interno (Staff), omitiendo clientes
    const mappedData = rawData
      .filter(u => !u.customer)
      .map(u => ({
        ...u,
        role_name: u.role?.name || 'Sin Rol',
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
    form.name = userData.name;
    form.phone = userData.phone || '';
    form.email = userData.email;
    form.password = '';
    form.is_active = userData.is_active;
    form.role_id = userData.role_id || (userData.role ? userData.role.id : '');
  } else {
    isEditing.value = false;
    form.id = null;
    form.name = '';
    form.phone = '';
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
    const payload = {
      name: form.name,
      email: form.email,
      role_id: form.role_id,
      is_active: form.is_active,
      phone: form.phone || null,
      customer_type: null,
      business_name: null,
      tax_id: null,
    };

    if (form.password) {
      payload.password = form.password;
    }

    if (isEditing.value) {
      await api.put(`/users/${form.id}`, payload);
    } else {
      await api.post('/users', payload);
    }
    showModal.value = false;
    fetchUsers(); 
    Toast.fire({ icon: 'success', title: 'Registro procesado correctamente' });
  } catch (error) {
    showBackendError(error, 'Error al guardar usuario');
  } finally {
    isSaving.value = false;
  }
};

const deleteUser = async (id, userName) => {
  const result = await ConfirmAlert.fire({
    title: '¿Desactivar usuario?',
    text: `"${userName}" perderá acceso al sistema hasta ser reactivado.`,
    confirmButtonText: 'Sí, desactivar',
  });
  if (result.isConfirmed) {
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
      Toast.fire({ icon: 'success', title: 'Usuario desactivado correctamente' });
    } catch (error) {
      showBackendError(error, 'Error al desactivar usuario');
    }
  }
};

const restoreUser = async (id, userName) => {
  const result = await ConfirmAlert.fire({
    title: '¿Activar usuario?',
    text: `"${userName}" recuperará acceso al sistema.`,
    confirmButtonText: 'Sí, activar',
  });
  if (result.isConfirmed) {
    try {
      await api.patch(`/users/${id}/restore`);
      fetchUsers();
      Toast.fire({ icon: 'success', title: 'Usuario reactivado correctamente' });
    } catch (error) {
      showBackendError(error, 'Error al activar usuario');
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