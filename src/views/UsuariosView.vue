<template>
  <div class="animate__animated animate__fadeIn">
    <!-- Header de la Vista -->
    <div class="row align-items-center mb-4 g-3">
      <div class="col-12 col-md-auto">
        <h3 class="fw-bold mb-1">Gestión de Usuarios</h3>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-0 small text-muted">
            <li class="breadcrumb-item"><i class="bi bi-shield-check me-1"></i>Seguridad</li>
            <li class="breadcrumb-item active">Usuarios</li>
          </ol>
        </nav>
      </div>
      <div class="col-12 col-md-auto ms-auto d-flex gap-2">
        <div class="btn-group shadow-sm">
          <button 
            class="btn btn-light" 
            :class="{ active: currentLayout === 'table' }"
            @click="currentLayout = 'table'"
            title="Vista de Tabla"
          >
            <i class="bi bi-list-ul"></i>
          </button>
          <button 
            class="btn btn-light" 
            :class="{ active: currentLayout === 'card' }"
            @click="currentLayout = 'card'"
            title="Vista de Cuadrícula"
          >
            <i class="bi bi-grid-3x3-gap"></i>
          </button>
        </div>
        <BaseButton variant="light" icon="bi bi-arrow-clockwise" @click="fetchUsers" />
        <BaseButton variant="brand" icon="bi bi-plus-lg" class="px-4" @click="openModal(null)">
          Nuevo Usuario
        </BaseButton>
      </div>
    </div>

    <!-- DataGrid Moderno (Reemplaza a la tabla tradicional) -->
    <BaseDataGrid
      :layout="currentLayout"
      :items="usersData.data"
      :columns="gridColumns"
      :loading="isLoadingData"
      :pagination="usersData"
      title-key="name"
      subtitle-key="email"
      empty-title="No hay usuarios registrados"
      empty-icon="bi bi-people"
      @edit="openModal"
      @delete="(u) => deleteUser(u.id, u.name)"
      @page-change="fetchUsers"
    >
      <!-- Filtros Personalizados -->
      <template #filters>
        <BaseSelect class="mb-0" style="width: auto;" size="sm">
          <option value="">Todos los tipos</option>
          <option value="individual">Individual</option>
          <option value="company">Empresa</option>
        </BaseSelect>
      </template>

      <!-- Personalización de columnas específicas -->
      <template #col-customer_type="{ value }">
        <span class="text-capitalize">{{ value === 'company' ? 'Empresa (B2B)' : 'Individual' }}</span>
      </template>

      <!-- Área de Estado -->
      <template #item-status="{ item }">
        <BaseBadge :variant="item.is_active ? 'success' : 'danger'">
          <i class="bi bi-circle-fill me-1" style="font-size: 0.4rem;"></i>
          {{ item.is_active ? 'Activo' : 'Suspendido' }}
        </BaseBadge>
      </template>

      <!-- Acciones de Footer Rápidas -->
      <template #item-footer-actions="{ item }">
        <div class="d-flex flex-wrap gap-1 justify-content-end">
          <BaseBadge v-for="role in item.roles" :key="role.id" variant="info" border>
            {{ role.name }}
          </BaseBadge>
        </div>
      </template>
    </BaseDataGrid>

    <!-- Modal Reutilizable -->
    <BaseModal 
      v-model="showModal" 
      :title="isEditing ? 'Editar Perfil de Usuario' : 'Registrar Nuevo Usuario'"
    >
      <template #icon><i class="bi bi-person-circle text-brand"></i></template>

      <div v-if="errorMessage" class="alert bg-soft-danger border-0 small d-flex align-items-center gap-2 mb-4">
        <i class="bi bi-exclamation-octagon-fill"></i> {{ errorMessage }}
      </div>

      <div class="row g-4">
        <div class="col-12">
          <label class="form-label">Tipo de Cuenta</label>
          <div class="d-flex gap-4">
            <div class="form-check custom-radio">
              <input class="form-check-input" type="radio" value="individual" v-model="form.customer_type" id="typeInd">
              <label class="form-check-label small" for="typeInd">Individual</label>
            </div>
            <div class="form-check custom-radio">
              <input class="form-check-input" type="radio" value="company" v-model="form.customer_type" id="typeComp">
              <label class="form-check-label small" for="typeComp">Empresa / B2B</label>
            </div>
          </div>
        </div>

        <div class="col-12">
          <BaseInput label="Nombre Completo" v-model="form.name" icon="bi bi-person" required />
        </div>

        <div class="col-12" v-if="form.customer_type === 'company'">
          <BaseInput label="Razón Social" v-model="form.business_name" icon="bi bi-building" required />
        </div>

        <div class="col-12">
          <BaseInput label="Email Corporativo" type="email" v-model="form.email" icon="bi bi-envelope-at" required />
        </div>

        <div class="col-12">
          <BaseInput 
            label="Seguridad" 
            type="password"
            v-model="form.password" 
            icon="bi bi-key" 
            :required="!isEditing"
            :error="isEditing ? 'Dejar en blanco para no cambiar' : ''"
          />
        </div>

        <div class="col-12">
          <BaseSelect label="Asignar Roles" v-model="form.roles" multiple style="min-height: 100px;">
            <option v-for="role in rolesList" :key="role.id" :value="role.id">{{ role.name }}</option>
          </BaseSelect>
        </div>

        <div class="col-12" v-if="isEditing">
          <div class="form-check form-switch p-3 bg-light rounded-3">
            <input class="form-check-input ms-0 me-3" type="checkbox" role="switch" id="activeSwitch" v-model="form.is_active">
            <label class="form-check-label fw-bold" for="activeSwitch">Acceso al Sistema</label>
          </div>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="light" @click="showModal = false">Cancelar</BaseButton>
        <BaseButton variant="brand" :loading="isSaving" @click="saveUser">
          {{ isEditing ? 'Actualizar Datos' : 'Crear Usuario' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../plugins/axios';
import { Toast, ConfirmAlert } from '../plugins/swal';
import Swal from 'sweetalert2';

// Importación de Componentes Base
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

// Definición de columnas para el DataGrid
const gridColumns = [
  { label: 'Tipo', key: 'customer_type' },
  { label: 'Identificador', key: 'id' },
  { label: 'Empresa', key: 'business_name', hidden: true }
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
    console.error(error);
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
    Toast.fire({ icon: 'success', title: 'Operación completada' });
  } catch (error) {
    errorMessage.value = error.response?.data?.errors 
      ? Object.values(error.response.data.errors)[0][0] 
      : 'Error en la solicitud.';
  } finally {
    isSaving.value = false;
  }
};

const deleteUser = async (id, userName) => {
  const result = await ConfirmAlert.fire({
    title: '¿Confirmar acción?',
    text: `El usuario "${userName}" perderá acceso.`,
    confirmButtonText: 'Sí, suspender',
  });
  if (result.isConfirmed) {
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(); 
      Swal.fire({ icon: 'success', title: 'Usuario Suspendido', confirmButtonColor: '#4f46e5' });
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'Error de red' });
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');
</style>