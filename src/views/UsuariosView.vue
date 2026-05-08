<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Header de la Vista -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
      <div>
        <BaseBadge variant="primary" soft class="mb-2 px-3 py-1 rounded-pill fw-bold">Seguridad y Accesos</BaseBadge>
        <h2 class="fw-800 mb-0 text-body-emphasis lh-1">Gestión de Usuarios</h2>
        <p class="text-body-secondary mt-2 mb-0">Control total sobre perfiles, roles y permisos del ecosistema.</p>
      </div>
      <div class="col-12 col-md-auto ms-auto d-flex align-items-center gap-3">
        <div class="premium-segmented-control shadow-sm p-1 rounded-pill bg-light border">
          <button 
            class="btn btn-icon-sm rounded-circle transition-all" 
            :class="{ 'bg-white shadow-sm text-primary': currentLayout === 'table', 'text-muted': currentLayout !== 'table' }"
            @click="currentLayout = 'table'"
            title="Vista de Tabla"
          >
            <i class="fa-solid fa-list-ul"></i>
          </button>
          <button 
            class="btn btn-icon-sm rounded-circle transition-all" 
            :class="{ 'bg-white shadow-sm text-primary': currentLayout === 'card' }"
            @click="currentLayout = 'card'"
            title="Vista de Cuadrícula"
          >
            <i class="fa-solid fa-table-cells-large"></i>
          </button>
        </div>
        <BaseButton variant="light" class="rounded-circle p-0" style="width: 38px; height: 38px;" @click="fetchUsers">
          <i class="fa-solid fa-rotate"></i>
        </BaseButton>
        <BaseButton variant="brand" class="rounded-pill px-4 py-2 fw-bold shadow-brand-sm" @click="openModal(null)">
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
        <div class="input-group-premium">
          <span class="input-group-text bg-transparent border-end-0"><i class="fa-solid fa-filter small text-primary"></i></span>
          <select class="form-select form-select-sm border-start-0 shadow-none ps-0" style="width: 180px;">
            <option value="">Todos los tipos</option>
            <option value="individual">Individual</option>
            <option value="company">Empresa (B2B)</option>
          </select>
        </div>
      </template>

      <!-- Personalización de columnas específicas -->
      <template #col-customer_type="{ value }">
        <div class="d-flex align-items-center gap-2">
          <i :class="value === 'company' ? 'fa-solid fa-building text-primary' : 'fa-solid fa-user text-muted'" class="smaller"></i>
          <span class="fw-bold smaller text-uppercase tracking-tighter">{{ value === 'company' ? 'Empresa B2B' : 'Individual' }}</span>
        </div>
      </template>

      <!-- Área de Estado -->
      <template #item-status="{ item }">
        <div class="d-flex align-items-center">
          <div :class="['status-indicator', item.is_active ? 'active' : 'inactive']"></div>
          <span class="smaller fw-800 text-uppercase tracking-tighter" :class="item.is_active ? 'text-success' : 'text-danger'">
            {{ item.is_active ? 'Activo' : 'Suspendido' }}
          </span>
        </div>
      </template>

      <!-- Acciones de Footer Rápidas -->
      <template #item-footer-actions="{ item }">
        <div class="d-flex flex-wrap gap-1 justify-content-end">
          <span v-for="role in item.roles" :key="role.id" class="badge rounded-pill bg-primary-soft text-primary px-3 py-1 fw-800 smallest">
            {{ role.name }}
          </span>
        </div>
      </template>
    </BaseDataGrid>

    <!-- Modal Reutilizable -->
    <BaseModal 
      v-model="showModal" 
      :title="isEditing ? 'Sincronizar Perfil Maestro' : 'Generar Nuevo Usuario Maestro'"
      size="md"
    >
      <div v-if="errorMessage" class="alert alert-soft-danger border-0 small d-flex align-items-center gap-3 p-3 mb-4 animate__animated animate__shakeX">
        <i class="fa-solid fa-triangle-exclamation fs-5"></i> <div>{{ errorMessage }}</div>
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
          <BaseInput label="Denominación Social" v-model="form.business_name" placeholder="Ej: CodeSoft Solutions S.A." required class="premium-input" />
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
          <label class="form-label smaller fw-800 text-body-secondary text-uppercase tracking-tighter mb-2">Roles de Operación</label>
          <BaseSelect v-model="form.roles" multiple style="min-height: 120px;" class="premium-select">
            <option v-for="role in rolesList" :key="role.id" :value="role.id">{{ role.name }}</option>
          </BaseSelect>
        </div>

        <div class="col-12" v-if="isEditing">
          <div class="p-3 bg-light rounded-4 border">
            <div class="form-check form-switch premium-switch d-flex align-items-center justify-content-between px-0">
              <label class="form-check-label ms-0" for="activeSwitch">
                <span class="fw-800 text-body-emphasis">Permiso de Operación</span>
                <div class="smallest text-muted">¿Habilitar acceso total al ecosistema?</div>
              </label>
              <input 
                class="form-check-input ms-0 mt-0 shadow-none" 
                type="checkbox" 
                role="switch" 
                id="activeSwitch" 
                v-model="form.is_active"
              >
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="d-flex justify-content-end gap-3 w-100 p-2">
          <BaseButton variant="light" class="rounded-pill px-4" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton variant="brand" class="rounded-pill px-5 shadow-brand-sm" :loading="isSaving" @click="saveUser">
            {{ isEditing ? 'Guardar Cambios' : 'Generar Maestro' }}
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
  roles: [],
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
    usersData.value = response.data.data 
      ? response.data 
      : { data: response.data, current_page: 1, last_page: 1, total: response.data.length }; 
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
    form.roles = userData.roles ? userData.roles.map(r => r.id) : [];
  } else {
    isEditing.value = false;
    form.id = null;
    form.customer_type = 'individual';
    form.name = '';
    form.business_name = '';
    form.email = '';
    form.password = '';
    form.is_active = true;
    form.roles = [];
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
        confirmButtonColor: 'var(--color-primary)' 
      });
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Fallo al procesar suspensión' });
    }
  }
};
</script>

<style scoped>
.fw-800 { font-weight: 800; }
.smaller { font-size: 0.85rem; }
.smallest { font-size: 0.75rem; }
.tracking-tighter { letter-spacing: -0.02em; }
.tracking-wider { letter-spacing: 0.1em; }

.premium-segmented-control {
  display: flex;
  gap: 4px;
}

.btn-icon-sm {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  border: none;
}

.input-group-premium {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 50px;
  padding: 0 10px;
  transition: all 0.3s ease;
}

.input-group-premium:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.input-group-premium .form-select {
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 10px;
}

.status-indicator.active { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
.status-indicator.inactive { background: #ef4444; }

.bg-primary-soft { background: var(--color-primary-soft); }

.alert-soft-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 1rem;
}

.premium-radio-box .btn-outline-light {
  border: 2px solid var(--border-light);
  color: var(--text-muted);
  background: var(--bg-body-tertiary);
}

.premium-radio-box .btn-check:checked + .btn-outline-light {
  border-color: var(--color-primary);
  background: white;
  color: var(--color-primary);
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.premium-switch .form-check-input {
  width: 3rem;
  height: 1.75rem;
  cursor: pointer;
}

.premium-switch .form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.shadow-brand-sm {
  box-shadow: 0 10px 20px var(--color-primary-glass) !important;
}
</style>